// ========================================================
// 组视图容器
// 可用属性：
// 	orientation: 布局方向，UIGroup.VERTICAL("vertical"), UIGroup.HORIZONTIAL(horizontial)
// 	gap: 元素间隔距离
// 	align: 对齐方式，"left", "center", "right", "top", "middle", "bottom"
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var Utils = require("../../util/Utils");
var ArrayUtils = require("../../util/ArrayUtils");
var StringUtils = require("../../util/StringUtils");
var DomHelper = require("../dom/DomHelper");
var UIView = require("../UIView");


// 垂直布局，网页默认就是垂直布局
var VERTICAL_ORIENTATION = "vertical";
// 水平布局
var HORIZONTIAL_ORIENTATION = "horizontial";

var UIGroup = UIView.extend(module, {
	doInit: function () {
		UIGroup.__super__.doInit.call(this);
		this.setOrientation(this.options.orientation);
		this.setGap(this.options.gap);
		this.setAlign(this.options.align);
	},

	getOrientation: function () {
		return this.orientation;
	},
	setOrientation: function (orientation) {
		if (orientation === VERTICAL_ORIENTATION || orientation === HORIZONTIAL_ORIENTATION)
			this.orientation = orientation;
		else 
			this.orientation = null;
	},

	getGap: function (value) {
		return this.gap;
	},
	setGap: function (value) {
		this.gap = value;
	},

	getAlign: function () {
		return this.align;
	},
	setAlign: function (value) {
		this.align = value;
	},

	append: function (value) {
		if (arguments) {
			for (var i = 0, l = arguments.length; i < l; i++) {
				this.addChild(arguments[i]);
			}
		}
		return this;
	},

	addChild: function (child) {
		if (Utils.notNull(child)) {
			if (!ArrayUtils.isArray(this.children))
				this.children = [];
			if (child instanceof UIView)
				this.children.push(child);
			else {
				child = DomHelper.create({src: child});
				this.children.push(child);
			}
		}
		return child;
	},

	addChildren: function (children) {
		var self = this;
		ArrayUtils.each(ArrayUtils.toArray(children), function (child) {
			self.addChild(child);
		});
		return this;
	},

	render: function (output) {
		UIGroup.__super__.render.call(this, output);

		// 垂直方向就不加“ui-group”样式了，按默认的就行
		var orientation = this.getOrientation();
		if (orientation === HORIZONTIAL_ORIENTATION) {
			this.$el.addClass("ui-group").addClass(HORIZONTIAL_ORIENTATION);
			// this.$el.attr("data-orientation", HORIZONTIAL_ORIENTATION);
		}

		var gap = parseInt(this.getGap()) || 0;
		if (gap != 0)
			this.$el.attr("data-gap", gap);

		var align = StringUtils.trimToNull(this.getAlign());
		if (align) {
			this.$el.attr("data-align", align);
			if (/left|center|right/.test(align))
				this.$el.css("text-align", align);
		}

		if (this.children && this.children.length > 0) {
			var target = this.$el;
			ArrayUtils.each(this.children, function (child) {
				if (child instanceof UIView)
					child.render(target);
				else 
					target.append(child);
			});

			var children = target.children();
			if (/top|middle|bottom/.test(align))
				children.css("vertical-align", align);
			if (gap != 0 && children.length > 1) {
				var gapName = orientation === HORIZONTIAL_ORIENTATION ? "margin-right" : "margin-bottom";
				children.not(":last-child").css(gapName, gap + "px");
			}
		}
	}
});

UIGroup.VERTICAL = VERTICAL_ORIENTATION;
UIGroup.HORIZONTIAL = HORIZONTIAL_ORIENTATION;
