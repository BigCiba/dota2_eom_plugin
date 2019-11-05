// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { start } from 'repl';
import { type } from 'os';
import { fsync } from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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
		const quickPick = vscode.window.createQuickPick();
		quickPick.canSelectMany = false;
		quickPick.ignoreFocusOut = true;
		quickPick.placeholder = '输入皮肤名字';
		quickPick.show();

		const items_english_uri = vscode.Uri.file(vscode.workspace.getConfiguration().get('LuaAbilityPlugin.items_english_url') + '/items_english.txt');
		const document_english = vscode.workspace.openTextDocument(items_english_uri);

		quickPick.onDidChangeValue(async (msg) =>{
			var content = (await document_english).getText();
			var Reg = '\\"DOTA_Set_' + msg + '.*';
			var matchArr = content.match(RegExp(Reg, 'ig'));
			if (matchArr !== null && matchArr.length <=5) {
				let selection:Array<vscode.QuickPickItem> = [];
				matchArr.forEach(element => {
					var obj = {label: element.split('"')[1].replace('DOTA_Set_',''),};
					selection.push(obj);
					// selection.push(element.split('"')[1].replace('DOTA_Set_',''));
				});
				quickPick.items = selection;
			}
		});
		quickPick.onDidChangeSelection((t)=>{
			quickPick.value = t[0].label;
		});
		quickPick.onDidAccept(async()=>{
			var msg = quickPick.value;
			var skinNameSchinese = '';
			var skinNameEnglish = '';
			// 选取中文词条
			const items_schinese_uri = vscode.workspace.getConfiguration().get('LuaAbilityPlugin.items_schinese_url') + '/items_schinese.txt';
			vscode.workspace.openTextDocument(vscode.Uri.file(items_schinese_uri)).then(async function(document){
				// vscode.window.showTextDocument(document);
				var content = document.getText();
				var Reg = '\\"DOTA_Set_' + msg + '.*';
				var matchArr = content.match(Reg);
				if (matchArr !== null) {
					skinNameSchinese = matchArr[0].split('"')[3];
					for (let lineNumber = 1; lineNumber < document.lineCount; lineNumber++) {
						var textLine = document.lineAt(lineNumber);
						if (textLine.text.search(matchArr[0].split('"')[1]) === -1 ) {
						} else {
							console.log(lineNumber);
							var options = {
								selection: new vscode.Range(new vscode.Position(lineNumber, matchArr[0].indexOf(skinNameSchinese)+2),new vscode.Position(lineNumber, matchArr[0].length+1)),
								preview: false,
							};
							// 选择文件并选择所需文字
							vscode.window.showTextDocument(vscode.Uri.file(items_schinese_uri), options);
						}
					}
				}
			});
			// vscode.window.showTextDocument(document);
			
			// 选取套装ID
			var content = (await document_english).getText();
			var Reg = '\\"DOTA_Set_' + msg + '.*';
			var matchArr = content.match(Reg);
			if (matchArr !== null) {
				// 获取皮肤英文名字
				skinNameEnglish = matchArr[0].split('"')[3];

				for (let lineNumber = 1; lineNumber < (await document_english).lineCount; lineNumber++) {
					var textLine = (await document_english).lineAt(lineNumber);
					if (textLine.text.search(matchArr[0].split('"')[1]) === -1 ) {
					} else {
						console.log(lineNumber);
						var options = {
							selection: new vscode.Range(new vscode.Position(lineNumber, matchArr[0].indexOf(skinNameEnglish)+2),new vscode.Position(lineNumber, matchArr[0].length+1)),
							preview: false,
						};
						// 选择文件并选择所需文字
						vscode.window.showTextDocument(items_english_uri, options);
					}
				}
				// 从皮肤英文名字从AttachWearables.txt中找到对应行
				const addon_path = vscode.workspace.getConfiguration().get('LuaAbilityPlugin.addon_path');
				const AttachWearables = addon_path + '/game/dota_td/scripts/AttachWearables.txt';
				vscode.workspace.openTextDocument(vscode.Uri.file(AttachWearables)).then(async function (document) {
					for (let lineNumber = 1; lineNumber < document.lineCount; lineNumber++) {
						var textLine = document.lineAt(lineNumber);
						if (textLine.text.search(skinNameEnglish) === -1 ) {
						} else {
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
								selection: new vscode.Range(RangeStart,RangeEnd),
								preview: false,
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
			quickPick.hide();
		});
		/*const inputbox = vscode.window.createInputBox();
		inputbox.show();
		inputbox.password = false;
		inputbox.ignoreFocusOut = true;
		inputbox.placeholder = '输入皮肤名字';
		inputbox.value = 'Raiments_of_the_Obsidian_Forge';
		inputbox.prompt = '示例：Raiments_of_the_Obsidian_Forge';
		inputbox.onDidChangeValue((msg) =>{
			const items_english_url = vscode.workspace.getConfiguration().get('LuaAbilityPlugin.items_english_url');
			vscode.workspace.openTextDocument(vscode.Uri.file(items_english_url + '/items_english.txt')).then(function(document){
				// vscode.window.showTextDocument(document);
				var content = document.getText();
				var Reg = '\\"DOTA_Set_' + msg + '.*';
				var matchArr = content.match(RegExp(Reg, 'ig'));
				if (matchArr !== null && matchArr.length <=5) {
					let selection:Array<string> = [];
					matchArr.forEach(element => {
						selection.push(element.split('"')[1].replace('DOTA_Set_',''));
					});
					inputbox.hide();
					vscode.window.showQuickPick(
					selection,
					{
						canPickMany:false,
						ignoreFocusOut:true,
						matchOnDescription:true,
						matchOnDetail:true,
						placeHolder:'选择套装名字'
					})
					.then(function(arr){
						if (arr !== undefined) {
							var msg = arr[0];
							var skinNameSchinese = '';
							var skinNameEnglish = '';
							const items_schinese_url = vscode.workspace.getConfiguration().get('LuaAbilityPlugin.items_schinese_url');
							vscode.workspace.openTextDocument(vscode.Uri.file(items_schinese_url + '/items_schinese.txt')).then(function(document){
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
							vscode.workspace.openTextDocument(vscode.Uri.file(items_english_url + '/items_english.txt')).then(function(document){
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
											if (textLine.text.search(skinNameEnglish) === -1 ) {
											} else {
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
													selection: new vscode.Range(RangeStart,RangeEnd),
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
						}
					});
				}
			});
		});*/
	});

	context.subscriptions.push(SkinTool);
}

// this method is called when your extension is deactivated
export function deactivate() {}
