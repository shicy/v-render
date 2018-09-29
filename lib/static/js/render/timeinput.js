// ========================================================
// 时间输入框
// @author shicy <shicy85@163.com>
// Create on 2018-09-29
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.timeinput)
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
		target.addClass("ui-timeipt");

		// if (Utils.isTrue(this.options.native))
		// 	target.attr("opt-native", "1");

		// 容器，用于下拉列表定位
		target.attr("opt-box", this.options.container);

		return this;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.timeinput = Renderer;
	}

})(typeof VRender === "undefined");