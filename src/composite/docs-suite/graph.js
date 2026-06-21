import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { CompositeState } from '../../common/state/States.js';
import { docsGraphPipeline } from '../../docs/graph.js';
import { readmeGraphPipeline } from '../../readme/graph.js';
import { summaryNode } from '../../common/nodes/summaryNode.js';

async function docsWrapperNode(state, config) {
    console.log('[docs-suite] docsGraph start');
    try {
        const result = await docsGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[docs-suite] docsGraph end');
        return { docsReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[docs-suite] docsGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function readmeWrapperNode(state, config) {
    console.log('[docs-suite] readmeGraph start');
    try {
        const result = await readmeGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[docs-suite] readmeGraph end');
        return { readmeReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[docs-suite] readmeGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

const DocsSuiteState = Annotation.Root({
    ...CompositeState
});

export const docsSuiteGraphPipeline = new StateGraph(DocsSuiteState)
    .addNode('docsGraph', docsWrapperNode)
    .addNode('readmeGraph', readmeWrapperNode)
    .addNode('summary', summaryNode)

    .addEdge(START, 'docsGraph')
    .addEdge(START, 'readmeGraph')

    .addEdge(['docsGraph', 'readmeGraph'], 'summary')
    .addEdge('summary', END)
    .compile();
