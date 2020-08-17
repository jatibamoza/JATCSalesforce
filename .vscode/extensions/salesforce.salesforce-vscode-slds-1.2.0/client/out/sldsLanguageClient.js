/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const net = __importStar(require("net"));
const child_process = __importStar(require("child_process"));
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const stream_1 = require("stream");
const DEBUG = (typeof v8debug === 'object') || startedInDebugMode();
const documentSelector = [
    { scheme: 'file', language: 'css' },
    { scheme: 'file', language: 'html' },
    { scheme: 'file', language: 'javascript' }
];
function startedInDebugMode() {
    let args = process.execArgv;
    if (args) {
        return args.some((arg) => /^--debug=?/.test(arg) || /^--debug-brk=?/.test(arg) || /^--inspect-brk=?/.test(arg));
    }
    return false;
}
// MIT Licensed code from: https://github.com/georgewfraser/vscode-javac
function findJavaExecutable(binname) {
    binname = correctBinname(binname);
    // First search if they have an existing java.home Apex setting
    let javaApexConfig = readJavaConfig();
    if (javaApexConfig) {
        const binpath = findBinPath(javaApexConfig, binname);
        if (binpath)
            return binpath;
    }
    // Then search each JAVA_HOME bin folder
    if (process.env['JAVA_HOME']) {
        const binpath = findBinPath(process.env['JAVA_HOME'], binname);
        if (binpath)
            return binpath;
    }
    // Then search each JDK_HOME bin folder
    if (process.env['JDK_HOME']) {
        const binpath = findBinPath(process.env['JDK_HOME'], binname);
        if (binpath)
            return binpath;
    }
    // Else return the binary name directly (this will likely always fail downstream)
    return null;
}
function findBinPath(config, binname) {
    let workspaces = config.split(path.delimiter);
    for (let i = 0; i < workspaces.length; i++) {
        let binpath = path.join(workspaces[i], 'bin', binname);
        if (fs.existsSync(binpath)) {
            return binpath;
        }
    }
    return null;
}
function readJavaConfig() {
    const config = vscode_1.workspace.getConfiguration();
    // console.log(config.get<string>('salesforcedx-vscode-slds.java.home', ''));
    return config.get('salesforcedx-vscode-apex.java.home', '');
}
function correctBinname(binname) {
    if (process.platform === 'win32')
        return binname + '.exe';
    else
        return binname;
}
function createServerOptions(context, outputChannel) {
    return createServerPromise.bind(this, context, outputChannel);
}
function createServerPromise(context, outputChannel) {
    return new Promise((resolve, reject) => {
        var server = net.createServer((socket) => {
            outputChannel.appendLine("SLDS Started");
            const matcher = /("character":1.7976931348623157e\+308)/;
            const javaMaxIntValue = 2147483647;
            const replacer = '"character":' + javaMaxIntValue + '}}';
            // Temporary solution for an LWC plugin issue where the end character range is too large for SLDS LSP server.
            let filteredDuplex = new class extends stream_1.Transform {
                _transform(chunk, encoding, callback) {
                    let buf = Buffer.from(chunk).toString();
                    buf = buf.replace(matcher, replacer);
                    chunk = Buffer.from(buf);
                    this.push(chunk, encoding);
                    callback();
                }
            }();
            filteredDuplex.pipe(socket);
            resolve({
                reader: socket,
                writer: filteredDuplex
            });
        })
            .on('end', () => console.log("Disconnected"))
            .on('error', (err) => {
            // handle errors here
            outputChannel.appendLine("SLDS failed to start");
            throw err;
        });
        let javaExecutablePath = findJavaExecutable('java');
        // grab a random port.
        server.listen(() => {
            // Start the child java process
            let options = { cwd: vscode_1.workspace.rootPath };
            const { port } = server.address();
            console.log('Listening on port ' + port);
            let args = [];
            if (DEBUG) {
                args.push('-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1044');
                // suspend=y is the default. Use this form if you need to debug the server startup code:
                //  params.push('-agentlib:jdwp=transport=dt_socket,server=y,address=1044');
            }
            args.push('-jar');
            args.push(path.resolve(context.extensionPath, 'lsp-0.0.4-executable.jar'));
            args.push(`--PORT=${port.toString()}`);
            let process = child_process.spawn(javaExecutablePath, args, options);
            // Send raw output to a file
            // TODO: why is context.storagePath undefined?
            if (!fs.existsSync(context.storagePath)) {
                fs.mkdirSync(context.storagePath);
            }
            let logFile = context.storagePath + '/slds-extension.log';
            let logStream = fs.createWriteStream(logFile, { flags: 'w' });
            process.stdout.pipe(logStream);
            process.stderr.pipe(logStream);
            outputChannel.appendLine(`Storing LSP server log in '${logFile}'`);
        });
    });
}
function createClientOptions(outputChannel) {
    // Options to control the language client
    return {
        documentSelector: documentSelector,
        outputChannel: outputChannel,
        synchronize: {
            fileEvents: [
                vscode_1.workspace.createFileSystemWatcher('**/*.[cmp,html,js,css,app]')
            ]
        }
    };
}
function createLanguageClient(context, outputChannel) {
    let serverOptions = createServerOptions(context, outputChannel);
    let clientOptions = createClientOptions(outputChannel);
    let client = new vscode_languageclient_1.LanguageClient('sldsValidation', 'SLDS Validation', serverOptions, clientOptions);
    return client;
}
exports.createLanguageClient = createLanguageClient;
//# sourceMappingURL=sldsLanguageClient.js.map