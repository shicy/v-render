// ========================================================
// 下拉选择框，下拉列表使用 DropdownList 组件
// @author shicy <shicy85@163.com>
// Create on 2017-12-13
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.combobox)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._select.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._select();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-combobox");

		if (this.isNative())
			target.attr("opt-native", "1");

		if (Utils.isTrue(this.options.matchRequired))
			target.attr("opt-match", "1");

		// 容器，用于下拉列表定位
		target.attr("opt-box", this.options.container);

		renderTextView.call(this, $, target);
		target.append("<div class='dropdown'><div class='box'></div></div>");
		BaseRender._select.render.call(this, $, target);

		return this;
	};

	// ====================================================
	_Renderer.getSelectedData = function (needArray) {
		return BaseRender._select.getSelectedData.call(this, needArray, getDataFlat.call(this));
	};

	_Renderer.isNative = function () {
		return Utils.isTrue(this.options.native);
	};

	// ====================================================
	_Renderer._getItemContainer = function ($, target) {
		return target.children(".dropdown").children(".box");
	};

	_Renderer._renderItems = function ($, target) {
		var itemContainer = this._getItemContainer($, target);
		renderItems.call(this, $, target, itemContainer, this.getData());
	};

	_Renderer._renderEmptyView = function ($, target) {
		// prevent default
	};

	_Renderer._renderLoadView = function ($, target) {
		// prevent default
	};

	_Renderer._setItemSelected = function (item, beSelected) {
		if (beSelected)
			item.addClass("selected").attr("selected", "selected");
		else
			item.removeClass("selected").removeAttr("selected");
	};

	_Renderer._doAdapter = function (datas) {
		return doAdapter.call(this, datas);
	};

	// ====================================================
	var renderTextView = function ($, target) {
		var ipttag = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text'/>").appendTo(ipttag);

		var datas = this.getSelectedData(true);
		if (datas && datas.length > 0) {
			target.addClass("has-val");
			var self = this;
			var labels = Utils.map(datas, function (temp) {
				return self._getDataLabel(temp);
			});
			input.val(labels.join(",") || "");
		}

		if (Utils.isTrue(this.options.editable))
			target.addClass("editable");
		else
			input.attr("readonly", "readonly");

		ipttag.append("<button class='dropdownbtn'></button>");
		ipttag.append("<span class='prompt'>" + Utils.trimToEmpty(this.options.prompt) + "</span>");
	};

	var renderItems = function ($, target, itemContainer, datas) {
		this._render_items = [];

		if (this.isRenderAsApp() && this.isNative()) {
			renderItemsAsSelect.call(this, $, itemContainer, datas);
		}
		else {
			renderItemsAsDropdown.call(this, $, itemContainer, datas);
		}

		var self = this;
		setTimeout(function () {
			self._render_items = null; // 释放空间
		}, 0);
	};

	var renderItemsAsDropdown = function ($, itemContainer, datas) {
		if (!datas || datas.length == 0)
			return ;
		var self = this;
		var items = this._render_items || [];
		var addItem = function (target, data) {
			var item = $("<div class='item'></div>").appendTo(target);
			items.push({item: item, data: data, index: items.length});
			renderOneItem.call(self, $, item, data);
		};
		var group = itemContainer.children(".grp").last();
		Utils.each(datas, function (data, i) {
			if (Utils.isArray(data)) {
				if (data.length > 0) {
					group = $("<div class='grp'></div>").appendTo(itemContainer);
					// data.title = "标题";
					if (data.title)
						$("<div class='title'></div>").appendTo(group).text(data.title);
					Utils.each(data, function (temp, j) {
						addItem(group, temp);
					});
				}
				group = null;
			}
			else {
				if (!group || group.length == 0)
					group = $("<div class='grp'></div>").appendTo(itemContainer);
				addItem(group, data);
			}
		});
	};

	var renderItemsAsSelect = function ($, itemContainer, datas) {
		var select = itemContainer.children("select");
		if (!select || select.length == 0) {
			select = $("<select size='1'></select>").appendTo(itemContainer);
			if (this.isMultiple())
				select.attr("multiple", "multiple");
			else
				select.append("<option disabled='disabled' selected='selected'>请选择..</option>");
		}
		if (datas && datas.length > 0) {
			var self = this;
			var items = this._render_items || [];
			var addItem = function (target, data) {
				var item = $("<option class='item'></option>").appendTo(target);
				items.push({item: item, data: data, index: items.length});
				item.text(self._getDataLabel(data));
			};
			Utils.each(datas, function (data) {
				if (Utils.isArray(data)) {
					Utils.each(data, function (temp) {
						addItem(select, temp);
					});
				}
				else {
					addItem(select, data);
				}
			});
		}
	};

	var renderOneItem = function ($, item, data, index) {
		BaseRender._item.renderOneItem.call(this, $, item, item, data, index);
	};


	// ====================================================
	var doAdapter = function (datas) {
		datas = Utils.toArray(datas);
		if (datas._vr_adapter_flag)
			return datas;
		var self = this;
		var index = 0;
		var _datas = [];
		var _group = null;
		Utils.each(datas, function (data, i) {
			if (Utils.isArray(data)) {
				if (data.length > 0) {
					var _data = Utils.map(data, function (temp) {
						return BaseRender.fn.doAdapter.call(self, temp, index++);
					});
					if (data.title)
						_data.title = data.title;
					_datas.push(_data);
				}
				_group = null;
			}
			else {
				if (!_group) {
					_group = [];
					_datas.push(_group);
				}
				data = BaseRender.fn.doAdapter.call(self, data, index++);
				_group.push(data);
			}
		});
		_datas._vr_adapter_flag = true;
		return _datas;
	};

	var getDataFlat = function () {
		var datas = [];
		Utils.each(this.getData(true), function (data) {
			if (Utils.isArray(data)) {
				Utils.each(data, function (temp) {
					datas.push(temp);
				});
			}
			else {
				datas.push(data);
			}
		});
		return datas;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.doAdapter = doAdapter;
		Renderer.getDataFlat = getDataFlat;
		Renderer.renderItems = renderItems;
		VRender.Component.Render.combobox = Renderer;
	}

})(typeof VRender === "undefined");