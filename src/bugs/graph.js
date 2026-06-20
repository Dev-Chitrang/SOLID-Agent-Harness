import { Annotation, StateGraph } from "@langchain/langgraph";
import { bugAgentNode } from './agent.js'

const BugState = Annotation.Root({
    repositoryFiles: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
    analysisResult: Annotation({ reducer: (x, y) => y ?? x, default: () => '' })
})

export const bugGraphPipeline = new StateGraph(BugState)
    .addNode('executeBugs', bugAgentNode)
    .addEdge('__start__', 'executeBugs')
    .addEdge('executeBugs', '__end__')
    .compile()
