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

	var Holder = function (options) {
		HolderItems.call(this, options);
	};
	var _Holder = Holder.prototype = new HolderItems();

	_Holder.render = function ($, target) {
		HolderItems.render.call(this, $, target);
		target.addClass("ui-dropdownlist no-select");
		var list = $("<ul></ul>").appendTo(target);
		renderItems.call(this, $, list);
		return this;
	};

	// ====================================================
	var renderItems = function ($, target) {
		var self = this;
		var index = 0;
		var isPrevGroup = false;

		var addSeparator = function () {
			target.append("<li class='sep'></li>");
		};

		var addItem = function (data) {
			var item = $("<li class='item'></li>").appendTo(target);
			item.text(self.getDataLabel(data, index));
			if (self.isDataSelected(data, index))
				item.addClass("selected");
			item.attr(self.getMapData(data));
			index += 1;
		};

		Utils.each(Utils.toArray(this.getData()), function (data) {
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
		this.$el.tap("li.item", function (e) { itemClickHandler.call(self, e); });
	};
	var _UIDropdownList = UIDropdownList.prototype = new Component.base();

	UIDropdownList.find = function (view) {
		return Component.find(view, ".ui-dropdownlist", UIDropdownList);
	};

	UIDropdownList.create = function (options) {
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIDropdownList(target, options, holder);
	};

	// ====================================================
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

	// ====================================================
	var itemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".selected"))
			return ;
		item.addClass("selected").siblings().removeClass("selected");
		this.trigger("change", this.getSelectedData());
	};

	// ====================================================
	Component.register(".ui-dropdownlist", UIDropdownList);

})(typeof VRender !== "undefined");
