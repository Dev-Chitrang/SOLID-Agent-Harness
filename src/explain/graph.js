import { Annotation, StateGraph } from '@langchain/langgraph';
import { explainAgentNode } from './agent.js';
const ExplainState = Annotation.Root({
    repositoryFiles: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
    analysisResult: Annotation({ reducer: (x, y) => y ?? x, default: () => '' })
});
export const explainGraphPipeline = new StateGraph(ExplainState)
    .addNode('executeExplain', explainAgentNode)
    .addEdge('__start__', 'executeExplain')
    .addEdge('executeExplain', '__end__').compile();
