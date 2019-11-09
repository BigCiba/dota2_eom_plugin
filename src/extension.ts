// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { start } from 'repl';
import { type } from 'os';
import * as fs from 'fs';
import { promises } from 'dns';
import xlsx from 'node-xlsx';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dota2_eom_plugin" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let OpenLang = vscode.commands.registerCommand('extension.OpenLang', async () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World!');
		// const path = 'C:/Users/lsj58/Documents/Dota Addons/ProjectDttD/game/dota_td/resource/addon_schinese.txt';
		// vscode.window.showTextDocument(vscode.Uri.file(path));
		GenerateSkinKV();
		// vscode.workspace.fs.copy(vscode.Uri.file('C:/Users/bigciba/Documents/Dota Addons/ProjectDttD/design/4.kv配置表/npc_tower.xlsx'),vscode.Uri.file('C:/Users/bigciba/Documents/Dota Addons/ProjectDttD/design/自制工具及其源码/PythonOverride/npc_tower.xlsx'),{overwrite: true});
		
		// var uri = vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_info.json';
		// fsync:readFile(uri, 'utf-8', (err, data) => {
		// 	if (err) {
		// 	  console.log(err);
		// 	} else {
		// 		var obj = JSON.parse(data);
		// 	  console.log(obj[0]);
		// 	  console.log(obj[1]);
		// 	}
		//   });
		// const sheetList = xlsx.parse('C:/Users/bigciba/Documents/Dota Addons/ProjectDttD/design/4.kv配置表/npc_heroes_tower_skin.xlsx');
		// console.log(sheetList);
		
		
		// console.log('结束');
		// var document = vscode.workspace.openTextDocument(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_game.txt'));
		// for (let line = 20000; line < 20020; line++) {
		// 	var text = (await document).getText(new vscode.Range(new vscode.Position(line,0),new vscode.Position(line,100)));
		// 	console.log(text);
		// }
	});

	context.subscriptions.push(OpenLang);

	// 初始化数据
	// 遍历AttachWearables.txt获取每个英雄的每个套装
	// let SetData = [{
	// 	heroname: 'npc_dota_hero_abyssal_underlord',
	// 	set_name: '',
	// 	english_name: 'Raiments of the Obsidian Forge',
	// 	chinese_name: '黑曜锻炉衣饰',
	// 	skin_id: '',
	// 	AttachWearables:[
	// 		{
	// 			ItemDef: 12293,
	// 			item_slot:	'#DOTA_WearableType_head',
	// 		},
	// 		{
	// 			ItemDef: 12294,
	// 			item_slot:	'#DOTA_WearableType_armor',
	// 		},
	// 		{
	// 			ItemDef: 12295,
	// 			item_type_name:	'#DOTA_WearableType_weapon',
	// 		}
	// 	]
	// }];
	SkinToolInit();

	var SetData = new Array;
	var HeroData = new Array;

	function PrefixInteger(num:number, length:number) {
		return (Array(length).join('0') + num).slice(-length);
	}

	function FindWithHeroName(heroname:string) {
		SetData.forEach(element => {
			if (heroname === element.data.heroname) {
			}
		});
	}
	// 获得Creature字符
	function GetSkinId(setData:any,defaultData:any):any {
		var Creature = '\t\t\t"AttachWearables" // ' + setData.chinese_name + '\n\t\t\t{\n';
		for (let i = 0; i < defaultData.AttachWearables.length; i++) {
			const defaultElement = defaultData.AttachWearables[i];
			var ItemDef = defaultElement.ItemDef;
			var item_desc = defaultElement.item_desc;
			for (let j = 0; j < setData.AttachWearables.length; j++) {
				const element = setData.AttachWearables[j];
				if (element.item_type_name === defaultElement.item_type_name && element.item_slot === defaultElement.item_slot) {
					ItemDef = element.ItemDef;
					item_desc = element.item_desc;
				}
			}
			var lineText = new String('\t\t\t\t"' + defaultElement.ID + '" { "ItemDef" "' + ItemDef + '" } // ' + item_desc + '\n');
			Creature += lineText;
		}
		Creature += '\t\t\t}';
		return Creature;
	}
	// 根据套装英文名获取数据
	function FindSetDataWithEnglishName(english_name:string):any {
		for (let i = 0; i < SetData.length; i++) {
			const element = SetData[i];
			if (english_name === element.data.english_name) {
				return element.data;
			}
		}
	}
	// 获取英雄数据
	function FindHeroDataWithHeroName(heroname:string):any {
		for (let i = 0; i < HeroData.length; i++) {
			const element = HeroData[i];
			if (heroname === element.data.heroname) {
				return element.data;
			}
		}
	}
	// 获取英雄默认套装
	function FindHeroDefaultSet(heroname:string):any {
		for (let i = 0; i < SetData.length; i++) {
			const set = SetData[i];
			if (set.data.heroname === heroname && set.data.set_name === 'Default ' + heroname) {
				return set.data;
			}
		}
	}
	// 生成skin文件
	function GenerateSkinKV() {
		const skinExcelUri = vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/4.kv配置表/npc_heroes_tower_skin.xlsx';
		const heroKVUri = vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/game/dota_td/scripts/npc/kv/npc_heroes_tower.kv');
		const heroSkinKVUri = vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/game/dota_td/scripts/npc/kv/npc_heroes_tower_skin.kv';
		// 打开excel
		var sheetList = xlsx.parse(skinExcelUri);
		var exceldata = sheetList[0].data;

		var outputData = '"npc_heroes_tower_skin"\n{\n\t// 主键\n';
		vscode.workspace.openTextDocument(heroKVUri).then(async function(document){
			for (let j = 2; j < exceldata.length; j++) {
				const element:Array<string> = exceldata[j];
				for (let line = 0; line < document.lineCount; line++) {
					var lineText = document.lineAt(line).text;
					// 当找到英雄名字开始行
					if (lineText.search(element[6]) !== -1) {
						outputData += '\t"' + element[0] + '"\n';
						var AttachWearables = false;
						var leftBrackets = 0;
						var rightBrackets = 0;
						for (let index = line + 1; index < document.lineCount; index++) {
							var text = document.lineAt(index).text;
							if (element[1] !== undefined && text.search('"Model"') !== -1) {
								outputData += text.replace(text.split('"')[3], element[1]) + '\n';
								continue;
							}
							if (element[2] !== undefined && text.search('"ModelScale"') !== -1) {
								outputData += text.replace(text.split('"')[3], element[2]) + '\n';
								continue;
							}
							if (element[4] !== undefined && text.search('"HealthBarOffset"') !== -1) {
								outputData += text.replace(text.split('"')[3], element[4]) + '\n';
								continue;
							}
							if (element[5] !== undefined && text.search('"ProjectileModel"') !== -1) {
								outputData += text.replace(text.split('"')[3], element[5]) + '\n';
								continue;
							}
							if (text.search('"GhostModelUnitName"') !== -1) {
								outputData += text + '\n';
								if (element[3] !== undefined) {
									outputData += '\t\t// 皮肤\n\t\t"Skin"\t"' + element[3] + '"\n';
								}
								outputData += '\t\t// 继承属性单位\n\t\t"OverrideUnitName"\t"' + element[6] + '"\n';
								continue;
							}
							if (element[8] !== undefined && text.search('"AttachWearables"') !== -1) {
								outputData += element[8] + '\n';
								AttachWearables = true;
								continue;
							}
							if (text.search(/npc_dota_hero_.*_custom/) !== -1) {
								break;
							}
							if (AttachWearables === false) {
								outputData += text + '\n';
							} else {
								var leftBracketsArr = text.match('{');
								if (leftBracketsArr !== null) {
									leftBrackets += leftBracketsArr.length;
								}
								var rightBracketsArr = text.match('}');
								if (rightBracketsArr !== null) {
									rightBrackets += rightBracketsArr.length;
								}
								if (leftBrackets !== 0 && leftBrackets === rightBrackets) {
									AttachWearables = false;
									leftBrackets = 0;
									rightBrackets = 0;
								}
							}
						}
						break;
					}
				}
			}
			outputData += '}';
			fs.writeFileSync(heroSkinKVUri,outputData);
			vscode.window.setStatusBarMessage('生成完毕..');
		});
		// kv文件格式每一行判断，//为注释
		// vscode.workspace.openTextDocument(heroKVUri).then(function(document){
		// 	for (let index = 3; index < exceldata.length; index++) {
		// 		const element = exceldata[index];
				
		// 	}
		// 	for (let line = 0; line < document.lineCount; line++) {
		// 		var lineText = document.lineAt(line).text;
		// 		// 遇到注释
		// 		if (lineText.search('//') !== -1) {
		// 			continue;
		// 		}
		// 	}
		// });
	}
	function SkinToolInit() {
		if (vscode.workspace.getConfiguration().has('Dota2EomPlugin.text_url') && vscode.workspace.getConfiguration().has('Dota2EomPlugin.addon_path')) {
			var uri = vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_info.json';
			fs.readFile(uri, 'utf-8', function (err, data) {
				if (err) {
					InitJson();
				}
				SetData = JSON.parse(data);
				ReadHeroData();
				// 监听npc_heroes_tower_skin.xlsx变化事件
				var fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/design/4.kv配置表/npc_heroes_tower_skin.xlsx',true,false,true);
				fileSystemWatcher.onDidChange(function (uri) {
					GenerateSkinKV();
				});
			 });
		}
	}
	function ReadHeroData() {
		const npc_heroes_tower_uri = vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/game/dota_td/scripts/npc/kv/npc_heroes_tower.kv');
		const npc_heroes_tower_skin_uri = vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/game/dota_td/scripts/npc/kv/npc_heroes_tower_skin.kv');
		// 预载入每个英雄的数据与skin
		
		vscode.workspace.openTextDocument(npc_heroes_tower_uri).then(function (document) {
			var heroData = {heroname:'', Name:'', Model:'', ModelScale:'',skins:new Array};
			var flagHero = false;
			var leftBrackets:number = 0;	// 记录{数量
			var rightBrackets:number = 0;	// 记录}数量
			function InitSetData() {
				heroData.heroname = '';
				heroData.Name = '';
				heroData.Model = '';
				heroData.ModelScale = '';
				heroData.skins = new Array;
			}
			for (let line = 0; line < document.lineCount; line++) {
				const lineText = document.lineAt(line).text;
				if (lineText.search(/npc_dota_hero_.*_custom/) !== -1 && flagHero === false) {
					heroData.heroname = lineText.split('"')[1];
					flagHero = true;
					continue;
				}
				// 记录区块
				if (flagHero === true) {
					var leftBracketsArr = lineText.match('{');
					if (leftBracketsArr !== null) {
						leftBrackets += leftBracketsArr.length;
					}
					var rightBracketsArr = lineText.match('}');
					if (rightBracketsArr !== null) {
						rightBrackets += rightBracketsArr.length;
					}
					if (leftBrackets !== 0 && leftBrackets === rightBrackets) {
						flagHero = false;	// 结束一个套装区块
						let data = {};
						Object.assign(data, heroData);
						HeroData.push({data});
						InitSetData();
					}
					
					if (lineText.split('"')[1] === 'Name') {
						heroData.Name = lineText.split('"')[3];
					}
					if (lineText.split('"')[1] === 'Model') {
						heroData.Model = lineText.split('"')[3];
					}
					if (lineText.split('"')[1] === 'ModelScale') {
						heroData.ModelScale = lineText.split('"')[3];
					}
				}
				//
			}
		}).then(function () {
			vscode.workspace.openTextDocument(npc_heroes_tower_skin_uri).then(function (document) {
				for (let line = 0; line < document.lineCount; line++) {
					const lineText = document.lineAt(line).text;
					if (lineText.search(/npc_dota_hero_.*_skin_../) !== -1) {
						const skinName = lineText.split('"')[1];
						const heroname = skinName.split('skin')[0] + 'custom';
						for (let i = 0; i < HeroData.length; i++) {
							const element = HeroData[i];
							if (element.data.heroname === heroname) {
								element.data.skins.push(skinName);
								break;
							}
						}
					}
				}
			});
		});
	}
	function InitJson() {
		const addon_path = vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path');
		vscode.workspace.openTextDocument(vscode.Uri.file(addon_path + '/game/dota_td/scripts/AttachWearables.txt')).then(function(document){
			vscode.window.setStatusBarMessage('读取套装..');
			ReadAttachWearables(document);
		}).then(function(){
			vscode.workspace.openTextDocument(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_english.txt')).then(function(document){
				vscode.window.setStatusBarMessage('读取英文..');
				ReadEnglish(document);
			}).then(function(){
				vscode.window.setStatusBarMessage('读取中文..');
				vscode.workspace.openTextDocument(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_schinese.txt')).then(function(document){
					ReadChinese(document);
				}).then(function(){
					vscode.window.setStatusBarMessage('读取装备类型..');
					vscode.workspace.openTextDocument(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_game.txt')).then(function(document){
						ReadSoltType(document);
						WriteJson();
						vscode.window.setStatusBarMessage('读取完毕');
						SkinToolInit();
					});
				});
			});
		});
		function ReadAttachWearables(document: vscode.TextDocument) {
			var setData = {heroname: '',set_name: '',localize_name: '',english_name: '',chinese_name: '',AttachWearables: new Array,};
			var flagSets:boolean = false;	// 是否进入一个套装区块
			var leftBrackets:number = 0;	// 记录{数量
			var rightBrackets:number = 0;	// 记录}数量
			// 充值套装数据
			function InitSetData() {
				setData.set_name = '';
				setData.english_name = '';
				setData.chinese_name = '';
				// setData.skin_id = '';
				setData.AttachWearables = new Array;
			}
			for (let line = 1; line < document.lineCount; line++) {
				var lineText = document.lineAt(line).text;
				// 查找到一个新英雄
				if (lineText.search('Cosmetic Sets for ') !== -1) {
					setData.heroname = lineText.split('Cosmetic Sets for ')[1];	// 记录英雄名字
					continue;
				}
				if (lineText.search('AttachWearables') !== -1 && flagSets === false) {
					flagSets = true;	// 进入一个套装区块
					InitSetData();
					setData.set_name = lineText.split(' // ')[1];	// 记录套装名字
					// setData.skin_id += lineText;
					continue;
				}
				if (flagSets === true) {
					// setData.skin_id = setData.skin_id + '\n' + lineText;
	
					var leftBracketsArr = lineText.match('{');
					if (leftBracketsArr !== null) {
						leftBrackets += leftBracketsArr.length;
					}
					var rightBracketsArr = lineText.match('}');
					if (rightBracketsArr !== null) {
						rightBrackets += rightBracketsArr.length;
					}
					if (leftBrackets !== 0 && leftBrackets === rightBrackets) {
						flagSets = false;	// 结束一个套装区块
						let data = {};
						Object.assign(data, setData);
						SetData.push({data});
						continue;
					}
					if (lineText.search('ItemDef') !== -1) {
						var ItemDef = {
							ID: lineText.split('"')[1],
							ItemDef: lineText.split('"')[5],
							item_type_name: '',
							item_slot: '',
							item_desc: lineText.split(' // ')[1],
						};
						setData.AttachWearables.push(ItemDef);	// 记录套装数据
						continue;
					}
				}
			}
		}
		function ReadEnglish(document: vscode.TextDocument) {
			SetData.forEach(element => {
				if (element.data.set_name === 'Default ' + element.data.heroname) {
					element.data.english_name = 'Default ' + element.data.heroname;
				} else {
					for (let line = 0; line < document.lineCount; line++) {
						var lineText = document.lineAt(line).text;
						if (lineText.split('"')[3] === element.data.set_name) {
							element.data.english_name = lineText.split('"')[3];
							element.data.localize_name = lineText.split('"')[1];
							break;
						}
					}
				}
			});
		}
		function ReadChinese(document: vscode.TextDocument) {
			SetData.forEach(element => {
				if (element.data.set_name === 'Default ' + element.data.heroname) {
					element.data.chinese_name = '默认套装';
				} else {
					for (let line = 0; line < document.lineCount; line++) {
						var lineText = document.lineAt(line).text;
						if (lineText.search(element.data.localize_name) !== -1) {
							element.data.chinese_name = lineText.split('"')[3];
							break;
						}
					}
				}
			});
		}
		function ReadSoltType(document: vscode.TextDocument) {
			var start:boolean = false;
			var end:boolean = false;
			var flagSets:boolean = false;	// 是否进入一个套装区块
			var skipSets:boolean = false;	// 跳过一个套装区块
			var wearable:boolean = false;	// 是否可装备
			var itemsArr = new Array;
			var setData = {id: '',item_type_name:'',item_slot:''};
			for (let line = 0; line < document.lineCount; line++) {
				var lineText = document.getText(new vscode.Range(new vscode.Position(line,0),new vscode.Position(line,100)));
				// let lineText = document.lineAt(line).text;
				// 进入物品区块
				if (lineText.search('"items"') !== -1 && start === false) {
					start = true;
					continue;
				}
				// 寻找到套装ID
				if (start === true && lineText.split('"').length === 3 && lineText.search(/[1-9][0-9]*/) === 3) {
					if (flagSets === true ) {
						if (skipSets === false) {
							let data = {};
							Object.assign(data, setData);
							itemsArr.push(data);
						}
						setData.id = lineText.split('"')[1];
						setData.item_type_name = '';
						setData.item_slot = '';
					} else {
						flagSets = true;
						setData.id = lineText.split('"')[1];
					}
				}
				// 寻找到套装ID下的信息判断是否是装备
				if (flagSets === true && lineText.split('"')[1] === 'prefab') {
					if (lineText.split('"')[3] === 'wearable' || lineText.split('"')[3] === 'default_item') {
						wearable = true;
						skipSets = false;
					} else {
						wearable = false;
						skipSets = true;
					}
				}
				// 寻找到套装ID下的装备信息
				if (flagSets === true && skipSets === false && wearable === true && lineText.search('"item_type_name"') !== -1) {
					setData.item_type_name = lineText.split('"')[3];
				}
				// 寻找到套装ID下的装备信息
				if (flagSets === true && skipSets === false && wearable === true && lineText.search('"item_slot"') !== -1) {
					setData.item_slot = lineText.split('"')[3];
				}
				// 结束物品区块
				if (lineText.search('"item_sets"') !== -1 && end === false) {
					end = true;
					break;
				}
			}
			SetData.forEach(element => {
				for (let i = 0; i < element.data.AttachWearables.length; i++) {
					const itemData = element.data.AttachWearables[i];
					for (let index = 0; index < itemsArr.length; index++) {
						const obj = itemsArr[index];
						if (obj.id === itemData.ItemDef) {
							itemData.item_type_name = obj.item_type_name;
							itemData.item_slot = obj.item_slot;
							break;
						}
					}
				}
			});
		}
		function WriteJson() {
			var uri = vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_info.json';
			fs.writeFile(uri, JSON.stringify(SetData), function(){});
		}
	}
	


	// const items_english_uri = vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_english.txt');
	// const items_schinese_uri = vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_schinese.txt');
	// const npc_heroes_tower_uri = vscode.Uri.file(addon_path + '/game/dota_td/scripts/npc/kv/npc_heroes_tower.kv');
	// vscode.workspace.openTextDocument(items_english_uri).then(async function(document){
	// 	SetData.forEach(element => {
			
	// 	});
	// }


	let SkinTool = vscode.commands.registerCommand('extension.SkinTool', () => {
		if (SetData.length > 0) {
			const quickPick = vscode.window.createQuickPick();
			quickPick.canSelectMany = false;
			quickPick.ignoreFocusOut = true;
			// quickPick.step = 1;
			// quickPick.totalSteps = 3;
			quickPick.placeholder = '皮肤名字';
			quickPick.title = '输入皮肤名字';

			// 添加选项
			var items = new Array;
			SetData.forEach(element => {
				if (element.data.set_name.search('Default') === -1) {
					items.push({
						label:element.data.english_name,
						description:element.data.chinese_name,
						// set_name:element.data.set_name,
					});
				}
			});
			quickPick.items = items;

			quickPick.show();
			
			// 选择选项
			quickPick.onDidChangeSelection((t)=>{
				quickPick.value = t[0].label;
				// 打开excel
				var xlsxName =vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/4.kv配置表/npc_heroes_tower_skin.xlsx';
				var sheetList = xlsx.parse(xlsxName);
				var exceldata = sheetList[0].data;
				// 修改excel
				const setData = FindSetDataWithEnglishName(t[0].label);
				const heroData = FindHeroDataWithHeroName(setData.heroname + '_custom');
				const defaultSetData = FindHeroDefaultSet(setData.heroname);
				const SkinName = setData.heroname + '_skin_' + '0' + String(heroData.skins.length + 1);
				const Model = heroData.Model;
				const ModelScale = heroData.ModelScale;
				const Skin = null;
				const HealthBarOffset = null;
				const ProjectileModel = null;
				const OverrideUnitName = setData.heroname + '_custom';
				const Name = heroData.Name;
				const Creature = GetSkinId(setData, defaultSetData);
				const SetName = setData.chinese_name;
				var newData:any = [SkinName,Model,ModelScale,Skin,HealthBarOffset,ProjectileModel,OverrideUnitName,Name,Creature,null,SetName];
				exceldata.push(newData);
				const options = {'!cols': [{ wch: 40 }, { wch: 50 }, { wch: 10 }, { wch: 6 }, { wch: 20 }, { wch: 20 }, { wch: 40 }, { wch: 12 }, { wch: 40 }, { wch: 6 }, { wch: 30 } ]};
				var buffer = xlsx.build([{name: "Sheet1", data: exceldata}], options);
				fs.writeFileSync(xlsxName,buffer);

				// vscode.workspace.fs.copy(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/game/dota_td/scripts/npc/kv/npc_heroes_tower.kv'), vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/自制工具及其源码/PythonOverride/npc_heroes_tower.kv'),{overwrite: true});
				// vscode.workspace.fs.copy(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/4.kv配置表/npc_heroes_tower_skin.xlsx'), vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design//自制工具及其源码/PythonOverride/npc_heroes_tower_skin.xlsx'),{overwrite: true});
				// vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/自制工具及其源码/PythonOverride/kv.exe'));
				// 写入商品配置表
				vscode.workspace.openTextDocument(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/6.商业化设计/1.商品配置表/items.csv')).then(async function(document){
					var avatarStarLine = 0;
					var avatarEndLine = 0;
					for (let line = 0; line < document.lineCount; line++) {
						var lineText = document.lineAt(line).text;
						if (lineText.search(setData.heroname + '_skin_' + '0' + heroData.skins.length) !== -1) {
							avatarEndLine = line + 1;
							break;
						}
						if (lineText.search('avatar') !== -1 && avatarStarLine === 0) {
							avatarStarLine = line;
							continue;
						}
						if (lineText.search('avatar') === -1 && avatarStarLine !== 0) {
							avatarEndLine = line;
							break;
						}
					}
					var textEditor = vscode.window.showTextDocument(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/6.商业化设计/1.商品配置表/items.csv'));
					(await textEditor).edit(function (editBuilder) {
						editBuilder.insert(new vscode.Position(avatarEndLine,0), SkinName + ',avatar,' + SetName + ',,,1,TRUE,,,\n');
					});
				});

				quickPick.hide();
				// 覆盖kv
				/*vscode.window.showInformationMessage('Hello World!','覆盖').then((msg)=>{
					vscode.workspace.fs.copy(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/自制工具及其源码/PythonOverride/npc_heroes_tower_skin.kv'), vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/game/dota_td/scripts/npc/kv/npc_heroes_tower_skin.kv'),{overwrite: true});
					vscode.workspace.openTextDocument(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/6.商业化设计/1.商品配置表/items.csv')).then(async function(document){
						var avatarStarLine = 0;
						var avatarEndLine = 0;
						for (let line = 0; line < document.lineCount; line++) {
							var lineText = document.lineAt(line).text;
							if (lineText.search(setData.heroname + '_skin_' + '0' + heroData.skins.length) !== -1) {
								avatarEndLine = line + 1;
								break;
							}
							if (lineText.search('avatar') !== -1 && avatarStarLine === 0) {
								avatarStarLine = line;
								continue;
							}
							if (lineText.search('avatar') === -1 && avatarStarLine !== 0) {
								avatarEndLine = line;
								break;
							}
						}
						var textEditor = vscode.window.showTextDocument(vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') + '/design/6.商业化设计/1.商品配置表/items.csv'));
						(await textEditor).edit(function (editBuilder) {
							editBuilder.insert(new vscode.Position(avatarEndLine,0), SkinName + ',avatar,' + SetName + ',,,1,TRUE,,,\n');
						});
					});
				});*/
			});
		}
		/*const quickPick = vscode.window.createQuickPick();
		quickPick.canSelectMany = false;
		quickPick.ignoreFocusOut = true;
		quickPick.step = 1;
		quickPick.totalSteps = 3;
		quickPick.placeholder = '皮肤名字';
		quickPick.title = '输入皮肤名字';
		// quickPick.value = '复制套装中文名';
		// quickPick.items = [
		// 	{label: '复制套装ID',},
		// 	{label: '复制套装中文名',},
		// 	{label: '复制套装英文名',}
		// ];
		const step_2_items = [
			'1.复制英雄属性',
			'2.复制套装ID',
			'3.生成npc_heroes_tower_skin.kv',
			'4.覆盖npc_heroes_tower_skin.kv',
		];
		quickPick.show();
		var NextStep = async function() {
			if (quickPick.step === 1) {
				quickPick.step += 1;
				quickPick.value = '';
				quickPick.placeholder = '英雄名字';
				quickPick.title = '输入英雄名字';
				quickPick.items = [];
			} else if (quickPick.step === 2) {
				quickPick.step += 1;
				quickPick.value = '';
				quickPick.placeholder = '';
				quickPick.title = '选择项目';
				quickPick.items = [
					{label: step_2_items[0],},
					{label: step_2_items[1],},
					{label: step_2_items[2],},
					{label: step_2_items[3],},
				];
			}

		};

		const items_english_uri = vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_english.txt');
		const items_schinese_uri = vscode.Uri.file(vscode.workspace.getConfiguration().get('Dota2EomPlugin.text_url') + '/items_schinese.txt');
		const addon_path = vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path') ;
		const npc_heroes_tower_uri = vscode.Uri.file(addon_path + '/game/dota_td/scripts/npc/kv/npc_heroes_tower.kv');
		const document_english = vscode.workspace.openTextDocument(items_english_uri);
		const document_schinese = vscode.workspace.openTextDocument(items_schinese_uri);
		const document_heroes = vscode.workspace.openTextDocument(npc_heroes_tower_uri);
		
		var skinNameEnglish = '';
		var skinNameSchinese = '';
		var skinID = '';
		var heroData = '';
		// 监听输入事件
		quickPick.onDidChangeValue(async (msg) =>{
			switch (quickPick.step) {
				case 1:
					var content = (await document_english).getText();
					var matchArr = content.match(RegExp('\\"DOTA_Set_.*' + msg + '.*', 'ig'));
					// 在英文文本里搜寻词条并加入选择项
					if (matchArr !== null) {
						let pickItems:Array<vscode.QuickPickItem> = [];
						matchArr.forEach(element => {
							var obj = {label: element.split('"')[1].replace('DOTA_Set_',''),};
							pickItems.push(obj);
						});
						quickPick.items = pickItems;
					}
					break;
				case 2:
					// tslint:disable-next-line: no-duplicate-variable
					var content = (await document_heroes).getText();
					// tslint:disable-next-line: no-duplicate-variable
					var matchArr = content.match(RegExp('\\"npc_dota_hero_.*' + msg + '.*_custom', 'ig'));
					// 在英文文本里搜寻词条并加入选择项
					if (matchArr !== null) {
						let pickItems:Array<vscode.QuickPickItem> = [];
						matchArr.forEach(element => {
							var obj = {label: element.split('"')[1],};
							pickItems.push(obj);
						});
						quickPick.items = pickItems;
					}
					break;
				default:
					break;
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
						const addon_path = vscode.workspace.getConfiguration().get('Dota2EomPlugin.addon_path');
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
					NextStep();
					break;
				case 2:
					var skinName = quickPick.value.replace('custom','skin_01');
					var name = '';
					var modelName = '';
					var modelScale = '1';
					var OverrideUnitName = quickPick.value;
					for (let lineNumber = 1; lineNumber < (await document_heroes).lineCount; lineNumber++) {
						var textLine = (await document_heroes).lineAt(lineNumber);
						if (textLine.text.search(quickPick.value) === -1 ) {
						} else {
							for (let num = lineNumber + 1; num < (await document_heroes).lineCount; num++) {
								var line = (await document_heroes).lineAt(num);
								var nameArr = line.text.match('Name');
								var modelArr = line.text.match('Model');
								if (nameArr !== null) {
									name = line.text.split('"')[3];
								}
								if (modelArr !== null) {
									modelName = line.text.split('"')[3];
									break;
								}
							}
							break;
						}
					}
					heroData = skinName + '\t' + modelName + '\t' + modelScale + '\t\t\t\t' + OverrideUnitName + '\t' + name + '\t\t\t' + skinNameSchinese + '\t' + skinNameEnglish;
					NextStep();
					break;
				case 3:
					if (quickPick.value === step_2_items[0]) {
						// 打开npc_heroes_tower_skin目录
						vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(addon_path + '/design/4.kv配置表/npc_heroes_tower_skin.xlsx'));
						vscode.env.clipboard.writeText(heroData);
					}else if(quickPick.value === step_2_items[1]) {
						vscode.env.clipboard.writeText(skinID);
					}else if(quickPick.value === step_2_items[2]) {
						// 复制文件并打开kv
						vscode.workspace.fs.copy(npc_heroes_tower_uri, vscode.Uri.file(addon_path + '/design/自制工具及其源码/PythonOverride/npc_heroes_tower.kv'),{overwrite: true});
						vscode.workspace.fs.copy(vscode.Uri.file(addon_path + '/design/4.kv配置表/npc_heroes_tower_skin.xlsx'), vscode.Uri.file(addon_path + '/design//自制工具及其源码/PythonOverride/npc_heroes_tower_skin.xlsx'),{overwrite: true});
						vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(addon_path + '/design/自制工具及其源码/PythonOverride/kv.exe'));
					}else if(quickPick.value === step_2_items[3]) {
						// 覆盖kv
						vscode.workspace.fs.copy(vscode.Uri.file(addon_path + '/design/自制工具及其源码/PythonOverride/npc_heroes_tower_skin.kv'), vscode.Uri.file(addon_path + '/game/dota_td/scripts/npc/kv/npc_heroes_tower_skin.kv'),{overwrite: true});
						quickPick.hide();
					}
					break;
				default:
					break;
			}
			
		});*/
	});

	context.subscriptions.push(SkinTool);
}

// this method is called when your extension is deactivated
export function deactivate() {}
