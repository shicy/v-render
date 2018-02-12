// ========================================================
// 分页
// 可选属性：total, size, page, status
// @author shicy <shicy85@163.com>
// Create on 2016-12-20
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var PaginatorRenderer = require("../../static/js/render/paginator");


var UIPaginator = UIView.extend(module, {
	doInit: function () {
		UIPaginator.__super__.doInit.call(this);
		this.renderer = new PaginatorRenderer(this, this.options);
	},

	getPage: function () {
		return this.options.page;
	},
	setPage: function (value) {
		this.options.page = value;
	},

	getSize: function () {
		return this.options.size;
	},
	setSize: function (value) {
		this.options.size = value;
	},

	getTotal: function () {
		return this.options.total;
	},
	setTotal: function (value) {
		this.options.total = value;
	},

	getMode: function () {
		return this.options.mode;
	},
	setMode: function (value) {
		this.options.mode = value;
	},

	getStatus: function () {
		return this.options.status;
	},
	setStatus: function (value) {
		this.options.status = value;
	},

	getButtons: function () {
		return this.options.buttons;
	},
	setButtons: function (value) {
		this.options.buttons = value;
	},

	getSkip: function () {
		return this.options.skip;
	},
	setSkip: function (value) {
		this.options.skip = value;
	},

	getShowNum: function () {
		var value = parseInt(this.options.showNum);
		return value > 0 ? value : 10;
	},
	setShowNum: function (value) {
		this.options.showNum = value;
	},

	getSizes: function () {
		return this.options.sizes;
	},
	setSizes: function (value) {
		this.options.sizes = value;
	},

	render: function (output) {
		UIPaginator.__super__.render.call(this, output);
		this.renderer.render(VRender.$, this.$el);
	}
});
