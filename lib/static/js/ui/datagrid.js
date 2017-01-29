// ========================================================
// 数据表格
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Datagrid)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderItems = (isFront ? VRender.Component : require("./base")).HolderItems;

	var dateFormats = {date: "yyyy-MM-dd", datetime: "yyyy-MM-dd HH:mm:ss", time: "HH:mm:ss"};

	// 判断对象是否相同，ID一样也认为是相同对象
	var equal = function (data1, data2) {
		if (data1 == data2)
			return true;
		if (Utils.isNull(data1))
			return Utils.isNull(data2);
		else if (Utils.isNull(data2))
			return false;
		return this.getDataId(data1) == this.getDataId(data2);
	};

	// 组件内置默认获取表单元格内容的方法
	var getDefaultValue = function (column, data, index) {
		if (Utils.isBlank(data))
			return null;
		if (Utils.isBlank(column.name))
			return "" + data;
		var value = data[column.name];
		if (column.format && Utils.isNotBlank(value)) {
			var type = column.type;
			if (type === "localtime")
				value = Utils.toLocalDateString(Utils.toDate(value));
			else if (/^date|datetime|time$/.test(type)) {
				value = Utils.toDate(value);
				if (value)
					value = Utils.toDateString(value, dateFormats[type]);
			}
			else if (type === "money") {
				value = parseFloat(value);
				if (isNaN(value))
					value = null;
				else {
					value = value.toFixed(2).split(".");
					value = "<span class='val'>￥<span class='v1'>" + value[0] + 
						"</span>.<span class='v2'>" + value[1] + "</span></span>";
				}
			}
			else if (type === "number" || type === "num") {
				value = parseFloat(value);
				if (isNaN(value))
					value = null;
				else {
					var decimals = parseFloat(column.decimals);
					if (isNaN(decimals) || decimals < 0)
						decimals = 0;
					value = value.toFixed(decimals);
				}
			}
		}
		return value;
	};

	///////////////////////////////////////////////////////
	var Holder = function (context, options) {
		HolderItems.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderItems();

	_Holder.render = function ($, target) {
		HolderItems.render.call(this, $, target);
		target.addClass("ui-datagrid");

		if (this.isChkboxVisible())
			target.addClass("show-chk");
		if (this.isMultiSelected())
			target.addClass("multiple");
		if (!this.isHeaderVisible())
			target.addClass("no-head");

		var table = $("<table></table>").appendTo(target);
		renderHeader.call(this, $, target, table);
		renderContent.call(this, $, target, table);
		renderEmptyView.call(this, $, target);
		renderOthers.call(this, $, target);

		return this;
	};

	// ====================================================
	_Holder.getColumns = function () {
		return Utils.toArray(this.options.columns);
	};

	_Holder.isChkboxVisible = function () {
		if (this.options.hasOwnProperty("showCheckbox"))
			return Utils.isTrue(this.options.showCheckbox);
		return Utils.isTrue(this.options.chkbox);
	};

	_Holder.isMultiSelected = function () {
		if (this.options.hasOwnProperty("multiple"))
			return Utils.isTrue(this.options.multiple);
		return Utils.isTrue(this.options.multi);
	};

	_Holder.getSelectedIndex = function () {
		if (this.options.hasOwnProperty("selectedIndexs")) {
			if (Utils.isBlank(this.options.selectedIndexs))
				return null;
			return Utils.toArray(this.options.selectedIndexs);
		}
		if (Utils.isNotBlank(this.options.selectedIndex))
			return Utils.toArray(this.options.selectedIndex);
		return null;
	};

	_Holder.getSelectedId = function () {
		if (this.options.hasOwnProperty("selectedIds")) {
			if (Utils.isBlank(this.options.selectedIds))
				return null;
			return Utils.toArray(this.options.selectedIds);
		}
		if (Utils.isNotBlank(this.options.selectedId))
			return Utils.toArray(this.options.selectedId);
		return null;
	};

	_Holder.getSelectedItems = function () {
		if (this.options.hasOwnProperty("selectedItems")) {
			if (Utils.isBlank(this.options.selectedItems))
				return null;
			return Utils.toArray(this.options.selectedItems);
		}
		if (Utils.isNotBlank(this.options.selectedItem))
			return Utils.toArray(this.options.selectedItem);
		return null;
	};

	_Holder.isHeaderVisible = function () {
		if (Utils.isBlank(this.options.showHeader))
			return true;
		return Utils.isTrue(this.options.showHeader);
	};

	_Holder.getColumnRenderer = function () {
		return this.options.renderer || this.options.columnRenderer;
	};

	_Holder.getRowStyleFunction = function () {
		return this.options.rowStyleFunction || this.options.styleFunction;
	};

	// ====================================================
	_Holder.isAllSelected = function () {
		var datas = this.getData(); // extend
		for (var i = 0, l = datas.length; i < l; i++) {
			if (!this.isDataSelected(datas[i], i))
				return false;
		}
		return datas.length > 0;
	};

	_Holder.isDataSelected = function (data, index) {
		var selectedItems = this.getSelectedItems();
		if (selectedItems) {
			var self = this;
			return Utils.index(selectedItems, function (temp) {
				return equal.call(self, data, temp);
			}) >= 0;
		}
		var selectedIds = this.getSelectedId();
		if (selectedIds) {
			var id = this.getDataId(data);
			return Utils.index(selectedIds, function (temp) {
				return temp == id;
			}) >= 0;
		}
		var selectedIndexs = this.getSelectedIndex();
		if (selectedIndexs) {
			return Utils.index(selectedIndexs, function (temp) {
				return temp == index
			}) >= 0;
		}
		return false;
	};

	// ====================================================
	var renderHeader = function ($, target, table) {
		var thead = $("<thead></thead>").appendTo(table);
		var row = $("<tr></tr>").appendTo(thead);
		if (this.isChkboxVisible()) {
			row.append("<td class='col-type-chk'><span class='chkbox'></span></td>");
			if (this.isAllSelected())
				row.addClass("selected");
		}
		Utils.each(this.getColumns(), function (column, i) {
			var col = $("<td>" + (column.title || column.name) + "</td>").appendTo(row);
			col.addClass("col-" + (i + 1));
			if (Utils.isNotBlank(column.name))
				col.addClass("col-" + column.name).attr("data-name", column.name);
			if (Utils.isNotBlank(column.type))
				col.addClass("col-type-" + column.type).attr("data-type", column.type);
			if (Utils.isTrue(column.format))
				col.attr("data-format", 1);
		});
	};

	var renderContent = function ($, target, table) {
		var tbody = $("<tbody></tbody>").appendTo(table);

		var self = this;
		var datas = this.getData();
		var columns = this.getColumns();
		Utils.each(datas, function (data, i) {
			var row = $("<tr class='row-item'></tr>").appendTo(tbody);
			renderRow.call(self, $, row, columns, data, i);
		});

		if (!datas || datas.length === 0)
			target.addClass("no-data");
	};

	var renderEmptyView = function ($, target) {
		var emptyView = this.options.empty;
		if (Utils.isNotBlank(emptyView)) {
			target = $("<div class='datagrid-emp'></div>").appendTo(target);
			if (typeof emptyView === "string") {
				isFront ? target.append(emptyView) : target.write(emptyView);
			}
			else if (isFront && (emptyView instanceof VRender.Component.base)) {
				emptyView.$el && emptyView.$el.appendTo(target);
			}
			else if (Utils.isFunction(emptyView.render))
				emptyView.render(target);
			else
				target.text(emptyView);
		}
	};

	var renderOthers = function ($, target) {
		if (isFront)
			return;

		HolderItems.renderFunction(target, "renderer", this.getColumnRenderer());
		HolderItems.renderFunction(target, "stylefn", this.getRowStyleFunction());

		var pager = this.options.pager || this.options.paginator;
		if (pager && Utils.isFunction(pager.getViewId))
			target.attr("data-pager", pager.getViewId());
	};

	var renderRow = function ($, row, columns, data, index) {
		renderRowAttrs.call(this, row, data, index);

		if (this.isChkboxVisible())
			row.append("<td class='col-type-chk'><span class='chkbox'></span></td>");
		if (this.isDataSelected(data, index))
			row.addClass("selected");

		var self = this;
		Utils.each(columns, function (column, i) {
			var col = $("<td></td>").appendTo(row);
			renderCell.call(self, $, col, column, data, i);
		});

		var rowStyle = data.__rowstyle__;
		var styleFunction = this.getRowStyleFunction();
		if (Utils.isFunction(styleFunction))
			rowStyle = styleFunction(data, index);
		if (Utils.isNotBlank(rowStyle))
			row.addClass(rowStyle);
	};

	var renderRowAttrs = function (row, data, index) {
		var attrs = this.getMapData(data) || {id: this.getDataId(data)};
		for (var n in attrs) {
			if (Utils.isNotBlank(attrs[n]))
				row.attr("data-" + n, attrs[n]);
		}
		if (isFront)
			row.data("itemData", data);
	};

	var renderCell = function ($, col, column, data, index) {
		col.addClass("col-" + (index + 1));
		if (Utils.isNotBlank(column.name))
			col.addClass("col-" + column.name);
		var value = null;
		var columnRenderer = this.getColumnRenderer();
		if (Utils.isFunction(columnRenderer))
			value = columnRenderer(column.name, data, index, column);
		if (Utils.isNull(value))
			value = getDefaultValue.call(this, column, data, index);
		value = Utils.isBlank(value) ? "&nbsp;" : value;
		isFront ? col.html(value) : col.write(value);
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIDatagrid = Component.Datagrid = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		var columns = this.columns = Utils.toArray(this.options.columns);
		if (columns.length === 0) {
			Utils.each(this.$el.find("thead td"), function (col, i) {
				if (!col.is(".col-type-chk"))
					columns.push(col.data());
			});
		}

		initPager.call(this);

		var self = this;
		this.tap(".row-item", function (e) { return itemClickHandler.call(self, e); });
		this.tap(".chkbox", function (e) { return chkboxClickHandler.call(self, e); });
		this.tap("td.col-op > a", function (e) { return operatorHandler.call(self, e); });
	};
	var _UIDatagrid = UIDatagrid.prototype = new Component.base();

	UIDatagrid.find = function (view) {
		return Component.find(view, ".ui-datagrid", UIDatagrid);
	};

	UIDatagrid.create = function (options) {
		options = $.extend({}, options);
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIDatagrid(target, options, holder);
	};

	// ====================================================
	// 获取当前表格数据集
	_UIDatagrid.getData = function () {
		var self = this;
		return Utils.map(getRowItems.call(this), function (item) {
			return self.getItemData(item);
		});
	};
	_UIDatagrid.setData = function (value) {
		var self = this;
		var tbody = this.$el.children("table").children("tbody").empty();
		Utils.each(Utils.toArray(value), function (temp, i) {
			self.addItem(temp, null, tbody); // adapter在addItem()中执行
		});
		checkIfEmpty.call(this);
	};

	// 获取任意某一行的数据，target是行内的标签对象
	_UIDatagrid.getRowData = function (target) {
		if (Utils.isNotBlank(target)) {
			target = $(target);
			if (target.length > 0) {
				if (!target.is("tr"))
					target = Utils.parentUntil(target, "tr", this.$el);
			}
			if (target.length > 0)
				return this.getItemData(target);
		}
		return null;
	};

	_UIDatagrid.getSelectedIndex = function () {
		var indexs = [];
		Utils.each(getRowItems.call(this), function (item, i) {
			if (item.is(".selected"))
				indexs.push(i);
		});
		return indexs;
	};
	_UIDatagrid.setSelectedIndex = function (value, trigger) {
		var indexs = Utils.map(Utils.toArray(value), function (tmp) {
			return parseInt(tmp);
		});
		Utils.each(getRowItems.call(this), function (item, i) {
			if (indexs.indexOf(i) >= 0)
				item.addClass("selected");
			else
				item.removeClass("selected");
		});
		if (!!trigger)
			this.trigger("itemselectchange");
	};

	_UIDatagrid.getSelectedId = function () {
		var self = this;
		return Utils.map(getRowItems.call(this, ".selected"), function (item, i) {
			return self.getDataId(self.getItemData(item));
		});
	};
	_UIDatagrid.setSelectedId = function (value, trigger) {
		var self = this;
		var ids = Utils.toArray(value);
		Utils.each(getRowItems.call(this), function (item, i) {
			var id = self.getDataId(self.getItemData(item));
			var index = Utils.index(ids, function (tmp) { return tmp == id; });
			if (index >= 0)
				item.addClass("selected");
			else
				item.removeClass("selected");
		});
		if (!!trigger)
			this.trigger("itemselectchange");
	};

	_UIDatagrid.getSelectedItems = function () {
		var self = this;
		return Utils.map(getRowItems.call(this, ".selected"), function (item, i) {
			return self.getItemData(item);
		});
	};
	_UIDatagrid.setSelectedItems = function (value, trigger) {
		var self = this;
		var datas = Utils.toArray(value);
		Utils.each(getRowItems.call(this), function (item, i) {
			var temp = self.getItemData(item);
			var index = Utils.index(datas, function (tmp) {
				return equal(tmp, temp);
			});
			if (index >= 0)
				item.addClass("selected");
			else 
				item.removeClass("selected");
		});
		if (!!trigger)
			this.trigger("itemselectchange");
	};

	// 判断是否全部选中
	_UIDatagrid.isAllSelected = function () {
		return getRowItems.call(this).not(".selected").length === 0;
	};

	// 
	_UIDatagrid.isChkboxVisible = function () {
		return this.$el.is(".show-chk");
	};

	_UIDatagrid.isMultiSelected = function () {
		return this.$el.is(".multiple");
	};

	// 设置表格空白时显示的视图
	_UIDatagrid.setEmptyView = function (view) {
		this.options.empty = view;
		this.$el.children(".datagrid-emp").remove();
		renderEmptyView.call(this, $, this.$el);
	};

	// 设置点击行时是否选中
	_UIDatagrid.isRowSelectable = function () {
		if (Utils.isNull(this.options.rowSelectable))
			return true;
		return Utils.isTrue(this.options.rowSelectable);
	};
	_UIDatagrid.setRowSelectable = function (value) {
		this.options.rowSelectable = value;
	};

	_UIDatagrid.getItemIndex = function (data) {
		var self = this;
		data = Component.base.doAdapter.call(this, data);
		return Utils.index(getRowItems.call(this), function (item, i) {
			var temp = self.getItemData(item);
			return equal(data, temp);
		});
	};

	_UIDatagrid.getColumnName = function (index) {
		index = parseInt(index);
		if (index >= 0 && index < this.columns.length)
			return this.columns[index].name;
		return null;
	};

	_UIDatagrid.addItem = function (data, index, tbody) {
		tbody = tbody || this.$el.children("table").children("tbody");
		data = Component.base.doAdapter.call(this, data);
		var row = $("<tr class='row-item'></tr>").appendTo(tbody);
		renderRow.call(this, $, row, this.columns, data, index);
		index = parseInt(index);
		if (!isNaN(index) && index >= 0) {
			var items = getRowItems.call(this, null, tbody);
			if (index < items.length - 1)
				items.eq(index).before(row.detach());
		}
		this.$el.removeClass("no-data");
		// checkIfEmpty.call(this);
		checkIfAllSelected.call(this);
		return row;
	};

	_UIDatagrid.updateItem = function (data, index) {
		index = parseInt(index);
		data = Component.base.doAdapter.call(this, data);
		if (isNaN(index))
			index = this.getItemIndex(data);
		if (!isNaN(index) && index >= 0) {
			var items = getRowItems.call(this);
			if (index < items.length) {
				var oldItem = this.removeItemAt(index);
				var newItem = this.addItem(data, index);
				if (oldItem.is(".selected"))
					newItem.addClass("selected");
				return [newItem, oldItem];
			}
		}
		return null;
	};

	_UIDatagrid.removeItem = function (data) {
		var items = getRowItems.call(this);
		data = Component.base.doAdapter.call(this, data);
		for (var i = 0, l = items.length; i < l; i++) {
			var item = items.eq(i);
			if (equal(data, this.getItemData(item))) {
				item.remove();
				checkIfEmpty.call(this);
				checkIfAllSelected.call(this);
				return item;
			}
		}
		return null;
	};

	_UIDatagrid.removeItemAt = function (index) {
		index = parseInt(index);
		if (!isNaN(index) && index >= 0) {
			var item = getRowItems.call(this).eq(index).remove();
			if (item && item.length > 0) {
				checkIfEmpty.call(this);
				checkIfAllSelected.call(this);
				return item;
			}
		}
		return null;
	};

	_UIDatagrid.addOrUpdateItem = function (data) {
		data = Component.base.doAdapter.call(this, data);
		var index = this.getItemIndex(data);
		if (index >= 0)
			this.updateItem(data, index);
		else
			this.addItem(data);
	};

	_UIDatagrid.reRender = function () {
		if (this.renderTimerId)
			clearTimeout(this.renderTimerId);
		var self = this;
		this.renderTimerId = setTimeout(function () {
			self.setData(self.getData());
			delete self.renderTimerId;
		}, 0);
	};

	_UIDatagrid.isDataSelected = function () {
		var self = this;
		return !!Utils.find(getRowItems.call(this, ".selected"), function (temp) {
			return equal.call(self, data, self.getItemData(temp));
		});
	};

	// ====================================================
	// 行数据渲染器
	_UIDatagrid.getRowDataMap = function () {
		return getFunction.call(this, "dataMapper", "mapper");
	};
	_UIDatagrid.setRowDataMap = function (value) {
		this.dataMapper = value;
		delete this.options.dataMapper;
		this.reRender();
	};

	// 表单元格渲染器
	_UIDatagrid.getColumnRenderer = function () { 
		if (this.options.hasOwnProperty("renderer"))
			return this.options.renderer;
		return getFunction.call(this, "columnRenderer", "renderer");
	};
	_UIDatagrid.setColumnRenderer = function (value) {
		this.columnRenderer = value;
		delete this.options.columnRenderer;
		delete this.options.renderer;
		this.reRender();
	};

	// 行样式
	_UIDatagrid.getRowStyleFunction = function () {
		return getFunction.call(this, "styleFunction", "stylefn");
	};
	_UIDatagrid.setRowStyleFunction = function (value) {
		this.styleFunction = value;
		delete this.options.styleFunction;
		this.reRender();
	};

	// ====================================================
	_UIDatagrid.getPaginator = function () {
		return this._pager;
	};
	_UIDatagrid.setPaginator = function (pager) {
		if (this._pager)
			this._pager.off("onpage");
		this._pager = pager;
		if (this._pager) {
			var self = this;
			this._pager.on("onpage", function (e, pageNo, pageSize) {
				var params = $.extend({}, self.lastLoadParams, {page: pageNo, size: pageSize});
				self.load(self.lastLoadApi, params);
			});
		}
	};

	// ====================================================
	var itemClickHandler = function (e) {
		var row = $(e.currentTarget);
		var col = Utils.parentUntil(e.target, "td", "tr");

		var changeFlag = false;
		if (this.isRowSelectable()) {
			var siblings = row.addClass("selected").siblings(".selected");
			if (siblings.length > 0) {
				siblings.removeClass("selected");
				changeFlag = true;
			}
			var header = this.$el.children("table").children("thead").children("tr");
			setSelected(header, this.isAllSelected());
		}

		this.trigger("itemclick", this.getItemData(row), row.index(), col.index());
		if (changeFlag)
			this.trigger("itemselectchange");
	};

	var chkboxClickHandler = function (e) {
		var chkbox = $(e.currentTarget);
		var item = chkbox.parent().parent().toggleClass("selected");
		if (item.parent().is("thead")) {
			setSelected(getRowItems.call(this), item.is(".selected"));
		}
		else if (this.isMultiSelected()) {
			var header = this.$el.children("table").children("thead").children("tr");
			setSelected(header, this.isAllSelected());
		}
		else {
			item.siblings().removeClass("selected");
		}
		this.trigger("itemselectchange");
		return false;
	};

	var operatorHandler = function (e) {
		var op = $(e.currentTarget);
		var item = op.parent().parent();
		var data = this.getItemData(item);
		var opName = op.attr("name") || op.data("name") || "";
		this.trigger("oper", opName, data, item);
	};

	// ====================================================
	var initPager = function () {
		var pager = this.$el.attr("data-pager");
		pager = Utils.isBlank(pager) ? null : $("[vid='" + pager + "']");
		if (pager && pager.length > 0) {
			if (pager.is('.ui-paginator'))
				pager = new Component.Paginator(pager);
			this.setPaginator(pager);
		}
	};

	var getRowItems = function (selector, tbody) {
		tbody = tbody || this.$el.children("table").children("tbody");
		var items = tbody.children(".row-item");
		return Utils.isBlank(selector) ? items : items.filter(selector);
	};

	var getFunction = function (name, type) {
		if (this.options.hasOwnProperty(name))
			return this.options[name];
		if (this.hasOwnProperty(name))
			return this[name];
		var func = this.$el.children(".ui-fn[name='" + type +"']").text();
		if (func) {
			func = (new Function("var Utils=VRender.Utils;return (" + 
				unescape(func) + ");"))();
		}
		return this[name] = func;
	};

	var setSelected = function (target, selected) {
		if (selected)
			target.addClass("selected");
		else
			target.removeClass("selected");
	};

	var checkIfEmpty = function () {
		var items = getRowItems.call(this);
		if (items && items.length > 0)
			this.$el.removeClass("no-data");
		else
			this.$el.addClass("no-data");
	};

	var checkIfAllSelected = function () {
		var thead = this.$el.children("table").children("thead").children("tr");
		setSelected(thead, this.isAllSelected());
	};

	// ====================================================
	Component.register(".ui-datagrid", UIDatagrid);

})(typeof VRender !== "undefined");
