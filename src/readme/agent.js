import { readmePrompt, readmeUpdatePrompt } from './prompt.js';

export async function readmeAgentNode(state, config) {
    const providerInstance = config.configurable.providerInstance;
    const activeModel = config.configurable.model;

    const systemPrompt = state.documentMode === 'update' ? readmeUpdatePrompt : readmePrompt;

    const userContent = JSON.stringify({
        repositoryFiles: state.repositoryFiles,
        existingDocument: state.existingDocument ?? null,
        documentMode: state.documentMode ?? 'generate',
        previousCriticFeedback: state.criticFeedback ?? ''
    }, null, 2);

    const response = await providerInstance.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
    ], activeModel);

    return { analysisResult: response };
}
