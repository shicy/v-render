// ========================================================
// 文本输入框
// 可选属性：value, prompt, type|dataType, desc|description, tips, 
// 	width, readonly, required, empty, errmsg, decimals, min, max,
// 	maxSize, multi, displayAsPwd
// @author shicy <shicy85@163.com>
// Create on 2016-12-04
// ========================================================

var Utils = require("../../util/Utils");
var StringUtils = require("../../util/StringUtils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var TextViewRender = require("../../static/js/render/textview");


var UITextView = UIView.extend(module, {
	doInit: function () {
		UITextView.__super__.doInit.call(this);
		this.renderer = new TextViewRender(this, this.options);
	},

	getValue: function () {
		return this.options.value;
	},
	setValue: function (value) {
		this.options.value = value;
	},

	getPrompt: function () {
		return this.options.prompt;
	},
	setPrompt: function (value) {
		this.options.prompt = value;
	},

	getDataType: function () {
		return this.options.dataType || this.options.type;
	},
	setDataType: function (value) {
		this.options.dataType = value;
		delete this.options.type;
	},

	getDescription: function () {
		return this.options.description || this.options.desc;
	},
	setDescription: function (value) {
		this.options.description = value;
		delete this.options.desc;
	},

	getTips: function () {
		return this.options.tips;
	},
	setTips: function (value) {
		this.options.tips = value;
	},

	isReadonly: function () {
		return Utils.isTrue(this.options.readonly);
	},
	setReadonly: function (bool) {
		this.options.readonly = bool;
	},

	isRequired: function () {
		return Utils.isTrue(this.options.required);
	},
	setRequired: function (value) {
		this.options.required = value;
	},

	getEmptyMsg: function () {
		return this.options.empty;
	},
	setEmptyMsg: function (value) {
		this.options.empty = value;
	},

	getErrorMsg: function () {
		return this.options.errmsg;
	},
	setErrorMsg: function (value) {
		this.options.errmsg = value;
	},

	getDecimals: function () {
		return this.renderer.getDecimals();
	},
	setDecimals: function (value) {
		this.options.decimals = value;
	},

	getMinValue: function () {
		return parseFloat(this.options.min);
	},
	setMinValue: function (value) {
		this.options.min = value;
	},

	getMaxValue: function () {
		return parseFloat(this.options.max);
	},
	setMaxValue: function (value) {
		this.options.max = value;
	},

	getMaxSize: function () {
		return parseFloat(this.options.maxSize) || 0;
	},
	setMaxSize: function (value) {
		this.options.maxSize = value;
	},

	isMultiline: function () {
		return this.renderer.isMultiline();
	},
	setMultiline: function (bool) {
		this.options.multi = Utils.isNull(bool) ? true : bool;
		delete this.options.multiple;
	},

	isDisplayAsPassword: function () {
		return Utils.isTrue(this.options.displayAsPwd);
	},
	setDisplayAsPassword: function (bool) {
		this.options.displayAsPwd = bool;
	},

	///////////////////////////////////////////////////////
	render: function (output) {
		UITextView.__super__.render.call(this, output);
		this.renderer.render(VRender.$, this.$el);
	}
});
