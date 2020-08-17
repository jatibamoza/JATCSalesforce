"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
exports.default = {
    apexReservedTerms: [
        "public",
        "private",
        "protected",
        "global",
        "override",
        "static",
        "webservice",
        "testMethod",
    ],
    apexAnnotationsRegex: /^\s*@\s*\D*/,
    /**
     * Get an array of all File Header properties configured in the extension's settings.
     */
    getFileHeaderRawProperties() {
        return vscode_1.workspace.getConfiguration("SFDoc").get("FileHeaderProperties", []);
    },
    /**
     * Get a File-Header-suitable formatted string of all configured File Header properties.
     */
    getFormattedFileHeaderProperties(lineStartChar, username, date) {
        const rawProperties = vscode_1.workspace
            .getConfiguration("SFDoc")
            .get("FileHeaderProperties", []);
        const paddingSize = Math.max(...rawProperties.map(({ name }) => name.length)) + 2;
        return rawProperties
            .map(({ name, defaultValue = "" }, index) => {
            let content = `${lineStartChar} @${name.padEnd(paddingSize, " ")}: ${defaultValue
                .replace(/^\$username$/, username)
                .replace(/^\$date$/, date)}`;
            if (index != rawProperties.length - 1)
                content += "\n";
            return content;
        })
            .toString()
            .replace(/\,/gm, "");
    },
    /**
     * Get a date formatted according to the format set in the extension's settings under DateFormat.
     */
    getFormattedDate() {
        const currentDate = new Date();
        const dateFormat = vscode_1.workspace
            .getConfiguration("SFDoc")
            .get("DateFormat", "MM-DD-YYYY");
        return dateFormat
            .replace("DD", `${currentDate.getDate()}`.padStart(2, "0"))
            .replace("MM", `${currentDate.getMonth() + 1}`.padStart(2, "0"))
            .replace("YYYY", `${currentDate.getFullYear()}`);
    },
    getConfiguredUsername() {
        return vscode_1.workspace.getConfiguration("SFDoc").get("username", "");
    },
    /**
     * Walk the document's contents updwards from the current location (command's call site) to find the containing class's name.
     */
    getContainingClassName(document, lineNumber) {
        const re = /class\s*\S*/;
        do {
            const line = document.lineAt(--lineNumber);
            if (line.isEmptyOrWhitespace)
                continue;
            const matches = line.text.match(re);
            if (!matches)
                continue;
            return matches[0].split(" ")[1];
        } while (lineNumber > 0);
        return "";
    },
};
//# sourceMappingURL=documenter.helper.js.map