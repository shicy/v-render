// ========================================================
// 边框容器
// @author shicy <shicy85@163.com>
// Create on 2017-01-29
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Container)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("../ui/base")).HolderBase;

	var setCss = function (target, name, value) {
		if (Utils.isNotBlank(value)) {
			if (!isNaN(value))
				value += "px";
			target.css(name, value);
		}
	};

	///////////////////////////////////////////////////////
	var Holder = function (context, options) {
		HolderBase.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		target.addClass("ui-container");

		setCss(target, "padding-left", this.options.paddingLeft);
		setCss(target, "padding-right", this.options.paddingRight);
		setCss(target, "padding-top", this.options.paddingTop);
		setCss(target, "padding-bottom", this.options.paddingBottom);

		setCss(target, "margin-left", this.options.marginLeft);
		setCss(target, "margin-right", this.options.marginRight);
		setCss(target, "margin-top", this.options.marginTop);
		setCss(target, "margin-bottom", this.options.marginBottom);

		setCss(target, "border", this.options.border);
		setCss(target, "border-radius", this.options.borderRadius);
		setCss(target, "border-color", this.options.borderColor);
		setCss(target, "border-width", this.options.borderWidth);
		setCss(target, "border-left", this.options.borderLeft);
		setCss(target, "border-right", this.options.borderRight);
		setCss(target, "border-top", this.options.borderTop);
		setCss(target, "border-bottom", this.options.borderBottom);

		setCss(target, "background", (this.options.bg || this.options.background));
		setCss(target, "background-color", (this.options.bgcolor || this.options.backgroundColor));
		setCss(target, "background-image", (this.options.image || this.options.backgroundImage));

		setCss(target, "width", this.options.width);
		setCss(target, "min-width", this.options.minWidth);
		setCss(target, "max-width", this.options.maxWidth);

		setCss(target, "height", this.options.height);
		setCss(target, "min-height", this.options.minHeight);
		setCss(target, "max-height", this.options.maxHeight);

		setCss(target, "overflow", this.options.overflow);
		setCss(target, "color", this.options.color);
		setCss(target, "text-align", this.options.align);
		setCss(target, "box-shadow", this.options.shadow);

		var contentView = this.options.content || this.options.view;
		if (Utils.isNotBlank(contentView)) {
			if (Utils.isFunction(contentView.render))
				contentView.render(target);
			else
				target.append(contentView);
		}

		return this;
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIContainer = Component.Container = function (view, options) {
		if (this.init(view, options) != this)
			return Component.get(view);
	};
	var _UIContainer = UIContainer.prototype = new Component.base();

	UIContainer.find = function (view) {
		return Component.find(view, ".ui-container", UIContainer);
	};

	UIContainer.create = function (options) {
		options = $.extend({}, options);
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIContainer(target, options, holder);
	};

	// ====================================================
	Component.register(".ui-container", UIContainer);

})(typeof VRender !== "undefined");
