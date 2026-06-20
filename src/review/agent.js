import { reviewPrompt } from './prompt.js'

export async function reviewAgentNode(state, config) {
    const providerInstance = config.configurable.providerInstance;
    const activeModel = config.configurable.model;

    const payload = JSON.stringify(state.repositoryFiles, null, 2)
    const response = await providerInstance.invoke([
        { role: 'system', content: reviewPrompt },
        { role: 'user', content: `Codebase Payload: \n${payload}` }
    ], activeModel)

    return { analysisResult: response }
}
