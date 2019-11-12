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
					var heroLeft = 0;
					var heroRight = 0;
					if (lineText.search(element[6]) !== -1) {
						outputData += '\t"' + element[0] + '"\n';
						var AttachWearables = false;
						var leftBrackets = 0;
						var rightBrackets = 0;
						for (let index = line + 1; index < document.lineCount; index++) {
							var text = document.lineAt(index).text;
							var heroLeftArr = text.match('{');
							if (heroLeftArr !== null) {
								heroLeft += heroLeftArr.length;
							}
							var heroRightArr = text.match('}');
							if (heroRightArr !== null) {
								heroRight += heroRightArr.length;
							}
							if (heroLeft !== 0 && heroLeft === heroRight) {
								heroLeft = 0;
								heroRight = 0;
								outputData += '\t}\n';
								break;
							}
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
					} else {
						// outputData += lineText;
					}
				}
			}
			outputData += '}';
			fs.writeFileSync(heroSkinKVUri,outputData);
			vscode.window.setStatusBarMessage('生成完毕..');
		});
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
			});
		}
	});

	context.subscriptions.push(SkinTool);
}

// this method is called when your extension is deactivated
export function deactivate() {}
