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

	// 组件数据适配转换，支持数组对象
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

	// 获取数据的属性映射对象，组件数据经过映射后才返回给客户端，可以有效保证数据的私密性
	// 映射对象将被添加到组件标签的属性中，前端可以通过 this.$el.data() 获取
	var getMapData = function (data) {
		var mapper = this.options.dataMapper || this.options.mapper;
		if (Utils.isFunction(this.getDataMapper))
			mapper = this.getDataMapper();
		if (Utils.isFunction(mapper))
			return mapper(data);
		var attrs = {};
		if (Utils.notNull(data)) {
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
			if (data.hasOwnProperty("text"))
				attrs["text"] = data.text;
			if (data.hasOwnProperty("status"))
				attrs["status"] = data.status;
		}
		return attrs;
	};

	// 获取数据的编号
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

	// 获取数据的显示问宝宝
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
	// 通用组件渲染方法，子组件继承后可直接使用
	BaseRenderer.render = function ($, target) {
		this.renderData($, target);
		BaseRenderer.renderFunction(target, "adapter", this.getDataAdapter());
		BaseRenderer.renderFunction(target, "mapper", this.getDataMapper());
	};

	// 渲染接口定义的方法，仅服务端有效，服务端定义的接口方法可在前端获取到
	BaseRenderer.renderFunction = function (target, name, fn) {
		if (backend && Utils.isFunction(fn)) {
			target.write("<div class='ui-fn' name='" + name + "'>" + escape(fn) + "</div>");
		}
	};

	// ====================================================
	// 基本组件渲染
	_BaseRenderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
	};

	// 渲染组件设置的数据，仅映射后的数据被渲染
	_BaseRenderer.renderData = function ($, target) {
		var _data = this.getMapData(this.getData());
		if (_data) {
			for (var n in _data) {
				target.attr("data-" + n, _data[n]);
			}
		}
	};

	// 判断组件是否在应用模式下渲染，一般指移动端渲染（服务端成本较高，尽量缓存）
	_BaseRenderer.isRenderAsApp = function () {
		if (backend) {
			if (this.context && Utils.isFunction(this.context.isRenderAsApp))
				return this.context.isRenderAsApp();
			return false;
		}
		return VRender.ENV.isApp;
	};

	// 判断组件是否在 iPhone 中渲染（服务端成本较高，尽量缓存）
	_BaseRenderer.isRenderAsIphone = function () {
		if (backend) {
			if (this.context && Utils.isFunction(this.context.isRenderAsIphone))
				return this.context.isRenderAsIphone();
			return false;
		}
		return VRender.ENV.isIphone;
	};

	// 判断组件是否使用 rem 度量单位（服务端成本较高，尽量缓存）
	_BaseRenderer.isRenderAsRem = function () {
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
	// 获取该组件的数据（集），已经过适配器转换
	_BaseRenderer.getData = function () {
		return doAdapter.call(this, this.options.data);
	};

	// 获取数据编号
	_BaseRenderer.getDataId = function (data) {
		return getDataId.call(this, data);
	};

	// 获取数据显示文本
	_BaseRenderer.getDataLabel = function (data) {
		return getDataLabel.call(this, data);
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
		return getMapData.call(this, data);
	};

	// 数据转换，通过适配器转换数据
	_BaseRenderer.doAdapter = function (data) {
		return doAdapter.call(this, data);
	};

	///////////////////////////////////////////////////////
	var ListRenderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _ListRenderer = ListRenderer.prototype = new BaseRenderer();

	// ====================================================
	// 列表组件渲染
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
		this.renderItems($, target);
	};

	// 渲染列表项
	ListRenderer.renderItems = function ($, itemContainer, datas) {
		datas = datas || this.getData();
		if (datas && datas.length > 0) {
			var selectedIndex = this.getSelectedIndex(true);
			var selectedId = this.getSelectedId(true) || [];
			
			var self = this;
			Utils.each(datas, function (data, i) {
				var item = null;
				if (Utils.isFunction(self.getNewItem))
					item = self.getNewItem($, itemContainer, data, i);
				else if (Utils.isFunction(self._getNewItem))
					item = self._getNewItem(itemContainer, data, i); // 前端渲染
				if (item) {
					var bSelected = self.isSelected(data, i, selectedIndex, selectedId);
					if (Utils.isFunction(self.renderOneItem))
						self.renderOneItem($, item, data, i, bSelected);
					else if (Utils.isFunction(self._renderOneItem))
						self._renderOneItem(item, data, i, bSelected);
				}
			});
		}
	};

	// 渲染单个列表项
	ListRenderer.renderOneItem = function ($, item, container, data, index, bSelected) {
		if (!backend)
			item.data("itemData", data);

		if (bSelected)
			item.addClass("selected");
		if (Utils.isTrue(data.disabled))
			item.addClass("disabled").attr("disabled", "disabled");
		
		container = container || item;
		var itemRenderer = this.getItemRenderer();
		if (Utils.isFunction(itemRenderer)) {
			var result = itemRenderer($, item, data, index);
			if (Utils.isNotNull(result))
				container.empty().append(result);
		}
		else {
			var label = this.getDataLabel(data, index);
			container.html(Utils.isNull(label) ? "" : label);
		}
	};

	// 渲染接口定义方法，仅服务端有效
	ListRenderer.renderFunction = function (target, name, fn) {
		BaseRenderer.renderFunction(target, name, fn);
	};

	// 获取选中的项索引
	ListRenderer.getSelectedIndex = function (needArray) {
		var selectedIndex = this.options.selectedIndex;
		if (Utils.isBlank(selectedIndex)) {
			return (needArray || this.isMultiple()) ? [] : -1;
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
		if (needArray || this.isMultiple())
			return indexs;
		return indexs.length > 0 ? indexs[0] : -1;
	};

	// 获取选中的项编号
	ListRenderer.getSelectedId = function (needArray) {
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
		if (needArray || this.isMultiple())
			return ids;
		return ids.length > 0 ? ids[0] : null;
	};

	// 获取选中的列表项数据，返回数组，支持深入迭代查询
	ListRenderer.getSelectedData = function (datas, deep) {
		var selectedDatas = [];
		if (datas && datas.length > 0) {
			var index = 0;
			var self = this;
			var selectedIndex = this.getSelectedIndex(true);
			var selectedId = this.getSelectedId(true) || [];
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
						if (self.isSelected(data, index, selectedIndex, selectedId))
							selectedDatas.push(data);
						index += 1;
					}
				}
			};
			find(datas);
		}
		return selectedDatas;
	};

	// 判断对象是否选中状态
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
	// 渲染列表组件
	_ListRenderer.render = function ($, target) {
		ListRenderer.render.call(this, $, target);
	};

	// 渲染列表项
	_ListRenderer.renderItems = function ($, target) {
		var itemContainer = this.getItemContainer($, target);
		if (itemContainer) {
			ListRenderer.renderItems.call(this, $, itemContainer);
		}
	};

	// 渲染单个列表项
	_ListRenderer.renderOneItem = function ($, item, data, index, bSelected) {
		ListRenderer.renderOneItem.call(this, $, item, null, data, index, bSelected);
	};

	// 渲染组件数据集，仅映射后的数据被渲染
	_ListRenderer.renderData = function ($, target) {
		if (backend) {
			var datas = this.getData();
			if (datas && datas.length > 0) {
				var self = this;
				datas = Utils.map(datas, function (data) {
					return self.getMapData(data);
				});
				target.attr("data-items", escape(JSON.stringify(datas)));
			}
		}
	};

	// 初始化渲染组件选中项信息（索引或编号）
	_ListRenderer.renderSelectValues = function ($, target) {
		var index = this.getSelectedIndex(true).join(",");
		if (Utils.isNotBlank(index))
			target.attr("data-inds", index);
		
		var id = this.getSelectedId(true).join(",");
		if (Utils.isNotBlank(id))
			target.attr("data-ids", id);

		if (this.options.apiName) {
			target.attr("data-tryindex", index);
			target.attr("data-tryid", id);
		}
	};

	// 获取列表项容器，默认是 target
	_ListRenderer.getItemContainer = function ($, target) {
		return target;
	};

	// 新建一个列表项并返回
	// 参数 data 和 index 只用来判断创建标签类型，不建议生成列表项内容
	_ListRenderer.getNewItem = function ($, itemContainer, data, index) {
		return $("<li></li>").appendTo(itemContainer);
	};

	// ====================================================
	// 获取组件数据集，已经过适配器转换，返回数组格式
	_ListRenderer.getData = function () {
		return doAdapter.call(this, Utils.toArray(this.options.data));
	};

	// 获取数据的显示文本
	_ListRenderer.getDataLabel = function (data, index) {
		return getDataLabel.call(this, data, index);
	};

	// 获取用来代表数据编号的字段名称
	_ListRenderer.getIdField = function () {
		return this.options.idField;
	};

	// 获取用来显示数据文本的字段名称
	_ListRenderer.getLabelField = function () {
		return this.options.labelField;
	};

	// 获取用来显示数据文本的方法，较复杂的内容可以使用该方法
	_ListRenderer.getLabelFunction = function () {
		return this.options.labelFunction;
	};

	// 获取项渲染器
	_ListRenderer.getItemRenderer = function () {
		return this.options.itemRenderer;
	};

	// 判断组件是否支持多选
	_ListRenderer.isMultiple = function () {
		if (this.options.hasOwnProperty("multiple"))
			return Utils.isTrue(this.options.multiple);
		return Utils.isTrue(this.options.multi);
	};

	// 获取当前选中项的索引
	// needArray为true或多选的情况返回数组，否则返回一个索引值
	_ListRenderer.getSelectedIndex = function (needArray) {
		return ListRenderer.getSelectedIndex.call(this, needArray);
	};

	// 获取当前选中项的编号
	_ListRenderer.getSelectedId = function (needArray) {
		return ListRenderer.getSelectedId.call(this, needArray);
	};

	// 获取当前选中项的数据（集）
	_ListRenderer.getSelectedData = function (needArray) {
		var items = ListRenderer.getSelectedData.call(this, this.getData(), true);
		if (needArray || this.isMultiple())
			return items;
		return items.length > 0 ? items[0] : null;
	};

	// 判断数据所对应的项是否被选中
	_ListRenderer.isSelected = function (data, index, selectedIndex, selectedId) {
		if (!(selectedIndex || selectedId)) {
			selectedIndex = this.getSelectedIndex(true);
			selectedId = this.getSelectedId(true);
		}
		return ListRenderer.isSelected.call(this, data, index, selectedIndex, selectedId);
	};

	// 判断是否所有项都被选中
	_ListRenderer.isAllSelected = function () {
		var selectedIndex = this.getSelectedIndex(true);
		var selectedId = this.getSelectedId(true) || [];
		var datas = this.getData() || [];
		for (var i = 0, l = datas.length; i < l; i++) {
			if (!this.isSelected(data, i, datas[i], i, selectedIndex, selectedId))
				return false;
		}
		return datas.length > 0;
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

		VRender.Component.Render.fn = {};
		VRender.Component.Render.fn.getMapData = getMapData;
		VRender.Component.Render.fn.getDataId = getDataId;
		VRender.Component.Render.fn.getDataLabel = getDataLabel;
		VRender.Component.Render.fn.doAdapter = doAdapter;
		VRender.Component.Render.fn.renderItems = ListRenderer.renderItems;
		VRender.Component.Render.fn.renderOneItem = ListRenderer.renderOneItem;
	}

})(typeof VRender === "undefined");
