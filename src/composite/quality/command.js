import ora from 'ora';
import chalk from 'chalk';
import { readRepositoryFiles, writeReportFileDiffAware } from '../../core/fileSystem.js';
import { AgentHarness } from '../../core/harness.js';
import { ProviderFactory } from '../../providers/providerFactory.js';
import { ConfigManager } from '../../core/config.js';

export async function handleQualityCommand(filePath, providerName, modelName) {
    const spinner = ora('Indexing target repository layout...').start();

    try {
        const configManager = new ConfigManager();
        const globalConfig = configManager.load();
        const activeProviderName = providerName || globalConfig.defaultProvider;
        const providerCreds = globalConfig.providers[activeProviderName];

        if (!providerCreds || !providerCreds.apiKey) {
            spinner.stop();
            console.log(chalk.red(`Error: Provider '${activeProviderName}' is unconfigured. Run 'code-agent init'.\n`));
            return;
        }

        const outputDir = globalConfig.outputDir || 'Review';
        const filePayload = readRepositoryFiles(filePath);
        spinner.text = chalk.cyan(`Running Quality composite graph via ${activeProviderName}...`);

        const providerInstance = ProviderFactory.create(activeProviderName, providerCreds);
        const harness = new AgentHarness(providerInstance, modelName || providerCreds.defaultModel);

        const markdownOutput = await harness.run('quality', filePayload, filePath, outputDir);

        const written = writeReportFileDiffAware(filePath, outputDir, 'QUALITY_REPORT.md', markdownOutput);

        if (written) {
            spinner.succeed(chalk.green(`Quality report written to ${outputDir}/QUALITY_REPORT.md`));
        } else {
            spinner.succeed(chalk.gray(`Quality report unchanged — skipped write to ${outputDir}/QUALITY_REPORT.md`));
        }
    } catch (error) {
        spinner.fail(chalk.red(`Quality routine aborted: ${error.message}`));
    }
}
