import { describe, it, expect } from 'vitest';
import { BaseProvider } from '../../src/providers/baseProvider.js';

describe('BaseProvider', () => {
    it('throws when invoke() is called directly on the base class', async () => {
        const base = new BaseProvider();
        await expect(base.invoke([], 'model')).rejects.toThrow(
            'Method invoke must be implemented natively.'
        );
    });

    it('throws when getModels() is called directly on the base class', async () => {
        const base = new BaseProvider();
        await expect(base.getModels()).rejects.toThrow(
            'Method getModels must be implemented natively.'
        );
    });

    it('can be subclassed and invoke() overridden', async () => {
        class TestProvider extends BaseProvider {
            async invoke(messages, model) {
                return `echo:${model}`;
            }
            async getModels() {
                return ['model-a'];
            }
        }

        const provider = new TestProvider();
        const result = await provider.invoke([], 'gpt-test');
        expect(result).toBe('echo:gpt-test');
    });

    it('can be subclassed and getModels() overridden', async () => {
        class TestProvider extends BaseProvider {
            async invoke() { return ''; }
            async getModels() { return ['model-x', 'model-y']; }
        }

        const provider = new TestProvider();
        const models = await provider.getModels();
        expect(models).toEqual(['model-x', 'model-y']);
    });
});
