// ========================================================
// 前端组件基类
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function () {
	if (VRender.Component.base)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;

	///////////////////////////////////////////////////////
	var Fn = Renderer.fn || {};

	// 获取接口定义方法，能获取服务端定义的方法
	// 优先获取前端定义或赋值的方法：options.fn > component.fn > serverside.fn
	Fn.getFunction = function (name, type) {
		if (this.options.hasOwnProperty(name))
			return this.options[name];
		if (this.hasOwnProperty(name))
			return this[name];
		var func = null;
		var target = this.$el.children(".ui-fn[name='" + (type || name) + "']");
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

	// 异步数据加载方法
	Fn.load = function (api, params, callback) {
		api = api || this.lastLoadApi || this.$el.attr("api-name");
		if (Utils.isBlank(api))
			return false;
		var self = this;
		var target = this.$el.addClass("is-loading");
		var timerId = this.loadTimerId = Date.now();
		Component.load.call(this, api, params, function (err, data) {
			if (timerId == self.loadTimerId) {
				target.removeClass("is-loading");

				var pager = Utils.isFunction(self.getPaginator) && self.getPaginator();
				if (pager && Utils.isFunction(pager.set)) {
					var pageInfo = self._pageInfo || {}
					pager.set(pageInfo.total, pageInfo.page, pageInfo.size);
				}

				if (Utils.isFunction(callback))
					callback(err, data);
			}
		});
		return true;
	};

	// 解析并返回一个整数数组，忽略无效数据
	// 参数可以是数组（[1,2,3]）或逗号分隔的字符串（"1,2,3"）
	Fn.getIntValues = function (value, min, max) {
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

	// 判断2个索引是否一致，包括多选的情况
	// 参数可以是数组（[1,2,3]）或逗号分隔的字符串（"1,2,3"）
	Fn.equalIndex = function (index1, index2) {
		index1 = Fn.getIntValues(index1, 0);
		index2 = Fn.getIntValues(index2, 0);
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

	// 快照
	Fn.snapshoot = function () {
		var state = {}, newState = {}, self = this;

		var _snapshoot = {};
		if (!this._rootSnapshoot)
			this._rootSnapshoot = _snapshoot;

		_snapshoot.shoot = function (_state, args) {
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
		_snapshoot.compare = function (args) {
			var params = Array.prototype.slice.call(arguments);
			if (Utils.isFunction(self._snapshoot_compare)) {
				return self._snapshoot_compare.apply(self, [state].concat(params));
			}
			else {
				this.shoot.apply(this, [newState].concat(params));
				return state.data == newState.data;
			}
		};
		_snapshoot.done = function (args) {
			var hasChanged = false;
			if (self._rootSnapshoot == this) {
				var params = Array.prototype.slice.call(arguments);
				if (!this.compare.apply(this, params)) {
					this.shoot.apply(this, [newState].concat(params));
					if (Utils.isFunction(self._snapshoot_change))
						self._snapshoot_change(newState.data, state.data);
					self.trigger("change", newState.data, state.data);
					self.$el.trigger("change", newState.data, state.data);
					hasChanged = true;
				}
			}
			this.release();
			return hasChanged;
		};
		_snapshoot.release = function () {
			if (self._rootSnapshoot == this)
				self._rootSnapshoot = null;
		};
		_snapshoot.getState = function () {
			return state;
		};

		_snapshoot.shoot(state);
		newState.data = state.data;

		return _snapshoot;
	};

	Fn.getDropdownHeight = function (target, maxHeight) {
		var height = 0;
		if (this.isRenderAsApp()) {
			height = $(window).height() * 0.8;
		}
		else {
			height = parseInt(target.css("maxHeight")) || maxHeight || 300;
		}
		var scrollHeight = target.get(0).scrollHeight;
		if (height > scrollHeight)
			height = scrollHeight;
		return height;
	};

	Fn.mouseDebounce = function (event, handler) {
		var target = $(event.currentTarget);
		var timerId = parseInt(target.attr("timerid"));
		if (timerId) {
			clearTimeout(timerId);
			target.removeAttr("timerid");
		}
		if (event.type == "mouseleave") {
			timerId = setTimeout(function () {
				target.removeAttr("timerid");
				handler();
			}, 500);
			target.attr("timerid", timerId);
		}
	};

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

	ComponentBase.isElement = function (target) {
		return (target instanceof Element) || (target instanceof $);
	};

	ComponentBase.getInitParams = function () {
		if (!this.initParams) {
			var params = null;
			if (this.options.hasOwnProperty("params"))
				params = this.options.params;
			else {
				try {
					params = JSON.parse(this.$el.attr("api-params") || null);
				}
				catch (e) {}
			}
			this.initParams = Utils.extend({}, params);
		}
		return Utils.extend({}, this.initParams);
	};

	ComponentBase.isAutoLoad = function () {
		if (!this.options.hasOwnProperty("autoLoad")) {
			this.options.autoLoad = this.$el.attr("api-autoload");
		}
		this.$el.removeAttr("api-autoload");
		return Utils.isTrue(this.options.autoLoad);
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

	_ComponentBase.getViewId = function () {
		return this.$el.attr("vid");
	};

	_ComponentBase.destory = function () {
		this.$el.remove();
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
		this._rerender();
	};

	// 获取数据转换适配器
	_ComponentBase.getDataAdapter = function () {
		if (this.options.hasOwnProperty("adapter"))
			return this.options.adapter;
		return Fn.getFunction.call(this, "dataAdapter", "adapter");
	};

	// 设置数据转换适配器
	_ComponentBase.setDataAdapter = function (value) {
		this.options.adapter = value;
		delete this.options.dataAdapter;
		this.$el.children(".ui-fn[name='adapter']").remove();
		this._rerender();
	};

	// 获取数据绑定映射方法
	_ComponentBase.getDataMapper = function () {
		if (this.options.hasOwnProperty("mapper"))
			return this.options.mapper;
		return Fn.getFunction.call(this, "dataMapper", "mapper");
	};

	// 设置数据绑定映射方法
	_ComponentBase.setDataMapper = function (value) {
		this.options.mapper = value;
		delete this.options.dataMapper;
		this.$el.children(".ui-fn[name='mapper']").remove();
		this._rerender();
	};

	// 判断组件是否可用
	_ComponentBase.isDisabled = function () {
		return this.$el.is(".disabled");
	};

	// 设置组件是否可用
	_ComponentBase.setDisabled = function (disabled) {
		if (Utils.isNull(disabled) || Utils.isTrue(disabled))
			this.$el.addClass("disabled").attr("disabled", "disabled");
		else
			this.$el.removeClass("disabled").removeAttr("disabled", "disabled");
	};

	_ComponentBase.setVisible = function (visible) {
		if (Utils.isNull(visible) || Utils.isTrue(visible))
			this.$el.removeClass("ui-hidden");
		else
			this.$el.addClass("ui-hidden");
	};

	// ====================================================
	// 异步数据加载方法
	_ComponentBase.load = function (api, params, callback) {
		if (Utils.isFunction(this._loadBefore))
			this._loadBefore(api, params);

		var self = this;
		return Fn.load.call(this, api, params, function (err, data) {
			if (!err) {
				if (Utils.isFunction(self.setData))
					self.setData(data);
				else
					self.options.data = data;
			}
			setTimeout(function () {
				if (Utils.isFunction(self._loadAfter))
					self._loadAfter(err, data);
				if (Utils.isFunction(callback))
					callback(err, data);
				self.trigger("loaded", err, data);
			}, 0);
		});
	};

	// 重新加载异步数据
	_ComponentBase.reload = function (page, callback) {
		if (Utils.isFunction(page)) {
			callback = page;
			page = null;
		}
		var params = this.lastLoadParams || {};
		if (!isNaN(page) && page > 0) {
			params.p_no = page;
		}
		return this.load(this.lastLoadApi, params, callback);
	};

	// 判断是否正在加载
	_ComponentBase.isLoading = function () {
		return this.$el.is(".is-loading");
	};

	// 获取初始化参数
	_ComponentBase.getInitParams = function () {
		return ComponentBase.getInitParams.call(this);
	};

	// ====================================================
	_ComponentBase._rerender = function () {
		// do nothing
	};

	// 获取数据编号
	_ComponentBase._getDataKey = function (data) {
		return Fn.getDataKey.call(this, data);
	};

	// 获取数据显示文本
	_ComponentBase._getDataLabel = function (data, index) {
		return Fn.getDataLabel.call(this, data, index);
	};

	_ComponentBase._doAdapter = function (data) {
		return Fn.doAdapter.call(this, data);
	};

	_ComponentBase._isMounted = function () {
		return $("body").find(this.$el).length > 0;
	};

	// 快照
	_ComponentBase._snapshoot = function () {
		return Fn.snapshoot.call(this);
	};

	_ComponentBase._getScrollContainer = function () {
		return this.$el.attr("opt-box");
	};


	///////////////////////////////////////////////////////
	var ComponentItems = function () {};
	var _ComponentItems = ComponentItems.prototype = new ComponentBase();

	ComponentItems.init = function (view, options) {
		var component = ComponentBase.init.call(this, view, options);
		if (component === this) {
			this._initPager();
			this._checkIfEmpty();
		}
		return component;
	};

	ComponentItems.doAdapter = function (datas) {
		return Renderer._item.doAdapter.call(this, datas);
	};

	ComponentItems.renderItems = function (itemContainer, datas) {
		Renderer._item.renderItems.call(this, $, itemContainer, datas);
		this._checkIfEmpty();
	};

	// 渲染单个列表项
	ComponentItems.renderOneItem = function (item, container, data, index) {
		return Renderer._item.renderOneItem.call(this, $, item, container, data, index);
	};

	// 添加列表项
	ComponentItems.addItem = function (data, index, datas) {
		index = Utils.getIndexValue(index);
		data = Fn.doAdapter.call(this, data, index);

		var newItem = null;
		var datas = datas || this.getData();
		var itemContainer = this._getItemContainer();
		if (itemContainer && itemContainer.length > 0) {
			newItem = this._getNewItem($, itemContainer, data, index);
			if (newItem) {
				if (index >= 0 && index < datas.length) {
					var items = this._getItems();
					if (items && items.length > 0)
						items.eq(index).before(newItem);
				}
				this._renderOneItem($, newItem, data, index);
			}
			this._checkIfEmpty();
		}

		if (index >= 0 && index < datas.length)
			datas.splice(index, 0, data);
		else 
			datas.push(data);

		return newItem;
	};

	// 更新列表项，index无效时将被忽略
	ComponentItems.updateItem = function (data, index, datas) {
		data = Fn.doAdapter.call(this, data, index);
		if (!index && index !== 0)
			index = this.getDataIndex(data);
		else
			index = Utils.getIndexValue(index);
		if (index >= 0) {
			var datas = datas || this.getData();
			if (index < datas.length) {
				var itemContainer = this._getItemContainer();
				if (itemContainer && itemContainer.length > 0) {
					var items = this._getItems();
					var newItem = this._getNewItem($, itemContainer, data, index);
					if (newItem) {
						items.eq(index).before(newItem).remove();
						this._renderOneItem($, newItem, data, index);
					}
					else {
						items.eq(index).remove();
					}
				}
				this._checkIfEmpty();
				datas.splice(index, 1, data);
			}
			else {
				index = -1;
			}
		}
		return index;
	};

	// 删除列表项
	ComponentItems.removeItem = function (item, index, datas) {
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

		if (item && item.length > 0) {
			item.remove();
			this._checkIfEmpty();
		}

		var datas = datas || this.getData();
		if (datas && index < datas.length) {
			return datas.splice(index, 1);
		}

		return null;
	};

	ComponentItems.initPager = function () {
		if (this.options.hasOwnProperty("pager"))
			this.setPaginator(this.options.pager);
		else {
			var pager = this.$el.attr("opt-pager");
			if (pager) {
				pager = $(pager);
				if (pager && pager.length > 0) {
					pager = Component.get(pager) || VRender.FrontComponent.get(pager) || pager
					this.setPaginator(pager);
				}
			}
			this.$el.removeAttr("opt-pager");
		}
	};

	ComponentItems.setPager = function (pager) {
		if (this.pager) {
			if (Utils.isFunction(this.pager.off))
				this.pager.off("change");
		}
		this.pager = pager;
		if (pager && Utils.isFunction(pager.on)) {
			var self = this;
			pager.on("change", function (e, data) {
				var params = $.extend({}, self.lastLoadParams);
				params.p_no = data && data.page;
				params.p_size = data && data.size;
				if (!params.p_no && Utils.isFunction(pager.getPage))
					params.p_no = pager.getPage();
				if (!params.p_size && Utils.isFunction(pager.getSize))
					params.p_size = pager.getSize();
				// if (Utils.isFunction(self.setData))
				// 	self.setData(null);
				var pageInfo = self._pageInfo || {};
				if (params.p_no != pageInfo.page || params.p_size != pageInfo.size)
					self.load(self.lastLoadApi, params);
			});
		}
	};

	// 判断是否为空
	ComponentItems.checkIfEmpty = function () {
		var items = this._getItems();
		if (items && items.length > 0)
			this.$el.removeClass("is-empty");
		else
			this.$el.addClass("is-empty");
	};

	// 判断组件或组件列表项是否可用
	// 参数为字符串时判断名称对应列表项，为数字时判断索引对应的列表项，否则返回组件是否可用
	ComponentItems.isDisabled = function (value) {
		if (typeof value === "number") {
			var item = this._getItemAt(value);
			return !item || item.is(".disabled");
		}
		if (typeof value === "string") {
			return this.isDisabled(this.getIndexByName(value));
		}
		return this.$el.is(".disabled");
	};

	// 设置组件或列表项是否可用
	ComponentItems.setDisabled = function (disabled, value) {
		if (typeof value === "string") {
			return this.setDisabled(disabled, this.getIndexByName(value));
		}
		var target = this.$el;
		if (typeof value === "number") {
			target = this._getItemAt(value);
		}
		if (target) {
			disabled = (Utils.isNull(disabled) || Utils.isTrue(disabled)) ? true : false;

			if (disabled)
				target.addClass("disabled").attr("disabled", "disabled");
			else
				target.removeClass("disabled").removeAttr("disabled");

			if (Utils.isFunction(this.getDisableField)) {
				var disableField = this.getDisableField();
				if (disableField) {
					var data = this._getItemData(target);
					if (data)
						data[disableField] = disabled;
				}
			}
		}
	};

	// ====================================================
	_ComponentItems.init = function (view, options) {
		return ComponentItems.init.call(this, view, options);
	};

	_ComponentItems.setData = function (value) {
		this.options.data = this._doAdapter(value);
		this._rerender();
	};

	// 获取某索引对应的数据
	_ComponentItems.getDataAt = function (index) {
		index = Utils.getIndexValue(index);
		if (index < 0)
			return null;
		var datas = this.getData() || [];
		return index < datas.length ? datas[i] : null;
	};

	// 获取数据在列表中的索引
	_ComponentItems.getDataIndex = function (data) {
		var datas = this.getData();
		if (datas && datas.length > 0) {
			var self = this;
			var _key = this._getDataKey(data);
			return Utils.index(datas, function (temp) {
				return temp == data || self._getDataKey(temp) == _key;
			});
		}
		return -1;
	};

	_ComponentItems.getDataByKey = function (key) {
		return this.getDataAt(this.getIndexByKey(key));
	};

	_ComponentItems.getIndexByKey = function (key) {
		var datas = this.getData();
		if (datas && datas.length > 0) {
			var self = this;
			return Utils.index(datas, function (temp) {
				return self._getDataKey(temp) == key;
			});
		}
		return -1;
	};

	_ComponentItems.getDataByName = function (name) {
		return this.getDataAt(this.getIndexByName(name));
	};

	// 根据 name 属性获取索引
	_ComponentItems.getIndexByName = function (name) {
		var datas = this.getData();
		if (datas && datas.length > 0) {
			return Utils.indexBy(datas, "name", name);
		}
		return -1;
	};

	// 获取组件数据代表唯一编号的字段名称
	_ComponentItems.getKeyField = function () {
		return this.options.keyField || this.$el.attr("opt-key");
	};

	// 设置组件数据代表唯一编号的字段名称
	_ComponentItems.setKeyField = function (value) {
		value = Utils.trimToEmpty(value);
		if (this.getKeyField() != value) {
			this.options.keyField = value;
			this.$el.attr("opt-key", this.options.keyField);
			this._rerender();
		}
	};

	// 获取用来显示组件数据的字段名称
	_ComponentItems.getLabelField = function () {
		return this.options.labelField || this.$el.attr("opt-lbl");
	};

	// 设置用来显示组件数据的字段名称
	_ComponentItems.setLabelField = function (value) {
		value = Utils.trimToEmpty(value);
		if (this.getLabelField() != value) {
			this.options.labelField = value;
			this.$el.attr("opt-lbl", this.options.labelField);
			this._rerender();
		}
	}

	// 获取用来显示组件数据的方法，如：function (data) { return data.name; }
	_ComponentItems.getLabelFunction = function () {
		return Fn.getFunction.call(this, "labelFunction", "lblfunc");
	};

	// 设置用来显示组件数据的方法，如：function (data) { return data.name; };
	_ComponentItems.setLabelFunction = function (value) {
		if (this.getLabelFunction() != value) {
			this.options.labelFunction = value;
			this.$el.children(".ui-fn[name='lblfunc']").remove();
			this._rerender();
		}
	};

	// 获取项渲染器
	_ComponentItems.getItemRenderer = function () {
		if (this.options.hasOwnProperty("renderer"))
			return this.options.renderer;
		return Fn.getFunction.call(this, "itemRenderer", "irender");
	};

	// 设置项渲染器
	_ComponentItems.setItemRenderer = function (value) {
		if (this.getItemRenderer() != value) {
			this.options.renderer = value;
			delete this.options.itemRenderer;
			this.$el.children(".ui-fn[name='irender']").remove();
			this._rerender();
		}
	};

	_ComponentItems.getPaginator = function () {
		return this.pager;
	};

	_ComponentItems.setPaginator = function (value) {
		ComponentItems.setPager.call(this, value);
	};

	_ComponentItems.length = function () {
		return Utils.toArray(this.getData()).length;
	};

	_ComponentItems.isDisabled = function (index) {
		return ComponentItems.isDisabled.call(this, index);
	};

	_ComponentItems.setDisabled = function (disabled, index) {
		ComponentItems.setDisabled.call(this, disabled, index);
	};

	// 添加列表项
	// index添加项到指定索引位置
	_ComponentItems.addItem = function (data, index) {
		return ComponentItems.addItem.call(this, data, index);
	};

	// 更新列表项，index无效时将被忽略
	_ComponentItems.updateItem = function (data, index) {
		return ComponentItems.updateItem.call(this, data, index);
	};

	// 删除列表项
	_ComponentItems.removeItem = function (data) {
		return this.removeItemAt(this.getDataIndex(data));
	};

	// 删除列表项
	_ComponentItems.removeItemAt = function (index) {
		return ComponentItems.removeItem.call(this, null, index);
	};

	// 添加或更新列表项
	_ComponentItems.addOrUpdateItem = function (data) {
		var index = this.getDataIndex(data);
		if (index >= 0)
			this.updateItem(data, index);
		else
			this.addItem(data, index);
	};

	// 获取列表项数据，target可以是列表里任意标签
	_ComponentItems.getItemData = function (target) {
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

	// 加载更多（下一页）
	_ComponentItems.more = function (callback) {
		if (this.lastLoadApi && this.hasMore() && !this.isLoading()) {
			var params = Utils.extend({}, this.lastLoadParams);
			params.p_no = parseInt(this._pageInfo && this._pageInfo.page) || 0;
			params.p_no += 1;

			if (Utils.isFunction(this._moreBefore))
				this._moreBefore(this.lastLoadApi, params);
			else if (Utils.isFunction(this._loadBefore))
				this._loadBefore(this.lastLoadApi, params);

			var self = this;
			Fn.load.call(this, this.lastLoadApi, params, function (err, data) {
				if (!err && Utils.isArray(data)) {
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
				setTimeout(function () {
					if (Utils.isFunction(self._moreAfter))
						self._moreAfter(err, data);
					else if (Utils.isFunction(self._loadAfter))
						self._loadAfter(err, data);
					if (Utils.isFunction(callback))
						callback(err, data);
					self.trigger("loaded", err, data);
				}, 0);
			});

			return true;
		}
		return false;
	};

	// 加载某一页
	_ComponentItems.loadPage = function (page, callback) {
		if (this.lastLoadApi && !this.isLoading()) {
			var params = Utils.extend({}, this.lastLoadParams);
			params.p_no = parseInt(page) || 1;
			this.load(null, params, callback);
		}
	};

	_ComponentItems.hasMore = function () {
		if (this._pageInfo) {
			var page = parseInt(this._pageInfo.page) || 1;
			var size = parseInt(this._pageInfo.size) || 20;
			var total = parseInt(this._pageInfo.total) || 0;
			return page * size < total;
		}
		return false;
	};

	_ComponentItems.isEmpty = function () {
		if (this.$el.is(".is-empty"))
			return true;
		var datas = this.getData();
		return !datas || datas.length == 0;
	};

	// ====================================================
	_ComponentItems._doAdapter = function (datas) {
		return ComponentItems.doAdapter.call(this, datas);
	};

	// 获取选项容器
	_ComponentItems._getItemContainer = function () {
		return this.$el;
	};

	// 新建一个列表项
	_ComponentItems._getNewItem = function ($, itemContainer, data, index) {
		return $("<li></li>").appendTo(itemContainer);
	};

	// 渲染列表项
	_ComponentItems._renderItems = function ($, itemContainer, datas) {
		ComponentItems.renderItems.call(this, itemContainer, datas);
	};

	// 渲染单个列表项
	_ComponentItems._renderOneItem = function ($, item, data, index) {
		return ComponentItems.renderOneItem.call(this, item, null, data, index);
	};

	_ComponentItems._isDisabled = function (data, index) {
		if (data) {
			if (!this.options.hasOwnProperty("disableField"))
				this.options.disableField = this.$el.attr("opt-disabled");
			var disableField = this.options.disableField;
			if (disableField && data.hasOwnProperty(disableField)) {
				return Utils.isTrue(data[disableField]);
			}
		}
		return false;
	};

	_ComponentItems._rerender = function () {
		var self = this;
		Utils.debounce("ui_render-" + this.getViewId(), function () {
			var itemContainer = self._getItemContainer();
			if (itemContainer && itemContainer.length > 0) {
				self._renderItems($, itemContainer.empty(), self.getData());
			}
		});
	};

	// 获取所有列表项，确保返回jQuery对象
	_ComponentItems._getItems = function (selector) {
		var itemContainer = this._getItemContainer();
		if (itemContainer && itemContainer.length > 0)
			return itemContainer.children(selector);
	};

	// 获取某索引的列表项
	_ComponentItems._getItemAt = function (index) {
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

	// 获取选项绑定的数据
	_ComponentItems._getItemData = function (item, index) {
		var data = item.data("itemData");
		if (!data) {
			var datas = this.getData();
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

	_ComponentItems._initPager = function () {
		ComponentItems.initPager.call(this);
	};

	_ComponentItems._checkIfEmpty = function () {
		ComponentItems.checkIfEmpty.call(this);
	};

	_ComponentItems._getLoadText = function () {
		return this.options.loadingText;
		// return Utils.isNull(loadText) ? "正在加载.." : Utils.trimToEmpty(loadText);
	};

	_ComponentItems._getLoadView = function () {
		return this.options.loadingView;
	};

	_ComponentItems._getMoreText = function () {
		return this.options.moreText;
		// return Utils.isNull(moreText) ? "加载更多" : Utils.trimToEmpty(moreText);
	};

	_ComponentItems._getMoreView = function () {
		return this.options.moreView;
	};

	_ComponentItems._getEmptyText = function () {
		return this.options.emptyText || this.options.empty;
		// return Utils.isNull(emptyText) ? "没有数据" : Utils.trimToEmpty(emptyText);
	};

	_ComponentItems._getEmptyView = function () {
		return this.options.emptyView;
	};


	///////////////////////////////////////////////////////
	var ComponentSelect = function () {};
	var _ComponentSelect = ComponentSelect.prototype = new ComponentItems();

	ComponentSelect.init = function (view, options) {
		return ComponentItems.init.call(this, view, options);
	};

	// 获取当前选中项的索引
	ComponentSelect.getSelectedIndex = function (needArray) {
		var indexs = this.$el.attr("data-inds");
		if (Utils.isNull(indexs)) {
			indexs = [];
			var self = this;
			var ids = this.$el.attr("data-ids");
			if (Utils.isNull(ids)) {
				Utils.each(this.getData(), function (data, i) {
					// 给定空数组防止循环调用（_isSelected()方法中有调用getSelectedIndex()方法）
					if (self._isSelected(data, i, [], []))
						indexs.push(i);
				});
			}
			else if (ids.length > 0) {
				ids = ids.split(",");
				Utils.each(this.getData(), function (data, i) {
					var _id = self._getDataKey(data);
					var _index = Utils.index(ids, function (tmp) { return tmp == _id; });
					if (_index >= 0)
						indexs.push(i);
				});
			}
		}
		else {
			indexs = Fn.getIntValues(indexs, 0);
		}

		if (this.isMultiple())
			return indexs.length > 0 ? indexs : null;
		if (needArray)
			return indexs.length > 0 ? [indexs[0]] : null;
		return indexs.length > 0 ? indexs[0] : -1;
	};

	// 设置列表选中项的索引（只更新索引，不修改视图）
	ComponentSelect.setSelectedIndex = function (value) {
		var max = Utils.isFunction(this.length) ? (this.length() - 1) : null;
		var indexs = Fn.getIntValues(value, 0, max);
		if (indexs.length > 1 && !this.isMultiple())
			indexs = [indexs[0]];
		this.$el.attr("data-inds", indexs.join(","));
		this.$el.removeAttr("data-ids");
		return indexs;
	};

	// 获取当前选中项对应的数据编号
	ComponentSelect.getSelectedKey = function (needArray) {
		var self = this;
		var ids = this.$el.attr("data-ids");
		var indexs = this.$el.attr("data-inds");

		if (Utils.isNotNull(indexs)) {
			ids = [];
			indexs = Fn.getIntValues(indexs, 0);
			if (indexs.length > 0) {
				var datas = this.getData() || [];
				Utils.each(indexs, function (index) {
					var data = index < datas.length ? datas[index] : null;
					if (data)
						ids.push(self._getDataKey(data));
				});
			}
		}
		else if (Utils.isNull(ids)) {
			ids = [];
			Utils.each(this.getData(), function (data, i) {
				// 给定空数组防止循环调用（_isSelected()方法中有调用getSelectedIndex()方法）
				if (self._isSelected(data, i, [], []))
					ids.push(self._getDataKey(data));
			});
		}
		else if (!Utils.isArray(ids)) {
			ids = ids.split(",");
		}

		if (!ids || ids.length == 0)
			return null;

		var _ids = [];
		Utils.each(ids, function (tmp) {
			if (tmp || tmp === 0)
				_ids.push(isNaN(tmp) ? tmp : parseInt(tmp));
		});
		if (_ids.length == 0)
			return null;
		if (this.isMultiple())
			return _ids;
		return needArray ? [_ids[0]] : _ids[0];
	};

	// 根据数据编号设置当前选中项
	ComponentSelect.setSelectedKey = function (value) {
		if (!Utils.isArray(value))
			value = Utils.isBlank(value) ? [] : Utils.trimToEmpty(value).split(",");
		var indexs = [];
		var self = this;
		Utils.each(this.getData(), function (data, i) {
			var _id = self._getDataKey(data);
			var _index = Utils.index(value, function (tmp) { return tmp == _id; });
			if (_index >= 0)
				indexs.push(i);
		});
		this.setSelectedIndex(indexs);
	};

	// 获取当前选中项对应的数据
	ComponentSelect.getSelectedData = function (needArray, datas) {
		var indexs = this.getSelectedIndex(true), ids = [];
		if (!indexs)
			ids = this.getSelectedKey(true) || [];

		var self = this;
		var selectedDatas = [];
		datas = datas || this.getData();
		Utils.each(datas, function (data, i) {
			if (self._isSelected(data, i, indexs, ids))
				selectedDatas.push(data);
		});

		if (selectedDatas.length == 0)
			return null;
		if (this.isMultiple())
			return selectedDatas;
		return needArray ? [selectedDatas[0]] : selectedDatas[0];
	};

	ComponentSelect.updateSelection = function () {
		var indexs = [];
		var self = this;
		Utils.each(this._getItems(), function (item, i) {
			if (self._isItemSelected(item))
				indexs.push(i);
		});
		ComponentSelect.setSelectedIndex.call(this, indexs);
		return indexs;
	};

	// ====================================================
	_ComponentSelect.init = function (view, options) {
		return ComponentSelect.init.call(this, view, options);
	};

	// 判断列表是否支持多选
	_ComponentSelect.isMultiple = function () {
		return this.$el.attr("multiple") == "multiple";
	};

	_ComponentSelect.setMultiple = function (value) {
		value = (Utils.isNull(value) || Utils.isTrue(value)) ? true : false;
		if (this.isMultiple() != value) {
			if (value)
				this.$el.attr("multiple", "multiple");
			else
				this.$el.removeAttr("multiple");
			this._rerender();
		}
	};

	// 获取当前选中项的索引
	_ComponentSelect.getSelectedIndex = function (needArray) {
		return ComponentSelect.getSelectedIndex.call(this, needArray);
	};

	// 设置列表选中项的索引（只更新索引，不修改视图）
	_ComponentSelect.setSelectedIndex = function (value) {
		var snapshoot = this._snapshoot();
		var indexs = ComponentSelect.setSelectedIndex.call(this, value);
		var self = this;
		Utils.each(this._getItems(), function (item, i) {
			self._setItemSelected(item, (indexs.indexOf(i) >= 0));
		});
		snapshoot.done();
		return indexs;
	};

	// 获取当前选中项对应的数据编号
	_ComponentSelect.getSelectedKey = function (needArray) {
		return ComponentSelect.getSelectedKey.call(this, needArray);
	};

	// 根据数据编号设置当前选中项
	_ComponentSelect.setSelectedKey = function (value) {
		return ComponentSelect.setSelectedKey.call(this, value);
	};

	// 获取当前选中项对应的数据
	_ComponentSelect.getSelectedData = function (needArray) {
		return ComponentSelect.getSelectedData.call(this, needArray);
	};

	// 判断某个索引是否被选中
	_ComponentSelect.isSelectedIndex = function (index) {
		index = Utils.getIndexValue(index);
		return index < 0 ? false : this._isSelected(this.getDataAt(index), index);
	};

	// 判断编号对应的项是否被选中
	_ComponentSelect.isSelectedKey = function (value) {
		if (Utils.isBlank(value))
			return false;
		var ids = this.getSelectedKey(true);
		return Utils.index(ids, function (tmp) { return tmp == value; }) >= 0;
	};

	// 判断是否选中所有项
	_ComponentSelect.isAllSelected = function () {
		var length = this.length();
		if (length > 0) {
			var indexs = this.getSelectedIndex(true);
			return indexs && indexs.length == length;
		}
		return false;
	};

	_ComponentSelect.addItem = function (data, index) {
		var newItem = ComponentItems.addItem.call(this, data, index);
		if (newItem)
			ComponentSelect.updateSelection.call(this);
		return newItem;
	};

	_ComponentSelect.updateItem = function (data, index) {
		index = ComponentItems.updateItem.call(this, data, index);
		if (index >= 0)
			ComponentSelect.updateSelection.call(this);
		return index;
	};

	_ComponentSelect.removeItemAt = function (index) {
		var data = ComponentItems.removeItem.call(this, null, index);
		if (data)
			ComponentSelect.updateSelection.call(this);
		return data;
	};

	// 判断是否选中
	_ComponentSelect._isSelected = function (data, index, selectedIndex, selectedId) {
		return Renderer._select.isSelected.call(this, data, index, selectedIndex, selectedId);
	};

	_ComponentSelect._isItemSelected = function (item) {
		return item.is(".selected");
	};

	_ComponentSelect._setItemSelected = function (item, beSelected) {
		if (beSelected)
			item.addClass("selected");
		else
			item.removeClass("selected");
	};

	_ComponentSelect._snapshoot_shoot = function (state, selectedIndex, selectedData) {
		state.selectedIndex = selectedIndex || this.getSelectedIndex();
		state.selectedData = selectedData || this.getSelectedData();
		state.data = state.selectedData;
	};

	_ComponentSelect._snapshoot_compare = function (state, selectedIndex) {
		if (!selectedIndex)
			selectedIndex = this.getSelectedIndex(true);
		return Fn.equalIndex(state.selectedIndex, selectedIndex);
	};


	///////////////////////////////////////////////////////
	// 初始化
	var doInit = function (target, options) {
		target.attr("id", Utils.trimToNull(options.id) || undefined);
		target.attr("name", Utils.trimToNull(options.name) || undefined);

		var cls = options.clsname || options.className || options.clsName || options.cls;
		if (Utils.isNotBlank(cls))
			target.addClass(cls);

		if (Utils.isNotBlank(options.style))
			target.addClass(options.style);

		if (options.hasOwnProperty("disabled"))
			this.setDisabled(Utils.isTrue(options.disabled));

		if (options.visible === false || options.visible === "gone")
			target.css("display", "none");
		else if (options.visible === "hidden")
			target.css("visibility", "hidden");

		target.attr("ref", Utils.trimToNull(options.ref) || undefined);

		if (!options.data) {
			var items = target.attr("data-items");
			if (items) {
				try {
					options.data = JSON.parse(unescape(items));
				}
				catch (e) {}
			}
		}
		this.$el.removeAttr("data-items");
	};

	// 组件初始化时，视图自动加载异步数据
	var tryAutoLoad = function () {
		if (isAutoLoad.call(this) && Utils.isFunction(this.load)) {
			var apiName = this.options.api || this.$el.attr("api-name");

			var params = $.extend({}, this.getInitParams());
			// this.$el.removeAttr("api-name").removeAttr("api-params");

			var pager = Utils.isFunction(this.getPaginator) && this.getPaginator();
			if (pager) {
				if (!params.p_no && Utils.isFunction(pager.getPage))
					params.p_no = pager.getPage();
				if (!params.p_size && Utils.isFunction(pager.getSize))
					params.p_size = pager.getSize();
			}

			// var searcher = Utils.isFunction(this.getSearcher) && this.getSearcher();
			// if (searcher && Utils.isFunction(searcher.getParams)) {
			// 	params = $.extend(params, searcher.getParams());
			// }

			var self = this;
			this.load(apiName, params, function () {
				setTimeout(function () {
					tryAutoSelect.call(self);
				}, 0);
			});
		}
	};

	// 判断是否需要自动加载异步数据
	var isAutoLoad = function () {
		return ComponentBase.isAutoLoad.call(this);
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
			if (Utils.isFunction(self.setSelectedKey)) {
				self.setSelectedKey(value);
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
	Component.item = ComponentItems;
	Component.select = ComponentSelect;

})();
