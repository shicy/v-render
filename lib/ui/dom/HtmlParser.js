// ========================================================
// HTML 文档解析器，将 html 字符串解析成 Element 元素集
// @author shicy <shicy85@163.com>
// Create on 2016-11-02
// ========================================================

var HtmlParser = require("htmlparser2");
var Utils = require("../../util/Utils");
var ArrayUtils = require("../../util/ArrayUtils");
var StringUtils = require("../../util/StringUtils");


// html 字符串解析，返回 Element 数组
exports.parse = function (html) {
	return new Parser(html).getElements();
};


///////////////////////////////////////////////////////////
var Parser = function (html) {
	this.elements = [];
	this.currentElement = null;

	var self = this;
	var htmlParser = new HtmlParser.Parser({
		onopentag: function (name, attrs) {
			self.opentagHandler(name, attrs);
		},
		onclosetag: function (name) {
			self.closetagHandler(name);
		},
		ontext: function (text) {
			self.textHandler(text);
		}
	});

	htmlParser.write(html);
	htmlParser.end();
};

Parser.prototype.getElements = function () {
	return this.elements;
};

// 开始节点
Parser.prototype.opentagHandler = function (name, attrs) {
	attrs = attrs || {};

	var tagid = attrs["id"];
	var clsnames = attrs["class"];
	var styles = attrs["style"];

	delete attrs["id"];
	delete attrs["class"];
	delete attrs["style"];

	var element = new Element(name, clsnames, attrs, tagid);
	if (StringUtils.isNotBlank(styles)) {
		styles = StringUtils.trimToEmpty(styles).split(";");
		var _styles = {};
		ArrayUtils.each(styles.split(";"), function (style) {
			style = style.split(":");
			style = [StringUtils.trimToEmpty(style[0]), StringUtils.trimToEmpty(style[1])];
			if (style[0] && style[1])
				_styles[style[0]] = style[1];
		});
		element.setStyles(_styles);
	}

	if (this.currentElement) {
		this.currentElement.addChild(element);
	}
	else {
		this.elements.push(element);
	}
	this.currentElement = element;
};

// 关闭节点
Parser.prototype.closetagHandler = function (name) {
	if (this.currentElement)
		this.currentElement = this.currentElement.parent;
};

// 文本节点
Parser.prototype.textHandler = function (text) {
	if (Utils.notNull(text) && text.length > 0) {
		var element = new Element(null, null, null, null, text);
		if (this.currentElement)
			this.currentElement.addChild(element);
		else 
			this.elements.push(element);
	}
};
