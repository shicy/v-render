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
var DatagridRender = require("../../static/js/render/datagrid");


var UIDatagrid = _UIItems.extend(module, {
	doInit: function () {
		UIDatagrid.__super__.doInit.call(this);
		this.holder = new DatagridRender(this, this.options);
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
