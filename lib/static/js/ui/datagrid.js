// ========================================================
// 数据表格
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

(function () {
	if (VRender.Component.Datagrid)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var DatagridRender = Component.Render.datagrid;

	///////////////////////////////////////////////////////
	var UIDatagrid = window.UIDatagrid = Component.Datagrid = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.__columns = this.getColumns(); // 解析一次
		console.log(this.getColumns());
		
		this.header = this.$el.children(".table").children("header");
		this.header.on("tap", "th.col-chk", allChkboxClickHandler.bind(this));
		this.header.on("tap", ".toolbar > *", toolbtnClickHandler.bind(this));
		this.header.on("tap", ".toolbar .dropdown li", toolDropdownClickHandler.bind(this));

		var itemContainer = this._getItemContainer();
		itemContainer.on("tap", "tr", itemClickHandler.bind(this));
		itemContainer.on("tap", "td.col-exp .expbtn", onExpandBtnHandler.bind(this));

		if (this.isRenderAsApp()) {
		}
		else {
			this.header.on("mouseenter", ".toolbar > *", toolbtnMouseHandler.bind(this));
			this.header.on("mouseleave", ".toolbar > *", toolbtnMouseHandler.bind(this));
		}

		doInit.call(this);

		startLayoutChangeMonitor.call(this);
	};
	var _UIDatagrid = UIDatagrid.prototype = new Component.list();

	UIDatagrid.find = function (view) {
		return Component.find(view, ".ui-datagrid", UIDatagrid);
	};

	UIDatagrid.create = function (options) {
		return Component.create(options, UIDatagrid, DatagridRender);
	};

	// ====================================================
	_UIDatagrid.getColumns = function () {
		if (this.options.hasOwnProperty("columns"))
			return this.options.columns;

		var getFunc = function (value) {
			return (new Function("var Utils=VRender.Utils;return (" + unescape(value) + ");"))();
		};

		var columns = this.$el.children("[name='columns']");
		if (columns && columns.length > 0) {
			try {
				columns = JSON.parse(columns.remove().attr("data"));
				Utils.each(columns, function (column) {
					if (column.html)
						column.html = unescape(column.html);

					if (/^function/.test(column.sortable)) {
						column.sortable = getFunc(column.sortable);
					}
					else if (Utils.isArray(column.sortable)) {
						Utils.each(column.sortable, function (temp) {
							if (/^function/.test(temp.handler))
								temp.handler = getFunc(temp.handler);
						});
					}
					if (/^function/.test(column.sortFunction))
						column.sortFunction = getFunc(column.sortFunction);
					
					if (/^function/.test(column.filter))
						column.filter = getFunc(column.filter);
					else if (Utils.isArray(column.filter)) {
						Utils.each(column.filter, function (temp) {
							if (/^function/.test(temp.handler))
								temp.handler = getFunc(temp.handler);
						});
					}
					if (/^function/.test(column.filterFunction))
						column.filterFunction = getFunc(column.filterFunction);
				});
			}
			catch (e) {
				columns = [];
			};
		}
		else {
			columns = [];
		}

		this.options.columns = columns;
		return this.options.columns;
	};

	_UIDatagrid.setColumns = function (value) {
		this.options.columns = Utils.toArray(value);
		// this.$el.children("[name='columns']").remove();
	};

	_UIDatagrid.isHeaderVisible = function () {
		return true;
	};

	_UIDatagrid.isChkboxVisible = function () {
		return this.$el.attr("opt-chk") == "1";
	};

	_UIDatagrid.getPaginator = function () {
		return Component.list.getPager.call(this);
	};

	_UIDatagrid.setPaginator = function (pager) {
		Component.list.setPager.call(this, pager);
	};

	_UIDatagrid.getItemRenderer = function () {
		return DatagridRender.rowRenderer;
	};

	_UIDatagrid.getHeadRenderer = function () {
		return Component.list.getFunction.call(this, "headRenderer", "hrender");
	};

	_UIDatagrid.getColumnRenderer = function () {
		if (this.options.hasOwnProperty("renderer"))
			return this.options.renderer;
		return Component.list.getFunction.call(this, "columnRenderer", "crender");
	};

	_UIDatagrid.getExpandRenderer = function () {
		return Component.list.getFunction.call(this, "expandRenderer", "erender");
	};

	_UIDatagrid.getExpandColspan = function () {
		return parseInt(this.$el.attr("opt-expcols")) || 0;
	};

	_UIDatagrid.getRowStyleFunction = function () {
		return Component.list.getFunction.call(this, "rowStyleFunction", "rstyle");
	};

	_UIDatagrid.getCellStyleFunction = function () {
		return Component.list.getFunction.call(this, "cellStyleFunction", "cstyle");
	};

	// ====================================================
	_UIDatagrid.sort = function (column, type, sortFunction) {
		if (Utils.isFunction(column)) {
			sortFunction = column;
			column = type = null;
		}
		if (Utils.isFunction(type)) {
			sortFunction = type;
			type = null;
		}
		if (column)
			column = getColumnInfo.call(this, ("" + column));
		doSort.call(this, column, type, sortFunction);
	};

	_UIDatagrid.filter = function (column, value, filterFunction) {
		if (Utils.isFunction(column)) {
			filterFunction = column;
			column = value = null;
		}
		if (Utils.isFunction(value)) {
			filterFunction = value;
			value = null;
		}
		if (column)
			column = getColumnInfo.call(this, ("" + column));
		doFilter.call(this, column, value, filterFunction);
	};

	// ====================================================
	_UIDatagrid._getItemContainer = function () {
		if (!this.itemContainer)
			this.itemContainer = this.$el.children(".table").children("section").children("table").children("tbody");
		return this.itemContainer;
	};

	_UIDatagrid._getNewItem = function ($, itemContainer, data, index) {
		return $("<tr></tr>").appendTo(itemContainer);
	};

	_UIDatagrid._getSortFunction = function (column, type) {
		return DatagridRender.getSortFunction.call(this, column, type);
	};

	_UIDatagrid._getFilterFunction = function (column, value) {
		return DatagridRender.getFilterFunction.call(this, column, value);
	};

	_UIDatagrid._hasExpand = function () {
		return Utils.index(this.__columns, function (column) {
			return !!column.expand;
		}) >= 0;
	};

	// ====================================================
	var itemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.parent().is(this._getItemContainer())) {
			if (item.is(".disabled"))
				return ;

			var snapshoot = this._snapshoot();

			if (item.is(".selected")) {
				item.removeClass("selected");
			}
			else {
				item.addClass("selected");
				if (!this.isMultiple())
					item.siblings().removeClass("selected");
			}

			var indexs = Utils.map(this._getItems(".selected"), function (item) {
				return item.index();
			});
			Component.list.setSelectedIndex.call(this, indexs);

			if (!snapshoot.compare())
				selectedChanged.call(this);

			snapshoot.done();
		}
	};

	var allChkboxClickHandler = function (e) {
		var header = this.header.find("tr");
		var selectedIndex = [];
		if (header.is(".selected")) {
			header.removeClass("selected");
		}
		else {
			header.addClass("selected");
			for (var i = 0, l = this.length(); i < l; i++) {
				selectedIndex.push(i);
			}
		}
		this.setSelectedIndex(selectedIndex);
	};

	var onExpandBtnHandler = function (e) {
		var item = $(e.currentTarget).parent().parent();
		if (item.parent().is(this._getItemContainer())) {
			if (item.is(".disabled"))
				return false;

			if (item.is(".expand")) {
				item.removeClass("expand");
				item.next().remove();
			}
			else {
				item.addClass("expand");
				var index = item.index();
				var data = this._getItemData(item, index);
				renderExpandView.call(this, $, item, data, index);
			}

			return false;
		}
	};

	var toolbtnClickHandler = function (e) {
		var btn = $(e.currentTarget);
		var col = btn.parent().parent();
		var column = getColumnInfo.call(this, col.attr("col-name"));

		var dropdown = btn.children(".dropdown");
		if (dropdown && dropdown.length > 0) {
			btn.addClass("show-dropdown");
			if (dropdown.is(".ipt")) {
				var input = dropdown.find("input").focus();
				input.off("keydown").on("keydown", filterInputKeyHandler.bind(this));
			}
		}
		else if (btn.is(".sort")) {
			var sortType = col.attr("opt-sort");
			sortType = sortType == "desc" ? null : (sortType == "asc" ? "desc" : "asc");
			doSort.call(this, column, sortType);
		}
		else if (btn.is(".filter")) {
			// 默认都有 dropdown
		}
	};

	var toolbtnMouseHandler = function (e) {
		var btn = $(e.currentTarget);
		var timerId = parseInt(btn.attr("opt-t")) || 0;
		if (timerId) {
			clearTimeout(timerId);
			btn.removeAttr("opt-t");
		}
		if (e.type == "mouseleave") {
			timerId = setTimeout(function () {
				btn.removeClass("show-dropdown");
				btn.removeAttr("opt-t");
				if (btn.is(".filter")) {
					var input = btn.find("input");
					if (input && input.length > 0)
						VRender.onInputChange(input, null);
				}
			}, 400);
			btn.attr("opt-t", timerId);
		}
	};

	var toolDropdownClickHandler = function (e) {
		var item = $(e.currentTarget);
		var toolbtn = item.parent().parent();
		var col = toolbtn.parent().parent();
		var column = getColumnInfo.call(this, col.attr("col-name"));

		var timerId = parseInt(toolbtn.attr("opt-t")) || 0;
		if (timerId)
			clearTimeout(timerId);
		toolbtn.removeClass("show-dropdown").removeAttr("opt-t");

		if (toolbtn.is(".sort")) {
			doSort.call(this, column, (item.is(".selected") ? null : item.attr("data-type")));
		}
		else if (toolbtn.is(".filter")) {
			doFilter.call(this, column, (item.is(".selected") ? null : item.attr("data-val")));
		}

		return false;
	};

	var filterInputKeyHandler = function (e) {
		if (e.which == 13) { console.log(e);
			var input = $(e.currentTarget);
			var colName = Utils.parentUntil(input, "th").attr("col-name");
			if (colName) {
				var column = getColumnInfo.call(this, colName);
				doFilter.call(this, column, input.val() || null);
			}
		}
	};

	// ====================================================
	var renderExpandView = function ($, row, data, rowIndex) {
		var expandRow = $("<tr class='row-expand'></tr>").insertAfter(row);
		var expandCell = $("<td></td>").appendTo(expandRow);
		expandCell.attr("colspan", row.children().length);
		var container = $("<div class='container'></div>").appendTo(expandCell);

		var expandRender = this.getExpandRenderer();
		if (Utils.isFunction(expandRender)) {
			var expandView = expandRender(data, rowIndex);
			if (Utils.isNotNull(expandView)) {
				container.append(expandView.$el || expandView);
			}
		}
		else {
			var self = this;
			var expandView = $("<div class='datagrid-expand'></div>").appendTo(container);
			expandView.attr("cols", this.getExpandColspan());
			Utils.each(this.__columns, function (column, i) {
				if (Utils.isTrue(column.expand)) {
					var item = $("<div></div>").appendTo(expandView);
					item.addClass("col-" + i).attr("col-name", column.name);
					item = $("<dl></dl>").appendTo(item);
					$("<dt></dt>").appendTo(item).text(column.title || column.name || "");
					var content = $("<dd></dd>").appendTo(item);
					DatagridRender.renderCell.call(self, $, content, column, data, rowIndex, i);
					item.removeClass("col-" + i).removeAttr("col-name");
				}
			});
		}
	};

	// ====================================================
	var doInit = function () {
		this.$el.children("[name='irender']").remove();
	};

	// 排序互斥，即只能有一个排序方法
	var doSort = function (column, sortType, sortFunction) {
		var cols = this.header.children("table").children("thead").children("tr").children("th");
		cols.removeAttr("opt-sort");
		cols.find(".sort > i").css("backgroundImage", "");
		cols.find(".sort .dropdown li").removeClass("selected");

		if (column && column.name && Utils.isNotNull(sortType)) {
			var col = cols.filter("[col-name='" + column.name + "']");
			if (col && col.length > 0) {
				col.attr("opt-sort", sortType);
				var icon = DatagridRender.defaultIcons[sortType];
				if (Utils.isArray(column.sortable)) {
					col.find(".sort li[data-type='" + sortType + "']").addClass("selected");
					var sortItem = Utils.findBy(column.sortable, "type", sortType);
					icon = sortItem && sortItem.icon || icon;
				}
				if (icon)
					col.find(".sort > i").css("backgroundImage", "url(" + icon + ")");
			}
		}

		this.currentSort = {column: column, type: sortType, fn: sortFunction};
		if (Utils.isFunction(sortFunction)) {
			var _sortFunction = sortFunction;
			this.currentSort.fn = function (column, a, b, sortType) {
				return _sortFunction(a, b, sortType, column);
			};
		}
		else if (Utils.isNotNull(sortType) && !(column && column.sortable == "custom")) {
			this.currentSort.fn = this._getSortFunction(column, sortType);
		}

		if (Utils.isFunction(this.currentSort.fn) || !(column && column.sortable == "custom"))
			renderBySortAndFilter.call(this);

		this.trigger("sort", (column && column.name), sortType);
	};

	// 设置某一列筛选，不影响其他列筛选
	var doFilter = function (column, filterValue, filterFunction) {
		var isNullValue = Utils.isNull(filterValue) || filterValue === false;
		if (column && column.name) {
			var cols = this.header.children("table").children("thead").children("tr").children("th");
			var col = cols.filter("[col-name='" + column.name + "']");
			if (col && col.length > 0) {
				col.removeAttr("opt-filter");
				col.find(".filter > i").css("backgroundImage", "");
				col.find(".filter li").removeClass("selected");
				if (!isNullValue || Utils.isFunction(filterFunction)) {
					col.attr("opt-filter", (isNullValue ? true : filterValue));
					if (col.find(".filter .dropdown").is(".ipt")) {
						col.find(".filter input").val(isNullValue ? "" : filterValue);
					}
					else if (!isNullValue) {
						col.find(".filter li[data-val='" + filterValue + "']").addClass("selected");
					}
				}
			}
		}

		if (Utils.isFunction(filterFunction)) {
			var _filterFunction = filterFunction;
			filterFunction = function (_column, _data, _value) {
				return _filterFunction(_data, _value, _column);
			};
		}
		else if (!isNullValue && !(column && column.filter == "custom")) {
			filterFunction = this._getFilterFunction(column, filterValue);
		}

		var colName = column && column.name || ""
		if (this.currentFilters) {
			if (!isNullValue || Utils.isFunction(filterFunction)) {
				var filter = Utils.findBy(this.currentFilters, "name", colName);
				if (!filter) {
					filter = {name: colName, column: column};
					this.currentFilters.push(filter);
				}
				filter.value = filterValue;
				filter.fn = filterFunction;
			}
			else {
				Utils.removeBy(this.currentFilters, "name", colName);
			}
		}

		if (!(column && column.filter == "custom"))
			renderBySortAndFilter.call(this, true);

		this.trigger("filter", colName, filterValue);
	};

	var renderBySortAndFilter = function (hasFilterChanged) {
		if (hasFilterChanged || this.lastFilterDatas == null) {
			var datas = this.getData();
			if (datas && datas.length > 0) {
				if (this.currentFilters == null)
					initCurrentFilters.call(this);
				Utils.each(this.currentFilters, function (filter) {
					datas = Utils.filter(datas, function (data) {
						return filter.fn(filter.column, data, filter.value);
					});
				});
			}
			this.lastFilterDatas = datas || [];
		}
		var datas = this.lastFilterDatas;
		if (this.currentSort && Utils.isFunction(this.currentSort.fn)) {
			var _sort = this.currentSort;
			datas = datas.slice(0).sort(function (a, b) {
				return _sort.fn(_sort.column, a, b, _sort.type);
			});
		}
		DatagridRender.renderItems.call(this, $, this.$el, datas);
	};

	var initCurrentFilters = function () {
		var filters = this.currentFilters = [];
		var cols = this.header.children("table").children("thead").children("tr").children("th");
		var self = this;
		Utils.each(cols, function (col) {
			var colName = col.attr("col-name");
			var filterValue = col.attr("opt-filter");
			if (colName && Utils.isNotNull(filterValue) && filterValue !== false) {
				var column = getColumnInfo.call(self, colName);
				var filterFunction = self._getFilterFunction(column, filterValue);
				filters.push({name: colName, column: column, value: filterValue, fn: filterFunction});
			}
		});
	};

	// ====================================================
	// 实时监视表格，进行布局调整
	var startLayoutChangeMonitor = function () {
		if (this.t_layout) {
			clearTimeout(this.t_layout);
			this.t_layout = 0;
		}
		var self = this;
		this.t_layout = setTimeout(function () {
			self.t_layout = 0;
			if (self._isMounted()) {
				doHeaderLayout.call(self);
				startLayoutChangeMonitor.call(self);
			}
		}, 50);
	};

	var doHeaderLayout = function () {
		if (this.isHeaderVisible()) {
			var table = this.$el.children(".table");
			var cols = table.children("section").children("table").children("thead").children("tr").children("th");
			var headers = table.children("header").children("table").children("thead").children("tr").children("th");
			Utils.each(cols, function (col, i) {
				var header = headers.eq(i);
				if (col.is(".is-expand")) {
					header.addClass("is-expand");
				}
				else {
					var width = col.width();
					if (width != parseInt(header.attr("opt-w")))
						header.attr("opt-w", width).width(width);
				}
			});
		}
	};

	var selectedChanged = function () {
		if (this.isMultiple()) {
			var header = this.header.find("tr");
			if (this.isSelectedAll())
				header.addClass("selected");
			else
				header.removeClass("selected");
		}
	};

	var getColumnInfo = function (name) {
		return Utils.findBy(this.__columns, "name", name);
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-datagrid", UIDatagrid);

})();
