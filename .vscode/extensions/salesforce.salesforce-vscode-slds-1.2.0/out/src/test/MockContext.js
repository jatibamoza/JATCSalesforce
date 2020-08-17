"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockContext = void 0;
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const path = require("path");
//import * as URI from 'uri-js';
class MockMemento {
    constructor(setGlobalState) {
        this.telemetryGS = setGlobalState;
    }
    get(key) {
        if (this.telemetryGS === true) {
            return true;
        }
        return undefined;
    }
    update(key, value) {
        return Promise.resolve();
    }
}
class MockContext {
    constructor(mm) {
        this.extensionMode = 2; // Development enumeration member
        this.subscriptions = [];
        this.extensionPath = 'myExtensionPath';
        this.globalStoragePath = 'globalStatePath';
        this.logPath = 'logPath';
        this.storagePath = 'myStoragePath';
        this.globalState = new MockMemento(mm);
    }
    asAbsolutePath(relativePath) {
        return path.join('../../../package.json'); // this should point to the src/package.json
    }
}
exports.MockContext = MockContext;
//# sourceMappingURL=MockContext.js.map