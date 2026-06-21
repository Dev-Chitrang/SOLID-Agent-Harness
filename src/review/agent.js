import { reviewPrompt } from './prompt.js';

export async function reviewAgentNode(state, config) {
    const providerInstance = config.configurable.providerInstance;
    const activeModel = config.configurable.model;

    const userContent = JSON.stringify({
        repositoryFiles: state.repositoryFiles,
        previousCriticFeedback: state.criticFeedback ?? ''
    }, null, 2);

    const response = await providerInstance.invoke([
        { role: 'system', content: reviewPrompt },
        { role: 'user', content: userContent }
    ], activeModel);

    return { analysisResult: response };
}
