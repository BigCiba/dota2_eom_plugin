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
		// vscode.window.showInformationMessage("请问你现在的心情如何",'你说什么','我不知道','再见！')
        // .then(function(select){
        //     console.log(select);
		// });
		
		const quickPick = vscode.window.createQuickPick();
		quickPick.canSelectMany = false;
		quickPick.ignoreFocusOut = true;
		quickPick.step = 1;
		quickPick.totalSteps = 2;
		quickPick.placeholder = '皮肤名字';
		quickPick.title = '输入皮肤名字';
		// quickPick.value = '复制套装中文名';
		// quickPick.items = [
		// 	{label: '复制套装ID',},
		// 	{label: '复制套装中文名',},
		// 	{label: '复制套装英文名',}
		// ];
		quickPick.show();

		const items_english_uri = vscode.Uri.file(vscode.workspace.getConfiguration().get('LuaAbilityPlugin.items_english_url') + '/items_english.txt');
		const items_schinese_uri = vscode.Uri.file(vscode.workspace.getConfiguration().get('LuaAbilityPlugin.items_schinese_url') + '/items_schinese.txt');
		const document_english = vscode.workspace.openTextDocument(items_english_uri);
		const document_schinese = vscode.workspace.openTextDocument(items_schinese_uri);
		
		var skinNameEnglish = '';
		var skinNameSchinese = '';
		var skinID = '';
		// 监听输入事件
		quickPick.onDidChangeValue(async (msg) =>{
			if (quickPick.step === 1) {
				var content = (await document_english).getText();
				var matchArr = content.match(RegExp('\\"DOTA_Set_' + msg + '.*', 'ig'));
				// 在英文文本里搜寻词条并加入选择项
				if (matchArr !== null && matchArr.length <=3) {
					let pickItems:Array<vscode.QuickPickItem> = [];
					matchArr.forEach(element => {
						var obj = {label: element.split('"')[1].replace('DOTA_Set_',''),};
						pickItems.push(obj);
					});
					quickPick.items = pickItems;
				}
			}
		});
		// 监听选择事件
		quickPick.onDidChangeSelection((t)=>{
			quickPick.value = t[0].label;
		});
		// 监听确定事件
		quickPick.onDidAccept(async ()=>{
			switch (quickPick.step) {
				case 1:
					var msg = quickPick.value;
					// 获取中文词条
					vscode.workspace.openTextDocument(items_schinese_uri).then(async function(document){
						var content = document.getText();
						var Reg = '\\"DOTA_Set_' + msg + '.*';
						var matchArr = content.match(Reg);
						if (matchArr !== null) {
							skinNameSchinese = matchArr[0].split('"')[3];
						}
					});
					// 选取套装ID
					var content = (await document_english).getText();
					var Reg = '\\"DOTA_Set_' + msg + '.*';
					var matchArr = content.match(Reg);
					if (matchArr !== null) {
						// 获取皮肤英文名字
						skinNameEnglish = matchArr[0].split('"')[3];
						// 从皮肤英文名字从AttachWearables.txt中找到对应行
						const addon_path = vscode.workspace.getConfiguration().get('LuaAbilityPlugin.addon_path');
						const AttachWearables = addon_path + '/game/dota_td/scripts/AttachWearables.txt';
						vscode.workspace.openTextDocument(vscode.Uri.file(AttachWearables)).then(async function (document) {
							for (let lineNumber = 1; lineNumber < document.lineCount; lineNumber++) {
								var textLine = document.lineAt(lineNumber);
								if (textLine.text.search(skinNameEnglish) === -1 ) {
									if (skinNameEnglish.search(textLine.text.split(' // ')[1]) === -1) {
									} else if (textLine.text.search('AttachWearables') === 0) {
										console.log(lineNumber);
									}
								} else {
									skinID = textLine.text;
									// 该套装所在行往下寻找所包含id
									// console.log(textLine.text);
									var LeftBrackets = 0;
									var RightBrackets = 0;
									// var RangeStart = textLine.range.start;
									// var RangeEnd = RangeStart;
									for (let num = lineNumber + 1; num < document.lineCount; num++) {
										var line = document.lineAt(num);
										skinID = skinID + '\n' + line.text;
										var arr = line.text.match('{');
										if (arr !== null) {
											LeftBrackets = LeftBrackets + arr.length;
										}
										arr = line.text.match('}');
										if (arr !== null) {
											RightBrackets = RightBrackets + arr.length;
										}
										if (LeftBrackets !== 0 && LeftBrackets === RightBrackets) {
											// RangeEnd = line.range.end;
											break;
										}
									}
									// const options = {
									// 	selection: new vscode.Range(RangeStart,RangeEnd),
									// 	preview: false,
									// };
									// // 选择文件并选择所需文字
									// vscode.window.showTextDocument(vscode.Uri.file(AttachWearables), options);

									// vscode.env.clipboard.writeText(id);
									break;
								}
							}
						});
						// 打开npc_heroes_tower_skin目录
						// vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(addon_path + '/design/4.kv配置表/npc_heroes_tower_skin.xlsx'));
					}
					quickPick.step = 2;
					quickPick.value = '';
					quickPick.placeholder = '';
					quickPick.title = '选择项目';
					quickPick.items = [
						{label: '复制套装ID',},
						{label: '复制套装中文名',},
						{label: '复制套装英文名',}
					];
					break;
				case 2:
					var select = quickPick.value;
					if (select === '复制套装ID') {
						vscode.env.clipboard.writeText(skinID);
					}else if(select === '复制套装中文名') {
						vscode.env.clipboard.writeText(skinNameSchinese);
					}else if(select === '复制套装英文名') {
						vscode.env.clipboard.writeText(skinNameEnglish);
					}
					break;
				default:
					break;
			}
			
		});
		// quickPick.onDidAccept(async()=>{
		// 	var msg = quickPick.value;
		// 	var skinNameSchinese = '';
		// 	var skinNameEnglish = '';
		// 	// 选取中文词条
		// 	const items_schinese_uri = vscode.workspace.getConfiguration().get('LuaAbilityPlugin.items_schinese_url') + '/items_schinese.txt';
		// 	vscode.workspace.openTextDocument(vscode.Uri.file(items_schinese_uri)).then(async function(document){
		// 		// vscode.window.showTextDocument(document);
		// 		var content = document.getText();
		// 		var Reg = '\\"DOTA_Set_' + msg + '.*';
		// 		var matchArr = content.match(Reg);
		// 		if (matchArr !== null) {
		// 			skinNameSchinese = matchArr[0].split('"')[3];
		// 			for (let lineNumber = 1; lineNumber < document.lineCount; lineNumber++) {
		// 				var textLine = document.lineAt(lineNumber);
		// 				if (textLine.text.search(matchArr[0].split('"')[1]) === -1 ) {
		// 				} else {
		// 					console.log(lineNumber);
		// 					var options = {
		// 						selection: new vscode.Range(new vscode.Position(lineNumber, matchArr[0].indexOf(skinNameSchinese)+2),new vscode.Position(lineNumber, matchArr[0].length+1)),
		// 						preview: false,
		// 					};
		// 					// 选择文件并选择所需文字
		// 					vscode.window.showTextDocument(vscode.Uri.file(items_schinese_uri), options);
		// 				}
		// 			}
		// 		}
		// 	});
		// 	// vscode.window.showTextDocument(document);
			
			
		// });
	});

	context.subscriptions.push(SkinTool);
}

// this method is called when your extension is deactivated
export function deactivate() {}
