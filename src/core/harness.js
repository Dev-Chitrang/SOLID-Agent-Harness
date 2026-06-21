import { graphRegistry } from '../registry/graphRegistry.js';

export class AgentHarness {
    constructor(providerInstance, selectedModel) {
        this.provider = providerInstance;
        this.model = selectedModel;
        this.recursionLimit = 4;
    }

    async run(commandType, filePayload, targetPath) {
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
                targetPath: targetPath ?? filePayload?.[0]?.relativePath ?? '.'
            }
        };

        const outputState = await workflowCircuit.invoke(inputState, runtimeConfig);
        return outputState.finalSummary ?? outputState.analysisResult;
    }
}
