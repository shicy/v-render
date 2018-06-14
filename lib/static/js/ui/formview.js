// ========================================================
// 表单
// @author shicy <shicy85@163.com>
// Create on 2018-06-10
// ========================================================


(function () {
	if (VRender.Component.FormView)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var FormViewRender = Renderer.formview;

	///////////////////////////////////////////////////////
	var UIFormView = window.UIFormView = Component.FormView = function (view, options) {
		if (!Component.base.isElement(view))
			return UIFormView.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);

		this.$el.on("tap", ".btnbar > .is-submit", onSubmitBtnHandler.bind(this));

		this.$el.on("keydown", ".form-item > .content > dd > div > input", onNativeInputKeyHandler.bind(this));
		this.$el.on("keydown", ".form-item > .content > dd > div > textarea", onNativeInputKeyHandler.bind(this));
		this.$el.on("focusout", ".form-item > .content > dd > div > input", onNativeInputFocusHandler.bind(this));
		this.$el.on("focusout", ".form-item > .content > dd > div > textarea", onNativeInputFocusHandler.bind(this));

		if (this.isRenderAsApp()) {
		}
		else {
			this.$el.on("mouseenter", ".form-item > .content > dd > div > *", onItemMouseHandler.bind(this));
			this.$el.on("mouseleave", ".form-item > .content > dd > div > *", onItemMouseHandler.bind(this));
		}
	};
	var _UIFormView = UIFormView.prototype = new Component.base();

	UIFormView.find = function (view) {
		return Component.find(view, ".ui-formview", UIFormView);
	};

	UIFormView.create = function (options) {
		return Component.create(options, UIFormView, FormViewRender);
	};

	// ====================================================
	_UIFormView.validate = function (callback) {
		var errors = [];
		var formItems = this.$el.children(".items").children();

		var self = this;
		var count = formItems.length;
		Utils.each(formItems, function (item, index) {
			validateItem.call(self, item, function (result) {
				if (result) {
					errors.push({index: index, name: item.attr("name"), message: result});
				}
				count -= 1;
				if (count <= 0) {
					if (Utils.isFunction(callback)) {
						callback(errors.length > 0 ? errors : false);
					}
				}
			});
		});
	};
	
	// ====================================================
	var onSubmitBtnHandler = function (e) {
		var self = this;
		this.validate(function (errors) {
			console.log(errors);
		});
	};

	var onNativeInputKeyHandler = function (e) {
		var input = $(e.currentTarget);
		var item = input.parent().parent().parent().parent();
		hideErrorMsg.call(this, item);
	};

	var onNativeInputFocusHandler = function (e) {
		var input = $(e.currentTarget);
		var item = input.parent().parent().parent().parent();
		validateInput.call(this, item, input);
	};

	var onItemMouseHandler = function (e) {
		var item = $(e.currentTarget).parent().parent().parent().parent();
		if (item.is(".is-error")) {
			stopErrorFadeout.call(this, item);
			if (e.type == "mouseenter") {
				item.children(".errmsg").removeClass("animate-out");
			}
			else /*if (e.type == "mouseleave")*/ {
				startErrorFadeout.call(this, item);
			}
		}
	};

	// ====================================================
	var validateItem = function (item, callback) {
		var contentView = item.children(".content").children("dd").children().children();
		if (contentView.is("input, textarea")) {
			validateInput.call(this, item, contentView, callback);
		}
		else {
			contentView = Component.get(contentView) || contentView;
			if (contentView instanceof UITextView) {
				validateTextView.call(this, item, contentView, callback);
			}
			else {
				console.log(contentView);
				callback("error message");
			}
		}
	};

	var validateInput = function (item, input, callback) {
		doItemValidate.call(this, item, input.val(), callback);
	};

	var validateTextView = function (item, textView, callback) {
		var self = this;
		textView.validate(function () {
			if (textView.hasError()) {
				item.addClass("is-error");
				item.children(".errmsg").remove();
			}
			else {
				item.removeClass("is-error");
				doItemValidate.call(self, item, textView.val(), callback);
			}
		});
	};

	var doItemValidate = function (item, value, callback) {
		if (Utils.isBlank(value)) {
			var error = item.attr("opt-required") == 1 ? (item.attr("opt-empty") || "不能为空") : null;
			setItemErrorMsg.call(this, item, error, callback);
		}
		else {
			var validate = getItemValidate.call(this, item);
			if (Utils.isFunction(validate)) {
				var self = this;
				validate(value, function (err) {
					var error = !err ? false : (err === true ? "内容不正确" : Utils.trimToNull(err));
					setItemErrorMsg.call(self, item, error, callback);
				});
			}
			else {
				setItemErrorMsg.call(this, item, false, callback);
			}
		}
	};

	var getItemValidate = function (item) {
		var validateFunction = item.data("validate");
		if (!validateFunction) {
			var target = item.children(".ui-fn[name='validate']");
			if (target && target.length > 0) {
				var func = target.text();
				if (Utils.isNotBlank(func)) {
					validateFunction = (new Function("var Utils=VRender.Utils;return (" + unescape(func) + ");"))();
				}
				target.remove();
			}
			if (!validateFunction)
				validateFunction = 1; // 无效的方法
			item.data("validate", validateFunction);
		}
		return validateFunction;
	};

	var setItemErrorMsg = function (item, errmsg, callback) {
		if (errmsg) {
			showErrorMsg.call(this, item, errmsg);
		}
		else {
			hideErrorMsg.call(this, item);
		}
		if (Utils.isFunction(callback)) {
			callback(errmsg);
		}
	};

	var showErrorMsg = function (item, errmsg) {
		item.addClass("is-error");

		var target = item.children(".errmsg");
		if (!target || target.length == 0) {
			target = $("<div class='errmsg'></div>").appendTo(item);
		}
		target.html(errmsg);

		target.removeClass("animate-in").removeClass("animate-out");

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);

		if (!this.isRenderAsApp()) {
			startErrorFadeout.call(this, item);
		}
	};

	// 不再是错误的了
	var hideErrorMsg = function (item) {
		stopErrorFadeout.call(this, item);
		if (item.is(".is-error")) {
			var target = item.children(".errmsg");
			target.addClass("animate-out");
			setTimeout(function () {
				item.removeClass("is-error");
				target.removeClass("animate-in").removeClass("animate-out");
			}, 300);
		}
	};

	var startErrorFadeout = function (item) {
		stopErrorFadeout.call(this, item);
		var hideTimerId = setTimeout(function () {
			item.removeAttr("t-err");
			item.children(".errmsg").addClass("animate-out");
		}, 3000);
		item.attr("t-err", hideTimerId);
	};

	var stopErrorFadeout = function (item) {
		var hideTimerId = parseInt(item.attr("t-err"));
		if (hideTimerId) {
			clearTimeout(hideTimerId);
			item.removeAttr("t-err");
		}
	};
	
	// ====================================================
	Component.register(".ui-formview", UIFormView);

})();