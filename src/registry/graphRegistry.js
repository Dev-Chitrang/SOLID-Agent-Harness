import { auditGraphPipeline } from '../audit/graph.js';
import { bugGraphPipeline } from '../bugs/graph.js';
import { docsGraphPipeline } from '../docs/graph.js';
import { readmeGraphPipeline } from '../readme/graph.js';
import { reviewGraphPipeline } from '../review/graph.js';
import { explainGraphPipeline } from '../explain/graph.js';

import { ciFastGraphPipeline } from '../composite/ci-fast/graph.js';
import { qualityGraphPipeline } from '../composite/quality/graph.js';
import { docsSuiteGraphPipeline } from '../composite/docs-suite/graph.js';
import { onboardGraphPipeline } from '../composite/onboarding/graph.js';
import { fullGraphPipeline } from '../composite/full/graph.js';

export const graphRegistry = {
    audit: auditGraphPipeline,
    bugs: bugGraphPipeline,
    docs: docsGraphPipeline,
    readme: readmeGraphPipeline,
    review: reviewGraphPipeline,
    explain: explainGraphPipeline,
    'ci-fast': ciFastGraphPipeline,
    quality: qualityGraphPipeline,
    'docs-suite': docsSuiteGraphPipeline,
    onboard: onboardGraphPipeline,
    full: fullGraphPipeline,
};
