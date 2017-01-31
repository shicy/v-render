// ========================================================
// 视图容器，允许设置边框、内边距、外边距、背景等
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var Utils = require("../../util/Utils");
var StringUtils = require("../../util/StringUtils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var ContainerHolder = require("../../static/js/layout/container");


var UIContainer = UIView.extend(module, {
	doInit: function () {
		UIContainer.__super__.doInit.call(this);

		var options = this.options || {};

		var padding = StringUtils.trimToEmpty(options.padding);
		if (padding) {
			padding = padding.replace(/\s+/g, " ").split(" ");
			this.setPadding(padding[0], padding[1], padding[2], padding[3]);
		}

		var margin = StringUtils.trimToEmpty(options.margin);
		if (margin) {
			margin = margin.replace(/\s+/g, " ").split(" ");
			this.setMargin(margin[0], margin[1], margin[2], margin[3]);
		}
	},

	// ----------------------------------------------------
	setPadding: function (top, right, bottom, left) {
		top = StringUtils.isBlank(top) ? 0 : top;
		right = StringUtils.isBlank(right) ? top : right;
		bottom = StringUtils.isBlank(bottom) ? top : bottom;
		left = StringUtils.isBlank(left) ? right : left;
		this.setPaddingTop(top);
		this.setPaddingRight(right);
		this.setPaddingBottom(bottom);
		this.setPaddingLeft(left);
	},

	getPaddingLeft: function () {
		return this.options.paddingLeft;
	},
	setPaddingLeft: function (value) {
		this.options.paddingLeft = value;
	},

	getPaddingRight: function () {
		return this.options.paddingRight;
	},
	setPaddingRight: function (value) {
		this.options.paddingRight = value;
	},

	getPaddingTop: function () {
		return this.options.paddingTop;
	},
	setPaddingTop: function (value) {
		this.options.paddingTop = value;
	},

	getpaddingBottom: function () {
		return this.options.paddingBottom;
	},
	setPaddingBottom: function (value) {
		this.options.paddingBottom = value;
	},

	// ----------------------------------------------------
	setMargin: function (top, right, bottom, left) {
		top = StringUtils.isBlank(top) ? 0 : top;
		right = StringUtils.isBlank(right) ? top : right;
		bottom = StringUtils.isBlank(bottom) ? top : bottom;
		left = StringUtils.isBlank(left) ? right : left;
		this.setMarginTop(top);
		this.setMarginRight(right);
		this.setMarginBottom(bottom);
		this.setMarginLeft(left);
	},

	getMarginLeft: function () {
		return this.options.marginLeft;
	},
	setMarginLeft: function (value) {
		this.options.marginLeft = value;
	},

	getMarginRight: function () {
		return this.options.marginRight;
	},
	setMarginRight: function (value) {
		this.options.marginRight = value;
	},

	getMarginTop: function () {
		return this.options.marginTop;
	},
	setMarginTop: function (value) {
		this.options.marginTop = value;
	},

	getMarginBottom: function () {
		return this.options.marginBottom;
	},
	setMarginBottom: function (value) {
		this.options.marginBottom = value;
	},

	// ----------------------------------------------------
	getBorder: function () {
		return this.options.border;
	},
	setBorder: function (value) {
		this.options.border = value;
	},

	getBorderRadius: function () {
		return this.options.borderRadius;
	},
	setBorderRadius: function (value) {
		this.options.borderRadius = value;
	},

	getBorderColor: function () {
		return this.options.borderColor;
	},
	setBorderColor: function (value) {
		this.options.borderColor = value;
	},

	getBorderWidth: function () {
		return this.options.borderWidth;
	},
	setBorderWidth: function (value) {
		this.options.borderWidth = value;
	},

	getBorderLeft: function () {
		return this.options.borderLeft;
	},
	setBorderLeft: function (value) {
		this.options.borderLeft = value;
	},

	getBorderRight: function () {
		return this.options.borderRight;
	},
	setBorderRight: function (value) {
		this.options.borderRight = value;
	},

	getBorderTop: function () {
		return this.options.borderTop;
	},
	setBorderTop: function (value) {
		this.options.borderTop = value;
	},

	getBorderBottom: function () {
		return this.options.borderBottom;
	},
	setBorderBottom: function (value) {
		this.options.borderBottom = value;
	},

	// ----------------------------------------------------
	getBackground: function () {
		return this.options.bg || this.options.background;
	},
	setBackground: function (value) {
		this.options.bg = value;
		delete this.options.background;
	},

	getBackgroundColor: function () {
		return this.options.bgcolor || this.options.backgroundColor;
	},
	setBackgroundColor: function (value) {
		this.options.bgcolor = value;
		delete this.options.backgroundColor;
	},

	getBackgroundImage: function () {
		return this.options.image || this.options.backgroundImage;
	},
	setBackgroundImage: function (value) {
		this.options.image = value;
		delete this.options.backgroundImage;
	},

	// ----------------------------------------------------
	getWidth: function () {
		return this.options.width;
	},
	setWidth: function (value) {
		this.options.width = value;
	},

	getMinWidth: function () {
		return this.options.minWidth;
	},
	setMinWidth: function (value) {
		this.options.minWidth = value;
	},

	getMaxWidth: function () {
		return this.options.maxWidth;
	},
	setMaxWidth: function (value) {
		this.options.maxWidth = value;
	},

	getHeight: function () {
		return this.options.height;
	},
	setHeight: function (value) {
		this.options.height = value;
	},

	getMinHeight: function () {
		return this.options.minHeight;
	},
	setMinHeight: function (value) {
		this.options.minHeight = value;
	},

	getMaxHeight: function () {
		return this.options.maxHeight;
	},
	setMaxHeight: function (value) {
		this.options.maxHeight = value;
	},

	getOverflow: function () {
		return this.options.overflow;
	},
	setOverflow: function (value) {
		this.options.overflow = value;
	},

	getColor: function () {
		return this.options.color;
	},
	setColor: function (value) {
		this.options.color = value;
	},

	getAlign: function () {
		return this.options.align;
	},
	setAlign: function (value) {
		this.options.align = value;
	},

	getShadow: function () {
		return this.options.shadow;
	},
	setShadow: function (value) {
		this.options.shadow = value;
	},

	getContent: function () {
		return this.options.content || this.options.view;
	},
	setContent: function (view) {
		this.options.content = view;
		delete this.options.view;
	},

	// ====================================================
	render: function (output) {
		UIContainer.__super__.render.call(this, output);
		var holder = new ContainerHolder(this, this.options);
		holder.render(VRender.$, this.$el);
	}

});
