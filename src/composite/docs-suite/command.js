import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import { readRepositoryFiles } from '../../core/fileSystem.js';
import { AgentHarness } from '../../core/harness.js';
import { ProviderFactory } from '../../providers/providerFactory.js';
import { ConfigManager } from '../../core/config.js';

export async function handleDocsSuiteCommand(filePath, providerName, modelName) {
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

        const filePayload = readRepositoryFiles(filePath);
        spinner.text = chalk.cyan(`Running Docs Suite composite graph via ${activeProviderName}...`);

        const providerInstance = ProviderFactory.create(activeProviderName, providerCreds);
        const harness = new AgentHarness(providerInstance, modelName || providerCreds.defaultModel);

        const summary = await harness.run(
            'docs-suite',
            filePayload,
            filePath,
            globalConfig.outputDir || 'Review'
        );

        spinner.succeed(chalk.green(`Docs Suite complete. Underlying reports updated in ${globalConfig.outputDir || 'Review'}/\n`));

        const table = new Table({
            head: [chalk.blue('Docs Suite Summary')],
            wordWrap: true,
            colWidths: [80]
        });
        table.push([summary]);
        console.log(table.toString());
    } catch (error) {
        spinner.fail(chalk.red(`Docs Suite routine aborted: ${error.message}`));
    }
}
