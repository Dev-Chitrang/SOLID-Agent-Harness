import { StateGraph } from "@langchain/langgraph";
import { AnalyzerState } from "./state.js";
import {
    supervisorNode,
    solidAuditorNode,
    bugHunterNode,
    documenterNode,
    reportWriterNode,
    readmeWriterNode
} from "./agents.js";

const pipeline = new StateGraph(AnalyzerState)
    .addNode("supervisor", supervisorNode)
    .addNode("solidAuditor", solidAuditorNode)
    .addNode("bugHunter", bugHunterNode)
    .addNode("documenter", documenterNode)
    .addNode("reportWriter", reportWriterNode)
    .addNode("readmeWriter", readmeWriterNode)

    .addEdge("__start__", "supervisor")
    .addEdge("supervisor", "solidAuditor")
    .addEdge("supervisor", "bugHunter")
    .addEdge("supervisor", "documenter")
    .addEdge("supervisor", "readmeWriter")
    .addEdge("solidAuditor", "reportWriter")
    .addEdge("bugHunter", "reportWriter")
    .addEdge("documenter", "reportWriter")
    .addEdge("readmeWriter", "reportWriter")
    .addEdge("reportWriter", "__end__");

export const codeAnalyzerGraphApp = pipeline.compile();
