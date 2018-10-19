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
	var Renderer = Component.Render;
	var DatagridRender = Renderer.datagrid;

	///////////////////////////////////////////////////////
	var UIDatagrid = window.UIDatagrid = Component.Datagrid = function (view, options) {
		if (!Component.base.isElement(view))
			return UIDatagrid.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.__columns = this.getColumns(); // 解析一次
		// console.log(this.getColumns());
		
		var target = this.$el;
		var ghead = this.gridHead = target.children(".table").children("header").children();
		var gbody = this.gridBody = target.children(".table").children("section").children();

		ghead.on("tap", "th.col-chk", allChkboxClickHandler.bind(this));

		gbody.on("tap", "tr", itemClickHandler.bind(this));
		gbody.on("tap", "td.col-exp .expbtn", onExpandBtnHandler.bind(this));

		if (this.isRenderAsApp()) {
			ghead.on("tap", "th", headTouchHandler.bind(this));

			target.on("tap", ".sort-and-filter", sortAndFilterClickHandler.bind(this));
			target.on("tap", ".sort-and-filter .item", sortAndFilterItemHandler.bind(this));
			target.on("tap", ".sort-and-filter input", sortAndFilterInputClickHandler.bind(this));
			target.on("tap", ".sort-and-filter .clearbtn", sortAndFilterClearHandler.bind(this));
			target.on("tap", ".sort-and-filter .submitbtn", sortAndFilterSubmitHandler.bind(this));
			target.on("keyup", ".sort-and-filter input", sortAndFilterInputKeyHandler.bind(this));
		}
		else {
			ghead.on("tap", ".toolbar > *", toolbtnClickHandler.bind(this));
			ghead.on("tap", ".toolbar .dropdown li", toolDropdownClickHandler.bind(this));
			ghead.on("mouseenter", ".toolbar > *", toolbtnMouseHandler.bind(this));
			ghead.on("mouseleave", ".toolbar > *", toolbtnMouseHandler.bind(this));
		}

		doInit.call(this);

		this.renderComplete = true;
	};
	var _UIDatagrid = UIDatagrid.prototype = new Component.select();

	UIDatagrid.find = function (view) {
		return Component.find(view, ".ui-datagrid", UIDatagrid);
	};

	UIDatagrid.create = function (options) {
		return Component.create(options, UIDatagrid, DatagridRender);
	};

	UIDatagrid.instance = function (target) {
		return Component.instance(target, ".ui-datagrid");
	};

	// ====================================================
	_UIDatagrid.getData = function (isOriginal) {
		if (isOriginal) { // 这是没有排序、筛选过的数据集
			this.options.data = this._doAdapter(this.options.data);
			return this.options.data;
		}

		var self = this;
		var datas = this.getData(true);
		return Utils.map(this._getItems(), function (item) {
			var data = item.data("itemData");
			if (!data) {
				var index = parseInt(item.attr("opt-ind")) || 0;
				data = datas[index];
			}
			return data;
		});
	};
	_UIDatagrid.setData = function (value) {
		var snapshoot = this._snapshoot();

		this.options.data = this._doAdapter(value);
		Component.select.setSelectedIndex.call(this, []);

		this._getItems().removeClass("selected").removeClass("expand");
		rerenderItems.call(this);

		snapshoot.done([], []);
	};

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
		this.options.columns = DatagridRender.getFormatColumns(value);
		var columns = this.__columns = this.options.columns;

		if (this.currentSort && this.currentSort.name) {
			var column = Utils.findBy(columns, "name", this.currentSort.name);
			if (column && Utils.isTrue(column.sortable) && column.sortType == this.currentSort.type) {
				this.currentSort.column = column;
			}
			else
				this.currentSort = null;
		}

		if (this.currentFilters) {
			Utils.remove(this.currentFilters, function (filter) {
				if (filter.name) {
					var column = Utils.findBy(columns, "name", filter.name);
					if (column)
						filter.column = column;
					else
						return true; // 删除不存在的列
				}
			});
		}

		rerender.call(this);
	};

	_UIDatagrid.isHeaderVisible = function () {
		return !this.$el.is(".no-head");
	};
	_UIDatagrid.setHeaderVisible = function (value) {
		if (Utils.isNull(value) || Utils.isTrue(value)) {
			if (!this.isHeaderVisible()) {
				this.$el.removeClass("no-head");
				rerenderHeader.call(this);
			}
		}
		else if (this.isHeaderVisible()) {
			this.$el.addClass("no-head");
			rerenderHeader.call(this);
		}
	};

	_UIDatagrid.isChkboxVisible = function () {
		return this.$el.attr("opt-chk") == "1";
	};
	_UIDatagrid.setChkboxVisible = function (value) {
		if (Utils.isNull(value) || Utils.isTrue(value)) {
			if (!this.isChkboxVisible()) {
				this.$el.attr("opt-chk", "1");
				rerender.call(this);
			}
		}
		else if (this.isChkboxVisible()) {
			this.$el.removeAttr("opt-chk");
			rerender.call(this);
		}
	};

	// itemRenderer 即行渲染，也即tr，不能修改，设置无效
	_UIDatagrid.getItemRenderer = function () {
		return DatagridRender.rowRenderer;
	};
	_UIDatagrid.setItemRenderer = function (value) {
		// 设置无效，默认是 DatagridRender.rowRenderer;
	};

	_UIDatagrid.getHeadRenderer = function () {
		return Renderer.fn.getFunction.call(this, "headRenderer", "hrender");
	};
	_UIDatagrid.setHeadRenderer = function (value) {
		var _changed = this.getHeadRenderer() != value;
		this.options.headRenderer = value;
		if (_changed)
			rerenderHeader.call(this);
	};

	_UIDatagrid.getColumnRenderer = function () {
		if (this.options.hasOwnProperty("renderer"))
			return this.options.renderer;
		return Renderer.fn.getFunction.call(this, "columnRenderer", "crender");
	};
	_UIDatagrid.setColumnRenderer = function (value) {
		var _changed = this.getColumnRenderer() != value;
		this.options.columnRenderer = value;
		delete this.options.renderer;
		if (_changed)
			rerenderItems.call(this);
	};

	_UIDatagrid.getExpandRenderer = function () {
		return Renderer.fn.getFunction.call(this, "expandRenderer", "erender");
	};
	_UIDatagrid.setExpandRenderer = function (value) {
		var _changed = this.getExpandRenderer() != value;
		this.options.expandRenderer = value;
		if (_changed) {
			var itemContainer = this._getItemContainer();
			itemContainer.children(".row-expand").remove();
			var expandRows = itemContainer.children(".expand").removeClass("expand");
			expandRows.children(".col-exp").children(".expbtn").trigger("tap"); // 重新打开
		}
	};

	_UIDatagrid.getExpandColspan = function () {
		return parseInt(this.$el.attr("opt-expcols")) || 0;
	};
	_UIDatagrid.setExpandColsapn = function (value) {
		if (!isNaN(value) && (value || value === 0)) {
			value = parseInt(value);
			if (!isNaN(value) && value > 0 && this.getExpandColspan() != value) {
				this.$el.attr("opt-expcols", value);
				var itemContainer = this._getItemContainer();
				itemContainer.children(".row-expand").remove();
				var expandRows = itemContainer.children(".expand").removeClass("expand");
				expandRows.children(".col-exp").children(".expbtn").trigger("tap"); // 重新打开
			}
		}
	};

	_UIDatagrid.getRowStyleFunction = function () {
		return Renderer.fn.getFunction.call(this, "rowStyleFunction", "rstyle");
	};
	_UIDatagrid.setRowStyleFunction = function (value) {
		var _changed = this.getRowStyleFunction() != value;
		this.options.rowStyleFunction = value;
		if (_changed)
			rerenderItems.call(this);
	};

	_UIDatagrid.getCellStyleFunction = function () {
		return Renderer.fn.getFunction.call(this, "cellStyleFunction", "cstyle");
	};
	_UIDatagrid.setCellStyleFunction = function () {
		var _changed = this.getCellStyleFunction() != value;
		this.options.cellStyleFunction = value;
		if (_changed)
			rerenderItems.call(this);
	};

	delete _UIDatagrid.getLabelField;
	delete _UIDatagrid.setLabelField;
	delete _UIDatagrid.getLabelFunction;
	delete _UIDatagrid.setLabelFunction;
	delete _UIDatagrid.setItemRenderer;

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
	_UIDatagrid.addItem = function (data, index) {
		if (Utils.isNull(data))
			return ;
		index = Utils.getIndexValue(index);

		var datas = this.getData(true);
		data = Renderer.fn.doAdapter.call(this, data, index);

		if (index >= 0 && index < datas.length) {
			datas.splice(index, 0, data);
		}
		else {
			datas.push(data);
		}

		var snapshoot = this._snapshoot();
		rerenderItems.call(this);
		snapshoot.done();
	};

	_UIDatagrid.updateItem = function (data, index) {
		if (Utils.isNull(data))
			return ;

		var datas = this.getData(true);

		if (!index && index !== 0) {
			data = Renderer.fn.doAdapter.call(this, data);
			index = this.getDataRealIndex(data, datas);
		}
		else {
			index = Utils.getIndexValue(index);
			data = Renderer.fn.doAdapter.call(this, data, index);
		}

		if (index >= 0) {
			datas.splice(index, 1, data);
			var snapshoot = this._snapshoot(); // 可能被筛选或排序
			rerenderItems.call(this);
			snapshoot.done();
		}
	};

	_UIDatagrid.removeItem = function (data) {
		if (Utils.isNotNull(data))
			this.removeItemAt(this.getDataRealIndex(data));
	};

	_UIDatagrid.removeItemAt = function (index) {
		index = Utils.getIndexValue(index);
		if (index >= 0) {
			var datas = this.getData(true);
			if (index < datas.length) {
				var removedData = datas.splice(index, 1);

				var snapshoot = this._snapshoot();
				rerenderItems.call(this);
				snapshoot.done();
			}
		}
	};

	_UIDatagrid.addOrUpdateItem = function (data) {
		var index = this.getDataRealIndex(data);
		if (index >= 0)
			this.updateItem(data, index);
		else
			this.addItem(data, index);
	};

	_UIDatagrid.getDataRealIndex = function (data, datas) {
		var datas = datas || this.getData(true);
		if (datas && datas.length > 0) {
			var self = this;
			var id = this._getDataKey(data);
			return Utils.index(datas, function (temp) {
				return temp == data || self._getDataKey(temp) == id;
			});
		}
		return -1;
	};

	// ====================================================
	_UIDatagrid._getItemContainer = function () {
		if (!this.itemContainer) {
			var target = this.$el.children(".table").children("section").children();
			this.itemContainer = target.children("table").children("tbody");
		}
		return this.itemContainer;
	};

	_UIDatagrid._getNewItem = function ($, itemContainer, data, index) {
		return $("<tr class='datagrid-row'></tr>").appendTo(itemContainer);
	};

	_UIDatagrid._getItemData = function (item) {
		var data = item.data("itemData");
		if (!data) {
			var datas = this.getData(true);
			if (Utils.isArray(datas) && datas.length > 0) {
				var index = parseInt(item.attr("opt-ind"));
				if (!isNaN(index) && index >= 0)
					return datas[index];
			}
		}
		return data;
	}

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

	_UIDatagrid._rerender = function () {
		rerender.call(this);
	};

	_UIDatagrid._snapshoot_change = function () {
		selectedChanged.call(this);
	};

	// ====================================================
	var itemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.parent().is(this._getItemContainer())) {
			if (item.is(".disabled"))
				return ;

			if (item.is(".selected")) {
				item.removeClass("selected");
			}
			else {
				item.addClass("selected");
				if (!this.isMultiple())
					item.siblings().removeClass("selected");
			}

			selectedChanged.call(this);
		}
	};

	var headTouchHandler = function (e) {
		var col = $(e.currentTarget);
		var colName = col.attr("col-name");
		var column = colName && getColumnInfo.call(this, colName);
		if (column) {
			if (column.filter || Utils.isArray(column.sortable))
				showSortAndFilterDialog.call(this, column, col);
			else if (column.sortable) {
				var sortType = col.attr("opt-sort");
				sortType = sortType == "desc" ? null : (sortType == "asc" ? "desc" : "asc");
				doSort.call(this, column, sortType);
			}
		}
	};

	var allChkboxClickHandler = function (e) {
		var header = this.gridHead.find("tr");
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
				var index = parseInt(item.attr("opt-ind")) || 0;
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
		if (e.which == 13) {
			var input = $(e.currentTarget);
			var colName = Utils.parentUntil(input, "th").attr("col-name");
			if (colName) {
				var column = getColumnInfo.call(this, colName);
				doFilter.call(this, column, input.val() || null);
			}
		}
	};

	var sortAndFilterClickHandler = function (e) {
		if ($(e.target).is(".sort-and-filter")) {
			hideSortAndFilterDialog.call(this);
			return false;
		}
	};

	var sortAndFilterItemHandler = function (e) {
		var item = $(e.currentTarget);
		var column = this.$el.children(".sort-and-filter").data("column");
		if (item.parent().parent().is(".sort")) {
			var sortType = item.is(".selected") ? null : item.attr("data-type");
			doSort.call(this, column, sortType);
		}
		else {
			var filterValue = item.is(".selected") ? null : item.attr("data-val");
			doFilter.call(this, column, filterValue);
		}
		hideSortAndFilterDialog.call(this);
	};

	var sortAndFilterInputClickHandler = function (e) {
		this.$el.children(".sort-and-filter").addClass("inputing");
	};

	var sortAndFilterClearHandler = function (e) {
		var target = this.$el.children(".sort-and-filter");
		var input = target.find("input").val("");
		if (target.is(".inputing")) {
			setTimeout(function () {
				input.focus();
			}, 0);
		}
	};

	var sortAndFilterSubmitHandler = function (e) {
		var target = this.$el.children(".sort-and-filter");
		var column = target.data("column");
		var filterValue = target.find("input").val() || null;
		doFilter.call(this, column, filterValue);
		hideSortAndFilterDialog.call(this);
	};

	var sortAndFilterInputKeyHandler = function (e) {
		if (e.which == 13) {
			this.$el.children(".sort-and-filter").find(".submitbtn").tap();
		}
	};

	// ====================================================
	var rerender = function () {
		if (this.t_rerender) {
			clearTimeout(this.t_rerender);
			this.t_rerender = 0;
		}
		if (this.t_rerenderheader) {
			clearTimeout(this.t_rerenderheader);
			this.t_rerenderheader = 0;
		}
		if (this.t_rerenderitems) {
			clearTimeout(this.t_rerenderitems);
			this.t_rerenderitems = 0;
		}
		var self = this;
		this.t_rerender = setTimeout(function () {
			self.t_rerender = 0;
			DatagridRender.renderHeader.call(self, $, self.$el, self.__columns);
			renderBySortAndFilter.call(self, true);
		}, 0);
	};

	var rerenderHeader = function () {
		if (this.t_rerender)
			return ;
		if (this.t_rerenderheader) {
			clearTimeout(this.t_rerenderheader);
			this.t_rerenderheader = 0;
		}
		var self = this;
		this.t_rerenderheader = setTimeout(function () {
			self.t_rerenderheader = 0;
			DatagridRender.renderHeader.call(self, $, self.$el, self.__columns);
		}, 0);
	};

	var rerenderItems = function () {
		if (this.t_rerender)
			return ;
		if (this.t_rerenderitems) {
			clearTimeout(this.t_rerenderitems);
			this.t_rerenderitems = 0;
		}
		var self = this;
		this.t_rerenderitems = setTimeout(function () {
			self.t_rerenderitems = 0;
			renderBySortAndFilter.call(self, true);
			rerenderEnumFilters.call(self);
		}, 0);
	};

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

	var rerenderEnumFilters = function () {
		if (this.isRenderAsApp())
			return ;
		var self = this;
		Utils.each(getHeaders.call(this), function (col) {
			var colName = col.attr("col-name");
			if (colName) {
				var column = getColumnInfo.call(self, col.attr("col-name"));
				if (column && column.filter == "enum") {
					var filterBtn = col.find(".toolbar .filter");
					var filterItems = DatagridRender.getColumnValueSet.call(self, column);
					var filterValue = col.attr("opt-filter");
					if (filterItems && filterItems.length > 0) {
						filterItems = Utils.map(filterItems, function (tmp) {
							return {label: tmp, value: tmp};
						});
					}
					else {
						filterItems = [{label: "无选项", value: ""}];
					}
					filterBtn.children(".dropdown").remove();
					DatagridRender.renderToolDropdown.call(self, $, filterBtn, filterItems, filterValue, "空");
				}
			}
		});
	};

	// ====================================================
	var doInit = function () {
		this.$el.children("[name='irender']").remove();
		// selectedChanged.call(this);
		startLayoutChangeMonitor.call(this);
	};

	// 排序互斥，即只能有一个排序方法
	var doSort = function (column, sortType, sortFunction) {
		var cols = getHeaders.call(this);
		cols.removeAttr("opt-sort");
		cols.find(".sort > i").css("backgroundImage", "");
		cols.find(".sort .dropdown li").removeClass("selected");

		var isCustom = column && column.sortable == "custom";

		if (column && column.name && Utils.isNotNull(sortType)) {
			var col = cols.filter("[col-name='" + column.name + "']");
			if (col && col.length > 0) {
				col.attr("opt-sort", sortType);
				var icon = DatagridRender.defaultIcons[sortType];
				if (Utils.isArray(column.sortable)) {
					if (!this.isRenderAsApp())
						col.find(".sort li[data-type='" + sortType + "']").addClass("selected");
					var sortItem = Utils.findBy(column.sortable, "type", sortType) || {};
					icon = sortItem.icon || icon;
					isCustom = Utils.isTrue(sortItem.custom);
				}
				if (icon)
					col.find(".sort > i").css("backgroundImage", "url(" + icon + ")");
			}
		}

		this.currentSort = {column: column, type: sortType, fn: sortFunction, name: (column && column.name)};
		if (Utils.isFunction(sortFunction)) {
			var _sortFunction = sortFunction;
			this.currentSort.fn = function (column, a, b, sortType) {
				return _sortFunction(a, b, sortType, column);
			};
		}
		else if (Utils.isNotNull(sortType) && !isCustom) {
			this.currentSort.fn = this._getSortFunction(column, sortType);
		}

		if (Utils.isFunction(this.currentSort.fn) || !isCustom) {
			renderBySortAndFilter.call(this);
		}

		this.trigger("sort", (column && column.name), sortType);
	};

	// 设置某一列筛选，不影响其他列筛选
	var doFilter = function (column, filterValue, filterFunction) {
		var isCustom = column && column.filter == "custom";
		var isNullValue = Utils.isNull(filterValue) || filterValue === false;
		if (column && column.name) {
			var cols = getHeaders.call(this);
			var col = cols.filter("[col-name='" + column.name + "']");
			if (col && col.length > 0) {
				col.removeAttr("opt-filter");
				col.find(".filter > i").css("backgroundImage", "");
				col.find(".filter li").removeClass("selected");
				if (!isNullValue || Utils.isFunction(filterFunction)) {
					col.attr("opt-filter", (isNullValue ? true : filterValue));
					if (!this.isRenderAsApp()) {
						if (col.find(".filter .dropdown").is(".ipt")) {
							col.find(".filter input").val(isNullValue ? "" : filterValue);
						}
						else if (!isNullValue) {
							col.find(".filter li[data-val='" + filterValue + "']").addClass("selected");
						}
					}
					if (Utils.isArray(column.filter)) {
						var filterItem = Utils.findBy(column.filter, "value", filterValue) || {};
						if (filterItem.icon)
							col.find(".filter > i").css("backgroundImage", "url(" + filterItem.icon + ")");
						isCustom = Utils.isTrue(filterItem.custom);
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
		else if (!isNullValue && !isCustom) {
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

		if (!isCustom) {
			renderBySortAndFilter.call(this, true);
		}

		this.trigger("filter", colName, filterValue);
	};

	var renderBySortAndFilter = function (hasFilterChanged) {
		var datas = this.getData(true);
		if (hasFilterChanged || !this.lastFilterDatas) {
			var _datas = [].concat(datas);
			if (_datas && _datas.length > 0) {
				if (!this.currentFilters)
					initCurrentFilters.call(this);
				Utils.each(this.currentFilters, function (filter) {
					_datas = Utils.filter(_datas, function (data) {
						return filter.fn(filter.column, data, filter.value);
					});
				});
			}
			this.lastFilterDatas = _datas;
		}

		_datas = this.lastFilterDatas;
		if (!this.currentSort)
			initCurrentSort.call(this);
		if (this.currentSort && Utils.isFunction(this.currentSort.fn)) {
			var _sort = this.currentSort;
			_datas = _datas.slice(0).sort(function (a, b) {
				return _sort.fn(_sort.column, a, b, _sort.type);
			});
		}

		// 对应原数据集中的索引
		var _indexs = Utils.map(_datas, function (data) {
			return Utils.index(datas, function (temp) {
				return temp == data;
			});
		});
		// 当前选中项对应筛选、排序后的新索引
		var _selectedIndexs = [];
		// 当前展开的原数据集索引
		var expandIndexs = [];
		Utils.each(this._getItems(), function (item) {
			if (item.is(".selected")) {
				var index = parseInt(item.attr("opt-ind")) || 0;
				var data = datas && datas[index];
				if (data) {
					index = Utils.index(_datas, function (temp) {
						return temp == data;
					});
					if (index >= 0)
						_selectedIndexs.push(index);
				}
			}
			if (item.is(".expand"))
				expandIndexs.push(item.attr("opt-ind"));
		});

		DatagridRender.renderItems.call(this, $, this.$el, _datas, _indexs, _selectedIndexs);

		selectedChanged.call(this);
		if (hasFilterChanged) {
			Component.item.checkIfEmpty.call(this);
		}

		if (expandIndexs.length > 0) {
			Utils.each(this._getItems(), function (item) {
				if (expandIndexs.indexOf(item.attr("opt-ind")) >= 0)
					item.children(".col-exp").children(".expbtn").trigger("tap");
			});
		}
	};

	var initCurrentSort = function () {
		var col = Utils.find(getHeaders.call(this), function (col) {
			return !!col.attr("opt-sort");
		});
		this.currentSort = null;
		if (col && col.length > 0) {
			var colName = col.attr("col-name");
			var sortType = col.attr("opt-sort");
			var column = getColumnInfo.call(this, colName);
			var sortFunction = this._getSortFunction(column, sortType);
			this.currentSort = {name: colName, column: column, type: sortType, fn: sortFunction};
		}
	};

	var initCurrentFilters = function () {
		var filters = this.currentFilters = [];
		var self = this;
		Utils.each(getHeaders.call(this), function (col) {
			var colName = col.attr("col-name");
			var filterValue = col.attr("opt-filter");
			if (colName && Utils.isNotNull(filterValue) && filterValue !== false) {
				var column = getColumnInfo.call(self, colName);
				var filterFunction = self._getFilterFunction(column, filterValue);
				filters.push({name: colName, column: column, value: filterValue, fn: filterFunction});
			}
		});
	};

	var getHeaders = function () {
		return this.gridHead.children("table").children("thead").children("tr").children("th");
	};

	// ====================================================
	// 显示 排序 和 筛选 对话框
	var showSortAndFilterDialog = function (column, col) {
		$("body").addClass("ui-scrollless");

		var dialogView = $("<div class='sort-and-filter'></div>").appendTo(this.$el);
		var container = $("<div class='container'></div>").appendTo(dialogView);

		dialogView.data("column", column);

		var isSortable = Utils.isTrue(column.sortable);
		var isFilterable = Utils.isTrue(column.filter);

		if (isSortable)
			showDialogSortView.call(this, container, column, col.attr("opt-sort"));

		if (isFilterable)
			showDialogFilterView.call(this, container, column, col.attr("opt-filter"));

		if (!isSortable && isFilterable && column.filter != "enum" && !Utils.isArray(column.filter)) {
			dialogView.addClass("inputing");
			dialogView.find(".filter").focus();
		}

		setTimeout(function () {
			dialogView.addClass("show");
		}, 0);
	};

	var showDialogSortView = function (container, column, sortType) {
		var target = $("<div class='sort'></div>").appendTo(container);
		target.append("<div class='title'>排序</div>");

		var sorts = column.sortable;
		if (!Utils.isArray(sorts)) {
			sorts = [{label: "升序", type: "asc"}, {label: "降序", type: "desc"}];
		}

		var content = $("<div class='content'></div>").appendTo(target);
		Utils.each(sorts, function (data) {
			var item = $("<div class='item'></div>").appendTo(content);
			item.attr("data-type", data.type);
			var icon = $("<i></i>").appendTo(item);
			var iconUrl = data.icon || DatagridRender.defaultIcons[data.type];
			if (iconUrl)
				icon.css("backgroundImage", "url(" + iconUrl + ")");
			$("<span></span>").appendTo(item).text(data.label || "无");
			if (data.type == sortType)
				item.addClass("selected");
		});
	};

	var showDialogFilterView = function (container, column, filterValue) {
		var target = $("<div class='filter'></div>").appendTo(container);
		target.append("<div class='title'>筛选</div>");

		var filters = column.filter;
		if (column.filter == "enum") {
			filters = DatagridRender.getColumnValueSet.call(this, column);
			if (filters && filters.length > 0) {
				filters = Utils.map(filters, function (temp) {
					return {label: temp, value: temp};
				});
			}
			else {
				filters = [{label: "无选项", value: ""}];
			}
		}

		var content = $("<div class='content'></div>").appendTo(target);
		if (Utils.isArray(filters)) {
			Utils.each(filters, function (data) {
				var item = $("<div class='item'></div>").appendTo(content);
				item.attr("data-val", data.value);
				var icon = $("<i></i>").appendTo(item);
				if (data.icon)
					icon.css("backgroundImage", "url(" + data.icon + ")");
				$("<span></span>").appendTo(item).text(data.label || "空");
				if (data.value == filterValue)
					item.addClass("selected");
			});
		}
		else {
			var filterInput = $("<div class='filterinput'></div>").appendTo(content);
			filterInput.append("<input placeholder='请输入文本'/>");
			filterInput.append("<div class='clearbtn'></div>");
			filterInput.append("<div class='submitbtn'>确定</div>");
			if (filterValue)
				filterInput.children("input").val(filterValue);
		}
	};

	var hideSortAndFilterDialog = function () {
		$("body").removeClass("ui-scrollless");
		var target = this.$el.children(".sort-and-filter");
		target.removeClass("show").removeClass("inputing");
		setTimeout(function () {
			target.remove();
		}, 300);
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
				checkBodyFixed.call(self);
				startLayoutChangeMonitor.call(self);
			}
		}, 50);
	};

	var doHeaderLayout = function () {
		if (this.isHeaderVisible()) {
			var headers = getHeaders.call(this);
			var cols = this.gridBody.children("table").children("thead").children("tr").children("th");
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

	var checkBodyFixed = function () {
		// this.$el.removeAttr("fixed");
		// if (!this.$el.is(".is-empty")) {
		// 	var table = this.gridBody.parent().parent(); // .table
		// 	var head = table.children("header"); // head
		// 	var body = table.children("section"); // body
		// 	if (table.width() < head.width() + body.width())
		// 		this.$el.attr("fixed", "1");
		// }
	};

	var selectedChanged = function () {
		var snapshoot = this._snapshoot();

		var indexs = Utils.map(this._getItems(".selected"), function (item) {
			return item.index();
		});
		Component.select.setSelectedIndex.call(this, indexs);

		if (this.isMultiple()) {
			var header = this.gridHead.find("tr");
			if (this.isAllSelected())
				header.addClass("selected");
			else
				header.removeClass("selected");
		}

		snapshoot.done();
	};

	var getColumnInfo = function (name) {
		return Utils.findBy(this.__columns, "name", name);
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-datagrid", UIDatagrid);

})();