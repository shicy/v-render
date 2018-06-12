// ========================================================
// 表单
// @author shicy <shicy85@163.com>
// Create on 2018-06-10
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var FormViewRender = require("../../static/js/render/formview");


var UIFormView = UIView.extend(module, {

	doInit: function () {
		UIFormView.__super__.doInit.call(this);
		this.renderer = new FormViewRender(this, this.options);
	},

	getViewData: function () {
		// 数据不做渲染
	},
	// setViewData: function (value) {
	// 	this.renderer.setData(value);
	// },

	add: function (name, label, index) {
		return this.renderer.add(name, label, index);
	},

	get: function (name) {
		return this.renderer.get(name);
	},

	getAt: function (index) {
		return this.renderer.getAt(index);
	},

	delete: function (name) {
		this.renderer.delete(name);
	},

	deleteAt: function (index) {
		this.renderer.deleteAt(index);
	},

	getColumns: function () {
		return this.options.columns;
	},
	setColumns: function (value) {
		this.options.columns = value;
	},

	setButtons: function (value) {
		this.options.buttons = value;
	},

	renderView: function () {
		UIFormView.__super__.renderView.call(this);
		this.renderer.render(VRender.$, this.$el);
	}

});
