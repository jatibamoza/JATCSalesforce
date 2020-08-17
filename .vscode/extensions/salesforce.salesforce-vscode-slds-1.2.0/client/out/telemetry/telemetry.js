"use strict";
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util = require("util");
const settings_1 = require("../settings");
const telemetryReporter_1 = __importDefault(require("./telemetryReporter"));
const constants_1 = require("../constants");
const sfdxCoreExtension = vscode.extensions.getExtension('salesforce.salesforcedx-vscode-core');
const sfdxCoreExports = sfdxCoreExtension.exports;
class TelemetryService {
    constructor() {
        this.cliAllowsTelemetry = true;
    }
    static getInstance() {
        if (!TelemetryService.instance) {
            TelemetryService.instance = new TelemetryService();
        }
        return TelemetryService.instance;
    }
    initializeService(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.context = context;
            this.cliAllowsTelemetry = yield sfdxCoreExports.telemetryService.checkCliTelemetry();
            const machineId = vscode && vscode.env ? vscode.env.machineId : 'someValue.machineId';
            const isDevMode = machineId === 'someValue.machineId';
            // TelemetryReporter is not initialized if user has disabled telemetry setting.
            if (this.reporter === undefined && this.isTelemetryEnabled() && !isDevMode) {
                const extensionPackage = require(this.context.asAbsolutePath('./package.json'));
                this.reporter = new telemetryReporter_1.default(extensionPackage.name, extensionPackage.version, extensionPackage.aiKey, true);
                this.context.subscriptions.push(this.reporter);
            }
        });
    }
    isTelemetryEnabled() {
        return settings_1.sfdxCoreSettings.getTelemetryEnabled() && this.cliAllowsTelemetry;
    }
    getHasTelemetryMessageBeenShown() {
        if (this.context === undefined) {
            return true;
        }
        const sfdxTelemetryState = this.context.globalState.get(constants_1.TELEMETRY_GLOBAL_VALUE);
        return typeof sfdxTelemetryState === 'undefined';
    }
    setTelemetryMessageShowed() {
        if (this.context === undefined) {
            return;
        }
        this.context.globalState.update(constants_1.TELEMETRY_GLOBAL_VALUE, true);
    }
    showTelemetryMessage() {
        // check if we've ever shown Telemetry message to user
        const showTelemetryMessage = this.getHasTelemetryMessageBeenShown();
        if (showTelemetryMessage) {
            // Show the message and set telemetry to true;
            const showButtonText = 'Read more'; //nls.localize('telemetry_legal_dialog_button_text');
            const showMessage = util.format('You agree that Salesforce Extensions for VS Code may collect usage information, user environment, and crash reports for product improvements. Learn how to [opt out](%s).', constants_1.TELEMETRY_OPT_OUT_LINK);
            vscode.window
                .showInformationMessage(showMessage, showButtonText)
                .then(selection => {
                // Open disable telemetry link
                if (selection && selection === showButtonText) {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(constants_1.TELEMETRY_OPT_OUT_LINK));
                }
            });
            this.setTelemetryMessageShowed();
        }
    }
    sendExtensionActivationEvent(hrstart) {
        if (this.reporter !== undefined && this.isTelemetryEnabled) {
            const startupTime = this.getEndHRTime(hrstart);
            this.reporter.sendTelemetryEvent('activationEvent', {
                extensionName: constants_1.EXTENSION_NAME,
                startupTime: startupTime
            });
        }
    }
    sendExtensionDeactivationEvent() {
        if (this.reporter !== undefined && this.isTelemetryEnabled()) {
            this.reporter.sendTelemetryEvent('deactivationEvent', {
                extensionName: constants_1.EXTENSION_NAME
            });
        }
    }
    sendError(errorMsg) {
        if (this.reporter !== undefined && this.isTelemetryEnabled) {
            this.reporter.sendTelemetryEvent('coreError', {
                extensionName: constants_1.EXTENSION_NAME,
                errorMessage: errorMsg
            });
        }
    }
    sendEventData(eventName, properties, measures) {
        if (this.reporter !== undefined && this.isTelemetryEnabled) {
            this.reporter.sendTelemetryEvent(eventName, properties, measures);
        }
    }
    sendErrorEvent(errorMsg, callstack) {
        if (this.reporter !== undefined && this.isTelemetryEnabled) {
            this.reporter.sendTelemetryEvent('error', {
                extensionName: constants_1.EXTENSION_NAME,
                errorMessage: errorMsg,
                errorStack: callstack
            });
        }
    }
    dispose() {
        if (this.reporter !== undefined) {
            this.reporter.dispose().catch(err => console.log(err));
        }
    }
    getEndHRTime(hrstart) {
        const hrend = process.hrtime(hrstart);
        return util.format('%d%d', hrend[0], hrend[1] / 1000000);
    }
}
exports.TelemetryService = TelemetryService;
//# sourceMappingURL=telemetry.js.map