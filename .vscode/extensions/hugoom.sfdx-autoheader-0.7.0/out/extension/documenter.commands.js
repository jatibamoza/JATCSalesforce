"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class DocumenterCommands {
    constructor(methodDocumenter, fileDocumenter) {
        this.methodDocumenter = methodDocumenter;
        this.fileDocumenter = fileDocumenter;
        vscode_1.commands.registerTextEditorCommand("extension.insertApexMethodHeader", this.methodDocumenter.insertMethodHeaderFromCommand, this.methodDocumenter);
        vscode_1.commands.registerTextEditorCommand("extension.insertFileHeader", this.fileDocumenter.insertFileHeaderFromCommand, this.fileDocumenter);
    }
}
exports.default = DocumenterCommands;
//# sourceMappingURL=documenter.commands.js.map