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
const vscode = __importStar(require("vscode"));
const components = __importStar(require("./data/components.json"));
const context_1 = require("./context");
const documentSelector = { pattern: '**/*.{cmp,haml,handlebars,htm,html,jade,jsx,php}', scheme: 'file' };
const triggerChars = 'abcdefghijklmnopqrstuvwxyz1234567890-_'.split('');
// determine if current state warrants looking for completion items
// if yes return range of text that would be replaced, if no return undefined
function shouldTriggerCompletions(document, position) {
    // must start with "slds-" plus a letter
    let triggerRange = document.getWordRangeAtPosition(position, /\bslds-[a-z][\w-]*/i);
    return triggerRange;
}
// get list of completion items to display, potentially replacing the provided text range
function getCompletions(range) {
    let completions = components.classes.map(cssClass => {
        let completionItem = new vscode.CompletionItem(cssClass.selector);
        completionItem.kind = vscode.CompletionItemKind.Value;
        completionItem.detail = cssClass.component;
        completionItem.documentation = cssClass.summary;
        // some langs treat "-" as a word separator and so they won't replace "slds-" upon completion commit
        // this sets the replaced range to what we regex'd earlier so the "slds-" is included when replacing
        completionItem.range = range;
        return completionItem;
    });
    return new vscode.CompletionList(completions, false);
}
function register(context) {
    const extensionContext = context;
    const provider = {
        provideCompletionItems(document, position, token, context) {
            let triggerRange = context_1.SLDSContext.isEnable(extensionContext, context_1.ContextKey.GLOBAL, context_1.ContextKey.AUTO_SUGGEST)
                ? shouldTriggerCompletions(document, position) : false;
            return triggerRange ? getCompletions(triggerRange) : undefined;
        }
    };
    return vscode.languages.registerCompletionItemProvider(documentSelector, provider, ...triggerChars);
}
exports.register = register;
//# sourceMappingURL=sldsComponentsProvider.js.map