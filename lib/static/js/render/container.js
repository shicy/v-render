// ========================================================
// 边框容器
// @author shicy <shicy85@163.com>
// Create on 2017-12-18
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.container)
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
		BaseRenderer.render.call(this, $, target);
		target.addClass("ui-container");

		var styles = this.options && this.options.styles || {};
		var rem = this.isRenderAsRem();

		setCss(target, "display", styles.display);
		setCss(target, "position", styles.position);
		
		setCss(target, "padding", styles.padding, rem);
		setCss(target, "padding-left", styles.paddingLeft, rem);
		setCss(target, "padding-right", styles.paddingRight, rem);
		setCss(target, "padding-top", styles.paddingTop, rem);
		setCss(target, "padding-bottom", styles.paddingBottom, rem);

		setCss(target, "margin", styles.margin, rem);
		setCss(target, "margin-left", styles.marginLeft, rem);
		setCss(target, "margin-right", styles.marginRight, rem);
		setCss(target, "margin-top", styles.marginTop, rem);
		setCss(target, "margin-bottom", styles.marginBottom, rem);

		setCss(target, "border", styles.border, rem);
		setCss(target, "border-radius", styles.borderRadius, rem);
		setCss(target, "border-color", styles.borderColor);
		setCss(target, "border-width", styles.borderWidth, rem);
		setCss(target, "border-left", styles.borderLeft, rem);
		setCss(target, "border-right", styles.borderRight, rem);
		setCss(target, "border-top", styles.borderTop, rem);
		setCss(target, "border-bottom", styles.borderBottom, rem);

		setCss(target, "background", (styles.bg || styles.background));
		setCss(target, "background-color", (styles.bgcolor || styles.backgroundColor));
		setCss(target, "background-image", (styles.image || styles.backgroundImage));
		setCss(target, "background-size", styles.backgroundSize);
		setCss(target, "background-position", styles.backgroundPosition);
		setCss(target, "background-repeat", styles.backgroundRepeat);

		setCss(target, "width", styles.width, rem);
		setCss(target, "min-width", styles.minWidth, rem);
		setCss(target, "max-width", styles.maxWidth, rem);

		setCss(target, "height", styles.height, rem);
		setCss(target, "min-height", styles.minHeight, rem);
		setCss(target, "max-height", styles.maxHeight, rem);

		setCss(target, "overflow", styles.overflow);
		setCss(target, "color", styles.color);
		setCss(target, "font-size", styles.fontSize, rem);
		setCss(target, "text-align", (styles.align || styles.textAlign));
		setCss(target, "box-shadow", styles.shadow);

		var contentView = this.options.content || this.options.view;
		if (Utils.isNotBlank(contentView)) {
			if (Utils.isFunction(contentView.render))
				contentView.render(target);
			else
				target.append(contentView.$el || contentView);
		}

		return this;
	};

	// ====================================================
	var setCss = function (target, name, value, useREM) {
		if (Utils.isNotBlank(value)) {
			if (!isNaN(value)) {
				value = Utils.getMeasureSize(value, useREM);
			}
			target.css(name, value);
		}
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.container = Renderer;
	}

})(typeof VRender === "undefined");