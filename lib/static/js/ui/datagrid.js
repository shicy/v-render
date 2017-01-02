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
	var HolderBase = (isFront ? VRender.Component : require("./base")).HolderBase;

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

	// 获取当前所有数据
	var getAllDatas = function (front) {
		if (front) {
			var self = this;
			return Utils.map(this.$el.find(".row-item"), function (item) {
				return self.getItemData(item);
			});
		}
		return Utils.toArray(this.getData());
	};

	// 获取当前选中的数据
	var getSelectedDatas = function (front) {
		var self = this;
		if (front) {
			return Utils.map(this.$el.find(".row-item.selected"), function (item) {
				return self.getItemData(item);
			});
		}
		return Utils.filter(getAllDatas.call(this, false), function (temp, i) {
			return self.isDataSelected(false, temp, i);
		});
	};

	// 判断当前是否选中所有
	var isAllSelected = function (front) {
		if (front) {
			return this.$el.find(".row-item").not(".selected").length === 0;
		}
		var datas = getAllDatas.call(this, false);
		for (var i = 0, l = datas.length; i < l; i++) {
			if (!isDataSelected.call(this, false, datas[i], i))
				return false;
		}
		return true;
	};

	// 判断对象是否选中
	var isDataSelected = function (front, data, index) {
		var self = this;
		if (front) {
			return !!Utils.find(this.$el.find(".row-item.selected"), function (temp) {
				return equal.call(self, data, self.getItemData(temp));
			});
		}
		var selectedItems = this.getSelectedItems();
		if (selectedItems) {
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
	var Holder = function (options) {
		HolderBase.call(this, options);
		this.setColumns(this.options.columns);
		this.setIdField(this.options.idField);
		this.setColumnRenderer(this.options.renderer || this.options.columnRenderer);
		this.setRowStyleFunction(this.options.styleFunction);
		this.setRowDataMap(this.options.dataMapper);
		this.setPaginator(this.options.pager || this.options.paginator);
		this.setSearcher(this.options.searcher);
		if (this.options.hasOwnProperty("chkbox"))
			this.setChkboxVisible(this.options.chkbox);
		if (this.options.hasOwnProperty("multi"))
			this.setMultiSelected(this.options.multi);
		if (this.options.hasOwnProperty("empty"))
			this.setEmptyView(this.options.empty);
		if (this.options.hasOwnProperty("showEmpty"))
			this.setEmptyVisible(this.options.showEmpty);
		if (this.options.hasOwnProperty("showHeader"))
			this.setHeaderVisible(this.options.showHeader);
		if (this.options.hasOwnProperty("selectedIndex"))
			this.setSelectedIndex(this.options.selectedIndex);
		if (this.options.hasOwnProperty("selectedIndexs"))
			this.setSelectedIndex(this.options.selectedIndexs);
		if (this.options.hasOwnProperty("selectedId"))
			this.setSelectedId(this.options.selectedId);
		if (this.options.hasOwnProperty("selectedIds"))
			this.setSelectedId(this.options.selectedIds);
		if (this.options.hasOwnProperty("selectedItem"))
			this.setSelectedItems(this.options.selectedItem);
		if (this.options.hasOwnProperty("selectedItems"))
			this.setSelectedItems(this.options.selectedItems);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		target.addClass("ui-datagrid");
		var table = $("<table></table>").appendTo(target);
		renderHeader.call(this, $, target, table);
		renderContent.call(this, $, target, table);
		renderEmptyView.call(this, $, target, this.getEmptyView());
		renderFunctions.call(this, $, target);

		if (this.isChkboxVisible())
			target.addClass("show-chk");
		if (this.isMultiSelected())
			target.addClass("multiple");
		if (!this.isHeaderVisible())
			target.addClass("no-head");

		if (!isFront) {
			if (this.options.apiName)
				HolderBase.renderSelects.call(this, $, target);
			var pager = this.getPaginator();
			if (pager && Utils.isFunction(pager.getViewId))
				target.attr("data-pager", pager.getViewId());
		}

		return this;
	};

	// ====================================================
	_Holder.getColumns = function () {
		return Utils.toArray(this.d_columns);
	};
	_Holder.setColumns = function (value) {
		this.d_columns = value;
	};

	_Holder.isChkboxVisible = function () {
		if (Utils.isBlank(this.d_show_chkbox))
			return false;
		return Utils.isTrue(this.d_show_chkbox);
	};
	_Holder.setChkboxVisible = function (bool) {
		this.d_show_chkbox = Utils.isBlank(bool) ? true : bool;
	};

	_Holder.isMultiSelected = function () {
		if (Utils.isBlank(this.d_multiple))
			return false;
		return Utils.isTrue(this.d_multiple);
	};
	_Holder.setMultiSelected = function (bool) {
		this.d_multiple = Utils.isBlank(bool) ? true : bool;
	};

	_Holder.getSelectedIndex = function () {
		if (Utils.isBlank(this.d_selectedindexs))
			return null;
		return Utils.toArray(this.d_selectedindexs);
	};
	_Holder.setSelectedIndex = function (value) {
		this.d_selectedindexs = Utils.toArray(value);
	};

	_Holder.getSelectedId = function () {
		if (Utils.isBlank(this.d_selectedids))
			return null;
		return Utils.toArray(this.d_selectedids);
	};
	_Holder.setSelectedId = function (value) {
		this.d_selectedids = Utils.toArray(value);
	};

	_Holder.getSelectedItems = function () {
		if (Utils.isBlank(this.d_selecteditems))
			return null;
		return Utils.toArray(this.d_selecteditems);
	};
	_Holder.setSelectedItems = function (value) {
		this.d_selecteditems = Utils.toArray(value);
	};

	_Holder.getIdField = function () {
		return this.d_idfield;
	};
	_Holder.setIdField = function (value) {
		this.d_idfield = value;
	};

	_Holder.getEmptyText = function () {
		return this.d_emptytext;
	};
	_Holder.setEmptyText = function (value) {
		this.d_emptytext = value;
	};

	_Holder.getEmptyView = function () {
		return this.d_emptyview;
	};
	_Holder.setEmptyView = function (value) {
		this.d_emptyview = value;
	};

	_Holder.isEmptyVisible = function () {
		if (Utils.isBlank(this.d_show_empty))
			return true;
		return Utils.isTrue(this.d_show_empty);
	};
	_Holder.setEmptyVisible = function (bool) {
		this.d_show_empty = Utils.isBlank(bool) ? true : bool;
	};

	_Holder.isHeaderVisible = function () {
		if (Utils.isBlank(this.d_show_header))
			return true;
		return Utils.isTrue(this.d_show_header);
	};
	_Holder.setHeaderVisible = function (bool) {
		this.d_show_header = Utils.isBlank(bool) ? true : bool;
	};

	_Holder.getColumnRenderer = function () {
		return this.d_col_render;
	}
	_Holder.setColumnRenderer = function (value) {
		this.d_col_render = value;
	};

	_Holder.getRowDataMap = function () {
		return this.d_datamap;
	};
	_Holder.setRowDataMap = function (value) {
		this.d_datamap = value;
	};

	_Holder.getRowStyleFunction = function () {
		return this.d_row_style_func;
	};
	_Holder.setRowStyleFunction = function (value) {
		this.d_row_style_func = value;
	};

	_Holder.getPaginator = function () {
		return this.d_pager;
	};
	_Holder.setPaginator = function (value) {
		return this.d_pager = value;
	};

	_Holder.getSearcher = function () {
		return this.d_searcher;
	};
	_Holder.setSearcher = function (value) {
		return this.d_searcher = value;
	};

	// ====================================================
	var renderHeader = function ($, target, table) {
		var thead = $("<thead></thead>").appendTo(table);
		var row = $("<tr></tr>").appendTo(thead);
		if (this.isChkboxVisible()) {
			row.append("<td class='col-type-chk'><span class='chkbox'></span></td>");
			if (isAllSelected.call(this, false))
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
		var datas = getAllDatas.call(this, false);

		var columns = this.getColumns();
		Utils.each(datas, function (data, i) {
			var row = $("<tr class='row-item'></tr>").appendTo(tbody);
			renderRow.call(self, $, row, columns, data, i);
		});

		if (!datas || datas.length === 0)
			target.addClass("no-data");
	};

	var renderEmptyView = function ($, target, emptyView) {
		if (Utils.isBlank(emptyView) && Utils.isFunction(this.getEmptyText))
			emptyView = this.getEmptyText();
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

	var renderFunctions = function ($, target) {
		if (isFront)
			return ;

		var addFunc = function (name, func) {
			if (Utils.isFunction(func)) {
				target.write("<div class='ui-fn' name='" + name + "'>" + 
					escape(func) + "</div>");
			}
		};

		if (!isFront) {
			addFunc("mapper", this.getRowDataMap());
			addFunc("renderer", this.getColumnRenderer());
			addFunc("stylefn", this.getRowStyleFunction());
		}
	};

	var renderRow = function ($, row, columns, data, index) {
		renderRowAttrs.call(this, row, data, index);

		if (this.isChkboxVisible())
			row.append("<td class='col-type-chk'><span class='chkbox'></span></td>");
		if (isDataSelected.call(this, false, data, index))
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
		var dataMapper = this.getRowDataMap();
		var attrs = Utils.isFunction(dataMapper) ? dataMapper(data, index) : null;
		if (!attrs)
			attrs = {id: this.getDataId(data)};
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
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIDatagrid(target, options, holder);
	};

	// ====================================================
	// 获取当前表格数据集
	_UIDatagrid.getData = function () {
		return getAllDatas.call(this, true);
	};
	_UIDatagrid.setData = function (value) {
		var self = this;
		var tbody = this.$el.children("table").children("tbody").empty();
		Utils.each(Utils.toArray(value), function (temp, i) { // 这里不需要 adapter 
			self.addItem(temp, null, tbody);
		});
		checkIfEmpty.call(this);
	};

	// 获取任意某一行的数据，target是行内的标签对象
	_UIDatagrid.getRowData = function (target) {
		target = $(target);
		if (target.length > 0) {
			if (!target.is("tr"))
				target = Utils.parentUntil(target, "tr", this.$el);
		}
		if (target.length > 0)
			return this.getItemData(target);
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

	// 判断是否多选
	_UIDatagrid.isMultiple = function () {
		return this.$el.is(".multiple");
	};

	// 判断是否全部选中
	_UIDatagrid.isAllSelected = function () {
		return isAllSelected.call(this, true);
	};

	// 
	_UIDatagrid.isChkboxVisible = function () {
		return this.$el.is(".show-chk");
	};

	// 设置表格空白时显示的视图
	_UIDatagrid.setEmptyView = function (view) {
		this.$el.children(".datagrid-emp").remove();
		renderEmptyView.call(this, $, this.$el, view);
	};

	// 设置点击行时是否选中
	_UIDatagrid.isRowSelectable = function () {
		if (Utils.isNull(this.rowSelectable))
			return true;
		return Utils.isTrue(this.rowSelectable);
	};
	_UIDatagrid.setRowSelectable = function (value) {
		this.rowSelectable = value;
	};

	_UIDatagrid.getItemIndex = function (data) {
		var self = this;
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
		data = HolderBase.doAdapter.call(this, data);
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
		if (isNaN)
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
		var index = this.getItemIndex(data);
		if (index >= 0)
			this.updateItem(data, index);
		else
			this.addItem(data);
	};

	// ====================================================
	// 行数据渲染器
	_UIDatagrid.getRowDataMap = function () {
		return getFunction.call(this, "dataMapper", "mapper");
	};
	_UIDatagrid.setRowDataMap = function (value) {
		this.dataMapper = value;
		this.options.dataMapper = null;
	};

	// 表单元格渲染器
	_UIDatagrid.getColumnRenderer = function () {
		if (this.options.hasOwnProperty("renderer"))
			return this.options.renderer;
		return getFunction.call(this, "columnRenderer", "renderer");
	};
	_UIDatagrid.setColumnRenderer = function (value) {
		this.columnRenderer = value;
		this.options.columnRenderer = null;
		this.options.renderer = null;
	};

	// 行样式
	_UIDatagrid.getRowStyleFunction = function () {
		return getFunction.call(this, "styleFunction", "stylefn");
	};
	_UIDatagrid.setRowStyleFunction = function (value) {
		this.styleFunction = value;
		this.options.styleFunction = null;
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
		else if (this.isMultiple()) {
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
