// ========================================================
// 文本输入框
// @author shicy <shicy85@163.com>
// Create on 2016-12-04
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.TextView)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("./base")).HolderBase;

	var Holder = function (context, options) {
		HolderBase.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		target.addClass("ui-textview");

		var options = this.options || {};

		if (this.isDisplayAsPassword())
			target.addClass("display-as-pwd");

		var ipt = $("<div class='ipt'></div>").appendTo(target);
		var input = renderInput.call(this, $, target, ipt);

		var width = this.getWidth();
		if (Utils.isNotBlank(width))
			ipt.css("width", width);

		if (Utils.isTrue(options.readonly)) {
			target.addClass("readonly");
			input.attr("readonly", "readonly");
		}

		if (Utils.isTrue(options.required))
			target.attr("required", "required");

		var maxSize = parseInt(options.maxSize) || 0;
		if (maxSize > 0) {
			target.addClass("show-size").attr("data-size", maxSize);
			var len = Utils.trimToEmpty(input.val()).length;
			ipt.append("<span class='size'>" + len + "/" + maxSize + "</span>");
		}

		if (Utils.isNotBlank(options.prompt))
			ipt.append("<span class='prompt'>" + options.prompt + "</span>");

		if (Utils.isNotBlank(options.tips))
			ipt.append("<span class='tips'>" + options.tips + "</span>");

		var description = options.description || options.desc;
		if (Utils.isNotBlank(description))
			target.append("<div class='desc'>" + description + "</div>");
		
		renderErrorMsg.call(this, $, target);

		return this;
	};

	// ====================================================
	_Holder.getWidth = function () {
		var options = this.options || {};
		if (Utils.isBlank(options.width))
			return null;
		if (isNaN(options.width))
			return options.width;
		return (parseFloat(options.width) || 0) + "px";
	};

	_Holder.getDecimals = function () {
		if (this.isDisplayAsPassword())
			return 0;
		var options = this.options || {};
		var type = options.dataType || options.type;
		if (type === "int")
			return 0;
		if (options.hasOwnProperty("decimals"))
			return parseInt(options.decimals) || 0;
		return 2;
	};

	_Holder.isDisplayAsPassword = function () {
		return Utils.isTrue(this.options.displayAsPwd);
	}

	// ====================================================
	var renderInput = function ($, target, parent) {
		var options = this.options || {};
		var multiple = Utils.isTrue(options.multi);
		var input = multiple ? "<textarea></textarea>" : "<input type='text'/>";
		input = $(input).appendTo(parent);

		if (multiple)
			target.addClass("multi");
		else
			parent.append("<span class='clear'></span>");

		var iptValue = options.value;
		var type = options.dataType || options.type;
		if (Utils.isNotBlank(type)) {
			if (type === "int")
				type = "number";
			if (/^(email|password|tel|url|number)$/.test(type))
				input.attr("type", type); // 标准类型添加“type”属性
			target.attr("data-type", type);
			if (/^(number|num|int)$/.test(type)) {
				var decimals = this.getDecimals(); // 保留小数点，只有数字类型有效
				target.attr("data-decimal", decimals);
				var minValue = parseFloat(options.min);
				var maxValue = parseFloat(options.max);
				if (!isNaN(minValue))
					target.attr("data-min", minValue);
				if (!isNaN(maxValue))
					target.attr("data-max", maxValue);
				if (Utils.isNotBlank(iptValue)) {
					iptValue = parseFloat(iptValue);
					if (isNaN(iptValue)) {
						iptValue = "";
					}
					else {
						if (!isNaN(minValue) && iptValue < minValue)
							iptValue = minValue;
						if (!isNaN(maxValue) && iptValue > maxValue)
							iptValue = maxValue;
						iptValue = iptValue.toFixed(decimals);
					}
				}
			}
		}
		if (Utils.isNotBlank(iptValue)) {
			input.val(iptValue);
			target.addClass("has-val");
		}

		return input;
	};

	var renderErrorMsg = function ($, target) {
		if (Utils.isNotBlank(this.options.empty))
			target.attr("data-empty", this.options.empty);

		var errorMsg = this.options.errmsg;
		if (Utils.isFunction(errorMsg)) {
			HolderBase.renderFunction(target, "errmsg", errorMsg);
		}
		else if (Utils.isNotBlank(errorMsg)) {
			target.attr("data-errmsg", errorMsg);
		}
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UITextView = window.UITextView = Component.TextView = function (view, options, holder) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.holder = holder;
		this.input = this.$el.find("input, textarea");

		this.maxSize = parseInt(this.$el.attr("data-size")) || 0;

		this.input.on("focusin", focusInHandler.bind(this));
		this.input.on("focusout", focusOutHandler.bind(this));
		this.input.on("keydown", keyDownHandler.bind(this));
		this.input.on("keyup", keyUpHandler.bind(this));
		this.tap(".clear", clearBtnClickHandler.bind(this));
	};
	var _UITextView = UITextView.prototype = new Component.base();

	UITextView.find = function (view) {
		return Component.find(view, ".ui-textview", UITextView);
	};

	UITextView.create = function (options) {
		return Component.create(options, UITextView, Holder);
	};

	// ====================================================
	_UITextView.val = function (value) {
		if (Utils.isNotNull(value)) {
			this.input.val(value);
			this.showError(false);
			if (value.length > 0)
				this.$el.addClass("has-val");
			else
				this.$el.removeClass("has-val");
			if (this.maxSize > 0)
				this.$el.find(".ipt > .size").text(value.length + "/" + this.maxSize);
		}
		return this.input.val();
	};

	_UITextView.setTips = function (value) {
		var tips = this.$el.find(".ipt > .tips");
		if (tips && tips.length > 0) {
			tips.html(value);
		}
		else if (Utils.isNotBlank(value)) {
			this.$el.children(".ipt").append("<span class='tips'>" + value + "</span>");
		}
	};

	_UITextView.setDescription = function (value) {
		var desc = this.$el.children(".desc");
		if (desc && desc.length > 0) {
			desc.html(value);
		}
		else if (Utils.isNotBlank(value)) {
			this.$el.append("<div class='desc'>" + value + "</div>");
		}
	};

	_UITextView.showError = function (errmsg) {
		this.$el.removeClass("show-error").find(".errmsg").remove();
		if (errmsg) {
			this.$el.addClass("show-error");
			if (typeof errmsg === "string") {
				var target = $("<div class='errmsg'></div>").appendTo(this.$el);
				target.text(errmsg);

				var ipttag = this.$el.children(".ipt");
				target.insertAfter(ipttag);
				if (!this.isRenderAsApp())
					target.css("top", (ipttag.height() + 8));
			}
		}
	};

	// ====================================================
	var keyDownHandler = function (e) {
		this.showError(false);
		if (Utils.isControlKey(e))
			return true;
		var text = this.input.val() || "";
		var type = this.$el.attr("data-type") || "text";
		if (type === "number" || type === "num") {
			if (!isNumberKeyEnable(e, text))
				return false;
		}
		else if (type === "tel" || type === "mobile" || type === "phone") {
			if (!/[0-9]|\-/.test(e.key))
				return false;
			if (e.key === "-" && type === "mobile")
				return false;
		}
		else if (type === "text") {
			if (this.maxSize > 0 && text.length >= this.maxSize)
				return false;
		}
		this.$el.addClass("has-val");
	};

	var keyUpHandler = function (e) {
		var value = this.input.val() || "", text = value;
		var type = this.$el.attr("data-type") || "text";
		if (type === "number" || type === "num")
			text = value.replace(/[^0-9\.\-]/g, "");
		else if (type === "tel" || type === "mobile" || type === "phone")
			text = value.replace(/[^0-9\-]/g, "");
		if (text != value)
			this.input.val(text);
		if (text.length === 0)
			this.$el.removeClass("has-val");
		if (this.maxSize > 0)
			this.$el.find(".ipt > .size").text(text.length + "/" + this.maxSize);
		if (e.which === 13) {
			var self = this;
			setTimeout(function () {
				self.input.focusout();
				self.trigger("enter", text);
			});
		}
	};

	var focusInHandler = function (e) {
		var self = this;
		this.$el.addClass("focus");
		var lastValue = this.input.val();
		this._changeTimer = setInterval(function () {
			var value = self.input.val();
			if (value != lastValue) {
				lastValue = value;
				self.trigger("change", value);
			}
		}, 100);
	};

	var focusOutHandler = function (e) {
		this.$el.removeClass("focus");
		var text = this.input.val() || "";
		if (text.length === 0) {
			if (this.$el.attr("required") === "required")
				this.showError(this.$el.attr("data-empty") || "输入框不能为空");
		}
		else {
			var type = this.$el.attr("data-type") || "text";
			if (type === "number" || type === "num") {
				if (isNaN(text)) {
					this.showError("数据格式不正确");
				}
				else {
					var val = parseFloat(text);
					var min = parseFloat(this.$el.attr("data-min"));
					if (!isNaN(min) && min > val)
						this.showError("数据不正确，请输入大于等于 " + min + " 的值");
					var max = parseFloat(this.$el.attr("data-max"));
					if (!isNaN(max) && max < val)
						this.showError("数据不正确，请输入小于等于 " + max + " 的值");
					var decimals = parseFloat(this.$el.attr("data-decimal")) || 0;
					if (decimals > 0)
						this.input.val(val.toFixed(decimals));
				}
			}
			else if (type === "tel") {
				if (!Utils.isMobile(text) && !Utils.isPhone(text))
					this.showError("手机或电话号码不正确");
			}
			else if (type === "text") {
				if (this.maxSize > 0 && this.maxSize < text.length)
					this.showError("输入内容太长，允许最大长度为：" + this.maxSize);
			}
			else if (type === "email") {
				if (!Utils.isEmail(text))
					this.showError("Email格式不正确，请重新输入");
			}
			else if (type === "mobile") {
				if (!Utils.isMobile(text))
					this.showError("手机号码不正确，必须是1开头的11位数字");
			}
			else if (type === "phone") {
				if (!Utils.isPhone(text))
					this.showError("电话号码不正确");
			}
			else if (type === "url") {
				if (!Utils.isUrl(text))
					this.showError("url格式不正确");
			}
		}
		if (this._changeTimer) {
			var timer = this._changeTimer;
			this._changeTimer = null;
			setTimeout(function () {
				clearInterval(timer);
			}, 100);
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
	var isNumberKeyEnable = function (e, text) {
		if (/[0-9]/.test(e.key))
			return true;
		if (e.key === "-")
			return !/\-/.test(text);
		if (e.key === ".")
			return !/\./.test(text);
		return false;
	};

	// ====================================================
	Component.register(".ui-textview", UITextView);

})(typeof VRender !== "undefined");
