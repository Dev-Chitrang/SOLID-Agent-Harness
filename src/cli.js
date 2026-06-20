import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from './core/config.js';
import { launchInteractiveTUI } from './ui/interactive.js';

const program = new Command();
const configManager = new ConfigManager();

program
  .name('code-agent')
  .description('Polished Developer Tooling Platform for Repo Analysis & Code Understanding')
  .version('2.0.0');

program
  .command('init')
  .description('First-time environment configurations initialization setup.')
  .action(async () => {
    console.log(chalk.bold.green('Initializing Global Multi-Provider Credentials Engine Store...'));
    const config = configManager.load();

    const targets = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'enabledProviders',
        message: 'Select and enable available model provider endpoints:',
        choices: ['openai', 'anthropic', 'gemini', 'nvidia']
      }
    ]);

    if (!targets.enabledProviders || targets.enabledProviders.length === 0) {
      console.log(chalk.yellow('No providers selected. Configuration unmutated.\n'));
      process.exit(0);
    }

    // Reset provider records cleanly
    config.providers = {};

    for (const provider of targets.enabledProviders) {
      const keys = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: `Enter API Secret token authentication key for [${provider.toUpperCase()}]:`
        }
      ]);

      // Store ONLY the API key as per requirements
      config.providers[provider] = {
        apiKey: keys.apiKey
      };
    }

    config.defaultProvider = targets.enabledProviders[0];
    configManager.save(config);

    console.log(chalk.green('\n✓ Persistent configurations profiles written safely inside .code-agent/config.json.'));
    console.log(chalk.cyan(`Setup complete! Run ${chalk.bold('code-agent')} now to launch your interactive environment.\n`));
  });

program
  .action(() => {
    if (program.args.length > 0) {
      console.log(chalk.red(`Unknown syntax command context parameter. Please use 'code-agent' for TUI interface or 'code-agent init' for setup.\n`));
      process.exit(1);
    }

    const config = configManager.load();
    const activeProviders = Object.keys(config.providers || {});
    if (activeProviders.length === 0) {
      console.log(chalk.red(`Access Denied: Global runtime credentials have not been configured yet.`));
      console.log(chalk.cyan(`Please execute ${chalk.bold('code-agent init')} first to authenticate your system endpoints.\n`));
      process.exit(1);
    }

    launchInteractiveTUI();
  });

program.parse(process.argv);
