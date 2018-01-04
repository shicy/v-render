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
		if (!this.options.data)
			this.options.data = [];
		this.tap(".item", itemClickHandler.bind(this));
	};
	var _UIDropdownList = UIDropdownList.prototype = new Component.list();

	UIDropdownList.find = function (view) {
		return Component.find(view, ".ui-dropdownlist", UIDropdownList);
	};

	UIDropdownList.create = function (options) {
		return Component.create(options, UIDropdownList, DropdownlistRender);
	};

	UIDropdownList.addData = function (data, index) {
		index = Utils.getIndexValue(index);
		var datas = Utils.toArray(this.options.data);

		if (index >= 0) {
			var _index = 0;
			for (var i = 0, l = datas.length; i < l; i++) {
				for (var m = 0, n = datas[i].length; m < n; m++) {
					if (_index == index) {
						datas[i].splice(m, 0, data);
						return _index;
					}
					_index++;
				}
			}
		}

		if (datas.length > 0)
			datas[datas.length - 1].push(data);
		else
			datas.push([data]);

		return -1;
	};

	UIDropdownList.updateData = function (data, index) {
		if (isNaN(index) || index === "")
			index = this.getDataIndex(data);
		else
			index = parseInt(index);
		if (index >= 0) {
			var _index = 0;
			var datas = Utils.toArray(this.options.data);
			for (var i = 0, l = datas.length; i < l; i++) {
				for (var m = 0, n = datas[i].length; m < n; m++) {
					if (_index == index) {
						datas[i].splice(m, 1, data);
						return _index;
					}
					_index++;
				}
			}
		}
		return -1;
	};

	UIDropdownList.removeData = function (index) {
		index = Utils.getIndexValue(index);
		if (index >= 0) {
			var _index = 0;
			var datas = Utils.toArray(this.options.data);
			for (var i = 0, l = datas.length; i < l; i++) {
				for (var m = 0, n = datas[i].length; m < n; m++) {
					if (_index == index) {
						var _data = datas[i].splice(m, 1);
						if (datas[i].length == 0)
							datas.splice(i, 1);
						return {index: _index, data: _data};
					}
					_index++;
				}
			}
		}
		return {index: -1};
	};

	// ====================================================
	_UIDropdownList.getData = function () {
		return DropdownlistRender.getData.call(this);
	};

	_UIDropdownList.setData = function (value) {
		var snapshoot = this._snapshoot();

		value = DropdownlistRender.dataFormat.call(this, value);
		this.options.data = DropdownlistRender.doAdapter.call(this, value);

		Component.list.setSelectedIndex.call(this, []);

		this._dataChanged("set", this.options.data);
		snapshoot.done([], []);
	};

	_UIDropdownList.addItem = function (data, index) {
		if (Utils.isNotNull(data)) {
			data = Component.list.doAdapter.call(this, data, index);
			index = UIDropdownList.addData.call(this, data, index);
			if (index >= 0)
				Component.list.riseSelectedIndex.call(this, index);
			this._dataChanged("add", data, this.getDataIndex(data));
		}
	};

	_UIDropdownList.updateItem = function (data, index) {
		if (Utils.isNotNull(data)) {
			data = Component.list.doAdapter.call(this, data, index);
			index = UIDropdownList.updateData.call(this, data, index);
			if (index >= 0)
				this._dataChanged("update", data, index);
		}
	};

	_UIDropdownList.removeItemAt = function (index) {
		var result = UIDropdownList.removeData.call(this, index);
		if (result && result.index >= 0) {
			var snapshoot = this._snapshoot();

			Component.list.reduceSelectedIndex.call(this, result.index);
			this._dataChanged("delete", result.data, result.index);

			snapshoot.done();

			return result.data;
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

	_UIDropdownList._dataChanged = function () {
		var list = this.$el.children("ul").empty();
		DropdownlistRender.renderItems.call(this, $, list, this.options.data);
	};

	// ====================================================
	var itemClickHandler = function (e) {
		var item = $(e.currentTarget);
		var snapshoot = this._snapshoot();

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

		snapshoot.done(indexs);
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
