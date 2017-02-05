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
var UIView = require("../UIView");
var VRender = require("../../v-render");
var GroupHolder = require("../../static/js/layout/group");


// 垂直布局，网页默认就是垂直布局
var VERTICAL_ORIENTATION = GroupHolder.VERTICAL;
// 水平布局
var HORIZONTIAL_ORIENTATION = GroupHolder.HORIZONTIAL;

var UIGroup = UIView.extend(module, {
	doInit: function () {
		UIGroup.__super__.doInit.call(this);

		var options = this.options || {};

		var children = options.children || options.subViews || options.views;
		options.children = ArrayUtils.toArray(children);
		delete options.subViews;
		delete options.views;

		this.holder = new GroupHolder(this, options);
	},

	getOrientation: function () {
		return this.options.orientation;
	},
	setOrientation: function (orientation) {
		this.options.orientation = orientation;
	},

	getGap: function (value) {
		return this.options.gap;
	},
	setGap: function (value) {
		this.options.gap = value;
	},

	getAlign: function () {
		return this.options.align;
	},
	setAlign: function (value) {
		this.options.align = value;
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
		if (StringUtils.isNotBlank(child)) {
			if (child instanceof UIView)
				this.options.children.push(child);
			else {
				if (typeof child === "string")
					child = VRender.$(child);
				this.options.children.push(child);
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
		this.holder.render(VRender.$, this.$el);
	}
});

UIGroup.VERTICAL = VERTICAL_ORIENTATION;
UIGroup.HORIZONTIAL = HORIZONTIAL_ORIENTATION;
