'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const core_1 = require("@salesforce/core");
const path = require("path");
const salesforceTextDocumentProvider_1 = require("./salesforceTextDocumentProvider");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.workspace.registerTextDocumentContentProvider('salesforce', new salesforceTextDocumentProvider_1.SalesforceTextDocumentProvider(vscode.window.createOutputChannel('salesforce-diff'), context.storagePath));
        // The command has been defined in the package.json file
        // Now provide the implementation of the command with  registerCommand
        // The commandId parameter must match the command field in package.json
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.diffSelectOrg', (textEditor) => __awaiter(this, void 0, void 0, function* () {
            let user = yield getOrgSelection();
            openDiff(textEditor, user);
        })));
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.diffDefaultOrg', (textEditor) => __awaiter(this, void 0, void 0, function* () {
            let user = yield getDefaultUser();
            openDiff(textEditor, user);
        })));
        const openDiff = (textEditor, user) => __awaiter(this, void 0, void 0, function* () {
            let fileName = path.basename(textEditor.document.uri.fsPath, '.cls');
            yield vscode.commands.executeCommand('vscode.diff', textEditor.document.uri, vscode.Uri.parse(`salesforce://${textEditor.document.uri.fsPath}#${user}`), `${fileName}: Local <-> ${user}`);
        });
        const getOrgSelection = () => __awaiter(this, void 0, void 0, function* () {
            let aliases = yield core_1.Aliases.create({});
            let orgs = aliases.getGroup('orgs');
            let user = yield vscode.window.showQuickPick(Object.values(orgs));
            return user;
        });
        const getDefaultUser = () => __awaiter(this, void 0, void 0, function* () {
            let dir = __dirname;
            try {
                process.chdir(vscode.workspace.rootPath);
                let org = yield core_1.Org.create({});
                return org.getUsername();
            }
            catch (e) { }
            finally {
                process.chdir(dir);
            }
        });
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    //todo: clean up temp files
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map