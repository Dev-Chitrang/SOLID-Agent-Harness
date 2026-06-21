/**
 * criticNodeFactory.js
 *
 * Creates a reusable critic node for any LangGraph pipeline.
 * The critic evaluates the agent's analysisResult, returns a
 * numeric score and textual feedback, then increments iteration.
 *
 * Shared by: audit, bugs, docs, readme, review, explain graphs.
 */

export function createCriticNode(systemPrompt, scoreKey) {

    return async function criticNode(state, config) {

        const providerInstance = config.configurable.providerInstance;
        const activeModel = config.configurable.model;

        const response = await providerInstance.invoke(
            [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: state.analysisResult }
            ],
            activeModel
        );

        let score = 10;
        let feedback = '';

        try {
            // Strip markdown code fences if the model wraps JSON in them
            const raw = typeof response === 'string'
                ? response
                : String(response);
            const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            score = typeof parsed.score === 'number' ? parsed.score : 10;
            feedback = parsed.feedback ?? '';
        } catch {
            // Unparseable response — treat as passing so the graph
            // does not loop indefinitely on malformed critic output
            score = 10;
            feedback = '';
        }

        return {
            [scoreKey]: score,
            criticFeedback: feedback,
            iteration: (state.iteration || 0) + 1
        };
    };
}
