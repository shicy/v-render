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
	var defaultIcons = {asc: "/VRender/icons/020c.png", desc: "/VRender/icons/021c.png"};

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

		if (this.isChkboxVisible())
			target.attr("opt-chk", "1");

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
			datas = datas.slice(0);

			Utils.each(this._columns, function (column) {
				if (Utils.isTrue(column.filter) && Utils.isNotBlank(column.filterValue)) {

				}
			});

			// var sortColumn = Utils.find(this.__columns, function (column) {
			// 	return Utils.isTrue(column.sortable) && column.sortType;
			// });
			// if (sortColumn) {
			// 	var sortFunction = this._getSortFunction(sortColumn);
			// 	datas = [].concat(datas);
			// 	datas.sort(function (a, b) {
			// 		return sortFunction(sortColumn, a, b, sortColumn.sortType);
			// 	});
			// }
		}

		renderItems.call(this, $, target, datas);
	};

	_Renderer.getItemRenderer = function () {
		return Renderer.rowRenderer;
	};

	_Renderer._getSortFunction = function (column, type) {
		return getSortFunction.call(this, column, type);
	};

	_Renderer._getFilterFunction = function (column, value) {

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
		return this.options.columnRenderer || this.options.renderer;
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

		var self = this;
		Utils.each(columns, function (column, i) {
			var col = $("<th></th>").appendTo(row);

			col.addClass("col-" + i);
			if (Utils.isNotBlank(column.name))
				col.attr("col-name", column.name);//.addClass("col-name-" + column.name);
			if (Utils.isNotBlank(column.dataType))
				col.attr("col-type", column.dataType);

			var title = $("<div class='title'></div>").appendTo(col);
			title.text(column.title || column.name || ("列 " + (i + 1)));

			renderHeaderToolbar.call(self, $, col, column, i);
		});

		// 固定表头
		var header = target.children("header").empty();
		if (this.isHeaderVisible()) {
			header.write("<table><thead>" + thead.html() + "</thead></table>");
		}

		row.find(".toolbar").remove();
	};

	var renderHeaderToolbar = function ($, col, column, index) {
		if (column.sortable || column.filter) {
			var toolbar = $("<div class=toolbar></div>").appendTo(col);

			if (column.sortable) {
				if (column.sortType)
					col.attr("opt-sort", column.sortType);
				// toolbar.append("<div class='sort'><i title='排序'></i></div>");
				renderSortView.call(this, $, toolbar, column);
			}

			if (column.filter) {
				if (column.filterValue)
					col.attr("opt-filter", column.filterValue);
				// toolbar.append("<div class='filter'><i title='筛选'></i></div>");
				renderFilterView.call(this, $, toolbar, column);
			}
		}
	};

	var renderSortView = function ($, toolbar, column) {
		var sortTarget = $("<div class='sort'><i title='排序'></i></div>").appendTo(toolbar);
		// var sortBtn = $("<i title='排序'></i>").appendTo(sortTarget);
		if (Utils.isArray(column.sortable) && column.sortable.length > 0) {
			renderToolDropdown.call(this, $, sortTarget, column.sortable, column.sortType, "无");
		}
	};

	var renderFilterView = function ($, toolbar, column) {
		var filterTarget = $("<div class='filter'><i title='筛选'></i></div>").appendTo(toolbar);
		// var filterBtn = $("<i title='筛选'></i>").appendTo(filterTarget);

		var filterType = column.filter;
		if (filterType == "enum") {
			filterType = getColumnValueSet.call(this, column);
			if (!(filterType && filterType.length > 0))
				filterType = [{label: "无选项", value: ""}];
			else {
				filterType = Utils.map(filterType, function (tmp) {
					return {label: tmp, value: tmp};
				});
			}
		}

		if (Utils.isArray(filterType)) {
			renderToolDropdown.call(this, $, filterTarget, filterType, column.filterValue, "空");
		}
		else {
			var dropdown = $("<div class='dropdown ipt'></div>").appendTo(filterTarget);
			var input = $("<input/>").appendTo(dropdown);
			if (column.filterValue)
				input.val(column.filterValue);
		}
	};

	var renderToolDropdown = function ($, toolBtn, items, value, defLbl) {
		var dropdown = $("<ul class='dropdown'></ul>").appendTo(toolBtn);
		Utils.each(items, function (data) {
			var item = $("<li></li>").appendTo(dropdown);

			var bSelected = false;
			if (data.hasOwnProperty("type")) {
				item.attr("data-type", data.type);
				bSelected = data.type === value;
			}
			if (data.hasOwnProperty("value")) {
				item.attr("data-val", data.value);
				bSelected = data.value === value;
			}

			var icon = $("<i></i>").appendTo(item);
			var iconUrl = data.icon || defaultIcons[data.type];
			if (iconUrl)
				icon.css("backgroundImage", "url(" + iconUrl + ")");

			$("<span></span>").appendTo(item).text(data.label || defLbl);

			if (bSelected) {
				item.addClass("selected");
				var _icon = toolBtn.children("i");
				if (iconUrl)
					_icon.css("backgroundImage", "url(" + iconUrl + ")");
				if (data.label)
					_icon.attr("title", data.label);
			}
		});
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

				if (Utils.isFunction(column.sortFunction))
					column.sortFunction = escape(column.sortFunction);
				else if (Utils.isArray(column.sortable)) {
					Utils.each(column.sortable, function (tmp) {
						if (Utils.isFunction(tmp.handler))
							tmp.handler = escape(tmp.handler);
					});
				}

				if (Utils.isFunction(column.filterFunction))
					column.filterFunction = escape(column.filterFunction);
				else if (Utils.isArray(column.filter)) {
					Utils.each(column.filter, function (tmp) {
						if (Utils.isFunction(tmp.handler))
							tmp.handler = escape(tmp.handler);
					});
				}

				return column;
			});
			target.write("<div class='ui-hidden' name='columns' data='" + JSON.stringify(_columns) + "'></div>");

			ListRenderer.renderFunction(target, "crender", this.getColumnRenderer());
			// ListRenderer.renderFunction(target, "stylefn", this.getRowStyleFunction());

			// var pager = this.options.pager || this.options.paginator;
			// if (pager && Utils.isFunction(pager.getViewId))
			// 	target.attr("data-pager", pager.getViewId());
		}
	};

	var renderItems = function ($, target, datas) {
		var itemContainer = this._getItemContainer($, target);
		if (itemContainer && itemContainer.length > 0) {
			ListRenderer.renderItems.call(this, $, itemContainer.empty(), datas);
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

	// 获取数据集某一列的集合
	var getColumnValueSet = function (column, datas) {
		var set = [];
		var columnName = column && column.name;
		if (columnName) {
			datas = datas || this.getData();
			Utils.each(datas, function (data) {
				var value = data && data[columnName];
				var hasValue = Utils.index(set, function (tmp) {
					return tmp == value;
				});
				if (hasValue < 0)
					set.push(value);
			});
		}
		return set.sort();
	};

	var getFormatColumns = function (columns) {
		var sortColumn = null;
		var formatSortable = function (column, data) {
			if (Utils.isFunction(data.sortFunction))
				column.sortFunction = data.sortFunction;
			else if (Utils.isFunction(data.sortable))
				column.sortFunction = data.sortable;
			if (Utils.isArray(data.sortable)) {
				column.sortable = Utils.map(data.sortable, function (tmp) {
					return {type: tmp.type, label: tmp.label, icon: tmp.icon, handler: tmp.handler, custom: tmp.custom};
				});
			}
			else {
				column.sortable = data.sortable == "custom" ? "custom" : true;
			}
			if (Utils.isNotBlank(data.sortType)) {
				column.sortType = data.sortType;
				if (sortColumn)
					delete sortColumn.sortType;
				sortColumn = column;
			}
		};

		var formatFilterable = function (column, data) {
			if (Utils.isFunction(data.filterFunction))
				column.filterFunction = data.filterFunction;
			else if (Utils.isFunction(data.filter))
				column.filterFunction = data.filter;
			if (Utils.isArray(data.filter)) {
				column.filter = Utils.map(data.filter, function (tmp) {
					return {label: tmp.label, value: tmp.value, icon: tmp.icon, handler: tmp.handler, custom: tmp.custom};
				});
			}
			else {
				column.filter = /^(custom|enum)$/.test(data.filter) ? data.filter : true;
			}
			if (Utils.isNotBlank(data.filterValue))
				column.filterValue = data.filterValue;
		};

		return Utils.map(Utils.toArray(columns), function (column, i) {
			var _column = {};
			if (Utils.isNull(column)) {
				_column.title = "列 " + (i + 1);
			}
			else if (Utils.isPrimitive(column)) {
				if (Utils.isNotBlank(column))
					_column.name = "" + column;
			}
			else {
				if (Utils.isNotBlank(column.name))
					_column.name = "" + column.name;
				if (Utils.isNotBlank(column.title))
					_column.title = "" + column.title;
				if (Utils.isTrue(column.sortable))
					formatSortable(_column, column);
				if (Utils.isTrue(column.filter))
					formatFilterable(_column, column);
			}
			return _column;
		});
	};

	var getSortFunction = function (column, type) {
		if (column) {
			if (Utils.isNotNull(type) && Utils.isArray(column.sortable)) {
				var temp = Utils.findBy(column.sortable, "type", type);
				if (temp && Utils.isFunction(temp.handler)) {
					return function (_column, a, b, sortType) {
						return temp.handler(a, b, sortType);
					};
				}
			}
			if (Utils.isFunction(column.sortFunction)) {
				return function (_column, a, b, sortType) {
					return column.sortFunction(a, b, sortType);
				};
			}
		}
		if (Utils.isFunction(this.options.sortFunction)) {
			var fn = this.options.sortFunction;
			return function (_column, a, b, sortType) {
				return fn(a, b, sortType, _column);
			};
		}
		return defaultSortFucntion;
	};

	var getFilterFunction = function (column, value) {
		if (column) {
			if (Utils.isNotNull(value) && Utils.isArray(column.filter)) {
				var temp = Utils.findBy(column.filter, "value", value);
				if (temp && Utils.isFunction(temp.handler)) {
					return function (_column, _data, _value) {
						return temp.handler(_data, _value);
					};
				}
			}
			if (Utils.isFunction(column.filterFunction)) {
				return function (_column, _data, _value) {
					return column.filterFunction(_data, _value);
				};
			}
		}
		if (Utils.isFunction(this.options.filterFunction)) {
			var fn = this.options.filterFunction;
			return function (_column, _data, _value) {
				return fn(_data, _value, _column);
			};
		}
		return defaultFilterFunction;
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
				else if (!isNaN(value_a) && !isNaN(value_b)) {
					return (parseFloat(value_a) - parseFloat(value_b)) * sortFlag;
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

	var defaultFilterFunction = function (column, data, value) {

	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.dateFormats = dateFormats;
		Renderer.defaultIcons = defaultIcons;
		Renderer.getSortFunction = getSortFunction;
		Renderer.renderItems = renderItems;
		VRender.Component.Render.datagrid = Renderer;
	}

})(typeof VRender === "undefined");