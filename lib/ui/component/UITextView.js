// ========================================================
// 文本输入框
// @author shicy <shicy85@163.com>
// Create on 2016-12-04
// ========================================================

var UIView = require("../UIView");
var TextViewHolder = require("../../static/js/ui/textview");
var VRender = require(__vrender__);


var UITextView = UIView.extend(module, {
	doInit: function () {
		UITextView.__super__.doInit.call(this);
		this.holder = new TextViewHolder(this.options);
	},

	getValue: function () {
		return this.holder.getValue();
	},
	setValue: function (value) {
		this.holder.setValue(value);
	},

	getPrompt: function () {
		return this.holder.getPrompt();
	},
	setPrompt: function (value) {
		this.holder.setPrompt(value);
	},

	getDataType: function () {
		return this.holder.getDataType();
	},
	setDataType: function (value) {
		this.holder.setDataType(value);
	},

	getDescription: function () {
		return this.holder.getDescription();
	},
	setDescription: function (value) {
		this.holder.setDescription(value);
	},

	getTips: function () {
		return this.holder.getTips();
	},
	setTips: function (value) {
		this.holder.setTips(value);
	},

	getWidth: function () {
		return this.holder.getWidth();
	},
	setWidth: function (value) {
		this.holder.setWidth(value);
	},

	isReadonly: function () {
		return this.holder.isReadonly();
	},
	setReadonly: function (bool) {
		this.holder.setReadonly(bool);
	},

	isRequired: function () {
		return this.holder.isRequired();
	},
	setRequired: function (value) {
		this.holder.setRequired(value);
	},

	getEmptyMsg: function () {
		return this.holder.getEmptyMsg();
	},
	setEmptyMsg: function (value) {
		this.holder.setEmptyMsg(value);
	},

	getErrorMsg: function () {
		return this.holder.getErrorMsg();
	},
	setErrorMsg: function (value) {
		this.holder.setErrorMsg(value);
	},

	getDecimals: function () {
		return this.holder.getDecimals();
	},
	setDecimals: function (value) {
		this.holder.setDecimals(value);
	},

	getMinValue: function () {
		return this.holder.getMinValue();
	},
	setMinValue: function (value) {
		this.holder.setMinValue(value);
	},

	getMaxValue: function () {
		return this.holder.getMinValue();
	},
	setMaxValue: function (value) {
		this.holder.setMinValue(value);
	},

	getMaxSize: function () {
		return this.holder.getMaxSize();
	},
	setMaxSize: function (value) {
		this.holder.setMaxSize(value);
	},

	isMultiline: function () {
		return this.holder.isMultiline();
	},
	setMultiline: function (bool) {
		this.holder.setMultiline(bool);
	},

	isDisplayAsPassword: function () {
		return this.holder.isDisplayAsPassword();
	},
	setDisplayAsPassword: function (bool) {
		this.holder.setDisplayAsPassword(bool);
	},

	///////////////////////////////////////////////////////
	render: function (output) {
		UITextView.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
