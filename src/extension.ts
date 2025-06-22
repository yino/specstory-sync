// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
const minimatch = require('minimatch');

const dirPath = ".specstory"

let fileWatcherDisposable: vscode.Disposable | undefined;
// 发送请求
async function sendApi(gitUserName: string, workspaceName: string, fileName: string, fileContent: string) {
	console.log(`发送请求: ${gitUserName}, ${workspaceName}, ${fileName}, 文件大小：${(fileContent.length / 1024).toFixed(2)}KB`);
}
function setupFileWatcher(context: vscode.ExtensionContext) {
	// Clean up the old watcher if it exists
	if (fileWatcherDisposable) {
		fileWatcherDisposable.dispose();
	}

	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		// If there are no open folders, we can't do anything yet.
		return;
	}

	const dirPath = ".specstory";
	const folderReg = new RegExp(`^${dirPath}/[^\s\.]+\.md$`);  // 使用 dirPath 动态构造正则
	fileWatcherDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
		console.log(`File saved: ${document.fileName}`);
		const currentWorkspaceFolders = vscode.workspace.workspaceFolders;
		if (!currentWorkspaceFolders || currentWorkspaceFolders.length === 0) {
			console.log('No open folders, ignoring file save event.');
			return;
		}
		const currentRootPath = currentWorkspaceFolders[0].uri.fsPath;
		const relativePath = path.relative(currentRootPath, document.fileName);
		console.log(`Relative path: ${relativePath}`);
		// 字符串是否匹配正则表达式			
		const isMatch: boolean = folderReg.test(relativePath); // true

		if (isMatch) {
			// 获取当前空间的名称
			const workspaceName = currentWorkspaceFolders[0].name;
			console.log(`Workspace name: ${workspaceName}`);
			// 获取 git的username
			let gitUserName = vscode.workspace.getConfiguration('git').get('user.name') || "";
			console.log(`Git username: ${gitUserName}`);
			const gitUserNameStr: string = gitUserName as string;
			// 在此处添加自定义逻辑（如触发编译、格式化等）
			sendApi(gitUserNameStr, workspaceName, relativePath, document.getText())
		}
	});

	context.subscriptions.push(fileWatcherDisposable);
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	setupFileWatcher(context);

	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(() => {
			console.log('Workspace folders changed, re-evaluating file watcher.');
			setupFileWatcher(context);
		})
	);

	if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
		vscode.window.showWarningMessage('请打开一个文件夹, specstory-sync 才能开始监听文件。');
	}
}
export function deactivate() { }
