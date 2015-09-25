/* global $, Koukun */

/*
・やる
	・スキルレベル上昇の文字列を、系列から変換
	・マテリアルデザインにする？
	・UISelectを書き換えて使いやすく
・検討
	・ショートカットキー
	・「最近選択された項目」として上に表示
		→縦に長くなるので逆に使いづらい？
	・「変化量の表示」を追加
		→見づらいので、見やすく表示する工夫
・メモ
	・
*/

// ==================================================
// 名前空間の定義
// ==================================================
(function() {
	$.extend(Koukun, {
		NxComparison: {}
	});
})();


// ==================================================
// 定数の定義
// ==================================================
(function() {
	
	var _constant = {
		cookie_expires: 365,
		cookie_key_localize: "local",
		default_language: "ja",
		path_item_interface: "./img/interface/",
		path_item_image: "./img/item/iconItem_",
		path_item_data: "./data/itemData.json",
		path_item_data_en: "./data/itemData-en.json",
		path_text_data: "./data/textData.json",
		path_text_data_en: "./data/textData-en.json"
	};
	
	$.extend(Koukun.NxComparison, {
		Constant: new Koukun.cl.Resource(_constant)
	});
})();


// ==================================================
// メッセージの定義
// ==================================================
(function() {
	
	var _messages = {
		// -------------------------
		// 英語
		en: {
			minipet_food_type: {
				1: "Biological type",
				2: "Energy type",
				3: "Inorganic type"
			},
			status_type: {
				0: "Level",
				1: "Power",
				2: "Agility",
				3: "Health",
				4: "Wisdom",
				5: "Knowledge",
				6: "Charisma",
				7: "Luck"
			},
			extra_status_type: {
				0: "Level",
				1: "Power",
				2: "Agility",
				3: "Health",
				4: "Charisma",
				5: "Knowledge",
				6: "Wisdom",
				7: "Luck"
			},
			job_type: {
				0: "Squire",
				1: "Warrior",
				2: "Magician",
				3: "Werewolf",
				4: "Priest",
				5: "Fallen Angel",
				6: "Thief",
				7: "Monk",
				8: "Magic Lancer",
				9: "Magic Archer",
				10: "Tamer",
				11: "Summoner",
				12: "Princess",
				13: "Little Witch",
				14: "Necromancer",
				15: "Demon",
				16: "Spiritualist",
				17: "Champion",
				18: "Opticalist",
				19: "Beast Man",
				20: "Maid",
				21: "Demon Sorceress",
				40: "Exclusive masculine Character Item", // original
				41: "Exclusive feminine Character Item"   // original
			},
			item_type: {
				0: "Helmet/Hat",
				1: "Crown",
				2: "Glove",
				3: "Spear throwing",
				4: "Nail",
				5: "Wrist",
				6: "Belt",
				7: "Shoe",
				8: "Necklace",
				9: "Ring",
				10: "Necklace",
				11: "Cape",
				12: "Broach",
				13: "Arm tattoo",
				14: "Shoulder tattoo",
				15: "Cross",
				16: "Armor",
				17: "Job armor",
				18: "One hand sword",
				19: "Shield",
				20: "Both hands sword",
				21: "Cane",
				22: "Tusk",
				23: "Blunt",
				24: "Wing",
				25: "Throwing",
				26: "Bow",
				27: "Arrow",
				28: "Spear",
				29: "Whistle",
				30: "ling",
				31: "Bullet",
				32: "Stick",
				33: "Whips",
				34: "Jewel",
				35: "HP回復",
				36: "CP回復",
				37: "能力向上1",
				38: "能力向上2",
				39: "状態異常回復1",
				40: "状態異常回復2",
				41: "鍵",
				42: "帰還",
				43: "特殊1",
				44: "イベント",
				45: "ステータス上昇",
				46: "魔力補充",
				47: "セッティング宝石",
				48: "イベント・福券",
				49: "クエスト",
				50: "有料アイテム",
				51: "エンチャント・露店",
				52: "アイテムボックス",
				53: "",
				54: "Sickle",
				55: "Crow",
				56: "Book",
				57: "Broom",
				58: "Twin sword",
				59: "Costume",
				60: "クレスト",
				61: "Crystal"
			},
			data_version: "0.0644",
			common_bullet: "- ",
			content_minipet_food_type: "Minipet food type <span class='text-color-LTYELLOW'>%s</span>",
			content_shooting_range: "Shooting range <span class='text-color-LTYELLOW'>%d</span>",
			content_offense_point: "O.P <span class='text-color-LTYELLOW'>%d~%d</span>",
			content_required_ability: "%s <span class='text-color-LTYELLOW'>%s</span>",
			content_extra_status_value: "%d * [%d~%d]",
			content_offense_speed: "<span class='text-color-LTYELLOW'>%f</span>s",
			content_coloring: "<span class='text-color-%s'>%s</span>",
			content_nodata: "nodata",
			select_init_type: "Select category",
			select_init_item: "Select item",
			select_icon: "▼",
			type_group_weapon: "Weapon",
			type_group_protector: "Defensive equipment",
			type_group_special: "Supportive equipment",
			type_group_search: "Search",
			item_group_normal: "Normal",
			item_group_deluxe: "DX",
			type_search_item: "Search",
			group_basic_information: "<span class='text-color-CYAN'>&ltBasic Information&gt</span>",
			group_enhanced_information: "<span class='text-color-CYAN'>&ltGrinding Option Information&gt</span>",
			group_required_ability: "<span class='text-color-CYAN'>&ltRequired Ability&gt</span>",
			group_job_available: "<span class='text-color-CYAN'>&ltPut on/Job available&gt</span>",
			message_search_result: "<span class='nxc-search-result-count'>%d</span> results",
			message_yotsuba_link: "<a href='http://dl.dropboxusercontent.com/u/70568694/ItemDataBase/ItemDataBase.html?Mode=2&keyword=%s' target='_blank'>%s を四つ葉日記で調べる。</a>",
			message_download_link: "nx-comparison-%s.png",
			error_read_file: "Failed to read data.",
			loading_data: "Loading..."
		},
		
		// -------------------------
		// 日本語
		ja: {
			status_type: {
				0: "レベル",
				1: "力",
				2: "敏捷",
				3: "健康",
				4: "知恵",
				5: "知識",
				6: "カリスマ",
				7: "運"
			},
			extra_status_type: {
				0: "レベル",
				1: "力",
				2: "敏捷",
				3: "健康",
				4: "カリスマ",
				5: "知識",
				6: "知恵",
				7: "運"
			},
			minipet_food_type: {
				1: "精霊型",
				2: "自然型",
				3: "神霊型"
			},
			job_type: {
				0: "剣士",
				1: "戦士",
				2: "ウィザード",
				3: "ウルフマン",
				4: "ビショップ",
				5: "追放天使",
				6: "シーフ",
				7: "武道家",
				8: "ランサー",
				9: "アーチャー",
				10: "ビーストテイマ―",
				11: "サマナー",
				12: "プリンセス",
				13: "リトルウィッチ",
				14: "ネクロマンサー",
				15: "悪魔",
				16: "霊術師",
				17: "闘士",
				18: "光奏師",
				19: "獣人",
				20: "メイド",
				21: "黒魔術師",
				40: "男性キャラクター専用", // original
				41: "女性キャラクター専用"  // original
			},
			item_type: {
				0: "兜・帽子",
				1: "冠",
				2: "グローブ",
				3: "槍投擲機",
				4: "爪",
				5: "手首",
				6: "腰",
				7: "足",
				8: "首",
				9: "指輪",
				10: "イヤリング",
				11: "マント",
				12: "ブローチ",
				13: "腕刺青",
				14: "肩刺青",
				15: "十字架",
				16: "鎧",
				17: "職業鎧",
				18: "片手剣",
				19: "盾",
				20: "両手剣",
				21: "杖",
				22: "牙",
				23: "鈍器",
				24: "翼",
				25: "投擲",
				26: "弓",
				27: "矢",
				28: "槍",
				29: "笛",
				30: "スリング",
				31: "弾",
				32: "ステッキ",
				33: "鞭",
				34: "宝石",
				35: "HP回復",
				36: "CP回復",
				37: "能力向上1",
				38: "能力向上2",
				39: "状態異常回復1",
				40: "状態異常回復2",
				41: "鍵",
				42: "帰還",
				43: "特殊1",
				44: "イベント",
				45: "ステータス上昇",
				46: "魔力補充",
				47: "セッティング宝石",
				48: "イベント・福券",
				49: "クエスト",
				50: "有料アイテム",
				51: "エンチャント・露店",
				52: "アイテムボックス",
				53: "",
				54: "鎌",
				55: "クロー",
				56: "本",
				57: "ほうき",
				58: "双剣",
				59: "ｺｽﾁｭｰﾑ",
				60: "クレスト",
				61: "水晶"
			},
			data_version: "0.0622",
			common_bullet: "- ",
			content_minipet_food_type: "ミニペットエサ分類 <span class='text-color-LTYELLOW'>%s</span>",
			content_shooting_range: "射程距離 <span class='text-color-LTYELLOW'>%d</span>",
			content_coloring: "<span class='text-color-%s'>%s</span>",
			content_offense_point: "攻撃力 <span class='text-color-LTYELLOW'>%d~%d</span>",
			content_offense_speed: "<span class='text-color-LTYELLOW'>%f</span>秒",
			content_required_ability: "%s <span class='text-color-LTYELLOW'>%s</span>",
			content_extra_status_value: "%d * [%d~%d]",
			content_nodata: "なし",
			select_init_type: "部類選択",
			select_init_item: "アイテム選択",
			select_icon: "▼",
			type_group_weapon: "武器",
			type_group_protector: "防具",
			type_group_special: "補助",
			type_group_search: "検索",
			item_group_normal: "ノーマル",
			item_group_deluxe: "DX",
			type_search_item: "検索",
			group_basic_information: "<span class='text-color-CYAN'>&lt基本情報&gt</span>",
			group_enhanced_information: "<span class='text-color-CYAN'>&lt錬成 オプション 情報&gt</span>",
			group_required_ability: "<span class='text-color-CYAN'>&lt要求能力値&gt</span>",
			group_job_available: "<span class='text-color-CYAN'>&lt着用/使用可能な職業&gt</span>",
			message_search_result: "検索 <span class='nxc-search-result-count'>%d</span>件",
			message_yotsuba_link: "<a href='http://dl.dropboxusercontent.com/u/70568694/ItemDataBase/ItemDataBase.html?Mode=2&keyword=%s' target='_blank'>%s を四つ葉日記で調べる。</a>",
			message_download_link: "Nx比較一覧_%s.png",
			error_read_file: "データの読み込みに失敗しました。",
			loading_data: "読み込み中..."
		}
	}
	
	
	// -----------------------------------
	// Exports
	$.extend(Koukun.NxComparison, {
		Message: new Koukun.cl.Globalize(_messages)
	});
})();


// ==================================================
// 言語選択
// ==================================================
(function() {
	var _Constant = Koukun.NxComparison.Constant;
	
	var storedLang = $.cookie(_Constant.get("cookie_key_localize"));
	var browserLang = Koukun.fn.getLanguage();
	var defaultLang = _Constant.get("default_language");
	
	Koukun.NxComparison.Message.selectLanguage(storedLang || browserLang || defaultLang);
})();

