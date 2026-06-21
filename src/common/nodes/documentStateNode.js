import { fileExists, readExistingFile } from '../../core/fileSystem.js'

export function createDocumentStateNode(outputDir, fileName) {
    return async function documentStateNode(state, config) {
        const projectRoot = config.configurable.targetPath
        const exists = fileExists(projectRoot, outputDir, fileName)

        if (!exists) {
            return {
                existingDocument: null,
                documentMode: "generate"
            }
        }
        return {
            existingDocument: readExistingFile(
                projectRoot, outputDir, fileName
            ),
            documentMode: "update"
        }
    }
}
