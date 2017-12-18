// ========================================================
// 视图容器，允许设置边框、内边距、外边距、背景等
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var Utils = require("../../util/Utils");
var StringUtils = require("../../util/StringUtils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var ContainerRender = require("../../static/js/render/container");


var UIContainer = UIView.extend(module, {
	doInit: function () {
		UIContainer.__super__.doInit.call(this);
		if (!this.options.styles)
			this.options.styles = {};
		this.styles = this.options.styles;

		// var padding = StringUtils.trimToEmpty(options.padding);
		// if (padding) {
		// 	padding = padding.replace(/\s+/g, " ").split(" ");
		// 	this.setPadding(padding[0], padding[1], padding[2], padding[3]);
		// }

		// var margin = StringUtils.trimToEmpty(options.margin);
		// if (margin) {
		// 	margin = margin.replace(/\s+/g, " ").split(" ");
		// 	this.setMargin(margin[0], margin[1], margin[2], margin[3]);
		// }
	},

	// ----------------------------------------------------
	getDisplay: function () {
		return this.styles.display;
	},
	setDisplay: function (value) {
		this.styles.display = value;
	},

	getPosition: function () {
		return this.styles.position;
	},
	setPosition: function (value) {
		this.styles.position = value;
	},

	// ----------------------------------------------------
	getPadding: function () {
		return this.styles.padding;
	},
	setPadding: function (value) {
		this.styles.padding = value;
		delete this.styles.paddingLeft;
		delete this.styles.paddingRight;
		delete this.styles.paddingTop;
		delete this.styles.paddingBottom;
	},

	getPaddingLeft: function () {
		return this.styles.paddingLeft;
	},
	setPaddingLeft: function (value) {
		this.styles.paddingLeft = value;
	},

	getPaddingRight: function () {
		return this.styles.paddingRight;
	},
	setPaddingRight: function (value) {
		this.styles.paddingRight = value;
	},

	getPaddingTop: function () {
		return this.styles.paddingTop;
	},
	setPaddingTop: function (value) {
		this.styles.paddingTop = value;
	},

	getpaddingBottom: function () {
		return this.styles.paddingBottom;
	},
	setPaddingBottom: function (value) {
		this.styles.paddingBottom = value;
	},

	setPaddings: function (top, right, bottom, left) {
		top = StringUtils.isBlank(top) ? 0 : top;
		right = StringUtils.isBlank(right) ? top : right;
		bottom = StringUtils.isBlank(bottom) ? top : bottom;
		left = StringUtils.isBlank(left) ? right : left;
		this.setPaddingTop(top);
		this.setPaddingRight(right);
		this.setPaddingBottom(bottom);
		this.setPaddingLeft(left);
		delete this.styles.padding;
	},

	// ----------------------------------------------------
	getMargin: function () {
		return this.styles.margin;
	},
	setMargin: function (value) {
		this.styles.margin = value;
		delete this.styles.marginLeft;
		delete this.styles.marginRight;
		delete this.styles.marginTop;
		delete this.styles.marginBottom;
	},

	getMarginLeft: function () {
		return this.styles.marginLeft;
	},
	setMarginLeft: function (value) {
		this.styles.marginLeft = value;
	},

	getMarginRight: function () {
		return this.styles.marginRight;
	},
	setMarginRight: function (value) {
		this.styles.marginRight = value;
	},

	getMarginTop: function () {
		return this.styles.marginTop;
	},
	setMarginTop: function (value) {
		this.styles.marginTop = value;
	},

	getMarginBottom: function () {
		return this.styles.marginBottom;
	},
	setMarginBottom: function (value) {
		this.styles.marginBottom = value;
	},

	setMargins: function (top, right, bottom, left) {
		top = StringUtils.isBlank(top) ? 0 : top;
		right = StringUtils.isBlank(right) ? top : right;
		bottom = StringUtils.isBlank(bottom) ? top : bottom;
		left = StringUtils.isBlank(left) ? right : left;
		this.setMarginTop(top);
		this.setMarginRight(right);
		this.setMarginBottom(bottom);
		this.setMarginLeft(left);
		delete this.styles.margin;
	},

	// ----------------------------------------------------
	getBorder: function () {
		return this.styles.border;
	},
	setBorder: function (value) {
		this.styles.border = value;
	},

	getBorderRadius: function () {
		return this.styles.borderRadius;
	},
	setBorderRadius: function (value) {
		this.styles.borderRadius = value;
	},

	getBorderColor: function () {
		return this.styles.borderColor;
	},
	setBorderColor: function (value) {
		this.styles.borderColor = value;
	},

	getBorderWidth: function () {
		return this.styles.borderWidth;
	},
	setBorderWidth: function (value) {
		this.styles.borderWidth = value;
	},

	getBorderLeft: function () {
		return this.styles.borderLeft;
	},
	setBorderLeft: function (value) {
		this.styles.borderLeft = value;
	},

	getBorderRight: function () {
		return this.styles.borderRight;
	},
	setBorderRight: function (value) {
		this.styles.borderRight = value;
	},

	getBorderTop: function () {
		return this.styles.borderTop;
	},
	setBorderTop: function (value) {
		this.styles.borderTop = value;
	},

	getBorderBottom: function () {
		return this.styles.borderBottom;
	},
	setBorderBottom: function (value) {
		this.styles.borderBottom = value;
	},

	// ----------------------------------------------------
	getBackground: function () {
		return this.styles.bg || this.styles.background;
	},
	setBackground: function (value) {
		this.styles.bg = value;
		delete this.styles.background;
	},

	getBackgroundColor: function () {
		return this.styles.bgcolor || this.styles.backgroundColor;
	},
	setBackgroundColor: function (value) {
		this.styles.bgcolor = value;
		delete this.styles.backgroundColor;
	},

	getBackgroundImage: function () {
		return this.styles.image || this.styles.backgroundImage;
	},
	setBackgroundImage: function (value) {
		this.styles.image = value;
		delete this.styles.backgroundImage;
	},

	getBackgroundSize: function () {
		return this.styles.backgroundSize;
	},
	setBackgroundSize: function (value) {
		this.styles.backgroundSize = value;
	},

	getBackgroundPosition: function () {
		return this.styles.backgroundPosition;
	},
	setBackgroundPosition: function (value) {
		this.styles.backgroundPosition = value;
	},

	getBackgroundRepeat: function () {
		return this.styles.backgroundRepeat;
	},
	setBackgroundRepeat: function (value) {
		this.styles.backgroundRepeat = value;
	},

	// ----------------------------------------------------
	getWidth: function () {
		return this.styles.width;
	},
	setWidth: function (value) {
		this.styles.width = value;
	},

	getMinWidth: function () {
		return this.styles.minWidth;
	},
	setMinWidth: function (value) {
		this.styles.minWidth = value;
	},

	getMaxWidth: function () {
		return this.styles.maxWidth;
	},
	setMaxWidth: function (value) {
		this.styles.maxWidth = value;
	},

	getHeight: function () {
		return this.styles.height;
	},
	setHeight: function (value) {
		this.styles.height = value;
	},

	getMinHeight: function () {
		return this.styles.minHeight;
	},
	setMinHeight: function (value) {
		this.styles.minHeight = value;
	},

	getMaxHeight: function () {
		return this.styles.maxHeight;
	},
	setMaxHeight: function (value) {
		this.styles.maxHeight = value;
	},

	getOverflow: function () {
		return this.styles.overflow;
	},
	setOverflow: function (value) {
		this.styles.overflow = value;
	},

	getColor: function () {
		return this.styles.color;
	},
	setColor: function (value) {
		this.styles.color = value;
	},

	getFontSize: function () {
		return this.styles.fontSize;
	},
	setFontSize: function (value) {
		this.styles.fontSize = value;
	},

	getAlign: function () {
		return this.styles.align;
	},
	setAlign: function (value) {
		this.styles.align = value;
	},

	getShadow: function () {
		return this.styles.shadow;
	},
	setShadow: function (value) {
		this.styles.shadow = value;
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
		var holder = new ContainerRender(this, this.options);
		holder.render(VRender.$, this.$el);
	}

});
