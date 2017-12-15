// ========================================================
// 下拉选择框
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

(function () {
	if (VRender.Component.Combobox)
		return ;

	var Utils = VRender.Utils;
	var ComboboxRender = VRender.Component.Render.combobox;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UICombobox = window.UICombobox = Component.Combobox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		if (this.isRenderAsApp()) {
			if (this.isNative()) {
				renderDropdownListAsSelect.call(this, $, this.$el);
				this.$el.children("select").on("change", selectInputChangeHandler.bind(this));
			}
		}

		if (!(this.isRenderAsApp() && this.isNative())) {
			this.tap(".ipt", iptClickHandler.bind(this));
		}

		if (this.$el.is(".editable")) {
			this.$el.on("keydown", "input", inputKeyHandler.bind(this));
			this.$el.on("keyup", "input", inputKeyHandler.bind(this));
			this.$el.on("focusin", "input", inputFocusHandler.bind(this));
			this.$el.on("focusout", "input", inputFocusHandler.bind(this));
		}
	};
	var _UICombobox = UICombobox.prototype = new Component.list();

	UICombobox.find = function (view) {
		return Component.find(view, ".ui-combobox", UICombobox);
	};

	UICombobox.create = function (options) {
		return Component.create(options, UICombobox, ComboboxRender);
	};

	// ====================================================
	_UICombobox.getData = function () {
		var datas = [];
		var _datas = Component.list.doAdapter.call(this, this.options.data);
		Utils.each(_datas, function (data) {
			if (Utils.isArray(data)) {
				Utils.each(data, function (temp) {
					if (temp)
						datas.push(temp);
				});
			}
			else if (data) {
				datas.push(data);
			}
		});
		return datas;
	};

	_UICombobox.setData = function (value) {
		value = Component.list.doAdapter.call(this, value);
		this.options.data = value;
		Component.list.setSelectedIndex.call(this, []);
		if (this.isRenderAsApp() && this.isNative()) {
			this.$el.children("select").remove();
			renderDropdownListAsSelect.call(this, $, this.$el);
			this.$el.children("select").on("change", selectInputChangeHandler.bind(this));
		}
		else if (this.dropdownList) {
			this.dropdownList.setData(value);
		}
		setActive.call(this, []); // 重置了
	};

	_UICombobox.setSelectedIndex = function (index, trigger) {
		var indexs = Component.list.setSelectedIndex.call(this, value);

		if (this.dropdownList)
			this.dropdownList.setSelectedIndex(indexs);
		else /*if (this.isNative())*/ {
			var select = this.$el.children("select");
			var options = select.children("option").removeAttr("select");
			Utils.each(indexs, function (index) {
				options.eq(index).attr("select", "select");
			});
		}

		setActive.call(this, indexs, this.getSelectedData(true), trigger);
	};

	_UICombobox.val = function (value) {
		if (Utils.isBlank(value)) {
			return this.$el.find(".ipt > input").val();
		}
		else {
			var match = matchText.call(this, value);
			this.setSelectedIndex((match ? match[0] : -1), false);
		}
	};

	_UICombobox.setDisabled = function (disabled) {
		if (typeof disabled === "undefined" || disabled === null)
			disabled = true;
		if (Utils.isTrue(disabled)) {
			this.$el.addClass("disabled").attr("disabled", "disabled");
			this.$el.find(".ipt > input").attr("disabled", "disabled");
		}
		else {
			this.$el.removeClass("disabled").removeAttr("disabled");
			this.$el.find(".ipt > input").removeAttr("disabled");
		}
	};

	_UICombobox.isNative = function () {
		return this.$el.attr("opt-native") == 1;
	};

	// 可输入的情况是否强制匹配项
	_UICombobox.isMatchRequired = function () {
		return this.$el.attr("opt-match") == 1;
	};

	// ====================================================
	var iptClickHandler = function (e) {
		var target = $(e.target);

		if (this.isRenderAsApp()) {
			if (this.$el.is(".editable") && !target.is(".dropdownbtn")) // native 不会进来
				return ;
		}
		else {
			if (this.$el.is(".editable") && target.is(".dropdownbtn")) {
				this.$el.find(".ipt > input").focus();
			}
		}

		showDropdown.call(this);
		initDropdownList.call(this);
	};

	var comboMouseHandler = function (e) {
		if (e.type === "mouseenter") {
			if (this.mouseTimerId) {
				clearTimeout(this.mouseTimerId);
				this.mouseTimerId = 0;
			}
		}
		else /*if (e.type === "mouseleave")*/ {
			if (isDropdownVisible.call(this)) {
				var self = this;
				this.mouseTimerId = setTimeout(function () {
					self.mouseTimerId = 0;
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

	var dropdownChangeHandler = function (e) {
		var indexs = this.dropdownList.getSelectedIndex(true);
		var datas = this.dropdownList.getSelectedData(true);
		setActive.call(this, indexs, datas, true);
		hideDropdown.call(this);
	};

	var inputKeyHandler = function (e) {
		if (e.type === "keydown") {
			if (!this.isRenderAsApp()) {
				showDropdown.call(this);
				this.$el.off("mouseenter").off("mouseleave");
			}
		}
		else if (e.type === "keyup") {
			var input = $(e.currentTarget), text = input.val();
			if (e.which === 13) {
				if (this.isRenderAsApp()) {
					doInputSubmit.call(this);
				}
				else {
					hideDropdown.call(this);
					var index = this.dropdownList.getSelectedIndex(true);
					if (index && index.length > 0) {
						if (!Component.list.equalIndex(this._lastSelectedIndex, index)) {
							this._lastSelectedIndex = index;
							setActive.call(this, index, this.dropdownList.getSelectedData(true), true);
							input.select();
						}
					}
					else {
						this._lastSelectedIndex = -1;
						setActive.call(this, [], null, true);
						if (!this.isMatchRequired())
							input.val(text).select();
					}
				}
			}
			else if (e.which === 38 || e.which === 40) { // 上、下箭头
				if (!this.isRenderAsApp()) {
					var index = this.dropdownList.getSelectedIndex(true);
					index = (index && index.length > 0) ? index[0] : -1;
					if (e.which === 38 && index > 0)
						index -= 1;
					if (e.which === 40 && index < this.dropdownList.length() - 1)
						index += 1;
					this.dropdownList.setSelectedIndex(index);
				}
			}
			else {
				if (text && text.length > 0)
					this.$el.addClass("has-val");
				else
					this.$el.removeClass("has-val");
				if (!this.isRenderAsApp()) {
					var match = matchText.call(this, text, true);
					this.dropdownList.setSelectedIndex(match ? match[0] : -1);
				}
			}
		}
	};

	var inputFocusHandler = function (e) {
		if (e.type === "focusin") {
			if (!this.focusOutTimerId) // focusout 事件未结束
				this._lastSelectedIndex = this.getSelectedIndex();
		}
		else if (e.type === "focusout") {
			doInputSubmit.call(this);

			if (isDropdownVisible.call(this)) {
				var self = this;
				// 延迟，如果是点击，要在DropdownList Change之后执行
				this.focusOutTimerId = setTimeout(function () {
					self.focusOutTimerId = 0;
					hideDropdown.call(self);
				}, 250);
			}
		}
	};

	// ====================================================
	var doInputSubmit = function () {
		var input = this.$el.find(".ipt > input");
		var text = input.val();

		var match = matchText.call(this, text, this.isMatchRequired());
		match = match || [-1, null];

		if (this.dropdownList)
			this.dropdownList.setSelectedIndex(match[0]);
		else {
			var select = this.$el.children("select");
			if (select && select.length > 0)
				select.get(0).selectedIndex = match[0];
		}

		setActive.call(this, match[0], match[1], false);
		if (match[0] < 0 && !this.isMatchRequired()) {
			input.val(text);
			if (text && text.length > 0)
				this.$el.addClass("has-val");
		}

		if (!Component.list.equalIndex(this._lastSelectedIndex, match[0])) {
			this._lastSelectedIndex = match[0];
			this.trigger("change", match[1]);
		}
	};

	var setActive = function (indexs, datas, trigger) {
		var self = this;
		datas = Utils.toArray(datas);
		var labels = Utils.map(datas, function (data) {
			return self.getDataLabel(data);
		});

		Component.list.setSelectedIndex.call(this, indexs);
		this.$el.find(".ipt > input").val(labels.join(",") || "");

		if (datas && datas.length > 0)
			this.$el.addClass("has-val");
		else
			this.$el.removeClass("has-val");

		if (Utils.isTrue(trigger))
			this.trigger("change", datas);
	};

	var matchText = function (text, like, start) {
		if (Utils.isBlank(text))
			return null;
		var datas = this.getData() || [];
		for (var i = 0, l = datas.length; i < l; i++) {
			var data = datas[i];
			var label = this.getDataLabel(data) || "";
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

	var initDropdownList = function () {
		var target = this.$el.children(".ui-dropdownlist");
		if (this.isRenderAsApp()) {
			if (this.isNative())
				return ;
			target = target.children("ul");
		}
		var selectedItem = target.find(".item.selected");
		if (selectedItem && selectedItem.length > 0) {
			var targetTop = target.offset().top;
			var targetHeight = target.innerHeight();
			var itemTop = selectedItem.offset().top;
			var itemHeight = selectedItem.innerHeight();
			var scrollTop = target.scrollTop();
			if (targetTop > itemTop) {
				target.scrollTop(scrollTop - (targetTop - itemTop));
			}
			else if (itemTop > targetTop + targetHeight) {
				target.scrollTop(scrollTop + (itemTop - targetTop - targetHeight + itemHeight));
			}
		}
		else {
			// target.scrollTop(0);
		}
	};

	var isDropdownVisible = function () {
		return this.$el.is(".show-dropdown");
	};

	var showDropdown = function () {
		if (isDropdownVisible.call(this))
			return ;

		if (!this.dropdownList) {
			this.dropdownList = renderDropdownList.call(this, $, this.$el);
			this.dropdownList.on("change", dropdownChangeHandler.bind(this));
		}

		this.$el.addClass("show-dropdown").removeClass("show-before");

		var self = this;
		if (this.isRenderAsApp()) {
			if (!this.isNative()) {
				$("html,body").addClass("ui-noscroll");
				setTimeout(function () {
					$("body").on("tap.combobox", function (e) { appTouchTapHandler.call(self, e); });
				}, 50);
			}
		}
		else {
			var bottomHeight = $(window).height() + $("html").scrollTop() + $("body").scrollTop();
			var scroller = $(this.$el.attr("opt-scroll"));
			if (scroller && scroller.length > 0)
				bottomHeight = scroller.offset().top + scroller.outerHeight();
			var dropdown = this.$el.children(".ui-dropdownlist");
			var dropdownHeight = dropdown.offset().top + dropdown.outerHeight();
			if (bottomHeight < dropdownHeight)
				this.$el.addClass("show-before");

			this.$el.on("mouseenter", function (e) { return comboMouseHandler.call(self, e); });
			this.$el.on("mouseleave", function (e) { return comboMouseHandler.call(self, e); });

			// 这里要取消 focusout 事件，不然选项显示不了
			// 移动端点击按钮时，tap 在 foucsout 之前执行，这样选项被 foucsout 隐藏了
			setTimeout(function () {
				if (self.focusOutTimerId) {
					clearTimeout(self.focusOutTimerId);
					self.focusOutTimerId = 0;
				}
			}, 100);
		}
	};

	var hideDropdown = function () {
		$("html,body").removeClass("ui-noscroll");
		if (isDropdownVisible.call(this)) {
			this.$el.removeClass("show-dropdown");
			this.$el.off("mouseenter").off("mouseleave");
			$("body").off("tap.combobox");
		}
	};

	// 只适用前端
	var renderDropdownList = function ($, target) {
		var options = {};
		options.data = this.options.data;
		options.labelField = this.getLabelField();
		options.labelFunction = this.getLabelFunction();
		options.itemRenderer = this.getItemRenderer();
		options.dataAdapter = this.getDataAdapter();
		options.dataMapper = this.getDataMapper();
		options.multiple = this.isMultiple();
		options.selectedIndex = this.getSelectedIndex();
		options.selectedId = this.getSelectedId();
		options.style = "popup";
		options.target = target;
		return VRender.Component.DropdownList.create(options);
	};

	// 只适用前端
	var renderDropdownListAsSelect = function ($, target) {
		var select = $("<select size='1'></select>").appendTo(target);

		if (this.isMultiple())
			select.attr("multiple", "multiple");
		else {
			select.append("<option disabled='disabled' selected='selected'>请选择..</option>");
		}

		if (Utils.isArray(this.options.data)) {
			var self = this, index = 0;
			var selectedIndex = this.getSelectedIndex(true);
			var selectedId = this.getSelectedId(true) || null;
			var addItem = function (target, data) {
				if (data) {
					var item = $("<option></option>").appendTo(target);
					item.text(self.getDataLabel(data, index));
					item.attr("ind", index).data("itemData", data);
					if (self.isDataSelected(data, index, selectedIndex, selectedId))
						item.attr("selected", "selected");
				}
				index += 1;
			};
			Utils.each(this.options.data, function (data) {
				if (Utils.isArray(data)) {
					Utils.each(data, function (temp) {
						addItem(select, temp);
					});
				}
				else if (Utils.isNotBlank(data)) {
					addItem(select, data);
				}
			});
		}

		return select;
	};


	///////////////////////////////////////////////////////
	Component.register(".ui-combobox", UICombobox);

})(typeof VRender !== "undefined");
