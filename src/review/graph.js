import { Annotation, StateGraph } from '@langchain/langgraph';
import { reviewAgentNode } from './agent.js';
const ReviewState = Annotation.Root({
    repositoryFiles: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
    analysisResult: Annotation({ reducer: (x, y) => y ?? x, default: () => '' })
});
export const reviewGraphPipeline = new StateGraph(ReviewState)
    .addNode('executeReview', reviewAgentNode)
    .addEdge('__start__', 'executeReview')
    .addEdge('executeReview', '__end__')
    .compile();
