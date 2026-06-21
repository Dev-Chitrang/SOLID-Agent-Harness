import { Annotation } from '@langchain/langgraph';

export const BaseState = {

    repositoryFiles: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
    analysisResult: Annotation({ reducer: (x, y) => y ?? x, default: () => '' }),
    criticFeedback: Annotation({ reducer: (x, y) => y ?? x, default: () => '' }),
    iteration: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 })

};

export const DocumentState = {

    ...BaseState,

    existingDocument: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),
    documentMode: Annotation({ reducer: (x, y) => y ?? x, default: () => 'generate' })

};

export const CompositeState = {

    repositoryFiles: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),

    auditReport: Annotation({ reducer: (x, y) => y ?? x, default: () => '' }),
    bugReport: Annotation({ reducer: (x, y) => y ?? x, default: () => '' }),
    docsReport: Annotation({ reducer: (x, y) => y ?? x, default: () => '' }),
    readmeReport: Annotation({ reducer: (x, y) => y ?? x, default: () => '' }),

    reviewResult: Annotation({ reducer: (x, y) => y ?? x, default: () => '' }),
    explainResult: Annotation({ reducer: (x, y) => y ?? x, default: () => '' }),

    finalSummary: Annotation({ reducer: (x, y) => y ?? x, default: () => '' })

};
