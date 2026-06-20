import { Annotation, StateGraph } from "@langchain/langgraph";
import { documentAgentNode } from './agent.js'

const DocsState = Annotation.Root({
    repositoryFiles: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
    analysisResult: Annotation({ reducer: (x, y) => y ?? x, default: () => '' })
})

export const docsGraphPipeline = new StateGraph(DocsState)
    .addNode('executeDocs', documentAgentNode)
    .addEdge('__start__', 'executeDocs')
    .addEdge('executeDocs', '__end__')
    .compile()
