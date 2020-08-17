"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const documenter_file_1 = require("./extension/documenter.file");
const documenter_method_1 = require("./extension/documenter.method");
const documenter_commands_1 = require("./extension/documenter.commands");
exports.activate = function (context) {
    const fileDocumenter = new documenter_file_1.default(context);
    const methodDocumenter = new documenter_method_1.default();
    new documenter_commands_1.default(methodDocumenter, fileDocumenter);
    return { fileDocumenter, methodDocumenter };
};
exports.deactivate = function () { };
//# sourceMappingURL=documenter.js.map