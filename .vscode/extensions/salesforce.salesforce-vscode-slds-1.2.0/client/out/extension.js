/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const sldsLanguageClient_1 = require("./sldsLanguageClient");
const componentsProvider = __importStar(require("./sldsComponentsProvider"));
const utilitiesProvider = __importStar(require("./sldsUtilitiesProvider"));
const varTokensProvider = __importStar(require("./sldsVarTokensProvider"));
const auraTokensProvider = __importStar(require("./sldsAuraTokensProvider"));
const commands_1 = require("./commands");
const telemetry_1 = require("./telemetry");
const outputChannel = vscode.window.createOutputChannel(`SLDS`);
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Telemetry service
        yield telemetry_1.telemetryService.initializeService(context);
        telemetry_1.telemetryService.showTelemetryMessage();
        const extensionHRStart = process.hrtime();
        // SLDS validation language client
        outputChannel.append(`Starting SLDS ... `);
        const languageClient = sldsLanguageClient_1.createLanguageClient(context, outputChannel);
        context.subscriptions.push(languageClient.start());
        // SLDS Commands
        outputChannel.append(`registering commands ... `);
        const commands = new commands_1.Commands(context, languageClient, outputChannel);
        commands.register();
        outputChannel.appendLine(`registering providers`);
        // SLDS components completion provider
        let components = componentsProvider.register(context);
        context.subscriptions.push(components);
        // SLDS utilities completion provider
        let utilities = utilitiesProvider.register(context);
        context.subscriptions.push(utilities);
        // SLDS var tokens completion provider
        let varTokens = varTokensProvider.register(context);
        context.subscriptions.push(varTokens);
        // SLDS aura tokens completion provider
        let auraTokens = auraTokensProvider.register(context);
        context.subscriptions.push(auraTokens);
        // send activationEvent
        telemetry_1.telemetryService.sendExtensionActivationEvent(extensionHRStart);
    });
}
exports.activate = activate;
function deactivate() {
    telemetry_1.telemetryService.sendExtensionDeactivationEvent();
    return;
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map