import { Annotation, StateGraph, END } from '@langchain/langgraph';
import { BaseState } from '../common/state/States.js';
import { reviewAgentNode } from './agent.js';
import { createCriticNode } from '../common/nodes/criticNodeFactory.js';

const reviewCriticPrompt = `You are a code review quality evaluator.
Evaluate the review output and return JSON only: { "score": <1-10>, "feedback": "<string>" }
Score >= 8 means the review is thorough and actionable. Score < 8 means it needs improvement.`;

const reviewCriticNode = createCriticNode(reviewCriticPrompt, 'reviewScore');

const ReviewState = Annotation.Root({
    ...BaseState,
    reviewScore: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 })
});

function shouldContinue(state) {
    if ((state.reviewScore ?? 0) >= 8 || (state.iteration ?? 0) >= 3) return END;
    return 'executeReview';
}

export const reviewGraphPipeline = new StateGraph(ReviewState)
    .addNode('executeReview', reviewAgentNode)
    .addNode('critic', reviewCriticNode)
    .addEdge('__start__', 'executeReview')
    .addEdge('executeReview', 'critic')
    .addConditionalEdges('critic', shouldContinue, { [END]: END, executeReview: 'executeReview' })
    .compile();
