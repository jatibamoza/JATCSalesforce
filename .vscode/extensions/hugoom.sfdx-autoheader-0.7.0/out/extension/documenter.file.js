"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const documenter_helper_1 = require("./documenter.helper");
const templates_file_1 = require("../templates/templates.file");
/**
 * Class that contains the methods related to generating and populating a class/file level header.
 */
class FileDocumenter {
    /**
     * Map "On Save" event listeners provided by the class to the VSCode Framework.
     * @param context Framework-provided Extension Context
     */
    constructor(context) {
        this.cursorPositions = {};
        this.HEADER_LENGTH_LINES = 13;
        this.isHeaderBeingInserted = false;
        this.setListenerOnPreSave(context);
        this.setListenerOnPostSave(context);
    }
    /**
     * Method exposed as an editor command to insert a file-level header.
     * @param editor The current text editor
     * @param edit The various edits to be applied to the files
     */
    insertFileHeaderFromCommand(editor, edit) {
        if (!this.isValidLanguageOnRequest(editor.document)) {
            vscode_1.window.showErrorMessage("SFDoc: Unsupported file type and/or language");
            return;
        }
        if (this.isHeaderPresentOnDoc(editor.document)) {
            vscode_1.window.showErrorMessage("SFDoc: Header already present on file's first line");
            return;
        }
        edit.insert(new vscode_1.Position(0, 0), this.getFileHeader(editor.document));
    }
    /**
     * Check whether a file-level is already present on the current document.
     * @param document The open and active text document
     */
    isHeaderPresentOnDoc(document) {
        const firstLineText = document.lineAt(0).text;
        return (this.isLineABlockComment(firstLineText) ||
            this.isLineAnXMLComment(firstLineText));
    }
    /**
     * Validates whether the language of the current document is supported by the extension.
     * Valid languages include: [Apex, Visualforce, HTML, JavaScript]
     * @param document The open and active text document
     */
    isValidLanguageOnRequest(document) {
        const languageId = document.languageId;
        if (languageId === "apex")
            return true;
        if (languageId === "visualforce")
            return true;
        if (languageId === "html")
            return true;
        if (languageId === "javascript")
            return true;
        if (languageId === "xml")
            return true;
        return false;
    }
    /**
     * Attach the file-header insertion action to the Pre-Save framework hook.
     * @param context Framework-provided Extension Context
     */
    setListenerOnPreSave(context) {
        const preSaveHookListener = vscode_1.workspace.onWillSaveTextDocument.call(this, (event) => {
            if (!event.document.isDirty)
                return;
            if (!this.isHeaderPresentOnDoc(event.document) &&
                !this.isValidLanguage(event.document))
                return;
            event.waitUntil(this.insertOrUpdateHeader(event.document));
        });
        context.subscriptions.push(preSaveHookListener);
    }
    /**
     * Attach the cursor position reset action to the Post-Save framework hook.
     * @param context Framework-provided Extension Context
     */
    setListenerOnPostSave(context) {
        const postSaveHookListener = vscode_1.workspace.onDidSaveTextDocument(this.replaceCursor.bind(this));
        context.subscriptions.push(postSaveHookListener);
    }
    /**
     * Replace the cursor to its original position, that is prior to inserting or
     * update a file header.
     */
    replaceCursor() {
        if (!Object.keys(this.cursorPositions).length)
            return;
        if (!vscode_1.window.visibleTextEditors.length)
            return;
        //* Loop is fix for single file in multiple panes jumping to EOF, but VSCode's default
        //*   behavior cannot be prevented as of now. Fix will stay in place nevertheless.
        vscode_1.window.visibleTextEditors.forEach((editor) => {
            editor.selection = new vscode_1.Selection(this.getLastSavedCursorPosition(editor.document.uri.toString()), this.getLastSavedCursorPosition(editor.document.uri.toString()));
        });
        this.cursorPositions = {};
    }
    /**
     * Determine whether a file-level header should be inserted, or if one is already
     * present and it should be updated instead.
     * @param document The open and active text document
     */
    insertOrUpdateHeader(document) {
        //* Prevent capturing the Cursor position when saving from script
        if (vscode_1.window.activeTextEditor)
            this.cursorPositions[document.uri.toString()] =
                vscode_1.window.activeTextEditor.selection.active;
        this.isHeaderBeingInserted = this.isHeaderPresentOnDoc(document);
        return this.isHeaderBeingInserted
            ? this.getUpdateHeaderValueEdit(document)
            : this.getInsertFileHeaderEdit(document);
    }
    /**
     * Get and capture the current position of the cursor, prior to saving or updating
     * the header. Doing so allows for replacing it at same place after the operation
     * is completed.
     * @param documentURI URI of the currently active document
     */
    getLastSavedCursorPosition(documentURI) {
        if (!this.cursorPositions[documentURI])
            return new vscode_1.Position(this.isHeaderBeingInserted ? 0 : this.HEADER_LENGTH_LINES, 0);
        return new vscode_1.Position(this.cursorPositions[documentURI].line +
            (this.isHeaderBeingInserted ? 0 : this.HEADER_LENGTH_LINES), this.cursorPositions[documentURI].character);
    }
    /**
     * Get a VSCode Text Edit that contains the header to be inserted.
     * @param document The open and active text document
     */
    async getInsertFileHeaderEdit(document) {
        return [vscode_1.TextEdit.insert(new vscode_1.Position(0, 0), this.getFileHeader(document))];
    }
    /**
     * Get the structured File Header content to be inserted, based on the selected
     * settings.
     * @param document The open and active text document
     */
    getFileHeader(document) {
        return templates_file_1.getFileHeaderFromTemplate(document.languageId);
    }
    /**
     * Checks whether the line is a Block-type comment (Apex format)
     * @param lineContent Content of the line being verified
     */
    isLineABlockComment(lineContent) {
        const re = /^\s*\/\*/g;
        return re.test(lineContent);
    }
    /**
     * Checks whether the line is an XML comment
     * @param lineContent Content of the line being verified
     */
    isLineAnXMLComment(lineContent) {
        const re = /^\s*<!--/g;
        return re.test(lineContent);
    }
    /**
     * Checks if the language is valid/supported by the extension and if it's enabled
     * in the user and/or workdspace settings.
     * @param document The open and active text document
     */
    isValidLanguage(document) {
        const lang = document.languageId;
        const configs = vscode_1.workspace.getConfiguration("SFDoc");
        const enabledForApex = configs.get("EnableForApex");
        const enabledForVf = configs.get("EnableForVisualforce");
        const enabledForLightMarkup = configs.get("EnableForLightningMarkup", true);
        const enabledForLightningJavaScript = configs.get("EnableForLightningJavascript", false);
        if (lang === "apex" && enabledForApex)
            return true;
        if (lang === "visualforce" && enabledForVf)
            return true;
        if (lang === "html")
            return enabledForLightMarkup && this.isLightning(document);
        if (lang === "xml")
            return enabledForLightMarkup && this.isLightning(document);
        if (lang === "javascript")
            return enabledForLightningJavaScript && this.isLightning(document);
        return false;
    }
    /**
     * Checks if the current document is a Lightning document, based on it's file extension,
     * and containing folder structure.
     * @param document The open and active text document
     */
    isLightning(document) {
        const validExtensions = ["htm", "html", "cmp", "js"];
        const validSalesforceFolderNames = ["aura", "lwc"];
        const pathTokens = document.uri.path.split("/");
        const folderName = pathTokens[pathTokens.length - 2];
        const parentFolderName = pathTokens.length >= 3 ? pathTokens[pathTokens.length - 3] : null;
        const [fileName, fileExtension] = pathTokens[pathTokens.length - 1].split(".");
        const lightningJavaScriptFileRegex = /Controller|Helper/gi;
        const folderNameMatchRegex = new RegExp(`^${folderName}$`);
        const processedFileName = document.languageId === "javascript"
            ? fileName.replace(lightningJavaScriptFileRegex, "")
            : fileName;
        if (!folderNameMatchRegex.test(processedFileName))
            return false;
        if (!validExtensions.includes(fileExtension))
            return false;
        if (!parentFolderName)
            return false;
        if (!validSalesforceFolderNames.includes(parentFolderName))
            return false;
        return true;
    }
    /**
     * Get a VSCode Text Edit that contains the header with the updated values.
     * @param document The open and active text document
     */
    async getUpdateHeaderValueEdit(document) {
        return [
            vscode_1.TextEdit.replace(this.getFullDocumentRange(document), this.updateHeaderLastModifiedByAndDate(document.getText())),
        ];
    }
    /**
     * Update the "Last Modified By" and "Last Modified Date" values.
     * @param documentText The content of the active document as text.
     */
    updateHeaderLastModifiedByAndDate(documentText) {
        return this.updateLastModifiedDate(this.updateLastModifiedBy(documentText));
    }
    /**
     * Update the "Last Modified By" value in the current header.
     * @param fileContent The content of the active document as text.
     */
    updateLastModifiedBy(fileContent) {
        documenter_helper_1.default.getFileHeaderRawProperties().forEach(({ name, defaultValue }) => {
            if (defaultValue != "$username")
                return;
            const re = RegExp(`^(\\s*[\\*\\s]*@${name}\\s*:).*`, "gim");
            fileContent = fileContent.replace(re, `$1 ${documenter_helper_1.default.getConfiguredUsername()}`);
        });
        return fileContent;
    }
    /**
     * Update the "Last Modified On" value in the current header.
     * @param fileContent The content of the active document as text.
     */
    updateLastModifiedDate(fileContent) {
        documenter_helper_1.default.getFileHeaderRawProperties().forEach(({ name, defaultValue }) => {
            if (defaultValue != "$date")
                return;
            const re = RegExp(`^(\\s*[\\*\\s]*@${name}\\s*:).*`, "gim");
            fileContent = fileContent.replace(re, `$1 ${documenter_helper_1.default.getFormattedDate()}`);
        });
        return fileContent;
    }
    /**
     * Returns a VSCode Range instance that spans the whole document.
     * @param document The active text document.
     */
    getFullDocumentRange(document) {
        const lastChar = document.lineAt(document.lineCount - 1).text.length;
        return new vscode_1.Range(new vscode_1.Position(0, 0), new vscode_1.Position(document.lineCount, lastChar));
    }
}
exports.default = FileDocumenter;
//# sourceMappingURL=documenter.file.js.map