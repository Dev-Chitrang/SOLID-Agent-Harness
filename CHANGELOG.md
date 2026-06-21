# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] — 2026-06-21

### Added

- **Critic loop architecture** — every individual graph (`audit`, `bugs`, `docs`, `readme`, `review`, `explain`) now follows an `Agent → Critic → conditional edge` cycle. The critic evaluates `analysisResult`, returns `{ score, feedback }` as JSON, and routes back to the agent if score < 8 and iteration < 3. `createCriticNode(systemPrompt, scoreKey)` in `src/common/nodes/criticNodeFactory.js` is shared across all six graphs.
- **Document awareness** — `audit`, `bugs`, `docs`, and `readme` graphs prepend a `loadDocument` node that reads `config.configurable.targetPath` and `outputDir` to detect whether a report file already exists. Sets `existingDocument` and `documentMode` (`generate` | `update`) into state before the agent runs.
- **Update prompts** — `audit`, `bugs`, `docs`, and `readme` each define a second system prompt (`updatePrompt`) used in `update` mode. Update prompts instruct the agent to preserve valid content, remove stale sections, and incorporate critic feedback rather than regenerating from scratch.
- **`writeReportFileDiffAware(projectRoot, outputDir, fileName, content)`** — new `fileSystem.js` export. Reads existing file content, skips the write if content is identical (verified by string equality), writes and returns `true` otherwise. Used by the `quality` command.
- **`readReportFile(projectRoot, outputDir, fileName)`** — returns file content or `null` if the file does not exist.
- **`fileExists()` and `readExistingFile()`** — internal helpers used by `documentStateNode`.
- **Shared state hierarchy** (`src/common/state/States.js`) — `BaseState`, `DocumentState` (extends `BaseState`), and `CompositeState` (independent, no `BaseState` inheritance) defined once and spread into each graph's `Annotation.Root`. Eliminates all duplicated state field declarations that existed in V2.
- **`src/common/nodes/documentStateNode.js`** — `createDocumentStateNode(fileName)` factory. Reads `outputDir` from `config.configurable` at runtime, eliminating hardcoded path references.
- **`src/common/nodes/summaryNode.js`** — LLM-based synthesis node shared across all composite graphs. Merges parallel branch outputs into a single executive summary.
- **Composite graph pipelines** — five composite commands (`ci-fast`, `quality`, `docs-suite`, `onboarding`, `full`) implemented as LangGraph `StateGraph` instances with parallel fan-out (`START → N wrapper nodes → summary → END`). Each wrapper node invokes a compiled individual graph pipeline as a subgraph.
- **`src/registry/graphRegistry.js`** — maps command names to compiled LangGraph pipelines. `AgentHarness` performs a registry lookup instead of a switch statement.
- **`src/registry/commandRegistry.js`** — maps command names to handler functions. The TUI derives its command list from `Object.keys(commandRegistry)`.
- **`AgentHarness.run(commandType, filePayload, targetPath, outputDir)`** — `targetPath` and `outputDir` are now explicit parameters, both forwarded into `config.configurable` for use by `documentStateNode` and other nodes. `recursionLimit` raised from 4 to 25.
- **Composite command terminal output** — `ci-fast`, `docs-suite`, `onboarding`, and `full` print `finalSummary` to a `cli-table3` table instead of writing a redundant report file. Underlying graphs manage their own artifacts.
- **`quality` command** — uses `writeReportFileDiffAware` to write `QUALITY_REPORT.md` only when content has changed. Does not write or overwrite `SOLID_AUDIT.md` or `BUG_REPORT.md`.
- **Vitest test coverage expanded** — added tests for `writeReportFileDiffAware` (skip on identical content via `mtime` check, write on change, create on first run), `readReportFile`, `AgentHarness.run()` with `targetPath` and `outputDir` in `configurable`, and `finalSummary` fallback for composite graphs. Total: 64 tests across 5 test files.

### Changed

- **All six `graph.js` files** — replaced inline `Annotation.Root` field definitions with spread from `States.js`. Removed all duplicated state declarations. Each graph's state now only declares its score key on top of the shared base.
- **All six `agent.js` files** — payload now includes `existingDocument`, `documentMode`, and `previousCriticFeedback` for document-aware commands; `previousCriticFeedback` for `review` and `explain`.
- **All command handlers** — `harness.run()` calls updated to pass `filePath` and `outputDir` consistently. `review` and `explain` were previously missing the `filePath` argument.
- **`src/ui/interactive.js`** — replaced hardcoded `COMMANDS` array and `HANDLERS` object with `commandRegistry`. `COMMANDS = Object.keys(commandRegistry)`. Adding a new command populates the TUI automatically.
- **`CompositeState`** — removed `...BaseState` inheritance. `CompositeState` is now a flat, independent state object containing only the fields composite graphs actually use: `repositoryFiles`, the six report fields, and `finalSummary`. `analysisResult`, `criticFeedback`, and `iteration` are no longer present in composite state.
- **`documentStateNode` signature** — `createDocumentStateNode(outputDir, fileName)` changed to `createDocumentStateNode(fileName)`. `outputDir` is now read from `config.configurable.outputDir` at runtime.
- **`package.json` version** — bumped from `2.1.0` to `3.0.0`.

### Fixed

- **`recursionLimit = 4` correctness bug** — individual graphs in `update` mode can execute up to 7 nodes in a single run (`loadDocument → agent → critic → agent → critic → agent → critic`). The previous limit of 4 caused LangGraph to throw a recursion error before the third critic iteration could complete. Raised to 25.
- **`outputDir` hardcoded to `'Review'` in `documentStateNode`** — the node now reads `outputDir` from `config.configurable` at runtime, matching the user's configured output directory rather than always defaulting to `'Review'` regardless of configuration.
- **Missing `filePath` in `review` and `explain` `harness.run()` calls** — both commands now pass `filePath` as `targetPath`, consistent with all other commands.

---

## [2.1.0] — 2025-06-20

### Added

- **Vitest test suite** — unit tests for `ProviderFactory`, `ConfigManager`, `AgentHarness`, `fileSystem`, and `BaseProvider` covering 20+ assertions across all critical paths.
- **GitHub Actions CI pipeline** — `.github/workflows/ci.yml` runs `npm test` on Node 18.x and 20.x for every push and pull request targeting `main` or `v2`.
- **`npm run test:watch`** — Vitest watch mode for local development iteration.
- **`npm run coverage`** — Vitest coverage report via `@vitest/coverage-v8`.
- **Comprehensive README** — project overview, architecture Mermaid diagram, installation, setup, usage examples, provider table, folder structure, contributing guide, known limitations, and roadmap.
- **CHANGELOG** — this file.

### Fixed

- **`fileSystem.js` critical bug** — `for (const item in items)` iterates object keys (indices as strings), causing incorrect path construction on directory traversal. Corrected to `for (const item of items)`.
- **`interactive.js` key handler logic bug** — `key.name === 'left' || 'down'` always evaluated to `true` due to operator precedence. Corrected to `key.name === 'left' || key.name === 'down'` for command and model cycling.
- **`nvidia.js` debug logging** — removed two stray `console.log('DEBUG ...')` lines left in production code.

### Changed

- **`package.json` version** bumped from `2.0.0` to `2.1.0`.
- **`package.json` scripts** — replaced placeholder `echo` test script with `vitest run`. Added `test:watch` and `coverage` scripts.
- **`package.json` devDependencies** — added `vitest@^2.0.0` and `@vitest/coverage-v8@^2.0.0`.

---

## [2.0.0] — Initial V2 Release

### Added

- Multi-provider LLM abstraction (`OpenAI`, `Anthropic`, `Gemini`, `NVIDIA NIM`) via `ProviderFactory` and `BaseProvider`.
- Interactive `blessed` TUI dashboard with live model discovery per provider.
- Six independent LangGraph pipelines: `audit`, `bugs`, `docs`, `readme`, `review`, `explain`.
- `AgentHarness` orchestration layer routing commands to their LangGraph pipeline.
- `ConfigManager` persisting credentials to `~/.code-agent/config.json`.
- `code-audit init` interactive setup with multi-provider checkbox and masked API key input.
- Dynamic model selection — TUI fetches available models from provider API at runtime, falls back to curated static list on failure.
- Per-command handlers accepting `(filePath, providerName, modelName)` with param-first, config-fallback provider/model resolution.
- `ora` spinners and `chalk` coloured output across all command handlers.
- `cli-table3` formatted terminal output for `review` and `explain` commands.
- Report file output to configurable `outputDir` (default: `Review/`) for `audit`, `bugs`, `docs`, and `readme` commands.
- `inquirer` for interactive prompts during `init`.
- `chalk` and `ora` as first-class output dependencies.

### Changed (from V1)

- **Provider** — expanded from NVIDIA NIM only to a four-provider abstraction layer (OpenAI, Anthropic, Gemini, NVIDIA).
- **Architecture** — replaced the single monolithic `agents.js` / `graph.js` / `harness.js` flat structure with a feature-per-folder layout (`src/audit/`, `src/bugs/`, `src/docs/`, `src/readme/`, `src/review/`, `src/explain/`), each containing its own `agent.js`, `command.js`, `graph.js`, and `prompt.js`.
- **Graph topology** — replaced one large fan-out pipeline (supervisor → 4 parallel agents → reportWriter) with six independent single-node pipelines, one per command. Each pipeline executes in isolation and is invoked on demand.
- **CLI** — replaced a two-command CLI (`init`, `start`) with a six-command CLI plus TUI dashboard mode when no subcommand is given.
- **`start` command** — removed in favour of individual targeted commands (`audit`, `bugs`, `docs`, `readme`, `review`, `explain`), allowing users to run only the analysis they need.
- **Configuration storage** — migrated from `conf` package (electron-style per-app store) to a plain JSON file at `~/.code-agent/config.json` managed by `ConfigManager`, making config portable and inspectable.
- **Credentials** — V1 stored a single `apiKey` + `modelName` for NVIDIA only. V2 stores a keyed provider map supporting credentials for multiple providers simultaneously.
- **LangSmith tracing** — removed the optional LangSmith key and auto-injection of `LANGSMITH_*` env vars from `harness.js`. V2 does not include tracing integration.
- **File structure** — moved from flat root-level files (`cli.js`, `agents.js`, `graph.js`, `harness.js`, `state.js`) to a `src/` source tree with `bin/`, `core/`, `providers/`, and `ui/` sub-directories.
- **Bin entrypoint** — `cli.js` at root (V1) moved to `bin/code-agent.js` thin shebang + `src/cli.js` program definition (V2).
- **State management** — V1 `state.js` held both the `AnalyzerState` annotation and the `readProjectFiles` utility. V2 separates these into `src/core/fileSystem.js` (file I/O utilities) with state defined inline per graph.

### Removed

- `supervisorNode` — V1 ran a dedicated supervisor graph node to collect files before dispatching agents. V2 reads files in the command handler before invoking the harness.
- `reportWriterNode` — V1 had a terminal graph node that wrote all four reports after agents converged. V2 writes reports directly in each command handler after the pipeline returns.
- `sleep()` rate-limit guard between per-file Bug Hunter calls — V1 scanned files individually with a 2 s delay between NIM requests. V2 passes the full payload in one prompt.
- `LangSmith` optional integration and all associated `LANGSMITH_*` environment variable injection.
- `readline`-based hidden password prompt — replaced by `inquirer` password field.
- `maxRetries`, `timeout`, `topP`, `maxTokens` hard-coded LLM parameters — V2 uses provider SDK defaults with `temperature: 0.1` only.

---

## [1.0.0] — 2026-06-14

### Added

- Initial release of `code-audit-harness` as a single-provider multi-agent CLI tool.
- **NVIDIA NIM only** — all LLM calls routed through `ChatOpenAI` pointed at `https://integrate.api.nvidia.com/v1` using the OpenAI-compatible NIM endpoint.
- **`code-audit init`** — first-time setup command. Prompts for NVIDIA API key (hidden raw-mode stdin), model name, and optional LangSmith API key. Persists to `conf` store (`code-audit-harness` project namespace).
  - Re-initialization guard: prompts for confirmation before overwriting existing credentials.
- **`code-audit start <path>`** — main analysis command. Accepts `.` or an absolute path. Validates path existence and credential presence before executing.
- **`CodeAnalysisHarness`** (`harness.js`) — orchestration class wrapping the LangGraph pipeline invocation. Accepts `maxLoopLimit` (recursion cap, default 4) and `credentials`. Injects LangSmith env vars dynamically if `langsmithKey` is present.
- **Single LangGraph pipeline** (`graph.js`) — fan-out topology: `__start__` → `supervisor` → `solidAuditor` + `bugHunter` + `documenter` + `readmeWriter` (parallel) → `reportWriter` → `__end__`. All five agents run in a single compiled graph per invocation.
- **`supervisorNode`** — entry node that calls `readProjectFiles` and populates `sourceCodeFiles` state before dispatching downstream agents.
- **`solidAuditorNode`** — project-level SOLID principles audit. Passes full project dump in one prompt.
- **`bugHunterNode`** — per-file bug and edge-case scanner. Iterates each file individually with a 2 s sleep between NIM calls as a rate-limit guard.
- **`documenterNode`** — project-level architecture documentation generator with explicit Mermaid `graph TD` diagram instructions in the system prompt.
- **`readmeWriterNode`** — project-level `README.md` generator covering overview, features, tech stack, structure, prerequisites, installation, usage, configuration, and contributing sections.
- **`reportWriterNode`** — terminal aggregation node. Clears and recreates `Review/` directory, then writes `SOLID_AUDIT.md`, `BUG_REPORT.md`, `ARCHITECTURE.md`, and `README.md`.
- **`AnalyzerState`** (`state.js`) — LangGraph `Annotation.Root` defining six state fields: `projectPath`, `sourceCodeFiles`, `solidAuditReport`, `bugReport`, `architectureDoc`, `readmeDoc`.
- **`readProjectFiles()`** (`state.js`) — recursive directory walker with `.gitignore` support via the `ignore` package. Filters to `.js`, `.ts`, `.py`, `.go`, `.java` extensions.
- **Flat file structure** — all source files at project root: `cli.js`, `agents.js`, `graph.js`, `harness.js`, `state.js`.
- **LangSmith optional tracing** — if `langsmithKey` is configured, harness auto-injects `LANGSMITH_TRACING`, `LANGSMITH_ENDPOINT`, `LANGSMITH_API_KEY`, and `LANGSMITH_PROJECT` env vars before graph invocation.
- **MIT License** added.
- Initial `README.md` with project overview, installation, and usage instructions.
