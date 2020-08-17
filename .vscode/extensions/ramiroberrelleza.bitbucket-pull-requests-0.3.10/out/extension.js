'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const bitbucket = require("./bitbucket");
const platform = require("./platform");
const cp = require("child_process");
const path_1 = require("path");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Congratulations, your extension "bitbucket-pull-requests" is now active!');
    let createPullRequest = vscode.commands.registerCommand('extension.createPullRequest', () => {
        let repoPath;
        const currentEditor = vscode.window.activeTextEditor;
        if (currentEditor) {
            repoPath = path_1.dirname(currentEditor.document.uri.fsPath);
        }
        else {
            const folders = vscode.workspace.workspaceFolders;
            if (!folders) {
                vscode.window.showErrorMessage(`This extension only works within git folders.`);
                return;
            }
            repoPath = folders[0].uri.fsPath;
        }
        const bb = new bitbucket.Bitbucket(repoPath);
        const result = bb.GetPullRequestURL();
        result.then((url) => {
            const command = platform.getRunCommand(url);
            console.log(`running ${command}`);
            cp.exec(`${command}`).on('error', (err) => {
                vscode.window.showErrorMessage(`Couldn't open a browser window. Make sure you have a browser installed. ${err}`);
            });
        }).catch((reason) => {
            vscode.window.showErrorMessage(`Couldn't start your pr: ${reason}`);
        });
    });
    context.subscriptions.push(createPullRequest);
    let setBitbucketURL = vscode.commands.registerCommand('extension.setBitbucketURL', () => {
        bitbucket.Bitbucket.GetBitbucketURL().then((url) => {
            if (url) {
                bitbucket.Bitbucket.SaveConfiguredURL(url)
                    .then(() => {
                    vscode.window.showInformationMessage("Bitbucket Server URL configured");
                })
                    .catch((reason) => {
                    vscode.window.showErrorMessage(reason);
                });
            }
        }).catch((reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(setBitbucketURL);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map