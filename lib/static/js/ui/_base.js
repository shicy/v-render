// ========================================================
// 前端组件基类
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function () {
	if (typeof VRender === "undefined") {
		// 兼容老组件
		return module.exports = {HolderBase: function () {}, HolderItems: function () {}};
	}

	if (VRender.Component.base)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;

	///////////////////////////////////////////////////////
	var ComponentBase = function (view) {};
	var _ComponentBase = ComponentBase.prototype = new VRender.EventEmitter();

	// 组件初始化，如果该标签对应的组件已经初始化，则返回已初始化的组件对象
	// 初始化内容包括：id, name, class, style, disabled, data等信息
	// 如果是异步组件将自动加载异步数据，并渲染
	ComponentBase.init = function (view, options) {
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

	// 原始数据经由适配器转换，获取适配后的数据
	ComponentBase.doAdapter = function (data) {
		return Component.Render.fn.doAdapter.call(this, data);
	};

	// 获取接口定义方法，能获取服务端定义的方法
	// 优先获取前端定义或赋值的方法：options.fn > component.fn > serverside.fn
	ComponentBase.getFunction = function (name, type) {
		if (this.options.hasOwnProperty(name))
			return this.options[name];
		if (this.hasOwnProperty(name))
			return this[name];
		var func = null;
		var target = this.$el.children(".ui-fn[name='" + type + "']");
		if (target && target.length > 0) {
			func = target.text();
			if (Utils.isNotBlank(func)) {
				func = (new Function("var Utils=VRender.Utils;return (" + unescape(func) + ");"))();
				func._state = target.attr("fn-state") || null;
				func._data = target.attr("fn-data") || null;
				if (func._data) {
					try {
						func._data = JSON.parse(func._data);
					}
					catch (e) {}
				}
			}
			target.remove();
		}
		this[name] = func;
		return func;
	};

	// ====================================================
	// 初始化方法，方便子类继承、调用
	_ComponentBase.init = function (view, options) {
		return ComponentBase.init.call(this, view, options);
	};

	// 组件是否在应用模式下渲染（一般指移动端渲染）
	_ComponentBase.isRenderAsApp = function () {
		return VRender.ENV.isApp;
	};

	// 组件是否在 iPhone 手机渲染
	_ComponentBase.isRenderAsIphone = function () {
		return VRender.ENV.isIphone;
	};

	// 组件是否使用 rem 度量单位（否则默认为 px）
	_ComponentBase.isRenderAsRem = function () {
		return VRender.ENV.useRem;
	};

	// ====================================================
	// 获取组件数据（集），返回经适配器转换后的数据
	_ComponentBase.getData = function () {
		this.options.data = this._doAdapter(this.options.data);
		return this.options.data;
	};

	// 设置组件数据（集），一般子类需要负责视图刷新
	_ComponentBase.setData = function (value) {
		this.options.data = value;
		this._dataChanged("set", this.getData());
	};

	// 获取数据转换适配器
	_ComponentBase.getDataAdapter = function () {
		if (this.options.hasOwnProperty("adapter"))
			return this.options.adapter;
		return ComponentBase.getFunction.call(this, "dataAdapter", "adapter");
	};

	// 设置数据转换适配器
	_ComponentBase.setDataAdapter = function (value) {
		this.options.adapter = value;
		delete this.options.dataAdapter;
	};

	// 获取数据绑定映射方法
	_ComponentBase.getDataMapper = function () {
		if (this.options.hasOwnProperty("mapper"))
			return this.options.mapper;
		return ComponentBase.getFunction.call(this, "dataMapper", "mapper");
	};

	// 设置数据绑定映射方法
	_ComponentBase.setDataMapper = function (value) {
		this.options.mapper = value;
		delete this.options.dataMapper;
	};

	// 判断组件是否可用
	_ComponentBase.isEnabled = function () {
		return !this.$el.is(".disabled");
	};

	// 设置组件是否可用
	_ComponentBase.setEnabled = function (enabled) {
		if (typeof enabled === "undefined" || enabled === null)
			enabled = true;
		if (Utils.isTrue(enabled))
			this.$el.removeClass("disabled").removeAttr("disabled");
		else 
			this.$el.addClass("disabled").attr("disabled", "disabled");
	};

	// ====================================================
	// 异步数据加载方法
	_ComponentBase.load = function (api, params, callback) {
		api = api || this.lastLoadApi;
		if (Utils.isBlank(api))
			return false;
		var self = this;
		var timerId = this.loadTimerId = Date.now();
		this.$el.addClass("is-loading");
		Component.load.call(this, api, params, function (err, data) {
			if (timerId == self.loadTimerId) { // 连续多次执行，忽略之前的
				self.$el.removeClass("is-loading");
				if (!err) {
					self.options.data = data;
					if (Utils.isFunction(self.setData))
						self.setData(data);
				}
				if (Utils.isFunction(callback))
					callback(err, data);
				self.trigger("loaded", err, data);
			}
		});
		return true;
	};

	// 重新加载异步数据
	_ComponentBase.reload = function (callback) {
		if (Utils.isFunction(this.load)) {
			var params = Utils.extend({}, this.lastLoadParams, {p_no: 1});
			return this.load(this.lastLoadApi, params, callback);
		}
		return false;
	};

	_ComponentBase.isLoading = function () {
		return this.$el.is(".is-loading");
	};

	// 点击事件，兼容移动端的点击事件
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

	// ====================================================
	// 数据变更的时候调用方法
	_ComponentBase._dataChanged = function (type, data) {
		// 子类需继承
	};

	// 获取数据编号
	_ComponentBase._getDataId = function (data) {
		return Component.Render.fn.getDataId.call(this, data);
	};

	// 获取数据显示文本
	_ComponentBase._getDataLabel = function (data, index) {
		return Component.Render.fn.getDataLabel.call(this, data, index);
	};

	_ComponentBase._doAdapter = function (data) {
		return ComponentBase.doAdapter.call(this, data);
	};

	_ComponentBase._isMounted = function () {
		return $("body").find(this.$el).length > 0;
	};

	// 快照
	_ComponentBase._snapshoot = function () {
		var state = {}, newState = {}, self = this;

		var snapshoot = {};
		if (!this._rootSnapshoot)
			this._rootSnapshoot = snapshoot;

		snapshoot.shoot = function (_state, args) {
			_state = _state || state;
			if (Utils.isFunction(self._snapshoot_shoot)) {
				var params = Array.prototype.slice.call(arguments);
				params[0] = _state;
				self._snapshoot_shoot.apply(self, params);
			}
			else {
				_state.data = self.getData();
			}
		};

		snapshoot.compare = function (args) {
			var params = Array.prototype.slice.call(arguments);
			if (Utils.isFunction(self._snapshoot_compare)) {
				return self._snapshoot_compare.apply(self, [state].concat(params));
			}
			else {
				this.shoot.apply(this, [newState].concat(params));
				return state.data == newState.data;
			}
		};

		snapshoot.done = function (args) {
			var hasChanged = false;
			if (self._rootSnapshoot == this) {
				var params = Array.prototype.slice.call(arguments);
				if (!this.compare.apply(this, params)) {
					this.shoot.apply(this, [newState].concat(params));
					self.trigger("change", newState.data, state.data);
					hasChanged = true;
				}
			}
			this.release();
			return hasChanged;
		};

		snapshoot.release = function () {
			if (self._rootSnapshoot == this)
				self._rootSnapshoot = null;
		};

		snapshoot.getState = function () {
			return state;
		};

		snapshoot.shoot(state);
		newState.data = state.data;

		return snapshoot;
	};


	///////////////////////////////////////////////////////
	var ComponentList = function () {};
	var _ComponentList = ComponentList.prototype = new ComponentBase();

	// 列表数据适配转换，确保返回的是数组
	ComponentList.doAdapter = function (data, index) {
		return Component.Render.fn.doAdapter.call(this, data, index);
	};

	// 获取接口定义方法
	ComponentList.getFunction = function (name, type) {
		return ComponentBase.getFunction.call(this, name, type);
	};

	// 解析并返回一个整数数组，忽略无效数据
	// 参数可以是数组（[1,2,3]）或逗号分隔的字符串（"1,2,3"）
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

	// 设置列表选中项的索引（只更新索引，不修改视图）
	ComponentList.setSelectedIndex = function (value) {
		var max = Utils.isFunction(this.length) ? (this.length() - 1) : null;
		var indexs = ComponentList.getIntValues(value, 0, max);
		if (indexs.length > 0 && !this.isMultiple())
			indexs = [indexs[0]];
		this.$el.attr("data-inds", indexs.join(","));
		this.$el.removeAttr("data-ids");
		return indexs;
	};

	// 选中索引递增
	ComponentList.riseSelectedIndex = function (value) {
		var index = Utils.getIndexValue(value);
		var selectedIndex = this.getSelectedIndex(true);
		if (selectedIndex && selectedIndex.length > 0) {
			selectedIndex = Utils.map(selectedIndex, function (val) {
				return val < index ? val : (val + 1);
			});
			ComponentList.setSelectedIndex.call(this, selectedIndex);
		}
	};

	// 选中索引递减
	ComponentList.reduceSelectedIndex = function (value) {
		var index = Utils.getIndexValue(value);
		var selectedIndex = this.getSelectedIndex(true);
		if (selectedIndex && selectedIndex.length > 0) {
			selectedIndex = Utils.map(selectedIndex, function (val) {
				return val > index ? (val - 1) : (val == index ? -1 : val);
			});
			ComponentList.setSelectedIndex.call(this, selectedIndex);
		}
	};

	// 判断2个索引是否一致，包括多选的情况
	// 参数可以是数组（[1,2,3]）或逗号分隔的字符串（"1,2,3"）
	ComponentList.equalIndex = function (index1, index2) {
		index1 = ComponentList.getIntValues(index1, 0);
		index2 = ComponentList.getIntValues(index2, 0);
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

	// 渲染列表项
	ComponentList.renderItems = function (itemContainer, datas) {
		Component.Render.fn.renderItems.call(this, $, itemContainer, datas);
	};

	// 渲染单个列表项
	ComponentList.renderOneItem = function (item, container, data, index, bSelected) {
		Component.Render.fn.renderOneItem.call(this, $, item, container, data, index, bSelected);
	};

	// 判断对象是否选中
	ComponentList.isSelected = function (data, index, selectedIndex, selectedId) {
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
			var id = this._getDataId(data);
			if (!Utils.isArray(selectedId))
				selectedId = ("" + selectedId).split(",");
			var findIndex = Utils.index(selectedId, function (tmp) { return tmp == id; });
			return findIndex >= 0;
		}
		return false;
	};

	// 添加列表项
	ComponentList.addItem = function (data, index) {
		index = Utils.getIndexValue(index);

		var datas = this.getData();
		data = ComponentList.doAdapter.call(this, data, index);

		var newItem = null;
		var itemContainer = this._getItemContainer();
		if (itemContainer && itemContainer.length > 0) {
			newItem = this._getNewItem($, itemContainer, data, index);
			if (newItem) {
				if (index >= 0 && index < datas.length) {
					var items = this._getItems();
					if (items && items.length > 0)
						items.eq(index).before(newItem);
				}
				this._renderOneItem($, newItem, data, index, false);
			}
		}

		if (index >= 0 && index < datas.length) {
			ComponentList.riseSelectedIndex.call(this, index);
			datas.splice(index, 0, data);
		}
		else 
			datas.push(data);

		return newItem;
	};

	// 更新列表项，index无效时将被忽略
	ComponentList.updateItem = function (data, index) {
		data = ComponentList.doAdapter.call(this, data, index);
		if (!index && index !== 0)
			index = this.getDataIndex(data);
		else
			index = Utils.getIndexValue(index);
		if (index >= 0) {
			var datas = this.getData();
			if (index < datas.length) {
				var itemContainer = this._getItemContainer();
				if (itemContainer && itemContainer.length > 0) {
					var items = this._getItems();
					var item = this._getNewItem($, itemContainer, data, index);
					if (item) {
						items.eq(index).before(item).remove();
						var bSelected = this.isSelectedIndex(index);
						this._renderOneItem($, item, data, index, bSelected);
					}
					else {
						items.eq(index).remove();
					}
				}
				datas.splice(index, 1, data);
			}
			else {
				index = -1;
			}
		}
		return index;
	};

	// 删除列表项
	ComponentList.removeItem = function (item, index) {
		if (item && item.length > 0)
			index = item.index();
		else {
			index = Utils.getIndexValue(index);
			if (index < 0)
				return null;
			var items = this._getItems();
			if (items && items.length > index)
				item = items.eq(index);
		}

		if (item && item.length > 0)
			item.remove();

		var datas = this.getData();
		if (datas && datas.length > index) {
			ComponentList.reduceSelectedIndex.call(this, index);
			return datas.splice(index, 1);
		}

		return null;
	};

	ComponentList.initPager = function () {
		if (this.options.hasOwnProperty("pager"))
			this.setPager(this.options.pager);
		else {
			var pager = this.$el.attr("opt-pager");
			pager = pager && $(pager);
			if (pager && pager.length > 0) {
				this.setPaginator(Component.get(pager) || pager);
			}
			this.$el.removeAttr("opt-pager");
		}
	};

	ComponentList.getPager = function () {
		return this.pager;
	};

	ComponentList.setPager = function (pager) {
		if (this.pager) {
			if (Utils.isFunction(this.pager.off))
				this.pager.off("change");
		}
		this.pager = pager;
		if (this.pager && Utils.isFunction(this.pager.on)) {
			var self = this;
			this.pager.on("change", function (e, data) {
				var params = $.extend({}, self.lastLoadParams);
				params.p_no = data && data.page;
				params.p_size = data && data.size;
				if (!params.p_no && Utils.isFunction(pager.getPage))
					params.p_no = pager.getPage();
				if (!params.p_size && Utils.isFunction(pager.getSize))
					params.p_size = pager.getSize();
				// if (Utils.isFunction(self.setData))
				// 	self.setData(null);
				if (!(params.p_no == self._pageNo && params.p_size == self._pageSize))
					self.load(self.lastLoadApi, params);
			});
		}
	};

	ComponentList.checkIfEmpty = function () {
		var items = this._getItems();
		if (items && items.length > 0)
			this.$el.removeClass("is-empty");
		else
			this.$el.addClass("is-empty");
	};

	// ====================================================
	_ComponentList.init = function (view, options) {
		var component = ComponentBase.init.call(this, view, options);
		if (component === this) {
			this._checkIfEmpty();
			this._initPager();
		}
		return component;
	};

	// 设置组件数据集
	_ComponentList.setData = function (value) {
		var snapshoot = this._snapshoot();

		this.options.data = this._doAdapter(value);
		ComponentList.setSelectedIndex.call(this, []);

		var itemContainer = this._getItemContainer();
		if (itemContainer && itemContainer.length > 0) {
			this._renderItems($, itemContainer.empty(), this.options.data);
		}
		this._checkIfEmpty(this.options.data);

		this._dataChanged("set", this.options.data);
		snapshoot.done([], []);
	};

	// 获取某索引对应的数据
	_ComponentList.getDataAt = function (index) {
		if (isNaN(index) || index === "")
			return null;
		index = parseInt(index);
		if (index < 0)
			return null;
		var datas = this.getData() || [];
		return index < datas.length ? datas[i] : null;
	};

	// 获取数据在列表中的索引
	_ComponentList.getDataIndex = function (data) {
		var datas = this.getData();
		if (datas && datas.length > 0) {
			var self = this;
			var id = this._getDataId(data);
			return Utils.index(datas, function (temp) {
				return temp == data || self._getDataId(temp) == id;
			});
		}
		return -1;
	};

	_ComponentList.getDataById = function (id) {
		return this.getDataAt(this.getIndexById(id));
	};

	_ComponentList.getIndexById = function (id) {
		var datas = this.getData();
		if (datas && datas.length > 0) {
			var self = this;
			return Utils.index(datas, function (temp) {
				return self._getDataId(temp) == id;
			});
		}
		return -1;
	};

	_ComponentList.getDataByName = function (name) {
		return this.getDataAt(this.getIndexByName(name));
	};

	// 根据 name 属性获取索引
	_ComponentList.getIndexByName = function (name) {
		var datas = this.getData();
		if (datas && datas.length > 0) {
			return Utils.index(datas, function (temp) {
				return temp && temp.name == name;
			});
		}
		return -1;
	};

	// 获取组件数据代表唯一编号的字段名称
	_ComponentList.getIdField = function () {
		return this.options.idField || this.$el.attr("opt-idfield");
	};

	// 设置组件数据代表唯一编号的字段名称
	_ComponentList.setIdField = function (value) {
		this.options.idField = Utils.isBlank(value) ? "" : value;
		this.$el.attr("opt-idfield", this.options.idField);
	};

	// 获取用来显示组件数据的字段名称
	_ComponentList.getLabelField = function () {
		return this.options.labelField || this.$el.attr("opt-label");
	};

	// 设置用来显示组件数据的字段名称
	_ComponentList.setLabelField = function (value) {
		this.options.labelField = value || "";
		this.$el.attr("opt-label", this.options.labelField);
	}

	// 获取用来显示组件数据的方法，如：function (data) { return data.name; }
	_ComponentList.getLabelFunction = function () {
		return ComponentBase.getFunction.call(this, "labelFunction", "lblfunc");
	};

	// 设置用来显示组件数据的方法，如：function (data) { return data.name; };
	_ComponentList.setLabelFunction = function (value) {
		this.options.labelFunction = value;
	};

	// 判断组件或组件列表项是否可用
	// 参数为字符串时判断名称对应列表项，为数字时判断索引对应的列表项，否则返回组件是否可用
	_ComponentList.isEnabled = function (value) {
		if (typeof value === "number") {
			var item = this._getItemAt(value);
			return item && !item.is(".disabled");
		}
		if (typeof value === "string") {
			return this.isEnabled(this.getIndexByName(value));
		}
		return !this.$el.is(".disabled");
	};

	// 设置组件或列表项是否可用
	_ComponentList.setEnabled = function (enabled, value) {
		if (typeof value === "string") {
			return this.setEnabled(enabled, this.getIndexByName(value));
		}
		var target = this.$el;
		if (typeof value === "number") {
			target = this._getItemAt(value);
		}
		if (target) {
			enabled = Utils.isNull(enabled) ? true : Utils.isTrue(enabled);
			if (enabled)
				target.removeClass("disabled").removeAttr("disabled");
			else
				target.addClass("disabled").attr("disabled", "disabled");
		}
	};

	// 获取列表数据项个数
	_ComponentList.length = function () {
		return Utils.toArray(this.getData()).length;
	};

	// 判断列表是否支持多选
	_ComponentList.isMultiple = function () {
		return this.$el.attr("multiple") == "multiple";
	};
	_ComponentList.setMultiple = function (value) {
		if (typeof value === "undefined" || value === null)
			value = true;
		if (Utils.isTrue(value))
			this.$el.attr("multiple", "multiple");
		else
			this.$el.removeAttr("multiple");
	};

	// 获取项渲染器
	_ComponentList.getItemRenderer = function () {
		if (this.options.hasOwnProperty("renderer"))
			return this.options.renderer;
		return ComponentBase.getFunction.call(this, "itemRenderer", "irender");
	};

	// 设置项渲染器
	_ComponentList.setItemRenderer = function (value) {
		this.options.renderer = value;
		delete this.options.itemRenderer;
	};

	// 获取当前选中项的索引
	_ComponentList.getSelectedIndex = function (needArray) {
		var selectedIndex = this.$el.attr("data-inds");
		if (Utils.isNull(selectedIndex)) {
			selectedIndex = [];
			var self = this;
			var datas = this.getData();
			var selectedId = this.$el.attr("data-ids");
			if (Utils.isNull(selectedId)) {
				Utils.each(datas, function (data, i) {
					// 给定空数组防止循环调用（_isSelected()方法中有调用getSelectedIndex()方法）
					if (self._isSelected(data, i, [], []))
						selectedIndex.push(i);
				});
			}
			else if (selectedId.length > 0) {
				selectedId = selectedId.split(",");
				Utils.each(datas, function (data, i) {
					var _id = self._getDataId(data);
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

	// 设置当前选中项的索引
	_ComponentList.setSelectedIndex = function (value) {
		var snapshoot = this._snapshoot();
		var indexs = ComponentList.setSelectedIndex.call(this, value);
		if (!snapshoot.compare(indexs)) {
			var items = this._getItems();
			if (items && items.length > 0) {
				items.removeClass("selected");
				Utils.each(indexs, function (index) {
					items.eq(index).addClass("selected");
				});
			}
		}
		snapshoot.done(indexs);
	};

	// 判断某个索引是否被选中
	_ComponentList.isSelectedIndex = function (index) {
		index = Utils.getIndexValue(index);
		if (index < 0)
			return false;
		var selectedIndex = this.getSelectedIndex(true) || [];
		return this._isSelected(null, index, selectedIndex, []);
	};

	// 获取当前选中项对应的数据编号
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
					selectedId.push(self._getDataId(data));
				});
			}
		}
		else if (Utils.isNull(selectedId)) {
			selectedId = [];
			var self = this;
			Utils.each(this.getData(), function (data, i) {
				if (self._isSelected(data, i, [], []))
					selectedId.push(self._getDataId(data));
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

	// 根据数据编号设置当前选中项
	_ComponentList.setSelectedId = function (value) {
		if (!Utils.isArray(value))
			value = Utils.isBlank(value) ? [] : Utils.trimToEmpty(value).split(",");
		var indexs = [];
		var self = this;
		Utils.each(this.getData(), function (data, i) {
			var id = self._getDataId(data);
			var findIndex = Utils.index(value, function (tmp) { return tmp == id; });
			if (findIndex >= 0)
				indexs.push(i);
		});
		this.setSelectedIndex(indexs);
	};

	// 判断编号对应的项是否被选中
	_ComponentList.isSelectedId = function (value) {
		if (Utils.isBlank(value))
			return false;
		var selectedId = this.getSelectedId(true);
		var findIndex = Utils.index(selectedId, function (tmp) {
			return tmp == value;
		});
		return findIndex >= 0;
	};

	// 获取当前选中项对应的数据
	_ComponentList.getSelectedData = function (needArray) {
		var selectedIndex = this.$el.attr("data-inds");
		var selectedId = this.$el.attr("data-ids") || []; // []确保_isSelected()内部不会重复获取
		var datas = [];
		var self = this;
		Utils.each(this.getData(), function (data, i) {
			if (self._isSelected(data, i, selectedIndex, selectedId))
				datas.push(data);
		});
		if (needArray || this.isMultiple())
			return datas;
		return datas.length > 0 ? datas[0] : null;
	};

	// 判断是否选中所有项
	_ComponentList.isAllSelected = function () {
		var length = this.length();
		if (length > 0) {
			var selectedIndexs = this.getSelectedIndex(true);
			if (selectedIndexs && selectedIndexs.length == length)
				return true;
		}
		return false;
	};

	// 添加列表项
	// index添加项到指定索引位置
	_ComponentList.addItem = function (data, index) {
		if (Utils.isNotNull(data)) {
			var snapshoot = this._snapshoot();
			ComponentList.addItem.call(this, data, index);
			this._checkIfEmpty();
			this._dataChanged("add", data, this.getDataIndex(data));
			snapshoot.done();
		}
	};

	// 更新列表项，index无效时将被忽略
	_ComponentList.updateItem = function (data, index) {
		if (Utils.isNotNull(data)) {
			index = ComponentList.updateItem.call(this, data, index);
			// this._checkIfEmpty();
			this._dataChanged("update", data, index);
		}
	};

	// 删除列表项
	_ComponentList.removeItem = function (data) {
		return this.removeItemAt(this.getDataIndex(data));
	};

	// 删除列表项
	_ComponentList.removeItemAt = function (index) {
		var snapshoot = this._snapshoot();

		var data = ComponentList.removeItem.call(this, null, index);
		if (data) {
			this._checkIfEmpty();
			this._dataChanged("delete", data, index);
		}

		snapshoot.done();

		return data;
	};

	// 添加或更新列表项
	_ComponentList.addOrUpdateItem = function (data) {
		var index = this.getDataIndex(data);
		if (index >= 0)
			this.updateItem(data, index);
		else
			this.addItem(data, index);
	};

	// 获取列表项数据，target可以是列表里任意标签
	_ComponentList.getItemData = function (target) {
		var item = $(target);
		if (item && item.length > 0) {
			var itemContainer = this._getItemContainer();
			if (itemContainer && itemContainer.length > 0) {
				target = item.parent();
				while (true) {
					if (!target || target.length == 0) {
						item = null;
						break;
					}
					if (target.is(itemContainer)) {
						break;
					}
					item = target;
					target = item.parent();
				}
				if (item && item.length > 0)
					return this._getItemData(item);
			}
		}
		return null;
	};

	_ComponentList.more = function (callback) {
		if (this.lastLoadApi && Utils.isFunction(this.hasMore) && this.hasMore()) {
			var params = Utils.extend({}, this.lastLoadParams);
			params.p_no = this._pageNo + 1;
			var self = this;
			this.$el.addClass("is-loading");
			Component.load.call(this, this.lastLoadApi, params, function (err, data) {
				self.$el.removeClass("is-loading");
				if (!err && data) {
					if (Utils.isFunction(self.addItem)) {
						Utils.each(data, function (temp) {
							self.addItem(temp);
						});
					}
					else {
						var datas = this.options.data || [];
						this.options.data = datas.concat(data);
					}
				}
				if (Utils.isFunction(callback))
					callback(err, data);
				self.trigger("loaded", err, data);
			});
			return true;
		}
		return false;
	};

	_ComponentList.hasMore = function () {
		if (this._totalSize) {
			return this._pageNo * this._pageSize < this._totalSize;
		}
		return false;
	};

	_ComponentList.isEmpty = function () {
		if (this.$el.is(".is-empty"))
			return true;
		var datas = this.getData();
		return !datas || datas.length == 0;
	};

	// ====================================================
	// _ComponentList._dataChanged = function (type, data) {
	// };

	// 渲染列表项
	_ComponentList._renderItems = function ($, itemContainer, datas) {
		datas = datas || this.getData();
		ComponentList.renderItems.call(this, itemContainer, datas);
	};

	// 渲染单个列表项
	_ComponentList._renderOneItem = function ($, item, data, index, bSelected) {
		ComponentList.renderOneItem.call(this, item, null, data, index, bSelected);
	};

	// 获取选项容器
	_ComponentList._getItemContainer = function () {
		return this.$el;
	};

	// 获取所有列表项，确保返回jQuery对象
	_ComponentList._getItems = function (selector) {
		var itemContainer = this._getItemContainer();
		if (itemContainer && itemContainer.length > 0)
			return itemContainer.children(selector);
	};

	// 获取某索引的列表项
	_ComponentList._getItemAt = function (index) {
		index = Utils.getIndexValue(index);
		if (index >= 0) {
			return Utils.find(this._getItems(), function (item, i) {
				var _index = parseInt(item.attr("opt-ind"));
				if (isNaN(_index))
					_index = i;
				return index == _index;
			});
		}
		return null;
	};

	// 新建一个列表项
	_ComponentList._getNewItem = function ($, itemContainer, data, index) {
		return $("<li></li>").appendTo(itemContainer);
	};

	// 获取选项绑定的数据
	_ComponentList._getItemData = function (item, index) {
		var data = item.data("itemData");
		if (!data) {
			var datas = this.getData(true);
			if (Utils.isArray(datas)) {
				if (isNaN(index) || !(index || index === 0)) {
					index = parseInt(item.attr("opt-ind"));
					if (isNaN(index))
						index = item.index();
				}
				data = datas[index];
			}
		}
		return Utils.isEmpty(data) ? null : data;
	};

	// 判断是否选中
	_ComponentList._isSelected = function (data, index, selectedIndex, selectedId) {
		return ComponentList.isSelected.call(this, data, index, selectedIndex, selectedId);
	};

	_ComponentList._doAdapter = function (data) {
		var datas = Utils.toArray(data);
		if (datas._vr_adapter_flag)
			return datas;

		var self = this;
		datas = Utils.map(datas, function (data, i) {
			return ComponentList.doAdapter.call(self, data, i);
		});
		datas._vr_adapter_flag = true;

		return datas;
	};

	_ComponentList._checkIfEmpty = function () {
		ComponentList.checkIfEmpty.call(this);
	};

	_ComponentList._initPager = function () {
		ComponentList.initPager.call(this);
	}

	_ComponentList._snapshoot_shoot = function (state, selectedIndex, selectedData) {
		state.selectedIndex = selectedIndex || this.getSelectedIndex();
		state.selectedData = selectedData || this.getSelectedData();
		state.data = state.selectedData;
	};

	_ComponentList._snapshoot_compare = function (state, selectedIndex) {
		if (!selectedIndex)
			selectedIndex = this.getSelectedIndex(true);
		return ComponentList.equalIndex(state.selectedIndex, selectedIndex);
	};

	///////////////////////////////////////////////////////
	// 初始化
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

		if (options.visible === false || options.visible === "gone")
			target.css("display", "none");
		else if (options.visible === "hidden")
			target.css("visibility", "hidden");

		if (Utils.isNotBlank(options.ref))
			target.attr("ref", options.ref);

		if (!options.data) {
			var items = target.attr("data-items");
			if (items)
				options.data = JSON.parse(unescape(items));
			else 
				options.data = target.data();
		}
		this.$el.removeAttr("data-items");
	};

	// 组件初始化时，视图自动加载异步数据
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
				if (!params.p_no && Utils.isFunction(pager.getPage))
					params.p_no = pager.getPage();
				if (!params.p_size && Utils.isFunction(pager.getSize))
					params.p_size = pager.getSize();
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

	// 判断是否需要自动加载异步数据
	var isAutoLoad = function () {
		if (this.options.hasOwnProperty("autoLoad"))
			return Utils.isTrue(this.options.autoLoad);
		return Utils.isTrue(this.$el.attr("api-autoload"));
	};

	// 组件初始化时，异步加载完成后，自动选择列表项
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
