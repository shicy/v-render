// ========================================================
// 前后端（通用）渲染方法
// @author shicy <shicy85@163.com>
// Create on 2017-12-12
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.dropdownlist)
		return ;

	///////////////////////////////////////////////////////
	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./base").ListRenderer : VRender.Component.Render._list;

	var Renderer = function (context, options) {

	};
	var _Renderer = Renderer.prototype = new ListRenderer();

	// ====================================================
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.dropdownlist = Renderer;
	}

})(typeof VRender === "undefined");
