"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "lua-ability-editor-plugin" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let OpenLang = vscode.commands.registerCommand('extension.OpenLang', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
        const path = 'C:/Users/bigciba/Documents/Dota Addons/ProjectDttD/game/dota_td/resource/addon_schinese.txt';
        vscode.window.showTextDocument(vscode.Uri.file(path));
    });
    context.subscriptions.push(OpenLang);
    let SkinTool = vscode.commands.registerCommand('extension.SkinTool', () => {
        vscode.window.showInputBox({
            password: false,
            ignoreFocusOut: true,
            placeHolder: '输入皮肤名字',
            value: 'Raiments_of_the_Obsidian_Forge',
            prompt: '示例：Raiments_of_the_Obsidian_Forge',
        }).then(function (msg) {
            var skinNameSchinese = '';
            var skinNameEnglish = '';
            const items_schinese_url = vscode.workspace.getConfiguration().get('LuaAbilityPlugin.items_schinese_url');
            vscode.workspace.openTextDocument(vscode.Uri.file(items_schinese_url + '/items_schinese.txt')).then(function (document) {
                // vscode.window.showTextDocument(document);
                var content = document.getText();
                var Reg = '\\"DOTA_Set_' + msg + '.*';
                var matchArr = content.match(Reg);
                if (matchArr !== null) {
                    skinNameSchinese = matchArr[0].split('"')[3];
                    // console.log(skinNameSchinese);
                }
            });
            const items_english_url = vscode.workspace.getConfiguration().get('LuaAbilityPlugin.items_english_url');
            vscode.workspace.openTextDocument(vscode.Uri.file(items_english_url + '/items_english.txt')).then(function (document) {
                // vscode.window.showTextDocument(document);
                var content = document.getText();
                var Reg = '\\"DOTA_Set_' + msg + '.*';
                var matchArr = content.match(Reg);
                if (matchArr !== null) {
                    // 获取皮肤英文名字
                    skinNameEnglish = matchArr[0].split('"')[3];
                    // 从皮肤英文名字从AttachWearables.txt中找到对应行
                    const addon_path = vscode.workspace.getConfiguration().get('LuaAbilityPlugin.addon_path');
                    const AttachWearables = addon_path + '/game/dota_td/scripts/AttachWearables.txt';
                    vscode.workspace.openTextDocument(vscode.Uri.file(AttachWearables)).then(function (document) {
                        for (let lineNumber = 1; lineNumber < document.lineCount; lineNumber++) {
                            var textLine = document.lineAt(lineNumber);
                            if (textLine.text.search(skinNameEnglish) === -1) {
                            }
                            else {
                                // 该套装所在行往下寻找所包含id
                                // console.log(textLine.text);
                                var LeftBrackets = 0;
                                var RightBrackets = 0;
                                var RangeStart = textLine.range.start;
                                var RangeEnd = RangeStart;
                                for (let num = lineNumber + 1; num < document.lineCount; num++) {
                                    var line = document.lineAt(num);
                                    var arr = line.text.match('{');
                                    if (arr !== null) {
                                        LeftBrackets = LeftBrackets + arr.length;
                                    }
                                    arr = line.text.match('}');
                                    if (arr !== null) {
                                        RightBrackets = RightBrackets + arr.length;
                                    }
                                    if (LeftBrackets !== 0 && LeftBrackets === RightBrackets) {
                                        RangeEnd = line.range.end;
                                        break;
                                    }
                                }
                                const options = {
                                    selection: new vscode.Range(RangeStart, RangeEnd),
                                };
                                // 选择文件并选择所需文字
                                vscode.window.showTextDocument(vscode.Uri.file(AttachWearables), options);
                                break;
                            }
                        }
                    });
                    // 打开npc_heroes_tower_skin目录
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(addon_path + '/design/4.kv配置表/npc_heroes_tower_skin.xlsx'));
                }
            });
        });
    });
    context.subscriptions.push(SkinTool);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map