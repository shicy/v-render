// ========================================================
// HTML 文档处理，用于构建网页代码。提供的方法近似于 jQuery 方法。
// @author shicy <shicy85@163.com>
// Create on 2016-11-01
// ========================================================

var Path = require("path");
var FileSys = require("fs");
var CleanCss = require("clean-css");
var UglifyJS = require("uglify-js");
var Template = require("dot");
var Utils = require("../../util/Utils");
var ArrayUtils = require("../../util/ArrayUtils");
var StringUtils = require("../../util/StringUtils");
var CacheManager = require("../../cache/CacheManager");
var VRender = require("../../v-render");
var Element = require("./Element");
var HtmlParser = require("./HtmlParser");


var staticfile_cache = CacheManager.cache("DomHelper.staticfile", "file");
var template_cache = CacheManager.cache("DomHelper.template", "file");


exports.create = function (options) {
	options = options || {};
	if (options.hasOwnProperty("src")) {
		var elements = HtmlParser.parse(options.src);
		delete options.src;
		return new DomHandler(options, elements);
	}
	return new DomHandler(options, new Element("root-vrender"));
};


///////////////////////////////////////////////////////////
var DomHandler = function (options, elements) {
	this.options = options;
	this.elements = ArrayUtils.toArray(elements);
	this.length = this.elements.length;
};

// ========================================================
// 直接写入 Html 源码内容，多次写入会被依次追加在后面
// @param html 网页代码段
// @param parse 是否需要解析 html，某种情况不解析可以提高网页构建性能
DomHandler.prototype.write = function (html, parse) {
	if (Utils.notNull(html) && this.length > 0) {
		if (parse) {
			this.append(html);
		}
		else {
			var element = new Element();
			element.setHtml(html);
			this.append(new DomHandler(this.options, element));
		}
	}
	return this;
};

// 读取文件内容并写入，js 文件将自动添加“<script>”标签，css 文件将自动添加“<style>”标签
DomHandler.prototype.writeFile = function (filepath, parse) {
	var html = staticfile_cache.get(filepath);
	if (Utils.isNull(html)) {
		staticfile_cache.set(filepath);
		html = staticfile_cache.get(filepath);
	}
	if (Utils.notNull(html)) {
		var ext = Path.extname(filepath);
		if (ext === ".js")
			html = "<script>" + UglifyJS.minify(html, {fromString: true}).code + "</script>";
		else if (ext === ".css")
			html = "<style>" + (new CleanCss().minify(html).styles) + "</style>";
		this.write(html, parse);
	}
	return this;
};

// 根据模板初始化文档内容，会完全替换了
DomHandler.prototype.writeTmpl = function (template, data, parse) {
	try {
		var _template = template_cache.get(template);
		if (Utils.isNull(_template)) {
			_template = FileSys.readFileSync(template, "utf-8");
			_template = Template.template(_template);
			template_cache.set(template, _template);
		}
		this.write(_template(data), parse);
	}
	catch (e) {
		VRender.logger.warn("模板解析异常：", template, e);
	}
	return this;
};

// ========================================================
// 添加实例，返回新实例，当内容为字符串时将解析为DOM添加
DomHandler.prototype.add = function (value) {
	var elements = ArrayUtils.pushAll([], this.elements);
	if (Utils.notNull(value)) {
		if (value instanceof DomHandler)
			ArrayUtils.pushAll(elements, value.elements);
		else if (value.length > 0)
			ArrayUtils.pushAll(elements, HtmlParser.parse(value));
	}
	return new DomHandler(this.options, unique(elements));
};

// 添加类
DomHandler.prototype.addClass = function (value) {
	if (this.length > 0 && Utils.notNull(value)) {
		ArrayUtils.each(this.elements, function (elem) {
			elem.addClass(value);
		});
	}
	return this;
};

// 在后面追加节点
DomHandler.prototype.after = function (value) {
	if (this.length > 0 && Utils.notNull(value)) {
		var newElements = null;
		if (value instanceof DomHandler)
			newElements = value.elements;
		else if (value.length > 0)
			newElements = HtmlParser.parse(value);
		if (newElements && newElements.length > 0) {
			ArrayUtils.each(this.elements, function (elem, i) {
				elem = elem.getParent();
				if (elem) {
					var elements = newElements;
					if (i > 0) {
						elements = ArrayUtils.map(newElements, function (elem) {
							return elem.clone();
						});
					}
					elem.addChildren(elements);
				}
			});
		}
	}
	return this;
};

// 添加子节点
DomHandler.prototype.append = function (value) {
	if (this.length > 0 && Utils.notNull(value)) {
		if (value instanceof DomHandler) {
			if (value.length > 0)
				appendElements(this, value.elements);
		}
		else if (value.length > 0) {
			appendElements(this, HtmlParser.parse(value));
		}
	}
	return this;
};

// 添加子节点，返回被添加的节点
DomHandler.prototype.appendAndGet = function (value) {
	var newElements = null;
	if (this.length > 0 && Utils.notNull(value)) {
		if (value instanceof DomHandler) {
			if (value.length > 0)
				newElements = appendElements(this, value.elements);
		}
		else if (value.length > 0) {
			newElements = appendElements(this, HtmlParser.parse(value));
		}
	}
	return new DomHandler(this.options, newElements);
};

// 按标签名称添加子节点，返回被添加的节点
DomHandler.prototype.appendTag = function (value) {
	if (this.length > 0 && StringUtils.isNotBlank(value)) {
		var newElements = appendElements(this, new Element(value));
		return new DomHandler(this.options, newElements);
	}
	return new DomHandler(this.options, null);
};

// 将当前节点添加到其他节点
DomHandler.prototype.appendTo = function (value) {
	var newElements = null;
	if (this.length > 0 && Utils.notNull(value)) {
		if (value instanceof DomHandler) {
			newElements = appendElements(value, this.elements);
		}
		else if (value.length > 0) {
			var handler = new DomHandler(this.options, HtmlParser.parse(value));
			newElements = appendElements(handler, this.elements);
		}
	}
	return new DomHandler(this.options, newElements);
};

// 设置节点属性
DomHandler.prototype.attr = function (name, value) {
	if (StringUtils.isBlank(name)) {
		name = value;
		value = null;
	}
	if (StringUtils.isNotBlank(name)) {
		if (Utils.isNull(value)) {
			if (typeof name === "string")
				return this.length > 0 ? this.elements[0].getAttribute(name) : null;
			ArrayUtils.each(this.elements, function (elem) {
				for (var n in name) {
					elem.setAttribute(n, name[n]);
				}
			});
		}
		else if (this.length > 0) {
			var valfunc = Utils.isFunction(value) ? value : (function () { return value; });
			ArrayUtils.each(this.elements, function (elem, i) {
				elem.setAttribute(name, valfunc(i));
			});
		}
	}
	return this;
};

// 在前面添加节点
DomHandler.prototype.before = function (value) {
	if (this.length > 0 && Utils.notNull(value)) {
		var newElements = null;
		if (value instanceof DomHandler)
			newElements = value.elements;
		else if (value.length > 0)
			newElements = HtmlParser.parse(value);
		if (newElements && newElements.length > 0) {
			ArrayUtils.each(this.elements, function (elem, i) {
				elem = elem.getParent();
				if (elem) {
					var elements = newElements;
					if (i > 0) {
						elements = ArrayUtils.map(newElements, function (elem) {
							return elem.clone();
						});
					}
					elem.addChildren(elements, 0);
				}
			});
		}
	}
	return this;
};

// 获取当前节点的所有儿子节点（直接子节点）
DomHandler.prototype.children = function (selector) {
	var subElements = [];
	ArrayUtils.each(this.elements, function (elem) {
		ArrayUtils.pushAll(subElements, elem.getChildren());
	});

	if (subElements.length === 0 || StringUtils.isBlank(selector))
		return new DomHandler(this.options, subElements);
	subElements = unique(subElements);

	var elements = [];
	selector = parseSelector(selector);
	ArrayUtils.each(subElements, function (elem) {
		if (isMatchSelector(elem, selector))
			elements.push(elem);
	});
	return new DomHandler(this.options, unique(elements));
};

// 设置标签样式
DomHandler.prototype.css = function(name, value) {
	if (StringUtils.isBlank(name)) {
		name = value;
		value = null;
	}
	if (StringUtils.isNotBlank(name)) {
		if (Utils.isNull(value)) {
			if (typeof name === "string")
				return this.length > 0 ? this.elements[0].getStyle(name) : null;
			ArrayUtils.each(this.elements, function (elem) {
				for (var n in name) {
					elem.addStyle(n, name[n]);
				}
			});
		}
		else if (this.length > 0) {
			var valfunc = Utils.isFunction(value) ? value : (function () { return value; });
			ArrayUtils.each(this.elements, function (elem, i) {
				elem.setStyle(name, valfunc(i));
			});
		}
	}
	return this;
};

// 绑定数据
DomHandler.prototype.data = function (name, value) {
	if (StringUtils.isBlank(name)) {
		name = value;
		value = null;
	}
	if (StringUtils.isBlank(name)) { // 返回第一项的绑定数据
		if (this.length > 0) {
			var _data = {};
			var attributs = this.elements[0].getAttributes();
			for (var n in attributs) {
				if (/^data-.+/.test(n))
					_data[n.substr(5)] = attributs[n];
			}
			return _data;
		}
		return null;
	}
	else if (Utils.isNull(value)) {
		if (typeof name === "string")
			return this.length > 0 ? this.elements[0].getAttribute("data-" + name) : null;
		ArrayUtils.each(this.elements, function (elem) {
			for (var n in name) {
				elem.setAttribute("data-" + n, name[n]);
			}
		});
	}
	else if (this.length > 0) {
		var valfunc = Utils.isFunction(value) ? value : (function () { return value; });
		ArrayUtils.each(this.elements, function (elem, i) {
			elem.setAttribute("data-" + name, valfunc(i));
		});
	}
	return this;
};

// 逐个依次执行代码
DomHandler.prototype.each = function (callback) {
	if (this.length > 0 && Utils.isFunction(callback)) {
		var self = this;
		ArrayUtils.each(this.elements, function (elem, i) {
			return callback(new DomHandler(self.options, elem), i);
		});
	}
	return this;
};

// 清空删除元素
DomHandler.prototype.empty = function () {
	if (this.length > 0) {
		ArrayUtils.each(this.elements, function (elem) {
			elem.empty();
		});
	}
	return this;
};

// 获取集合中第N个元素
DomHandler.prototype.eq = function (index) {
	if (this.length > 0) {
		index = parseInt(index);
		if (isNaN(index))
			index = -1;
		return new DomHandler(this.options, this.elements[index]);
	}
	return new DomHandler(this.options, null);
};

// 过滤元素
DomHandler.prototype.filter = function (selector) {
	var elements = [];
	if (this.length > 0 && StringUtils.isNotBlank(selector)) {
		selector = parseSelector(selector);
		ArrayUtils.each(this.elements, function (elem) {
			if (isMatchSelector(elem, selector))
				elements.push(elem);
		});
	}
	return new DomHandler(this.options, unique(elements));
};

// 查找子节点
DomHandler.prototype.find = function (selector) {
	var elements = null;
	if (this.length > 0 && StringUtils.isNotBlank(selector))
		elements = findElements(this.elements, selector);
	return new DomHandler(this.options, elements);
};

// 返回第一个元素
DomHandler.prototype.first = function () {
	return new DomHandler(this.options, this.elements[0]);
};

// 查找拥有指定子元素的当前元素集
DomHandler.prototype.has = function (selector) {
	var elements = [];
	if (this.length > 0 && StringUtils.isNotBlank(selector)) {
		selector = parseSelector(selector);
		ArrayUtils.each(this.elements, function (elem) {
			var filters = findElements(elem.getChildren(), selector);
			if (filters && filters.length > 0)
				elements.push(elem);
		});
	}
	return new DomHandler(this.options, elements);
};

// 是否存在类
DomHandler.prototype.hasClass = function (value) {
	if (StringUtils.isNotBlank(value)) {
		for (var i = 0, l = this.elements.length; i < l; i++) {
			if (this.elements[i].hasClass(value))
				return true;
		}
	}
	return false;
};

// 隐藏所有元素
DomHandler.prototype.hide = function () {
	return this.addClass("ui-hidden");
};

// 设置或者获取当前元素的 Html 源码内容
DomHandler.prototype.html = function (value) {
	if (Utils.isNull(value)) {
		var results = [];
		ArrayUtils.each(this.elements, function (elem) {
			results.push(elem.tagname === "root-vrender" ? elem.innerHtml() : elem.html(true));
		});
		return results.join("");
	}
	this.empty();
	return this.append(value);
};

// 获取第一个元素的索引
DomHandler.prototype.index = function () {
	return this.length > 0 ? this.elements[0].getIndex() : -1;
};

// 将当前匹配元素插入到指定元素之后
DomHandler.prototype.insertAfter = function (value) {
	var newElements = null;
	if (this.length > 0 && Utils.notNull(value)) {
		if (value instanceof DomHandler) {
			newElements = appendElements(value, this.elements);
		}
		else if (value.length > 0) {
			var handler = new DomHandler(this.options, HtmlParser.parse(value));
			newElements = appendElements(handler, this.elements);
		}
	}
	return new DomHandler(this.options, newElements);
};

// 将当前匹配元素插入到指定元素之前
DomHandler.prototype.insertBefore = function (value) {
	var newElements = null;
	if (this.length > 0 && Utils.notNull(value)) {
		if (value instanceof DomHandler) {
			newElements = appendElements(value, this.elements, 0);
		}
		else if (value.length > 0) {
			var handler = new DomHandler(this.options, HtmlParser.parse(value));
			newElements = appendElements(handler, this.elements, 0);
		}
	}
	return new DomHandler(this.options, newElements);
};

// 判断是否匹配某个选择器
DomHandler.prototype.is = function (selector) {
	if (this.length > 0 && StringUtils.isNotBlank(selector)) {
		selector = parseSelector(selector);
		for (var i = 0; i < this.length; i++) {
			if (isMatchSelector(this.elements[i], selector))
				return true;
		}
	}
	return false;
};

// 获取最后一个元素
DomHandler.prototype.last = function () {
	return new DomHandler(this.options, (this.length > 0 ? this.elements[this.length - 1] : null));
};

// 根据每一个元素，生成一个新数组
DomHandler.prototype.map = function (callback) {
	var results = [];
	if (this.length > 0 && Utils.isFunction(callback)) {
		var self = this;
		ArrayUtils.each(this.elements, function (elem, i) {
			var value = callback((new DomHandler(self.options, elem)), i);
			results.push(value);
		});
	}
	return results;
};

// 获取相邻的下一个元素集
DomHandler.prototype.next = function (selector) {
	var elements = [];
	if (this.length > 0) {
		selector = StringUtils.isBlank(selector) ? null : parseSelector(selector);
		ArrayUtils.each(this.elements, function (elem) {
			var nextElement = elem.getNext();
			if (nextElement) {
				if (selector && selector.length > 0) {
					if (isMatchSelector(nextElement, selector))
						elements.push(nextElement);
				}
				else
					elements.push(nextElement);
			}
		});
	}
	return new DomHandler(this.options, unique(elements));
};

// 去除不匹配元素
DomHandler.prototype.not = function (selector) {
	var elements = [];
	if (this.length > 0 && StringUtils.isNotBlank(selector)) {
		selector = parseSelector(selector);
		ArrayUtils.each(this.elements, function (elem) {
			if (!isMatchSelector(elem, selector))
				elements.push(elem);
		});
	}
	return new DomHandler(this.options, unique(elements));
};

// 获取所有匹配元素的父元素
DomHandler.prototype.parent = function (selector) {
	var elements = [];
	if (this.length > 0) {
		selector = StringUtils.isBlank(selector) ? null : parseSelector(selector);
		ArrayUtils.each(this.elements, function (elem) {
			var parentElement = elem.getParent();
			if (parentElement) {
				if (selector && selector.length > 0) {
					if (isMatchSelector(parentElement, selector))
						elements.push(parentElement);
				}
				else
					elements.push(parentElement);
			}
		});
	}
	return new DomHandler(this.options, unique(elements));
};

// 获取所有匹配元素的上层指定元素，找到为止(一旦找到不会再往上查找)
DomHandler.prototype.parentUntil = function (selector, limiter) {
	var elements = [];
	if (this.length > 0 && StringUtils.isNotBlank(selector)) {
		selector = parseSelector(selector);
		if (selector && selector.length > 0) {
			limiter = StringUtils.isBlank(limiter) ? null : parseSelector(limiter);
			var findParents = function (_elements) {
				ArrayUtils.each(_elements, function (elem) {
					var parentElement = elem.getParent();
					if (parentElement) {
						if (isMatchSelector(parentElement, selector))
							elements.push(parentElement);
						else if (!isMatchSelector(parentElement, limiter))
							findParents(parentElement.getChildren());
					}
				});
			};
			findParents(this.elements);
		}
	}
	return new DomHandler(this.options, elements);
};

// 获取所有匹配元素的上层元素
DomHandler.prototype.parents = function (selector) {
	var elements = [];
	if (this.length > 0) {
		selector = StringUtils.isBlank(selector) ? null : parseSelector(selector);
		var findParents = function (_elements) {
			ArrayUtils.each(_elements, function (elem) {
				var parentElement = elem.getParent();
				if (parentElement) {
					findParents(parentElement.getChildren());
					if (selector && selector.length > 0) {
						if (isMatchSelector(parentElement, selector))
							elements.push(parentElement);
					}
					else
						elements.push(parentElement);
				}
			});
		};
		findParents(this.elements);
	}
	return new DomHandler(this.options, unique(elements));
};

// 获取当前匹配元素的上级元素，直到selector选择器(不包含)
DomHandler.prototype.parentsUntil = function (selector, filter) {
	if (StringUtils.isBlank(selector))
		return this.parents(filter);
	var elements = [];
	if (this.length > 0) {
		selector = parseSelector(selector);
		filter = StringUtils.isBlank(filter) ? null : parseSelector(filter);
		var findParents = function (_elements) {
			ArrayUtils.each(_elements, function (elem) {
				var parentElement = elem.getParent();
				if (parentElement) {
					if (selector && selector.length > 0) {
						if (isMatchSelector(parentElement, selector))
							return ;
					}
					findParents(parentElement.getChildren());
					if (filter && filter.length > 0) {
						if (isMatchSelector(parentElement, filter))
							elements.push(parentElement);
					}
					else
						elements.push(parentElement);
				}
			});
		};
		findParents(this.elements);
	}
	return new DomHandler(this.options, unique(elements));
};

// 在所有匹配的元素中前面添加子元素
DomHandler.prototype.prepend = function (value) {
	if (this.length > 0 && Utils.notNull(value)) {
		if (value instanceof DomHandler) {
			if (value.length > 0)
				appendElements(this, value.elements, 0);
		}
		else if (value.length > 0) {
			appendElements(this, HtmlParser.parse(value));
		}
	}
	return this;
};

// 将当前匹配的元素添加到指定元素，返回新元素集
DomHandler.prototype.prependTo = function (value) {
	var newElements = null;
	if (this.length > 0 && Utils.notNull(value)) {
		if (value instanceof DomHandler) {
			newElements = appendElements(value, this.elements, 0);
		}
		else if (value.length > 0) {
			var handler = new DomHandler(this.options, HtmlParser.parse(value));
			newElements = appendElements(handler, this.elements, 0);
		}
	}
	return new DomHandler(this.options, newElements);
};

// 获取相邻的上一个元素
DomHandler.prototype.prev = function (selector) {
	var elements = [];
	if (this.length > 0) {
		selector = StringUtils.isBlank(selector) ? null : parseSelector(selector);
		ArrayUtils.each(this.elements, function (elem) {
			var prevElement = elem.getPrev();
			if (prevElement) {
				if (selector && selector.length > 0) {
					if (isMatchSelector(prevElement, selector))
						elements.push(prevElement);
				}
				else
					elements.push(prevElement);
			}
		});
	}
	return new DomHandler(this.options, unique(elements));
};

// 删除当前节点
DomHandler.prototype.remove = function (selector) {
	if (this.length > 0) {
		selector = StringUtils.isBlank(selector) ? null : parseSelector(selector);
		ArrayUtils.each(this.elements, function (elem) {
			if (selector && selector.length > 0 && isMatchSelector(elem, selector))
				elem.setParent(null);
		})
	}
	return this;
};

// 删除所有匹配元素的属性
DomHandler.prototype.removeAttr = function (value) {
	if (this.length > 0 && StringUtils.isNotBlank(value)) {
		ArrayUtils.each(this.elements, function (elem) {
			elem.removeAttribute(value);
		});
	}
	return this;
};

// 删除所有匹配元素的类
DomHandler.prototype.removeClass = function (value) {
	if (this.length > 0 && StringUtils.isNotBlank(value)) {
		ArrayUtils.each(this.elements, function (elem) {
			elem.removeClass(value);
		});
	}
	return this;
};

// 显示
DomHandler.prototype.show = function () {
	return this.removeClass("ui-hidden");
};

// 获取相邻的元素
DomHandler.prototype.siblings = function (selector) {
	var elements = [];
	if (this.length > 0) {
		selector = StringUtils.isBlank(selector) ? null : parseSelector(selector);
		ArrayUtils.each(this.elements, function (elem) {
			var parentElement = elem.getParent();
			if (parentElement) {
				ArrayUtils.each(parentElement.getChildren(), function (elem2) {
					if (elem != elem2) {
						if (selector && selector.length > 0) {
							if (isMatchSelector(elem2, selector))
								elements.push(elem2);
						}
						else {
							elements.push(elem2);
						}
					}
				});
			}
		});
	}
	return new DomHandler(this.options, unique(elements));
};

// 获取当前匹配元素个数
DomHandler.prototype.size = function () {
	return this.length;
};

// 获取子集，从 start 到 end 的子元素集合，start从0开始，不包含end
DomHandler.prototype.slice = function (start, end) {
	start = parseInt(start);
	if (!start || start < 0)
		start = 0;
	end = parseInt(end);
	if (isNaN(end))
		end = this.length;
	if (end > this.length)
		end = this.length;
	var elements = [];
	for (var i = start; i < end; i++) {
		elements.push(this.elements[i]);
	}
	return new DomHandler(this.options, elements);
};

// 读取或者设置元素的文本信息
DomHandler.prototype.text = function (value) {
	if (Utils.isNull(value)) {
		var values = [];
		ArrayUtils.each(this.elements, function (elem) {
			values.push(elem.innerText());
		})
		return values.join("");
	}
	else {
		ArrayUtils.each(this.elements, function (elem) {
			elem.setText(value, true);
		});
	}
	return this;
};

///////////////////////////////////////////////////////////
// 追加子节点
var appendElements = function (handler, elements, index) {
	if (handler.length === 0 || elements.length === 0)
		return [];
	var newElements = ArrayUtils.pushAll([], elements);
	handler.elements[0].addChildren(elements, index);
	for (var i = 1; i < handler.length; i++) {
		var element = handler.elements[i];
		var _elements = [];
		ArrayUtils.each(elements, function (temp) {
			var newElement = temp.clone();
			_elements.push(newElement);
			newElements.push(newElement);
		});
		element.addChildren(_elements, index);
	}
	return newElements;
};

var findElements = function (elements, selector) {
	if (typeof selector === "string")
		selector = parseSelector(selector);

	var results = [];
	ArrayUtils.each(selector, function (selItems) {
		var _elements = [];
		ArrayUtils.each(selItems, function (selItem, i) {
			if (i === 0)
				_elements = findInner(elements, selItem, true);
			else {
				var subElements = [];
				ArrayUtils.each(_elements, function (elem) {
					var temps = findInner(elem.getChildren(), selItem, !selItem.isChild);
					if (temps && temps.length > 0)
						ArrayUtils.pushAll(subElements, temps);
				});
				_elements = subElements;
			}
		});
		ArrayUtils.pushAll(results, _elements);
	});

	return unique(results);
};

var findInner = function (elements, selItem, deep) {
	var filters = [];
	ArrayUtils.each(elements, function (elem) {
		if (isMatchSelector(elem, selItem))
			filters.push(elem);
		if (deep) {
			var _filters = findInner(elem.getChildren(), selItem, true);
			if (_filters && _filters.length > 0)
				ArrayUtils.pushAll(filters, _filters);
		}
	});
	return filters;
};

///////////////////////////////////////////////////////////
// 解析选择器，如：“#container ul > li.item .name > .ic.ic-edt, .addBtn”，结果是：
// [
// 	[{
// 		isChild: false, 
// 		values: [{type: "#", name: "container"}]
// 	}, {
// 		isChild: false, 
// 		values: [{type: "", name: "ul"}]
// 	}, {
// 		isChild: true,
// 		values: [{type: "", name: "li"}, {type: ".", name: "item"}]
// 	}, {
// 		isChild: false,
// 		values: [{type: ".", name: "name"}]
// 	},{
// 		isChild: true,
// 		values: [{type: ".", name: "ic"}, {type: ".", name: "ic-edt"}]
// 	}],	[{
// 		isChild: false,
// 		values: [{type: ".", name: "addBtn"}]
// 	}]
// ]
var parseSelector = function (selector) {
	var results = [];
	ArrayUtils.each(StringUtils.trimToEmpty(selector).split(","), function (grp) {
		if (StringUtils.isBlank(grp))
			return ;
		var items = [];
		var childFlag = false;
		ArrayUtils.each(grp.replace(/>/g, " > ").replace(/\s+/g, " ").trim().split(" "), function (value) {
			if (value === ">")
				childFlag = true;
			else {
				var item = {isChild: childFlag, values: []};
				var type = "", tmp = "", chars = value.split("");
				for (var i = 0, l = chars.length; i < l; i++) {
					var ch = chars[i];
					if (ch === "#" || ch === "." || ch === ":") {
						if (tmp.length > 0)
							item.values.push({type: type, name: tmp});
						type = ch; tmp = "";
					}
					else 
						tmp += ch;
				}
				if (tmp.length > 0)
					item.values.push({type: type, name: tmp});
				items.push(item);
				childFlag = false;
			}
		});
		if (items.length > 0)
			results.push(items);
	});
	return results;
};

// 判断是否匹配某个元素的单个表达式，如：“div”，“.bar”，“div.bar”，“#main.foo.on”
var isMatchSelector = function (element, selector) {
	if (ArrayUtils.isArray(selector)) {
		for (var i = 0, l = selector.length; i < l; i++) {
			if (selector[i].length === 1 && isMatchSelector(element, selector[i][0]))
				return true;
		}
	}
	else if (ArrayUtils.isArray(selector.values)) {
		for (var i = 0, l = selector.values.length; i < l; i++) {
			if (!isMatchSelector(element, selector.values[i]))
				return false;
		}
		return true;
	}
	else {
		var type = selector.type;
		var name = selector.name;
		if (type === "#")
			return element.getId() === name;
		if (type === ".")
			return element.hasClass(name);
		if (type === "")
			return element.getTagName() === name;
		if (type === ":") {
			if (name === "empty") {
				var children = element.getChildren();
				return !children || children.length === 0;
			}
			if (name === "even")
				return element.getIndex() % 2 === 1;
			if (name === "odd")
				return element.getIndex() % 2 === 0;

			var parentElement = element.getParent();
			if (name === "first-child" || name === "first")
				return parentElement && parentElement.getFirstChild() == element;
			if (name === "last-child" || name === "last")
				return parentElement && parentElement.getLastChild() == element;
			if (/^eq\(/.test(name))
				return parentElement && parentElement.getChildAt(parseInt(name.substr(3))) == element;
			if (name === "parent")
				return !!parentElement;
		}
	}
	return false;
};

///////////////////////////////////////////////////////////
var unique = function (elements) {
	for (var i = elements.length - 1; i >= 0; i--) {
		var element = elements[i];
		for (var j = 0; j < i; j++) {
			if (element == elements[j]) {
				elements.splice(i, 1);
				break;
			}
		}
	}
	return elements;
};
