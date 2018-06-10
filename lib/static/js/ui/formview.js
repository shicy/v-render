// ========================================================
// 表单
// @author shicy <shicy85@163.com>
// Create on 2018-06-10
// ========================================================


(function () {
	if (VRender.Component.FormView)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var FormViewRender = Renderer.formview;

	///////////////////////////////////////////////////////
	var UIFormView = window.UIFormView = Component.FormView = function (view, options) {
		if (!Component.base.isElement(view))
			return UIFormView.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UIFormView = UIFormView.prototype = new Component.base();

	UIFormView.find = function (view) {
		return Component.find(view, ".ui-formview", UIFormView);
	};

	UIFormView.create = function (options) {
		return Component.create(options, UIFormView, FormViewRender);
	};

	// ====================================================
	

	// ====================================================
	

	// ====================================================
	
	// ====================================================
	Component.register(".ui-formview", UIFormView);

})();