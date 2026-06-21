import { Annotation, StateGraph, END } from '@langchain/langgraph';
import { DocumentState } from '../common/state/States.js';
import { documentAgentNode } from './agent.js';
import { createCriticNode } from '../common/nodes/criticNodeFactory.js';
import { createDocumentStateNode } from '../common/nodes/documentStateNode.js';

const docsCriticPrompt = `You are an architecture documentation quality evaluator.
Evaluate the documentation output and return JSON only: { "score": <1-10>, "feedback": "<string>" }
Score >= 8 means the docs are comprehensive, include a Mermaid diagram, and clearly cover module interactions. Score < 8 means it needs more detail.`;

const docsCriticNode = createCriticNode(docsCriticPrompt, 'docsScore');
const documentStateNode = createDocumentStateNode('Review', 'ARCHITECTURE.md');

const DocsState = Annotation.Root({
    ...DocumentState,
    docsScore: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 })
});

function shouldContinue(state) {
    if ((state.docsScore ?? 0) >= 8 || (state.iteration ?? 0) >= 3) return END;
    return 'executeDocs';
}

export const docsGraphPipeline = new StateGraph(DocsState)
    .addNode('loadDocument', documentStateNode)
    .addNode('executeDocs', documentAgentNode)
    .addNode('critic', docsCriticNode)
    .addEdge('__start__', 'loadDocument')
    .addEdge('loadDocument', 'executeDocs')
    .addEdge('executeDocs', 'critic')
    .addConditionalEdges('critic', shouldContinue, { [END]: END, executeDocs: 'executeDocs' })
    .compile();
