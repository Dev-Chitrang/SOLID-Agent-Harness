import { describe, it, expect, vi } from 'vitest';
import { AgentHarness } from '../../src/core/harness.js';

// Mock all six graph pipeline modules so tests never execute real LLM calls
vi.mock('../../src/audit/graph.js', () => ({
    auditGraphPipeline: { invoke: vi.fn().mockResolvedValue({ analysisResult: 'audit result' }) }
}));
vi.mock('../../src/bugs/graph.js', () => ({
    bugGraphPipeline: { invoke: vi.fn().mockResolvedValue({ analysisResult: 'bugs result' }) }
}));
vi.mock('../../src/docs/graph.js', () => ({
    docsGraphPipeline: { invoke: vi.fn().mockResolvedValue({ analysisResult: 'docs result' }) }
}));
vi.mock('../../src/readme/graph.js', () => ({
    readmeGraphPipeline: { invoke: vi.fn().mockResolvedValue({ analysisResult: 'readme result' }) }
}));
vi.mock('../../src/review/graph.js', () => ({
    reviewGraphPipeline: { invoke: vi.fn().mockResolvedValue({ analysisResult: 'review result' }) }
}));
vi.mock('../../src/explain/graph.js', () => ({
    explainGraphPipeline: { invoke: vi.fn().mockResolvedValue({ analysisResult: 'explain result' }) }
}));
vi.mock('../../src/composite/ci-fast/graph.js', () => ({
    ciFastGraphPipeline: { invoke: vi.fn().mockResolvedValue({ finalSummary: 'ci-fast result' }) }
}));
vi.mock('../../src/composite/quality/graph.js', () => ({
    qualityGraphPipeline: { invoke: vi.fn().mockResolvedValue({ finalSummary: 'quality result' }) }
}));
vi.mock('../../src/composite/docs-suite/graph.js', () => ({
    docsSuiteGraphPipeline: { invoke: vi.fn().mockResolvedValue({ finalSummary: 'docs-suite result' }) }
}));
vi.mock('../../src/composite/onboarding/graph.js', () => ({
    onboardGraphPipeline: { invoke: vi.fn().mockResolvedValue({ finalSummary: 'onboard result' }) }
}));
vi.mock('../../src/composite/full/graph.js', () => ({
    fullGraphPipeline: { invoke: vi.fn().mockResolvedValue({ finalSummary: 'full result' }) }
}));

const mockProvider = { invoke: vi.fn() };
const mockFiles = [{ relativePath: 'index.js', content: 'const x = 1;' }];

describe('AgentHarness', () => {
    describe('constructor', () => {
        it('stores provider and model on the instance', () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            expect(harness.provider).toBe(mockProvider);
            expect(harness.model).toBe('gpt-4o');
        });

        it('sets recursionLimit to 25', () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            expect(harness.recursionLimit).toBe(25);
        });
    });

    describe('run() — graph selection', () => {
        it('routes "audit" to the audit graph and returns its result', async () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            const result = await harness.run('audit', mockFiles, '/project');
            expect(result).toBe('audit result');
        });

        it('routes "bugs" to the bug graph and returns its result', async () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            const result = await harness.run('bugs', mockFiles, '/project');
            expect(result).toBe('bugs result');
        });

        it('routes "docs" to the docs graph and returns its result', async () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            const result = await harness.run('docs', mockFiles, '/project');
            expect(result).toBe('docs result');
        });

        it('routes "readme" to the readme graph and returns its result', async () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            const result = await harness.run('readme', mockFiles, '/project');
            expect(result).toBe('readme result');
        });

        it('routes "review" to the review graph and returns its result', async () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            const result = await harness.run('review', mockFiles, '/project');
            expect(result).toBe('review result');
        });

        it('routes "explain" to the explain graph and returns its result', async () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            const result = await harness.run('explain', mockFiles, '/project');
            expect(result).toBe('explain result');
        });

        it('throws for an unknown command type', async () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            await expect(harness.run('unknown', mockFiles)).rejects.toThrow(
                'Unknown circuit selection matching: unknown'
            );
        });
    });

    describe('run() — runtime config passed to graph', () => {
        it('passes providerInstance and model in configurable context', async () => {
            const { auditGraphPipeline } = await import('../../src/audit/graph.js');
            const harness = new AgentHarness(mockProvider, 'claude-3-opus');
            await harness.run('audit', mockFiles, '/project');

            const callArgs = auditGraphPipeline.invoke.mock.calls.at(-1);
            expect(callArgs[1].configurable.providerInstance).toBe(mockProvider);
            expect(callArgs[1].configurable.model).toBe('claude-3-opus');
        });

        it('passes targetPath in configurable context', async () => {
            const { auditGraphPipeline } = await import('../../src/audit/graph.js');
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            await harness.run('audit', mockFiles, '/my/project');

            const callArgs = auditGraphPipeline.invoke.mock.calls.at(-1);
            expect(callArgs[1].configurable.targetPath).toBe('/my/project');
        });

        it('passes repositoryFiles as inputState', async () => {
            const { auditGraphPipeline } = await import('../../src/audit/graph.js');
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            await harness.run('audit', mockFiles, '/project');

            const callArgs = auditGraphPipeline.invoke.mock.calls.at(-1);
            expect(callArgs[0].repositoryFiles).toBe(mockFiles);
        });

        it('sets recursionLimit in runtime config', async () => {
            const { auditGraphPipeline } = await import('../../src/audit/graph.js');
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            await harness.run('audit', mockFiles, '/project');

            const callArgs = auditGraphPipeline.invoke.mock.calls.at(-1);
            expect(callArgs[1].recursionLimit).toBe(25);
        });

        it('passes outputDir in configurable context', async () => {
            const { auditGraphPipeline } = await import('../../src/audit/graph.js');
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            await harness.run('audit', mockFiles, '/project', 'Output');

            const callArgs = auditGraphPipeline.invoke.mock.calls.at(-1);
            expect(callArgs[1].configurable.outputDir).toBe('Output');
        });

        it('defaults outputDir to "Review" when not provided', async () => {
            const { auditGraphPipeline } = await import('../../src/audit/graph.js');
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            await harness.run('audit', mockFiles, '/project');

            const callArgs = auditGraphPipeline.invoke.mock.calls.at(-1);
            expect(callArgs[1].configurable.outputDir).toBe('Review');
        });

        it('returns finalSummary when present (composite graphs)', async () => {
            const harness = new AgentHarness(mockProvider, 'gpt-4o');
            const result = await harness.run('ci-fast', mockFiles, '/project');
            expect(result).toBe('ci-fast result');
        });
    });
});
