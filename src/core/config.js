import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

export class ConfigManager {
    constructor() {
        this.configDir = path.join(os.homedir(), '.code-agent');
        this.configPath = path.join(this.configDir, 'config.json');
        this.defaultConfig = {
            defaultProvider: 'openai',
            outputDir: 'Review',
            providers: {}
        };
    }

    load() {
        if (!fs.existsSync(this.configPath)) return this.defaultConfig;
        try {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf8'))
        }
        catch {
            return this.defaultConfig;
        }
    }

    save(configData) {
        if (!fs.existsSync(this.configDir)) fs.mkdirSync(this.configDir, { recursive: true });
        fs.writeFileSync(this.configPath, JSON.stringify(configData, null, 2), 'utf8');
    }

    getProviderConfig(providerName) {
        const config = this.load();
        return config.providers[providerName?.toLowerCase()] || null;
    }
}
