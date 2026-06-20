import { BaseProvider } from './baseProvider.js';
import { ChatOpenAI } from '@langchain/openai';

export class NvidiaProvider extends BaseProvider {
    constructor(config) {
        super();
        this.apiKey = config?.apiKey;
        this.defaultModel = config?.defaultModel || 'meta/llama3-70b-instruct';
    }

    async invoke(messages, model) {
        const client = new ChatOpenAI({
            apiKey: this.apiKey,
            model: model || this.defaultModel,
            temperature: 0.1,
            configuration: { baseURL: 'https://integrate.api.nvidia.com/v1' }
        });
        const response = await client.invoke(messages);
        return response.content;
    }

    async getModels() {
        try {
            const res = await fetch('https://integrate.api.nvidia.com/v1/models', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            const data = await res.json();
            return data.data.map(m => m.id);
        } catch {
            return ['meta/llama3-70b-instruct', 'nvidia/nemotron-4-340b-instruct'];
        }
    }
}
