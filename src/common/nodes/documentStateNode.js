import { fileExists, readExistingFile } from '../../core/fileSystem.js';

export function createDocumentStateNode(fileName) {
    return async function documentStateNode(state, config) {
        const projectRoot = config.configurable.targetPath;
        const outputDir = config.configurable.outputDir ?? 'Review';
        const exists = fileExists(projectRoot, outputDir, fileName);

        if (!exists) {
            return {
                existingDocument: null,
                documentMode: 'generate'
            };
        }
        return {
            existingDocument: readExistingFile(projectRoot, outputDir, fileName),
            documentMode: 'update'
        };
    };
}
