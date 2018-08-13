// ========================================================
// 前后端（通用）渲染方法
// @author shicy <shicy85@163.com>
// Create on 2017-12-12
// ========================================================

(function (backend) {
	if (!backend) {
		if (VRender.Component.Render)
			return ;
		VRender.Component.Render = {};
	}
	
	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	
	///////////////////////////////////////////////////////
	var Fn = {
		// 组件数据适配转换，支持数组对象
		doAdapter: function (data, index) {
			if (data && data._vr_adapter_flag)
				return data;
			var adapter = this.options.dataAdapter || this.options.adapter;
			if (Utils.isFunction(this.getDataAdapter))
				adapter = this.getDataAdapter();
			if (Utils.isFunction(adapter)) {
				data = adapter(data, index);
				if (data)
					data._vr_adapter_flag = true;
			}
			return data;
		},

		// 获取数据的编号
		getDataKey: function (data) {
			if (Utils.isBlank(data))
				return null;
			if (Utils.isPrimitive(data))
				return data;
			var keyField = this.options.keyField;
			if (Utils.isFunction(this.getKeyField))
				keyField = this.getKeyField();
			if (Utils.isNotBlank(keyField))
				return data[keyField];
			if (data.hasOwnProperty("id"))
				return data.id;
			if (data.hasOwnProperty("code"))
				return data.code;
			if (data.hasOwnProperty("value"))
				return data.value;
			return null;
		},

		// 获取数据的显示问宝宝
		getDataLabel: function (data, index) {
			var labelFunction = this.options.labelFunction;
			if (Utils.isFunction(this.getLabelFunction))
				labelFunction = this.getLabelFunction();
			if (Utils.isFunction(labelFunction))
				return labelFunction(data, index);
			if (Utils.isBlank(data))
				return "";
			if (Utils.isPrimitive(data))
				return "" + data;
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
			return "" + data;
		},

		// 获取数据的属性映射对象，组件数据经过映射后才返回给客户端，可以有效保证数据的私密性
		// 映射对象将被添加到组件标签的属性中，前端可以通过 this.$el.data() 获取
		getMapData: function (data) {
			var mapper = this.options.dataMapper || this.options.mapper;
			if (Utils.isFunction(this.getDataMapper))
				mapper = this.getDataMapper();
			if (Utils.isFunction(mapper))
				return mapper(data);
			if (Utils.isNull(data))
				return null;
			if (Utils.isPrimitive(data))
				return data;
			var attrs = {};
			if (data.hasOwnProperty("id"))
				attrs["id"] = data.id;
			if (data.hasOwnProperty("code"))
				attrs["code"] = data.code;
			if (data.hasOwnProperty("name"))
				attrs["name"] = data.name;
			if (data.hasOwnProperty("value"))
				attrs["value"] = data.value;
			if (data.hasOwnProperty("label"))
				attrs["label"] = data.label;
			return attrs;
		},

		isMultiple: function () {
			if (this.options.hasOwnProperty("multiple"))
				return Utils.isTrue(this.options.multiple);
			return Utils.isTrue(this.options.multi);
		},

		// 在元素标签上渲染数据，以 “data-” 属性方式添加
		renderData: function (target, data) {
			if (Utils.isFunction(this.getMapData))
				data = this.getMapData(data);
			if (data) {
				if (Utils.isPrimitive(data)) {
					target.attr("data-v", data);
				}
				else {
					for (var n in data) {
						target.attr(("data-" + n), Utils.trimToEmpty(data[n]));
					}
				}
			}
		},

		// 渲染接口定义的方法，仅服务端有效，服务端定义的接口方法可在前端获取到
		renderFunction: function (target, name, fn) {
			if (backend && Utils.isNotBlank(name) && Utils.isFunction(fn)) {
				target.write("<div class='ui-fn' style='display:none' name='" + name + 
					"' fn-state='" + (fn._state || "") + "' fn-data='" + (fn._data || "") + 
					"'>" + escape(fn) + "</div>");
			}
		},

		// 渲染子视图
		renderSubView: function (target, view) {
			if (view) {
				if (Utils.isFunction(view.render))
					view.render(target);
				else
					target.append(view.$el || view);
			}
		}
	};

	///////////////////////////////////////////////////////
	var BaseRenderer = function (context, options) {
		this.context = !options ? null : context;
		this.options = !options ? context : options;
		this.options = this.options || {};
	};
	var _BaseRenderer = BaseRenderer.prototype = new Object();

	// ====================================================
	// 通用组件渲染方法，子组件继承后可直接使用
	BaseRenderer.render = function ($, target) {
		this.renderData($, target);
		Fn.renderFunction.call(this, target, "adapter", this.getDataAdapter());
		Fn.renderFunction.call(this, target, "mapper", this.getDataMapper());
	};

	// ====================================================
	// 基本组件渲染
	_BaseRenderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
	};

	// 渲染组件设置的数据，仅映射后的数据被渲染
	_BaseRenderer.renderData = function ($, target) {
		Fn.renderData.call(this, target, this.getData());
	};

	// 判断组件是否在应用模式下渲染，一般指移动端渲染（服务端成本较高，尽量缓存）
	_BaseRenderer.isRenderAsApp = function () {
		if (backend) {
			if (!this.hasOwnProperty("_isApp")) {
				this._isApp = false;
				if (this.context && Utils.isFunction(this.context.isRenderAsApp))
					this._isApp = this.context.isRenderAsApp();
			}
			return this._isApp;
		}
		return VRender.ENV.isApp;
	};

	// 判断组件是否在 iPhone 中渲染（服务端成本较高，尽量缓存）
	_BaseRenderer.isRenderAsIphone = function () {
		if (backend) {
			if (!this.hasOwnProperty("_isIphone")) {
				this._isIphone = false;
				if (this.context && Utils.isFunction(this.context.isRenderAsIphone))
					this._isIphone = this.context.isRenderAsIphone();
			}
			return this._isIphone;
		}
		return VRender.ENV.isIphone;
	};

	// 判断组件是否使用 rem 度量单位（服务端成本较高，尽量缓存）
	_BaseRenderer.isRenderAsRem = function () {
		if (backend) {
			if (!this.hasOwnProperty("_isRem")) {
				this._isRem = false;
				if (this.context && Utils.isFunction(this.context.isRenderAsRem))
					this._isRem = this.context.isRenderAsRem();
			}
			return this._isRem;
		}
		return VRender.ENV.useRem;
	};

	// ====================================================
	// 获取该组件的数据（集），已经过适配器转换
	_BaseRenderer.getData = function () {
		this.options.data = this._doAdapter(this.options.data);
		return this.options.data;
	};

	// 获取数据转换适配器
	_BaseRenderer.getDataAdapter = function () {
		return this.options.dataAdapter || this.options.adapter;
	};

	// 获取数据属性映射方法
	_BaseRenderer.getDataMapper = function () {
		return this.options.dataMapper || this.options.mapper;
	};

	// 获取映射后的属性对象
	_BaseRenderer.getMapData = function (data) {
		return Fn.getMapData.call(this, data);
	};

	// 获取数据编号
	_BaseRenderer._getDataKey = function (data) {
		return Fn.getDataKey.call(this, data);
	};

	// 获取数据显示文本
	_BaseRenderer._getDataLabel = function (data) {
		return Fn.getDataLabel.call(this, data);
	};

	// 数据转换，通过适配器转换数据
	_BaseRenderer._doAdapter = function (data) {
		return !data ? null : Fn.doAdapter.call(this, data);
	};


	///////////////////////////////////////////////////////
	var ItemsRenderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _ItemsRenderer = ItemsRenderer.prototype = new BaseRenderer();

	// ====================================================
	ItemsRenderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);

		target.attr("opt-key", Utils.trimToNull(this.getKeyField()));
		target.attr("opt-lbl", Utils.trimToNull(this.getLabelField()));
		target.attr("opt-disable", Utils.trimToNull(this.options.disableField));

		Fn.renderFunction(target, "lblfunc", this.getLabelFunction());
		Fn.renderFunction(target, "irender", this.getItemRenderer());

		this._renderItems($, target);
		this._renderEmptyView($, target);
		this._renderLoadView($, target);
		this._renderPager($, target);
	};

	ItemsRenderer.renderData = function ($, target, datas) {
		datas = Utils.toArray(datas) || [];
		if (datas.length > 0) {
			var dataMapper = this.getDataMapper();
			if (Utils.isFunction(dataMapper)) {
				datas = Utils.map(datas, dataMapper);
			}
		}
		target.attr("data-items", escape(JSON.stringify(datas)));
	};

	ItemsRenderer.renderItems = function ($, itemContainer, datas) {
		datas = datas || this.getData();
		if (datas && datas.length > 0) {
			var self = this;
			var items = this._render_items = [];
			Utils.each(datas, function (data, i) {
				var item = self._getNewItem($, itemContainer, data, i);
				if (item) {
					items.push({item: item, data: data, index: i});
					self._renderOneItem($, item, data, i);
				}
			});
			setTimeout(function () {
				self._render_items = null; // 释放变量
			}, 0);
		}
	};

	// 渲染单个列表项
	ItemsRenderer.renderOneItem = function ($, item, container, data, index) {
		if (backend) {
			this.renderItemData($, item, data);
		}
		else {
			item.data("itemData", data);
		}

		if (this._isDisabled(data, index)) {
			item.addClass("disabled").attr("disabled", "disabled");
		}
		
		container = container || item;
		var itemRenderer = this.getItemRenderer();
		if (Utils.isFunction(itemRenderer)) {
			var result = null;
			if (itemRenderer._state)
				result = itemRenderer.call(this, $, item, data, index);
			else
				result = itemRenderer($, item, data, index);
			if (Utils.isNotNull(result))
				container.empty().append(result);
		}
		else {
			var label = this._getDataLabel(data, index);
			container.html(Utils.isNull(label) ? "" : label);
		}
	};

	// 渲染分页设置
	ItemsRenderer.renderPager = function ($, target, pager) {
		if (backend) {
			if (!pager && Utils.isFunction(this.getPaginator))
				pager = this.getPaginator();
			if (pager) {
				if (typeof pager == "string") {
					target.attr("opt-pager", Utils.trimToNull(pager));
				}
				else if (Utils.isFunction(pager.getViewId)) {
					target.attr("opt-pager", "[vid='" + pager.getViewId() + "']");
				}
			}
		}
	};

	// 渲染空视图
	ItemsRenderer.renderEmptyView = function ($, target, className) {
		var container = $("<div></div>").appendTo(target);
		container.addClass((className || "ui") + "-empty");
		var emptyView = Utils.isFunction(this._getEmptyView) ? this._getEmptyView() : this.options.emptyView;
		if (emptyView) {
			Fn.renderSubView.call(this, container, emptyView);
		}
		else {
			emptyView = $("<div></div>").appendTo(container);
			emptyView.addClass((className || "ui") + "-emptydef");
			var emptyText = this.options.emptyText || this.options.empty;
			if (Utils.isFunction(this._getEmptyText))
				emptyText = this._getEmptyText();
			emptyText = Utils.isNull(emptyText) ? "没有数据" : Utils.trimToEmpty(emptyText);
			if (emptyText) {
				$("<p></p>").appendTo(emptyView).text(emptyText);
			}
		}
		return container;
	};

	// 渲染加载视图
	ItemsRenderer.renderLoadView = function ($, target, className) {
		var container = $("<div></div>").appendTo(target);
		container.addClass((className || "ui") + "-load");
		var loadingView = Utils.isFunction(this._getLoadView) ? this._getLoadView() : this.options.loadingView;
		if (loadingView) {
			Fn.renderSubView.call(this, container, loadingView);
		}
		else {
			var loadView = $("<div></div>").appendTo(container);
			loadView.addClass((className || "ui") + "-loaddef");
			var loadText = Utils.isFunction(this._getLoadText) ? this._getLoadText() : this.options.loadingText;
			loadText = Utils.isNull(loadText) ? "正在加载.." : Utils.trimToEmpty(loadText);
			if (loadText) {
				$("<p></p>").appendTo(loadView).html(loadText);
			}
		}
		return container;
	};

	// 渲染更多视图
	ItemsRenderer.renderMoreView = function ($, target, className) {
		var container = $("<div></div>").appendTo(target);
		container.addClass((className || "ui") + "-more");
		if (this._pageInfo) {
			container.attr("page-no", this._pageInfo.page);
		}
		var moreView = Utils.isFunction(this._getMoreView) ? this._getMoreView() : this.options.moreView;
		if (moreView) {
			Fn.renderSubView.call(this, container, moreView);
		}
		else {
			var moreView = $("<div></div>").appendTo(container);
			moreView.addClass((className || "ui") + "-moredef");
			var moreText = Utils.isFunction(this._getMoreText) ? this._getMoreText() : this.options.moreText;
			moreText = Utils.isNull(moreText) ? "加载更多" : Utils.trimToEmpty(moreText);
			if (moreText) {
				$("<p></p>").appendTo(moreView).html(moreText);
			}
		}
		return container;
	};

	ItemsRenderer.doAdapter = function (datas) {
		var datas = Utils.toArray(datas);
		if (datas._vr_adapter_flag)
			return datas;

		var self = this;
		datas = Utils.map(datas, function (temp, i) {
			return Fn.doAdapter.call(self, temp, i);
		});
		datas._vr_adapter_flag = true;
		// this.options.data = datas;

		return datas;
	};

	// ====================================================
	_ItemsRenderer.render = function ($, target) {
		ItemsRenderer.render.call(this, $, target);
	};

	_ItemsRenderer.renderData = function ($, target) {
		if (backend) {
			ItemsRenderer.renderData.call(this, $, target, this.getData());
		}
	};

	// 渲染列表项数据
	_ItemsRenderer.renderItemData = function ($, item, data) {
		Fn.renderData.call(this, $, item, data);
	};

	_ItemsRenderer.getPaginator = function () {
		return this.options.paginator || this.options.pager;
	};

	// 渲染列表项
	_ItemsRenderer._renderItems = function ($, target) {
		var itemContainer = this._getItemContainer($, target);
		if (itemContainer) {
			ItemsRenderer.renderItems.call(this, $, itemContainer);
		}
	};

	// 获取列表项容器，默认是 target
	_ItemsRenderer._getItemContainer = function ($, target) {
		return target;
	};

	// 新建一个列表项并返回
	// 参数 data 和 index 只用来判断创建标签类型，不建议生成列表项内容
	_ItemsRenderer._getNewItem = function ($, itemContainer, data, index) {
		return $("<li></li>").appendTo(itemContainer);
	};

	// 渲染单个列表项
	_ItemsRenderer._renderOneItem = function ($, item, data, index) {
		ItemsRenderer.renderOneItem.call(this, $, item, null, data, index);
	};

	// 渲染分页设置
	_ItemsRenderer._renderPager = function ($, target) {
		ItemsRenderer.renderPager.call(this, $, target);
	};

	// 渲染空视图
	_ItemsRenderer._renderEmptyView = function ($, target) {
		ItemsRenderer.renderEmptyView.call(this, $, target);
	};

	// 渲染加载视图
	_ItemsRenderer._renderLoadView = function ($, target) {
		ItemsRenderer.renderLoadView.call(this, $, target);
	};

	// 渲染更多视图
	_ItemsRenderer._renderMoreView = function ($, target) {
		ItemsRenderer.renderMoreView.call(this, $, target);
	};

	// ====================================================
	// 获取用来代表数据编号的字段名称
	_ItemsRenderer.getKeyField = function () {
		return this.options.keyField;
	};

	// 获取用来显示数据文本的字段名称
	_ItemsRenderer.getLabelField = function () {
		return this.options.labelField;
	};

	// 获取用来显示数据文本的方法，较复杂的内容可以使用该方法
	_ItemsRenderer.getLabelFunction = function () {
		return this.options.labelFunction;
	};

	// 获取项渲染器
	_ItemsRenderer.getItemRenderer = function () {
		return this.options.itemRenderer;
	};

	// 判断是否禁用项
	_ItemsRenderer._isDisabled = function (data, index) {
		if (data) {
			var disableField = this.options.disableField || "disabled";
			if (disableField && data.hasOwnProperty(disableField)) {
				return Utils.isTrue(data[disableField]);
			}
		}
		return false;
	};

	_ItemsRenderer._getDataLabel = function (data, index) {
		return Fn.getDataLabel.call(this, data, index);
	};

	_ItemsRenderer._doAdapter = function (datas) {
		return ItemsRenderer.doAdapter.call(this, datas);
	};


	///////////////////////////////////////////////////////
	var SelectRenderer = function (context, options) {
		ItemsRenderer.call(this, context, options);
	};
	var _SelectRenderer = SelectRenderer.prototype = new ItemsRenderer();

	// ====================================================
	SelectRenderer.render = function ($, target) {
		ItemsRenderer.render.call(this, $, target);

		if (this.isMultiple())
			target.attr("multiple", "multiple");

		this.renderSelection($, target);
	};

	SelectRenderer.renderSelection = function ($, target, items) {
		var indexs = this.getSelectedIndex(true);
		var ids = this.getSelectedKey(true);

		if (indexs)
			target.attr("data-inds", indexs.join(","));
		if (ids)
			target.attr("data-ids", ids.join(","));

		if (backend && this.options.apiName) {
			if (indexs)
				target.attr("data-tryindex", indexs.join(","));
			if (ids)
				target.attr("data-tryid", ids.join(","));
		}

		if (items && items.length > 0) {
			ids = ids || [];
			var self = this;
			Utils.each(items, function (item, i) {
				if (self._isSelected(item.data, item.index, indexs, ids)) {
					if (Utils.isFunction(self._setItemSelected))
						self._setItemSelected(item.item, true);
					else
						item.item.addClass("selected");
				}
			});
		}
	};

	// ====================================================
	// 获取选中的项索引
	SelectRenderer.getSelectedIndex = function (needArray) {
		var selectedIndex = this.options.selectedIndex;
		if (Utils.isBlank(selectedIndex)) {
			return (needArray || this.isMultiple()) ? null : -1;
		}
		if (!Utils.isArray(selectedIndex))
			selectedIndex = ("" + selectedIndex).split(",");
		var indexs = [];
		Utils.each(selectedIndex, function (tmp) {
			if (!isNaN(tmp)) {
				var index = parseInt(tmp);
				if (!isNaN(index) && index >= 0)
					indexs.push(index);
			}
		});
		if (this.isMultiple())
			return indexs.length > 0 ? indexs : null;
		if (indexs && indexs.length > 0)
			return needArray ? [indexs[0]] : indexs[0];
		return -1;
	};

	// 获取选中的项编号
	SelectRenderer.getSelectedKey = function (needArray) {
		var selectedId = this.options.selectedId;
		if (Utils.isBlank(selectedId)) {
			return (needArray || this.isMultiple()) ? [] : null;
		}
		if (!Utils.isArray(selectedId))
			selectedId = ("" + selectedId).split(",");
		var ids = [];
		Utils.each(selectedId, function (tmp) {
			if (tmp || tmp === 0) {
				ids.push(isNaN(tmp) ? tmp : parseInt(tmp));
			}
		});
		if (ids.length == 0)
			return null;
		if (this.isMultiple())
			return ids;
		return needArray ? [ids[0]] : ids[0];
	};

	// 获取选中的数据集
	SelectRenderer.getSelectedData = function (needArray, datas) {
		datas = datas || this.getData();
		var selectedDatas = [];
		if (datas && datas.length > 0) {
			var indexs = this.getSelectedIndex(true);
			var ids = this.getSelectedKey(true) || [];
			for (var i = 0, l = datas.length; i < l; i++) {
				var _data = datas[i];
				if (this._isSelected(_data, i, indexs, ids))
					selectedDatas.push(_data);
			}
		}
		if (selectedDatas.length == 0)
			return null;
		if (this.isMultiple())
			return selectedDatas;
		return needArray ? [selectedDatas[0]] : selectedDatas[0];
	};

	SelectRenderer.isSelected = function (data, index, selectedIndexs, selectedIds) {
		if (!selectedIndexs && !selectedIds) {
			selectedIndexs = this.getSelectedIndex(true);
			selectedIds = this.getSelectedKey(true) || [];
		}
		if (selectedIndexs) {
			index = Utils.getIndexValue(index);
			if (index < 0)
				return false;
			return selectedIndexs.indexOf(index) >= 0;
		}

		if (selectedIds) {
			var _id = this._getDataKey(data);
			return Utils.index(selectedIds, function (tmp) {
				return tmp == _id;
			}) >= 0;
		}

		return false;
	};

	// 判断是否全部选中
	SelectRenderer.isAllSelected = function (datas) {
		datas = datas || this.getData();
		if (datas && datas.length > 0) {
			var indexs = this.getSelectedIndex(true);
			var ids = this.getSelectedKey(true) || [];
			for (var i = 0, l = datas.length; i < l; i++) {
				if (!this._isSelected(datas[i], i, indexs, ids))
					return false;
			}
			return true;
		}
		return false;
	};

	// ====================================================
	_SelectRenderer.render = function ($, target) {
		SelectRenderer.render.call(this, $, target);
	};

	// 初始化渲染组件选中项信息（索引或编号）
	_SelectRenderer.renderSelection = function ($, target) {
		SelectRenderer.renderSelection.call(this, $, target, this._render_items);
	};

	// ====================================================
	// 获取选中的项索引
	_SelectRenderer.getSelectedIndex = function (needArray) {
		return SelectRenderer.getSelectedIndex.call(this, needArray);
	};

	// 获取选中的项编号
	_SelectRenderer.getSelectedKey = function (needArray) {
		return SelectRenderer.getSelectedKey.call(this, needArray);
	};

	_SelectRenderer.getSelectedData = function (needArray) {
		return SelectRenderer.getSelectedData.call(this, needArray);
	};

	// 判断组件是否支持多选
	_SelectRenderer.isMultiple = function () {
		return Fn.isMultiple.call(this);
	};

	// 判断是否全部选中
	_SelectRenderer.isAllSelected = function () {
		return SelectRenderer.isAllSelected.call(this);
	};

	_SelectRenderer._isSelected = function (data, index, selectedIndexs, selectedIds) {
		return SelectRenderer.isSelected.call(this, data, index, selectedIndexs, selectedIds);
	};

	_SelectRenderer._setItemSelected = function (item, beSelected) {
		if (beSelected)
			item.addClass("selected");
		else
			item.removeClass("selected");
	};


	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = {
			fn: Fn,
			_base: BaseRenderer,
			_item: ItemsRenderer,
			_select: SelectRenderer
		};
	}
	else {
		var Renderer = VRender.Component.Render;
		Renderer.fn = Fn;
		Renderer._base = BaseRenderer;
		Renderer._item = ItemsRenderer;
		Renderer._select = SelectRenderer;
	}

})(typeof VRender === "undefined");