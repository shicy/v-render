// ========================================================
// 下拉选择框
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Combobox)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderItems = (isFront ? VRender.Component : require("./base")).HolderItems;

	var getFormatWidth = function (width) {
		if (Utils.isBlank(width))
			return null;
		if (isNaN(width))
			return width;
		return width + "px";
	};

	///////////////////////////////////////////////////////
	var Holder = function (context, options) {
		HolderItems.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderItems();

	_Holder.render = function ($, target) {
		HolderItems.render.call(this, $, target);
		target.addClass("ui-combobox");
		target.css("width", getFormatWidth(this.options.width));

		if (Utils.isTrue(this.options.native))
			target.attr("data-native", "1");

		renderTextView.call(this, $, target);

		return this;
	};

	// ====================================================
	_Holder.getDataMapper = function () {
		return null; // 交给dropdown处理
	};

	// ====================================================
	var renderTextView = function ($, target) {
		var ipttag = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text'/>").appendTo(ipttag);

		// var data = this.getSelectedData(true);
		// if (Utils.isNotNull(data)) {
		// 	target.addClass("has-val");
		// 	input.val(this.getDataLabel(data));
		// }

		if (Utils.isTrue(this.options.editable))
			target.addClass("editable");
		else
			input.attr("readonly", "readonly");

		if (target.is(".disabled"))
			input.attr("disabled", "disabled");

		ipttag.append("<button class='dropdownbtn'></button>");
		ipttag.append("<span class='prompt'>" + Utils.trimToEmpty(this.options.prompt) + "</span>");
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
			var selectedIndex = target.attr("data-inds") || "";
			var selectedId = target.attr("data-ids") || "";
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

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UICombobox = window.UICombobox = Component.Combobox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		if (Utils.isTrue(this.options.native))
			this.$el.attr("data-native", "1");

		// this.dropdownList = new Component.DropdownList(this.$el.children(".ui-dropdownlist"));

		// this.tap(".ipt", iptClickHandler.bind(this));
		// this.dropdownList.on("change", dropdownChangeHandler.bind(this));

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
			this.$el.on("foucsout", "input", inputFocusHandler.bind(this));
		}
	};
	var _UICombobox = UICombobox.prototype = new Component.base();

	UICombobox.find = function (view) {
		return Component.find(view, ".ui-combobox", UICombobox);
	};

	UICombobox.create = function (options) {
		return Component.create(options, UICombobox, Holder);
	};

	// ====================================================
	_UICombobox.setData = function (value) {
		if (this.dropdownList)
			this.dropdownList.setData(value);
		setActive.call(this, false, -1, "");
	};

	// _UICombobox.getSelectedIndex = function () {
	// 	// return this.dropdownList.getSelectedIndex();
	// };

	_UICombobox.setSelectedIndex = function (index, trigger) {
		// this.dropdownList.setSelectedIndex(index);
		// index = this.dropdownList.getSelectedIndex();
		// setActive.call(this, trigger, index, "");
	};

	// _UICombobox.getSelectedId = function () {
	// 	// return this.dropdownList.getSelectedId();
	// };

	_UICombobox.setSelectedId = function (value, trigger) {
		// this.dropdownList.setSelectedId(value);
		// index = this.dropdownList.getSelectedIndex();
		// setActive.call(this, trigger, index, "");
	};

	// _UICombobox.getSelectedData = function () {
	// 	// return this.dropdownList.getSelectedData();
	// };

	_UICombobox.val = function (value) {
		// if (Utils.isBlank(value)) {
		// 	return this.$el.find(".ipt > input").val();
		// }
		// else {
		// 	var match = this.dropdownList.matchFirst(value);
		// 	var index = match ? match[0] : -1;
		// 	this.setSelectedIndex(index, false);
		// }
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
		return this.$el.attr("data-native") == 1;
	}

	// ====================================================
	var iptClickHandler = function (e) {
		// var self = this;
		var target = $(e.target);

		if (this.isRenderAsApp()) {
			if (this.$el.is(".editable") && !target.is(".dropdownbtn"))
				return ;
		}
		else {
			if (this.$el.is(".editable") && target.is(".dropdownbtn")) {
				this.$el.find(".ipt > input").focus();
			}
		}

		showDropdown.call(this);
		// initDropdownList.call(this);
	};

	var comboMouseHandler = function (e) {
		if (e.type === "mouseenter") {
			var timerId = parseInt(this.$el.attr("timerid"));
			if (timerId) {
				clearTimeout(timerId);
				this.$el.removeAttr("timerid");
			}
		}
		else /*if (e.type === "mouseleave")*/ {
			if (isDropdownVisible.call(this)) {
				var self = this;
				var timerId = setTimeout(function () {
					hideDropdown.call(self);
				}, 500);
				this.$el.attr("timerid", timerId);
			}
		}
	};

	var appTouchTapHandler = function (e) {
		if (this.isRenderAsIphone()) {
			if (this.$el.is(e.target) || this.$el.find(e.target).length > 0)
				return;
			hideDropdown.call(this);
		}
		else {
			if ($(e.target).is(".ui-dropdownlist"))
				hideDropdown.call(this);
		}
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

	var dropdownChangeHandler = function (e, data) {
		var index = this.dropdownList.getSelectedIndex();
		// setActive.call(this, true, index, "");

		// if (!this.isRenderAsIphone()) {
		// 	var self = this;
		// 	setTimeout(function () { // 加一点延迟效果，主要和 foucsout 效果统一
		// 		hideDropdown.call(self);
		// 	}, 100);
		// }
	};

	var inputKeyHandler = function (e) {
		var input = $(e.currentTarget);
		if (e.type === "keydown") {
			if (!this.isRenderAsApp()) {
				showDropdown.call(this);
				this.$el.off("mouseenter");
				this.$el.off("mouseleave");
			}
		}
		else if (e.type === "keyup") {
			var text = input.val();
			if (e.which === 13) {
				var index = this.dropdownList.getSelectedIndex();
				if (index != this._lastSelectedIndex) {
					this._lastSelectedIndex = index;
					setActive.call(this, true, index, null);
					hideDropdown.call(this);
				}
			}
			else if (e.which === 38 || e.which === 40) { // 上、下箭头
				var index = this.dropdownList.getSelectedIndex();
				if (e.which === 38 && index > 0)
					index -= 1;
				if (e.which === 40 && index < this.dropdownList.length() - 1)
					index += 1;
				this.dropdownList.setSelectedIndex(index);
				setActive.call(this, false, index, null); // 等 foucsout 派发事件
			}
			else {
				if (text && text.length > 0)
					this.$el.addClass("has-val");
				else
					this.$el.removeClass("has-val");
				var match = this.dropdownList.matchFirst(text, true);
				this.dropdownList.setSelectedIndex(match ? match[0] : -1);
			}
		}
	};

	var inputFocusHandler = function (e) {
		var input = $(e.currentTarget);
		if (e.type === "focusin") {
			if (!this.focusOutTimerId)
				this._lastSelectedIndex = this.dropdownList.getSelectedIndex();
		}
		else if (e.type === "focusout") {
			if (isDropdownVisible.call(this)) {
				var self = this;
				// 延迟，如果是点击，要在DropdownList Change之后执行
				this.focusOutTimerId = setTimeout(function () {
					self.focusOutTimerId = 0;
					hideDropdown.call(self); // 直接关闭列表，从这里派发事件

					var index = self.dropdownList.getSelectedIndex(); // 按上、下箭头或输入匹配时 index 会变更

					// 列表选择相关内容与输入框内容不一致时，重置列表选择
					if (index >= 0 && self.dropdownList.getItemLabel(index) != input.val()) {
						index = -1;
						self.dropdownList.setSelectedIndex(-1);
					}

					if (self._lastSelectedIndex != index) {
						setActive.call(self, true, index, null);
					}
				}, 250);
			}
		}
	};

	// ====================================================
	var setActive = function (indexs, datas, trigger) {
		var values = [], labels = [];
		if (datas && datas.length > 0) {
			for (var i = 0, l = datas.length; i < l; i++) {
				var data = datas[i];
				values.push(this.getDataId(data));
				labels.push(this.getDataLabel(data));
			}
		}

		this.$el.attr("data-inds", (indexs ? indexs.join(",") : ""));
		this.$el.attr("data-ids", values.join(",") || "");
		this.$el.find(".ipt > input").val(labels.join(",") || "");

		if (datas && datas.length > 0)
			this.$el.addClass("has-val");
		else
			this.$el.removeClass("has-val");

		if (Utils.isTrue(trigger))
			this.trigger("change", datas);
	};

	var initDropdownList = function () {
		var target = this.$el.children(".ui-dropdownlist");
		if (this.isRenderAsIphone()) {
			target = target.children("ul");
			var index = Utils.index(target.find(".item"), function (item) {
				return item.is(".selected");
			});
			if (index >= 0) {
				var itemHeight = target.innerHeight() / 5;
				target.scrollTop(itemHeight * (index + 1));
			}
			else {
				target.scrollTop(0);
			}
		}
		else {
			if (this.isRenderAsApp())
				target = target.children("ul");
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
		var dropdown = this.$el.children(".ui-dropdownlist");
		if (this.isRenderAsApp()) {
			// setTimeout(function () {
			// 	$("body").on("tap.combobox", function (e) { appTouchTapHandler.call(self, e); });
			// }, 50);
		}
		else {
			var bottomHeight = $(window).height() + $("body").scrollTop();
			var dropdownHeight = dropdown.offset().top + dropdown.height();
			if (bottomHeight < dropdownHeight)
				this.$el.addClass("show-before");

			this.$el.on("mouseenter", function (e) { return comboMouseHandler.call(self, e); });
			this.$el.on("mouseleave", function (e) { return comboMouseHandler.call(self, e); });
		}

		// 这里要取消 focusout 事件，不然选项显示不了
		// 移动端点击按钮时，tap 在 foucsout 之前执行，这样选项被 foucsout 隐藏了
		setTimeout(function () {
			if (self.focusOutTimerId) {
				clearTimeout(self.focusOutTimerId);
				self.focusOutTimerId = 0;
			}
		}, 100);
	};

	var hideDropdown = function () {
		if (isDropdownVisible.call(this)) {
			this.$el.removeClass("show-dropdown");
			this.$el.off("mouseenter").off("mouseleave");
			$("body").off("tap.combobox");
		}
	};


	///////////////////////////////////////////////////////
	Component.register(".ui-combobox", UICombobox);

})(typeof VRender !== "undefined");
