import { BaseProvider } from './baseProvider.js';
import { ChatAnthropic } from '@langchain/anthropic';

export class AnthropicProvider extends BaseProvider {
    constructor(config) {
        super();
        this.apiKey = config?.apiKey;
        this.defaultModel = config?.defaultModel || 'claude-3-5-sonnet-latest';
    }

    async invoke(messages, model) {
        const client = new ChatAnthropic({
            apiKey: this.apiKey,
            model: model || this.defaultModel,
            temperature: 0.1
        })
        const response = await client.invoke(messages)
        return response.content;
    }

    async getModels() {
        try {
            const res = await fetch('https://anthropic.com', {
                headers: { 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01' }
            })
            const data = await res.json()
            return data.data.map(m => m.id).filter(id => id.startsWith('claude-'))
        }
        catch {
            return ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5']
        }
    }
}
