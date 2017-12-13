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
	var HolderBase = (isFront ? VRender.Component : require("../ui/_base")).HolderBase;

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

		var options = this.options || {};

		setCss(target, "padding-left", options.paddingLeft);
		setCss(target, "padding-right", options.paddingRight);
		setCss(target, "padding-top", options.paddingTop);
		setCss(target, "padding-bottom", options.paddingBottom);

		setCss(target, "margin-left", options.marginLeft);
		setCss(target, "margin-right", options.marginRight);
		setCss(target, "margin-top", options.marginTop);
		setCss(target, "margin-bottom", options.marginBottom);

		setCss(target, "border", options.border);
		setCss(target, "border-radius", options.borderRadius);
		setCss(target, "border-color", options.borderColor);
		setCss(target, "border-width", options.borderWidth);
		setCss(target, "border-left", options.borderLeft);
		setCss(target, "border-right", options.borderRight);
		setCss(target, "border-top", options.borderTop);
		setCss(target, "border-bottom", options.borderBottom);

		setCss(target, "background", (options.bg || options.background));
		setCss(target, "background-color", (options.bgcolor || options.backgroundColor));
		setCss(target, "background-image", (options.image || options.backgroundImage));

		setCss(target, "width", options.width);
		setCss(target, "min-width", options.minWidth);
		setCss(target, "max-width", options.maxWidth);

		setCss(target, "height", options.height);
		setCss(target, "min-height", options.minHeight);
		setCss(target, "max-height", options.maxHeight);

		setCss(target, "overflow", options.overflow);
		setCss(target, "color", options.color);
		setCss(target, "text-align", options.align);
		setCss(target, "box-shadow", options.shadow);

		var contentView = options.content || options.view;
		if (Utils.isNotBlank(contentView)) {
			if (Utils.isFunction(contentView.render))
				contentView.render(target);
			else
				target.append(contentView.$el || contentView);
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
	// Component.register(".ui-container", UIContainer); // 默认不实例化

})(typeof VRender !== "undefined");
