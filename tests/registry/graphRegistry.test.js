import { describe, it, expect } from 'vitest';
import { graphRegistry } from '../../src/registry/graphRegistry.js';

// Individual graph pipelines and composite pipelines are compiled LangGraph objects.
// We verify that the registry returns the correct compiled pipeline objects and that
// unknown keys throw — without invoking any LLM calls.

describe('graphRegistry', () => {
    describe('individual graphs', () => {
        it('returns a compiled pipeline for "audit"', () => {
            const pipeline = graphRegistry['audit'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });

        it('returns a compiled pipeline for "bugs"', () => {
            const pipeline = graphRegistry['bugs'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });

        it('returns a compiled pipeline for "docs"', () => {
            const pipeline = graphRegistry['docs'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });

        it('returns a compiled pipeline for "readme"', () => {
            const pipeline = graphRegistry['readme'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });

        it('returns a compiled pipeline for "review"', () => {
            const pipeline = graphRegistry['review'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });

        it('returns a compiled pipeline for "explain"', () => {
            const pipeline = graphRegistry['explain'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });
    });

    describe('composite graphs', () => {
        it('returns a compiled pipeline for "ci-fast"', () => {
            const pipeline = graphRegistry['ci-fast'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });

        it('returns a compiled pipeline for "quality"', () => {
            const pipeline = graphRegistry['quality'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });

        it('returns a compiled pipeline for "docs-suite"', () => {
            const pipeline = graphRegistry['docs-suite'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });

        it('returns a compiled pipeline for "onboard"', () => {
            const pipeline = graphRegistry['onboard'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });

        it('returns a compiled pipeline for "full"', () => {
            const pipeline = graphRegistry['full'];
            expect(pipeline).toBeDefined();
            expect(typeof pipeline.invoke).toBe('function');
        });
    });

    describe('unknown graph keys', () => {
        it('returns undefined for an unknown key (harness is responsible for the error)', () => {
            // The registry itself is a plain object — it returns undefined for unknown keys.
            // The AgentHarness throws when it receives undefined.
            expect(graphRegistry['nonexistent']).toBeUndefined();
        });

        it('returns undefined for an empty string key', () => {
            expect(graphRegistry['']).toBeUndefined();
        });

        it('all registered keys have an invoke function', () => {
            for (const [key, pipeline] of Object.entries(graphRegistry)) {
                expect(typeof pipeline.invoke, `registry key "${key}" must have invoke`).toBe('function');
            }
        });
    });

    describe('registry completeness', () => {
        it('registers exactly 11 graphs (6 individual + 5 composite)', () => {
            expect(Object.keys(graphRegistry)).toHaveLength(11);
        });

        it('registers all expected keys', () => {
            const expectedKeys = [
                'audit', 'bugs', 'docs', 'readme', 'review', 'explain',
                'ci-fast', 'quality', 'docs-suite', 'onboard', 'full'
            ];
            for (const key of expectedKeys) {
                expect(graphRegistry[key], `missing registry key: "${key}"`).toBeDefined();
            }
        });
    });
});
