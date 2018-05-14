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
		if (this.init(view, options) !== this)
			return Component.get(view);

		var target = this.$el;

		if (this.isRenderAsApp() && this.isNative()) {

		}
		else {
			target.on("tap", ".ipt", iptClickHandler.bind(this));
			target.on("tap", ".item", itemClickHandler.bind(this));
		}

		if (target.is(".editable")) {
			target.on("keydown", "input", inputKeyDownHandler.bind(this));
			target.on("keyup", "input", inputKeyUpHandler.bind(this));
			target.on("focusin", "input", inputFocusInHandler.bind(this));
			target.on("focusout", "input", inputFocusOutHandler.bind(this));
		}

		// if (this.isRenderAsApp()) {
		// 	if (this.isNative()) {
		// 		renderDropdownListAsSelect.call(this, $, this.$el);
		// 		this.$el.children("select").on("change", selectInputChangeHandler.bind(this));
		// 	}
		// }
	};
	var _UICombobox = UICombobox.prototype = new Component.select();

	UICombobox.find = function (view) {
		return Component.find(view, ".ui-combobox", UICombobox);
	};

	UICombobox.create = function (options) {
		return Component.create(options, UICombobox, ComboboxRender);
	};

	// ====================================================
	_UICombobox.setSelectedIndex = function (value) {
		var snapshoot = this._snapshoot();
		var indexs = Component.select.setSelectedIndex.call(this, value);
		Utils.each(this._getItems(), function (item, i) {
			setItemActive(item, (indexs.indexOf(i) >= 0));
		});
		selectChanged.call(this);
		snapshoot.done();
	};

	_UICombobox.getSelectedData = function (needArray) {
		var datas = ComboboxRender.getDataFlat.call(this);
		return Component.select.getSelectedData.call(this, needArray, datas);
	};
	// _UICombobox.getData = function () {
	// 	// return Component.Render.dropdownlist.getData.call(this);
	// };

	// _UICombobox.setData = function (value) {
	// 	// var snapshoot = this._snapshoot();

	// 	// value = ComboboxRender.dataFormat.call(this, value);
	// 	// this.options.data = Component.Render.dropdownlist.doAdapter.call(this, value);

	// 	// setActive.call(this, [], []); // 重置了，不触发事件

	// 	// if (this.isRenderAsApp() && this.isNative()) {
	// 	// 	this.$el.children("select").remove();
	// 	// 	renderDropdownListAsSelect.call(this, $, this.$el);
	// 	// 	this.$el.children("select").on("change", selectInputChangeHandler.bind(this));
	// 	// }
	// 	// else if (this.dropdownList) {
	// 	// 	this.dropdownList.setData(this.options.data); // 这里不应该触发事件
	// 	// }

	// 	// this._dataChanged("set", this.options.data);
	// 	// snapshoot.done([], []);
	// };

	// _UICombobox.setSelectedIndex = function (index) {
	// 	var snapshoot = this._snapshoot();

	// 	var indexs = Component.list.getIntValues.call(this, index, 0);
	// 	setActive.call(this, indexs); // 不触发事件

	// 	if (this.dropdownList)
	// 		this.dropdownList.setSelectedIndex(indexs);
	// 	else if (this.isNative()) {
	// 		var select = this.$el.children("select");
	// 		var options = select.children("option").removeAttr("select");
	// 		Utils.each(indexs, function (index) {
	// 			options.eq(index).attr("select", "select");
	// 		});
	// 	}

	// 	snapshoot.done(indexs);
	// };

	// _UICombobox.setDisabled = function (disabled) {
	// 	if (typeof disabled === "undefined" || disabled === null)
	// 		disabled = true;
	// 	if (Utils.isTrue(disabled)) {
	// 		this.$el.addClass("disabled").attr("disabled", "disabled");
	// 		this.$el.find(".ipt > input").attr("disabled", "disabled");
	// 	}
	// 	else {
	// 		this.$el.removeClass("disabled").removeAttr("disabled");
	// 		this.$el.find(".ipt > input").removeAttr("disabled");
	// 	}
	// };

	_UICombobox.length = function () {
		return this._getItems().length;
	};

	// ====================================================
	_UICombobox.val = function (value) {
		if (Utils.isNull(value)) {
			return this.$el.find(".ipt > input").val();
		}
		else {
			var snapshoot = this._snapshoot();
			var match = matchText.call(this, value);
			if (match)
				this.setSelectedIndex(match[0]);
			else {
				this.setSelectedIndex(-1);
				if (!this.isMatchRequired()) {
					this.$el.find(".ipt > input").val(value);
				}
			}
			snapshoot.done();
		}
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
		var datas = datas || this.getData();
		ComboboxRender.renderItems.call(this, $, this.$el, itemContainer, datas);
	};

	_UICombobox._getItems = function (selector) {
		var items = this._getItemContainer().find(".item");
		if (selector)
			items = items.filter(selector);
		return items;
	};

	_UICombobox._snapshoot_shoot = function (state) {
		state.selectedIndex = this.getSelectedIndex();
		state.value = this.$el.find(".ipt > input").val() || "";
		state.data = this.getSelectedData();
	};

	_UICombobox._snapshoot_compare = function (state) {
		var value = this.$el.find(".ipt > input").val() || "";
		if (state.value != value)
			return true;
		var selectedIndex = this.getSelectedIndex();
		return Renderer.fn.equalIndex(selectedIndex, state.selectedIndex);
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

		hideDropdown.call(this);
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
		if (e.type === "mouseenter") {
			if (this.t_mouse) {
				clearTimeout(this.t_mouse);
				this.t_mouse = 0;
			}
		}
		else /*if (e.type === "mouseleave")*/ {
			if (isDropdownVisible.call(this)) {
				var self = this;
				this.t_mouse = setTimeout(function () {
					self.t_mouse = 0;
					hideDropdown.call(self);
				}, 500);
			}
		}
	};

	var appTouchTapHandler = function (e) {
		if ($(e.target).is(".ui-dropdownlist"))
			hideDropdown.call(this);
	};

	var selectInputChangeHandler = function (e) {
		var selectedIndexs = [];
		var selectedDatas = [];
		
		var items = this.$el.children("select").find(":selected");
		Utils.each(items, function (item) {
			selectedIndexs.push(item.attr("ind"));
			selectedDatas.push(item.data("itemData"));
		});

		setActive.call(this, selectedIndexs, selectedDatas, true);
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

	// var setActive = function (indexs, datas, autoTrigger) {
	// 	var snapshoot = autoTrigger ? this._snapshoot() : null;

	// 	indexs = Component.list.setSelectedIndex.call(this, indexs);

	// 	var self = this;
	// 	datas = datas || this.getSelectedData(true);
	// 	var labels = Utils.map(datas, function (data) {
	// 		return self._getDataLabel(data);
	// 	});
	// 	labels = labels.join(",") || "";
	// 	this.$el.find(".ipt > input").val(labels);

	// 	if (datas && datas.length > 0)
	// 		this.$el.addClass("has-val");
	// 	else
	// 		this.$el.removeClass("has-val");

	// 	if (autoTrigger) {
	// 		snapshoot.done(indexs);
	// 	}
	// };

	var matchText = function (text, like, start) {
		if (Utils.isBlank(text))
			return null;
		var datas = ComboboxRender.getDataFlat.call(this) || [];
		for (var i = 0, l = datas.length; i < l; i++) {
			var data = datas[i];
			var label = this._getDataLabel(data) || "";
			if (text == label)
				return [i, data];
			if (like && text.length < label.length) {
				var index = label.indexOf(text);
				if (index == 0 || (index > 0 && !start)) {
					return [i, data];
				}
			}
		}
		return null;
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

		var target = this.$el.addClass("show-dropdown").removeClass("show-before");

		var self = this;
		if (this.isRenderAsApp()) {
			$("html,body").addClass("ui-scrollless");
			setTimeout(function () {
				$("body").on("tap.combobox", appTouchTapHandler.bind(self));
			}, 50);
		}
		else {
			var bottomHeight = $(window).height() + $("html").scrollTop() + $("body").scrollTop();
			var scroller = $(target.attr("opt-box"));
			if (scroller && scroller.length > 0)
				bottomHeight = scroller.offset().top + scroller.outerHeight();
			var dropdown = target.children(".dropdown");
			var dropdownHeight = dropdown.offset().top + dropdown.outerHeight();
			if (bottomHeight < dropdownHeight)
				target.addClass("show-before");

			target.on("mouseenter", comboMouseHandler.bind(this));
			target.on("mouseleave", comboMouseHandler.bind(this));

			// 这里要取消 focusout 事件，不然选项显示不了
			// 移动端点击按钮时，tap 在 foucsout 之前执行，这样选项被 foucsout 隐藏了
			setTimeout(function () {
				if (self.t_focus) {
					clearTimeout(self.t_focus);
					self.t_focus = 0;
				}
			}, 100);
		}
	};

	var hideDropdown = function () {
		$("html,body").removeClass("ui-scrollless");
		if (isDropdownVisible.call(this)) {
			this.$el.removeClass("show-dropdown");
			this.$el.off("mouseenter").off("mouseleave");
			$("body").off("tap.combobox");
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