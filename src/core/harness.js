import { graphRegistry } from '../registry/graphRegistry.js';

export class AgentHarness {
    constructor(providerInstance, selectedModel) {
        this.provider = providerInstance;
        this.model = selectedModel;
        this.recursionLimit = 25;
    }

    async run(commandType, filePayload, targetPath, outputDir = 'Review') {
        const workflowCircuit = graphRegistry[commandType];
        if (!workflowCircuit) {
            throw new Error(`Unknown circuit selection matching: ${commandType}`);
        }

        const inputState = { repositoryFiles: filePayload };
        const runtimeConfig = {
            recursionLimit: this.recursionLimit,
            configurable: {
                providerInstance: this.provider,
                model: this.model,
                targetPath: targetPath ?? filePayload?.[0]?.relativePath ?? '.',
                outputDir
            }
        };

        const outputState = await workflowCircuit.invoke(inputState, runtimeConfig);

        if (outputState.finalSummary != null && outputState.finalSummary !== '') {
            return outputState.finalSummary;
        }
        if (outputState.analysisResult != null && outputState.analysisResult !== '') {
            return outputState.analysisResult;
        }

        throw new Error(
            `Graph "${commandType}" completed but produced no output. ` +
            `Neither finalSummary nor analysisResult is present in the output state.`
        );
    }
}
