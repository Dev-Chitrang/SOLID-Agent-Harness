import { Annotation, StateGraph, END } from '@langchain/langgraph';
import { DocumentState } from '../common/state/States.js';
import { readmeAgentNode } from './agent.js';
import { createCriticNode } from '../common/nodes/criticNodeFactory.js';
import { createDocumentStateNode } from '../common/nodes/documentStateNode.js';

const readmeCriticPrompt = `You are a README quality evaluator.
Evaluate the README output and return JSON only: { "score": <1-10>, "feedback": "<string>" }
Score >= 8 means the README is polished, well-structured, covers setup, features, and architecture. Score < 8 means it needs improvement.`;

const readmeCriticNode = createCriticNode(readmeCriticPrompt, 'readmeScore');
const documentStateNode = createDocumentStateNode('README.md');

const ReadmeState = Annotation.Root({
    ...DocumentState,
    readmeScore: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 })
});

function shouldContinue(state) {
    if ((state.readmeScore ?? 0) >= 8 || (state.iteration ?? 0) >= 3) return END;
    return 'executeReadme';
}

export const readmeGraphPipeline = new StateGraph(ReadmeState)
    .addNode('loadDocument', documentStateNode)
    .addNode('executeReadme', readmeAgentNode)
    .addNode('critic', readmeCriticNode)
    .addEdge('__start__', 'loadDocument')
    .addEdge('loadDocument', 'executeReadme')
    .addEdge('executeReadme', 'critic')
    .addConditionalEdges('critic', shouldContinue, { [END]: END, executeReadme: 'executeReadme' })
    .compile();
