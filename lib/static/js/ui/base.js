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

	// 获取对象编号
	var getDataId = function (data) {
		if (Utils.isBlank(data))
			return null;
		if (typeof data === "string")
			return data;
		var idField = Utils.isFunction(this.getIdField) ? this.getIdField() : this.options.idField;
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

	// 获取对象标签
	var getDataLabel = function (data, index) {
		var labelFunction = Utils.isFunction(this.getLabelFunction) ? this.getLabelFunction() : this.options.labelFunction;
		if (Utils.isFunction(labelFunction))
			return labelFunction(data, index);
		if (Utils.isBlank(data))
			return "";
		if (typeof data === "string")
			return data;
		var labelField = Utils.isFunction(this.getLabelField) ? this.getLabelField() : this.options.labelField;
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

	///////////////////////////////////////////////////////
	var HolderBase = function (context, options) {
		if (!options) {
			this.context = null;
			this.options = context || {};
		}
		else {
			this.context = context;
			this.options = options || {};
		}
	};
	var _HolderBase = HolderBase.prototype = new Object();

	HolderBase.render = function ($, target) {
		this.renderData($, target);
		if (!isFront)
			HolderBase.renderFunction("adapter", this.getDataAdapter());
	};

	HolderBase.renderFunction = function (target, name, fn) {
		if (Utils.isFunction(fn)) {
			target.write("<div class='ui-fn' name='" + name + "'>" + escape(fn) + "</div>");
		}
	};

	HolderBase.doAdapter = function (data) {
		return doAdapter.call(this, data);
	};

	// ====================================================
	_HolderBase.getData = function () {
		if (Utils.isNull(this.options.data))
			return null;
		return doAdapter.call(this, this.options.data);
	};

	_HolderBase.getDataId = function (data) {
		return getDataId.call(this, data);
	};

	_HolderBase.getDataLabel = function (data, index) {
		return getDataLabel.call(this, data, index);
	};

	_HolderBase.getDataAdapter = function () {
		return this.options.dataAdapter || this.options.adapter;
	};

	_HolderBase.getDataMapper = function () {
		return this.options.dataMapper || this.options.mapper;
	};

	_HolderBase.getMapData = function (data) {
		return getMapData.call(this, data);
	};

	// ----------------------------------------------------
	_HolderBase.render = function ($, target) {
		HolderBase.render.call(this, $, target);
	};

	_HolderBase.renderData = function ($, target) {
		var _data = this.getMapData(this.getData());
		if (_data)
			target.attr(_data);
	};

	_HolderBase.isRenderAsApp = function () {
		if (isFront)
			return VRender.ENV.isApp;
		if (this.context && Utils.isFunction(this.context.isRenderAsApp))
			return this.context.isRenderAsApp();
		return false;
	};

	_HolderBase.isRenderAsIphone = function () {
		if (isFront)
			return VRender.ENV.isIphone;
		if (this.context && Utils.isFunction(this.context.isRenderAsIphone))
			return this.context.isRenderAsIphone();
		return false;
	};

	_HolderBase.isRenderAsRem = function () {
		if (isFront)
			return VRender.ENV.useRem;
		if (this.context) {
			if (Utils.isFunction(this.context.isRenderAsApp) && this.context.isRenderAsApp()) {
				if (Utils.isFunction(this.context.getContext)) {
					var context = this.context.getContext();
					return context && Utils.isTrue(context.config("useREM"));
				}
			}
		}
		return false;
	};

	///////////////////////////////////////////////////////
	var HolderItems = function (context, options) {
		HolderBase.call(this, context, options);
	};
	var _HolderItems = HolderItems.prototype = new HolderBase();

	HolderItems.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		var idField = this.getIdField();
		if (Utils.isNotBlank(idField))
			target.attr("opt-idfield", idField);
		var labelField = this.getLabelField();
		if (Utils.isNotBlank(labelField))
			target.attr("opt-label", labelField);
		if (this.isMultiple())
			target.attr("multiple", "multiple");

		this.renderDataMapper($, target);
		this.renderLabelFunction($, target);
		this.renderSelectValues($, target);

		var datas = this.getData();
		if (Utils.isNotNull(datas)) {
			target.attr("data-items", escape(JSON.stringify(datas)));
		}
	};

	HolderItems.renderFunction = function (target, name, fn) {
		HolderBase.renderFunction(target, name, fn);
	};

	HolderItems.getSelectedItems = function (datas, deep) {
		var selectedDatas = [];
		if (datas && datas.length > 0) {
			var index = 0;
			var self = this;
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
						if (HolderItems.isSelected.call(self, data, index))
							selectedDatas.push(data);
						index += 1;
					}
				}
			};
			find(datas);
		}
		return selectedDatas;
	};

	HolderItems.isSelected = function (data, index, selectedIndex, selectedId) {
		if (Utils.isNull(selectedIndex))
			selectedIndex = this.getSelectedIndex();
		if (Utils.isNotBlank(selectedIndex)) {
			if (isNaN(index) || index < 0)
				return false;
			selectedIndex = ("" + selectedIndex).split(",");
			return selectedIndex.indexOf("" + index) >= 0;
		}

		if (Utils.isNull(selectedId))
			selectedId = this.getSelectedId();
		if (Utils.isNotBlank(selectedId)) {
			var _id = this.getDataId(data);
			selectedId = ("" + selectedId).split(",");
			return selectedId.indexOf("" + _id) >= 0;
		}

		return false;
	};

	// ====================================================
	_HolderItems.getData = function () {
		return doAdapter.call(this, Utils.toArray(this.options.data));
	};

	_HolderItems.getIdField = function () {
		return this.options.idField;
	};

	_HolderItems.getLabelField = function () {
		return this.options.labelField;
	};

	_HolderItems.getLabelFunction = function () {
		return this.options.labelFunction;
	};

	_HolderItems.getItemRenderer = function () {
		return this.options.itemRenderer;
	};

	_HolderItems.isMultiple = function () {
		if (this.options.hasOwnProperty("multiple"))
			return Utils.isTrue(this.options.multiple);
		return Utils.isTrue(this.options.multi);
	};

	_HolderItems.getSelectedIndex = function (split) {
		var selectedIndex = this.options.selectedIndex;
		if (split && Utils.isNotNull(selectedIndex)) {
			selectedIndex = ("" + selectedIndex).split(",");
		}
		return selectedIndex;
	};

	_HolderItems.getSelectedId = function (split) {
		var selectedId = this.options.selectedId;
		if (split && Utils.isNotNull(selectedId)) {
			selectedId = ("" + selectedId).split(",");
		}
		return selectedId;
	};

	_HolderItems.getSelectedData = function (deep) {
		var items = HolderItems.getSelectedItems.call(this, this.getData(), deep);
		return items && items.length > 0 ? items : null;
	};

	_HolderItems.isDataSelected = function (data, index, selectedIndex, selectedId) { 
		return HolderItems.isSelected.call(this, data, index, selectedIndex, selectedId);
	};

	// ----------------------------------------------------
	_HolderItems.render = function ($, target) {
		HolderItems.render.call(this, $, target);
	};

	_HolderItems.renderData = function ($, target) {
		// 交给子项渲染
	};

	_HolderItems.renderDataMapper = function ($, target) {
		if (!isFront)
			HolderItems.renderFunction(target, "mapper", this.getDataMapper());
	};

	_HolderItems.renderLabelFunction = function ($, target) {
		if (!isFront)
			HolderItems.renderFunction(target, "lblfunc", this.getLabelFunction());
	};

	_HolderItems.renderItemRenderer = function ($, target) {
		if (!isFront)
			HolderItems.renderFunction(target, "irender", this.getItemRenderer());
	};

	_HolderItems.renderSelectValues = function ($, target) {
		var index = this.getSelectedIndex();
		target.attr("data-inds", index);
		
		var id = this.getSelectedId();
		target.attr("data-ids", id);

		if (!isFront && this.options.apiName) {
			if (Utils.isNotBlank)
				target.attr("data-tryindex", index);
			if (Utils.isNotBlank(id))
				target.attr("data-tryid", id);
		}
	};

	// ====================================================
	if (!isFront)
		return module.exports = { HolderBase: HolderBase, HolderItems: HolderItems };

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var ComponentBase = function (view) {};
	var _ComponentBase = ComponentBase.prototype = new VRender.EventEmitter();

	ComponentBase.doAdapter = function (data) {
		return doAdapter.call(this, data);
	};

	ComponentBase.getFunction = function (name, type) {
		if (this.options.hasOwnProperty(name))
			return this.options[name];
		if (this.hasOwnProperty(name))
			return this[name];
		var func = this.$el.children(".ui-fn[name='" + type +"']").text();
		if (func)
			func = (new Function("var Utils=VRender.Utils;return (" + unescape(func) + ");"))();
		return this[name] = func;
	};

	// ====================================================
	_ComponentBase.init = function (view, options) {
		var target = this.$el = $(view);

		if (target.data(Component.bindName))
			return target.data(Component.bindName);
		target.data(Component.bindName, this);

		this.options = options || {};
		doInit.call(this, target, this.options);

		var self = this;
		setTimeout(function () {
			tryAutoLoad.call(self);
		}, 0);

		return this;
	};

	_ComponentBase.getIdField = function () {
		return this.options.idField || this.$el.attr("opt-idfield");
	};
	_ComponentBase.setIdField = function (value) {
		this.options.idField = value || "";
		this.$el.attr("opt-idfield", this.options.idField);
	};

	_ComponentBase.getLabelField = function () {
		return this.options.labelField || this.$el.attr("opt-label");
	};
	_ComponentBase.setLabelField = function (value) {
		this.options.labelField = value || "";
		this.$el.attr("opt-label", this.options.labelField);
	}

	_ComponentBase.getLabelFunction = function () {
		return ComponentBase.getFunction.call(this, "labelFunction", "lblfunc");
	};
	_ComponentBase.setLabelFunction = function (value) {
		this.options.labelFunction = value;
	};

	_ComponentBase.getItemRenderer = function () {
		if (this.options.hasOwnProperty("renderer"))
			return this.options.renderer;
		return Component.base.getFunction.call(this, "itemRenderer", "irender");
	};
	_ComponentBase.setItemRenderer = function (value) {
		this.options.renderer = value;
		delete this.options.itemRenderer;
	};

	_ComponentBase.getDataAdapter = function () {
		if (this.options.hasOwnProperty("adapter"))
			return this.options.adapter;
		return ComponentBase.getFunction.call(this, "dataAdapter", "adapter");
	};
	_ComponentBase.setDataAdapter = function (value) {
		this.options.adapter = value;
		delete this.options.dataAdapter;
	};

	_ComponentBase.getDataMapper = function () {
		if (this.options.hasOwnProperty("mapper"))
			return this.options.mapper;
		return ComponentBase.getFunction.call(this, "dataMapper", "mapper");
	};
	_ComponentBase.setDataMapper = function (value) {
		this.options.mapper = value;
		delete this.options.dataMapper;
	};

	_ComponentBase.getItemData = function (item) {
		var data = item.data("itemData") || item.data();
		return Utils.isEmpty(data) ? null : data;
	};

	_ComponentBase.getItemsData = function (items) {
		return Utils.map(items, this.getItemData);
	};

	_ComponentBase.getDataId = function (data) {
		return getDataId.call(this, data);
	};

	_ComponentBase.getDataLabel = function (data, index) {
		return getDataLabel.call(this, data, index);
	};

	_ComponentBase.getMapData = function (data, index) {
		return getMapData.call(this, data, index);
	};

	_ComponentBase.tap = function (selector, data, callback, stopPropagation) {
		if (Utils.isFunction(selector)) {
			stopPropagation = data;
			callback = selector;
			selector = data = null;
		}
		if (Utils.isFunction(data)) {
			callback = data;
			data = null;
		}
		this.$el.on("tap", selector, data, callback);
	};

	_ComponentBase.isRenderAsApp = function () {
		return VRender.ENV.isApp;
	};

	_ComponentBase.isRenderAsIphone = function () {
		return VRender.ENV.isIphone;
	};

	_ComponentBase.isRenderAsRem = function () {
		return VRender.ENV.useRem;
	};

	_ComponentBase.isMultiple = function () {
		return this.$el.attr("multiple") == "multiple";
	};

	_ComponentBase.getSelectedIndex = function (split) {
		var selectedIndex = this.$el.attr("data-inds");
		if (split && Utils.isNotNull(selectedIndex)) {
			selectedIndex = ("" + selectedIndex).split(",");
		}
		return selectedIndex;
	};

	_ComponentBase.getSelectedId = function (split) {
		var selectedId = this.$el.attr("data-ids");
		if (split && Utils.isNotNull(selectedId)) {
			selectedId = ("" + selectedId).split(",");
		}
		return selectedId;
	};

	_ComponentBase.getSelectedData = function () {
		var datas = Utils.toArray(this.options.data);
		var items = HolderItems.getSelectedItems.call(this, datas, true);
		return items && items.length > 0 ? items : null;
	};

	_ComponentBase.isDataSelected = function (data, index, selectedIndex, selectedId) {
		return HolderItems.isSelected.call(this, data, index, selectedIndex, selectedId);
	};

	// ====================================================
	_ComponentBase.load = function (api, params, callback) {
		if (Utils.isBlank(api))
			return false;
		var self = this;
		Component.load.call(this, api, params, function (err, data) {
			if (!err && Utils.isFunction(self.setData))
				self.setData(data);
			if (Utils.isFunction(callback))
				callback(err, data);
			self.trigger("loaded");
		});
	};

	_ComponentBase.reload = function (callback) {
		if (Utils.isFunction(this.load))
			this.load(this.lastLoadApi, this.lastLoadParams, callback);
	};

	_ComponentBase.setEnabled = function (enabled) {
		if (typeof enabled === "undefined" || enabled === null)
			this.setDisabled(false);
		else
			this.setDisabled(!Utils.isTrue(enabled));
	};

	_ComponentBase.setDisabled = function (disabled) {
		if (typeof disabled === "undefined" || disabled === null)
			disabled = true;
		if (Utils.isTrue(disabled))
			this.$el.addClass("disabled").attr("disabled", "disabled");
		else
			this.$el.removeClass("disabled").removeAttr("disabled");
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
			this.setDisabled(Utils.isTrue(options.disabled));
		}
		else if (options.hasOwnProperty("enabled")) {
			this.setDisabled(!Utils.isTrue(options.enabled));
		}

		if (!options.data) {
			var items = target.attr("data-items");
			if (items)
				options.data = JSON.parse(unescape(items));
		}
		this.$el.removeAttr("data-items");
	};

	var tryAutoLoad = function () {
		if (isAutoLoad.call(this) && Utils.isFunction(this.load)) {
			var apiName = this.options.api || this.$el.attr("api-name");

			var params = null;
			if (this.options.hasOwnProperty("params"))
				params = this.options.params;
			else {
				try {
					params = JSON.parse(this.$el.attr("api-params") || null);
				}
				catch (e) {}
			}

			params = $.extend({}, params);
			var pager = Utils.isFunction(this.getPaginator) && this.getPaginator();
			if (pager) {
				if (Utils.isFunction(pager.getPageNo))
					params.page = pager.getPageNo();
				if (Utils.isFunction(pager.getPageSize))
					params.rows = pager.getPageSize();
			}

			var searcher = Utils.isFunction(this.getSearcher) && this.getSearcher();
			if (searcher && Utils.isFunction(searcher.getParams)) {
				params = $.extend(params, searcher.getParams());
			}

			var self = this;
			this.load(apiName, params, function () {
				tryAutoSelect.call(self);
			});
		}
	};

	var isAutoLoad = function () {
		if (this.options.hasOwnProperty("autoLoad"))
			return Utils.isTrue(this.options.autoLoad);
		return Utils.isTrue(this.$el.attr("api-autoload"));
	};

	var tryAutoSelect = function () {
		var self = this;

		var setByIndex = function (value) {
			if (Utils.isFunction(self.setSelectedIndex) && value) {
				value = value.split(",");
				self.setSelectedIndex(value.length > 1 ? value : value[0]);
			}
		};
		var setById = function (value) {
			if (Utils.isFunction(self.setSelectedId) && value) {
				value = value.split(",");
				self.setSelectedId(value.length > 1 ? value : value[0]);
			}
		};

		if (this.options.hasOwnProperty("selectedIndex"))
			setByIndex(this.options.selectedIndex);
		else if (Utils.isNotBlank(this.$el.attr("data-tryindex")))
			setByIndex(this.$el.attr("data-tryindex"));
		else if (this.options.hasOwnProperty("selectedId"))
			setById(this.options.selectedId);
		else if (Utils.isNotBlank(this.$el.attr("data-tryid")))
			setById(this.$el.attr("data-tryid"));

		delete this.options.selectedIndex;
		delete this.options.selectedId;
		this.$el.removeAttr("data-tryindex");
		this.$el.removeAttr("data-tryid");
	};


	///////////////////////////////////////////////////////
	Component.base = ComponentBase;
	Component.HolderBase = HolderBase;
	Component.HolderItems = HolderItems;

})(typeof VRender !== "undefined");
