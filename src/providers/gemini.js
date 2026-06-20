import { BaseProvider } from './baseProvider.js'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export class GeminiProvider extends BaseProvider {
    constructor(config) {
        super();
        this.apiKey = config?.apiKey;
        this.defaultModel = config?.defaultModel || 'gemini-1.5-pro'
    }

    async invoke(messages, model) {
        const client = new ChatGoogleGenerativeAI({
            apiKey: this.apiKey,
            modellName: model || this.defaultModel,
            temperature: 0.1
        })
        const response = await client.invoke(messages);
        return response.content
    }

    async getModels() {
        try {
            const res = await fetch(`https://googleapis.com{this.apiKey}`)
            const data = await res.json()

            return data.models.map(m => m.name.replace('models/', '')).filter(id => id.startsWith('gemini-'))
        }
        catch {
            return ['gemini-3.5-flash', 'gemini-3.1-pro', 'gemini-3.1-flash-lite']
        }
    }
}
