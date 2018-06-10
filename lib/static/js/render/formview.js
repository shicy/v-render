// ========================================================
// 表单
// @author shicy <shicy85@163.com>
// Create on 2018-06-10
// ========================================================


(function (backend) {
	if (!backend && VRender.Component.Render.formview)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-formview");

		this.formItems = [];
		renderView.call(this, $, target);

		return this;
	};

	// ====================================================
	_Renderer.add = function (name, label, index) {
		var formItem = new FormItem(name, label);
	};

	_Renderer.delete = function (name) {

	};

	_Renderer.deleteAt = function (index) {

	};

	// ====================================================
	var renderView = function ($, target) {

	};

	///////////////////////////////////////////////////////
	var FormItem = function (name, label) {
		this.name = name;
		this.label = label;
	};
	var _FormItem = FormItem.prototype = new Object();

	_FormItem.getName = function () {
		return this.name;
	};

	_FormItem.getLabel = function () {
		return this.label;
	};

	_FormItem.content = function (value) {
		return this;
	};

	_FormItem.required = function () {
		return this;
	};

	_FormItem.validate = function (value) {
		return this;
	};


	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.formview = Renderer;
	}

})(typeof VRender === "undefined");