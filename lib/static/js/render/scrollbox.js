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

		target.append("<div class='top'></div>");
		target.append("<div class='container'></div>");
		target.append("<div class='bottom'></div>");

		BaseRenderer.render.call(this, $, target);
		renderContentView.call(this, $, target);
		renderTopView.call(this, $, target);
		renderBottomView.call(this, $, target);

		if (backend) {
			var options = this.options || {};

			var scrollContainer = getScrollContainer.call(this);
			if (scrollContainer)
				target.attr("opt-scroll", scrollContainer);

			if (options.topDistance || options.topDistance === 0)
				target.attr("opt-top", options.topDistance);
			if (options.bottomDistance || options.bottomDistance === 0)
				target.attr("opt-bottom", options.bottomDistance);

			BaseRenderer.renderFunction(target, "refresh", options.refreshFunction);
			BaseRenderer.renderFunction(target, "more", options.moreFunction);
		}

		return this;
	};

	// ====================================================
	var renderContentView = function ($, target) {
		target = target.children(".container");
		var contentView = this.options.content || this.options.view;
		if (contentView) {
			renderView(target, contentView);
		}
	};

	var renderTopView = function ($, target) {
		target = target.children(".top").empty();
		var options = this.options || {};

		if (options.refreshView) {
			renderView(target, this.options.refreshView);
		}
		else {
			var refreshView = $("<div class='scrollbox-refreshdef'></div>").appendTo(target);

			var pullText = Utils.isNull(options.refreshPullText) ? "下拉刷新" : Utils.trimToEmpty(options.refreshPullText);
			if (pullText) {
				$("<div class='pull'></div>").appendTo(refreshView).text(pullText);
			}

			var dropText = Utils.isNull(options.refreshDropText) ? "松开刷新" : Utils.trimToEmpty(options.refreshDropText);
			if (dropText) {
				$("<div class='drop'></div>").appendTo(refreshView).text(dropText);
			}

			var loadText = Utils.isNull(options.refreshLoadText) ? "正在刷新.." : Utils.trimToEmpty(options.refreshLoadText);
			if (loadText) {
				$("<div class='load'></div>").appendTo(refreshView).text(loadText);
			}
		}
	};

	var renderBottomView = function ($, target) {
		target = target.children(".bottom").empty();

		var container = $("<div class='scrollbox-load'></div>").appendTo(target);
		if (this.options.loadingView) {
			renderView(container, this.options.loadingView);
		}
		else {
			var loadView = $("<div class='scrollbox-loaddef'></div>").appendTo(container);
			var loadText = this.options.loadingText;
			loadText = Utils.isNull(loadText) ? "正在加载.." : Utils.trimToEmpty(loadText);
			if (loadText) {
				$("<p></p>").appendTo(loadView).text(loadText);
			}
		}

		container = $("<div class='scrollbox-bottom'></div>").appendTo(target);
		if (this.options.bottomView) {
			renderView(container, this.options.bottomView);
		}
		else {
			var bottomView = $("<div class='scrollbox-bottomdef'></div>").appendTo(container);
			var bottomText = this.options.bottomText;
			bottomText = Utils.isNull(bottomText) ? "没有更多了" : Utils.trimToEmpty(bottomText);
			if (bottomText) {
				$("<p></p>").appendTo(bottomView).text(bottomText);
			}
		}
	};

	// var renderEmptyView = function ($, target) {
	// 	var container = $("<div></div>").appendTo(target);
	// 	container.addClass((className || "ui") + "-empty");
	// 	var emptyView = null;
	// 	if (this.options.hasOwnProperty("emptyView")) {
	// 		emptyView = this.options.emptyView;
	// 		if (emptyView) {
	// 			if (Utils.isFunction(emptyView.render))
	// 				emptyView.render(container);
	// 			else 
	// 				container.append(emptyView);
	// 		}
	// 	}
	// 	else {
	// 		emptyView = $("<div></div>").appendTo(container);
	// 		emptyView.addClass((className || "ui") + "-emptydef");
	// 		var emptyText = this.options.emptyText || this.options.empty;
	// 		emptyText = Utils.isNull(emptyText) ? "没有数据" : Utils.trimToEmpty(emptyText);
	// 		if (emptyText) {
	// 			$("<p></p>").appendTo(emptyView).html(emptyText);
	// 		}
	// 	}
	// 	return container;
	// };

	var renderView = function (target, view) {
		if (Utils.isFunction(view.render))
			view.render(target);
		else
			target.append(view.$el || view);
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