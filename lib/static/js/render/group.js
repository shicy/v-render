// ========================================================
// 组视图容器
// 可用属性：
// 	orientation: 布局方向，"vertical", "horizontial"
// 	gap: 元素间隔距离
// 	align: 对齐方式，"left", "center", "right", "top", "middle", "bottom"
// @author shicy <shicy85@163.com>
// Create on 2017-12-13
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.group)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	Renderer.VERTICAL = "vertical";
	Renderer.HORIZONTIAL = "horizontial";

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-group");

		var options = this.options || {};

		var orientation = options.orientation;
		if (orientation === Renderer.HORIZONTIAL || orientation === Renderer.VERTICAL) {
			target.addClass(orientation);
			target.attr("opt-orientation", orientation);
		}

		target.attr("opt-gap", options.gap);
		target.attr("opt-align", options.align);

		this.renderSubViews($, target);

		return this;
	};

	_Renderer.renderSubViews = function ($, target) {
		showSubViews.call(this, $, target, this.getChildren());
	};

	_Renderer.getChildren = function () {
		return this.options.children || this.options.subViews || this.options.views;
	};

	// ====================================================
	var showSubViews = function ($, target, children) {
		children = Utils.toArray(children);
		Utils.each(children, function (child) {
			if (Utils.isNotNull(child)) {
				if (Utils.isFunction(child.render))
					child.render(target);
				else 
					target.append(child.$el || child);
			}
		});
		updateLayout.call(this, $, target);
	};

	var updateLayout = function ($, target) {
		var left = top = align = valign = display = "";
		var gap = Utils.getFormatSize(target.attr("opt-gap"), this.isRenderAsRem()) || "";

		var orientation = target.attr("opt-orientation");
		if (orientation == Renderer.HORIZONTIAL) {
			// display = "inline-block";
			left = gap;
		}
		else if (orientation == Renderer.VERTICAL) {
			// display = "block";
			top = gap;
		}
		else {
			top = gap;
		}

		var aligns = target.attr("opt-align") || "";
		aligns = aligns.toLowerCase();
		if (/left/.test(aligns))
			align = "left";
		else if (/center/.test(aligns))
			align = "center";
		else if (/right/.test(aligns))
			align = "right";

		if (/top/.test(aligns))
			valign = "top";
		else if (/middle/.test(aligns))
			valign = "middle";
		else if (/bottom/.test(aligns))
			valign = "bottom";

		target.css("text-align", align);
		var children = target.children();
		// children.css("display", display);
		children.css("vertical-align", valign);
		children.css("margin-left", left).css("margin-top", top);
		children.eq(0).css("margin-left", "").css("margin-top", "");
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.showSubViews = showSubViews;
		Renderer.updateLayout = updateLayout;
		VRender.Component.Render.group = Renderer;
	}

})(typeof VRender === "undefined");