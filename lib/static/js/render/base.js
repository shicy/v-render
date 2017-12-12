// ========================================================
// 前后端（通用）渲染方法
// @author shicy <shicy85@163.com>
// Create on 2017-12-12
// ========================================================

(function (backend) {
	if (!backend) {
		if (!VRender.Component.Render)
			VRender.Component.Render = {};
		if (VRender.Component.Render.base)
			return ;
	}

	///////////////////////////////////////////////////////
	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;

	var doAdapter = function (data) {
		var adapter = this.options.dataAdapter || this.options.adapter;
		if (Utils.isFunction(this.getDataAdapter))
			adapter = this.getDataAdapter();
		if (Utils.isFunction(adapter)) {
			var _adapter = function (temp, index) {
				if (temp && temp._vr_adapter_flag)
					return temp;
				temp = adapter(temp, index);
				if (temp)
					temp._vr_adapter_flag = true;
				return temp;
			};
			data = Utils.isArray(data) ? Utils.map(data, _adapter) : _adapter(data);
		}
		return data;
	};

	var getMapData = function (data) {
		var mapper = this.options.dataMapper || this.options.mapper;
		if (Utils.isFunction(this.getDataMapper))
			mapper = this.getDataMapper();
		if (Utils.isFunction(mapper))
			return mapper(data);
		var attrs = {};
		if (Utils.notNull(data)) {
			if (data.hasOwnProperty("id"))
				attrs["data-id"] = data.id;
			if (data.hasOwnProperty("code"))
				attrs["data-code"] = data.code;
			if (data.hasOwnProperty("name"))
				attrs["data-name"] = data.name;
			if (data.hasOwnProperty("value"))
				attrs["data-value"] = data.value;
			if (data.hasOwnProperty("label"))
				attrs["data-label"] = data.label;
			if (data.hasOwnProperty("text"))
				attrs["data-text"] = data.text;
			if (data.hasOwnProperty("status"))
				attrs["data-status"] = data.status;
		}
		return attrs;
	};

	var getDataId = function (data) {
		if (Utils.isBlank(data))
			return null;
		if (typeof data === "string")
			return data;
		var idField = this.options.idField;
		if (Utils.isFunction(this.getIdField))
			idField = this.getIdField();
		if (Utils.isNotBlank(idField))
			return data[idField];
		if (data.hasOwnProperty("id"))
			return data.id;
		if (data.hasOwnProperty("code"))
			return data.code;
		if (data.hasOwnProperty("value"))
			return data.value;
		return null;
	};

	var getDataLabel = function (data, index) {
		var labelFunction = this.options.labelFunction;
		if (Utils.isFunction(this.getLabelFunction))
			labelFunction = this.getLabelFunction();
		if (Utils.isFunction(labelFunction))
			return labelFunction(data, index);
		if (Utils.isBlank(data))
			return "";
		if (typeof data === "string")
			return data;
		var labelField = this.options.labelField;
		if (Utils.isFunction(this.getLabelField))
			labelField = this.getLabelField();
		if (Utils.isNotBlank(labelField))
			return Utils.isNull(data[labelField]) ? "" : data[labelField];
		if (data.hasOwnProperty("label"))
			return Utils.isNull(data.label) ? "" : data.label;
		if (data.hasOwnProperty("name"))
			return Utils.isNull(data.name) ? "" : data.name;
		if (data.hasOwnProperty("value"))
			return Utils.isNull(data.value) ? "" : data.value;
		if (data.hasOwnProperty("text"))
			return Utils.isNull(data.text) ? "" : data.text;
		return "" + data;
	};

	///////////////////////////////////////////////////////
	var BaseRenderer = function (context, options) {
		if (!options) {
			this.context = null;
			this.options = context || {};
		}
		else {
			this.context = context;
			this.options = options || {};
		}
	};
	var _BaseRenderer = BaseRenderer.prototype = new Object();

	// ====================================================
	BaseRenderer.render = function ($, target) {
		this.renderData($, target);
		BaseRenderer.renderFunction(target, "adapter", this.getDataAdapter());
		BaseRenderer.renderFunction(target, "mapper", this.getDataMapper());
	};

	BaseRenderer.renderFunction = function (target, name, fn) {
		if (backend && Utils.isFunction(fn)) {
			target.write("<div class='ui-fn' name='" + name + "'>" + escape(fn) + "</div>");
		}
	};

	// ====================================================
	_BaseRenderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
	};

	_BaseRenderer.renderData = function ($, target) {
		var _data = this.getMapData(this.getData());
		if (_data)
			target.attr(_data);
	};

	_HolderBase.isRenderAsApp = function () {
		if (backend) {
			if (this.context && Utils.isFunction(this.context.isRenderAsApp))
				return this.context.isRenderAsApp();
			return false;
		}
		return VRender.ENV.isApp;
	};

	_HolderBase.isRenderAsIphone = function () {
		if (backend) {
			if (this.context && Utils.isFunction(this.context.isRenderAsIphone))
				return this.context.isRenderAsIphone();
			return false;
		}
		return VRender.ENV.isIphone;
	};

	_HolderBase.isRenderAsRem = function () {
		if (backend) {
			if (this.context) {
				if (Utils.isFunction(this.context.isRenderAsApp) && this.context.isRenderAsApp()) {
					if (Utils.isFunction(this.context.getContext)) {
						var context = this.context.getContext();
						return context && Utils.isTrue(context.config("useREM"));
					}
				}
			}
			return false;
		}
		return VRender.ENV.useRem;
	};

	// ====================================================
	_BaseRenderer.getData = function () {
		return doAdapter.call(this, this.options.data);
	};

	_BaseRenderer.getDataId = function (data) {
		return getDataId.call(this, data);
	};

	_BaseRenderer.getDataLabel = function (data, index) {
		return getDataLabel.call(this, data, index);
	};

	_BaseRenderer.getDataAdapter = function () {
		return this.options.dataAdapter || this.options.adapter;
	};

	_BaseRenderer.getDataMapper = function () {
		return this.options.dataMapper || this.options.mapper;
	};

	_BaseRenderer.getMapData = function (data) {
		return getMapData.call(this, data);
	};

	_BaseRenderer.doAdapter = function (data) {
		return doAdapter.call(this, data);
	};

	///////////////////////////////////////////////////////
	var ListRenderer = function (context, options) {
		ListRenderer.call(this, context, options);
	};
	var _ListRenderer = ListRenderer.prototype = new BaseRender();

	// ====================================================
	ListRenderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
		var idField = this.getIdField();
		if (Utils.isNotBlank(idField))
			target.attr("opt-idfield", idField);
		var labelField = this.getLabelField();
		if (Utils.isNotBlank(labelField))
			target.attr("opt-label", labelField);
		if (this.isMultiple())
			target.attr("multiple", "multiple");

		ListRenderer.renderFunction(target, "lblfunc", this.getLabelFunction());
		ListRenderer.renderFunction(target, "irender", this.getItemRenderer());

		this.renderSelectValues($, target);

		var datas = this.getData();
		if (Utils.isNotNull(datas)) {
			target.attr("data-items", escape(JSON.stringify(datas)));
		}
	};

	ListRenderer.renderFunction = function (target, name, fn) {
		BaseRenderer.renderFunction(target, name, fn);
	};

	ListRenderer.getSelectedItems = function (datas, deep) {
		var selectedDatas = [];
		if (datas && datas.length > 0) {
			var index = 0;
			var self = this;
			var selectedIndex = this.getSelectedIndex(true);
			var selectedId = this.getSelectedId(true);
			var find = function (datas) {
				for (var i = 0, l = datas.length; i < l; i++) {
					var data = datas[i];
					if (Utils.isArray(data)) {
						if (deep) {
							find(data);
						}
						else {
							index += 1;
						}
					}
					else {
						if (HolderItems.isSelected.call(self, data, index, selectedIndex, selectedId))
							selectedDatas.push(data);
						index += 1;
					}
				}
			};
			find(datas);
		}
		return selectedDatas;
	};

	ListRenderer.isSelected = function (data, index, selectedIndex, selectedId) {
		if (Utils.isNotBlank(selectedIndex)) {
			if (isNaN(index))
				return false;
			index = parseInt(index);
			if (index < 0)
				return false;
			if (!Utils.isArray(selectedIndex))
				selectedIndex = ("" + selectedIndex).split(",");
			return Utils.index(selectedIndex, function (tmp) {
				return tmp == index;
			}) >= 0;
		}

		if (Utils.isNotBlank(selectedId)) {
			var _id = this.getDataId(data);
			if (!Utils.isArray(selectedId))
				selectedId = ("" + selectedId).split(",");
			return Utils.index(selectedId, function (tmp) {
				return tmp == _id;
			}) >= 0;
		}

		return false;
	};

	// ====================================================
	_ListRenderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
	};

	_ListRenderer.renderData = function ($, target) {
		// 交给子项渲染
	};

	_ListRenderer.renderSelectValues = function ($, target) {
		var index = this.getSelectedIndex(true).join(",");
		target.attr("data-inds", index);
		
		var id = this.getSelectedId(true).join(",");
		target.attr("data-ids", id);

		if (this.options.apiName) {
			target.attr("data-tryindex", index);
			target.attr("data-tryid", id);
		}
	};

	// ====================================================
	_ListRenderer.getData = function () {
		return doAdapter.call(this, Utils.toArray(this.options.data));
	};

	_ListRenderer.getIdField = function () {
		return this.options.idField;
	};

	_ListRenderer.getLabelField = function () {
		return this.options.labelField;
	};

	_ListRenderer.getLabelFunction = function () {
		return this.options.labelFunction;
	};

	_ListRenderer.getItemRenderer = function () {
		return this.options.itemRenderer;
	};

	_ListRenderer.isMultiple = function () {
		if (this.options.hasOwnProperty("multiple"))
			return Utils.isTrue(this.options.multiple);
		return Utils.isTrue(this.options.multi);
	};

	// needArray为true或多选的情况返回数组，否则返回一个索引值
	_ListRenderer.getSelectedIndex = function (needArray) {
		var selectedIndex = this.options.selectedIndex;
		if (Utils.isBlank(selectedIndex)) {
			return (needArray || this.isMultiple()) ? [] : -1;
		}
		if (!Utils.isArray(selectedIndex))
			selectedIndex = ("" + selectedIndex).split(",");
		var indexs = [];
		Utils.each(selectedIndex, function (tmp) {
			var index = parseInt(tmp);
			if (!isNaN(index) && index >= 0)
				indexs.push(index);
		});
		if (needArray || this.isMultiple())
			return indexs;
		return indexs.length > 0 ? indexs[0] : -1;
	};

	// 
	_ListRenderer.getSelectedId = function (needArray) {
		var selectedId = this.options.selectedId;
		if (Utils.isBlank(selectedId)) {
			return (needArray || this.isMultiple()) ? [] : null;
		}
		if (!Utils.isArray(selectedId))
			selectedId = ("" + selectedId).split(",");
		var ids = [];
		Utils.each(selectedId, function (tmp) {
			if (tmp.length > 0) {
				ids.push(isNaN(tmp) ? tmp : parseInt(id));
			}
		});
		if (needArray || this.isMultiple())
			return ids;
		return ids.length > 0 ? ids[0] : null;
	};

	_ListRenderer.getSelectedData = function (needArray) {
		var items = ListRenderer.getSelectedItems.call(this, this.getData(), true);
		if (needArray || this.isMultiple())
			return items;
		return items.length > 0 ? items[0] : null;
	};

	_ListRenderer.isDataSelected = function (data, index, selectedIndex, selectedId) {
		if (!selectedIndex)
			selectedIndex = this.getSelectedIndex(true);
		if (!selectedId)
			selectedId = this.getSelectedId(true);
		return ListRenderer.isSelected.call(this, data, index, selectedIndex, selectedId);
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = {};
		module.exports.BaseRenderer = BaseRenderer;
		module.exports.ListRenderer = ListRenderer;
	}
	else {
		VRender.Component.Render._base = BaseRenderer;
		VRender.Component.Render._list = ListRenderer;
	}

})(typeof VRender === "undefined");
