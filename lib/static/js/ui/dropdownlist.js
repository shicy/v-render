// ========================================================
// 下拉选择列表
// @author shicy <shicy85@163.com>
// Create on 2016-12-10
// ========================================================

(function () {
	if (VRender.Component.DropdownList)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var DropdownlistRender = Component.Render.dropdownlist;

	///////////////////////////////////////////////////////
	var UIDropdownList = window.UIDropdownList = Component.DropdownList = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
		this.tap(".item", itemClickHandler.bind(this));
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
		var datas = [];
		Utils.each(Utils.toArray(this.options.data), function (data) {
			Utils.each(data, function (temp) {
				datas.push(temp);
			});
		});
		return datas;
	};

	_UIDropdownList.setData = function (value) {
		value = DropdownlistRender.dataFormat.call(this, value);
		value = Component.list.doAdapter.call(this, value);
		this.options.data = value;

		Component.list.setSelectedIndex.call(this, []);

		var list = this.$el.children("ul").empty();
		DropdownlistRender.renderItems.call(this, $, list, value);

		this._dataChanged("set", this.options.data);
	};

	_UIDropdownList.addItem = function (data, index) {
		if (Utils.isNotNull(data)) {
			index = Utils.getIndexValue(index);
			data = Component.base.doAdapter.call(this, data);

			var _index = 0, _insert = false;
			var datas = Utils.toArray(this.options.data);
			if (index >= 0) {
				for (var i = 0, l = datas.length; i < l; i++) {
					for (var m = 0, n = datas[i].length; m < n; m++) {
						var _data = datas[i][m];
						if (_index == index) {
							datas[i].splice(m, 0, data);
							_insert = true;
							break;
						}
						_index++;
					}
				}
			}

			if (_insert) {
				Component.list.riseSelectedIndex.call(this, index);
			}
			else {
				if (datas.length > 0)
					datas[datas.length - 1].push(data);
				else
					datas.push([data]);
			}
			this.options.data = datas;

			var list = this.$el.children("ul").empty();
			DropdownlistRender.renderItems.call(this, $, list, datas);
			this._dataChanged("add", data, this.getDataIndex(data));
		}
	};

	_UIDropdownList.updateItem = function (data, index) {
		if (Utils.isNotNull(data)) {
			data = Component.base.doAdapter.call(this, data);
			if (!index && index !== 0)
				index = this.getDataIndex(data);
			else
				index = parseInt(index);
			if (index >= 0) {
				var _index = 0, _update = false;
				var datas = Utils.toArray(this.options.data);
				for (var i = 0, l = datas.length; i < l; i++) {
					for (var m = 0, n = datas[i].length; m < n; m++) {
						var _data = datas[i][m];
						if (_index == index) {
							datas[i].splice(m, 1, data);
							_update = true;
							break;
						}
						_index++;
					}
				}
				if (_update) {
					var list = this.$el.children("ul").empty();
					DropdownlistRender.renderItems.call(this, $, list, datas);
					this._dataChanged("update", data, index);
				}
			}
		}
	};

	_UIDropdownList.removeItemAt = function (index) {
		index = Utils.getIndexValue(index);
		if (index >= 0) {
			var _index = 0, _delete = false, removeData;
			var datas = Utils.toArray(this.options.data);
			for (var i = 0, l = datas.length; i < l; i++) {
				for (var m = 0, n = datas[i].length; m < n; m++) {
					if (_index == index) {
						removeData = datas[i].splice(m, 1);
						_delete = true;
						if (datas[i].length == 0)
							datas.splice(i, 1);
						break;
					}
					_index++;
				}
			}
			if (_delete) {
				Component.list.reduceSelectedIndex.call(this, index);

				var list = this.$el.children("ul").empty();
				DropdownlistRender.renderItems.call(this, $, list, datas);
				this._dataChanged("delete", removeData, index);
			}
			return removeData;
		}
		return null;
	};

	// ====================================================
	_UIDropdownList.matchFirst = function (text, like, start) {
		if (Utils.isNotBlank(text)) {
			var items = this._getItems();
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				if (isMatch.call(this, item.text(), text, like, start))
					return [i, this.getItemData(item)];
			}
		}
		return null;
	};

	// ====================================================
	_UIDropdownList._getItemContainer = function () {
		return null;
	};

	_UIDropdownList._getItems = function () {
		return this.$el.find(".item");
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
			this._getItems().removeClass("selected");
			item.addClass("selected");
		}

		var indexs = [];
		Utils.each(this._getItems(), function (item, index) {
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
