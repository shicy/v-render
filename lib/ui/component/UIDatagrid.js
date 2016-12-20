// ========================================================
// 数据表格
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

var UIView = require("../UIView");
var VRender = require(__vrender__);
var DatagridHolder = require("../../static/js/ui/datagrid");


var UIDatagrid = UIView.extend(module, {
	doInit: function () {
		UIDatagrid.__super__.doInit.call(this);
		this.holder = new DatagridHolder(this.options);
	},

	getMapData: function () {
		//
	},

	getColumns: function () {
		return this.holder.getColumns();
	},
	setColumns: function (value) {
		this.holder.setColumns(value);
	},

	isChkboxVisible: function () {
		return this.holder.isChkboxVisible();
	},
	setChkboxVisible: function (bool) {
		this.holder.setChkboxVisible(bool);
	},

	isMultiSelected: function () {
		return this.holder.isMultiSelected();
	},
	setMultiSelected: function (bool) {
		this.holder.setMultiSelected(bool);
	},

	getSelectedIndexs: function () {
		return this.holder.getSelectedIndexs();
	},
	setSelectedIndexs: function (value) {
		this.holder.setSelectedIndexs(value);
	},

	getSelectedIds: function () {
		return this.holder.getSelectedIds();
	},
	setSelectedIds: function (value) {
		this.holder.setSelectedIds(value);
	},

	getSelectedItems: function () {
		return this.holder.getSelectedItems();
	},
	setSelectedItems: function (value) {
		this.holder.setSelectedItems(value);
	},

	getIdField: function () {
		return this.holder.getIdField();
	},
	setIdField: function (value) {
		this.holder.setIdField(value);
	},

	getEmptyText: function () {
		return this.holder.getEmptyText();
	},
	setEmptyText: function (value) {
		this.holder.setEmptyText(value);
	},

	getEmptyView: function () {
		return this.holder.getEmptyView();
	},
	setEmptyView: function (value) {
		this.holder.setEmptyView(value);
	},

	isEmptyVisible: function () {
		return this.holder.isEmptyVisible();
	},
	setEmptyVisible: function (bool) {
		this.holder.setEmptyVisible(bool);
	},

	isHeaderVisible: function () {
		return this.holder.isHeaderVisible();
	},
	setHeaderVisible: function (bool) {
		this.holder.setHeaderVisible(bool);
	},

	getColumnRenderer: function () {
		return this.holder.getColumnRenderer();
	},
	setColumnRenderer: function (value) {
		this.holder.setColumnRenderer(value);
	},

	getDataMapper: function () {
		return this.holder && this.holder.getRowDataMap();
	},
	setDataMapper: function (value) {
		this.holder && this.holder.setRowDataMap(value);
	},

	getPaginator: function () {
		return this.holder.getPaginator();
	},
	setPaginator: function (value) {
		this.holder.setPaginator(value);
	},

	getSearcher: function () {
		return this.holder.getSearcher();
	},
	setSearcher: function (value) {
		this.holder.setSearcher(value);
	},

	render: function (output) {
		UIDatagrid.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
