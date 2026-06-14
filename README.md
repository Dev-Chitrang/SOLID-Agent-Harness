# Project README

# Code Audit CLI
================

A multi-agent code analysis and safety testing platform CLI tool.

## Overview
------------

Code Audit CLI is a command-line interface tool designed to analyze and audit codebases using multiple agents. It provides a comprehensive report on the code's quality, security, and maintainability.

## Features
------------

*   Analyzes codebases using multiple agents:
    *   SOLID Auditor: Reviews code for SOLID design principles.
    *   Bug Hunter: Tests variable boundaries and hunts for logical bugs.
    *   Documenter: Generates systemic infrastructure documentation.
    *   README Writer: Creates a professional GitHub README.md.
*   Supports multiple programming languages: JavaScript, TypeScript, Python, Go, and Java.
*   Integrates with NVIDIA NIM API for AI-powered code analysis.
*   Optional LangSmith API integration for execution metrics tracing.

## Tech Stack
-------------

*   Node.js
*   LangChain
*   LangGraph
*   NVIDIA NIM API
*   LangSmith API (optional)

## Project Structure
-------------------

*   `agents.js`: Defines the agents used for code analysis.
*   `cli.js`: The command-line interface for the tool.
*   `graph.js`: Defines the graph structure for the code analysis pipeline.
*   `harness.js`: The harness framework for executing the code analysis pipeline.
*   `state.js`: Defines the state management for the code analysis pipeline.

## Prerequisites
--------------

*   Node.js (version 14 or higher)
*   NVIDIA NIM API key
*   LangSmith API key (optional)

## Installation
------------

1.  Clone the repository: `git clone https://github.com/your-repo/code-audit-cli.git`
2.  Install dependencies: `npm install`
3.  Configure the tool: `npx cli.js init`

## Usage
-----

1.  Run the tool: `npx cli.js start <project-path>`
2.  Replace `<project-path>` with the path to the codebase you want to analyze.

## Configuration
-------------

*   `apiKey`: NVIDIA NIM API key
*   `modelName`: NVIDIA model name (prefered model is meta/llama-3.1-70b-instruct i.e. a model with strong reasoning and coding capabilities.)
*   `langsmithKey`: LangSmith API key (optional)
*   `maxLoopLimit`: Maximum number of loops for the code analysis pipeline (default: 4)

## Contributing
------------

Contributions are welcome! Please submit a pull request with your changes.
