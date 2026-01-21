const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function isIgnoredDir(name) {
  return name === "node_modules" || name === ".git" || name === ".vscode";
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.length === 0) {
      return 0;
    }
    const lines = content.split(/\r?\n/);
    return lines.length;
  } catch (e) {
    return 0;
  }
}

function collectStats(rootDir) {
  const files = [];
  const byExtension = {};
  let totalFiles = 0;
  let totalLines = 0;

  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!isIgnoredDir(entry.name)) {
          stack.push(fullPath);
        }
      } else if (entry.isFile()) {
        totalFiles += 1;
        const lineCount = analyzeFile(fullPath);
        totalLines += lineCount;
        const ext = path.extname(entry.name) || "";
        if (!byExtension[ext]) {
          byExtension[ext] = { files: 0, lines: 0 };
        }
        byExtension[ext].files += 1;
        byExtension[ext].lines += lineCount;
        const relativePath = path
          .relative(rootDir, fullPath)
          .split(path.sep)
          .join("/");
        files.push({
          path: relativePath,
          extension: ext,
          lines: lineCount
        });
      }
    }
  }

  return {
    root: rootDir,
    generatedAt: new Date().toISOString(),
    totalFiles,
    totalLines,
    byExtension,
    files
  };
}

function buildMarkdownReport(stats) {
  const lines = [];
  lines.push("# 代码统计报告");
  lines.push("");
  lines.push(`- 根目录: ${stats.root}`);
  lines.push(`- 生成时间: ${stats.generatedAt}`);
  lines.push("");
  lines.push(`- 总文件数: ${stats.totalFiles}`);
  lines.push(`- 总行数: ${stats.totalLines}`);
  lines.push("");
  lines.push("## 按扩展名统计");
  lines.push("");
  lines.push("| 扩展名 | 文件数 | 行数 |");
  lines.push("| --- | --- | --- |");
  const exts = Object.keys(stats.byExtension).sort();
  for (const ext of exts) {
    const info = stats.byExtension[ext];
    const name = ext === "" ? "(无扩展名)" : ext;
    lines.push(`| ${name} | ${info.files} | ${info.lines} |`);
  }
  lines.push("");
  lines.push("## 详细文件列表");
  lines.push("");
  lines.push("| 相对路径 | 扩展名 | 行数 |");
  lines.push("| --- | --- | --- |");
  for (const file of stats.files.sort((a, b) => a.path.localeCompare(b.path))) {
    const name = file.extension === "" ? "(无扩展名)" : file.extension;
    lines.push(`| ${file.path} | ${name} | ${file.lines} |`);
  }
  lines.push("");
  return lines.join("\n");
}

async function pickFolder(initialUri) {
  if (initialUri && initialUri.fsPath) {
    const stat = fs.statSync(initialUri.fsPath);
    if (stat.isDirectory()) {
      return initialUri.fsPath;
    }
    const dir = path.dirname(initialUri.fsPath);
    return dir;
  }
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    const uri = folders[0].uri;
    return uri.fsPath;
  }
  const result = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "选择要统计的文件夹"
  });
  if (!result || result.length === 0) {
    return undefined;
  }
  return result[0].fsPath;
}

async function generateStats(targetUri) {
  const rootDir = await pickFolder(targetUri);
  if (!rootDir) {
    vscode.window.showWarningMessage("未选择任何文件夹");
    return;
  }
  try {
    const stats = collectStats(rootDir);
    const jsonPath = path.join(rootDir, "code-stats.json");
    const mdPath = path.join(rootDir, "code-stats.md");
    fs.writeFileSync(jsonPath, JSON.stringify(stats, null, 2), "utf8");
    const mdContent = buildMarkdownReport(stats);
    fs.writeFileSync(mdPath, mdContent, "utf8");
    const doc = await vscode.workspace.openTextDocument(mdPath);
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(
      `统计完成: 文件数 ${stats.totalFiles}, 行数 ${stats.totalLines}`
    );
  } catch (e) {
    vscode.window.showErrorMessage("统计失败: " + e.message);
  }
}

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    "fileStats.generateStats",
    generateStats
  );
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};

