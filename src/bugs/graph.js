import { Annotation, StateGraph, END } from '@langchain/langgraph';
import { DocumentState } from '../common/state/States.js';
import { bugAgentNode } from './agent.js';
import { createCriticNode } from '../common/nodes/criticNodeFactory.js';
import { createDocumentStateNode } from '../common/nodes/documentStateNode.js';

const bugCriticPrompt = `You are a bug report quality evaluator.
Evaluate the bug report output and return JSON only: { "score": <1-10>, "feedback": "<string>" }
Score >= 8 means the report is comprehensive, well-grouped by severity, and actionable. Score < 8 means it needs more findings or clarity.`;

const bugCriticNode = createCriticNode(bugCriticPrompt, 'bugScore');
const documentStateNode = createDocumentStateNode('BUG_REPORT.md');

const BugState = Annotation.Root({
    ...DocumentState,
    bugScore: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 })
});

function shouldContinue(state) {
    if ((state.bugScore ?? 0) >= 8 || (state.iteration ?? 0) >= 3) return END;
    return 'executeBugs';
}

export const bugGraphPipeline = new StateGraph(BugState)
    .addNode('loadDocument', documentStateNode)
    .addNode('executeBugs', bugAgentNode)
    .addNode('critic', bugCriticNode)
    .addEdge('__start__', 'loadDocument')
    .addEdge('loadDocument', 'executeBugs')
    .addEdge('executeBugs', 'critic')
    .addConditionalEdges('critic', shouldContinue, { [END]: END, executeBugs: 'executeBugs' })
    .compile();
