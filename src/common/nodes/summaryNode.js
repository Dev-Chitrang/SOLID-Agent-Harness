export async function summaryNode(state, config) {

    const providerInstance = config.configurable.providerInstance;
    const activeModel = config.configurable.model;

    const payload = {
        auditReport: state.auditReport,
        bugReport: state.bugReport,
        docsReport: state.docsReport,
        readmeReport: state.readmeReport,
        reviewResult: state.reviewResult,
        explainResult: state.explainResult
    };

    const response = await providerInstance.invoke(
        [
            {
                role: "system",
                content: `
                You are a Principal Software Architect.

                Merge multiple analysis outputs into a single concise report.

                Provide:
                # Executive Summary
                # Major Findings
                # Documentation Status
                # Architecture Insights
                # Recommended Next Steps
                Return markdown only.
                `
            },
            {
                role: "user",
                content: JSON.stringify(payload, null, 2)
            }
        ],
        activeModel
    );

    return {
        finalSummary: response
    };
}
