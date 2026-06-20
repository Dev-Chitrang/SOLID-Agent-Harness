import { bugPrompt } from './prompt.js'

export async function bugAgentNode(state, config) {
    const providerInstance = config.configurable.providerInstance;
    const activeModel = config.configurable.model;

    const payload = JSON.stringify(state.repositoryFiles, null, 2)
    const response = await providerInstance.invoke([
        { role: 'system', content: bugPrompt },
        { role: 'user', content: `Codebase Payload: \n${payload}` }
    ], activeModel)

    return { analysisResult: response }
}
