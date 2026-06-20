import { Annotation, StateGraph } from "@langchain/langgraph";
import { readmeAgentNode } from './agent.js'

const ReadmeState = Annotation.Root({
    repositoryFiles: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
    analysisResult: Annotation({ reducer: (x, y) => y ?? x, default: () => '' })
})

export const readmeGraphPipeline = new StateGraph(ReadmeState)
    .addNode('executeReadme', readmeAgentNode)
    .addEdge('__start__', 'executeReadme')
    .addEdge('executeReadme', '__end__')
    .compile()
