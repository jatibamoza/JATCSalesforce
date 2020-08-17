"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const execa = require("execa");
const vscode = require("vscode");
const url_1 = require("url");
const gitUrlParse = require("git-url-parse");
const bitbucketURL = "https://bitbucket.org";
const extensionName = "bitbucket-pull-requests";
class Bitbucket {
    constructor(root) {
        this.root = root;
    }
    static getActiveWorkspaceFolder() {
        if (!vscode.workspace.workspaceFolders) {
            // no workspace open
            return undefined;
        }
        if (vscode.workspace.workspaceFolders.length === 1) {
            // just one workspace open
            return vscode.workspace.workspaceFolders[0].uri;
        }
        // check which workspace status should be visible
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return undefined;
        }
        const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        if (!folder) {
            return undefined;
        }
        return folder.uri;
    }
    static SaveConfiguredURL(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = this.getActiveWorkspaceFolder();
            const workspaceConfiguration = vscode.workspace.getConfiguration(undefined, uri);
            workspaceConfiguration.update(`${extensionName}.serverURL`, url, false);
            return;
        });
    }
    static getConfiguredURL() {
        const uri = this.getActiveWorkspaceFolder();
        if (!uri) {
            return bitbucketURL;
        }
        const configuration = vscode.workspace.getConfiguration(undefined, uri).get(`${extensionName}.serverURL`);
        if (!configuration) {
            return bitbucketURL;
        }
        const url = configuration || bitbucketURL;
        return url;
    }
    static GetBitbucketURL() {
        return __awaiter(this, void 0, void 0, function* () {
            const placeHolder = this.getConfiguredURL();
            const urlInput = yield vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: placeHolder
            });
            if (urlInput) {
                try {
                    const u = new url_1.URL(urlInput);
                    return u.toString();
                }
                catch (e) {
                    throw new Error(`'${urlInput}' is not a valid URL`);
                }
            }
            return "";
        });
    }
    GetPullRequestURL() {
        return __awaiter(this, void 0, void 0, function* () {
            const isAvailable = yield this.checkExistence();
            if (!isAvailable) {
                throw new Error(`No git executable found. Please install git`);
            }
            const { branch, remote } = yield this.getBranchAndRemote();
            const { owner, repo } = yield this.getOwnerAndRepo(remote);
            const url = Bitbucket.getConfiguredURL();
            const encodedBranch = encodeURIComponent(branch);
            if (url === bitbucketURL) {
                return `${url}/${owner}/${repo}/pull-requests/new?source=${encodedBranch}&t=1`;
            }
            else {
                // bitbucket server
                // This is to work around https://github.com/IonicaBizau/git-url-parse/issues/97
                const o = owner.replace('scm/', '');
                return `${url}/projects/${o}/repos/${repo}/pull-requests?create&sourceBranch=${encodedBranch}&t=1`;
            }
        });
    }
    getBranchAndRemote() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { stdout } = yield this.execute(`git rev-parse --abbrev-ref --symbolic-full-name @{u}`);
                console.log(`branch/remote:  ${stdout.trim()}`);
                const index = stdout.trim().indexOf("/");
                const remote = stdout.substr(0, index);
                const branch = stdout.substr(index + 1);
                return { branch: branch, remote: remote };
            }
            catch (e) {
                if (e.message.includes("Not a git repository")) {
                    throw new Error(`Your current workspace is not a git repository. If your workspace contains more than one repo, call the command from an opened file.`);
                }
                else if (e.message.includes("no upstream configured for branch")) {
                    throw new Error(`This branch doesn't have a remote configured.`);
                }
                throw e;
            }
        });
    }
    getOwnerAndRepo(remote) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout } = yield this.execute(`git remote get-url ${remote}`);
            console.log(`remote url:  ${stdout.trim()}`);
            const parsed = gitUrlParse(stdout.trim());
            return { owner: parsed.owner, repo: parsed.name };
        });
    }
    execute(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const [git, ...args] = cmd.split(' ');
            return execa(git || git, args, { cwd: this.root });
        });
    }
    checkExistence() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.execute('git --version');
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
}
exports.Bitbucket = Bitbucket;
//# sourceMappingURL=bitbucket.js.map