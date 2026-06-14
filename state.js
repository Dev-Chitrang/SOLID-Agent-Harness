import { Annotation } from "@langchain/langgraph";
import * as fs from "fs";
import * as path from "path";
import ignore from "ignore";

export const AnalyzerState = Annotation.Root({
  projectPath: Annotation({ reducer: (x, y) => y ?? x }),
  sourceCodeFiles: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  solidAuditReport: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  bugReport: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  architectureDoc: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  readmeDoc: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
});

function getFileFilter(projectPath) {
  const ig = ignore();
  const gitignorePath = path.join(projectPath, ".gitignore");

  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    ig.add(gitignoreContent);
  } else {
    ig.add(["node_modules", "node_modules/**", ".venv", ".venv/**", ".env", ".github/**", "dist/**", "build/**", ".git/**"]);
  }
  return ig;
}

export function readProjectFiles(dirPath, basePatch = dirPath, filterRule = null) {
  let results = [];
  try {
    if (!filterRule) filterRule = getFileFilter(basePatch);

    const list = fs.readdirSync(dirPath);
    const validExtensions = [".js", ".ts", ".py", ".go", ".java"];

    list.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      const relativeToRoot = path.relative(basePatch, fullPath);
      const stat = fs.statSync(fullPath);

      if (stat && stat.isDirectory()) {
        if (relativeToRoot && filterRule.ignores(relativeToRoot + "/")) return;
        results = results.concat(readProjectFiles(fullPath, basePatch, filterRule));
      } else if (stat && stat.isFile()) {
        if (relativeToRoot && filterRule.ignores(relativeToRoot)) return;

        if (validExtensions.some(ext => file.endsWith(ext))) {
          const content = fs.readFileSync(fullPath, "utf-8");
          results.push({ relativePath: relativeToRoot, content });
        }
      }
    });
  } catch (error) {
    throw new Error(`[FileSystem Error] Failed parsing directory layer at ${dirPath}: ${error.message}`);
  }
  return results;
}
