// ========================================================
// 树
// @author shicy <shicy85@163.com>
// Create on 2018-03-29
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.treeview)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./_base").ListRenderer : VRender.Component.Render._list;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		ListRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new ListRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-treeview");

		target.append("<ul class='root'></ul>");
		ListRenderer.render.call(this, $, target);

		return this;
	};

	// ====================================================
	_Renderer._getItemContainer = function ($, target) {
		return target.children("ul");
	};

	// 重构渲染方法，逐层显示展开节点
	_Renderer._renderItems = function ($, target) {
		
		var datas = this.getData();
		if (datas && datas.length > 0) {

		}
		this.show_datas = []; // 当前显示节点（列表）
	};

	// ====================================================
	var renderItems = function ($, target, datas) {

	};

	var renderTreeNode = function () {

	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.treeview = Renderer;
	}

})(typeof VRender === "undefined");