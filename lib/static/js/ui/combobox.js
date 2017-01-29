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

		renderTextView.call(this, $, target);
		renderDropdownList.call(this, $, target);

		return this;
	};

	// ====================================================
	_Holder.getLabelFunction = function () {
		return null; // 交给dropdown处理
	};

	_Holder.getDataAdapter = function () {
		return null; // 交给dropdown处理
	};

	_Holder.getDataMapper = function () {
		return null; // 交给dropdown处理
	};

	// ====================================================
	var renderTextView = function ($, target) {
		var ipttag = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text'/>").appendTo(ipttag);

		var data = this.getSelectedData();
		if (Utils.isNotNull(data)) {
			target.addClass("has-val");
			input.val(this.getDataLabel(data));
		}

		if (Utils.isTrue(this.options.editable))
			target.addClass("editable");
		else
			input.attr("readonly", "readonly");

		ipttag.append("<button class='dropdownbtn'></button>");
		ipttag.append("<span class='prompt'>" + Utils.trimToEmpty(this.options.prompt) + "</span>");
	};

	var renderDropdownList = function ($, target) {
		var clearParams = {apiName: null};
		if (isFront) {
			var options = $.extend({}, this.options, {target: target}, clearParams);
			VRender.Component.DropdownList.create(options);
		}
		else {
			var options = Utils.extend({}, this.options, clearParams);
			var UIDropdownList = require("../../../ui/component/UIDropdownList");
			new UIDropdownList(this.context, options).render(target);
		}
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UICombobox = Component.Combobox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.dropdownList = new Component.DropdownList(this.$el.children(".ui-dropdownlist"));

		var self = this;
		this.tap(".ipt", function (e) { iptClickHandler.call(self, e); });
		this.$el.on("mouseenter", function (e) { comboMouseHandler.call(self, e); });
		this.$el.on("mouseleave", function (e) { comboMouseHandler.call(self, e); });

		this.dropdownList.on("change", function (e, data) { dropdownChangeHandler.call(self, e, data); });

		if (this.$el.is(".editable")) {
			this.$el.on("keydown", "input", function (e) { return inputKeyHandler.call(self, e); });
			this.$el.on("keyup", "input", function (e) { return inputKeyHandler.call(self, e); });
			this.$el.on("focusin", "input", function (e) { inputFocusHandler.call(self, e); });
			this.$el.on("focusout", "input", function (e) { inputFocusHandler.call(self, e); });
		}
	};
	var _UICombobox = UICombobox.prototype = new Component.base();

	UICombobox.find = function (view) {
		return Component.find(view, ".ui-combobox", UICombobox);
	};

	UICombobox.create = function (options) {
		options = $.extend({}, options);
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UICombobox(target, options, holder);
	};

	// ====================================================
	_UICombobox.setData = function (value) {
		this.dropdownList.setData(value);
		setActive.call(this, null, -1);
	};

	_UICombobox.getSelectedIndex = function () {
		return this.dropdownList.getSelectedIndex();
	};

	_UICombobox.setSelectedIndex = function (index, trigger) {
		this.dropdownList.setSelectedIndex(index);
		index = this.dropdownList.getSelectedIndex();
		var data = this.dropdownList.getSelectedData();
		setActive.call(this, data, index, trigger);
	};

	_UICombobox.getSelectedId = function () {
		return this.dropdownList.getSelectedId();
	};

	_UICombobox.setSelectedId = function (value, trigger) {
		this.dropdownList.setSelectedId(value);
		index = this.dropdownList.getSelectedIndex();
		var data = this.dropdownList.getSelectedData();
		setActive.call(this, data, index, trigger);
	};

	_UICombobox.getSelectedData = function () {
		return this.dropdownList.getSelectedData();
	};

	_UICombobox.val = function (value) {
		if (Utils.isBlank(value)) {
			return this.$el.find(".ipt > input").val();
		}
		else {
			var match = this.dropdownList.matchFirst(value);
			var index = match ? match[0] : -1;
			if (index >= 0)
				this.setSelectedIndex(index, true);
			else {
				this.setSelectedIndex(-1);
				this.$el.find(".ipt > input").val(value);
				this.$el.addClass("has-val");
				this.trigger("change", null);
			}
		}
	};

	// ====================================================
	var iptClickHandler = function (e) {
		if (!this.$el.is(".editable") || $(e.target).is(".dropdownbtn"))
			showDropdown.call(this);
	};

	var comboMouseHandler = function (e) {
		var target = this.$el;
		if (e.type === "mouseenter") {
			var timerId = parseInt(target.attr("timerid"));
			if (timerId) {
				clearTimeout(timerId);
				target.removeAttr("timerid");
			}
		}
		else /*if (e.type === "mouseleave")*/ {
			var timerId = setTimeout(function () {
				target.removeClass("show-dropdown");
			}, 500);
			target.attr("timerid", timerId);
		}
	};

	var dropdownChangeHandler = function (e, data) {
		this.$el.removeClass("show-dropdown");
		var index = this.dropdownList.getSelectedIndex();
		setActive.call(this, data, index, true);
	};

	var inputKeyHandler = function (e) {
		var input = $(e.currentTarget);
		if (e.type === "keydown") {
			showDropdown.call(this);
			this.$el.off("mouseleave");
		}
		else if (e.type === "keyup") {
			var text = input.val();
			if (e.which === 13) {
				var index = this.dropdownList.getSelectedIndex();
				var data = this.dropdownList.getSelectedData();
				if (index >= 0)
					input.val(this.dropdownList.getItemLabel(index));
				this.$el.removeClass("show-dropdown");
				if (index != this._lastSelectedIndex) {
					this._lastSelectedIndex = index;
					this.trigger("change", data);
				}
			}
			else if (e.which === 38 || e.which === 40) {
				var index = this.dropdownList.getSelectedIndex();
				if (e.which === 38 && index > 0)
					index -= 1;
				if (e.which === 40 && index < this.dropdownList.length() - 1)
					index += 1;
				this.dropdownList.setSelectedIndex(index);
				var data = this.dropdownList.getSelectedData();
				setActive.call(this, data, index);
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
			this._lastSelectedIndex = this.dropdownList.getSelectedIndex();
		}
		else if (e.type === "focusout") {
			var index = this.dropdownList.getSelectedIndex();
			var data = this.dropdownList.getSelectedData();
			if (index >= 0 && this.dropdownList.getItemLabel(index) != input.val()) {
				this.dropdownList.setSelectedIndex(-1);
				data = null;
			}
			this.$el.removeClass("show-dropdown");

			var self = this;
			this.$el.on("mouseleave", function (e) { comboMouseHandler.call(self, e); });

			if (this._lastSelectedIndex != index)
				this.trigger("change", data);
		}
	};

	// ====================================================
	var setActive = function (data, index, trigger) {
		var input = this.$el.find(".ipt > input");
		input.val(this.dropdownList.getItemLabel(index));
		if (Utils.isBlank(input.val()))
			this.$el.removeClass("has-val");
		else 
			this.$el.addClass("has-val");
		if (Utils.isTrue(trigger))
			this.trigger("change", data);
	};

	var showDropdown = function () {
		if (this.$el.is(".show-dropdown"))
			return ;
		this.$el.addClass("show-dropdown").removeClass("show-before");
		var dropdown = this.$el.children(".ui-dropdownlist");
		var bottomHeight = $(window).height() + $("body").scrollTop();
		var dropdownHeight = dropdown.offset().top + dropdown.height();
		if (bottomHeight < dropdownHeight)
			this.$el.addClass("show-before");
	};


	///////////////////////////////////////////////////////
	Component.register(".ui-combobox", UICombobox);

})(typeof VRender !== "undefined");
