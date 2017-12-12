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

		// if (this.isMultiple())
			target.attr("multiple", "multiple");

		// var list = $("<ul></ul>").appendTo(target);
		// renderItems.call(this, $, list, this.getData());

		return this;
	};

	_Holder.renderData = function ($, target) {
		var list = $("<ul></ul>").appendTo(target);
		renderItems.call(this, $, list, this.getData());
	};

	// ====================================================
	var renderItems = function ($, target, datas) {
		var self = this;
		var index = 0;
		var isPrevGroup = false;

		var selectedIndex = this.getSelectedIndex(true);
		var selectedId = this.getSelectedId(true);

		var addItem = function (data) {
			var item = $("<li class='item'></li>").appendTo(target);
			var content = self.renderOneData($, item, data, index);
			if (Utils.isNotNull(content))
				item.html(content);
			if (self.isDataSelected.call(self, data, index, selectedIndex, selectedId))
				item.addClass("selected");
			item.attr(self.getMapData(data));
			if (isFront)
				item.data("itemData", data);
		};

		var addSeparator = function () {
			target.append("<li class='sep'></li>");
		};

		Utils.each(Utils.toArray(datas), function (data) {
			if (Utils.isArray(data)) {
				if (index > 0)
					addSeparator();
				Utils.each(data, function (temp) {
					addItem(temp);
					index += 1;
				});
				isPrevGroup = true;
			}
			else {
				if (isPrevGroup)
					addSeparator();
				addItem(data);
				isPrevGroup = false;
				index += 1;
			}
		});
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIDropdownList = window.UIDropdownList = Component.DropdownList = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
		this.tap("li.item", itemClickHandler.bind(this));
	};
	var _UIDropdownList = UIDropdownList.prototype = new Component.list();

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

	// _UIDropdownList.getSelectedData = function () {
	// 	var item = this.$el.find("li.item.selected");
	// 	if (item && item.length > 0)
	// 		return this.getItemData(item);
	// 	return null;
	// };

	// _UIDropdownList.getSelectedIndex = function () {
	// 	return Utils.index(this.$el.find("li.item"), function (item) {
	// 		return item.is(".selected");
	// 	});
	// };

	// _UIDropdownList.setSelectedIndex = function (index, trigger) {
	// 	index = parseInt(index);

	// 	var items = this.$el.find("li.item").removeClass("selected");

	// 	if (!isNaN(index) && index >= 0 && index < items.length)
	// 		items.eq(index).addClass("selected");

	// 	if (Utils.isTrue(trigger))
	// 		this.trigger("change", this.getSelectedData());
	// };

	// _UIDropdownList.getSelectedId = function () {
	// 	var data = this.getSelectedData();
	// 	return data ? this.getDataId(data) : null;
	// };

	// _UIDropdownList.setSelectedId = function (value, trigger) {
	// 	if (Utils.isNull(value)) {
	// 		this.setSelectedIndex(-1, trigger);
	// 	}
	// 	else {
	// 		var self = this;
	// 		var items = this.$el.find("li.item").removeClass("selected");
	// 		var item = Utils.find(items, function (item) {
	// 			var data = self.getItemData(item);
	// 			if (data === value || self.getDataId(data) == value) {
	// 				item.addClass("selected");
	// 				return true;
	// 			}
	// 		});
	// 		if (Utils.isTrue(trigger))
	// 			this.trigger("change", this.getSelectedData());
	// 	}
	// };

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
		if (this.isMultiple()) {
			item.toggleClass("selected");
		}
		else {
			if (item.is(".selected"))
				return ;
			item.addClass("selected").siblings().removeClass("selected");
		}

		var self = this;
		var indexs = [], ids = [];
		Utils.each(this.$el.find("li.item"), function (item, index) {
			if (item.is(".selected")) {
				indexs.push(index);
				// var data = self.getItemData(item);
				// ids.push(self.getDataId(data));
			}
		});

		this.$el.attr("data-inds", indexs.join(","));
		// this.$el.attr("data-ids", ids.join(","));
		this.$el.removeAttr("data-ids");

		this.trigger("change");
	};

	// var dropdownScrollHandler = function (e) {
	// 	var dropdown = this.$el.children("ul");
	// 	var scrollTop = dropdown.scrollTop();
	// 	var itemHeight = dropdown.innerHeight() / 5;
	// 	var index = parseInt(scrollTop / itemHeight);
	// 	if (scrollTop - (itemHeight * index) > (itemHeight / 2)) {
	// 		index += 1;
	// 	}
	// 	index -= 1;

	// 	if (this.scrollTimerId) {
	// 		clearTimeout(this.scrollTimerId);
	// 		this.scrollTimerId = 0;
	// 	}

	// 	this.setSelectedIndex((index < 0 ? -1 : index), true);

	// 	if (e.type === "final") {
	// 		dropdown.scrollTop(index < 0 ? 0 : (itemHeight * (index + 1)));
	// 	}
	// 	else {
	// 		this.scrollTimerId = setTimeout(function () {
	// 			dropdownScrollHandler.call(this, {type: "final"});
	// 		}.bind(this), 200);
	// 	}
	// };

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

	// var getSelectedItems = function () {
	// 	return this.$el.find(".item.selected");
	// };

	// ====================================================
	Component.register(".ui-dropdownlist", UIDropdownList);

})(typeof VRender !== "undefined");
