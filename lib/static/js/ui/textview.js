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

		this.input.on("focusin", onFocusInHandler.bind(this));
		this.input.on("focusout", onFocusOutHandler.bind(this));
		this.input.on("keydown", onKeyDownHandler.bind(this));
		this.input.on("keyup", onKeyUpHandler.bind(this));
		this.$el.on("tap", ".clear", clearBtnClickHandler.bind(this));

		if (!this.isRenderAsApp()) {
			this.inputTag.on("mouseenter", onMouseEnterHandler.bind(this));
			this.inputTag.on("mouseleave", onMouseLeaveHandler.bind(this));
		}

		doInit.call(this);
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
		if (Utils.isNull(value)) {
			return this.getValue();
		}
		this.setValue(value);
		return this;
	};

	_UITextView.validate = function (callback) {
		var value = this.getValue();
		if (value.length == 0) {
			if (this.isRequired())
				setErrorMsg.call(this, (this.getEmptyMsg() || "输入框不能为空"));
			else 
				clearErrorMsg.call(this);
			if (Utils.isFunction(callback)) {
				callback(this.lastErrorMsg);
			}
		}
		else {
			var self = this;
			doValidate.call(this, value, function () {
				if (Utils.isFunction(callback)) {
					callback(self.lastErrorMsg);
				}
			});
		}
	};

	_UITextView.getValue = function () {
		return this.input.val() || "";
	};
	_UITextView.setValue = function (value) {
		value = Utils.trimToEmpty(value);
		this.input.val(value);
		clearErrorMsg.call(this);
		valueChanged.call(this, value);
	};

	_UITextView.getPrompt = function () {
		return this.inputTag.find(".prompt").text();
	};
	_UITextView.setPrompt = function (value) {
		this.inputTag.find(".prompt").remove();
		if (Utils.isNotBlank(value)) {
			$("<span class='prompt'></span>").appendTo(this.inputTag).text(value);
		}
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

	_UITextView.getDataType = function () {
		return this.$el.attr("opt-type") || "text";
	};
	_UITextView.setDataType = function (value) {
		if (/^(number|num|int)$/.test(type))
			type = "_number";
		this.$el.attr("opt-type", type);
		if (/^(email|password|tel|url|number)$/.test(type))
			this.input.attr("type", type);
		else
			this.input.removeAttr("type");
	};

	_UITextView.isReadonly = function () {
		return this.$el.attr("opt-readonly") == 1;
	};
	_UITextView.setReadonly = function (value) {
		if (Utils.isNull(value) || Utils.isTrue(value)) {
			this.$el.attr("opt-readonly", "1");
			this.input.attr("readonly", "readonly");
		}
		else {
			this.$el.removeAttr("opt-readonly");
			this.input.removeAttr("readonly");
		}
	};

	_UITextView.isRequired = function () {
		return this.$el.attr("opt-required") == 1;
	};
	_UITextView.setRequired = function (value) {
		if (Utils.isNull(value) || Utils.isTrue(value)) {
			this.$el.attr("opt-required", "1");
		}
		else {
			this.$el.removeAttr("opt-required");
		}
	};

	_UITextView.getEmptyMsg = function () {
		return this.$el.attr("opt-empty");
	};
	_UITextView.setEmptyMsg = function (value) {
		if (Utils.isBlank(value))
			this.$el.removeAttr("opt-empty");
		else
			this.$el.attr("opt-empty", value);
	};

	_UITextView.getErrorMsg = function () {
		return this.$el.attr("opt-errmsg");
	};
	_UITextView.setErrorMsg = function (value) {
		if (Utils.isBlank(value))
			this.$el.removeAttr("opt-errmsg");
		else
			this.$el.attr("opt-errmsg", value);
	};

	_UITextView.getMaxSize = function () {
		if (this.hasOwnProperty("maxSize"))
			return this.maxSize;
		this.maxSize = parseInt(this.$el.attr("opt-size")) || 0;
		return this.maxSize;
	};
	_UITextView.setMaxSize = function (value) {
		this.maxSize = parseInt(value) || 0;
		this.$el.attr("opt-size", this.maxSize);
		if (this.maxSize > 0) {
			this.$el.addClass("show-size");
			this.inputTag.find(".size").remove();
			var text = this.getValue() || "";
			$("<span class='size'></span>").appendTo(this.inputTag).text(text.length + "/" + this.maxSize);
		}
		else {
			this.$el.removeClass("show-size");
			this.inputTag.find(".size").remove();
		}
	};

	_UITextView.getValidate = function () {
		return Renderer.fn.getFunction.call(this, "_validate", "validate");
	};
	_UITextView.setValidate = function (value) {
		this.options._validate = value;
		this.$el.children(".ui-fn[name='validate']").remove();
	};

	_UITextView.hasError = function () {
		return this.$el.is(".is-error");
	};

	_UITextView.showError = function (errmsg) {
		if (errmsg === true) {
			errmsg = this.lastErrorMsg || this.$el.attr("opt-errmsg") || "内容不正确！";
		}
		if (errmsg)
			setErrorMsg.call(this, errmsg);
		else
			clearErrorMsg.call(this);
	};

	_UITextView.getDecimals = function () {
		return parseFloat(this.$el.attr("opt-decimal")) || 0;
	};
	_UITextView.setDecimals = function (value) {
		if (isNaN(value))
			value = 2;
		else
			value = parseInt(value) || 0;
		this.$el.attr("opt-decimal", value);
	};

	_UITextView.isMultiline = function () {
		return this.$el.is(".multi");
	};

	_UITextView.isAutoHeight = function () {
		return this.$el.attr("opt-autoheight") == 1;
	};

	_UITextView.isDisplayAsPassword = function () {
		return this.$el.attr("opt-pwd") == 1;
	};
	_UITextView.setDisplayAsPassword = function (value) {
		var style = window.getComputedStyle(this.input[0]);
		if (Utils.isNull(value) || Utils.isTrue(value)) {
			this.$el.attr("opt-pwd", "1");
			if (!style.webkitTextSecurity)
				this.input.attr("type", "password");
		}
		else {
			this.$el.removeAttr("opt-pwd");
			if (this.input.attr("type") == "password")
				this.input.attr("type", "text");
		}
	};

	// ====================================================
	var onKeyDownHandler = function (e) {
		clearErrorMsg.call(this);
		if (Utils.isControlKey(e))
			return true;
		var text = this.input.val() || "";
		var type = this.getDataType();
		if (type == "_number" || type == "number" || type == "num") {
			if (!isNumberKeyEnable(e, text))
				return false;
			if (e.key == "." && this.getDecimals() == 0)
				return false;
		}
		else if (type == "tel" || type == "mobile" || type == "phone") {
			if (!/[0-9]|\-/.test(e.key))
				return false;
			if (e.key == "-" && type == "mobile")
				return false;
		}
		else if (type == "text") {
			var maxSize = this.getMaxSize();
			if (maxSize > 0 && text.length >= maxSize)
				return false;
		}
		valueChanged.call(this, text + "."); // 加一个字符，保证隐藏提示信息
	};

	var onKeyUpHandler = function (e) {
		var value = this.input.val() || "", text = value;
		var type = this.getDataType();
		if (type == "_number" || type == "number" || type == "num")
			text = value.replace(/[^0-9\.\-]/g, "");
		else if (type == "tel" || type == "mobile" || type == "phone")
			text = value.replace(/[^0-9\-]/g, "");
		if (text != value)
			this.input.val(text);
		valueChanged.call(this, text);
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
				valueChanged.call(self, value);
				self.trigger("change", value);
			}
		}, 100);
	};

	var onFocusOutHandler = function (e) {
		this.$el.removeClass("focus");
		var text = this.input.val() || "";
		if (text.length === 0) {
			if (this.isRequired())
				setErrorMsg.call(this, (this.getEmptyMsg() || "输入框不能为空"));
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
					self.t_hideerror = null;
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
	var doInit = function () {
		this.setDisplayAsPassword(this.isDisplayAsPassword());
		if (this.isAutoHeight()) {
			tryAutoSize.call(this, this.getValue());
		}
	};

	var doValidate = function (value, callback) {
		var validateHandler = this.getValidate();
		var defaultErrorMsg = this.getErrorMsg();
		if (Utils.isFunction(validateHandler)) {
			var self = this;
			var validateResult = function (_result) {
				if (_result === true)
					setErrorMsg.call(self, (defaultErrorMsg || "内容不正确！"));
				else if (_result === false)
					clearErrorMsg.call(self);
				else if (_result)
					setErrorMsg.call(self, _result);
				else
					clearErrorMsg.call(self);
				if (Utils.isFunction(callback)) {
					setTimeout(callback, 0);
				}
			};
			var result = validateHandler(this, value, validateResult);
			if (Utils.isNotNull(result))
				validateResult(result);
		}
		else {
			var type = this.getDataType();
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
					var decimals = this.getDecimals();
					if (decimals > 0)
						this.input.val(val.toFixed(decimals));
				}
			}
			else if (type == "tel") {
				if (!Utils.isMobile(value) || !Utils.isPhone(value))
					setErrorMsg.call(this, (defaultErrorMsg || "手机或电话号码不正确"));
			}
			else if (type == "text") {
				var maxSize = this.getMaxSize();
				if (maxSize > 0 && maxSize < value.length)
					setErrorMsg.call(this, (defaultErrorMsg || ("输入内容太长，允许最大长度为：" + maxSize)));
			}
			else if (type == "email") {
				if (!Utils.isEmail(value))
					setErrorMsg.call(this, (defaultErrorMsg || "电子邮箱格式不正确，请重新输入"));
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
			if (Utils.isFunction(callback)) {
				setTimeout(callback, 0);
			}
		}
	};

	var valueChanged = function (text) {
		if (text && text.length > 0)
			this.$el.addClass("has-val");
		else
			this.$el.removeClass("has-val");
		if (this.$el.is(".show-size")) {
			var maxSize = this.getMaxSize();
			if (maxSize > 0)
				this.inputTag.find(".size").text(text.length + "/" + maxSize);
		}
		tryAutoSize.call(this, text);
	};

	var tryAutoSize = function (text) {
		if (this.isAutoHeight()) {
			var preview = this.inputTag.find(".preview pre");
			if (preview && preview.length > 0) {
				text = (text || "").replace(/\n$/, "\n.");
				preview.text(text);
			}
			var input = this.input.get(0);
			var minHeight = Utils.toPx(this.isRenderAsRem() ? "0.32rem" : "32px");
			var setInner = function () {
				var height = preview[0].scrollHeight;
				height = Math.max(height, minHeight) + 2;
				input.style.height = height + "px";
			};
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(setInner);
			}
			else {
				setTimeout(setInner, 0);
			}
		}
	};

	var setErrorMsg = function (errmsg) {
		this.lastErrorMsg = errmsg;
		var target = this.$el.find(".errmsg");
		if (!target || target.length == 0) {
			target = $("<div class='errmsg'></div>").appendTo(this.$el);
			target.insertAfter(this.inputTag);
			if (!this.isRenderAsApp())
				target.css("top", (this.inputTag.height() + 8));
		}

		target.html(errmsg);
		this.$el.addClass("is-error");
		target.removeClass("animate-in").removeClass("animate-out");

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);

		// 3秒后隐藏
		if (!this.isRenderAsApp()) {
			if (this.t_hideerror) {
				clearTimeout(this.t_hideerror);
			}
			var self = this;
			this.t_hideerror = setTimeout(function () {
				self.t_hideerror = null;
				target.addClass("animate-out");
			}, 3000);
		}
	};

	var clearErrorMsg = function () {
		this.lastErrorMsg = null;
		if (this.hasError()) {
			var self = this;
			var target = this.$el.find(".errmsg").addClass("animate-out");
			setTimeout(function () {
				self.$el.removeClass("is-error");
				target.removeClass("animate-in").removeClass("animate-out");
			}, 300);
		}
	};

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