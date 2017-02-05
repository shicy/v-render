// ========================================================
// 组视图容器
// 可用属性：
// 	orientation: 布局方向，"vertical", "horizontial"
// 	gap: 元素间隔距离
// 	align: 对齐方式，"left", "center", "right", "top", "middle", "bottom"
// @author shicy <shicy85@163.com>
// Create on 2017-01-31
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Group)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("../ui/base")).HolderBase;

	///////////////////////////////////////////////////////
	var Holder = function (context, options) {
		HolderBase.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderBase();

	Holder.VERTICAL = "vertical";
	Holder.HORIZONTIAL = "horizontial";

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		target.addClass("ui-group");

		var options = this.options || {};

		var orientation = options.orientation;
		if (orientation === Holder.HORIZONTIAL || orientation === Holder.VERTICAL) {
			target.addClass(orientation);
			target.attr("data-orientation", orientation);
		}

		if (Utils.isNotBlank(options.gap) && options.gap !== 0)
			target.attr("data-gap", options.gap);

		var align = Utils.trimToEmpty(options.align).toLowerCase();
		if (align) {
			target.attr("data-align", align);
			if (/left/.test(align))
				target.css("text-align", "left");
			else if (/center/.test(align))
				target.css("text-align", "center");
			else if (/right/.test(align))
				target.css("text-align", "right");
		}

		renderChildren.call(this, $, target, 
			(options.children || options.subViews || options.views));

		return this;
	};

	// ====================================================
	var renderChildren = function ($, target, children) {
		children = Utils.toArray(children);
		Utils.each(children, function (child) {
			if (Utils.isNotNull) {
				if (Utils.isFunction(child.render))
					child.render(target);
				else 
					target.append(child.$el || child);
			}
		});
		renderChildrenGap.call(this, $, target);
	};

	var renderChildrenGap = function ($, target) {
		var children = target.children();

		var left = top = valign = display = "";

		var orientation = target.attr("data-orientation");
		var gap = Utils.trimToEmpty(target.attr("data-gap"));
		var align = target.attr("data-align");

		if (gap && !isNaN(gap))
			gap += "px";

		if (orientation === Holder.HORIZONTIAL) {
			display = "inline-block";
			left = gap;
			if (/top/.test(align))
				valign = "top";
			else if (/middle/.test(align))
				valign = "middle";
			else if (/bottom/.test(align))
				valign = "bottom";
		}
		else {
			if (orientation === Holder.VERTICAL)
				display = "block";
			top = gap;
		}

		children.css("display", display).css("vertical-align", valign);
		children.not(":eq(0)").css("margin-left", left).css("margin-top", top);
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIGroup = Component.Group = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UIGroup = UIGroup.prototype = new Component.base();

	UIGroup.find = function (view) {
		return Component.find(view, ".ui-group", UIGroup);
	};

	UIGroup.create = function (options) {
		options = $.extend({}, options);
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIGroup(target, options, holder);
	};

	// ====================================================
	_UIGroup.doLayout = function () {
		layoutChanged.call(this);
	};

	_UIGroup.setOrientation = function (value) {
		this.$el.removeClass(Holder.HORIZONTIAL).removeClass(Holder.VERTICAL);
		if (value === Holder.HORIZONTIAL || value === Holder.VERTICAL) {
			this.$el.addClass(value).attr("data-orientation", value);
		}
		else {
			this.$el.removeAttr("data-orientation");
		}
		layoutChanged.call(this);
	};

	_UIGroup.setGap = function (value) {
		if (Utils.isNotBlank(value) && value !== 0) {
			this.$el.attr("data-gap", value);
		}
		else {
			this.$el.removeAttr("data-gap");
		}
		layoutChanged.call(this);
	};

	_UIGroup.setAlign = function (value) {
		this.$el.attr("data-align", (value || ""));
		var align = valign = "";
		if (/left/.test(value))
			align = "left";
		else if (/center/.test(value))
			align = "center";
		else if (/right/.test(value))
			align = "right";
		this.$el.css("text-align", align);

		if (/top/.test(value))
			valign = "top";
		else if (/middle/.test(value))
			valign = "middle";
		else if (/bottom/.test(value))
			valign = "bottom";
		this.$el.children().css("vertical-align", valign);
	};

	_UIGroup.append = function (values) {
		return this.addChildren(Array.prototype.slice.call(arguments));
	};

	_UIGroup.addChild = function (child) {
		if (Utils.isNotBlank(child)) {
			this.$el.append(child.$el || child);
		}
		return child;
	};

	_UIGroup.addChildren = function (children) {
		var self = this;
		Utils.each(Utils.toArray(children), function (child) {
			self.addChild(child);
		});
		return this;
	};

	// ====================================================
	var layoutChanged = function () {
		var self = this;
		setTimeout(function () {
			renderChildrenGap.call(self, $, self.$el);
		}, 0);
	};

	// ====================================================
	// Component.register(".ui-group", UIGroup); // 默认不实例化

})(typeof VRender !== "undefined");
