// ========================================================
// 文本输入框
// @author shicy <shicy85@163.com>
// Create on 2016-12-04
// ========================================================

(function () {
	if (VRender.Component.TextView)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var TextViewRender = Renderer.textview;

	///////////////////////////////////////////////////////
	var UITextView = window.UITextView = Component.TextView = function (view, options) {
		if (!Component.base.isElement(view))
			return UITextView.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.inputTag = this.$el.children(".ipt");
		this.input = this.inputTag.find("input, textarea");

		this.maxSize = parseInt(this.$el.attr("opt-size")) || 0;

		this.input.on("focusin", onFocusInHandler.bind(this));
		this.input.on("focusout", onFocusOutHandler.bind(this));
		this.input.on("keydown", onKeyDownHandler.bind(this));
		this.input.on("keyup", onKeyUpHandler.bind(this));
		this.inputTag.on("mouseenter", onMouseEnterHandler.bind(this));
		this.inputTag.on("mouseleave", onMouseLeaveHandler.bind(this));
		this.$el.on("tap", ".clear", clearBtnClickHandler.bind(this));
	};
	var _UITextView = UITextView.prototype = new Component.base();

	UITextView.find = function (view) {
		return Component.find(view, ".ui-textview", UITextView);
	};

	UITextView.create = function (options) {
		return Component.create(options, UITextView, TextViewRender);
	};

	// ====================================================
	_UITextView.val = function (value) {
		if (Utils.isNotNull(value)) {
			this.input.val(value);
			this.showError(false); // 非用户操作不显示错误信息
			setValueFlag.call(this, (value.length > 0));
			if (this.maxSize > 0)
				this.inputTag.find(".size").text(value.length + "/" + this.maxSize);
		}
		return this.input.val();
	};

	_UITextView.getTips = function () {
		return this.inputTag.find(".tips").text();
	};
	_UITextView.setTips = function (value) {
		this.inputTag.find(".tips").remove();
		if (Utils.isNotBlank(value)) {
			$("<span class='tips'></span>").appendTo(this.inputTag).html(value);
		}
	};

	_UITextView.getDescription = function () {
		return this.$el.children(".desc").text();
	};
	_UITextView.setDescription = function (value) {
		this.$el.children(".desc").remove();
		if (Utils.isNotBlank(value)) {
			$("<div class='desc'></div>").appendTo(this.$el).html(value);
		}
	};

	_UITextView.getErrorMsg = function () {
		return this.$el.attr("opt-errmsg");
	};
	_UITextView.setErrorMsg = function (value) {
		this.$el.attr("opt-errmsg", Utils.trimToEmpty(value));
	};

	_UITextView.getValidate = function () {
		return Renderer.fn.getFunction.call(this, "validate");
	};
	_UITextView.setValidate = function (value) {
		this.options.validate = value;
		this.$el.children(".ui-fn[name='validate']").remove();
	};

	_UITextView.hasError = function () {
		return this.$el.is(".is-error");
	};

	_UITextView.showError = function (errmsg) {
		if (errmsg === true) {

		}

		// this.lastErrorMsg = errmsg;
		// var self = this;
		// var target = this.$el.find(".errmsg");
		// if (!errmsg) {
		// 	if (this.hasError()) {
		// 		target.addClass("animate-out");
		// 		setTimeout(function () {
		// 			self.$el.removeClass("is-error");
		// 			target.removeClass("animate-in").removeClass("animate-out");
		// 		}, 200);
		// 	}
		// }
		// else {
		// 	if (!target || target.length == 0) {
		// 		target = $("<div class='errmsg'></div>").appendTo(this.$el);
		// 		target.insertAfter(this.inputTag);
		// 		if (!this.isRenderAsApp())
		// 			target.css("top", (this.inputTag.height() + 8));
		// 	}
		// 	target.text(errmsg);
		// 	this.$el.addClass("is-error");
		// 	target.removeClass("animate-in").removeClass("animate-out");

		// 	setTimeout(function () {
		// 		target.addClass("animate-in");
		// 	}, 0);

		// 	if (this.t_hideerror) {
		// 		clearTimeout(this.t_hideerror);
		// 	}
		// 	this.t_hideerror = setTimeout(function () {
		// 		self.t_hideerror = null;
		// 		target.addClass("animate-out");
		// 	}, 3000);
		// }
	};

	// _UITextView._getErrorMsg = function () {
	// 	if (this.options.hasOwnProperty("errmsg"))
	// 		return this.options.errmsg;
	// 	var errmsg = this.$el.attr("opt-errmsg");
	// 	if (!errmsg) {
	// 		errmsg = Renderer.fn.getFunction.call(this, "errmsg", "errmsg");
	// 		delete this.errmsg;
	// 	}
	// 	this.options.errmsg = errmsg;
	// 	this.$el.removeAttr("opt-errmsg");
	// 	return errmsg;
	// };

	// ====================================================
	var onKeyDownHandler = function (e) {
		this.showError(false);
		if (Utils.isControlKey(e))
			return true;
		var text = this.input.val() || "";
		var type = this.$el.attr("opt-type") || "text";
		if (type == "_number" || type == "number" || type == "num") {
			if (!isNumberKeyEnable(e, text))
				return false;
		}
		else if (type == "tel" || type == "mobile" || type == "phone") {
			if (!/[0-9]|\-/.test(e.key))
				return false;
			if (e.key == "-" && type == "mobile")
				return false;
		}
		else if (type == "text") {
			if (this.maxSize > 0 && text.length >= this.maxSize)
				return false;
		}
		setValueFlag.call(this, true);
	};

	var onKeyUpHandler = function (e) {
		var value = this.input.val() || "", text = value;
		var type = this.$el.attr("opt-type") || "text";
		if (type == "_number" || type == "number" || type == "num")
			text = value.replace(/[^0-9\.\-]/g, "");
		else if (type == "tel" || type == "mobile" || type == "phone")
			text = value.replace(/[^0-9\-]/g, "");
		if (text != value)
			this.input.val(text);
		setValueFlag.call(this, (text.length > 0));
		if (this.maxSize > 0)
			this.inputTag.find(".size").text(text.length + "/" + this.maxSize);
		if (e.which === 13) {
			var self = this;
			setTimeout(function () {
				self.input.focusout();
				self.trigger("enter", text);
			});
		}
	};

	var onFocusInHandler = function (e) {
		var self = this;
		this.$el.addClass("focus");
		var lastValue = this.input.val();
		this.t_focus = setInterval(function () {
			var value = self.input.val();
			if (value != lastValue) {
				lastValue = value;
				self.trigger("change", value);
			}
		}, 100);
	};

	var onFocusOutHandler = function (e) {
		this.$el.removeClass("focus");
		var text = this.input.val() || "";
		if (text.length === 0) {
			if (this.$el.attr("opt-required") == 1)
				this.showError(this.$el.attr("opt-empty") || "输入框不能为空");
		}
		else {
			doValidate.call(this, text);
		}
		if (this.t_focus) {
			var timer = this.t_focus;
			this.t_focus = null;
			setTimeout(function () {
				clearInterval(timer);
			}, 100);
		}
	};

	var onMouseEnterHandler = function (e) {
		if (this.hasError()) {
			if (this.t_hideerror) {
				clearTimeout(this.t_hideerror);
				this.t_hideerror = null;
			}
			this.$el.find(".errmsg").removeClass("animate-out");
		}
	};

	var onMouseLeaveHandler = function (e) {
		if (this.hasError()) {
			if (!this.t_hideerror) {
				var self = this;
				this.t_hideerror = setTimeout(function () {
					self.$el.find(".errmsg").addClass("animate-out");
				}, 3000);
			}
		}
	};

	var clearBtnClickHandler = function (e) {
		this.val("");
		this.trigger("change", "");
		var self = this;
		setTimeout(function () {
			self.input.focus();
		}, 0);
	};

	// ====================================================
	var doValidate = function (value) {
		var validateHandler = this.getValidate();
		var defaultErrorMsg = this.getErrorMsg();
		if (Utils.isFunction(validateHandler)) {
			var validateResult = function (_result) {
				if (_result === true)
					setErrorMsg.call(this, (defaultErrorMsg || "出错了！"));
				else if (_result === false)
					clearErrorMsg.call(this);
				else if (result)
					setErrorMsg.call(this, result);
				else
					clearErrorMsg.call(this);
			};
			var result = validateHandler(this, value, validateResult);
			if (Utils.isNotNull(result))
				validateResult(result);
		}
		else {
			var type = this.$el.attr("opt-type") || "text";
			if (type == "_number" || type == "number" || type == "num") {
				if (isNaN(value)) {
					setErrorMsg.call(this, (defaultErrorMsg || "数据格式不正确"));
				}
				else {
					var val = parseFloat(value);
					var min = parseFloat(this.$el.attr("opt-min"));
					if (!isNaN(min) && min > val)
						setErrorMsg.call(this, (defaultErrorMsg || ("数据不正确，请输入大于等于" + min + "的值")));
					var max = parseFloat(this.$el.attr("opt-max"));
					if (!isNaN(max) && max < val)
						setErrorMsg.call(this, (defaultErrorMsg || ("数据不正确，请输入小于等于" + max + "的值")));
					var decimals = parseFloat(this.$el.attr("opt-decimal")) || 0;
					if (decimals > 0)
						this.input.val(val.toFixed(decimals));
				}
			}
			else if (type == "tel") {
				if (!Utils.isMobile(value) || !Utils.isPhone(value))
					setErrorMsg.call(this, (defaultErrorMsg || "手机或电话号码不正确"));
			}
			else if (type == "text") {
				if (this.maxSize > 0 && this.maxSize < value.length)
					setErrorMsg.call(this, (defaultErrorMsg || ("输入内容太长，允许最大长度为：" + this.maxSize)));
			}
			else if (type == "email") {
				if (!Utils.isEmail(value))
					setErrorMsg.call(this, (defaultErrorMsg || "Email格式不正确，请重新输入"));
			}
			else if (type == "mobile") {
				if (!Utils.isMobile(value))
					setErrorMsg.call(this, (defaultErrorMsg || "手机号码不正确，必须是1开头的11位数字"));
			}
			else if (type == "phone") {
				if (!Utils.isPhone(value))
					setErrorMsg.call(this, (defaultErrorMsg || "电话号码不正确"));
			}
			else if (type == "url") {
				if (!Utils.isUrl(value))
					setErrorMsg.call(this, (defaultErrorMsg || "url格式不正确"));
			}
		}
	};

	var setValueFlag = function (hasValue) {
		if (hasValue)
			this.$el.addClass("has-val");
		else
			this.$el.removeClass("has-val");
	};

	var setErrorMsg = function (errmsg) {
		var target = this.$el.find(".errmsg");
		if (!target || target.length == 0) {
			target = $("<div class='errmsg'></div>").appendTo(this.$el);
			target.insertAfter(this.inputTag);
			if (!isRenderAsApp())
				target.css("top", (this.inputTag.height() + 8));
		}

		target.text(errmsg);
		this.$el.addClass("is-error");
		target.removeClass("animate-in").removeClass("animate-out");

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);

		// 3秒后隐藏
		if (this.t_hideerror) {
			clearTimeout(this.t_hideerror);
		}
		var self = this;
		this.t_hideerror = setTimeout(function () {
			self.t_hideerror = null;
			target.addClass("animate-out");
		}, 3000);
	};

	var clearErrorMsg = function () {
		if (this.hasError()) {
			var self = this;
			var target = this.$el.find(".errmsg").addClass("animate-out");
			setTimeout(function () {
				self.$el.removeClass("is-error");
				target.removeClass("animate-in").removeClass("animate-out");
			}, 200);
		}
	};

	// var setErrorMsgByDefault = function (defmsg) {
	// 	var _errmsg = this._getErrorMsg();
	// 	if (Utils.isFunction(_errmsg)) {
	// 		var self = this;
	// 		var result = _errmsg(this, this.input.val(), function (err) {
	// 			if (err)
	// 				setErrorMsg.call(self, (err === true ? defmsg : err));
	// 			else
	// 				clearErrorMsg.call(self);
	// 		});
	// 		if (result === true)
	// 			setErrorMsg.call(this, defmsg);
	// 		else if (result === false)
	// 			clearErrorMsg.call(this);
	// 		else if (result)
	// 			setErrorMsg.call(this, result);
	// 	}
	// 	else if (_errmsg) {
	// 		setErrorMsg.call(this, (_errmsg === true ? defmsg : _errmsg));
	// 	}
	// 	else if (defmsg) {
	// 		setErrorMsg.call(this, defmsg);
	// 	}
	// 	else {
	// 		clearErrorMsg.call(this);
	// 	}
	// };

	var isNumberKeyEnable = function (e, text) {
		if (/[0-9]/.test(e.key))
			return true;
		if (e.key == "-")
			return !/\-/.test(text) && text.length == 0;
		if (e.key == ".")
			return !/\./.test(text) && text.length > 0;
		return false;
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-textview", UITextView);

})();