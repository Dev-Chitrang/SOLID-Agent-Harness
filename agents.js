import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { readProjectFiles } from "./state.js";
import * as fs from "fs";
import * as path from "path";

// ─── Client Factory ───────────────────────────────────────────────────────────

// Use OpenAI as Wrapper and underneath use the NVIDIA NIM API and it's base URL.

function getClientInstance(harnessConfig) {
    if (!harnessConfig.apiKey) {
        throw new Error(
            "[Model Authorization Fault] NVIDIA API Key missing. Please execute 'code-audit init' first."
        );
    }
    return new ChatOpenAI({
        openAIApiKey: harnessConfig.apiKey,
        modelName: harnessConfig.modelName,
        temperature: 0.2,
        topP: 0.7,
        maxTokens: 1024,
        maxRetries: 1,
        timeout: 300000,
        configuration: {
            baseURL: "https://integrate.api.nvidia.com/v1",
            apiKey: harnessConfig.apiKey,
        },
    });
}

// ─── Shared Invoke Helper ─────────────────────────────────────────────────────

async function invokeModel(model, systemPrompt, userContent) {
    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userContent),
    ]);
    const content = typeof response.content === "string"
        ? response.content
        : response.content?.[0]?.text
        ?? "No response";
    return content;
}

// ─── Sleep Helper ─────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Build Project Dump ───────────────────────────────────────────────────────

function buildProjectDump(files) {
    return files
        .map(f => `### ${f.relativePath}\n\`\`\`\n${f.content}\n\`\`\``)
        .join("\n\n");
}

// ─── Ensure Review Folder ─────────────────────────────────────────────────────

function ensureReviewFolder(projectPath) {
    const reviewDir = path.join(projectPath, "Review");
    if (fs.existsSync(reviewDir)) {
        fs.readdirSync(reviewDir).forEach(file => {
            fs.unlinkSync(path.join(reviewDir, file));
        });
        console.log("   ...[Supervisor] Existing Review/ folder cleared.");
    } else {
        fs.mkdirSync(reviewDir, { recursive: true });
        console.log("   ...[Supervisor] Review/ folder created.");
    }
    return reviewDir;
}

// ─── Supervisor ───────────────────────────────────────────────────────────────

export async function supervisorNode(state) {
    console.log("...[Supervisor Agent] Compiling file tree paths...");
    const files = readProjectFiles(state.projectPath);
    return { sourceCodeFiles: files };
}

// ─── SOLID Auditor — PROJECT LEVEL ────────────────────────────────────────────

export async function solidAuditorNode(state, config) {
    console.log("...[SOLID Agent] Reviewing patterns & drafting changes...");
    if (!state.sourceCodeFiles.length) return { solidAuditReport: "No files found to review." };

    const model = getClientInstance(config.configurable);
    const systemPrompt =
        "You are a Senior Software Architect writing a formal SOLID audit for a code review board." +
        "For EACH principle (S/O/L/I/D), you MUST:" +
        "- State whether the codebase PASSES or FAILS that principle" +
        "- Quote the SPECIFIC function/class/file that violates it" +
        "- Explain WHY it violates it with technical reasoning" +
        "For PASS verdicts you MUST also cite specific code that proves compliance." +
        "A PASS with no evidence is not acceptable." +
        "- Provide a CONCRETE refactored code example showing the fix" +
        "Do NOT give generic definitions. Every finding must reference actual code from the provided files." +
        "For LSP and OCP specifically: these require runtime behavior analysis." +
        "Only mark PASS if the codebase contains explicit inheritance, interface implementation," +
        "or plugin patterns. If none exist, mark the verdict as 'NOT APPLICABLE with explanation'."

    const projectDump = buildProjectDump(state.sourceCodeFiles);
    console.log(`   ...[SOLID Agent] Auditing full project (${state.sourceCodeFiles.length} files)...`);

    try {
        const content = await invokeModel(
            model,
            systemPrompt,
            `Project Codebase:\n\n${projectDump}`
        );
        return { solidAuditReport: content };
    } catch (err) {
        const msg = err?.message ?? String(err) ?? "Unknown error";
        console.error(`   [SOLID Agent] Failed: ${msg}`);
        return { solidAuditReport: `Audit failed: ${msg}` };
    }
}

// ─── Bug Hunter — PER FILE ────────────────────────────────────────────────────

export async function bugHunterNode(state, config) {
    console.log("...[Bug Hunter Agent] Testing variable boundaries & hunting flaws...");
    if (!state.sourceCodeFiles.length) return { bugReport: "No files found to review." };

    const model = getClientInstance(config.configurable);
    const systemPrompt =
        "You are a Senior QA Engineer doing a formal security and logic audit." +
        "IGNORE generic examples. ONLY report bugs that actually exist in the provided code." +
        "For each bug found, provide:" +
        "- File name and approximate line number" +
        "- The exact problematic code snippet" +
        "- Why it is a bug (null deref, missing validation, race condition, etc.)" +
        "- A concrete fix with corrected code" +
        "If no bugs exist in a file, say :- No issues found — do NOT invent examples."

    const results = [];
    for (const file of state.sourceCodeFiles) {
        console.log(`   ...[Bug Hunter Agent] Scanning: ${file.relativePath}`);
        try {
            const content = await invokeModel(
                model,
                systemPrompt,
                `File: ${file.relativePath}\n\n${file.content}`
            );
            results.push(`### ${file.relativePath}\n${content}`);
        } catch (err) {
            const msg = err?.message ?? String(err) ?? "Unknown error";
            console.error(`   [Bug Hunter Agent] Failed on ${file.relativePath}: ${msg}`);
            results.push(`### ${file.relativePath}\nScan failed: ${msg}`);
        }
        // Rate-limit guard — 2s gap between NIM calls
        await sleep(2000);
    }

    return { bugReport: results.join("\n\n") };
}

// ─── Documenter — PROJECT LEVEL ───────────────────────────────────────────────

export async function documenterNode(state, config) {
    console.log("...[Documenter Agent] Designing systemic infrastructure docs...");
    if (!state.sourceCodeFiles.length) return { architectureDoc: "No files found to review." };

    const model = getClientInstance(config.configurable);
    const systemPrompt =
        "You are a Technical Writer and Systems Architect. Produce a single comprehensive project-level " +
        "architecture document covering: system overview, module responsibilities, data flow between modules, " +
        "external dependencies, entry points, and how all components interact as a whole. " +
        "Do NOT document files in isolation — describe the system as one unified architecture.\n\n" +
        "For the architecture diagram, use this EXACT Mermaid syntax format:\n" +
        "```mermaid\n" +
        "graph TD\n" +
        "    A[Node] -->|label| B[Node]\n" +
        "    subgraph GroupName [Display Name]\n" +
        "        B --> C[Node]\n" +
        "    end\n" +
        "```\n" +
        "Rules: graph TD only. Nodes use [Label] for services, ([Label]) for users/clients, [(Label)] for databases. " +
        "Use subgraph to group related components. Arrow syntax is -->|label| with NO closing >. " +
        "Do NOT use ASCII art or any other diagram format.";

    const projectDump = buildProjectDump(state.sourceCodeFiles);
    console.log(`   ...[Documenter Agent] Documenting full project (${state.sourceCodeFiles.length} files)...`);

    try {
        const content = await invokeModel(
            model,
            systemPrompt,
            `Project Codebase:\n\n${projectDump}`
        );
        return { architectureDoc: content };
    } catch (err) {
        const msg = err?.message ?? String(err) ?? "Unknown error";
        console.error(`   [Documenter Agent] Failed: ${msg}`);
        return { architectureDoc: `Documentation failed: ${msg}` };
    }
}

// ─── README Writer — PROJECT LEVEL ────────────────────────────────────────────

export async function readmeWriterNode(state, config) {
    console.log("...[README Agent] Generating GitHub README.md...");
    if (!state.sourceCodeFiles.length) return { readmeDoc: "No files found to review." };

    const model = getClientInstance(config.configurable);
    const systemPrompt =
        "You are a Senior Developer writing a professional GitHub README.md. " +
        "Analyze the provided codebase and produce a complete, industry-standard README with these sections:\n" +
        "# Project Title & one-line description\n" +
        "## Overview — what the project does and why\n" +
        "## Features — bullet list of key capabilities\n" +
        "## Tech Stack — languages, frameworks, libraries used\n" +
        "## Project Structure — file tree with one-line description per file\n" +
        "## Prerequisites — what must be installed\n" +
        "## Installation — step-by-step setup commands\n" +
        "## Usage — how to run it with real example commands\n" +
        "## Configuration — all env vars / config options explained\n" +
        "## Contributing — how to contribute\n" +
        "Use proper markdown formatting. Be specific to the actual codebase — no generic placeholders.";

    const projectDump = buildProjectDump(state.sourceCodeFiles);
    console.log(`   ...[README Agent] Analysing project (${state.sourceCodeFiles.length} files)...`);

    try {
        const content = await invokeModel(
            model,
            systemPrompt,
            `Project Codebase:\n\n${projectDump}`
        );
        return { readmeDoc: content };
    } catch (err) {
        const msg = err?.message ?? String(err) ?? "Unknown error";
        console.error(`   [README Agent] Failed: ${msg}`);
        return { readmeDoc: `README generation failed: ${msg}` };
    }
}

// ─── Report Writer ────────────────────────────────────────────────────────────

export async function reportWriterNode(state) {
    console.log("[Supervisor Agent] Assembling consolidated report file markdown bundle...");
    try {
        const reviewDir = ensureReviewFolder(state.projectPath);

        // 1. SOLID Audit Report
        fs.writeFileSync(
            path.join(reviewDir, "SOLID_AUDIT.md"),
            `# SOLID Design Patterns Audit\n\n${state.solidAuditReport}\n`,
            "utf8"
        );

        // 2. Bug Report
        fs.writeFileSync(
            path.join(reviewDir, "BUG_REPORT.md"),
            `# Logical Bugs & Parameter Edge-Cases\n\n${state.bugReport}\n`,
            "utf8"
        );

        // 3. Architecture Doc
        fs.writeFileSync(
            path.join(reviewDir, "ARCHITECTURE.md"),
            `# System Architecture & Technical Docs\n\n${state.architectureDoc}\n`,
            "utf8"
        );

        // 4. README
        fs.writeFileSync(
            path.join(state.projectPath, "README.md"),
            `# Project README\n\n${state.readmeDoc}\n`,
            "utf8"
        );

        console.log(`Reports saved to: ${reviewDir}`);
        console.log("├── SOLID_AUDIT.md");
        console.log("├── BUG_REPORT.md");
        console.log("└── ARCHITECTURE.md");
        console.log(`README.md saved to: ${state.projectPath}`);
    } catch (error) {
        throw new Error(
            `[FileSystem Output Write Blocked] Could not generate output report files: ${error?.message ?? error}`
        );
    }
    return {};
}
