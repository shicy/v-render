// ========================================================
// 表单
// @author shicy <shicy85@163.com>
// Create on 2018-06-10
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var FormViewRender = require("../../static/js/render/formview");


var VERTICAL_ORIENTATION = FormViewRender.VERTICAL;
var HORIZONTIAL_ORIENTATION = FormViewRender.HORIZONTIAL;

var UIFormView = UIView.extend(module, {

	doInit: function (done) {
		UIFormView.super(this, (function () {
			this.renderer = new FormViewRender(this, this.options);
			if (Utils.isFunction(done))
				done();
		}).bind(this));
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

	getAction: function () {
		return this.options.action;
	},
	setAction: function (value) {
		this.options.action = value;
	},

	getMethod: function () {
		return this.options.method;
	},
	setMethod: function (value) {
		this.options.method = value;
	},

	getParams: function () {
		return this.options.params;
	},
	setParams: function (value) {
		this.options.params = value;
	},

	setButtons: function (value) {
		this.options.buttons = value;
	},

	getLabelWidth: function () {
		return this.options.labelWidth;
	},
	setLabelWidth: function (value) {
		this.options.labelWidth = value;
	},

	getLabelAlign: function () {
		return this.options.labelAlign;
	},
	setLabelAlign: function (value) {
		this.options.labelAlign = value;
	},

	getOrientation: function () {
		return this.options.orientation;
	},
	setOrientation: function (value) {
		this.options.orientation = value;
	},

	renderView: function () {
		UIFormView.super(this);
		this.renderer.render(VRender.$, this.$el);
	}

});

UIFormView.VERTICAL = VERTICAL_ORIENTATION;
UIFormView.HORIZONTIAL = HORIZONTIAL_ORIENTATION;
