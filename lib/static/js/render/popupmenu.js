// ========================================================
// 弹出菜单
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.popupmenu)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRenderer = backend ? require("./_base").BaseRenderer : VRender.Component.Render._base;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-popupmenu");
		BaseRenderer.render.call(this, $, target);
		return this;
	};


	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.popupmenu = Renderer;
	}

})(typeof VRender === "undefined");