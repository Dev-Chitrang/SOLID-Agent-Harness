import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import { readRepositoryFiles } from '../core/fileSystem.js';
import { AgentHarness } from '../core/harness.js';
import { ProviderFactory } from '../providers/providerFactory.js';
import { ConfigManager } from '../core/config.js';

export async function handleReviewCommand(filePath, providerName, modelName) {
    const spinner = ora('Parsing target source file content...').start();
    try {
        const configManager = new ConfigManager();
        const globalConfig = configManager.load();
        const activeProviderName = providerName || globalConfig.defaultProvider;
        const providerCreds = globalConfig.providers[activeProviderName];

        const filePayload = readRepositoryFiles(filePath);
        spinner.text = chalk.cyan(`Analyzing file mechanics on Graph Execution Circuit...`);

        const providerInstance = ProviderFactory.create(activeProviderName, providerCreds);
        const harness = new AgentHarness(providerInstance, modelName || providerCreds.defaultModel);

        const responseText = await harness.run('review', filePayload, filePath);
        spinner.succeed(chalk.green(`Review execution complete.\n`));

        const table = new Table({
            head: [chalk.magenta('Analysis Metric Cluster Output')],
            wordWrap: true,
            colWidths: [80]
        });
        table.push([responseText]);
        console.log(table.toString());
    } catch (error) {
        spinner.fail(chalk.red(`Review failed: ${error.message}`));
    }
}
