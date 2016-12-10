// ========================================================
// 前端组件基类
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.base)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;

	var HolderBase = function (options) {
		this.options = options || {};
		this.setData(this.options.data);
	};
	var _HolderBase = HolderBase.prototype = new Object();

	_HolderBase.getData = function () {
		return this._data;
	};
	_HolderBase.setData = function (value) {
		this._data = value;
	};

	// ====================================================
	var HolderItems = function (options) {
		HolderBase.call(this, options);
		this.setIdField(this.options.idField);
		this.setLabelField(this.options.labelField);
		this.setLabelFunction(this.options.labelFunction);
		this.setSelectedIndex(this.options.selectedIndex);
		this.setSelectedId(this.options.selectedId);
	};
	var _HolderItems = HolderItems.prototype = new HolderBase();

	_HolderItems.getIdField = function () {
		return this._idField;
	};
	_HolderItems.setIdField = function (value) {
		this._idField = value;
	};

	_HolderItems.getLabelField = function () {
		return this._labelField;
	};
	_HolderItems.setLabelField = function (value) {
		this._labelField = value;
	};

	_HolderItems.getLabelFunction = function () {
		return this._labelFunction;
	};
	_HolderItems.setLabelFunction = function (value) {
		this._labelFunction = value;
	};

	_HolderItems.getSelectedIndex = function () {
		if (Utils.isBlank(this._selectedIndex))
			return -1;
		var selectedIndex = parseInt(this._selectedIndex);
		if (isNaN(selectedIndex))
			return -1;
		return selectedIndex >= 0 ? selectedIndex: -1;
	};
	_HolderItems.setSelectedIndex = function (value) {
		this._selectedIndex = value;
	};

	_HolderItems.getSelectedId = function () {
		return this._selectedId;
	};
	_HolderItems.setSelectedId = function (value) {
		this._selectedId = value;
	};

	// ----------------------------------------------------
	_HolderItems.getDataId = function (data) {
		if (Utils.isBlank(data))
			return null;
		if (typeof data === "string")
			return data;
		var idField = this.getIdField();
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

	_HolderItems.getDataLabel = function (data, index) {
		var labelFunction = this.getLabelFunction();
		if (Utils.isFunction(labelFunction))
			return labelFunction(data, index);
		if (Utils.isBlank(data))
			return "";
		if (typeof data === "string")
			return data;
		var labelField = this.getLabelField();
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

	_HolderItems.isDataSelected = function (data, index) {
		var selectedIndex = this.getSelectedIndex();
		if (selectedIndex >= 0)
			return selectedIndex === index;
		var selectedId = this.getSelectedId();
		if (Utils.isNotNull(selectedId)) {
			if (selectedId == this.getDataId(data))
				return true;
		}
		return false;
	};

	// ====================================================
	if (!isFront) {
		return module.exports = {
			HolderBase: HolderBase,
			HolderItems: HolderItems
		};
	}

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var ComponentBase = function (view) {};
	var _ComponentBase = ComponentBase.prototype = new VRender.EventEmitter();

	_ComponentBase.init = function (view, options) {
		var target = this.$el = $(view);

		if (target.data(Component.bindName))
			return target.data(Component.bindName);
		target.data(Component.bindName, this);

		this.options = options || {};
		doInit(target, this.options);

		return this;
	};

	_ComponentBase.getItemData = function (item) {

	};

	// ====================================================

	var doInit = function (target, options) {
		if (Utils.isNotBlank(options.id))
			target.attr("id", options.id);

		if (Utils.isNotBlank(options.name))
			target.attr("name", options.name);

		var cls = options.clsname || options.className || options.clsName || options.cls;
		if (Utils.isNotBlank(cls))
			target.addClass(cls);

		if (Utils.isNotBlank(options.style))
			target.addClass(options.style);

		if (options.hasOwnProperty("disabled")) {
			if (Utils.isTrue(options.disabled))
				target.addClass("disabled").attr("disabled", "disabled");
		}
		else if (options.hasOwnProperty("enabled")) {
			if (!Utils.isTrue(options.enabled))
				target.addClass("disabled").attr("disabled", "disabled");
		}
	};


	///////////////////////////////////////////////////////
	Component.base = ComponentBase;
	Component.HolderBase = HolderBase;
	Component.HolderItems = HolderItems;

})(typeof VRender !== "undefined");
