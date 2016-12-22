// ========================================================
// 分页
// @author shicy <shicy85@163.com>
// Create on 2016-12-20
// ========================================================

var UIView = require("../UIView");
var VRender = require(__vrender__);
var PaginatorHolder = require("../../static/js/ui/paginator");


var UIPaginator = UIView.extend(module, {
	doInit: function () {
		UIPaginator.__super__.doInit.call(this);
		this.holder = new PaginatorHolder(this.options);
	},

	getTotalCount: function () {
		return this.holder.getTotalCount();
	},
	setTotalCount: function (value) {
		this.holder.setTotalCount(value);
	},

	getPageSize: function () {
		return this.holder.getPageSize();
	},
	setPageSize: function (value) {
		this.holder.setPageSize(value);
	},

	getPageNo: function () {
		return this.holder.getPageNo();
	},
	setPageNo: function (value) {
		this.holder.setPageNo(value);
	},

	getPageCount: function () {
		return this.holder.getPageCount();
	},

	getStatus: function () {
		return this.holder.getStatus();
	},
	setStatus: function (value) {
		this.holder.setStatus(value);
	},

	render: function (output) {
		UIPaginator.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
