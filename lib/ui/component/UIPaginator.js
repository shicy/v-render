// ========================================================
// 分页
// 可选属性：total, size, page, status
// @author shicy <shicy85@163.com>
// Create on 2016-12-20
// ========================================================

var UIView = require("../UIView");
var VRender = require("../../v-render");
var PaginatorHolder = require("../../static/js/ui/paginator");


var UIPaginator = UIView.extend(module, {
	doInit: function () {
		UIPaginator.__super__.doInit.call(this);
		this.holder = new PaginatorHolder(this, this.options);
	},

	getTotalCount: function () {
		return this.holder.getTotalCount();
	},
	setTotalCount: function (value) {
		this.options.total = value;
	},

	getPageSize: function () {
		return this.holder.getPageSize();
	},
	setPageSize: function (value) {
		this.options.size = value;
	},

	getPageNo: function () {
		return this.holder.getPageNo();
	},
	setPageNo: function (value) {
		this.options.page = value;
	},

	getPageCount: function () {
		return this.holder.getPageCount();
	},

	getStatus: function () {
		return this.options.status;
	},
	setStatus: function (value) {
		this.options.status = value;
	},
	setTitle: function (value) {
		this.options.status = value;
	},

	render: function (output) {
		UIPaginator.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
