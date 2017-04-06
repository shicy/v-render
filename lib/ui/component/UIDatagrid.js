// ========================================================
// 数据表格
// 可选属性：columns, chkbox/showCheckbox, multi/multiple, selectedIndex(s), 
// 	selectedId(s), selectedItem(s), empty, showHeader, columnRenderer/renderer,
// 	styleFunction/rowStyleFunction, dataMapper/mapper, dataAdapter/adapter,
// 	pager/paginator, searcher, idField
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

var _UIItems = require("./_UIItems");
var VRender = require("../../v-render");
var DatagridHolder = require("../../static/js/ui/datagrid");


var UIDatagrid = _UIItems.extend(module, {
	doInit: function () {
		UIDatagrid.__super__.doInit.call(this);
		this.holder = new DatagridHolder(this, this.options);
	},

	getColumns: function () {
		return this.holder.getColumns();
	},
	setColumns: function (value) {
		this.options.columns = value;
	},

	isChkboxVisible: function () {
		return this.holder.isChkboxVisible();
	},
	setChkboxVisible: function (bool) {
		this.options.chkbox = bool;
		delete this.options.showCheckbox;
	},

	isMultiSelected: function () {
		return this.holder.isMultiSelected();
	},
	setMultiSelected: function (bool) {
		this.options.multi = bool;
		delete this.options.multiple;
	},

	getSelectedIndex: function () {
		return this.getSelectedIndexs();
	},
	setSelectedIndex: function (value) {
		this.setSelectedIndexs(value);
	},

	getSelectedIndexs: function () {
		return this.holder.getSelectedIndex();
	},
	setSelectedIndexs: function (value) {
		this.options.selectedIndexs = value;
		delete this.options.selectedIndex;
	},

	getSelectedId: function () {
		return this.getSelectedIds();
	},
	setSelectedId: function (value) {
		this.setSelectedIds(value);
	},

	getSelectedIds: function () {
		return this.holder.getSelectedId();
	},
	setSelectedIds: function (value) {
		this.options.selectedIds = value;
		delete this.options.selectedId;
	},

	getSelectedItems: function () {
		return this.holder.getSelectedItems();
	},
	setSelectedItems: function (value) {
		this.options.selectedItems = value;
		delete this.options.selectedItem;
	},

	getEmptyText: function () {
		return this.getEmptyView();
	},
	setEmptyText: function (value) {
		this.setEmptyView(value);
	},

	getEmptyView: function () {
		return this.options.empty;
	},
	setEmptyView: function (value) {
		this.options.empty = value;
	},

	isHeaderVisible: function () {
		return this.holder.isHeaderVisible();
	},
	setHeaderVisible: function (bool) {
		this.options.showHeader = bool;
	},

	getColumnRenderer: function () {
		return this.holder.getColumnRenderer();
	},
	setColumnRenderer: function (value) {
		this.options.renderer = value;
		delete this.options.columnRenderer;
	},

	getRowStyleFunction: function () {
		return this.holder.getRowStyleFunction();
	},
	setRowStyleFunction: function (value) {
		this.options.rowStyleFunction = value;
		delete this.options.styleFunction;
	},

	getPaginator: function () {
		return this.options.pager || this.options.paginator;
	},
	setPaginator: function (value) {
		this.options.pager = value;
		delete this.options.paginator;
	},

	getSearcher: function () {
		return this.options.searcher;
	},
	setSearcher: function (value) {
		this.options.searcher = value;
	},

	render: function (output) {
		UIDatagrid.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
