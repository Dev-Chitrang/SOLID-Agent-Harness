import { Annotation, StateGraph, END } from '@langchain/langgraph';
import { BaseState } from '../common/state/States.js';
import { explainAgentNode } from './agent.js';
import { createCriticNode } from '../common/nodes/criticNodeFactory.js';

const explainCriticPrompt = `You are a code explanation quality evaluator.
Evaluate the explanation output and return JSON only: { "score": <1-10>, "feedback": "<string>" }
Score >= 8 means the explanation is clear, complete, and useful. Score < 8 means it needs more depth.`;

const explainCriticNode = createCriticNode(explainCriticPrompt, 'explainScore');

const ExplainState = Annotation.Root({
    ...BaseState,
    explainScore: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 })
});

function shouldContinue(state) {
    if ((state.explainScore ?? 0) >= 8 || (state.iteration ?? 0) >= 3) return END;
    return 'executeExplain';
}

export const explainGraphPipeline = new StateGraph(ExplainState)
    .addNode('executeExplain', explainAgentNode)
    .addNode('critic', explainCriticNode)
    .addEdge('__start__', 'executeExplain')
    .addEdge('executeExplain', 'critic')
    .addConditionalEdges('critic', shouldContinue, { [END]: END, executeExplain: 'executeExplain' })
    .compile();
