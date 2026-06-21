export async function auditAdapterNode(state) {

    return {
        auditReport: state.analysisResult
    };

}

export async function bugAdapterNode(state) {

    return {
        bugReport: state.analysisResult
    };

}

export async function docsAdapterNode(state) {

    return {
        docsReport: state.analysisResult
    };

}

export async function readmeAdapterNode(state) {

    return {
        readmeReport: state.analysisResult
    };

}

export async function reviewAdapterNode(state) {

    return {
        reviewResult: state.analysisResult
    };

}

export async function explainAdapterNode(state) {

    return {
        explainResult: state.analysisResult
    };

}
