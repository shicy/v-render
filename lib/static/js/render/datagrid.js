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

		// if (this.isChkboxVisible())
		// 	target.addClass("show-chk");
		// if (this.isMultiple())
		// 	target.attr("multiple", "multiple");
		// if (!this.isHeaderVisible())
		// 	target.addClass("no-head");

		// var table = $("<table></table>").appendTo(target);
		// renderHeader.call(this, $, target, table);
		// renderContent.call(this, $, target, table);
		// renderEmptyView.call(this, $, target);
		// renderOthers.call(this, $, target);

		return this;
	};

	_Renderer._getItemContainer = function ($, target) {
		target = target.children(".table").children("section");
		return target.children("table").children("tbody");
	};

	_Renderer._getNewItem = function ($, itemContainer, data, index) {
		return $("<tr></tr>").appendTo(itemContainer);
	};

	_Renderer.getItemRenderer = function () {
		return Renderer.rowRenderer;
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
		if (backend) {
			target.write("<div class='ui-hidden' name='columns' data='" + JSON.stringify(columns) + "'></div>");
		}

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
			if (Utils.isNotBlank(column.type))
				col.attr("col-type", column.type);

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

	var renderOthers = function ($, target) {
		if (backend) {
			ListRenderer.renderFunction(target, "renderer", this.getColumnRenderer());
			ListRenderer.renderFunction(target, "stylefn", this.getRowStyleFunction());

			var pager = this.options.pager || this.options.paginator;
			if (pager && Utils.isFunction(pager.getViewId))
				target.attr("data-pager", pager.getViewId());
		}
	};

	// var renderRow = function ($, row, columns, data, index) {
		// renderRowAttrs.call(this, row, data, index);

		// if (this.isChkboxVisible())
		// 	row.append("<td class='col-type-chk'><span class='chkbox'></span></td>");
		// if (this.isDataSelected(data, index))
		// 	row.addClass("selected");

		// var self = this;
		// Utils.each(columns, function (column, i) {
		// 	var col = $("<td></td>").appendTo(row);
		// 	renderCell.call(self, $, col, column, data, i);
		// });

		// var rowStyle = data.__rowstyle__;
		// var styleFunction = this.getRowStyleFunction();
		// if (Utils.isFunction(styleFunction))
		// 	rowStyle = styleFunction(data, index);
		// if (Utils.isNotBlank(rowStyle))
		// 	row.addClass(rowStyle);
	// };

	// var renderRowAttrs = function (row, data, index) {
	// 	if (backend) {
	// 		var attrs = this.getMapData(data) || {id: this.getDataId(data)};
	// 		for (var n in attrs) {
	// 			row.attr("data-" + n, attrs[n]);
	// 		}
	// 	}
	// 	else {
	// 		row.data("itemData", data);
	// 	}
	// };

	// var renderCell = function ($, col, column, data, index) {
	// 	col.addClass("col-" + (index + 1));
	// 	if (Utils.isNotBlank(column.name))
	// 		col.addClass("col-" + column.name);
	// 	var value = null;
	// 	var columnRenderer = this.getColumnRenderer();
	// 	if (Utils.isFunction(columnRenderer))
	// 		value = columnRenderer(column.name, data, index, column);
	// 	if (Utils.isNull(value))
	// 		value = getDefaultValue.call(this, column, data, index);
	// 	value = Utils.isBlank(value) ? "&nbsp;" : value;
	// 	backend ? col.write(value) : col.html(value);
	// };

	// 组件内置默认获取表单元格内容的方法
	var getDefaultValue = function (column, data, index) {
		if (Utils.isBlank(data))
			return null;
		if (Utils.isBlank(column.name))
			return "" + data;
		var value = data[column.name];
		if (column.type && /*column.format && */Utils.isNotBlank(value)) {
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

	var getFormatColumns = function (columns) {
		return Utils.map(Utils.toArray(columns), function (column, i) {
			if (Utils.isNull(column))
				return {title: ("列 " + (i + 1))};
			if (typeof column == "string")
				return {name: column};
			return column;
		});
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.datagrid = Renderer;
	}

})(typeof VRender === "undefined");