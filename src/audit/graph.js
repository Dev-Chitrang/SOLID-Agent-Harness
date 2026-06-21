import { Annotation, StateGraph, END } from '@langchain/langgraph';
import { DocumentState } from '../common/state/States.js';
import { solidAgentNode } from './agent.js';
import { createCriticNode } from '../common/nodes/criticNodeFactory.js';
import { createDocumentStateNode } from '../common/nodes/documentStateNode.js';

const auditCriticPrompt = `You are a SOLID audit quality evaluator.
Evaluate the SOLID audit output and return JSON only: { "score": <1-10>, "feedback": "<string>" }
Score >= 8 means the audit is thorough, well-structured, and covers all SOLID violations. Score < 8 means it needs more coverage.`;

const auditCriticNode = createCriticNode(auditCriticPrompt, 'auditScore');
const documentStateNode = createDocumentStateNode('Review', 'SOLID_AUDIT.md');

const AuditState = Annotation.Root({
    ...DocumentState,
    auditScore: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 })
});

function shouldContinue(state) {
    if ((state.auditScore ?? 0) >= 8 || (state.iteration ?? 0) >= 3) return END;
    return 'executeAudit';
}

export const auditGraphPipeline = new StateGraph(AuditState)
    .addNode('loadDocument', documentStateNode)
    .addNode('executeAudit', solidAgentNode)
    .addNode('critic', auditCriticNode)
    .addEdge('__start__', 'loadDocument')
    .addEdge('loadDocument', 'executeAudit')
    .addEdge('executeAudit', 'critic')
    .addConditionalEdges('critic', shouldContinue, { [END]: END, executeAudit: 'executeAudit' })
    .compile();
