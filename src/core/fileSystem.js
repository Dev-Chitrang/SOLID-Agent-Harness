import * as fs from 'fs';
import * as path from 'path';
import ignore from 'ignore';

export function readRepositoryFiles(targetPath) {
    const absoluteRoot = path.resolve(targetPath);
    const ig = ignore();
    const gitignorePath = path.join(absoluteRoot, '.gitignore');

    if (fs.existsSync(gitignorePath)) {
        ig.add(fs.readFileSync(gitignorePath, 'utf8'));
    }
    else {
        ig.add(['node_modules', '.gitignore', 'dist', 'build', '.venv', 'venv', '.env', '.github']);
    }

    const ValidExtensions = ['.py', '.js', '.ts', '.go', '.java', '.css', '.html', '.jsx', '.tsx', '.rs']
    const filesCollected = []

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const relativePath = path.relative(absoluteRoot, fullPath);

            if (relativePath && ig.ignores(statSyncIsDirectory(fullPath) ? `${relativePath}/` : relativePath)) {
                continue;
            }
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                traverse(fullPath)
            }
            else if (stat.isFile() && ValidExtensions.some(ext => item.endsWith(ext))) {
                filesCollected.push({
                    relativePath,
                    content: fs.readFileSync(fullPath, 'utf8')
                })
            }
        }
    }

    function statSyncIsDirectory(p) {
        try { return fs.statSync(p).isDirectory(); } catch { return false; }
    }
    if (fs.statSync(absoluteRoot).isFile()) {
        return [{ relativePath: path.basename(absoluteRoot), content: fs.readFileSync(absoluteRoot, 'utf8') }]
    }
    traverse(absoluteRoot);
    return filesCollected;
}

export function writeReportFile(projectRoot, outputDir, fileName, markdownContent) {
    const targetDir = path.resolve(projectRoot, outputDir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, fileName), markdownContent, 'utf8')
}
