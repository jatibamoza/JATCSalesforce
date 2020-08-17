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
const vscode_1 = require("vscode");
const core = require("@salesforce/core");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path = require("path");
const rimraf = require("rimraf");
class SalesforceTextDocumentProvider {
    constructor(output, storagePath) {
        this.output = output;
        this.storagePath = storagePath;
    }
    provideTextDocumentContent(uri, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = uri.fragment;
            this.output.appendLine(`Running diff against ${user}`);
            if (path.extname(uri.fsPath) === '.cls') {
                return this.provideApexContent(uri, user, token);
            }
            else {
                return this.providerOtherContent(uri, user, token);
            }
        });
    }
    /**
     * Provider for Apex only...
     * Will likely depreciate once other provider is proven stable.
     *
     * @param {vscode.Uri} uri
     * @param {vscode.CancellationToken} token
     * @returns
     */
    provideApexContent(uri, user, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let conn = yield core.Connection.create({
                        authInfo: yield core.AuthInfo.create({ username: user })
                    });
                    let qry = `SELECT Name, Body FROM ApexClass WHERE Name = '${path.basename(uri.fsPath, '.cls')}' LIMIT 1`;
                    this.output.appendLine(`Retrieving source: ${qry}`);
                    let result = yield conn.tooling.query(qry);
                    if (result.done && result.records) {
                        if (result.records.length) {
                            return resolve(result.records[0].Body);
                        }
                        else {
                            return resolve('');
                        }
                    }
                    throw new Error('Failed to Retrieve Source');
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    /**
     * Provider using force:source:retrieve
     *
     * @param {vscode.Uri} uri
     * @param {vscode.CancellationToken} token
     * @returns
     */
    providerOtherContent(uri, user, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let dir = __dirname;
                try {
                    let tmpDir = this.getTempPath(path.dirname(uri.path));
                    let tmpFile = this.getTempPath(uri.path);
                    let workspaceTmp = this.getTempPath(vscode_1.workspace.rootPath);
                    //kinda scary
                    yield new Promise((resolve, reject) => {
                        rimraf(workspaceTmp, (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve();
                            }
                        });
                    });
                    yield core.fs.mkdirp(tmpDir);
                    yield fs_1.promises.copyFile(path.join(vscode_1.workspace.rootPath, 'sfdx-project.json'), path.join(workspaceTmp, 'sfdx-project.json'));
                    yield fs_1.promises.writeFile(tmpFile, '<?xml version="1.0" ?>');
                    // await fsPromise.copyFile(uri.fsPath, tmpFile);
                    let ogStat = yield fs_1.promises.stat(tmpFile);
                    let retrieveCmd = `sfdx force:source:retrieve -p "${tmpFile}" -u ${user}`;
                    process.chdir(tmpDir);
                    this.output.appendLine(`Retrieving source: ${retrieveCmd}`);
                    yield new Promise((resolve, reject) => {
                        child_process_1.exec(retrieveCmd, (err, stdout, stderr) => {
                            if (err) {
                                this.output.appendLine(stderr);
                                reject(new Error('Failed to pull source from org!'));
                            }
                            this.output.appendLine(stdout);
                            resolve();
                        });
                    });
                    try {
                        let resultFile = yield this.getResultPath(tmpFile);
                        let data = yield fs_1.promises.readFile(resultFile, "utf8");
                        if (resultFile === tmpFile) {
                            // let newStat = await fsPromise.stat(tmpFile);
                            // if(ogStat.mtimeMs === newStat.mtimeMs){ //file wasn't updated
                            if (data === '<?xml version="1.0" ?>') {
                                resolve('');
                            }
                            // }
                        }
                        return resolve(data);
                    }
                    catch (e) {
                        throw new Error('Could not find source file in org!');
                    }
                }
                catch (e) {
                    reject(e);
                }
                finally {
                    process.chdir(dir);
                }
            }));
        });
    }
    /*** PATH HELPERS ***/
    getTempPath(p) {
        return path.join(this.storagePath, p);
    }
    //ugh: hack due to https://github.com/forcedotcom/cli/issues/97 
    getResultPath(tmpFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let relPath = tmpFile.replace(path.join(this.getTempPath(vscode_1.workspace.rootPath)), '');
            let project = yield core.SfdxProject.resolve();
            let projectJson = yield project.resolveProjectConfig();
            let defaultPackageDir = projectJson['packageDirectories'].find(item => item.default);
            if (relPath.startsWith(path.sep + defaultPackageDir.path)) {
                relPath = relPath.replace(path.sep + defaultPackageDir.path, '');
            }
            if (!relPath.startsWith(path.sep + path.join('main', 'default'))) {
                relPath = path.join('main', 'default', relPath);
            }
            return path.join(this.getTempPath(vscode_1.workspace.rootPath), defaultPackageDir.path, relPath);
        });
    }
}
exports.SalesforceTextDocumentProvider = SalesforceTextDocumentProvider;
//# sourceMappingURL=salesforceTextDocumentProvider.js.map