import ora from 'ora';
import chalk from 'chalk';
import { readRepositoryFiles, writeReportFile } from '../core/fileSystem.js';
import { AgentHarness } from '../core/harness.js';
import { ProviderFactory } from '../providers/providerFactory.js';
import { ConfigManager } from '../core/config.js';

export async function handleReadmeCommand(filePath, providerName, modelName) {
    const spinner = ora('Analyzing repository layout for deployment docs...').start();
    try {
        const configManager = new ConfigManager();
        const globalConfig = configManager.load();
        const activeProviderName = providerName || globalConfig.defaultProvider;
        const providerCreds = globalConfig.providers[activeProviderName];

        const filePayload = readRepositoryFiles(filePath);
        spinner.text = chalk.cyan(`Assembling project open source blueprint docs via Graph...`);

        const providerInstance = ProviderFactory.create(activeProviderName, providerCreds);
        const harness = new AgentHarness(providerInstance, modelName || providerCreds.defaultModel);

        const markdownOutput = await harness.run('readme', filePayload);

        writeReportFile(filePath, globalConfig.outputDir || 'Review', 'README.md', markdownOutput);
        spinner.succeed(chalk.green(`README.md generation complete inside ${globalConfig.outputDir || 'Review'}/README.md`));
    } catch (error) {
        spinner.fail(chalk.red(`README compilation failed: ${error.message}`));
    }
}
