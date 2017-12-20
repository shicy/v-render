// ========================================================
// 前端组件基类
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function () {
	if (typeof VRender === "undefined")
		return module.exports = {HolderBase: function () {}, HolderItems: function () {}};

	if (VRender.Component.base)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;

	///////////////////////////////////////////////////////
	var ComponentBase = function (view) {};
	var _ComponentBase = ComponentBase.prototype = new VRender.EventEmitter();

	ComponentBase.doAdapter = function (data) {
		return Component.Render.fn.doAdapter.call(this, data);
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

	// ====================================================
	_ComponentBase.getData = function () {
		return ComponentBase.doAdapter.call(this, this.options.data);
	};
	_ComponentBase.setData = function (value) {
		this.options.data = value;
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

	_ComponentBase.getDataId = function (data) {
		return Component.Render.fn.getDataId.call(this, data);
	};

	_ComponentBase.getDataLabel = function (data, index) {
		return Component.Render.fn.getDataLabel.call(this, data, index);
	};

	_ComponentBase.getMapData = function (data, index) {
		return Component.Render.fn.getMapData.call(this, data, index);
	};

	// ====================================================
	_ComponentBase.load = function (api, params, callback) {
		if (Utils.isBlank(api))
			return false;
		var self = this;
		Component.load.call(this, api, params, function (err, data) {
			if (!err) {
				self.options.data = data;
				if (Utils.isFunction(self.setData))
					self.setData(data);
			}
			if (Utils.isFunction(callback))
				callback(err, data);
			self.trigger("loaded");
		});
	};

	_ComponentBase.reload = function (callback) {
		if (Utils.isFunction(this.load))
			this.load(this.lastLoadApi, this.lastLoadParams, callback);
	};

	_ComponentBase.isEnabled = function () {
		return !this.isDisabled();
	};

	_ComponentBase.setEnabled = function (enabled) {
		if (typeof enabled === "undefined" || enabled === null)
			this.setDisabled(false);
		else
			this.setDisabled(!Utils.isTrue(enabled));
	};

	_ComponentBase.isDisabled = function () {
		return this.$el.is(".disabled");
	};

	_ComponentBase.setDisabled = function (disabled) {
		if (typeof disabled === "undefined" || disabled === null)
			disabled = true;
		if (Utils.isTrue(disabled))
			this.$el.addClass("disabled").attr("disabled", "disabled");
		else
			this.$el.removeClass("disabled").removeAttr("disabled");
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


	///////////////////////////////////////////////////////
	var ComponentList = function () {};
	var _ComponentList = ComponentList.prototype = new ComponentBase();

	ComponentList.doAdapter = function (data) {
		return ComponentBase.doAdapter.call(this, Utils.toArray(data));
	};

	ComponentList.getFunction = function (name, type) {
		return ComponentBase.getFunction.call(this, name, type);
	};

	ComponentList.getIntValues = function (value, min, max) {
		if (!Utils.isArray(value))
			value = Utils.isBlank(value) ? [] : ("" + value).split(",");
		min = Utils.isNull(min) ? Number.NEGATIVE_INFINITY : min;
		max = Utils.isNull(max) ? Number.POSITIVE_INFINITY : max;
		var values = [];
		Utils.each(value, function (val) {
			if (!isNaN(val)) {
				val = parseInt(val);
				if (!isNaN(val) && values.indexOf(val) < 0) {
					if (val >= min && val <= max)
						values.push(val);
				}
			}
		});
		return values;
	};

	ComponentList.setSelectedIndex = function (value) {
		var indexs = ComponentList.getIntValues(value, 0);
		if (indexs.length > 0 && !this.isMultiple())
			indexs = [indexs[0]];
		this.$el.attr("data-inds", indexs.join(","));
		this.$el.removeAttr("data-ids");
		return indexs;
	};

	ComponentList.equalIndex = function (index1, index2) {
		index1 = ComponentList.getIntValues(index1);
		index2 = ComponentList.getIntValues(index2);
		if (index1.length != index2.length)
			return false;
		index1.sort(function (a, b) { return a > b; });
		index2.sort(function (a, b) { return a > b; });
		for (var i = 0, l = index1.length; i < l; i++) {
			if (index1[i] != index2[i])
				return false;
		}
		return true;
	};

	// ====================================================
	_ComponentList.getData = function () {
		return ComponentList.doAdapter.call(this, this.options.data);
	};
	_ComponentList.setData = function (value) {
		this.options.data = Utils.toArray(value);
		this.$el.attr("data-inds", "").removeAttr("data-ids");
		// 通常还需要更新界面，由子类去做了
	};

	_ComponentList.length = function () {
		return Utils.toArray(this.getData()).length;
	};

	_ComponentList.isMultiple = function () {
		return this.$el.attr("multiple") == "multiple";
	};

	_ComponentList.getItemData = function (item) {
		var data = item.data("itemData") || item.data();
		return Utils.isEmpty(data) ? null : data;
	};

	_ComponentList.getItemRenderer = function () {
		if (this.options.hasOwnProperty("renderer"))
			return this.options.renderer;
		return ComponentBase.getFunction.call(this, "itemRenderer", "irender");
	};
	_ComponentList.setItemRenderer = function (value) {
		this.options.renderer = value;
		delete this.options.itemRenderer;
	};

	_ComponentList.getSelectedIndex = function (needArray) {
		var selectedIndex = this.$el.attr("data-inds");
		if (Utils.isNull(selectedIndex)) {
			selectedIndex = [];
			var self = this;
			var datas = this.getData();
			var selectedId = this.$el.attr("data-ids");
			if (Utils.isNull(selectedId)) {
				Utils.each(datas, function (data, i) {
					// 给定空数组防止循环调用（isDataSelected()方法中有调用getSelectedIndex()方法）
					if (self.isDataSelected(data, i, [], []))
						selectedIndex.push(i);
				});
			}
			else if (selectedId.length > 0) {
				selectedId = selectedId.split(",");
				Utils.each(datas, function (data, i) {
					var _id = self.getDataId(data);
					var findIndex = Utils.index(selectedId, function (tmp) { return tmp == _id; });
					if (findIndex >= 0)
						selectedIndex.push(i);
				});
			}
			if (selectedIndex.length == 0)
				selectedIndex = null; // 没有直接设置
		}
		else {
			selectedIndex = ComponentList.getIntValues(selectedIndex, 0);
		}
		if (needArray || this.isMultiple())
			return selectedIndex;
		return (selectedIndex && selectedIndex.length > 0) ? selectedIndex[0] : -1;
	};

	_ComponentList.setSelectedIndex = function (value, trigger) {
		var indexs = ComponentList.setSelectedIndex(value);

		var items = this.getJQItems();
		if (items && items.length > 0) {
			items.removeClass("selected");
			Utils.each(indexs, function (index) {
				items.eq(index).addClass("selected");
			});
		}

		if (trigger)
			this.trigger("change", this.getSelectedData());
	};

	_ComponentList.getSelectedId = function (needArray) {
		var selectedId = this.$el.attr("data-ids");
		var selectedIndex = this.$el.attr("data-inds");
		if (Utils.isNotNull(selectedIndex)) {
			selectedId = [];
			selectedIndex = ComponentList.getIntValues(selectedIndex, 0);
			if (selectedIndex.length > 0) {
				var self = this;
				var datas = this.getData() || [];
				Utils.each(selectedIndex, function (index) {
					var data = index < datas.length ? datas[index] : null;
					selectedId.push(self.getDataId(data));
				});
			}
		}
		else if (Utils.isNull(selectedId)) {
			selectedId = [];
			var self = this;
			Utils.each(this.getData(), function (data, i) {
				if (self.isDataSelected(data, i, [], []))
					selectedId.push(self.getDataId(data));
			});
			if (selectedId.length == 0)
				selectedId = null;
		}
		if (Utils.isNull(selectedId))
			return null;
		if (!Utils.isArray(selectedId))
			selectedId = selectedId.split(",");
		var ids = [];
		Utils.each(selectedId, function (tmp) {
			if (tmp || tmp === 0) {
				ids.push(isNaN(tmp) ? tmp : parseInt(tmp));
			}
		});
		if (needArray || this.isMultiple())
			return ids;
		return ids.length > 0 ? ids[0] : null;
	};

	_ComponentList.setSelectedId = function (value, trigger) {
		if (!Utils.isArray(value))
			value = Utils.isBlank(value) ? [] : value.split(",");
		var indexs = [];
		var self = this;
		Utils.each(this.getData(), function (data, i) {
			var id = self.getDataId(data);
			var findIndex = Utils.index(value, function (tmp) { return tmp == id; });
			if (findIndex >= 0)
				indexs.push(i);
		});
		this.setSelectedIndex(indexs, trigger);
	};

	_ComponentList.getSelectedData = function (needArray) {
		var selectedIndex = this.$el.attr("data-inds");
		var selectedId = this.$el.attr("data-ids") || []; // []确保isDataSelected()内部不会重复获取
		var datas = [];
		var self = this;
		Utils.each(this.getData(), function (data, i) {
			if (self.isDataSelected(data, i, selectedIndex, selectedId))
				datas.push(data);
		});
		if (needArray || this.isMultiple())
			return datas;
		return datas.length > 0 ? datas[0] : null;
	};

	_ComponentList.isDataSelected = function (data, index, selectedIndex, selectedId) {
		if (Utils.isNull(selectedIndex) && Utils.isNull(selectedId)) {
			selectedIndex = this.$el.attr("data-inds");
			selectedId = this.$el.attr("data-ids");
		}
		if (Utils.isNotNull(selectedIndex)) {
			if (isNaN(index))
				return false;
			index = parseInt(index);
			if (isNaN(index) || index < 0)
				return false;
			if (!Utils.isArray(selectedIndex))
				selectedIndex = ("" + selectedIndex).split(",");
			var findIndex = Utils.index(selectedIndex, function (tmp) { return tmp == index; });
			return findIndex >= 0;
		}
		if (Utils.isNotBlank(selectedId)) {
			var id = this.getDataId(data);
			if (!Utils.isArray(selectedId))
				selectedId = ("" + selectedId).split(",");
			var findIndex = Utils.index(selectedId, function (tmp) { return tmp == id; });
			return findIndex >= 0;
		}
		return false;
	};

	_ComponentList.getJQItems = function () {
		// 获取项，由子类实现，确保返回jQuery对象
	};

	///////////////////////////////////////////////////////
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
			else 
				options.data = target.data();
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
			if (Utils.isFunction(self.setSelectedIndex)) {
				self.setSelectedIndex(value);
			}
		};
		var setById = function (value) {
			if (Utils.isFunction(self.setSelectedId)) {
				self.setSelectedId(value);
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
	Component.list = ComponentList;

})();
