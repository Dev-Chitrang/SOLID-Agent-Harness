import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
import { readRepositoryFiles, writeReportFile, writeReportFileDiffAware, readReportFile } from '../../src/core/fileSystem.js';

// Uses real fs against a temp directory — no mocking needed for integration-style tests
let tmpDir;

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-test-'));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('readRepositoryFiles()', () => {
    it('reads a single JS file from a directory', () => {
        fs.writeFileSync(path.join(tmpDir, 'index.js'), 'const x = 1;', 'utf8');
        const result = readRepositoryFiles(tmpDir);

        expect(result).toHaveLength(1);
        expect(result[0].relativePath).toBe('index.js');
        expect(result[0].content).toBe('const x = 1;');
    });

    it('reads multiple supported file types', () => {
        fs.writeFileSync(path.join(tmpDir, 'app.ts'), 'export {}', 'utf8');
        fs.writeFileSync(path.join(tmpDir, 'style.css'), 'body {}', 'utf8');
        fs.writeFileSync(path.join(tmpDir, 'main.py'), 'pass', 'utf8');
        const result = readRepositoryFiles(tmpDir);

        expect(result).toHaveLength(3);
    });

    it('ignores files with unsupported extensions', () => {
        fs.writeFileSync(path.join(tmpDir, 'notes.txt'), 'hello', 'utf8');
        fs.writeFileSync(path.join(tmpDir, 'data.json'), '{}', 'utf8');
        fs.writeFileSync(path.join(tmpDir, 'main.js'), 'const a = 1;', 'utf8');
        const result = readRepositoryFiles(tmpDir);

        expect(result).toHaveLength(1);
        expect(result[0].relativePath).toBe('main.js');
    });

    it('traverses nested subdirectories', () => {
        const subDir = path.join(tmpDir, 'src', 'utils');
        fs.mkdirSync(subDir, { recursive: true });
        fs.writeFileSync(path.join(subDir, 'helper.js'), 'export function help() {}', 'utf8');
        const result = readRepositoryFiles(tmpDir);

        expect(result).toHaveLength(1);
        expect(result[0].relativePath).toContain('helper.js');
    });

    it('respects .gitignore and excludes listed directories', () => {
        fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules\n', 'utf8');
        const nmDir = path.join(tmpDir, 'node_modules');
        fs.mkdirSync(nmDir);
        fs.writeFileSync(path.join(nmDir, 'lib.js'), 'module.exports = {}', 'utf8');
        fs.writeFileSync(path.join(tmpDir, 'app.js'), 'const a = 1;', 'utf8');
        const result = readRepositoryFiles(tmpDir);

        expect(result).toHaveLength(1);
        expect(result[0].relativePath).toBe('app.js');
    });

    it('returns a single-element array when given a file path directly', () => {
        const filePath = path.join(tmpDir, 'single.js');
        fs.writeFileSync(filePath, 'const z = 99;', 'utf8');
        const result = readRepositoryFiles(filePath);

        expect(result).toHaveLength(1);
        expect(result[0].relativePath).toBe('single.js');
        expect(result[0].content).toBe('const z = 99;');
    });

    it('returns an empty array for a directory with no supported files', () => {
        fs.writeFileSync(path.join(tmpDir, 'readme.txt'), 'hello', 'utf8');
        const result = readRepositoryFiles(tmpDir);

        expect(result).toHaveLength(0);
    });
});

describe('writeReportFile()', () => {
    it('creates the output directory if it does not exist', () => {
        const outputDir = 'GeneratedReports';
        writeReportFile(tmpDir, outputDir, 'TEST.md', '# Test');

        const targetDir = path.join(tmpDir, outputDir);
        expect(fs.existsSync(targetDir)).toBe(true);
    });

    it('writes the correct content to the target file', () => {
        const content = '# SOLID Audit Report\n\nAll good.';
        writeReportFile(tmpDir, 'Review', 'SOLID_AUDIT.md', content);

        const written = fs.readFileSync(path.join(tmpDir, 'Review', 'SOLID_AUDIT.md'), 'utf8');
        expect(written).toBe(content);
    });

    it('overwrites an existing file with new content', () => {
        const outputDir = path.join(tmpDir, 'Review');
        fs.mkdirSync(outputDir);
        fs.writeFileSync(path.join(outputDir, 'OUT.md'), 'old content', 'utf8');
        writeReportFile(tmpDir, 'Review', 'OUT.md', 'new content');

        const written = fs.readFileSync(path.join(outputDir, 'OUT.md'), 'utf8');
        expect(written).toBe('new content');
    });

    it('writes the file to the correct nested path', () => {
        writeReportFile(tmpDir, 'Reports/Sub', 'BUGS.md', '# Bugs');

        const filePath = path.join(tmpDir, 'Reports', 'Sub', 'BUGS.md');
        expect(fs.existsSync(filePath)).toBe(true);
    });
});

describe('readReportFile()', () => {
    it('returns null when the file does not exist', () => {
        const result = readReportFile(tmpDir, 'Review', 'NONEXISTENT.md');
        expect(result).toBeNull();
    });

    it('returns file contents when the file exists', () => {
        writeReportFile(tmpDir, 'Review', 'SOLID_AUDIT.md', '# Audit Report');
        const result = readReportFile(tmpDir, 'Review', 'SOLID_AUDIT.md');
        expect(result).toBe('# Audit Report');
    });

    it('returns correct content for nested output dirs', () => {
        writeReportFile(tmpDir, 'Reports/Sub', 'BUG_REPORT.md', '# Bugs Here');
        const result = readReportFile(tmpDir, 'Reports/Sub', 'BUG_REPORT.md');
        expect(result).toBe('# Bugs Here');
    });
});

describe('writeReportFileDiffAware()', () => {
    it('creates the file and returns true when file does not exist', () => {
        const written = writeReportFileDiffAware(tmpDir, 'Review', 'QUALITY_REPORT.md', '# Quality');

        expect(written).toBe(true);
        const content = fs.readFileSync(path.join(tmpDir, 'Review', 'QUALITY_REPORT.md'), 'utf8');
        expect(content).toBe('# Quality');
    });

    it('returns false and does not rewrite when content is identical', () => {
        writeReportFileDiffAware(tmpDir, 'Review', 'QUALITY_REPORT.md', '# Quality');
        const mtime1 = fs.statSync(path.join(tmpDir, 'Review', 'QUALITY_REPORT.md')).mtimeMs;

        // Small delay to ensure mtime would differ if a write occurred
        const written = writeReportFileDiffAware(tmpDir, 'Review', 'QUALITY_REPORT.md', '# Quality');

        const mtime2 = fs.statSync(path.join(tmpDir, 'Review', 'QUALITY_REPORT.md')).mtimeMs;
        expect(written).toBe(false);
        expect(mtime2).toBe(mtime1);
    });

    it('overwrites and returns true when content has changed', () => {
        writeReportFileDiffAware(tmpDir, 'Review', 'QUALITY_REPORT.md', '# Old');
        const written = writeReportFileDiffAware(tmpDir, 'Review', 'QUALITY_REPORT.md', '# New');

        expect(written).toBe(true);
        const content = fs.readFileSync(path.join(tmpDir, 'Review', 'QUALITY_REPORT.md'), 'utf8');
        expect(content).toBe('# New');
    });

    it('creates output directory if it does not exist', () => {
        writeReportFileDiffAware(tmpDir, 'NewDir', 'QUALITY_REPORT.md', '# Q');

        expect(fs.existsSync(path.join(tmpDir, 'NewDir'))).toBe(true);
    });

    it('resolves path relative to projectRoot, not cwd', () => {
        writeReportFileDiffAware(tmpDir, 'Review', 'QUALITY_REPORT.md', '# Q');

        const expectedPath = path.join(tmpDir, 'Review', 'QUALITY_REPORT.md');
        expect(fs.existsSync(expectedPath)).toBe(true);
    });
});
