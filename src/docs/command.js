import ora from 'ora';
import chalk from 'chalk';
import { readRepositoryFiles, writeReportFile } from '../core/fileSystem.js';
import { AgentHarness } from '../core/harness.js';
import { ProviderFactory } from '../providers/providerFactory.js';
import { ConfigManager } from '../core/config.js';

export async function handleDocsCommand(filePath, providerName, modelName) {
    const spinner = ora('Compiling repository modular blueprints...').start();
    try {
        const configManager = new ConfigManager();
        const globalConfig = configManager.load();
        const activeProviderName = providerName || globalConfig.defaultProvider;
        const providerCreds = globalConfig.providers[activeProviderName];

        const filePayload = readRepositoryFiles(filePath);
        spinner.text = chalk.cyan(`Executing Documentation Compiler Pipeline Graph...`);

        const providerInstance = ProviderFactory.create(activeProviderName, providerCreds);
        const harness = new AgentHarness(providerInstance, modelName || providerCreds.defaultModel);

        const markdownOutput = await harness.run('docs', filePayload);

        writeReportFile(filePath, globalConfig.outputDir || 'Review', 'ARCHITECTURE.md', markdownOutput);
        spinner.succeed(chalk.green(`Architecture file generated at ${globalConfig.outputDir || 'Review'}/ARCHITECTURE.md`));
    } catch (error) {
        spinner.fail(chalk.red(`Documentation build failed: ${error.message}`));
    }
}
