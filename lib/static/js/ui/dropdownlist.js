// ========================================================
// 下拉选择列表
// @author shicy <shicy85@163.com>
// Create on 2016-12-10
// ========================================================

(function () {
	if (VRender.Component.DropdownList)
		return ;

	var Utils = VRender.Utils;
	var DropdownlistRender = VRender.Component.Render.dropdownlist;

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
		return Component.create(options, UIDropdownList, DropdownlistRender);
	};

	// ====================================================
	_UIDropdownList.getData = function () {
		var self = this;
		return Utils.map(this.$el.find("li.item"), function (item) {
			return self.getItemData(item);
		});
	};
	_UIDropdownList.setData = function (value) {
		value = Component.base.doAdapter.call(this, value);
		this.options.data = value;
		Component.list.setSelectedIndex.call(this, []);
		var list = this.$el.children("ul").empty();
		DropdownlistRender.renderItems.call(this, $, list, value);
	};

	_UIDropdownList.setSelectedIndex = function (value, trigger) {
		var indexs = Component.list.setSelectedIndex.call(this, value);

		var items = this.$el.find("li.item").removeClass("selected");
		Utils.each(indexs, function (index) {
			items.eq(index).addClass("selected");
		});

		if (trigger) {
			this.trigger("change", this.getSelectedData());
		}
	};

	_UIDropdownList.getSelectedData = function (needArray) {
		var self = this;
		var selectedDatas = Utils.map(this.$el.find("li.item.selected"), function (item) {
			return self.getItemData(item);
		});
		if (needArray || this.isMultiple())
			return selectedDatas;
		return selectedDatas.length > 0 ? selectedDatas[0] : null;
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
		var indexs = [];
		Utils.each(this.$el.find("li.item"), function (item, index) {
			if (item.is(".selected")) {
				indexs.push(index);
			}
		});

		Component.list.setSelectedIndex.call(this, indexs);

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

	///////////////////////////////////////////////////////
	Component.register(".ui-dropdownlist", UIDropdownList);

})();
