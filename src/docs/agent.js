import { docsPrompt, docsUpdatePrompt } from './prompt.js';

export async function documentAgentNode(state, config) {
    const providerInstance = config.configurable.providerInstance;
    const activeModel = config.configurable.model;

    const systemPrompt = state.documentMode === 'update' ? docsUpdatePrompt : docsPrompt;

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
