import { describe, it, expect } from 'vitest';
import { commandRegistry } from '../../src/registry/commandRegistry.js';

// The commandRegistry maps command names to their handler functions.
// We verify shape, completeness, and that unknown keys are absent —
// without executing any handler (which would require a real provider).

describe('commandRegistry', () => {
    describe('individual command handlers', () => {
        it('registers a handler for "audit"', () => {
            expect(typeof commandRegistry['audit']).toBe('function');
        });

        it('registers a handler for "bugs"', () => {
            expect(typeof commandRegistry['bugs']).toBe('function');
        });

        it('registers a handler for "docs"', () => {
            expect(typeof commandRegistry['docs']).toBe('function');
        });

        it('registers a handler for "readme"', () => {
            expect(typeof commandRegistry['readme']).toBe('function');
        });

        it('registers a handler for "review"', () => {
            expect(typeof commandRegistry['review']).toBe('function');
        });

        it('registers a handler for "explain"', () => {
            expect(typeof commandRegistry['explain']).toBe('function');
        });
    });

    describe('composite command handlers', () => {
        it('registers a handler for "ci-fast"', () => {
            expect(typeof commandRegistry['ci-fast']).toBe('function');
        });

        it('registers a handler for "quality"', () => {
            expect(typeof commandRegistry['quality']).toBe('function');
        });

        it('registers a handler for "docs-suite"', () => {
            expect(typeof commandRegistry['docs-suite']).toBe('function');
        });

        it('registers a handler for "onboard"', () => {
            expect(typeof commandRegistry['onboard']).toBe('function');
        });

        it('registers a handler for "full"', () => {
            expect(typeof commandRegistry['full']).toBe('function');
        });
    });

    describe('unknown command keys', () => {
        it('returns undefined for an unknown command name', () => {
            expect(commandRegistry['nonexistent']).toBeUndefined();
        });

        it('returns undefined for an empty string key', () => {
            expect(commandRegistry['']).toBeUndefined();
        });
    });

    describe('registry completeness', () => {
        it('registers exactly 11 commands (6 individual + 5 composite)', () => {
            expect(Object.keys(commandRegistry)).toHaveLength(11);
        });

        it('all registered values are functions', () => {
            for (const [key, handler] of Object.entries(commandRegistry)) {
                expect(typeof handler, `handler for "${key}" must be a function`).toBe('function');
            }
        });

        it('registers all expected command keys', () => {
            const expectedKeys = [
                'audit', 'bugs', 'docs', 'readme', 'review', 'explain',
                'ci-fast', 'quality', 'docs-suite', 'onboard', 'full'
            ];
            for (const key of expectedKeys) {
                expect(commandRegistry[key], `missing command: "${key}"`).toBeDefined();
            }
        });
    });
});
