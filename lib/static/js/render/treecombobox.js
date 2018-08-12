// ========================================================
// 树形下拉选择框
// @author shicy <shicy85@163.com>
// Create on 2018-08-12
// ========================================================


(function (backend) {
	if (!backend && VRender.Component.Render.treecombobox)
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
		target.addClass("ui-treecombobox");
		return this;
	};


	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.treecombobox = Renderer;
	}

})(typeof VRender === "undefined");