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

	var Holder = function (options) {
		HolderBase.call(this, options);
		this.setValue(this.options.value);
		this.setPrompt(this.options.prompt);
		this.setDataType(this.options.type);
		this.setDescription(this.options.desc);
		this.setTips(this.options.tips);
		this.setWidth(this.options.width);
		this.setEmptyMsg(this.options.empty);
		this.setErrorMsg(this.options.errmsg);
		this.setDecimals(this.options.decimals);
		this.setMinValue(this.options.min);
		this.setMaxValue(this.options.max);
		this.setMaxSize(this.options.maxSize);
		if (this.options.hasOwnProperty("readonly"))
			this.setReadonly(this.options.readonly);
		if (this.options.hasOwnProperty("required"))
			this.setRequired(this.options.required);
		if (this.options.hasOwnProperty("multi"))
			this.setMulitline(this.options.multi);
		if (this.options.hasOwnProperty("displayAsPwd"))
			this.setDisplayAsPassword(this.options.displayAsPwd);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		
		target.addClass("ui-textview");

		var displayAsPwd = this.isDisplayAsPassword();

		var ipt = $("<div class='ipt'></div>").appendTo(target);

		var multiple = this.isMulitline();
		var input = $(multiple ? "<textarea></textarea>" : "<input type='text'/>").appendTo(ipt);
		if (multiple)
			target.addClass("multi");
		else
			ipt.append("<span class='clear'></span>");

		var iptValue = this.getValue();
		var type = this.getDataType();
		if (Utils.isNotBlank(type)) {
			if (/email|password|tel|url|number/.test(type))
				input.attr("type", type); // 标准类型添加“type”属性
			target.attr("data-type", type);
			if (/number|num/.test(type)) {
				var decimals = this.getDecimals(); // 保留小数点，只有数字类型有效
				target.attr("data-decimal", decimals);
				var minValue = this.getMinValue();
				var maxValue = this.getMaxValue();
				if (!isNaN(minValue))
					target.attr("data-min", minValue);
				if (!isNaN(maxValue))
					target.attr("data-max", maxValue);
				if (Utils.isNotBlank(iptValue)) {
					iptValue = parseFloat(iptValue);
					iptValue = isNaN(iptValue) ? "" : iptValue.toFixed(decimals);
					if (!isNaN(iptValue)) {
						if (iptValue < minValue)
							iptValue = minValue;
						if (iptValue > maxValue)
							iptValue = maxValue;
					}
				}
			}
		}
		if (Utils.isNotBlank(iptValue)) {
			input.val(iptValue);
			target.addClass("has-val");
		}

		var width = this.getWidth();
		if (width > 0)
			ipt.css("width", width + "px");

		if (this.isReadonly()) {
			target.addClass("readonly");
			input.attr("readonly", "readonly");
		}

		if (this.isRequired())
			target.attr("required", "required");

		var maxSize = this.getMaxSize();
		if (maxSize > 0) {
			target.addClass("show-size").attr("data-size", maxSize);
			var len = Utils.trimToEmpty(iptValue).length;
			ipt.append("<span class='size'>" + len + "/" + maxSize + "</span>");
		}

		var prompt = this.getPrompt();
		if (Utils.isNotBlank(prompt))
			ipt.append("<span class='prompt'>" + prompt + "</span>");

		var tips = this.getTips();
		if (Utils.isNotBlank(tips))
			ipt.append("<span class='tips'>" + tips + "</span>");

		var description = this.getDescription();
		if (Utils.isNotBlank(description))
			target.append("<div class='desc'>" + description + "</div>");
		
		target.attr("data-empty", this.getEmptyMsg());
		target.attr("data-errmsg", this.getErrorMsg());

		if (this.isDisplayAsPassword())
			target.addClass("display-as-pwd");

		return this;
	};

	// ====================================================
	_Holder.getValue = function () {
		return this.t_value;
	};
	_Holder.setValue = function (value) {
		this.t_value = value;
	};

	_Holder.getPrompt = function () {
		return this.t_prompt;
	};
	_Holder.setPrompt = function (value) {
		this.t_prompt = value;
	};

	_Holder.getDataType = function () {
		if (this.t_datatype === "int")
			return "number";
		return this.t_datatype;
	};
	_Holder.setDataType = function (value) {
		this.t_datatype = value;
	};

	_Holder.getDescription = function () {
		return this.t_description;
	};
	_Holder.setDescription = function (value) {
		this.t_description = value;
	};

	_Holder.getTips = function () {
		return this.t_tips;
	};
	_Holder.setTips = function (value) {
		this.t_tips = value;
	};

	_Holder.getWidth = function () {
		return parseFloat(this.t_width) || 0;
	};
	_Holder.setWidth = function (value) {
		this.t_width = value;
	};

	_Holder.isReadonly = function () {
		if (this.hasOwnProperty("t_readonly"))
			return Utils.isTrue(this.t_readonly);
		return false;
	};
	_Holder.setReadonly = function (bool) {
		this.t_readonly = bool;
	};

	_Holder.isRequired = function () {
		if (this.hasOwnProperty("t_required"))
			return Utils.isTrue(this.t_required);
		return false;
	};
	_Holder.setRequired = function (value) {
		this.t_required = value;
	};

	_Holder.getEmptyMsg = function () {
		return this.t_emptymsg;
	};
	_Holder.setEmptyMsg = function (value) {
		this.t_emptymsg = value;
	};

	_Holder.getErrorMsg = function () {
		return this.t_errormsg;
	};
	_Holder.setErrorMsg = function (value) {
		this.t_errormsg = value;
	};

	_Holder.getDecimals = function () {
		if (this.t_datatype === "int")
			return 0;
		if (this.isDisplayAsPassword())
			return 0;
		if (isNaN(this.t_decimals))
			return 2;
		return parseInt(this.t_decimals) || 0;
	};
	_Holder.setDecimals = function (value) {
		this.t_decimals = value;
	};

	_Holder.getMinValue = function () {
		return parseFloat(this.t_minvalue);
	};
	_Holder.setMinValue = function (value) {
		this.t_minvalue = value;
	};

	_Holder.getMaxValue = function () {
		return parseFloat(this.t_maxvalue);
	};
	_Holder.setMaxValue = function (value) {
		this.t_maxvalue = value;
	};

	_Holder.getMaxSize = function () {
		return parseInt(this.t_maxsize) || 0;
	};
	_Holder.setMaxSize = function (value) {
		this.t_maxsize = value;
	};

	_Holder.isMulitline = function () {
		if (this.hasOwnProperty("t_mulit"))
			return Utils.isTrue(this.t_mulit);
		return false;
	};
	_Holder.setMulitline = function (bool) {
		this.t_mulit = bool;
	};

	_Holder.isDisplayAsPassword = function () {
		if (this.hasOwnProperty("t_displayAsPwd"))
			return Utils.isTrue(this.t_displayAsPwd);
		return false;
	}
	_Holder.setDisplayAsPassword = function (bool) {
		this.t_displayAsPwd = bool;
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UITextView = Component.TextView = function (view, options, holder) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.holder = holder;
		this.input = this.$el.find("input, textarea");

		this.maxSize = parseInt(this.$el.attr("data-size")) || 0;

		var self = this;
		this.input.on("focusin", function (e) { return focusInHandler.call(self, e); });
		this.input.on("focusout", function (e) { return focusOutHandler.call(self, e); });
		this.input.on("keydown", function (e) { return keyDownHandler.call(self, e); });
		this.input.on("keyup", function (e) { return keyUpHandler.call(self, e); });
		this.$el.on("click", ".clear", function (e) { return clearBtnClickHandler.call(self, e); });
	};
	var _UITextView = UITextView.prototype = new Component.base();

	UITextView.find = function (view) {
		return Component.find(view, ".ui-textview", UITextView);
	};

	UITextView.create = function (options) {
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UITextView(target, options, holder);
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
				target.text(errmsg).css("top", (this.$el.children(".ipt").height() + 8));
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
		var text = this.input.val() || "";
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
