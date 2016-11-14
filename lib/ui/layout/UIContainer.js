// ========================================================
// 视图容器，继承自“UIGroup”，允许设置边框、内边距、外边距、背景等
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var Utils = require("../../util/Utils");
var StringUtils = require("../../util/StringUtils");
var UIGroup = require("./UIGroup");


var UIContainer = UIGroup.extend(module, {
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

		this.setBorder(options.border);
		this.setBorderWidth(options.borderWidth);
		this.setBorderColor(options.borderColor);
		this.setBorderLeft(options.borderLeft);
		this.setBorderRight(options.borderRight);
		this.setBorderTop(options.borderTop);
		this.setBorderBottom(options.borderBottom);

		this.setBackground(options.bg);
		this.setBackgroundColor(options.bgcolor);
		this.setBackgroundImage(options.image);

		this.setWidth(options.width);
		this.setHeight(options.height);
		this.setMinWidth(options.minWidth);
		this.setMinHeight(options.minHeight);
		this.setMaxWidth(options.maxWidth);
		this.setMaxHeight(options.maxHeight);
		this.setOverflow(options.overflow);

		this.setContent(options.content || options.view);
	},

	// ----------------------------------------------------
	setPadding: function (top, right, bottom, left) {
		this.setPaddingTop(top);
		this.setPaddingRight(right);
		this.setPaddingBottom(bottom);
		this.setPaddingLeft(left);
	},

	getPaddingLeft: function () {
		return this.paddingLeft;
	},
	setPaddingLeft: function (value) {
		this.paddingLeft = value;
	},

	getPaddingRight: function () {
		return this.paddingRight;
	},
	setPaddingRight: function (value) {
		this.paddingRight = value;
	},

	getPaddingTop: function () {
		return this.paddingTop;
	},
	setPaddingTop: function (value) {
		this.paddingTop = value;
	},

	getpaddingBottom: function () {
		return this.paddingBottom;
	},
	setPaddingBottom: function (value) {
		this.paddingBottom = value;
	},

	// ----------------------------------------------------
	setMargin: function (top, right, bottom, left) {
		this.setMarginTop(top);
		this.setMarginRight(right);
		this.setMarginBottom(bottom);
		this.setMarginLeft(left);
	},

	getMarginLeft: function () {
		return this.marginLeft;
	},
	setMarginLeft: function (value) {
		this.marginLeft = value;
	},

	getMarginRight: function () {
		return this.marginRight;
	},
	setMarginRight: function (value) {
		this.marginRight = value;
	},

	getMarginTop: function () {
		return this.marginTop;
	},
	setMarginTop: function (value) {
		this.marginTop = value;
	},

	getMarginBottom: function () {
		return this.marginBottom;
	},
	setMarginBottom: function (value) {
		this.marginBottom = value;
	},

	// ----------------------------------------------------
	getBorder: function () {
		return this.border;
	},
	setBorder: function (value) {
		this.border = value;
	},

	getBorderColor: function () {
		return this.borderColor;
	},
	setBorderColor: function (value) {
		this.borderColor = value;
	},

	getBorderWidth: function () {
		return this.borderWidth;
	},
	setBorderWidth: function (value) {
		this.borderWidth = value;
	},

	getBorderLeft: function () {
		return this.borderLeft;
	},
	setBorderLeft: function (value) {
		this.borderLeft = value;
	},

	getBorderRight: function () {
		return this.borderRight;
	},
	setBorderRight: function (value) {
		this.borderRight = value;
	},

	getBorderTop: function () {
		return this.borderTop;
	},
	setBorderTop: function (value) {
		this.borderTop = value;
	},

	getBorderBottom: function () {
		return this.borderBottom;
	},
	setBorderBottom: function (value) {
		this.borderBottom = value;
	},

	// ----------------------------------------------------
	getBackground: function () {
		return this.background;
	},
	setBackground: function (value) {
		this.background = value;
	},

	getBackgroundColor: function () {
		return this.backgroundColor;
	},
	setBackgroundColor: function (value) {
		this.backgroundColor = value;
	},

	getBackgroundImage: function () {
		return this.backgroundImage;
	},
	setBackgroundImage: function (value) {
		this.backgroundImage = value;
	},

	// ----------------------------------------------------
	getWidth: function () {
		return this.width;
	},
	setWidth: function (value) {
		this.width = value;
	},

	getMinWidth: function () {
		return this.minWidth;
	},
	setMinWidth: function (value) {
		this.minWidth = value;
	},

	getMaxWidth: function () {
		return this.maxWidth;
	},
	setMaxWidth: function (value) {
		this.maxWidth = value;
	},

	getHeight: function () {
		return this.height;
	},
	setHeight: function (value) {
		this.height = value;
	},

	getMinHeight: function () {
		return this.minHeight;
	},
	setMinHeight: function (value) {
		this.minHeight = value;
	},

	getMaxHeight: function () {
		return this.maxHeight;
	},
	setMaxHeight: function (value) {
		this.maxHeight = value;
	},

	getOverflow: function () {
		return this.overflow;
	},
	setOverflow: function (value) {
		this.overflow = value;
	},

	setContent: function (view) {
		this.contentView = view;
	},

	// ====================================================
	render: function (output) {
		UIContainer.__super__.render.call(this, output);

		this.setCss(this.$el, "padding-left", this.getPaddingLeft());
		this.setCss(this.$el, "padding-right", this.getPaddingRight());
		this.setCss(this.$el, "padding-top", this.getPaddingTop());
		this.setCss(this.$el, "padding-bottom", this.getpaddingBottom());

		this.setCss(this.$el, "margin-left", this.getMarginLeft());
		this.setCss(this.$el, "margin-right", this.getMarginRight());
		this.setCss(this.$el, "margin-top", this.getMarginTop());
		this.setCss(this.$el, "margin-bottom", this.getMarginBottom());

		this.setCss(this.$el, "border", this.getBorder());
		this.setCss(this.$el, "border-color", this.getBorderColor());
		this.setCss(this.$el, "border-width", this.getBorderWidth());
		this.setCss(this.$el, "border-left", this.getBorderLeft());
		this.setCss(this.$el, "border-right", this.getBorderRight());
		this.setCss(this.$el, "border-top", this.getBorderTop());
		this.setCss(this.$el, "border-bottom", this.getBorderBottom());

		this.setCss(this.$el, "background", this.getBackground());
		this.setCss(this.$el, "background-color", this.getBackgroundColor());
		this.setCss(this.$el, "background-image", this.getBackgroundImage());

		this.setCss(this.$el, "width", this.getWidth());
		this.setCss(this.$el, "min-width", this.getMinWidth());
		this.setCss(this.$el, "max-width", this.getMaxWidth());

		this.setCss(this.$el, "height", this.getHeight());
		this.setCss(this.$el, "min-height", this.getMinHeight());
		this.setCss(this.$el, "max-height", this.getMaxHeight());

		this.setCss(this.$el, "overflow", this.getOverflow());

		if (Utils.notNull(this.contentView)) {
			if (this.contentView instanceof UIView)
				this.contentView.render(this.$el);
			else
				this.$el.append(this.contentView);
		}
	},

	setCss: function (target, name, value) {
		value = StringUtils.trimToEmpty(value);
		if (value) {
			if (isNaN(value))
				value = value + "px";
			target.css(name, value);
		}
	}
});
