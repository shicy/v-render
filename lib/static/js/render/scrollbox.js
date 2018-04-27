// ========================================================
// 滚动加载
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.scrollbox)
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
		target.addClass("ui-scrollbox");

		BaseRenderer.render.call(this, $, target);
		renderContentView.call(this, $, target);

		var options = this.options || {};

		var scrollContainer = getScrollContainer.call(this);
		if (scrollContainer)
			target.attr("opt-scroll", scrollContainer);

		if (options.loadDistance || options.loadDistance === 0)
			target.attr("opt-l-d", options.loadDistance);

		return this;
	};

	// ====================================================
	var renderContentView = function ($, target) {
		target = $("<div class='container'></div>").appendTo(target);
		var contentView = this.options.content || this.options.view;
		if (contentView) {
			if (Utils.isFunction(contentView.render)) {
				contentView.render(target);
			}
			else {
				target.append(contentView.$el || contentView);
			}
		}
	};

	// ====================================================
	var getScrollContainer = function () {
		var container = this.options.scroller;
		if (container) {
			if (Utils.isFunction(container.getViewId))
				return "[vid='" + container.getViewId() + "']";
			if (typeof container == "string")
				return Utils.trimToNull(container);
		}
		return null;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.scrollbox = Renderer;
	}

})(typeof VRender === "undefined");