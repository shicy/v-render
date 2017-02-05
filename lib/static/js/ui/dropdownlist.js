// ========================================================
// 下拉选择列表
// @author shicy <shicy85@163.com>
// Create on 2016-12-10
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.DropdownList)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderItems = (isFront ? VRender.Component : require("./base")).HolderItems;

	var Holder = function (context, options) {
		HolderItems.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderItems();

	_Holder.render = function ($, target) {
		HolderItems.render.call(this, $, target);
		target.addClass("ui-dropdownlist");
		var list = $("<ul></ul>").appendTo(target);
		renderItems.call(this, $, list, this.getData());
		return this;
	};

	// ====================================================
	var renderItems = function ($, target, datas) {
		var self = this;
		var index = 0;
		var isPrevGroup = false;

		var isSelected = this.isDataSelected;
		if (!Utils.isFunction(isSelected))
			isSelected = function () { return false; };

		var addSeparator = function () {
			target.append("<li class='sep'></li>");
		};

		var addItem = function (data) {
			var item = $("<li class='item'></li>").appendTo(target);
			item.text(self.getDataLabel(data, index));
			if (isSelected.call(self, data, index))
				item.addClass("selected");
			item.attr(self.getMapData(data));
			if (isFront)
				item.data("itemData", data);
			index += 1;
		};

		Utils.each(Utils.toArray(datas), function (data) {
			if (Utils.isBlank(data))
				return ;
			if (typeof data === "string")
				data = {label: data};

			if (Utils.isArray(data)) {
				if (index > 0)
					addSeparator();
				Utils.each(data, function (temp) {
					if (Utils.isBlank(temp))
						return ;
					if (typeof temp === "string")
						temp = {label: temp};
					addItem(temp);
				});
				isPrevGroup = true;
			}
			else {
				if (isPrevGroup)
					addSeparator();
				addItem(data);
				isPrevGroup = false;
			}
		});
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIDropdownList = Component.DropdownList = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		var self = this;
		this.tap("li.item", function (e) { itemClickHandler.call(self, e); }, true);
	};
	var _UIDropdownList = UIDropdownList.prototype = new Component.base();

	UIDropdownList.find = function (view) {
		return Component.find(view, ".ui-dropdownlist", UIDropdownList);
	};

	UIDropdownList.create = function (options) {
		return Component.create(options, UIDropdownList, Holder);
	};

	// ====================================================
	_UIDropdownList.setData = function (value) {
		value = Component.base.doAdapter.call(this, value);
		var list = this.$el.children("ul").empty();
		renderItems.call(this, $, list, value);
	};

	_UIDropdownList.getSelectedData = function () {
		var item = this.$el.find("li.item.selected");
		if (item && item.length > 0)
			return this.getItemData(item);
		return null;
	};

	_UIDropdownList.getSelectedIndex = function () {
		return Utils.index(this.$el.find("li.item"), function (item) {
			return item.is(".selected");
		});
	};

	_UIDropdownList.setSelectedIndex = function (index, trigger) {
		index = parseInt(index);

		var items = this.$el.find("li.item").removeClass("selected");

		if (!isNaN(index) && index >= 0 && index < items.length)
			items.eq(index).addClass("selected");

		if (Utils.isTrue(trigger))
			this.trigger("change", this.getSelectedData());
	};

	_UIDropdownList.getSelectedId = function () {
		var data = this.getSelectedData();
		return data ? this.getDataId(data) : null;
	};

	_UIDropdownList.setSelectedId = function (value, trigger) {
		if (Utils.isNull(value)) {
			this.setSelectedIndex(-1, trigger);
		}
		else {
			var self = this;
			var items = this.$el.find("li.item").removeClass("selected");
			var item = Utils.find(items, function (item) {
				var data = self.getItemData(item);
				if (data === value || self.getDataId(data) == value) {
					item.addClass("selected");
					return true;
				}
			});
			if (Utils.isTrue(trigger))
				this.trigger("change", this.getSelectedData());
		}
	};

	_UIDropdownList.getItemLabel = function (index) {
		index = parseInt(index);
		if (isNaN(index) || index < 0)
			return null;
		return this.$el.find("li.item").eq(index).text();
	};

	_UIDropdownList.length = function () {
		return this.$el.find("li.item").length;
	};

	_UIDropdownList.matchFirst = function (text, like, start) {
		if (Utils.isNotBlank(text)) {
			var items = this.$el.find("li.item");
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				if (isMatch.call(this, item.text(), text, like, start))
					return [i, this.getItemData(item)];
			}
		}
		return null;
	};

	// ====================================================
	var itemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".selected"))
			return ;
		item.addClass("selected").siblings().removeClass("selected");
		this.trigger("change", this.getSelectedData());
	};

	// ====================================================
	var isMatch = function (label, text, like, start) {
		if (text == label)
			return true;
		if (like && text.length < label.length) {
			var index = label.indexOf(text);
			if (index >= 0)
				return !start || index === 0;
		}
		return false;
	};

	// ====================================================
	Component.register(".ui-dropdownlist", UIDropdownList);

})(typeof VRender !== "undefined");
