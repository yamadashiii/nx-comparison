/* global $, Koukun */

// ==================================================
// 関数・クラス定義
// ==================================================
(function(undefined) {
	
	var _Message = Koukun.NxComparison.Message;
	var _Constant = Koukun.NxComparison.Constant;
	
	function MainManager() {
		// Constructor
		
		this.itemInterfacePath = _Constant.get("path_item_interface");
		this.itemImagePath = _Constant.get("path_item_image");
		this.itemDataPath = _Constant.get("path_item_data") + "?v=" + _Message.get("data_version");
		this.textDataPath = _Constant.get("path_text_data") + "?v=" + _Message.get("data_version");
		
		if (_Message.getLanguage() === "en") {
			this.itemDataPath = _Constant.get("path_item_data_en") + "?v=" + _Message.get("data_version");
			this.textDataPath = _Constant.get("path_text_data_en") + "?v=" + _Message.get("data_version");
		}
		
		this.keyword = "";
		this.isExcludeNoNx = false;
		
		this.itemData = null;
		this.textData = null;
		this.itemIndexTable = {};
		
		this.selectGroup = null;
		this.selectItem = null;
		this.tooltipLeft = null;
		this.tooltipRight = null;
		
		this.$languageSelect = $(".language-switcher").find("select");
		this.$reloadPage = $(".nxc-reload-page");
		this.$progressMessage = $(".nxc-progress-message");
		this.$progressBar = $(".nxc-progress-bar");
		this.$progressBarChild = this.$progressBar.find("div");
		this.progressBarWidth = parseInt(this.$progressBar.css("width").replace("px", ""));
	}
	
	MainManager.prototype = {
		// Instance members
		
		// Public
		initialize: function() {
			this._setEventHandler();
			this._setItemIndexTable();
			this._createSelect();
			this._createTooltip();
			this._restoreSearchState();
			this._restoreSelectedState();
		},
		
		loadDataSource: function() {
			var that = this;
			var $dfd_ItemData = new $.Deferred();
			var $dfd_TextData = new $.Deferred();
			var totalSize = 2;
			var loadedCount = 0;
			
			$.getJSON(this.itemDataPath, function(response) {
				that.itemData = response;
				loadedCount++;
				that._updateProgress.call(that, loadedCount / totalSize);
				$dfd_ItemData.resolve();
			});
			
			$.getJSON(this.textDataPath, function(response) {
				that.textData = response;
				loadedCount++;
				that._updateProgress.call(that, loadedCount / totalSize);
				$dfd_TextData.resolve();
			});
			
			return $.when($dfd_ItemData, $dfd_TextData);
		},
		
		// Private
		_saveSearchState: function() {
			$.cookie("nxc-search-state", this.keyword, {expires: 100});
		},
		
		_restoreSearchState: function() {
			var searchState = $.cookie("nxc-search-state");
			
			if (searchState) {
				$("#nxc-search input").val(searchState);
			}
		},
		
		_restoreSelectedState: function() {
			var history = $.cookie("nxc-history-" + _Message.getLanguage());
			
			if (history) {
				this.selectGroup.select("history");
			}
		},
		
		_saveHistory: function(itemId) {
			var history = $.cookie("nxc-history-" + _Message.getLanguage());
			var index;
			history = history ? history.split(",") : [];
			index = history.indexOf("" + itemId);
			
			if (index != -1) {
				history.splice(index, 1);
			}
			
			history.unshift(itemId);
			
			if (history.length > _Constant.get("cookie_history_length")) {
				history.pop();
			}
			
			$.cookie("nxc-history-" + _Message.getLanguage(), history.join(","), {expires: 100});
		},
		
		_updateProgress: function(rate) {
			if (rate < 1) {
				this.$progressBarChild.css("width", this.progressBarWidth * rate);
				this.$progressMessage.text(_Message.get("loading_data") + (rate * 100) + "%");
			} else {
				this.$reloadPage.hide();
				this.$progressMessage.hide();
				this.$progressBar.hide();
			}
		},
		
		_setItemIndexTable: function() {
			var that = this;
			
			$.each(this.itemData, function(index, _item) {
				that.itemIndexTable[_item.Id] = index;
			});
		},
		
		_setViewText: function() {
			if (_Message.getLanguage() !== "en") {
				return
			}
			
			$(".nxc-setting-form span").text("Exclude CANNOT Grinding");
			$(".nxc-serch-form input").attr("placeholder", "Item name");
			$(".nxc-serch-form button").text("Search");
			$(".nxc-btn-download-captcha").text("Save as image");
			$(".nxc-progress-message").text("Loading... 0%");
			$(".nxc-reload-page span").eq(0).text("Please reload if loading does not end.");
			$(".nxc-reload-page span").eq(1).text("If even after reloading useless reports please browser in use in the comments.");
		},
		
		_setEventHandler: function() {
			var that = this;
			var isExcludeNoNx = this.isExcludeNoNx = $.cookie("nxc-is-exclude-no-nx") === "true" ? true : false;
			
			// Language Switcher
			this.$languageSelect.on("change", $.proxy(this.onChangeLangSwitch, this));
			
			$("#nxc-check-exclude-nonx").attr("checked", isExcludeNoNx);
			$("#nxc-check-exclude-nonx").on("click", function(evt) {
				that.isExcludeNoNx = $(this).is(":checked");
				that.selectGroup.reselect();
				$.cookie("nxc-is-exclude-no-nx", that.isExcludeNoNx, {expires: 100});
			});
			$("#nxc-search input").on("keydown", function (evt) {
				if (evt.keyCode === 13) { // Enter
					that.onSearch();
				}
			});
			$("#nxc-search button").on("click", $.proxy(this.onSearch, this));
			
			if (window.Uint8Array && window.URL && window.Blob) {
				$(".nxc-btn-download-captcha").on("click", $.proxy(this.onClick_downloadCaptcha, this));
			} else {
				$(".nxc-btn-download-captcha").hide();
			}
		},
		
		_setLanguageInputValue: function() {
			this.$languageSelect.val(_Message.getLanguage());
		},
		
		_createSelect: function() {
			var iconPath = this.itemInterfacePath + "group-icon-";
			var typeName = _Message.get("item_type");
			var groupDivides = {
				weapon: [18,20,21,22,23,24,25,26,28,29,30,32,33,54,55,56,57,58,61],
				protector: [0,1,6,7,2,5,4,3,16,17,8,9,10,11],
				special: [19,27,31, 59]
			};
			var optionsData = {
				weapon: [],
				protector: [],
				special: []
			};
			
			$.each(groupDivides, function(groupType, divides) {
				$.each(divides, function(divideIndex, itemType) {
					optionsData[groupType].push({
						key: itemType,
						icon: "<img src='" + iconPath + itemType + ".png' />",
						value: typeName[itemType]
					});
				});
			});
			
			var selectGroupOption = {
				selectWidth: 120,
				listWidth: 440,
				optionWidth: 54,
				isPanelView: true, // panel view
				initText: _Message.get("select_init_type"),
				selectIcon: _Message.get("select_icon"),
				openListenerType: "hover",
				onClick_option: $.proxy(this.onClick_selectGroup, this)
			};
			var selectGroupData = [
				{
					groupName: _Message.get("type_group_weapon"),
					options: optionsData.weapon
				},
				{
					groupName: _Message.get("type_group_protector"),
					options: optionsData.protector
				},
				{
					groupName: _Message.get("type_group_special"),
					options: optionsData.special
				},
				{
					groupName: _Message.get("type_group_search"),
					options: [
						{key: "search", icon: "<img src='" + iconPath + "search.png' />", value: _Message.get("type_search_item")},
						{key: "history", icon: "<img src='" + iconPath + "history.png' />", value: _Message.get("type_history")}
					]
				}
			];
			var selectItemOption = {
				selectWidth: 185,
				listWidth: 400,
				optionWidth: 119,
				initText: _Message.get("select_init_item"),
				selectIcon: _Message.get("select_icon"),
				openListenerType: "hover",
				onClick_option: $.proxy(this.onClick_selectItem, this)
			};
			var selectItemData = [];
			
			// Create Select
			this.selectGroup = new Koukun.cl.UI_Select(selectGroupOption, selectGroupData);
			this.selectItem = new Koukun.cl.UI_Select(selectItemOption, selectItemData);
			
			$("#nxc-select-group").append(this.selectGroup.getContainer());
			$("#nxc-select-item").append(this.selectItem.getContainer());
		},
		
		_createTooltip: function() {
			this.tooltipLeft = new Koukun.cl.UI_TooltipFrame();
			this.tooltipRight = new Koukun.cl.UI_TooltipFrame();
			
			// Introduction
			
			$("#nxc-tooltip-left").append(this.tooltipLeft.getFrame());
			$("#nxc-tooltip-right").append(this.tooltipRight.getFrame());
		},
		
		_isDisplayable_BasicInformation: function(item) {
			if (item.Rank == "NX" || item.Rank == "EX") { return true; }
			if (item.AtParam.Min || item.AtParam.Max) { return true; }
			if (item.AtParam.Range) { return true; }
			if (item.Food) { return true; }
			if (item.OpPrt.length) { return true; }
			if (item.OpBit.length) { return true; }
			return false;
		},
		
		_isDisplayable_EnhancedInformation:function(item) {
			if (item.OpNxt.length) { return true; }
			return false;
		},
		
		_isDisplayable_RequiredAbility: function(item) {
			if (!$.isEmptyObject(item.Require)) { return true; }
			return false;
		},
		
		_isDisplayable_JobAvailable: function(item) {
			if (item.Job.length) { return true; }
			return false;
		},
		
		_setItemDetails: function(item) {
			var that = this;
			var bullet = _Message.get("common_bullet");
			var nxitem = this._getItem_by_Id(item.NxId);
			var r_breaktag = /<br \/>/;
			var row_count = [0, 0];
			var i;
			
			var isDifferent = false;
			var isValueDifferent = {};
			var arrItems = [item, nxitem];
			var arrTooltips = [this.tooltipLeft, this.tooltipRight];
			
			this.tooltipLeft.clearContent();
			this.tooltipRight.clearContent();
			
			if (nxitem) {
				this.tooltipRight.getFrame().show();
			} else {
				this.tooltipRight.getFrame().hide();
			}
			
			/* images
			----------------------------------- */
			isDifferent = false;
			
			if (nxitem) {
				if (item.ImageId != item.ImageId) {
					isDifferent = true;
				}
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item || !_item.ImageId) {
					return;
				}
				
				var $row = $("<div>");
				var $imageArea = $("<div>").addClass("item-image");
				var image_path = that.itemImagePath + _item.ImageId + ".png";
				var rank_path, grade_path;
				
				$imageArea.append("<img src='" + image_path + "'>");
				
				if (item.Rank !== "N") {
					rank_path = that.itemInterfacePath + "type-icon-" + _item.Rank + ".gif";
					$imageArea.append("<img class='item-rank' src='" + rank_path + "'>");
				}
				
				if (item.Grade !== "N") {
					grade_path = that.itemInterfacePath + "type-icon-" + _item.Grade + ".gif";
					$imageArea.append("<img class='item-grade' src='" + grade_path + "'>");
				}
				
				if (isDifferent) {
					$row.addClass("item-different-line");
				}
				
				arrTooltips[index].addContent($row.html($imageArea));
			});
			
			/* name
			----------------------------------- */
			isDifferent = false;
			
			if (nxitem) {
				if (item.Name !== nxitem.Name) {
					isDifferent = true;
				}
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item || !_item.Name) {
					return;
				}
				
				var $row = $("<div>");
				var item_name = replaceTextColor(_item.Name);
				var $itemName = $("<span>").html(item_name);
				
				if (_item.Rank !== "N") {
					$itemName.addClass("item-name-" + _item.Rank);
				}
				
				if (isDifferent) {
					$row.addClass("item-different-line");
				}
				
				arrTooltips[index].addContent($row.html($itemName));
			});
			
			/* basic info tag
			----------------------------------- */
			$.each(arrItems, function(index, _item) {
				if (!_item || !that._isDisplayable_BasicInformation(_item)) {
					return;
				}
				
				var info_tag = _Message.get("group_basic_information");
				var $row = $("<div>").html(info_tag).addClass("item-info-tag");
				
				arrTooltips[index].addContent($row);
			});
			
			/* offense
			----------------------------------- */
			isDifferent = false;
			
			if (nxitem) {
				isDifferent = !compareArrays(
					[item.AtParam.Min, item.AtParam.Max, item.AtParam.Range],
					[nxitem.AtParam.Min, nxitem.AtParam.Max, nxitem.AtParam.Range]
				);
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item) {
					return;
				}
				
				var $row = $("<div>");
				var _AtMin = _item.AtParam.Min || 0;
				var _AtMax = _item.AtParam.Max || 0;
				var _AtSpeed = _item.AtParam.Speed || 0;
				var OP = "";
				var OS = "";
				
				if (_AtMin !== 0 || _AtMax !== 0) {
					OP = scanf(_Message.get("content_offense_point"), _AtMin, _AtMax);
					
					if (_AtSpeed) {
						OS = " (" + scanf(_Message.get("content_offense_speed"), (_AtSpeed / 100).toFixed(2)) + ")";
					}
					
					if (isDifferent) {
						$row.addClass("item-different-line");
					}
					
					arrTooltips[index].addContent($row.html(bullet + OP + OS));
				}
			});
			
			/* shooting range
			----------------------------------- */
			isDifferent = false;
			
			if (nxitem) {
				if (item.AtParam.Range !== nxitem.AtParam.Range) {
					isDifferent = true;
				}
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item) {
					return;
				}
				
				var $row = $("<div>");
				var range = _item.AtParam.Range || 0;
				var SR = "";
				
				if (range !== 0) {
					SR = scanf(_Message.get("content_shooting_range"), range);
					
					if (isDifferent) {
						$row.addClass("item-different-line");
					}
					
					arrTooltips[index].addContent($row.html(bullet + SR));
				}
			});
			
			/* prt
			----------------------------------- */
			row_count = [0, 0];
			isDifferent = false;
			
			for (i = 0; i < 4; i++) {
				isValueDifferent[i] = false;
			}
			
			if (item && nxitem) {
				isDifferent = !compareArrays(
					item.ValueTable,
					nxitem.ValueTable
				);
				
				for (i = 0; i < 4; i++) {
					if (item.OpPrt[i] && nxitem.OpPrt[i]) {
						isValueDifferent[i] = !compareArrays(
							[item.OpPrt[i].Id, item.OpPrt[i].ValueIndex],
							[nxitem.OpPrt[i].Id, nxitem.OpPrt[i].ValueIndex]
						);
					} else {
						isValueDifferent[i] = true;
					}
				}
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item) {
					return;
				}
				
				var _ValueTable = _item.ValueTable;
				
				$.each(_item.OpPrt, function(optionIndex, optionData) {
					var $row = $("<div>");
					var opText = replaceTextData(that.textData.OptionProper[optionData.Id]);
					var opValues1 = _ValueTable[optionData.ValueIndex[0]];
					var opValues2 = _ValueTable[optionData.ValueIndex[1]];
					var strOpValue1 = "";
					var strOpValue2 = "";
					var matched = null;
					
					if (opValues1) {
						if (opValues1[0] == opValues1[1]) {
							strOpValue1 = opValues1[0];
						} else {
							strOpValue1 = "[" + opValues1.join("~") + "]";
						}
					}
					
					if (opValues2) {
						if (opValues2[0] == opValues2[1]) {
							strOpValue2 = opValues2[0];
						} else {
							strOpValue2 = "[" + opValues2.join("~") + "]";
						}
					}
					
					if (isDifferent || isValueDifferent[optionIndex]) {
						$row.addClass("item-different-line");
					}
					
					$row.html(bullet + scanfTextDataValue(opText, strOpValue1, strOpValue2));
					arrTooltips[index].addContent($row);
					
					// row count
					matched = opText.match(r_breaktag);
					
					if (matched) {
						row_count[index] += matched.length;
					}
					
					row_count[index]++;
				});
			});
			
			$.each(arrItems, function(index, _item) {
				var sub_row_count = row_count[(index + 1) % 2] - row_count[index];
				var $row;
				
				for (i = 0; i < sub_row_count; i++) {
					$row = $("<div>").text(bullet + _Message.get("content_nodata")).addClass("text-color-GRAY");
					arrTooltips[index].addContent($row);
				}
			});
			
			/* minipet foodtype
			----------------------------------- */
			isDifferent = false;
			
			if (nxitem) {
				if (item.Food !== nxitem.Food) {
					isDifferent = true;
				}
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item) {
					return;
				}
				
				var $row = $("<div>");
				var petFoodType = _item.Food;
				var FT;
				
				if (petFoodType !== 0) {
					FT = scanf(_Message.get("content_minipet_food_type"), _Message.get("minipet_food_type")[petFoodType]);
					
					if (isDifferent) {
						$row.addClass("item-different-line");
					}
					
					arrTooltips[index].addContent($row.html(bullet + FT));
				}
			});
			
			/* bit
			----------------------------------- */
			row_count = [0, 0];
			
			for (i = 0; i < 6; i++) {
				isValueDifferent[i] = false;
			}
			
			if (item && nxitem) {
				for (i = 0; i < 6; i++) {
					if (item.OpBit[i] && nxitem.OpBit[i]) {
						isValueDifferent[i] = !compareArrays(
							[item.OpBit[i].Id, item.OpBit[i].Value],
							[nxitem.OpBit[i].Id, nxitem.OpBit[i].Value]
						);
					} else {
						isValueDifferent[i] = true;
					}
				}
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item) {
					return;
				}
				
				$.each(_item.OpBit, function(optionIndex, optionData) {
					var $row = $("<div>");
					var opText = replaceTextData(that.textData.OptionBasic[optionData.Id]);
					var opValues = optionData.Value;
					var matched = null;
					
					if (isValueDifferent[optionIndex]) {
						$row.addClass("item-different-line");
					}
					
					var rowText = scanfTextDataValue(opText, opValues[0], opValues[1], opValues[2]);
					
					// スキルレベル系列
					rowText = rowText.replace(/(.+?)(\(.+?)(\d+)(.+系列 職業\))/, function(match, p1, p2, p3, p4) {
						var jobText = replaceTextData("[" + _Message.get("job_type")[p3] + "]")
						return jobText + " " + p1;
					});
					
					$row.html(bullet + rowText);
					arrTooltips[index].addContent($row);
					
					// row count
					matched = opText.match(r_breaktag);
					
					if (matched) {
						row_count[index] += matched.length;
					}
					
					row_count[index]++;
				});
			});
			
			$.each(arrItems, function(index, _item) {
				var sub_row_count = row_count[(index + 1) % 2] - row_count[index];
				var $row;
				
				for (i = 0; i < sub_row_count; i++) {
					$row = $("<div>").text(bullet + _Message.get("content_nodata")).addClass("text-color-GRAY");
					arrTooltips[index].addContent($row);
				}
			});
			
			/* enhanced information tag
			----------------------------------- */
			$.each(arrItems, function(index, _item) {
				if (index === 0) { // If item
					if (!_item.NxId) {
						return;
					}
				}
				
				if (index == 1) { // If nxitem
					if (!_item || !that._isDisplayable_EnhancedInformation(_item)) {
						return;
					}
				}
				
				var info_tag = _Message.get("group_enhanced_information");
				var $row = $("<div>").html(info_tag).addClass("item-info-tag");
				
				arrTooltips[index].addContent($row);
			});
			
			/* enhanced information
			----------------------------------- */
			row_count = [0, 0];
			
			for (i = 0; i < 6; i++) {
				isValueDifferent[i] = false;
			}
			
			if (item && nxitem) {
				for (i = 0; i < 6; i++) {
					if (item.OpNxt[i] && nxitem.OpNxt[i]) {
						isValueDifferent[i] = !compareArrays(
							[item.OpNxt[i].Id, item.OpNxt[i].Value],
							[nxitem.OpNxt[i].Id, nxitem.OpNxt[i].Value]
						);
					} else {
						isValueDifferent[i] = true;
					}
				}
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item) {
					return;
				}
				
				$.each(_item.OpNxt, function(optionIndex, optionData) {
					var $row = $("<div>");
					var opText = replaceTextData(that.textData.OptionBasic[optionData.Id]);
					var opValues = optionData.Value;
					var matched = null;
					
					if (isValueDifferent[optionIndex]) {
						$row.addClass("item-different-line");
					}
					
					$row.html(bullet + scanfTextDataValue(opText, opValues[0], opValues[1], opValues[2]));
					arrTooltips[index].addContent($row);
					
					// row count
					matched = opText.match(r_breaktag);
					
					if (matched) {
						row_count[index] += matched.length;
					}
					
					row_count[index]++;
				});
			});
			
			$.each(arrItems, function(index, _item) {
				var sub_row_count = row_count[(index + 1) % 2] - row_count[index];
				var $row;
				
				for (i = 0; i < sub_row_count; i++) {
					$row = $("<div>").text(bullet + _Message.get("content_nodata")).addClass("text-color-GRAY");
					arrTooltips[index].addContent($row);
				}
			});
			
			/* required ability tag
			----------------------------------- */
			$.each(arrItems, function(index, _item) {
				if (!_item || !that._isDisplayable_RequiredAbility(_item)) {
					return;
				}
				
				var info_tag = _Message.get("group_required_ability");
				var $row = $("<div>").html(info_tag).addClass("item-info-tag");
				
				arrTooltips[index].addContent($row);
			});
			
			/* required ability
			----------------------------------- */
			row_count = [0, 0];
			
			for (i = 0; i < 6; i++) {
				isValueDifferent[i] = false;
			}
			
			if (item && nxitem) {
				for (i = 0; i < 6; i++) {
					if (item.Require[i] !== nxitem.Require[i]) {
						isValueDifferent[i] = true;
					}
				}
				
				if (item.Require.Extra) {
					if (nxitem.Require.Extra) {
						if (item.Require.Extra.StatusType !== item.Require.Extra.StatusType ||
							item.Require.Extra.MulValue !== item.Require.Extra.MulValue ||
							item.Require.Extra.ValueIndex !== item.Require.Extra.ValueIndex) {
							isValueDifferent[item.Require.Extra.StatusType] = true;
						}
					} else {
						isValueDifferent[item.Require.Extra.StatusType] = true;
					}
				}
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item) {
					return;
				}
				
				$.each(_item.Require, function(key, requireData) {
					var $row = $("<div>");
					var statusName = "";
					var _MultiplValue = null;
					var values = [];
					var _ValueTable = _item.ValueTable;
					var strValue = "";
					var RA = "";
					
					if (key != "Extra") {
						statusName = _Message.get("status_type")[key];
						strValue = requireData;
						RA = scanf(_Message.get("content_required_ability"), statusName, strValue);
					} else {
						statusName = _Message.get("extra_status_type")[requireData.StatusType];
						_MultiplValue = requireData.MulValue;
						values = _ValueTable[requireData.ValueIndex];
						strValue = scanf(_Message.get("content_extra_status_value"), _MultiplValue, values[0], values[1]);
						RA = scanf(_Message.get("content_required_ability"), statusName, strValue);
					}
					
					if (isValueDifferent[key]) {
						$row.addClass("item-different-line");
					}
					
					arrTooltips[index].addContent($row.html(bullet + RA));
					
					// row count
					row_count[index]++;
				});
			});
			
			$.each(arrItems, function(index, _item) {
				var sub_row_count = row_count[(index + 1) % 2] - row_count[index];
				var $row;
				
				for (i = 0; i < sub_row_count; i++) {
					$row = $("<div>").text(bullet + _Message.get("content_nodata")).addClass("text-color-GRAY");
					arrTooltips[index].addContent($row);
				}
			});
			
			/* job available tag
			----------------------------------- */
			$.each(arrItems, function(index, _item) {
				if (!_item || !that._isDisplayable_JobAvailable(_item)) {
					return;
				}
				
				var info_tag = _Message.get("group_job_available");
				var $row = $("<div>").html(info_tag).addClass("item-info-tag");
				
				arrTooltips[index].addContent($row);
			});
			
			/* job available
			----------------------------------- */
			row_count = [0, 0];
			
			for (i = 0; i < 6; i++) {
				isValueDifferent[i] = false;
			}
			
			if (nxitem) {
				var jobDataLength = Math.max(item.Job.length, nxitem.Job.length);
				
				for (i = 0; i < jobDataLength; i++) {
					if (item.Job[i] !== nxitem.Job[i]) {
						isValueDifferent[i] = true;
					}
				}
			}
			
			$.each(arrItems, function(index, _item) {
				if (!_item) {
					return;
				}
				
				$.each(item.Job, function(jobIndex, jobType) {
					var $row = $("<div>");
					var jobName = _Message.get("job_type")[jobType];
					
					if (isValueDifferent[jobIndex]) {
						$row.addClass("item-different-line");
					}
					
					arrTooltips[index].addContent($row.html(bullet + jobName));
					
					// row count
					row_count[index]++;
				});
			});
			
			$.each(arrItems, function(index, _item) {
				var sub_row_count = row_count[(index + 1) % 2] - row_count[index];
				var $row;
				
				for (i = 0; i < sub_row_count; i++) {
					$row = $("<div>").text(bullet + _Message.get("content_nodata")).addClass("text-color-GRAY");
					arrTooltips[index].addContent($row);
				}
			});
			
			/* Yotuba Item DataBase Link
			----------------------------------- */
			if (_Message.getLanguage() === "ja") {
				$("#nxc-yotuba-link").html(scanf(_Message.get("message_yotsuba_link"), removeTags(item.Name), item.Name));
			}
		},
		
		_search_of_ItemType: function(key, value) {
			var i, item, groupIndex;
			var groupsData = [
				{groupName: _Message.get("item_group_normal"), options: []},
				{groupName: _Message.get("item_group_deluxe"), options: []}
			];
			
			for (i = 0; i < this.itemData.length; i++) {
				item = this.itemData[i];
				
				if (item.Rank == "NX") {
					continue;
				}
				
				if (this.isExcludeNoNx && item.NxId === 0) {
					continue;
				}
				
				if (item.Type == key) {
					groupIndex = item.Grade == "DX" ? 1 : 0;
					groupsData[groupIndex].options.push({
						key: item.Id,
						icon: item.NxId > 0 && "<span class='nxc-exist-nx-icon'>Nx</span> ",
						value: removeTags(item.Name)
					});
				}
			}
			
			groupsData[0].options.sort(sortOrder_of_selectValue);
			groupsData[1].options.sort(sortOrder_of_selectValue);
			
			this.selectItem.reset({}, groupsData);
			this.selectItem.select();
		},
		
		_serch_of_History: function() {
			var i, item, itemId, groupIndex;
			var groupsData = [
				{groupName: scanf(_Message.get("message_history_group_name"), _Constant.get("cookie_history_length")), options: []}
			];
			
			
			var history = $.cookie("nxc-history-" + _Message.getLanguage());
			
			history = history ? history.split(",") : [];
			
			for (i = 0; i < history.length; i++) {
				itemId = parseInt(history[i]);
				item = this._getItem_by_Id(itemId);
				
				if (item.Rank == "NX") {
					continue;
				}
				
				if (this.isExcludeNoNx && item.NxId === 0) {
					continue;
				}
				
				groupsData[0].options.push({
					key: item.Id,
					icon: item.NxId > 0 && "<span class='nxc-exist-nx-icon'>Nx</span> ",
					value: removeTags(item.Name)
				});
			}
			
			//groupsData[0].options.sort(sortOrder_of_selectValue);
			//groupsData[1].options.sort(sortOrder_of_selectValue);
			
			this.selectItem.reset({}, groupsData);
			this.selectItem.select();
		},
		
		_search_of_ItemName: function(key, value) {
			var i, item, r_keyword, itemName, groupIndex;
			var matchCount = 0;
			var groupsData = [
				{groupName: _Message.get("item_group_normal"), options: []},
				{groupName: _Message.get("item_group_deluxe"), options: []}
			];
			
			this.keyword = $("#nxc-search input").val();
			
			if (this.keyword !== "") {
				r_keyword = new RegExp("(" + this.keyword + ")");
				
				for (i = 0; i < this.itemData.length; i++) {
					item = this.itemData[i];
					
					if (item.Rank == "NX") {
						continue;
					}
					
					if (this.isExcludeNoNx && item.NxId === 0) {
						continue;
					}
					
					itemName = item.Name.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
					
					if (r_keyword.test(itemName)) {
						groupIndex = item.Grade == "DX" ? 1 : 0;
						matchCount++;
						
						groupsData[groupIndex].options.push({
							key: item.Id,
							icon: item.NxId > 0 && "<span class='nxc-exist-nx-icon'>Nx</span> ",
							value: removeTags(item.Name).replace(r_keyword, "<span class='nxc-search-keyword'>$1</span>")
						});
					}
				}
			}
			
			groupsData[0].options.sort(sortOrder_of_selectValue);
			groupsData[1].options.sort(sortOrder_of_selectValue);
			
			this.selectItem.reset({}, groupsData);
			this.selectItem.select();
			
			this.selectGroup.setSelectText(scanf(_Message.get("message_search_result"), matchCount));
		},
		
		_getItem_by_Id: function(itemId) {
			return this.itemData[this.itemIndexTable[itemId]];
		},
		
		// Event
		onChangeLangSwitch: function() {
			var nextLanguage = this.$languageSelect.val();
			$.cookie(_Constant.get("cookie_key_localize"), nextLanguage, {
				expires: _Constant.get("cookie_expires")
			});
			document.location.reload(true);
		},
		
		onSearch: function() {
			this.selectGroup.select("search");
		},
		
		onClick_selectGroup: function(key, value) {
			this.tooltipLeft.clearContent();
			this.tooltipRight.clearContent();
			
			switch (key) {
				case "search":
					this._search_of_ItemName();
					this._saveSearchState();
					break;
				case "history":
					this._serch_of_History();
					break;
				default:
					this._search_of_ItemType(key);
					break;
			}
		},
		
		onClick_selectItem: function(itemId, value, isTriggered) {
			var item = this._getItem_by_Id(itemId);
			
			if (item) {
				this._setItemDetails(item);
				
				// 履歴を保存
				if (!isTriggered) {
					this._saveHistory(itemId);
				}
			}
		},
		
		onClick_downloadCaptcha: function() {
			var that = this;
			
			html2canvas($(".nxc-main-index").get(0), {
				onrendered: function(canvas) {
					var blob = canvasToBlob(canvas);
					var selectedItemName = that.selectItem.getSelectedValue() || "未選択";
					var downloadName = selectedItemName.replace(/<.*?>/g, '');
					var downloadLink = $(".nxc-captcha-link").attr({
						href: window.URL.createObjectURL(blob),
						download: scanf(_Message.get("message_download_link"), downloadName)
					});
					
					if (window.navigator.msSaveBlob) {
						window.navigator.msSaveBlob(blob, downloadName + ".png");
					} else {
						if (document.createEvent && window.dispatchEvent) {
							var ev = document.createEvent('MouseEvents');
							ev.initEvent("click", true, true);
							downloadLink[0].dispatchEvent(ev);
						} else {
							downloadLink[0].click();
						}
					}
				}
			});
		}
	};
	
	function sortOrder_of_selectValue(a, b) {
		if (a.value < b.value) {
			return -1;
		}
		if (a.value > b.value) {
			return 1;
		}
		return 0;
	}
	
	function removeTags(str) {
		// <font color="...">abc</font> -> abc
		return str.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
	}
	
	function compareArrays(arr1, arr2) {
		var i;
		
		if (arr1 instanceof Array && arr2 instanceof Array) {
			if (arr1.length != arr2.length) {
				return false;
			}
			
			for (i = 0; i < arr1.length; i++) {
				if (arr1[i] !== arr2[i]) {
					if (!compareArrays(arr1[i], arr2[i])) {
						return false;
					}
				}
			}
		} else {
			return false;
		}
		
		return true;
	}
	
	function scanf(format) {
		var i;
		var output = format;
		
		for (i = 1; i < arguments.length; i++) {
			output = output.replace(/%[cdfosx]/, arguments[i]);
		}
		
		return output;
	}
	
	function replaceTextData(org) {
		var coloring_ltyellow = scanf(_Message.get("content_coloring"), "LTYELLOW", "$1");
		org = org
			.replace(/(%d)?%a/g, "<br />")
			.replace(/(\[[^\]]*?)(\d)(.*?\])/g, "$1%v$2$3")
			.replace(/\[(.*?)\]/g, coloring_ltyellow);
		
		return replaceTextColor(org);
	}
	
	function replaceTextColor(org) {
		return org.replace(/<c:([^> ]+?)>(.+?)<n>/g, function(str, matched1, matched2) {
			return scanf(_Message.get("content_coloring"), matched1, matched2);
		});
	}
	
	function scanfTextDataValue(format) {
		var args = arguments;
		
		return format.replace(/%v(\d)/g, function(org, matched) {
			return args[parseInt(matched) + 1];
		}).replace(/[+-]([+-])/g, "$1");
	}
	
	function canvasToBlob(canvas) {
		var dataType = "image/png";
		var dataURL = canvas.toDataURL(dataType);
		var bin = atob(dataURL.replace(/^.*,/, ""));
		var buffer = new Uint8Array(bin.length);
	
		for (var i = 0; i < bin.length; i++) {
			buffer[i] = bin.charCodeAt(i);
		}
	
		return new Blob([buffer.buffer], {
			type: dataType
		});
	}
	
	$.extend(Koukun.NxComparison, {
		MainManager: MainManager
	});
})();


// ==================================================
// メイン
// ==================================================
(function() {
	$(document).ready(function() {
		var mainManager = new Koukun.NxComparison.MainManager();
		
		mainManager._setViewText();
		mainManager._setLanguageInputValue();
		
		mainManager.loadDataSource().done(function() {
			mainManager.initialize();
		}).fail(function() {
			alert(Koukun.NxComparison.Message.get("error_read_file"));
		});
	});
})();
