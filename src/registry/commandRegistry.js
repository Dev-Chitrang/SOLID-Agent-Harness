import { handleAuditCommand } from '../audit/command.js';
import { handleBugsCommand } from '../bugs/command.js';
import { handleDocsCommand } from '../docs/command.js';
import { handleReadmeCommand } from '../readme/command.js';
import { handleReviewCommand } from '../review/command.js';
import { handleExplainCommand } from '../explain/command.js';

import { handleCiFastCommand } from '../composite/ci-fast/command.js';
import { handleQualityCommand } from '../composite/quality/command.js';
import { handleDocsSuiteCommand } from '../composite/docs-suite/command.js';
import { handleOnboardCommand } from '../composite/onboard/command.js';
import { handleFullCommand } from '../composite/full/command.js';

export const commandRegistry = {
    audit: handleAuditCommand,
    bugs: handleBugsCommand,
    docs: handleDocsCommand,
    readme: handleReadmeCommand,
    review: handleReviewCommand,
    explain: handleExplainCommand,
    'ci-fast': handleCiFastCommand,
    quality: handleQualityCommand,
    'docs-suite': handleDocsSuiteCommand,
    onboard: handleOnboardCommand,
    full: handleFullCommand,
};
