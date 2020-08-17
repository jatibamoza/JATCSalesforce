"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const vscode_1 = require("vscode");
const sfdxCoreSettings_1 = require("../settings/sfdxCoreSettings");
const telemetry_1 = require("../telemetry/telemetry");
const telemetryReporter_1 = require("../telemetry/telemetryReporter");
const MockContext_1 = require("./MockContext");
describe('Telemetry', () => {
    const machineId = '45678903';
    const telemetryService = telemetry_1.TelemetryService.getInstance();
    let mShowInformation;
    let settings;
    let mockContext;
    let reporter;
    let exceptionEvent;
    let teleStub;
    let cliStub;
    describe('in dev mode', () => {
        beforeEach(() => {
            mShowInformation = sinon_1.stub(vscode_1.window, 'showInformationMessage').returns(Promise.resolve(null));
            settings = sinon_1.stub(sfdxCoreSettings_1.SfdxCoreSettings.prototype, 'getTelemetryEnabled').returns(true);
            teleStub = sinon_1.stub(telemetryService, 'setCliTelemetryEnabled');
            cliStub = sinon_1.stub(telemetryService, 'checkCliTelemetry');
            cliStub.returns(true);
        });
        afterEach(() => {
            mShowInformation.restore();
            settings.restore();
            teleStub.restore();
            cliStub.restore();
        });
        it('Should not initialize telemetry reporter', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, 'someValue.machineId');
            const telemetryReporter = telemetryService.getReporter();
            chai_1.expect(typeof telemetryReporter).to.be.eql('undefined');
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should show telemetry info message', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext in which telemetry msg has never been previously shown
            mockContext = new MockContext_1.MockContext(false);
            yield telemetryService.initializeService(mockContext, 'someValue.machineId');
            const telemetryEnabled = telemetryService.isTelemetryEnabled();
            chai_1.expect(telemetryEnabled).to.be.eql(true);
            telemetryService.showTelemetryMessage();
            sinon_1.assert.calledOnce(mShowInformation);
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should not show telemetry info message', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext in which telemetry msg has been previously shown
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, 'someValue.machineId');
            const telemetryEnabled = telemetryService.isTelemetryEnabled();
            chai_1.expect(telemetryEnabled).to.be.eql(true);
            telemetryService.showTelemetryMessage();
            sinon_1.assert.notCalled(mShowInformation);
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should disable CLI telemetry', () => __awaiter(void 0, void 0, void 0, function* () {
            mockContext = new MockContext_1.MockContext(true);
            cliStub.returns(false);
            yield telemetryService.initializeService(mockContext, 'someValue.machineId');
            chai_1.expect(teleStub.firstCall.args).to.eql([false]);
        }));
    });
    describe('production mode', () => {
        beforeEach(() => {
            mShowInformation = sinon_1.stub(vscode_1.window, 'showInformationMessage').returns(Promise.resolve(null));
            settings = sinon_1.stub(sfdxCoreSettings_1.SfdxCoreSettings.prototype, 'getTelemetryEnabled').returns(true);
            reporter = sinon_1.stub(telemetryReporter_1.default.prototype, 'sendTelemetryEvent');
            exceptionEvent = sinon_1.stub(telemetryReporter_1.default.prototype, 'sendExceptionEvent');
            teleStub = sinon_1.stub(telemetryService, 'setCliTelemetryEnabled');
            cliStub = sinon_1.stub(telemetryService, 'checkCliTelemetry');
            cliStub.returns(true);
        });
        afterEach(() => {
            mShowInformation.restore();
            settings.restore();
            reporter.restore();
            exceptionEvent.restore();
            teleStub.restore();
            cliStub.restore();
        });
        it('Should show telemetry info message', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext in which telemetry msg has never been previously shown
            mockContext = new MockContext_1.MockContext(false);
            yield telemetryService.initializeService(mockContext, machineId);
            const telemetryEnabled = telemetryService.isTelemetryEnabled();
            chai_1.expect(telemetryEnabled).to.be.eql(true);
            telemetryService.showTelemetryMessage();
            sinon_1.assert.calledOnce(mShowInformation);
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should not show telemetry info message', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext in which telemetry msg has been previously shown
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, machineId);
            const telemetryEnabled = telemetryService.isTelemetryEnabled();
            chai_1.expect(telemetryEnabled).to.be.eql(true);
            telemetryService.showTelemetryMessage();
            sinon_1.assert.notCalled(mShowInformation);
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should send telemetry data', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext in which telemetry msg has been previously shown
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, machineId);
            telemetryService.sendExtensionActivationEvent([0, 678]);
            sinon_1.assert.calledOnce(reporter);
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should not send telemetry data', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext
            mockContext = new MockContext_1.MockContext(true);
            // user has updated settings for not sending telemetry data.
            settings.restore();
            settings = sinon_1.stub(sfdxCoreSettings_1.SfdxCoreSettings.prototype, 'getTelemetryEnabled').returns(false);
            yield telemetryService.initializeService(mockContext, machineId);
            const telemetryEnabled = telemetryService.isTelemetryEnabled();
            chai_1.expect(telemetryEnabled).to.be.eql(false);
            telemetryService.sendCommandEvent('create_apex_class_command', [0, 678]);
            sinon_1.assert.notCalled(reporter);
            chai_1.expect(teleStub.firstCall.args).to.eql([false]);
        }));
        it('Should send correct data format on sendExtensionActivationEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, machineId);
            telemetryService.sendExtensionActivationEvent([0, 678]);
            sinon_1.assert.calledOnce(reporter);
            const expectedData = {
                extensionName: 'salesforcedx-vscode-core',
                startupTime: sinon_1.match.string,
            };
            sinon_1.assert.calledWith(reporter, 'activationEvent', sinon_1.match(expectedData));
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should send correct data format on sendExtensionDeactivationEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, machineId);
            telemetryService.sendExtensionDeactivationEvent();
            sinon_1.assert.calledOnce(reporter);
            const expectedData = {
                extensionName: 'salesforcedx-vscode-core',
            };
            sinon_1.assert.calledWith(reporter, 'deactivationEvent', expectedData);
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should send correct data format on sendCommandEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, machineId);
            telemetryService.sendCommandEvent('create_apex_class_command', [0, 678]);
            sinon_1.assert.calledOnce(reporter);
            const expectedData = {
                extensionName: 'salesforcedx-vscode-core',
                commandName: 'create_apex_class_command',
                executionTime: sinon_1.match.string,
            };
            sinon_1.assert.calledWith(reporter, 'commandExecution', sinon_1.match(expectedData));
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should send correct data format on sendCommandEvent with additionalData', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, machineId);
            const additionalData = {
                dirType: 'testDirectoryType',
                secondParam: 'value',
            };
            telemetryService.sendCommandEvent('create_apex_class_command', [0, 678], additionalData);
            sinon_1.assert.calledOnce(reporter);
            const expectedData = {
                extensionName: 'salesforcedx-vscode-core',
                commandName: 'create_apex_class_command',
                executionTime: sinon_1.match.string,
                dirType: 'testDirectoryType',
                secondParam: 'value',
            };
            sinon_1.assert.calledWith(reporter, 'commandExecution', sinon_1.match(expectedData));
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('should send correct data format on sendEventData', () => __awaiter(void 0, void 0, void 0, function* () {
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, machineId);
            const eventName = 'eventName';
            const property = { property: 'property for event' };
            const measure = { measure: 123456 };
            telemetryService.sendEventData(eventName, property, measure);
            sinon_1.assert.calledWith(reporter, eventName, property, measure);
            chai_1.expect(teleStub.firstCall.args).to.eql([true]);
        }));
        it('Should send data sendExceptionEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext
            mockContext = new MockContext_1.MockContext(true);
            yield telemetryService.initializeService(mockContext, machineId);
            telemetryService.sendException('error_name', 'this is a test error message');
            sinon_1.assert.calledOnce(exceptionEvent);
            sinon_1.assert.calledWith(exceptionEvent, 'error_name', 'this is a test error message');
        }));
        it('Should not send telemetry data when CLI telemetry is disabled', () => __awaiter(void 0, void 0, void 0, function* () {
            // create vscode extensionContext
            mockContext = new MockContext_1.MockContext(true);
            cliStub.returns(false);
            yield telemetryService.initializeService(mockContext, machineId);
            const telemetryEnabled = telemetryService.isTelemetryEnabled();
            chai_1.expect(telemetryEnabled).to.be.eql(false);
            telemetryService.sendCommandEvent('create_apex_class_command', [0, 123]);
            sinon_1.assert.notCalled(reporter);
            chai_1.expect(teleStub.firstCall.args).to.eql([false]);
        }));
    });
});
//# sourceMappingURL=telemetry.test.js.map