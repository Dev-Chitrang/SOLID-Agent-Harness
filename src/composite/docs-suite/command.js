import ora from 'ora';
import chalk from 'chalk';

import { readRepositoryFiles, writeReportFile } from '../../core/fileSystem.js';
import { AgentHarness } from '../../core/harness.js';
import { ProviderFactory } from '../../providers/providerFactory.js';
import { ConfigManager } from '../../core/config.js';

export async function handleDocsSuiteCommand(
    filePath,
    providerName,
    modelName
) {

    const spinner =
        ora('Indexing target repository layout...').start();

    try {

        const configManager = new ConfigManager();
        const globalConfig = configManager.load();

        const activeProviderName =
            providerName || globalConfig.defaultProvider;

        const providerCreds =
            globalConfig.providers[activeProviderName];

        if (!providerCreds || !providerCreds.apiKey) {

            spinner.stop();

            console.log(
                chalk.red(
                    `Error: Provider '${activeProviderName}' is unconfigured.`
                )
            );

            return;

        }

        const filePayload =
            readRepositoryFiles(filePath);

        spinner.text = chalk.cyan(
            `Running Docs Suite composite graph via ${activeProviderName}...`
        );

        const providerInstance =
            ProviderFactory.create(
                activeProviderName,
                providerCreds
            );

        const harness =
            new AgentHarness(
                providerInstance,
                modelName || providerCreds.defaultModel
            );

        const markdownOutput =
            await harness.run(
                'docs-suite',
                filePayload
            );

        writeReportFile(
            filePath,
            globalConfig.outputDir || 'Review',
            'DOCS_SUITE_REPORT.md',
            markdownOutput
        );

        spinner.succeed(
            chalk.green(
                `Docs Suite report written to ${globalConfig.outputDir || 'Review'}/DOCS_SUITE_REPORT.md`
            )
        );

    }
    catch (error) {

        spinner.fail(
            chalk.red(
                `Docs Suite routine aborted: ${error.message}`
            )
        );

    }

}
