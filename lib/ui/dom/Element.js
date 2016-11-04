// ========================================================
// HTML DOM 节点定义
// @author shicy <shicy85@163.com>
// Create on 2016-11-01
// ========================================================

var Utils = require("../../util/Utils");
var StringUtils = require("../../util/StringUtils");
var ArrayUtils = require("../../util/ArrayUtils");


// 元素定义
var Element = module.exports = function (tag, cls, attrs, id, text) {
	this.id = StringUtils.trimToNull(id);
	this.tagname = StringUtils.trimToEmpty(tag);
	this.setClass(cls);
	this.setAttributes(attrs);
	if (Utils.notNull(text))
		this.setText(text);
	this.parent = null;
	this.children = null;
};

// ========================================================
// 转成 html 文档结构
Element.prototype.html = function (deep) {
	if (StringUtils.isBlank(this.tagname)) {
		if (StringUtils.isNotBlank(this.htmlText))
			return this.htmlText;
		return Utils.isNull(this.text) ? "" : Utils.encodeHtml(this.text);
	}

	var html = "<" + this.tagname;
	if (StringUtils.isNotBlank(this.id)) 
		html += " id=\"" + this.id + "\"";
	if (ArrayUtils.isArray(this.clsname) && this.clsname.length > 0) 
		html += " class=\"" + this.clsname.join(" ") + "\"";
	if (this.attributes) {
		for (var n in this.attributes) {
			var value = StringUtils.trimToEmpty(this.attributes[n]);
			html += " " + n + "=\"" + Utils.encodeHtml(value) + "\"";
		}
	}
	if (this.styles) {
		var styles = [];
		for (var n in this.styles) {
			styles.push(n + ":" + this.styles[n]);
		}
		if (styles.length > 0)
			html += " style=\"" + styles.join(";") + "\"";
	}

	if (this.tagname === "meta")
		html += ">";
	else if (/^(img|link|br|input)$/.test(this.tagname))
		html += "/>";
	else {
		html += ">";
		if (deep && this.children && this.children.length > 0) {
			ArrayUtils.each(this.children, function (child) {
				html += child.html(true);
			});
		}
		else if (StringUtils.isNotBlank(this.htmlText))
			html += this.htmlText;
		else if (Utils.notNull(this.text)) {
			html += Utils.encodeHtml(this.text);
		}
		html += "</" + this.tagname + ">";
	}

	return html;
};

// 返回节点内部的 html 源码
Element.prototype.innerHtml = function () {
	 var html = [];
	 if (this.children && this.children.length > 0) {
		 ArrayUtils.each(this.children, function (elem) {
		 	html.push(elem.html(true));
		 });
	 }
	 else if (StringUtils.isNotBlank(this.htmlText))
	 	html.push(this.htmlText);
	 else if (Utils.notNull(this.text))
	 	html.push(Utils.encodeHtml(this.text));
	 return html.join("");
};

// 
Element.prototype.innerText = function () {
	var value = "";
	if (this.children && this.children.length > 0) {
		ArrayUtils.each(this.children, function (elem) {
			value += elem.innerText();
		});
	}
	else if (Utils.notNull(this.text))
		value += StringUtils.trimToEmpty(this.text);
	return value;
};

// ========================================================
Element.prototype.getId = function () {
	return this.id;
};

Element.prototype.getTagName = function () {
	return this.tagname;
};

// ========================================================
Element.prototype.getText = function () {
	return this.text;
};

// 设置节点文本内容，将会删除所有子节点
Element.prototype.setText = function (text) {
	if (Utils.notNull(text)) {
		this.removeChildren();
		this.text = text;
		this.htmlText = null;
	}
};

// 设置节点HTML内容（不解析），将会删除所有子节点
Element.prototype.setHtml = function (html) {
	if (Utils.notNull(html)) {
		this.removeChildren();
		this.htmlText = html;
		this.text = null;
	}
};

// ========================================================
Element.prototype.getClass = function () {
	return ArrayUtils.isArray(this.clsnames) ? this.clsnames.join(" ") : "";
};

Element.prototype.setClass = function (values) {
	if (StringUtils.isBlank(values))
		this.clsnames = [];
	else {
		if (ArrayUtils.isArray(values))
			values = values.join(" ");
		this.clsnames = StringUtils.trimToEmpty(values).replace(/\s+/g, " ").split(" ");
	}
	return this.clsnames;
};

Element.prototype.addClass = function (values) {
	var clsnames = this.clsnames;
	if (!ArrayUtils.isArray(clsnames))
		clsnames = this.clsnames = [];

	if (ArrayUtils.isArray(values))
		values = values.join(" ");
	values = StringUtils.trimToEmpty(values).replace(/\s+/g, " ").split(" ");

	ArrayUtils.each(values, function (value) {
		if (clsnames.indexOf(value) < 0)
			clsnames.push(value);
	});
};

Element.prototype.removeClass = function (values) {
	if (ArrayUtils.isArray(this.clsnames)) {
		if (ArrayUtils.isArray(values))
			values = values.join(" ");
		values = StringUtils.trimToEmpty(values).replace(/\s+/g, " ").split(" ");
		for (var i = this.clsnames.length - 1; i >= 0; i--) {
			if (values.indexOf(this.clsnames[i]) >= 0)
				this.clsnames.splice(i, 1);
		}
	}
};

Element.prototype.hasClass = function (values) {
	if (ArrayUtils.isArray(this.clsnames) && this.clsnames.length > 0) {
		if (ArrayUtils.isArray(values))
			values = values.join(" ");
		values = StringUtils.trimToEmpty(values).replace(/\s+/g, " ").split(" ");
		for (var i = 0, l = values.length; i < l; i++) {
			if (this.clsnames.indexOf(values[i]) >= 0)
				return true;
		}
	}
	return false;
};

// ========================================================
Element.prototype.getAttribute = function (name) {
	if (this.attributes && StringUtils.isNotBlank(name))
		return this.attributes[name];
	return null;
};

Element.prototype.setAttribute = function (name, value) {
	if (StringUtils.isNotBlank(name)) {
		if (!this.attributes)
			this.attributes = {};
		this.attributes[name] = value;
	}
};

Element.prototype.getAttributes = function () {
	return this.attributes;
};

Element.prototype.setAttributes = function (attrs) {
	this.attributes = attrs;
};

Element.prototype.removeAttribute = function (name) {
	if (this.attributes && StringUtils.isNotBlank(name))
		delete this.attributes[name];
};

// ========================================================
Element.prototype.getStyle = function (name) {
	if (this.styles && StringUtils.isNotBlank(name))
		return this.styles[name];
	return null;
};

Element.prototype.setStyle = function (name, value) {
	if (StringUtils.isNotBlank(name)) {
		if (!this.styles)
			this.styles = {};
		this.styles[name] = value;
	}
};

Element.prototype.getStyles = function () {
	return this.styles;
};

Element.prototype.setStyles = function (styles) {
	this.styles = styles;
};

Element.prototype.removeStyle = function (name) {
	if (this.styles && StringUtils.isNotBlank(name))
		delete this.styles[name];
};

// ========================================================
Element.prototype.getParent = function () {
	return this.parent;
};

// 设置当前节点的父节点
Element.prototype.setParent = function (parent) {
	if (Utils.notNull(parent)) {
		if (parent instanceof Element)
			parent.addChild(this);
	}
	else if (this.parent)
		this.parent.removeChild(this);
};

// 获取第N个子节点
Element.prototype.getChildAt = function (index) {
	index = parseInt(index);
	if (isNaN(index) || index < 0)
		return null;
	if (ArrayUtils.isArray(this.children))
		return this.children[index];
	return null;
};

Element.prototype.getFirstChild = function () {
	return this.getChildAt(0);
};

Element.prototype.getLastChild = function () {
	if (ArrayUtils.isArray(this.children) && this.children.length > 0)
		return this.children[this.children.length - 1];
	return null;
};

// 添加子节点
Element.prototype.addChild = function (child, index) {
	if ((child instanceof Element) && child != this) {
	 	if (child.parent)
	 		child.parent.removeChild(child);
	 	child.parent = this;

	 	if (!this.children) {
	 		this.children = [];
	 		if (StringUtils.isNotBlank(this.htmlText)) {
	 			var element = new Element();
	 			element.htmlText = this.htmlText;
	 			this.children.push(element);
	 			this.htmlText = null;
	 		}
	 		else if (Utils.notNull(this.text)) {
				this.children.push(new Element("", "", null, "", this.text));
				this.text = null;
			}
	 	}

	 	index = parseInt(index);
	 	if (isNaN(index))
	 		this.children.push(child);
	 	else if (index <= 0)
	 		this.children.unshift(child);
	 	else if (index >= this.children.length)
	 		this.children.push(child);
	 	else 
	 		this.children.splice(index, 0, child);
	}
};

Element.prototype.getChildren = function () {
	return this.children;
};

// 添加多个节点
Element.prototype.addChildren = function (children, index) {
	var self = this;
	ArrayUtils.each(ArrayUtils.toArray(children), function (child) {
		self.addChild(child, index);
		if (index || index === 0)
			index += 1;
	});
};

// 删除子节点
Element.prototype.removeChild = function (child) {
	 if (child && child.parent === this) {
	 	child.parent = null;
	 	if (ArrayUtils.isArray(this.children)) {
		 	for (var i = this.children.length - 1; i >= 0; i--) {
		 		if (child === this.children[i]) {
		 			this.children.splice(i, 1);
		 			break;
		 		}
		 	}
	 	}
	 }
};

// 删除所以子节点
Element.prototype.removeChildren = function() {
	ArrayUtils.each(this.children, function (child) {
		child.parent = null;
	});
	this.children = null;
};

// 判断当前节点是否有某个子节点
Element.prototype.hasChild = function (child, deep) {
	if (ArrayUtils.isArray(this.children)) {
		for (var i = 0, l = this.children.length; i < l; i++) {
			if (child === this.children[i])
				return true;
			else if (deep && this.children[i].hasChild(child, true))
				return true;
		}
	}
	return false;
};

// 获取同级的下一个元素
Element.prototype.getNext = function () {
	var siblings = this.parent && this.parent.getChildren();
	if (siblings && siblings.length > 0) {
		for (var i = 0, l = siblings.length; i < l; i++) {
			if (siblings[i] == this)
				return siblings[i + 1] || null;
		}
	}
	return null;
};

// 获取同级的上一个元素
Element.prototype.getPrev = function () {
	var siblings = this.parent && this.parent.getChildren();
	if (siblings && siblings.length > 0) {
		for (var i = 0, l = siblings.length; i < l; i++) {
			if (siblings[i] == this)
				return siblings[i - 1] || null;
		}
	}
	return null;
};

Element.prototype.getIndex = function () {
	if (this.parent) {
		var children = this.parent.getChildren();
		if (children && children.length > 0) {
			for (var i = 0, l = children.length; i < l; i++) {
				if (children[i] == this)
					return i;
			}
		}
	}
	return -1;
};

// ========================================================
// 拷贝元素（包括子元素）
Element.prototype.clone = function () {
	var newItem = new Element(this.tagname, null, this.attributes, this.id);
	newItem.setClass(this.clsname);
	if (this.children && this.children.length > 0) {
		newItem.children = ArrayUtils.map(this.children, function(elem) {
			var element = elem.clone();
			element.parent = newItem;
			return element;
		});
	}
	else {
		newItem.text = this.text;
		newItem.htmlText = this.htmlText;
	}
	return newItem;
};

// 清空元素内容
Element.prototype.empty = function () {
	this.removeChildren();
	this.text = null;
	this.htmlText = null;
};
