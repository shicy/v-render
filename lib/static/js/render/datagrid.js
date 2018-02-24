// ========================================================
// 数据表格
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.datagrid)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./_base").ListRenderer : VRender.Component.Render._list;

	var dateFormats = {date: "yyyy-MM-dd", datetime: "yyyy-MM-dd HH:mm:ss", time: "HH:mm:ss"};

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		ListRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new ListRenderer();

	// 行渲染
	Renderer.rowRenderer = function ($, item, data, index, bSelected) {
		renderRow.call(this, $, item, this.__columns, data, index, bSelected);
	};
	Renderer.rowRenderer._state = 1; // 内部渲染器标志

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-datagrid");

		var table = $("<div class='table'></div>").appendTo(target);
		table.append("<header></header>");
		table.append("<section><table><thead></thead><tbody></tbody></table></section>");

		var columns = this.__columns = this.getColumns();

		ListRenderer.render.call(this, $, target);
		renderHeader.call(this, $, target, columns);
		renderOthers.call(this, $, target, columns);

		return this;
	};

	_Renderer._getItemContainer = function ($, target) {
		target = target.children(".table").children("section");
		return target.children("table").children("tbody");
	};

	_Renderer._getNewItem = function ($, itemContainer, data, index) {
		return $("<tr></tr>").appendTo(itemContainer);
	};

	_Renderer._renderItems = function ($, target) {
		var datas = this.getData();

		if (datas && datas.length > 0) {
			var sortColumn = null;
			Utils.each(this.__columns, function (column) {
				if (Utils.isTrue(column.sortable) && column.sortType)
					sortColumn = column;
			});

			if (sortColumn) {
				var sortFunction = this._getSortFunction(sortColumn);
				datas = [].concat(datas);
				datas.sort(function (a, b) {
					return sortFunction(sortColumn, a, b, sortColumn.sortType);
				});
			}
		}

		ListRenderer.renderItems.call(this, $, this._getItemContainer($, target), datas);
	};

	_Renderer.getItemRenderer = function () {
		return Renderer.rowRenderer;
	};

	_Renderer._getSortFunction = function (column) {
		if (column && Utils.isFunction(column.sortable)) {
			return function (_column, a, b, sortType) {
				return column.sortable(a, b, sortType);
			};
		}
		if (Utils.isFunction(this.options.sortFunction)) {
			var fn = this.options.sortFunction;
			return function (_column, a, b, sortType) {
				return fn(a, b, sortType, _column);
			};
		}
		return defaultSortFucntion;
	};

	// ====================================================
	_Renderer.getColumns = function () {
		return getFormatColumns(this.options.columns);
	};

	_Renderer.isChkboxVisible = function () {
		return Utils.isTrue(this.options.chkbox);
	};

	_Renderer.isHeaderVisible = function () {
		if (Utils.isBlank(this.options.showHeader))
			return true;
		return Utils.isTrue(this.options.showHeader);
	};

	_Renderer.getColumnRenderer = function () {
		return this.options.columnRenderer;
	};

	_Renderer.getRowStyleFunction = function () {
		return this.options.rowStyleFunction;
	};

	_Renderer.getCellStyleFunction = function () {
		return this.options.cellStyleFunction;
	};

	// ====================================================
	var renderHeader = function ($, target, columns) {
		target = target.children(".table");
		var thead = target.children("section").children("table").children("thead").empty();
		row = $("<tr></tr>").appendTo(thead);
		if (this.isChkboxVisible())
			row.append("<th class='col-chk'><span class='chkbox'></span></th>");
		if (this.isAllSelected())
			row.addClass("selected");

		Utils.each(columns, function (column, i) {
			var col = $("<th></th>").appendTo(row);

			col.addClass("col-" + i);
			if (Utils.isNotBlank(column.name))
				col.attr("col-name", column.name);//.addClass("col-name-" + column.name);
			if (Utils.isNotBlank(column.dataType))
				col.attr("col-type", column.dataType);

			var title = $("<div class='title'></div>").appendTo(col);
			title.text(column.title || column.name || ("列 " + (i + 1)));
		});

		// 固定表头
		var header = target.children("header").empty();
		if (this.isHeaderVisible()) {
			header.write("<table><thead>" + thead.html() + "</thead></table>");
		}
	};

	var renderRow = function ($, row, columns, data, rowIndex, bSelected) {
		if (this.isChkboxVisible())
			row.append("<td class='col-chk'><span class='chkbox'></span></td>");

		var self = this;
		Utils.each(columns, function (column, i) {
			var col = $("<td></td>").appendTo(row);
			renderCell.call(self, $, col, column, data, rowIndex, i);
		});
	};

	var renderCell = function ($, col, column, data, rowIndex, colIndex) {
		col.addClass("col-" + colIndex);
		if (Utils.isNotBlank(column.name))
			col.attr("col-name", column.name);

		var value = null;
		var columnRenderer = this.getColumnRenderer();
		if (Utils.isFunction(columnRenderer)) {
			value = columnRenderer(column.name, data, rowIndex, colIndex, column);
		}
		if (Utils.isNull(value)) {
			value = getDefaultValue.call(this, column, data, colIndex);
		}
		if (Utils.isBlank(value))
			value = "&nbsp;";

		if (backend) {
			if (Utils.isFunction(value.render))
				value.render(col);
			else
				col.append(value.$el || value);
		}
		else {
			col.append(value);
		}
	};

	var renderEmptyView = function ($, target) {
		var emptyView = this.options.empty;
		if (Utils.isNotBlank(emptyView)) {
			target = $("<div class='datagrid-emp'></div>").appendTo(target);
			if (typeof emptyView === "string") {
				backend ? target.write(emptyView) : target.append(emptyView);
			}
			else if (!backend && (emptyView instanceof VRender.Component.base)) {
				emptyView.$el && emptyView.$el.appendTo(target);
			}
			else if (Utils.isFunction(emptyView.render))
				emptyView.render(target);
			else
				target.text(emptyView);
		}
	};

	var renderOthers = function ($, target, columns) {
		if (backend) {
			var _columns = Utils.map(columns, function (temp) {
				var column = Utils.extend({}, temp);
				if (Utils.isFunction(column.sortable))
					column.sortable = escape(column.sortable);
				return column;
			});
			target.write("<div class='ui-hidden' name='columns' data='" + JSON.stringify(_columns) + "'></div>");
			// ListRenderer.renderFunction(target, "renderer", this.getColumnRenderer());
			// ListRenderer.renderFunction(target, "stylefn", this.getRowStyleFunction());

			// var pager = this.options.pager || this.options.paginator;
			// if (pager && Utils.isFunction(pager.getViewId))
			// 	target.attr("data-pager", pager.getViewId());
		}
	};

	// 组件内置默认获取表单元格内容的方法
	var getDefaultValue = function (column, data, index) {
		if (Utils.isBlank(data))
			return null;
		if (Utils.isBlank(column.name))
			return "" + data;
		var value = data[column.name];
		if (column.dataType && /*column.format && */Utils.isNotBlank(value)) {
			var type = column.dataType;
			if (type === "localtime")
				value = Utils.toLocalDateString(Utils.toDate(value));
			else if (/^(date|datetime|time)$/.test(type)) {
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

	var getFormatColumns = function (columns) {
		return Utils.map(Utils.toArray(columns), function (column, i) {
			if (Utils.isNull(column))
				return {title: ("列 " + (i + 1))};
			if (typeof column == "string")
				return {name: column};
			return column;
		});
	};

	var defaultSortFucntion = function (column, a, b, sortType) {
		if (/^(asc|desc)$/i.test(sortType)) {
			var columnName = column.name;
			var dataType = column.dataType;
			var sortFlag = /^asc$/i.test(sortType) ? 1 : -1;

			var value_a = (columnName && a) ? a[columnName] : null;
			var value_b = (columnName && b) ? b[columnName] : null;
			
			if (Utils.isNotNull(value_a) && Utils.isNotNull(value_b)) {
				if (/^(date|datetime|time)$/.test(dataType)) {
					value_a = Utils.toDate(value_a);
					value_b = Utils.toDate(value_b);
					value_a = value_a ? value_a.getTime() : 0;
					value_b = value_b ? value_b.getTime() : 0;
					return (value_a - value_b) * sortFlag;
				}
				else if (/^(num|number)$/.test(dataType)) {
					return (value_a - value_b) * sortFlag;
				}
				value_a = "" + value_a;
				value_b = "" + value_b;
				return value_a.localeCompare(value_b) * sortFlag;
			}
			else if (Utils.isNotNull(value_a)) {
				return sortFlag;
			}
			else if (Utils.isNotNull(value_b)) {
				return 0 - sortFlag;
			}
		}
		return 0;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.datagrid = Renderer;
	}

})(typeof VRender === "undefined");