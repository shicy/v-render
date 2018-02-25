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

		// this.getColumns(); // 解析一次
		console.log(this.getColumns());
		
		this.header = this.$el.children(".table").children("header");
		this.header.on("tap", "th.col-chk", allChkboxClickHandler.bind(this));

		var itemContainer = this._getItemContainer();
		itemContainer.on("tap", "tr", itemClickHandler.bind(this));

		if (this.isRenderAsApp()) {

		}
		else {
			// this.header.on("mouseenter", "th", headerMouseHandler.bind(this));
			// this.header.on("mouseleave", "th", headerMouseHandler.bind(this));
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
		var columns = this.$el.children("[name='columns']");
		if (columns && columns.length > 0) {
			try {
				columns = JSON.parse(columns.remove().attr("data"));
				Utils.each(columns, function (column) {
					if (/^function/.test(column.sortable)) {
						column.sortable = (new Function("var Utils=VRender.Utils;return (" + unescape(column.sortable) + ");"))();
					}
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
		this.$el.children("[name='columns']").remove();
	};

	_UIDatagrid.isHeaderVisible = function () {
		return true;
	};

	// ====================================================
	_UIDatagrid._getItemContainer = function () {
		if (!this.itemContainer)
			this.itemContainer = this.$el.children(".table").children("section").children("table").children("tbody");
		return this.itemContainer;
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

	// var headerMouseHandler = function (e) {
	// 	if (this.t_headerMouse) {
	// 		clearTimeout(this.t_headerMouse);
	// 		this.t_headerMouse = 0;
	// 	}
	// 	var target = $(e.currentTarget);
	// 	if (e.type == "mouseenter") {
	// 		var self = this;
	// 		this.t_headerMouse = setTimeout(function () {
	// 			self.t_headerMouse = 0;
	// 			target.addClass("over");
	// 			// showHeaderToolbar.call(this, target);
	// 		}, 200);
	// 	}
	// 	else if (e.type == "mouseleave") {
	// 		target.removeClass("over");
	// 		// hideHeaderToolbar.call(thia, target);
	// 	}
	// };

	// ====================================================
	var doInit = function () {

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

	// var showHeaderToolbar = function (col) {
	// 	var toolbar = col.children(".toolbar");
	// 	if (toolbar && toolbar.length > 0)
	// 		return ;

	// 	var column = getColumnInfo.call(this, col.attr("col-name"));
	// 	if (column && (column.sortable || column.filter)) { console.log(column);
	// 		toolbar = $("<div class='toolbar'></div>").appendTo(col);

	// 		if (column.sortable) {

	// 		}
	// 	}
	// };

	// var hideHeaderToolbar = function (col) {
	// 	// do nothing
	// };

	var getColumnInfo = function (name) {
		return Utils.find(this.getColumns(), function (column) {
			return column.name == name;
		});
	};

	// ====================================================
	// _UIDatagrid.setData = function (value) {
	// 	value = Component.list.doAdapter.call(this, value);
	// 	this.options.data = value;
	// 	Component.list.setSelectedIndex.call(this, []);

	// 	var self = this;
	// 	var tbody = this.$el.children("table").children("tbody").empty();
	// 	Utils.each(value, function (temp, i) {
	// 		self.addItem(temp, null, tbody); // adapter在addItem()中执行
	// 	});
	// 	checkIfEmpty.call(this);
	// };

	// _UIDatagrid.getJQItems = function () {
	// 	return getRowItems.call(this);
	// };

	// ====================================================

	// 获取任意某一行的数据，target是行内的标签对象
	// _UIDatagrid.getRowData = function (target) {
	// 	if (Utils.isNotBlank(target)) {
	// 		target = $(target);
	// 		if (target.length > 0) {
	// 			if (!target.is("tr"))
	// 				target = Utils.parentUntil(target, "tr", this.$el);
	// 		}
	// 		if (target.length > 0)
	// 			return this.getItemData(target);
	// 	}
	// 	return null;
	// };

	// 判断是否全部选中
	// _UIDatagrid.isAllSelected = function () {
	// 	return getRowItems.call(this).not(".selected").length === 0;
	// };

	// 
	// _UIDatagrid.isChkboxVisible = function () {
	// 	return this.$el.is(".show-chk");
	// };

	// _UIDatagrid.isMultiSelected = function () {
	// 	return this.$el.is(".multiple");
	// };

	// 设置表格空白时显示的视图
	// _UIDatagrid.setEmptyView = function (view) {
	// 	this.options.empty = view;
	// 	this.$el.children(".datagrid-emp").remove();
	// 	renderEmptyView.call(this, $, this.$el);
	// };

	// 设置点击行时是否选中
	// _UIDatagrid.isRowSelectable = function () {
	// 	if (Utils.isNull(this.options.rowSelectable))
	// 		return true;
	// 	return Utils.isTrue(this.options.rowSelectable);
	// };
	// _UIDatagrid.setRowSelectable = function (value) {
	// 	this.options.rowSelectable = value;
	// };

	// _UIDatagrid.getItemIndex = function (data) {
	// 	var self = this;
	// 	data = Component.base.doAdapter.call(this, data);
	// 	return Utils.index(getRowItems.call(this), function (item, i) {
	// 		var temp = self.getItemData(item);
	// 		return equal(data, temp);
	// 	});
	// };

	// _UIDatagrid.getColumnName = function (index) {
	// 	index = parseInt(index);
	// 	if (index >= 0 && index < this.columns.length)
	// 		return this.columns[index].name;
	// 	return null;
	// };

	// _UIDatagrid.addItem = function (data, index, tbody) {
	// 	tbody = tbody || this.$el.children("table").children("tbody");
	// 	data = Component.base.doAdapter.call(this, data);
	// 	var row = $("<tr class='row-item'></tr>").appendTo(tbody);
	// 	renderRow.call(this, $, row, this.columns, data, index);
	// 	index = parseInt(index);
	// 	if (!isNaN(index) && index >= 0) {
	// 		var items = getRowItems.call(this, null, tbody);
	// 		if (index < items.length - 1)
	// 			items.eq(index).before(row.detach());
	// 	}
	// 	this.$el.removeClass("no-data");
	// 	// checkIfEmpty.call(this);
	// 	checkIfAllSelected.call(this);
	// 	return row;
	// };

	// _UIDatagrid.updateItem = function (data, index) {
	// 	index = parseInt(index);
	// 	data = Component.base.doAdapter.call(this, data);
	// 	if (isNaN(index))
	// 		index = this.getItemIndex(data);
	// 	if (!isNaN(index) && index >= 0) {
	// 		var items = getRowItems.call(this);
	// 		if (index < items.length) {
	// 			var oldItem = this.removeItemAt(index);
	// 			var newItem = this.addItem(data, index);
	// 			if (oldItem.is(".selected"))
	// 				newItem.addClass("selected");
	// 			return [newItem, oldItem];
	// 		}
	// 	}
	// 	return null;
	// };

	// _UIDatagrid.removeItem = function (data) {
	// 	var items = getRowItems.call(this);
	// 	data = Component.base.doAdapter.call(this, data);
	// 	for (var i = 0, l = items.length; i < l; i++) {
	// 		var item = items.eq(i);
	// 		if (equal(data, this.getItemData(item))) {
	// 			item.remove();
	// 			checkIfEmpty.call(this);
	// 			checkIfAllSelected.call(this);
	// 			return item;
	// 		}
	// 	}
	// 	return null;
	// };

	// _UIDatagrid.removeItemAt = function (index) {
	// 	index = parseInt(index);
	// 	if (!isNaN(index) && index >= 0) {
	// 		var item = getRowItems.call(this).eq(index).remove();
	// 		if (item && item.length > 0) {
	// 			checkIfEmpty.call(this);
	// 			checkIfAllSelected.call(this);
	// 			return item;
	// 		}
	// 	}
	// 	return null;
	// };

	// _UIDatagrid.addOrUpdateItem = function (data) {
	// 	data = Component.base.doAdapter.call(this, data);
	// 	var index = this.getItemIndex(data);
	// 	if (index >= 0)
	// 		this.updateItem(data, index);
	// 	else
	// 		this.addItem(data);
	// };

	// _UIDatagrid.reRender = function () {
	// 	if (this.renderTimerId)
	// 		clearTimeout(this.renderTimerId);
	// 	var self = this;
	// 	this.renderTimerId = setTimeout(function () {
	// 		self.setData(self.getData());
	// 		delete self.renderTimerId;
	// 	}, 0);
	// };

	// _UIDatagrid.isDataSelected = function () {
	// 	var self = this;
	// 	return !!Utils.find(getRowItems.call(this, ".selected"), function (temp) {
	// 		return equal.call(self, data, self.getItemData(temp));
	// 	});
	// };

	// ====================================================
	// 行数据渲染器
	// _UIDatagrid.getRowDataMap = function () {
	// 	return getFunction.call(this, "dataMapper", "mapper");
	// };
	// _UIDatagrid.setRowDataMap = function (value) {
	// 	this.dataMapper = value;
	// 	delete this.options.dataMapper;
	// 	this.reRender();
	// };

	// 表单元格渲染器
	// _UIDatagrid.getColumnRenderer = function () { 
	// 	if (this.options.hasOwnProperty("renderer"))
	// 		return this.options.renderer;
	// 	return getFunction.call(this, "columnRenderer", "renderer");
	// };
	// _UIDatagrid.setColumnRenderer = function (value) {
	// 	this.columnRenderer = value;
	// 	delete this.options.columnRenderer;
	// 	delete this.options.renderer;
	// 	this.reRender();
	// };

	// 行样式
	// _UIDatagrid.getRowStyleFunction = function () {
	// 	return getFunction.call(this, "styleFunction", "stylefn");
	// };
	// _UIDatagrid.setRowStyleFunction = function (value) {
	// 	this.styleFunction = value;
	// 	delete this.options.styleFunction;
	// 	this.reRender();
	// };

	// ====================================================
	// _UIDatagrid.getPaginator = function () {
	// 	return this._pager;
	// };
	// _UIDatagrid.setPaginator = function (pager) {
	// 	if (this._pager)
	// 		this._pager.off("onpage");
	// 	this._pager = pager;
	// 	if (this._pager) {
	// 		var self = this;
	// 		this._pager.on("onpage", function (e, pageNo, pageSize) {
	// 			var params = $.extend({}, self.lastLoadParams, {page: pageNo, size: pageSize});
	// 			self.load(self.lastLoadApi, params);
	// 		});
	// 	}
	// };

	// ====================================================
	// var itemClickHandler = function (e) {
	// 	var row = $(e.currentTarget);
	// 	var col = Utils.parentUntil(e.target, "td", "tr");

	// 	var changeFlag = false;
	// 	if (this.isRowSelectable()) {
	// 		var siblings = row.addClass("selected").siblings(".selected");
	// 		if (siblings.length > 0) {
	// 			siblings.removeClass("selected");
	// 			changeFlag = true;
	// 		}
	// 		var header = this.$el.children("table").children("thead").children("tr");
	// 		setSelected(header, this.isAllSelected());
	// 	}

	// 	this.trigger("itemclick", this.getItemData(row), row.index(), col.index());
	// 	if (changeFlag)
	// 		this.trigger("itemselectchange");
	// };

	// var chkboxClickHandler = function (e) {
	// 	var chkbox = $(e.currentTarget);
	// 	var item = chkbox.parent().parent().toggleClass("selected");
	// 	if (item.parent().is("thead")) {
	// 		setSelected(getRowItems.call(this), item.is(".selected"));
	// 	}
	// 	else if (this.isMultiSelected()) {
	// 		var header = this.$el.children("table").children("thead").children("tr");
	// 		setSelected(header, this.isAllSelected());
	// 	}
	// 	else {
	// 		item.siblings().removeClass("selected");
	// 	}
	// 	this.trigger("itemselectchange");
	// 	return false;
	// };

	// var operatorHandler = function (e) {
	// 	var op = $(e.currentTarget);
	// 	var item = op.parent().parent();
	// 	var data = this.getItemData(item);
	// 	var opName = op.attr("name") || op.data("name") || "";
	// 	this.trigger("oper", opName, data, item);
	// };

	// ====================================================
	// var initPager = function () {
	// 	var pager = this.$el.attr("data-pager");
	// 	pager = Utils.isBlank(pager) ? null : $("[vid='" + pager + "']");
	// 	if (pager && pager.length > 0) {
	// 		if (pager.is('.ui-paginator'))
	// 			pager = new Component.Paginator(pager);
	// 		this.setPaginator(pager);
	// 	}
	// };

	// var getRowItems = function (selector, tbody) {
	// 	tbody = tbody || this.$el.children("table").children("tbody");
	// 	var items = tbody.children(".row-item");
	// 	return Utils.isBlank(selector) ? items : items.filter(selector);
	// };

	// var getFunction = function (name, type) {
	// 	if (this.options.hasOwnProperty(name))
	// 		return this.options[name];
	// 	if (this.hasOwnProperty(name))
	// 		return this[name];
	// 	var func = this.$el.children(".ui-fn[name='" + type +"']").text();
	// 	if (func) {
	// 		func = (new Function("var Utils=VRender.Utils;return (" + 
	// 			unescape(func) + ");"))();
	// 	}
	// 	return this[name] = func;
	// };

	// var setSelected = function (target, selected) {
	// 	if (selected)
	// 		target.addClass("selected");
	// 	else
	// 		target.removeClass("selected");
	// };

	// var checkIfEmpty = function () {
	// 	var items = getRowItems.call(this);
	// 	if (items && items.length > 0)
	// 		this.$el.removeClass("no-data");
	// 	else
	// 		this.$el.addClass("no-data");
	// };

	// var checkIfAllSelected = function () {
	// 	var thead = this.$el.children("table").children("thead").children("tr");
	// 	setSelected(thead, this.isAllSelected());
	// };

	// ====================================================
	// 判断对象是否相同，ID一样也认为是相同对象
	// var equal = function (data1, data2) {
	// 	if (data1 == data2)
	// 		return true;
	// 	if (Utils.isNull(data1))
	// 		return Utils.isNull(data2);
	// 	else if (Utils.isNull(data2))
	// 		return false;
	// 	return this.getDataId(data1) == this.getDataId(data2);
	// };

	///////////////////////////////////////////////////////
	Component.register(".ui-datagrid", UIDatagrid);

})();
