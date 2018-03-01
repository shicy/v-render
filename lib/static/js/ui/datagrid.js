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

	_UIDatagrid.getItemRenderer = function () {
		return DatagridRender.rowRenderer;
	};

	_UIDatagrid.getColumnRenderer = function () {
		return Component.list.getFunction.call(this, "columnRenderer", "crender");
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
		column = getColumnInfo.call(this, ("" + column));
		doSort.call(this, column, type, sortFunction);
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

	_UIDatagrid._getSortFunction = function (column) {
		if (this.options.hasOwnProperty("renderer"))
			return this.options.renderer;
		return DatagridRender.getSortFunction.call(this, column);
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

	var toolbtnClickHandler = function (e) {
		var btn = $(e.currentTarget);
		var col = btn.parent().parent();
		var column = getColumnInfo.call(this, col.attr("col-name"));

		var dropdown = btn.children(".dropdown");
		if (dropdown && dropdown.length > 0) {
			btn.addClass("show-dropdown");
		}
		else if (btn.is(".sort")) {
			var sortType = col.attr("opt-sort");
			sortType = sortType == "desc" ? null : (sortType == "asc" ? "desc" : "asc");
			doSort.call(this, column, sortType);
		}
		else if (btn.is(".filter")) {

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
			if (item.is(".selected"))
				doSort.call(this, column, null);
			else
				doSort.call(this, column, item.attr("data-type"));
		}
		else if (toolbtn.is(".filter")) {

		}

		return false;
	};

	// ====================================================
	var doInit = function () {
		this.$el.children("[name='irender']").remove();
	};

	var doSort = function (column, sortType, sortFunction) {
		var cols = this.header.children("table").children("thead").children("tr").children("th");
		cols.removeAttr("opt-sort");
		cols.find(".sort > i").css("backgroundImage", "");
		cols.find(".sort .dropdown li").removeClass("selected");

		var sortItem = null;
		if (Utils.isArray(column.sortable)) {
			sortItem = Utils.find(column.sortable, function (tmp) {
				return tmp.type == sortType;
			});
		}

		if (column && column.name && sortType) {
			var col = cols.filter("[col-name='" + column.name + "']");
			col.attr("opt-sort", sortType);
			var icon = sortItem && sortItem.icon || DatagridRender.sortIcons[sortType];
			if (icon)
				col.find(".sort > i").css("backgroundImage", "url(" + icon + ")");
			col.find(".sort .dropdown li[data-type='" + sortType + "']").addClass("selected");
		}

		if (column.sortable != "custom") {
			var datas = this.getData();
			if (datas && datas.length > 0 && sortType) {
				if (Utils.isFunction(sortFunction)) {
					var _sortFunction = sortFunction;
					sortFunction = function (column, a, b, sortType) {
						_sortFunction(a, b, sortType, column);
					};
				}
				else {
					sortFunction = this._getSortFunction(column);
				}
				this.currentSort = null;
				if (Utils.isFunction(sortFunction)) {
					this.currentSort = {column: column, type: sortType, fn: sortFunction};
					datas = [].concat(datas);
					datas.sort(function (a, b) {
						return sortFunction(column, a, b, sortType);
					});
				}
			}
			DatagridRender.renderItems.call(this, $, this.$el, datas);
		}

		this.trigger("sort", (column && column.name), sortType);
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
		return Utils.find(this.getColumns(), function (column) {
			return column.name == name;
		});
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-datagrid", UIDatagrid);

})();
