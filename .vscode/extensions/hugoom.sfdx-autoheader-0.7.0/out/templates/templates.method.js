"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const documenter_helper_1 = require("../extension/documenter.helper");
/**
 * Generate a header for the selected Apex method, based on the SFDoc template and
 * the method's signature.
 * @param parameters List of tokenized parameters in the Apex method's signature
 * @param returnType The return type of the Apex method
 */
function getMethodHeaderFromTemplate(parameters, returnType) {
    return ("/**\n" +
        "* @description \n" +
        `* @author ${documenter_helper_1.default.getConfiguredUsername()} | ${documenter_helper_1.default.getFormattedDate()} \n` +
        `${parameters
            .map((param) => `* @param ${param} \n`)
            .toString()
            .replace(/,/gim, "")}` +
        (returnType === "void" ? "" : `* @return ${returnType} `) +
        "\n**/");
}
exports.getMethodHeaderFromTemplate = getMethodHeaderFromTemplate;
//# sourceMappingURL=templates.method.js.map