import ora from 'ora';
import chalk from 'chalk';
import { readRepositoryFiles, writeReportFile } from '../core/fileSystem.js';
import { AgentHarness } from '../core/harness.js';
import { ProviderFactory } from '../providers/providerFactory.js';
import { ConfigManager } from '../core/config.js';

export async function handleBugsCommand(filePath, providerName, modelName) {
    const spinner = ora('Indexing targets for code logic evaluation...').start();
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

        const filePayload = readRepositoryFiles(filePath);
        spinner.text = chalk.cyan(`Repository indexed. Starting Bug Hunter Graph...`);

        const providerInstance = ProviderFactory.create(activeProviderName, providerCreds);
        const harness = new AgentHarness(providerInstance, modelName || providerCreds.defaultModel);

        const markdownOutput = await harness.run('bugs', filePayload, filePath, globalConfig.outputDir || 'Review');

        writeReportFile(filePath, globalConfig.outputDir || 'Review', 'BUG_REPORT.md', markdownOutput);
        spinner.succeed(chalk.green(`Bug scan complete. File written to ${globalConfig.outputDir || 'Review'}/BUG_REPORT.md`));
    } catch (error) {
        spinner.fail(chalk.red(`Vulnerability check aborted: ${error.message}`));
    }
}
