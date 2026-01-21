
## Folder Code Stats

统计指定文件夹下的文件数和代码行数，并自动生成 Markdown 与 JSON 报告的 VS Code 插件。

仓库地址：<https://github.com/shixindea/folder-code-stats>

---

## 功能介绍

- 递归统计指定文件夹中的所有文件（自动忽略 `node_modules`、`.git`、`.vscode` 等常见目录）
- 统计信息包括：
  - 总文件数
  - 总代码行数
  - 按扩展名统计每种类型文件的文件数与行数
  - 每个文件的相对路径、扩展名、行数
- 在目标文件夹根目录下生成两份报告：
  - `code-stats.json`：完整的统计数据 JSON
  - `code-stats.md`：可阅读的 Markdown 报告，并自动在 VS Code 中打开

---

## 安装

1. 克隆仓库：

```bash
git clone https://github.com/shixindea/folder-code-stats.git
cd folder-code-stats
```

2. 在 VS Code 中打开该文件夹：

```bash
code .
```

3. 安装依赖（如果需要）：

```bash
npm install
```

4. 按下 `F5` 进入 VS Code 扩展开发宿主环境，调试运行插件。

---

## 使用方法

插件提供一个命令：**“统计文件夹文件数和代码行数”**。

- 命令 ID：`fileStats.generateStats`
- 命令分类：`文件统计`

你可以通过以下两种方式调用：

### 1. 在命令面板中使用

1. 按下 `Ctrl+Shift+P`（macOS 为 `Cmd+Shift+P`）打开命令面板。
2. 输入“统计文件夹文件数和代码行数”或英文 ID `fileStats.generateStats`。
3. 回车执行。
4. 如果当前没有工作区或未指定文件夹，插件会弹出文件夹选择对话框。

### 2. 在资源管理器中右键菜单使用

1. 在 VS Code 资源管理器中，找到你想要统计的目标文件夹。
2. 右键点击该文件夹。
3. 选择菜单项：**“统计文件夹文件数和代码行数”**。
4. 插件将以该文件夹为根目录进行统计。

---

## 统计结果说明

在统计完成后，插件会在根目录下生成两个文件：

- `code-stats.json`
- `code-stats.md`

同时会：

- 自动在编辑器中打开 `code-stats.md`
- 在右下角弹出提示信息，例如：

> 统计完成: 文件数 123, 行数 4567

### JSON 结构简要说明

`code-stats.json` 的主要字段如下：

- `root`：统计使用的根目录绝对路径
- `generatedAt`：报告生成时间（ISO 字符串）
- `totalFiles`：总文件数
- `totalLines`：总行数
- `byExtension`：按扩展名的聚合结果，例如：

  - `.js`、`.ts`、`.json`、无扩展名等

- `files`：文件级别的详细列表，包含：

  - `path`：相对于根目录的路径（统一使用 `/` 作为分隔符）
  - `extension`：文件扩展名（无扩展名时为空字符串）
  - `lines`：该文件的行数

### Markdown 报告内容

`code-stats.md` 大致包含以下部分：

- 基本信息：根目录、生成时间
- 汇总信息：总文件数、总行数
- “按扩展名统计”表格
- “详细文件列表”表格

---

## 忽略规则

插件在遍历目录时会自动忽略以下文件夹：

- `node_modules`
- `.git`
- `.vscode`

如果你有更多自定义忽略规则的需求，可以在此基础上自行扩展插件代码。

---

## 开发说明

本插件基于 VS Code 扩展 API 开发，主要入口文件为：

- `extension.js`

核心逻辑包括：

- 目录遍历与文件统计
- 代码行数计算
- JSON 与 Markdown 报告生成
- VS Code 命令注册与 UI 集成（命令面板与资源管理器右键菜单）

如需修改统计逻辑或输出格式，可直接编辑 `extension.js` 中相关函数。

---

## 许可协议

请在 GitHub 仓库中查看实际的 LICENSE 文件；如未提供，可默认视为仅供学习与个人使用。
