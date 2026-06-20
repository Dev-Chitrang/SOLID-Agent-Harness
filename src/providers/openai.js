import { BaseProvider } from './baseProvider.js';
import { ChatOpenAI } from '@langchain/openai';

export class OpenAIProvider extends BaseProvider {
    constructor(config) {
        super();
        this.apiKey = config?.apiKey;
        this.defaultModel = config?.defaultModel || 'gpt-4o';
    }

    async invoke(messages, model) {
        const client = new ChatOpenAI({
            apiKey: this.apiKey,
            model: model || this.defaultModel,
            temperature: 0.1
        })
        const response = await client.invoke(messages)
        return response.content;
    }

    async getModels() {
        try {
            const res = await fetch('https://openai.com', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            })
            const data = await res.json()
            return data.data.map(m => m.id).filter(id => id.startsWith('gpt-'))
        }
        catch {
            return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
        }
    }
}
