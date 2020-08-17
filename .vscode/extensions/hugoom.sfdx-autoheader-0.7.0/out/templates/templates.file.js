"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const documenter_helper_1 = require("../extension/documenter.helper");
/**
 * Generates and returns a file header, based on the language of the current file,
 * its name and the user/workspace SFDoc settings.
 * @param languageId VSCode language identifier for the current file
 * @param fileName Name of the current file
 */
function getFileHeaderFromTemplate(languageId) {
    let blockStart = "/**", lineStart = " *", blockEnd = "**/";
    const formattedDate = documenter_helper_1.default.getFormattedDate();
    const username = documenter_helper_1.default.getConfiguredUsername();
    if (languageId === "html" || languageId === "visualforce") {
        blockStart = "<!--";
        lineStart = " ";
        blockEnd = "-->";
    }
    return `${blockStart}
${documenter_helper_1.default.getFormattedFileHeaderProperties(lineStart, username, formattedDate)}
${lineStart} Modifications Log 
${lineStart} Ver   ${"Date".padEnd(formattedDate.length, " ")}   ${"Author".padEnd(username.length, " ")}   Modification
${lineStart} 1.0   ${formattedDate}   ${username}   Initial Version
${blockEnd}
`;
}
exports.getFileHeaderFromTemplate = getFileHeaderFromTemplate;
//# sourceMappingURL=templates.file.js.map