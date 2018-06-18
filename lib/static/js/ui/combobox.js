// ========================================================
// 下拉选择框
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

(function () {
	if (VRender.Component.Combobox)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var ComboboxRender = Renderer.combobox;

	///////////////////////////////////////////////////////
	var UICombobox = window.UICombobox = Component.Combobox = function (view, options) {
		if (!Component.base.isElement(view))
			return UICombobox.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		var target = this.$el;
		if (this.isRenderAsApp() && this.isNative()) {
			target.find("select").on("change", selectInputChangeHandler.bind(this));
		}
		else {
			if (this.isRenderAsApp()) {
				target.on("tap", ".dropdown", dropdownTouchHandler.bind(this));
			}
			target.on("tap", ".ipt", iptClickHandler.bind(this));
			target.on("tap", ".item", itemClickHandler.bind(this));
			target.on("tap", ".ui-more", moreClickHandler.bind(this));
		}

		if (target.is(".editable")) {
			target.on("keydown", "input", inputKeyDownHandler.bind(this));
			target.on("keyup", "input", inputKeyUpHandler.bind(this));
			target.on("focusin", "input", inputFocusInHandler.bind(this));
			target.on("focusout", "input", inputFocusOutHandler.bind(this));
		}
	};
	var _UICombobox = UICombobox.prototype = new Component.select();

	UICombobox.find = function (view) {
		return Component.find(view, ".ui-combobox", UICombobox);
	};

	UICombobox.create = function (options) {
		return Component.create(options, UICombobox, ComboboxRender);
	};

	// ====================================================
	_UICombobox.getData = function (original) {
		if (original) {
			this.options.data = this._doAdapter(this.options.data);
			return this.options.data;
		}
		else {
			return ComboboxRender.getDataFlat.call(this);
		}
	};

	_UICombobox.setSelectedIndex = function (value) {
		var snapshoot = this._snapshoot();
		var indexs = Component.select.setSelectedIndex.call(this, value);
		Utils.each(this._getItems(), function (item, i) {
			setItemActive(item, (indexs.indexOf(i) >= 0));
		});
		if (!indexs || indexs.length == 0) {
			this.$el.find("select").val("");
		}
		selectChanged.call(this);
		snapshoot.done();
	};

	// ====================================================
	_UICombobox.addItem = function (data, index) {
		index = Utils.getIndexValue(index);
		data = Renderer.fn.doAdapter.call(this, data, index) || {};

		var datas = this.getData(true);
		var beInsert = false;
		if (index >= 0) {
			loopData.call(this, datas, function (_data, _index, _array, _subIndex) {
				if (index == _index) {
					_array.splice(_subIndex, 0, data);
					beInsert = true;
					return false;
				}
			});
		}
		if (!beInsert) {
			if (datas.length > 0)
				datas[datas.length - 1].push(data);
			else
				datas.push([data]);
		}

		var newItem = this._getNewItem($, this._getItemContainer());
		this._renderOneItem($, newItem, data, index);

		if (beInsert && index >= 0) {
			this._getItems().eq(index).before(newItem);
			Component.select.updateSelection.call(this);
		}

		return newItem;
	};

	_UICombobox.updateItem = function (data, index) {
		data = Renderer.fn.doAdapter.call(this, data, index);
		if (!index && index !== 0)
			index = this.getDataIndex(data);
		else
			index = Utils.getIndexValue(index);
		if (index >= 0) {
			var self = this;
			var datas = this.getData(true);
			var oldItem = null;
			loopData.call(this, datas, function (_data, _index, _array, _subIndex) {
				if (index == _index) {
					_array.splice(_subIndex, 1, data);

					var newItem = self._getNewItem($, self._getItemContainer());
					self._renderOneItem($, newItem, data, index);

					var items = self._getItems();
					oldItem = items.eq(index).before(newItem).remove();
					if (oldItem.is(".selected"))
						setItemActive(newItem, true);

					return false;
				}
			});
			Component.select.updateSelection.call(this);
			if (oldItem && oldItem.is(".selected"))
				selectChanged.call(this);
		}
		return index;
	};

	_UICombobox.removeItemAt = function (index) {
		index = Utils.getIndexValue(index);
		if (index >= 0) {
			var item = this._getItems().eq(index);
			if (item && item.length > 0) {
				var group = item.parent();
				item.remove();
				if (group.children().length == 0)
					group.remove();
			}

			var datas = this.getData(true);
			var removeData = null;
			loopData.call(this, datas, function (_data, _index, _array, _subIndex) {
				if (index == _index) {
					removeData = _array.splice(_subIndex, 1);
					if (_array.length == 0) {
						Utils.remove(datas, function (tmp) {
							return tmp == _array;
						});
					}
					return false;
				}
			});

			Component.select.updateSelection.call(this);
			if (item.is(".selected"))
				selectChanged.call(this);

			return removeData;
		}
		return null;
	};

	// ====================================================
	_UICombobox.val = function (value) {
		if (Utils.isNull(value)) {
			var selectedIndex = this.getSelectedIndex(true);
			if (selectedIndex && selectedIndex > 0) {
				return this.getSelectedKey();
			}
			if (this.isEditable())
				return this.$el.find(".ipt > input").val();
			return null;
		}
		var snapshoot = this._snapshoot();
		var match = matchText.call(this, value);
		if (match)
			this.setSelectedIndex(match[0]);
		else {
			this.setSelectedIndex(-1);
			if (!this.isMatchRequired()) {
				this.$el.find(".ipt > input").val(value);
				setValueFlag.call(this, Utils.isNotBlank(value));
			}
		}
		snapshoot.done();
		return this;
	};

	_UICombobox.isNative = function () {
		return this.$el.attr("opt-native") == 1;
	};

	_UICombobox.isEditable = function () {
		return this.$el.is(".editable");
	};

	// 可输入的情况是否强制匹配项
	_UICombobox.isMatchRequired = function () {
		return this.$el.attr("opt-match") == 1;
	};

	// ====================================================
	_UICombobox._getItemContainer = function () {
		return this.$el.children(".dropdown").children(".box");
	};

	_UICombobox._renderItems = function ($, itemContainer, datas) {
		var datas = datas || this.getData(true);
		ComboboxRender.renderItems.call(this, $, this.$el, itemContainer, datas);
	};

	_UICombobox._renderOneItem = function ($, item, data, index) {
		if (this.isRenderAsApp() && this.isNative()) {
			item.text(this._getDataLabel(data, index));
		}
		else {
			Component.item.renderOneItem.call(this, $, item, data, index);
		}
	};

	_UICombobox._getNewItem = function ($, itemContainer, data, index) {
		if (this.isRenderAsApp() && this.isNative()) {
			var select = itemContainer.children("select");
			return $("<option class='item'></option>").appendTo(select);
		}
		else {
			var group = itemContainer.children(".grp").last();
			if (!group || group.length == 0)
				group = $("<div class='grp'></div>").appendTo(itemContainer);
			return $("<div class='item'></div>").appendTo(group);
		}
	};

	_UICombobox._getItems = function (selector) {
		var items = this._getItemContainer().find(".item");
		if (selector)
			items = items.filter(selector);
		return items;
	};

	_UICombobox._isItemSelected = function (item) {
		return item.is(".selected") || item.is(":selected");
	};

	_UICombobox._setItemSelected = function (item, beSelected) {
		setItemActive.call(this, item, beSelected);
	};

	_UICombobox._loadBefore = function () {
		if (this.isRenderAsApp() && this.isNative())
			return ;
		var itemContainer = this._getItemContainer();
		itemContainer.find(".ui-load, .ui-more").remove();
		if (this.isRenderAsApp() && this.isNative()) {
			var loadText = this._getLoadText();
			loadText = Utils.isNull(loadText) ? "正在加载.." : Utils.trimToEmpty(loadText);
			if (loadText) {
				var select = itemContainer.children("select");
				$("<option class='ui-load'></option>").appendTo(select).text(loadText);
			}
		}
		else {
			Renderer._item.renderLoadView.call(this, $, itemContainer);
		}
	};

	_UICombobox._loadAfter = function () {
		if (this.isRenderAsApp() && this.isNative())
			return ;
		var itemContainer = this._getItemContainer();
		itemContainer.find(".ui-load").remove();
		if (this.hasMore()) {
			this.$el.addClass("has-more");
			if (this.isRenderAsApp() && this.isNative()) {
				var moreText = this._getMoreText();
				moreText = Utils.isNull(moreText) ? "加载更多" : Utils.trimToEmpty(moreText);
				if (moreText) {
					var select = itemContainer.children(".select");
					$("<option class='ui-more'></option>").appendTo(select).text(moreText);
				}
			}
			else {
				Renderer._item.renderMoreView.call(this, $, itemContainer);
			}
		}
		else {
			this.$el.removeClass("has-more");
		}
	};

	_UICombobox._snapshoot_shoot = function (state) {
		state.selectedIndex = this.getSelectedIndex();
		state.value = this.$el.find(".ipt > input").val() || "";
		state.data = this.getSelectedData();
	};

	_UICombobox._snapshoot_compare = function (state) {
		var value = this.$el.find(".ipt > input").val() || "";
		if (state.value != value)
			return false;
		var selectedIndex = this.getSelectedIndex();
		return Renderer.fn.equalIndex(selectedIndex, state.selectedIndex);
	};

	_UICombobox._doAdapter = function (datas) {
		return ComboboxRender.doAdapter.call(this, datas);
	};

	_UICombobox._rerender = function () {
		var self = this;
		var renderInner = function () {
			var selectedIndex = self.getSelectedIndex();

			var itemContainer = self._getItemContainer();
			if (itemContainer && itemContainer.length > 0) {
				self._renderItems($, itemContainer.empty(), self.getData());
			}

			self.setSelectedIndex(selectedIndex);
		};
		renderInner._name = "ui.combobox." + this.getViewId();
		Utils.debounce(renderInner, 0);
	};

	// ====================================================
	var iptClickHandler = function (e) {
		var target = $(e.target);

		if (this.isRenderAsApp()) {
			// 移动端，可输入的情况下，点击下拉按钮显示下拉列表，否则退出
			if (this.isEditable() && !target.is(".dropdownbtn"))
				return ;
		}
		else {
			if (this.isEditable() && target.is(".dropdownbtn")) {
				this.$el.find(".ipt > input").focus();
			}
		}

		showDropdown.call(this);
		// initDropdownList.call(this);
	};

	var itemClickHandler = function (e) {
		var item = $(e.currentTarget);

		if (item.is(".selected") && !this.isMultiple())
			return false;

		var snapshoot = this._snapshoot();
		if (item.is(".selected")) {
			setItemActive(item, false);
		}
		else {
			if (!this.isMultiple())
				setItemActive(this._getItems(".selected"), false);
			setItemActive(item, true);
		}
		Component.select.updateSelection.call(this);
		selectChanged.call(this);
		snapshoot.done();

		if (!this.isMultiple())
			hideDropdown.call(this);

		return false;
	};

	var moreClickHandler = function (e) {
		this.more();
	};

	// 按下“上”、“下”箭头切换选项
	var inputKeyDownHandler = function (e) {
		if (this.isRenderAsApp())
			return ;

		showDropdown.call(this);
		this.$el.off("mouseenter").off("mouseleave"); // 这样不会自动隐藏

		if (e.which == 38 || e.which == 40) { // 上、下箭头
			if (this.isMultiple())
				return ; // 多选的时候不做切换
			var index = this.getSelectedIndex();
			if (e.which == 38) {
				if (index > 0)
					index -= 1;
			}
			else if (e.which == 40) {
				if (index < this.length() - 1)
					index += 1;
			}
			this.setSelectedIndex(index);
		}
	};

	var inputKeyUpHandler = function (e) {
		var input = $(e.currentTarget);
		if (e.which == 13) {
			hideDropdown.call(this);
			var snapshoot = this._snapshoot();
			var indexs = Component.select.updateSelection.call(this);
			if (indexs && indexs.length > 0) {
				selectChanged.call(this);
			}
			else if (this.isMatchRequired()) {
				input.val("");
			}
			input.select();
			snapshoot.done();
		}
		else if (!Utils.isControlKey(e) || e.which == 8) { // Backspace
			var text = input.val();
			setValueFlag.call(this, (text && text.length > 0));
			var match = matchText.call(this, text, true);
			var items = setItemActive(this._getItems(), false);
			this.$el.find("select").val("");
			if (match && match[0] >= 0)
				setItemActive(items.eq(match[0]), true);
		}
	};

	var inputFocusInHandler = function (e) {
		if (this.t_focus) {
			clearTimeout(this.t_focus);
			this.t_focus = 0;
		}
	};

	var inputFocusOutHandler = function (e) {
		var input = $(e.currentTarget);
		var self = this;
		this.t_focus = setTimeout(function () {
			self.t_focus = 0;
			if (isDropdownVisible.call(self)) {
				var text = input.val();
				var match = matchText.call(self, text, false);
				if (match && match[0] >= 0) {
					self.setSelectedIndex(match[0]);
				}
				else if (self.isMatchRequired()) {
					match = matchText.call(self, text, true);
					self.setSelectedIndex(match ? match[0] : -1);
				}
				else {
					var snapshoot = self._snapshoot();
					self.setSelectedIndex(-1);
					input.val(text);
					setValueFlag.call(self, (text && text.length > 0));
					snapshoot.done();
				}
				hideDropdown.call(self);
			}
		}, 200);
	};

	var comboMouseHandler = function (e) {
		Renderer.fn.mouseDebounce(e, hideDropdown.bind(this));
	};

	var dropdownTouchHandler = function (e) {
		if ($(e.target).is(".dropdown"))
			hideDropdown.call(this);
	};

	var selectInputChangeHandler = function (e) {
		var snapshoot = this._snapshoot();
		this._getItems().removeClass("selected");
		Component.select.updateSelection.call(this);
		selectChanged.call(this);
		snapshoot.done();
	};


	// ====================================================
	var selectChanged = function () {
		var self = this;
		var datas = this.getSelectedData(true);
		var labels = Utils.map(datas, function (data) {
			return self._getDataLabel(data);
		});
		this.$el.find(".ipt > input").val(labels.join(",") || "");
		setValueFlag.call(this, (datas && datas.length > 0));
	};

	var matchText = function (text, like, start) {
		if (Utils.isBlank(text))
			return null;
		var self = this;
		var result = null;
		loopData.call(this, this.getData(true), function (data, index, array, subIndex) {
			var label = self._getDataLabel(data) || "";
			if (text == label) {
				result = [index, data];
				return false;
			}
			if (like && text.length < label.length) {
				var _index = label.indexOf(text);
				if (_index == 0 || (_index > 0 && !start)) {
					result = [index, data];
					return false;
				}
			}
		});
		return result;
	};

	var setItemActive = function (item, isActive) {
		if (isActive)
			item.addClass("selected").attr("selected", "selected");
		else
			item.removeClass("selected").removeAttr("selected");
		return item;
	};

	var setValueFlag = function (hasValue) {
		if (hasValue)
			this.$el.addClass("has-val");
		else
			this.$el.removeClass("has-val");
	};

	var isDropdownVisible = function () {
		return this.$el.is(".show-dropdown");
	};

	var showDropdown = function () {
		if (isDropdownVisible.call(this))
			return ;

		var target = this.$el.addClass("show-dropdown");

		if (this.isRenderAsApp()) { // 不会是 native
			$("html,body").addClass("ui-scrollless");
		}
		else {
			target.on("mouseenter", comboMouseHandler.bind(this));
			target.on("mouseleave", comboMouseHandler.bind(this));

			var dropdown = target.children(".dropdown");
			var maxHeight = Renderer.fn.getDropdownHeight.call(this, dropdown);
			var offset = Utils.offset(dropdown, this._getScrollContainer(), 0, maxHeight);
			if (offset.isOverflowY)
				target.addClass("show-before");
		}

		// 这里要取消 focusout 事件，不然选项显示不了
		// 移动端点击按钮时，tap 在 foucsout 之前执行，这样选项被 foucsout 隐藏了
		var self = this;
		setTimeout(function () {
			if (self.t_focus) {
				clearTimeout(self.t_focus);
				self.t_focus = 0;
			}
		}, 100);

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);
	};

	var hideDropdown = function () {
		$("html,body").removeClass("ui-scrollless");

		var target = this.$el.addClass("animate-out");
		target.off("mouseenter").off("mouseleave");

		setTimeout(function () {
			target.removeClass("show-dropdown").removeClass("show-before");
			target.removeClass("animate-in").removeClass("animate-out");
		}, 300);
	};

	var loopData = function (datas, callback) {
		var index = 0;
		for (var i = 0; i < datas.length; i++) {
			var data = datas[i];
			if (Utils.isArray(data) && data.length > 0) {
				for (var j = 0; j < data.length; j++) {
					if (callback(data[j], index, data, j) === false)
						return ;
					index += 1;
				}
			}
			else {
				if (callback(data, index, datas, i) === false)
					return ;
				index += 1;
			}
		}
	};

	// var initDropdownList = function () {
	// 	if (this.isRenderAsApp() && this.isNative())
	// 		return ;
	// 	var target = this.$el.children(".dropdown");
	// 	var selectedItem = target.find(".item.selected");
	// 	if (selectedItem && selectedItem.length > 0) {
	// 		selectedItem = selectedItem.eq(0);
	// 		var targetTop = target.offset().top;
	// 		var targetHeight = target.innerHeight();
	// 		var itemTop = selectedItem.offset().top;
	// 		var itemHeight = selectedItem.innerHeight();
	// 		var scrollTop = target.scrollTop();
	// 		if (targetTop > itemTop) {
	// 			target.scrollTop(scrollTop - (targetTop - itemTop));
	// 		}
	// 		else if (itemTop > targetTop + targetHeight) {
	// 			target.scrollTop(scrollTop + (itemTop - targetTop - targetHeight + itemHeight));
	// 		}
	// 	}
	// 	else {
	// 		// target.scrollTop(0);
	// 	}
	// };


	///////////////////////////////////////////////////////
	Component.register(".ui-combobox", UICombobox);

})();