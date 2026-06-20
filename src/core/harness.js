import { auditGraphPipeline } from '../audit/graph.js';
import { bugGraphPipeline } from '../bugs/graph.js';
import { docsGraphPipeline } from '../docs/graph.js';
import { readmeGraphPipeline } from '../readme/graph.js';
import { reviewGraphPipeline } from '../review/graph.js';
import { explainGraphPipeline } from '../explain/graph.js';

export class AgentHarness {
    constructor(providerInstance, selectedModel) {
        this.provider = providerInstance;
        this.model = selectedModel;
        this.recursionLimit = 4;
    }

    async run(commandType, filePayload) {
        let workflowCircuit;

        switch (commandType) {
            case 'audit': workflowCircuit = auditGraphPipeline; break;
            case 'bugs': workflowCircuit = bugGraphPipeline; break;
            case 'docs': workflowCircuit = docsGraphPipeline; break;
            case 'readme': workflowCircuit = readmeGraphPipeline; break;
            case 'review': workflowCircuit = reviewGraphPipeline; break;
            case 'explain': workflowCircuit = explainGraphPipeline; break;
            default: throw new Error(`Unknown circuit selection matching: ${commandType}`);
        }

        const inputState = { repositoryFiles: filePayload };
        const runtimeConfig = {
            recursionLimit: this.recursionLimit,
            configurable: {
                providerInstance: this.provider,
                model: this.model
            }
        };

        const outputState = await workflowCircuit.invoke(inputState, runtimeConfig);
        return outputState.analysisResult;
    }
}
