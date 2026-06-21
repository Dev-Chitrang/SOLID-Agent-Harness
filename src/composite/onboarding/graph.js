import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { CompositeState } from '../../common/state/States.js';
import { explainGraphPipeline } from '../../explain/graph.js';
import { docsGraphPipeline } from '../../docs/graph.js';
import { readmeGraphPipeline } from '../../readme/graph.js';
import { summaryNode } from '../../common/nodes/summaryNode.js';

async function explainWrapperNode(state, config) {
    console.log('[onboard] explainGraph start');
    try {
        const result = await explainGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[onboard] explainGraph end');
        return { explainResult: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[onboard] explainGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function docsWrapperNode(state, config) {
    console.log('[onboard] docsGraph start');
    try {
        const result = await docsGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[onboard] docsGraph end');
        return { docsReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[onboard] docsGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function readmeWrapperNode(state, config) {
    console.log('[onboard] readmeGraph start');
    try {
        const result = await readmeGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[onboard] readmeGraph end');
        return { readmeReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[onboard] readmeGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

const OnboardState = Annotation.Root({
    ...CompositeState
});

export const onboardGraphPipeline = new StateGraph(OnboardState)
    .addNode('explainGraph', explainWrapperNode)
    .addNode('docsGraph', docsWrapperNode)
    .addNode('readmeGraph', readmeWrapperNode)
    .addNode('summary', summaryNode)

    .addEdge(START, 'explainGraph')
    .addEdge(START, 'docsGraph')
    .addEdge(START, 'readmeGraph')

    .addEdge(['explainGraph', 'docsGraph', 'readmeGraph'], 'summary')
    .addEdge('summary', END)
    .compile();
