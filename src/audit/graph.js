import { Annotation, StateGraph } from "@langchain/langgraph";
import { solidAgentNode } from './agent.js'

const AuditState = Annotation.Root({
    repositoryFiles: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
    analysisResult: Annotation({ reducer: (x, y) => y ?? x, default: () => '' })
})

export const auditGraphPipeline = new StateGraph(AuditState)
    .addNode('executeAudit', solidAgentNode)
    .addEdge('__start__', 'executeAudit')
    .addEdge('executeAudit', '__end__')
    .compile()
