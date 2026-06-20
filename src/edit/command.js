import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigManager } from '../core/config.js';

export async function handleEditCommand() {
    const configManager = new ConfigManager();
    const currentConfig = configManager.load();

    console.log(chalk.blue('Current Harness Configurations Settings:'));
    console.log(chalk.gray(`Default Active Provider: `) + chalk.green(currentConfig.defaultProvider));
    console.log(chalk.gray(`Reports Output Directory: `) + chalk.green(currentConfig.outputDir));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'defaultProvider',
            message: 'Select default routing LLM engine provider:',
            choices: ['openai', 'anthropic', 'gemini', 'nvidia'],
            default: currentConfig.defaultProvider
        },
        {
            type: 'input',
            name: 'outputDir',
            message: 'Modify targeted local output directory name:',
            default: currentConfig.outputDir || 'Review'
        }
    ]);

    currentConfig.defaultProvider = answers.defaultProvider;
    currentConfig.outputDir = answers.outputDir;
    configManager.save(currentConfig);

    console.log(chalk.green('\n✓ Active settings modified successfully.\n'));
}
