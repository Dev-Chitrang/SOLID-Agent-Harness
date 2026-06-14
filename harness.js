import { codeAnalyzerGraphApp } from "./graph.js";
import * as path from "path";
import * as fs from "fs";

export class CodeAnalysisHarness {
    constructor(config = {}) {
        this.maxLoopLimit = config.maxLoopLimit || 4; // Cost/Runaway limit constraint
        this.credentials = config.credentials || {};
    }

    async executeHarness(targetPath) {
        const absolutePath = path.resolve(targetPath);

        console.log(`====================================================`);
        console.log(`🚀 HARNESS FRAMEWORK INITIALIZED`);
        console.log(`====================================================`);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`[Validation Error] Requested directory context does not exist: ${absolutePath}`);
        }

        // Dynamic LangSmith injection layer constraint logic
        if (this.credentials.langsmithKey) {
            console.log(`[Harness Memory] LangSmith Key detected. Streaming execution metrics trace pipeline...`);
            process.env.LANGSMITH_TRACING = "true";
            process.env.LANGSMITH_ENDPOINT = "https://api.smith.langchain.com";
            process.env.LANGSMITH_API_KEY = this.credentials.langsmithKey;
            process.env.LANGSMITH_PROJECT = "code-audit-cli-run";
        } else {
            console.log(`[Harness Memory] No LangSmith Key present. Execution trace reporting locally in console.`);
            delete process.env.LANGSMITH_TRACING;
        }

        const startTimer = Date.now();

        try {
            // Execute the architecture graph injecting our credentials payload down context nodes
            await codeAnalyzerGraphApp.invoke(
                { projectPath: absolutePath },
                {
                    recursionLimit: this.maxLoopLimit,
                    configurable: {
                        apiKey: this.credentials.apiKey,
                        modelName: this.credentials.modelName
                    }
                }
            );

            const runTime = ((Date.now() - startTimer) / 1000).toFixed(2);
            console.log(`====================================================`);
            console.log(`✨ AUDIT COMPLETED: Execution took ${runTime}s`);
            console.log(`📄 Results aggregated safely inside: ${path.join(absolutePath, "CODE_ANALYSIS_REPORT.md")}`);
            console.log(`====================================================\n`);

        } catch (error) {
            console.error(`\n====================================================`);
            console.error(`💥 CRITICAL PIPELINE CRASH CAUGHT BY HARNESS LAYER`);
            console.error(`Error Reference: ${error.message}`);
            console.error(`====================================================\n`);
            throw error; // Propagate cleanly up into CLI wrapper handler
        }
    }
}
