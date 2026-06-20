import { describe, it, expect } from 'vitest';
import { ProviderFactory } from '../../src/providers/providerFactory.js';
import { OpenAIProvider } from '../../src/providers/openai.js';
import { AnthropicProvider } from '../../src/providers/anthropic.js';
import { GeminiProvider } from '../../src/providers/gemini.js';
import { NvidiaProvider } from '../../src/providers/nvidia.js';

const mockConfig = { apiKey: 'test-key-123' };

describe('ProviderFactory', () => {
    describe('create()', () => {
        it('returns an OpenAIProvider for "openai"', () => {
            const provider = ProviderFactory.create('openai', mockConfig);
            expect(provider).toBeInstanceOf(OpenAIProvider);
        });

        it('returns an AnthropicProvider for "anthropic"', () => {
            const provider = ProviderFactory.create('anthropic', mockConfig);
            expect(provider).toBeInstanceOf(AnthropicProvider);
        });

        it('returns a GeminiProvider for "gemini"', () => {
            const provider = ProviderFactory.create('gemini', mockConfig);
            expect(provider).toBeInstanceOf(GeminiProvider);
        });

        it('returns an NvidiaProvider for "nvidia"', () => {
            const provider = ProviderFactory.create('nvidia', mockConfig);
            expect(provider).toBeInstanceOf(NvidiaProvider);
        });

        it('is case-insensitive — accepts "OpenAI" and "ANTHROPIC"', () => {
            expect(ProviderFactory.create('OpenAI', mockConfig)).toBeInstanceOf(OpenAIProvider);
            expect(ProviderFactory.create('ANTHROPIC', mockConfig)).toBeInstanceOf(AnthropicProvider);
        });

        it('throws for an unknown provider name', () => {
            expect(() => ProviderFactory.create('unknown', mockConfig)).toThrow(
                'Unsupported engine identifier: unknown'
            );
        });

        it('throws when provider name is null', () => {
            expect(() => ProviderFactory.create(null, mockConfig)).toThrow();
        });

        it('throws when provider name is undefined', () => {
            expect(() => ProviderFactory.create(undefined, mockConfig)).toThrow();
        });
    });

    describe('provider defaults', () => {
        it('OpenAIProvider uses gpt-4o as default model', () => {
            const provider = ProviderFactory.create('openai', { apiKey: 'k' });
            expect(provider.defaultModel).toBe('gpt-4o');
        });

        it('AnthropicProvider uses claude-3-5-sonnet-latest as default model', () => {
            const provider = ProviderFactory.create('anthropic', { apiKey: 'k' });
            expect(provider.defaultModel).toBe('claude-3-5-sonnet-latest');
        });

        it('GeminiProvider uses gemini-1.5-pro as default model', () => {
            const provider = ProviderFactory.create('gemini', { apiKey: 'k' });
            expect(provider.defaultModel).toBe('gemini-1.5-pro');
        });

        it('NvidiaProvider uses meta/llama3-70b-instruct as default model', () => {
            const provider = ProviderFactory.create('nvidia', { apiKey: 'k' });
            expect(provider.defaultModel).toBe('meta/llama3-70b-instruct');
        });

        it('respects a custom defaultModel passed via config', () => {
            const provider = ProviderFactory.create('openai', { apiKey: 'k', defaultModel: 'gpt-4-turbo' });
            expect(provider.defaultModel).toBe('gpt-4-turbo');
        });
    });
});
