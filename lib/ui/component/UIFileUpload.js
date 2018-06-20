// ========================================================
// 文件上传
// @author shicy <shicy85@163.com>
// Create on 2018-06-20
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var FileUploadRender = require("../../static/js/render/fileupload");


var UIFileUpload = UIView.extend(module, {

	getAction: function () {
		return this.options.action;
	},
	setAction: function (value) {
		this.options.action = value;
	},

	getActionBefore: function () {
		return this.options.actionBefore;
	},
	setActionBefore: function (value) {
		this.options.actionBefore = value;
	},

	getParams: function () {
		return this.options.params;
	},
	setParams: function (value) {
		this.options.params = value;
	},

	getUploadName: function () {
		return this.options.uploadName;
	},
	setUploadName: function (value) {
		this.options.uploadName = value;
	},

	getBrowser: function () {
		return this.options.browser;
	},
	setBrowser: function (value) {
		this.options.browser = value;
	},

	isMultiple: function () {
		if (this.options.hasOwnProperty("multiple"))
			return Utils.isTrue(this.options.multiple);
		return Utils.isTrue(this.options.multi);
	},
	setMultiple: function (value) {
		this.options.multi = Utils.isNull(value) ? true : Utils.isTrue(value);
		delete this.options.multiple;
	},

	getFilter: function () {
		return this.options.filter;
	},
	setFilter: function (value) {
		this.options.filter = value;
	},

	isAutoUpload: function () {
		if (this.options.hasOwnProperty("autoUpload"))
			return Utils.isTrue(this.options.autoUpload);
		return true;
	},
	setAutoUpload: function (value) {
		this.options.autoUpload = Utils.isNull(value) ? true : Utils.isTrue(value);
	},

	render: function (output) {
		UIFileUpload.__super__.render.call(this, output);
		var renderer = new FileUploadRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});
