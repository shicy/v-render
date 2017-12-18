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
var GroupRenderer = require("../../static/js/render/group");


// 垂直布局，网页默认就是垂直布局
var VERTICAL_ORIENTATION = GroupRenderer.VERTICAL;
// 水平布局
var HORIZONTIAL_ORIENTATION = GroupRenderer.HORIZONTIAL;

var UIGroup = UIView.extend(module, {
	doInit: function () {
		UIGroup.__super__.doInit.call(this);

		var options = this.options || {};

		var children = options.children || options.subViews || options.views;
		options.children = ArrayUtils.toArray(children);
		delete options.subViews;
		delete options.views;

		this.holder = new GroupRenderer(this, options);
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

	// 第一个参数为 true 将被忽略
	// 第一个参数为 false 将不会解析添加的内容（直接添加）
	append: function (value) {
		if (!arguments || arguments.length == 0)
			return this;
		var options = null;
		var argIndex = 0;
		if (arguments[0] === true || arguments[0] === false) {
			argIndex = 1;
			options = arguments[0];
		}
		for (var i = argIndex, l = arguments.length; i < l; i++) {
			var arg = arguments[i];
			if (ArrayUtils.isArray(arg)) {
				for (var m = 0, n = arg.length; m < n; m++) {
					this.add(arg[m], options);
				}
			}
			else {
				this.add(arg, options);
			}
		}
		return this;
	},

	// 添加子内容
	// child：可以是一个组件(UIView)、DomHandler、对象(tag,id,cls..)，字符串
	// 其中对象和字符串默认被解析成DomHelper
	// 为提高性能，可是设置 options.parse=false 或 options=false 来取消字符串的解析操作
	// options.index可以指定添加子内容到什么位置
	add: function (child, options) {
		if (Utils.isNotEmpty(child)) {
			var index = options && options.index;
			if (child instanceof UIView) {
				addItem.call(this, child, index);
			}
			else if (typeof child === "string") {
				if (!(options === false || (options && options.parse === false)))
					child = VRender.$({src: child});
				addItem.call(this, child, index);
			}
			else if (child.hasOwnProperty("VRENDERCLSID") && child["VRENDERCLSID"] == "DomHandler") {
				addItem.call(this, child, index);
			}
			else {
				child = VRender.$(child);
				addItem.call(this, child, index);
			}
		}
		return child;
	},

	remove: function (child) {
		for (var i = this.options.children.length; i >= 0; i--) {
			if (this.options.children[i] == child)
				return this.options.children.splice(i, 1)[0];
		}
		return null;
	},

	// 删除子内容
	removeAt: function (index) {
		index = (isNaN(index) || index === "") ? -1 : parseInt(index);
		if (index >= 0) {
			var children = this.options.children;
			if (index < children.length)
				return children.splice(index, 1)[0];
		}
		return null;
	},

	render: function (output) {
		UIGroup.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});

UIGroup.VERTICAL = VERTICAL_ORIENTATION;
UIGroup.HORIZONTIAL = HORIZONTIAL_ORIENTATION;

var addItem = function (item, index) {
	index = (isNaN(index) || index === "") ? -1 : parseInt(index);
	var children = this.options.children;
	if (index >= 0 && index < children.length) {
		children.splice(index, 0, item);
	}
	else {
		children.push(item);
	}
};
