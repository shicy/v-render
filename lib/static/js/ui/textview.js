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
	var TextViewRender = Component.Render.textview;

	///////////////////////////////////////////////////////
	var UITextView = window.UITextView = Component.TextView = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.input = this.$el.find("input, textarea");

		this.maxSize = parseInt(this.$el.attr("opt-size")) || 0;

		this.input.on("focusin", focusInHandler.bind(this));
		this.input.on("focusout", focusOutHandler.bind(this));
		this.input.on("keydown", keyDownHandler.bind(this));
		this.input.on("keyup", keyUpHandler.bind(this));
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
		var type = this.$el.attr("opt-type") || "text";
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
		var type = this.$el.attr("opt-type") || "text";
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
				this.showError(this.$el.attr("opt-empty") || "输入框不能为空");
		}
		else {
			var type = this.$el.attr("opt-type") || "text";
			if (type === "number" || type === "num") {
				if (isNaN(text)) {
					this.showError("数据格式不正确");
				}
				else {
					var val = parseFloat(text);
					var min = parseFloat(this.$el.attr("opt-min"));
					if (!isNaN(min) && min > val)
						this.showError("数据不正确，请输入大于等于 " + min + " 的值");
					var max = parseFloat(this.$el.attr("opt-max"));
					if (!isNaN(max) && max < val)
						this.showError("数据不正确，请输入小于等于 " + max + " 的值");
					var decimals = parseFloat(this.$el.attr("opt-decimal")) || 0;
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

	///////////////////////////////////////////////////////
	Component.register(".ui-textview", UITextView);

})();