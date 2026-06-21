import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { CompositeState } from '../../common/state/States.js';
import { auditGraphPipeline } from '../../audit/graph.js';
import { bugGraphPipeline } from '../../bugs/graph.js';
import { summaryNode } from '../../common/nodes/summaryNode.js';

// Wrapper nodes isolate subgraph execution from parent state.
// Each wrapper passes only repositoryFiles into the subgraph,
// preventing analysisResult from being shared across branches
// and avoiding state field mismatches (DocumentState vs CompositeState).
async function auditWrapperNode(state, config) {
    console.log('[ci-fast] auditGraph start');
    try {
        const result = await auditGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[ci-fast] auditGraph end — analysisResult length:', result.analysisResult?.length ?? 0);
        return { auditReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[ci-fast] auditGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function bugWrapperNode(state, config) {
    console.log('[ci-fast] bugGraph start');
    try {
        const result = await bugGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[ci-fast] bugGraph end — analysisResult length:', result.analysisResult?.length ?? 0);
        return { bugReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[ci-fast] bugGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

const CiFastState = Annotation.Root({
    ...CompositeState
});

export const ciFastGraphPipeline = new StateGraph(CiFastState)
    .addNode('auditGraph', auditWrapperNode)
    .addNode('bugGraph', bugWrapperNode)
    .addNode('summary', summaryNode)

    .addEdge(START, 'auditGraph')
    .addEdge(START, 'bugGraph')

    .addEdge(['auditGraph', 'bugGraph'], 'summary')
    .addEdge('summary', END)
    .compile();
