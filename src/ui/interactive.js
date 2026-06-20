import blessed from 'blessed';
import { ConfigManager } from '../core/config.js';
import { ProviderFactory } from '../providers/providerFactory.js';
import { handleAuditCommand } from '../audit/command.js';
import { handleBugsCommand } from '../bugs/command.js';
import { handleDocsCommand } from '../docs/command.js';
import { handleReadmeCommand } from '../readme/command.js';
import { handleReviewCommand } from '../review/command.js';
import { handleExplainCommand } from '../explain/command.js';
import chalk from 'chalk';

const COMMANDS = ['audit', 'bugs', 'docs', 'readme', 'review', 'explain'];
const HANDLERS = {
    audit: handleAuditCommand,
    bugs: handleBugsCommand,
    docs: handleDocsCommand,
    readme: handleReadmeCommand,
    review: handleReviewCommand,
    explain: handleExplainCommand
};

const ACTIVE_COLOR = 'cyan';
const INACTIVE_COLOR = 'gray';

export async function launchInteractiveTUI() {
    const configManager = new ConfigManager();
    const config = configManager.load();

    const allowedProviders = Object.keys(config.providers || {}).filter(
        (k) => config.providers[k] && config.providers[k].apiKey
    );
    if (allowedProviders.length === 0) allowedProviders.push('none');

    let providerIndex = 0;
    let commandIndex = 0;
    let modelIndex = 0;
    let models = ['default'];

    const screen = blessed.screen({ smartCSR: true, title: 'Solid Agent Harness', fullUnicode: true });

    const mainBox = blessed.box({
        parent: screen,
        top: 'center',
        left: 'center',
        width: '60%',
        height: 7,
        border: { type: 'line' },
        style: { border: { fg: 'magenta' }, fg: 'white' },
        label: ' Solid Agent Harness '
    });

    const pathInput = blessed.textbox({
        parent: mainBox,
        top: 1,
        left: 1,
        right: 1,
        height: 3,
        inputOnFocus: true,
        style: { fg: 'white', bg: 'black', border: { fg: INACTIVE_COLOR } },
        border: { type: 'line' },
        label: ' Path '
    });

    const providerBox = blessed.box({
        parent: screen, bottom: 1, left: 2, width: 24, height: 3, keys: true,
        border: { type: 'line' }, style: { border: { fg: INACTIVE_COLOR }, fg: 'white' },
        label: ' Provider ', tags: true
    });

    const commandBox = blessed.box({
        parent: screen, bottom: 1, left: 'center', width: 24, height: 3, keys: true,
        border: { type: 'line' }, style: { border: { fg: INACTIVE_COLOR }, fg: 'white' },
        label: ' Command ', tags: true
    });

    const modelBox = blessed.box({
        parent: screen, bottom: 1, right: 2, width: 24, height: 3, keys: true,
        border: { type: 'line' }, style: { border: { fg: INACTIVE_COLOR }, fg: 'white' },
        label: ' Model ', tags: true
    });

    blessed.box({
        parent: screen, bottom: 0, left: 'center', height: 1,
        content: '{gray-fg}[Tab] cycle  [←/→] change  [Enter] run  [Esc] quit{/gray-fg}',
        tags: true
    });

    const focusOrder = [pathInput, providerBox, commandBox, modelBox];

    // Auto highlight on focus/blur — fires for every widget automatically
    focusOrder.forEach((widget) => {
        widget.on('focus', () => {
            widget.style.border.fg = ACTIVE_COLOR;
            screen.render();
        });
        widget.on('blur', () => {
            widget.style.border.fg = INACTIVE_COLOR;
            screen.render();
        });
    });

    let focusPos = 0;
    function focusNext() {
        if (focusOrder[focusPos] === pathInput) pathInput.cancel();
        focusPos = (focusPos + 1) % focusOrder.length;
        const next = focusOrder[focusPos];
        next.focus();
        if (next === pathInput) pathInput.readInput();
        screen.render();
    }

    async function refreshModels() {
        const providerName = allowedProviders[providerIndex];
        try {
            const instance = ProviderFactory.create(providerName, config.providers[providerName]);
            models = await instance.getModels();
            if (!models || models.length === 0) models = ['default'];
        } catch {
            models = ['default'];
        }
        modelIndex = 0;
        render();
    }

    function render() {
        providerBox.setContent(`{bold}${allowedProviders[providerIndex].toUpperCase()}{/bold}`);
        commandBox.setContent(`{bold}${COMMANDS[commandIndex]}{/bold}`);
        modelBox.setContent(`{bold}${models[modelIndex] || '...'}{/bold}`);
        screen.render();
    }

    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

    pathInput.key(['tab'], () => focusNext());

    providerBox.key(['tab'], () => focusNext());
    commandBox.key(['tab'], () => focusNext());
    modelBox.key(['tab'], () => focusNext());

    providerBox.key(['left', 'right', 'up', 'down'], (ch, key) => {
        const dir = key.name === 'left' ? -1 : 1;
        providerIndex = (providerIndex + dir + allowedProviders.length) % allowedProviders.length;
        refreshModels();
    });

    commandBox.key(['left', 'right', 'up', 'down'], (ch, key) => {
        const dir = (key.name === 'left' || key.name === 'down') ? -1 : 1;
        commandIndex = (commandIndex + dir + COMMANDS.length) % COMMANDS.length;
        render();
    });

    modelBox.key(['left', 'right', 'up', 'down'], (ch, key) => {
        const dir = (key.name === 'left' || key.name === 'down') ? -1 : 1;
        modelIndex = (modelIndex + dir + models.length) % models.length;
        render();
    });

    pathInput.key(['enter'], async () => {
        const targetPath = pathInput.getValue().trim() || '.';
        const command = COMMANDS[commandIndex];
        const provider = allowedProviders[providerIndex];
        const model = models[modelIndex];

        screen.leave();
        console.log(`\nRunning ${command} on ${targetPath} [${provider}/${model}]...\n`);
        try {
            await HANDLERS[command](targetPath, provider, model);
        } catch (err) {
            console.error(`Error: ${err.message}`);
        }

        console.log(chalk.gray('\nPress [ENTER] to return to dashboard...'));
        await new Promise((resolve) => {
            process.stdin.once('data', () => resolve());
        });

        screen.enter();
        pathInput.clearValue();
        pathInput.focus();
        pathInput.readInput();
        render();
        screen.render();
    });

    await refreshModels();
    pathInput.focus();
    pathInput.readInput();
    render();
    screen.render();
}
