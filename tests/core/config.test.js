import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

// We mock the fs module so tests never touch the real filesystem
vi.mock('fs');

import { ConfigManager } from '../../src/core/config.js';

const EXPECTED_CONFIG_DIR = path.join(os.homedir(), '.code-agent');
const EXPECTED_CONFIG_PATH = path.join(EXPECTED_CONFIG_DIR, 'config.json');

const sampleConfig = {
    defaultProvider: 'anthropic',
    outputDir: 'Output',
    providers: {
        anthropic: { apiKey: 'sk-ant-test' },
        openai: { apiKey: 'sk-openai-test' }
    }
};

describe('ConfigManager', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('load()', () => {
        it('returns default config when config file does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            const manager = new ConfigManager();
            const config = manager.load();

            expect(config.defaultProvider).toBe('openai');
            expect(config.outputDir).toBe('Review');
            expect(config.providers).toEqual({});
        });

        it('returns parsed config when file exists and is valid JSON', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(sampleConfig));
            const manager = new ConfigManager();
            const config = manager.load();

            expect(config.defaultProvider).toBe('anthropic');
            expect(config.providers.anthropic.apiKey).toBe('sk-ant-test');
        });

        it('returns default config when file exists but contains invalid JSON', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue('{ broken json :::');
            const manager = new ConfigManager();
            const config = manager.load();

            expect(config.defaultProvider).toBe('openai');
            expect(config.providers).toEqual({});
        });

        it('returns default config when file read throws an unexpected error', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockImplementation(() => { throw new Error('EACCES: permission denied'); });
            const manager = new ConfigManager();
            const config = manager.load();

            expect(config.defaultProvider).toBe('openai');
        });

        it('supports multiple providers in loaded config', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(sampleConfig));
            const manager = new ConfigManager();
            const config = manager.load();

            expect(Object.keys(config.providers)).toHaveLength(2);
            expect(config.providers.openai.apiKey).toBe('sk-openai-test');
        });
    });

    describe('save()', () => {
        it('creates config directory if it does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            fs.mkdirSync.mockImplementation(() => { });
            fs.writeFileSync.mockImplementation(() => { });
            const manager = new ConfigManager();
            manager.save(sampleConfig);

            expect(fs.mkdirSync).toHaveBeenCalledWith(EXPECTED_CONFIG_DIR, { recursive: true });
        });

        it('skips directory creation when directory already exists', () => {
            fs.existsSync.mockReturnValue(true);
            fs.writeFileSync.mockImplementation(() => { });
            const manager = new ConfigManager();
            manager.save(sampleConfig);

            expect(fs.mkdirSync).not.toHaveBeenCalled();
        });

        it('writes config as formatted JSON to the correct path', () => {
            fs.existsSync.mockReturnValue(true);
            fs.writeFileSync.mockImplementation(() => { });
            const manager = new ConfigManager();
            manager.save(sampleConfig);

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                EXPECTED_CONFIG_PATH,
                JSON.stringify(sampleConfig, null, 2),
                'utf8'
            );
        });
    });

    describe('getProviderConfig()', () => {
        it('returns provider config for a known provider', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(sampleConfig));
            const manager = new ConfigManager();
            const result = manager.getProviderConfig('anthropic');

            expect(result).toEqual({ apiKey: 'sk-ant-test' });
        });

        it('returns null for an unknown provider', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(sampleConfig));
            const manager = new ConfigManager();
            const result = manager.getProviderConfig('nvidia');

            expect(result).toBeNull();
        });

        it('is case-insensitive — normalises provider name to lowercase', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(sampleConfig));
            const manager = new ConfigManager();
            const result = manager.getProviderConfig('ANTHROPIC');

            expect(result).toEqual({ apiKey: 'sk-ant-test' });
        });

        it('returns null when providerName is undefined', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(sampleConfig));
            const manager = new ConfigManager();
            const result = manager.getProviderConfig(undefined);

            expect(result).toBeNull();
        });
    });
});
