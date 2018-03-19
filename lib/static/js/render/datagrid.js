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

		var height = Utils.getFormatSize(this.options.height, this.isRenderAsRem());
		if (height)
			target.css("height", height);

		if (this.isChkboxVisible())
			target.attr("opt-chk", "1");

		var expandColspan = parseInt(this.options.expandcols);
		if (expandColspan)
			target.attr("opt-expcols", expandColspan);

		var table = $("<div class='table'></div>").appendTo(target);
		table.append("<header></header>");
		table.append("<section><table><thead></thead><tbody></tbody></table></section>");

		var columns = this.__columns = this.getColumns();

		ListRenderer.render.call(this, $, target);
		renderHeader.call(this, $, target, columns);
		renderOthers.call(this, $, target, columns);
		renderPaginator.call(this, $, target);
		renderEmptyView.call(this, $, target);
		renderLoadView.call(this, $, target);

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
		var indexs = null;

		if (datas && datas.length > 0) {
			var _datas = datas.slice(0);

			// doFilter
			var self = this;
			Utils.each(this.__columns, function (column) {
				if (Utils.isTrue(column.filter) && Utils.isNotBlank(column.filterValue)) {
					var filterFunction = self._getFilterFunction(column, column.filterValue);
					_datas = Utils.filter(_datas, function (data, i) {
						return filterFunction(column, data, column.filterValue);
					});
				}
			});

			// doSort
			var sortColumn = Utils.find(this.__columns, function (column) {
				return Utils.isTrue(column.sortable) && column.sortType;
			});
			if (sortColumn) {
				var sortFunction = this._getSortFunction(sortColumn, sortColumn.sortType);
				_datas.sort(function (a, b) {
					return sortFunction(sortColumn, a, b, sortColumn.sortType);
				});
			}

			indexs = Utils.map(_datas, function (data) {
				return Utils.index(datas, function (temp) {
					return temp == data;
				});
			});
			datas = _datas;
		}

		renderItems.call(this, $, target, datas, indexs);
	};

	_Renderer.getItemRenderer = function () {
		return Renderer.rowRenderer;
	};

	_Renderer._getSortFunction = function (column, type) {
		return getSortFunction.call(this, column, type);
	};

	_Renderer._getFilterFunction = function (column, value) {
		return getFilterFunction.call(this, column, value);
	};

	_Renderer._hasExpand = function () {
		return Utils.index(this.__columns, function (column) {
			return !!column.expand;
		}) >= 0;
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

	_Renderer.getPaginator = function () {
		return this.options.paginator || this.options.pager;
	};

	_Renderer.getHeadRenderer = function () {
		return this.options.headRenderer;
	},

	_Renderer.getColumnRenderer = function () {
		return this.options.columnRenderer || this.options.renderer;
	};

	_Renderer.getExpandRenderer = function () {
		return this.options.expandRenderer;
	};

	_Renderer.getRowStyleFunction = function () {
		return this.options.rowStyleFunction;
	};

	_Renderer.getCellStyleFunction = function () {
		return this.options.cellStyleFunction;
	};

	// ====================================================
	var renderHeader = function ($, target, columns) {
		if (this.isHeaderVisible()) {
			target = target.removeClass("no-head").children(".table");
			var thead = target.children("section").children("table").children("thead").empty();
			row = $("<tr></tr>").appendTo(thead);
			if (this._hasExpand()) 
				row.append("<th class='col-exp'></th>");
			if (this.isChkboxVisible())
				row.append("<th class='col-chk'><span class='chkbox'></span></th>");
			if (this.isAllSelected())
				row.addClass("selected");

			var self = this;
			Utils.each(columns, function (column, i) {
				if (column.expand)
					return ;

				var col = $("<th></th>").appendTo(row);

				col.addClass("col-" + i);
				if (Utils.isNotBlank(column.name))
					col.attr("col-name", column.name);//.addClass("col-name-" + column.name);
				if (Utils.isNotBlank(column.dataType))
					col.attr("col-type", column.dataType);

				var width = Utils.getFormatSize(column.width, self.isRenderAsRem());
				if (width)
					col.css("width", width);

				renderHeaderView.call(self, $, col, column, i);
				renderHeaderToolbar.call(self, $, col, column, i);
			});

			// 固定表头
			var header = target.children("header").empty();
			header.write("<table><thead>" + thead.html() + "</thead></table>");

			row.find(".toolbar").remove();
		}
		else {
			target.addClass("no-head");
		}
	};

	var renderHeaderView = function ($, col, column, index) {
		if (!column.html) {
			var headRenderer = this.getHeadRenderer();
			if (Utils.isFunction(headRenderer)) {
				var headView = headRenderer(column, index);
				if (headView) {
					if (backend && Utils.isFunction(headView.render))
						headView.render(col);
					else
						col.append(headView.$el || headView);
					return ;
				}
			}
		}

		if (column.icon)
			$("<i>&nbsp;</i>").appendTo(col).css("backgroundImage", "url(" + column.icon + ")");

		var title = $("<div class='title'></div>").appendTo(col);
		if (column.html)
			title.html(column.html);
		else
			title.text(column.title || column.name || ("列 " + (index + 1)));
	};

	var renderHeaderToolbar = function ($, col, column, index) {
		if (column.sortable || column.filter) {
			var toolbar = $("<div class=toolbar></div>").appendTo(col);

			if (column.sortable) {
				if (column.sortType)
					col.attr("opt-sort", column.sortType);
				renderSortView.call(this, $, toolbar, column);
			}

			if (column.filter) {
				if (column.filterValue)
					col.attr("opt-filter", column.filterValue);
				renderFilterView.call(this, $, toolbar, column);
			}
		}
	};

	var renderSortView = function ($, toolbar, column) {
		var sortTarget = $("<div class='sort'><i title='排序'></i></div>").appendTo(toolbar);
		if (Utils.isArray(column.sortable) && column.sortable.length > 0) {
			renderToolDropdown.call(this, $, sortTarget, column.sortable, column.sortType, "无");
		}
	};

	var renderFilterView = function ($, toolbar, column) {
		var filterTarget = $("<div class='filter'><i title='筛选'></i></div>").appendTo(toolbar);

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

	// ====================================================
	var renderItems = function ($, target, datas, indexs) {
		var itemContainer = this._getItemContainer($, target).empty();

		var selectedIndex = this.getSelectedIndex(true);
		var selectedId = this.getSelectedId(true) || [];
		
		var self = this;
		Utils.each(datas, function (data, i) {
			var index = indexs ? indexs[i] : i;
			var item = self._getNewItem($, itemContainer, data, index);
			if (item) {
				var bSelected = self._isSelected(data, index, selectedIndex, selectedId);
				self._renderOneItem($, item, data, index, bSelected);
			}
		});
	};

	var renderRow = function ($, row, columns, data, rowIndex, bSelected) {
		var rowStyleFunction = this.getRowStyleFunction();
		if (Utils.isFunction(rowStyleFunction)) {
			var styles = rowStyleFunction(data, rowIndex);
			if (styles)
				row.css(styles);
		}

		if (this._hasExpand())
			row.append("<td class='col-exp'><span class='expbtn'></span></td>");

		if (this.isChkboxVisible())
			row.append("<td class='col-chk'><span class='chkbox'></span></td>");

		var self = this;
		Utils.each(columns, function (column, i) {
			if (!column.expand) {
				var col = $("<td></td>").appendTo(row);
				renderCell.call(self, $, col, column, data, rowIndex, i);
			}
		});
	};

	var renderCell = function ($, col, column, data, rowIndex, colIndex) {
		var cellStyleFunction = this.getCellStyleFunction();
		if (Utils.isFunction(cellStyleFunction)) {
			var styles = cellStyleFunction(column.name, data, rowIndex, colIndex);
			if (styles)
				col.css(styles);
		}

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

		if (backend && Utils.isFunction(value.render)) {
			value.render(col);
		}
		else {
			col.append(value.$el || value);
		}
	};

	// ====================================================
	var renderPaginator = function ($, target) {
		if (backend) {
			ListRenderer.renderPager.call(this, target, this.getPaginator());
		}
	};

	var renderEmptyView = function ($, target) {
		ListRenderer.renderEmptyView.call(this, $, target, "datagrid");
	};

	var renderLoadView = function ($, target) {
		ListRenderer.renderLoadView.call(this, $, target, "datagrid");
	};

	// ====================================================
	var renderOthers = function ($, target, columns) {
		if (backend) {
			var _columns = Utils.map(columns, function (temp) {
				var column = Utils.extend({}, temp);

				if (column.html)
					column.html = escape(column.html);

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

			ListRenderer.renderFunction(target, "hrender", this.getHeadRenderer());
			ListRenderer.renderFunction(target, "crender", this.getColumnRenderer());
			ListRenderer.renderFunction(target, "erender", this.getExpandRenderer());
			ListRenderer.renderFunction(target, "rstyle", this.getRowStyleFunction());
			ListRenderer.renderFunction(target, "cstyle", this.getCellStyleFunction());

			// var pager = this.options.pager || this.options.paginator;
			// if (pager && Utils.isFunction(pager.getViewId))
			// 	target.attr("data-pager", pager.getViewId());
		}
	};

	// ====================================================
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

	// ====================================================
	var getFormatColumns = function (columns) {
		columns = Utils.map(Utils.toArray(columns), formatOneColumn);
		var sortColumn = null;
		var isAllExpand = true;
		Utils.each(columns, function (column) {
			if (column.sortType) { // 只允许一个列排序
				if (sortColumn)
					sortColumn.sortType = null;
				sortColumn = column;
			}
			if (!column.expand)
				isAllExpand = false;
		});
		if (isAllExpand && columns.length > 0)
			columns[0].expand = false;
		return columns;
	};

	var formatOneColumn = function (column, index) {
		var _column = {};
		if (Utils.isNull(column)) {
			_column.title = "列 " + (index + 1);
		}
		else if (Utils.isPrimitive(column)) {
			_column.name = Utils.trimToEmpty(column);
		}
		else {
			_column.name = Utils.trimToEmpty(column.name);
			_column.title = Utils.trimToNull(column.title);
			_column.html = Utils.trimToNull(column.focusHtmlTitle);
			_column.icon = Utils.trimToNull(column.icon);
			_column.width = Utils.trimToNull(column.width);
			_column.expand = Utils.isTrue(column.expand);

			if (Utils.isTrue(column.sortable))
				formatColumnSortable(_column, column);
			if (Utils.isTrue(column.filter))
				formatColumnFilterable(_column, column);
		}
		return _column;
	};

	var formatColumnSortable = function (column, data) {
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
		column.sortType = Utils.trimToNull(data.sortType);
	};

	var formatColumnFilterable = function (column, data) {
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
		column.filterValue = Utils.trimToNull(data.filterValue);
	};

	// ====================================================
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
		if (column && column.name && /^(asc|desc)$/i.test(sortType)) {
			var value_a = a ? a[column.name] : null;
			var value_b = b ? b[column.name] : null;

			var result = (function () {
				if (Utils.isNull(value_a))
					return Utils.isNull(value_b) ? 0 : -1;
				if (Utils.isNull(value_b))
					return Utils.isNull(value_a) ? 0 : 1;
				var dataType = column.dataType;
				if (/date/i.test(dataType)) {
					value_a = Utils.toDate(value_a);
					value_b = Utils.toDate(value_b);
					if (!value_a)
						return value_b ? 1 : 0;
					if (!value_b)
						return value_a ? -1 : 0;
					var format = /^date$/i.test(dataType) ? "yyyyMMddHHmmss" : "yyyyMMdd";
					value_a = Utils.toDateString(value_a, format);
					value_b = Utils.toDateString(value_b, format);
					return value_a < value_b ? -1 : (value_a > value_b ? 1 : 0);
				}
				if (/num/i.test(dataType) || !(isNaN(value_a) || isNaN(value_b))) {
					return parseFloat(value_a) - parseFloat(value_b);
				}
				return value_a.localeCompare(value_b);
			})();

			return result * (/^asc$/i.test(sortType) ? 1 : -1);
		}
		return 0;
	};

	var defaultFilterFunction = function (column, data, value) {
		if (!(column || column.name))
			return true; // 没有列信息，不做筛选
		if (Utils.isNull(data))
			return false;
		var _value = data[column.name];
		if (_value === value)
			return true;
		var dataType = column.dataType;
		if (/date/i.test(dataType)) {
			value = Utils.toDate(value);
			if (!value)
				return true; // 不是日期（先不筛选）
			_value = Utils.toDate(_value);
			if (_value) {
				var format = /^date$/i.test(dataType) ? "yyyyMMdd" : "yyyyMMddHHmmss";
				value = Utils.toDateString(value, format);
				_value = Utils.toDateString(_value, format);
				return _value.indexOf(value) === 0;
			}
			return false;
		}
		if (Utils.isNull(_value))
			return Utils.isNull(value);
		if (Utils.isNull(value))
			return Utils.isNull(_value);
		if (/num/i.test(dataType) || !(isNaN(value) || isNaN(_value))) {
			return parseFloat(value) == parseFloat(_value);
		}
		if (value == _value)
			return true;
		value = Utils.trimToEmpty(value);
		_value = Utils.trimToEmpty(_value);
		return _value.indexOf(value) >= 0;
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

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.dateFormats = dateFormats;
		Renderer.defaultIcons = defaultIcons;
		Renderer.getSortFunction = getSortFunction;
		Renderer.getFilterFunction = getFilterFunction;
		Renderer.renderItems = renderItems;
		Renderer.renderCell = renderCell;
		VRender.Component.Render.datagrid = Renderer;
	}

})(typeof VRender === "undefined");