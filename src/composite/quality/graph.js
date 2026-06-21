import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { CompositeState } from '../../common/state/States.js';
import { auditGraphPipeline } from '../../audit/graph.js';
import { bugGraphPipeline } from '../../bugs/graph.js';
import { reviewGraphPipeline } from '../../review/graph.js';
import { summaryNode } from '../../common/nodes/summaryNode.js';

async function auditWrapperNode(state, config) {
    console.log('[quality] auditGraph start');
    try {
        const result = await auditGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[quality] auditGraph end');
        return { auditReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[quality] auditGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function bugWrapperNode(state, config) {
    console.log('[quality] bugGraph start');
    try {
        const result = await bugGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[quality] bugGraph end');
        return { bugReport: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[quality] bugGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

async function reviewWrapperNode(state, config) {
    console.log('[quality] reviewGraph start');
    try {
        const result = await reviewGraphPipeline.invoke(
            { repositoryFiles: state.repositoryFiles },
            config
        );
        console.log('[quality] reviewGraph end');
        return { reviewResult: result.analysisResult ?? '' };
    } catch (err) {
        console.error('[quality] reviewGraph FAILED:', err.message);
        if (err.errors) err.errors.forEach((e, i) => console.error(`  inner[${i}]:`, e.message));
        throw err;
    }
}

const QualityState = Annotation.Root({
    ...CompositeState
});

export const qualityGraphPipeline = new StateGraph(QualityState)
    .addNode('auditGraph', auditWrapperNode)
    .addNode('bugGraph', bugWrapperNode)
    .addNode('reviewGraph', reviewWrapperNode)
    .addNode('summary', summaryNode)

    .addEdge(START, 'auditGraph')
    .addEdge(START, 'bugGraph')
    .addEdge(START, 'reviewGraph')

    .addEdge(['auditGraph', 'bugGraph', 'reviewGraph'], 'summary')
    .addEdge('summary', END)
    .compile();
