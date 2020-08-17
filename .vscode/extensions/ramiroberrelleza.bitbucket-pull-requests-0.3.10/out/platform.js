"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
function getRunCommand(url) {
    const platform = os.platform();
    if (platform === 'darwin') {
        return `open ${url}`;
    }
    if (platform === 'win32') {
        return `start "" "${url}"`;
    }
    // picked the command based on https://askubuntu.com/questions/8252/how-to-launch-default-web-browser-from-the-terminal
    return `xdg-open ${url}`;
}
exports.getRunCommand = getRunCommand;
//# sourceMappingURL=platform.js.map