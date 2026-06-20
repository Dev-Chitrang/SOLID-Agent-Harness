import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GeminiProvider } from './gemini.js';
import { NvidiaProvider } from './nvidia.js';

export class ProviderFactory {
    static create(providerName, providerConfig) {
        switch (providerName?.toLowerCase()) {
            case 'openai': return new OpenAIProvider(providerConfig);
            case 'anthropic': return new AnthropicProvider(providerConfig);
            case 'gemini': return new GeminiProvider(providerConfig);
            case 'nvidia': return new NvidiaProvider(providerConfig);
            default: throw new Error(`Unsupported engine identifier: ${providerName}`);
        }
    }
}
