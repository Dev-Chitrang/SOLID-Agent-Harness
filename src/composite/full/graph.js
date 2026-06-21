import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { CompositeState } from '../../common/state/States.js';
import { auditGraphPipeline } from '../../audit/graph.js';
import { bugGraphPipeline } from '../../bugs/graph.js';
import { docsGraphPipeline } from '../../docs/graph.js';
import { readmeGraphPipeline } from '../../readme/graph.js';
import { reviewGraphPipeline } from '../../review/graph.js';
import { explainGraphPipeline } from '../../explain/graph.js';
import { summaryNode } from '../../common/nodes/summaryNode.js';

async function auditWrapperNode(state, config) {
    console.log('[full] auditGraph start');
    try {
        const result = await auditGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[full] auditGraph end');
        return { auditReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[full] auditGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function bugWrapperNode(state, config) {
    console.log('[full] bugGraph start');
    try {
        const result = await bugGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[full] bugGraph end');
        return { bugReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[full] bugGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function docsWrapperNode(state, config) {
    console.log('[full] docsGraph start');
    try {
        const result = await docsGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[full] docsGraph end');
        return { docsReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[full] docsGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function readmeWrapperNode(state, config) {
    console.log('[full] readmeGraph start');
    try {
        const result = await readmeGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[full] readmeGraph end');
        return { readmeReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[full] readmeGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function reviewWrapperNode(state, config) {
    console.log('[full] reviewGraph start');
    try {
        const result = await reviewGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[full] reviewGraph end');
        return { reviewResult: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[full] reviewGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function explainWrapperNode(state, config) {
    console.log('[full] explainGraph start');
    try {
        const result = await explainGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[full] explainGraph end');
        return { explainResult: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[full] explainGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

const FullState = Annotation.Root({
    ...CompositeState
});

export const fullGraphPipeline = new StateGraph(FullState)
    .addNode('auditGraph', auditWrapperNode)
    .addNode('bugGraph', bugWrapperNode)
    .addNode('docsGraph', docsWrapperNode)
    .addNode('readmeGraph', readmeWrapperNode)
    .addNode('reviewGraph', reviewWrapperNode)
    .addNode('explainGraph', explainWrapperNode)
    .addNode('summary', summaryNode)

    .addEdge(START, 'auditGraph')
    .addEdge(START, 'bugGraph')
    .addEdge(START, 'docsGraph')
    .addEdge(START, 'readmeGraph')
    .addEdge(START, 'reviewGraph')
    .addEdge(START, 'explainGraph')

    .addEdge(['auditGraph', 'bugGraph', 'docsGraph', 'readmeGraph', 'reviewGraph', 'explainGraph'], 'summary')
    .addEdge('summary', END)
    .compile();
