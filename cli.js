#!/usr/bin/env node

import { Command } from "commander";
import Conf from "conf";
import * as path from "path";
import * as fs from "fs";
import readline from "readline";
import { CodeAnalysisHarness } from "./harness.js";

const program = new Command();
const configStore = new Conf({ projectName: "code-audit-harness" });

// Standard visible user prompt helper
const promptUser = (query) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans.trim()); }));
};

// Linux/Mac-Style completely hidden password entry input helper
const promptUserHidden = (query) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        process.stdout.write(query);

        let value = "";
        process.stdin.setRawMode(true);
        process.stdin.resume();

        const onData = (char) => {
            char = char.toString();

            // Stop and finalize inputs on Enter
            if (char === "\n" || char === "\r" || char === "\u0004") {
                process.stdin.setRawMode(false);
                process.stdin.removeListener('data', onData);
                process.stdout.write("\n");
                rl.close();
                resolve(value.trim());
            } else if (char === "\u0003") { // Safely handle termination via Ctrl+C
                process.stdin.setRawMode(false);
                process.exit(1);
            } else if (char === "\u0008" || char === "\x7f") { // Handle backspace
                if (value.length > 0) {
                    value = value.slice(0, -1);
                }
            } else {
                // Intercept keys cleanly without displaying them
                value += char;
            }
        };

        process.stdin.on('data', onData);
    });
};

program
    .name("code-audit")
    .description("Enterprise multi-agent code analysis & safety testing platform CLI tool.")
    .version("1.0.0");

program
    .command("init")
    .description("Configure initialization workspace properties globally.")
    .action(async () => {
        // 1. Guardrail Check: Check if credentials already exist inside the store
        const existingApiKey = configStore.get("apiKey");
        if (existingApiKey) {
            const confirmation = await promptUser("Configuration already exists. Do you want to re-initialize? It will override the previous data/configurations? (y/n): ");
            const normalizedAnswer = confirmation.toLowerCase();

            if (normalizedAnswer !== "y" && normalizedAnswer !== "yes") {
                console.log("\nInitialization skipped. Run 'code-audit start <path>' to audit a codebase.");
                process.exit(0);
            }
            console.log("\nOverriding previous configuration...\n");
        } else {
            console.log("Initializing Global Agent Credentials Store Configuration...\n");
        }

        // 2. Collection Stage (Only runs if new user or confirmation was accepted)
        const apiKey = await promptUserHidden("Enter NVIDIA API Key (compulsory): ");
        if (!apiKey) {
            console.error("Error: API key cannot be left empty.");
            process.exit(1);
        }

        let modelName = await promptUser("Enter NVIDIA Model Name (Compulsory): ");
        if (!modelName) {
            console.error("Error: Model name cannot be left empty.");
            process.exit(1);
        }

        const langsmithKey = await promptUserHidden("Enter LangSmith API Key (Optional): ");

        configStore.set("apiKey", apiKey);
        configStore.set("modelName", modelName);
        if (langsmithKey) {
            configStore.set("langsmithKey", langsmithKey);
        } else {
            configStore.delete("langsmithKey");
        }

        console.log("\Configuration persisted securely! You can now run 'code-audit start <path>'.");
    });

program
    .command("start")
    .description("Launch parallel agent auditing routines across your workspace targets.")
    .argument("<projectPath>", "Path targeting context folder (Use '.' or a valid absolute path)")
    .action(async (projectPath) => {
        const isCurrentDirectory = projectPath === ".";
        const isAbsolutePath = path.isAbsolute(projectPath);

        if (!isCurrentDirectory && !isAbsolutePath) {
            console.error("\nCritical Validation Error: Invalid path format parameter supplied.");
            console.error("Path parameter must be exactly '.' for your current working directory or a complete absolute path.\n");
            process.exit(1);
        }

        const apiKey = configStore.get("apiKey");
        if (!apiKey) {
            console.error("\Access Denied: Global runtime credentials have not been configured yet.");
            console.error("Please execute 'code-audit init' first to authenticate your system endpoints.\n");
            process.exit(1);
        }

        const targetDirectory = isCurrentDirectory ? process.cwd() : projectPath;

        if (!fs.existsSync(targetDirectory)) {
            console.error(`\Input Path Error: Target folder structure does not exist at location: ${targetDirectory}\n`);
            process.exit(1);
        }

        try {
            const credentials = {
                apiKey,
                modelName: configStore.get("modelName"),
                langsmithKey: configStore.get("langsmithKey")
            };

            const runnerHarness = new CodeAnalysisHarness({
                maxLoopLimit: 4,
                credentials
            });

            await runnerHarness.executeHarness(targetDirectory);
        } catch (err) {
            console.error(`\Command Execution Terminated: ${err.message}\n`);
            process.exit(1);
        }
    });

program.parse(process.argv);
