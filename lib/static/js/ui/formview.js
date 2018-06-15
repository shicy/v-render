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
		this.$el.on("keydown", ".ui-textview > .ipt > input", onTextViewKeyHandler.bind(this));
		this.$el.on("keydown", ".ui-textview > .ipt > textarea", onTextViewKeyHandler.bind(this));
		this.$el.on("focusout", ".ui-textview > .ipt > input", onTextViewFocusHandler.bind(this));
		this.$el.on("focusout", ".ui-textview > .ipt > textarea", onTextViewFocusHandler.bind(this));
		this.$el.on("change", ".form-item > .content > dd > div > .ui-combobox", onValueChangeHandler.bind(this));
		this.$el.on("change", ".form-item > .content > dd > div > .ui-radgrp", onValueChangeHandler.bind(this));
		this.$el.on("change", ".form-item > .content > dd > div > .ui-dateipt", onValueChangeHandler.bind(this));
		this.$el.on("change", ".form-item > .content > dd > div > .ui-daterange", onValueChangeHandler.bind(this));

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

	_UIFormView.submit = function (callback) {
		var submitBtn = this.$el.find(".btnbar .is-submit .ui-btn");
		Utils.each(submitBtn, function (button) {
			Component.get(button).waiting();
		});

		var self = this;
		var resultHandler = function (err, ret) {
			Utils.each(submitBtn, function (button) {
				Component.get(button).waiting(0);
			});
			if (Utils.isFunction(callback)) {
				callback(err, ret);
			}
		};

		this.validate(function (errors) {
			if (!errors) {
				doSubmit.call(self, resultHandler);
			}
			else {
				resultHandler(errors);
			}
		});
	};

	_UIFormView.getFormData = function () {
		var params = {};
		return params;
	};

	_UIFormView.setFormData = function () {

	};

	// ====================================================
	_UIFormView.add = function (name, label, index) {

	};

	_UIFormView.get = function (name) {

	};

	_UIFormView.getAt = function (index) {

	};

	_UIFormView.delete = function (name) {

	};

	_UIFormView.deleteAt = function (index) {

	};

	// ====================================================
	// _UIFormView.getData = function () {
	// 	return this.options.data;
	// };
	// _UIFormView.setData = function (value) {
	// 	this.options.data = Utils.toArray(value);
	// 	FormViewRender.renderItems.call(this, $, this.$el, this.options.data);
	// };

	_UIFormView.getColumns = function () {
		if (this.options.hasOwnProperty("columns"))
			return parseInt(this.options.columns) || 1;
		this.options.columns = parseInt(this.$el.attr("opt-cols")) || 1;
		this.$el.removeAttr("opt-cols");
		return this.options.columns;
	};
	_UIFormView.setColumns = function (value) {
		var columns = parseInt(value) || 1;
		if (columns < 1)
			columns = 1;
		this.options.columns = columns;
		this.$el.removeAttr("opt-cols");
		Utils.each(this.$el.find(".form-item"), function (item) {
			var colspan = parseInt(item.attr("opt-col")) || 1;
			if (columns > colspan)
				item.css("width", (colspan * 100 / columns).toFixed(6) + "%");
			else
				item.css("width", "");
		});
	};

	_UIFormView.getAction = function () {
		if (this.options.hasOwnProperty("action"))
			return this.options.action;
		this.options.action = this.$el.attr("opt-action");
		this.$el.removeAttr("opt-action");
		return this.options.action;
	};
	_UIFormView.setAction = function (value) {
		this.options.action = value;
		this.$el.removeAttr("opt-action");
	};

	_UIFormView.getParams = function () {
		if (this.options.hasOwnProperty("params"))
			return this.options.params;
		var params = null;
		try {
			params = JSON.parse(this.$el.attr("opt-params"));
		}
		catch (e) {};
		this.options.params = params;
		return this.options.params;
	};
	_UIFormView.setParams = function (value) {
		this.options.params = value;
		this.$el.removeAttr("opt-params");
	};

	_UIFormView.getMethod = function () {
		if (this.options.hasOwnProperty("method"))
			return this.options.method;
		this.options.method = this.$el.attr("opt-method");
		this.$el.removeAttr("opt-method");
		return this.options.method;
	};
	_UIFormView.setMethod = function (value) {
		this.options.method = value;
		this.$el.removeAttr("opt-method");
	};

	_UIFormView.getLabelWidth = function () {

	};
	_UIFormView.setLabelWidth = function (value) {

	};

	_UIFormView.getLabelAlign = function () {
		var align = this.$el.attr("opt-la");
		return /^(center|right)$/.test(align) || "left";
	};
	_UIFormView.setLabelAlign = function (value) {
		var align = /^(center|right)$/.test(value) || "left";
		this.options.labelAlign = align;
		this.$el.attr("opt-la", align);
	};

	_UIFormView.setButtons = function (value) {

	};
	
	// ====================================================
	var onSubmitBtnHandler = function (e) {
		// this.submit();
		console.log(this.getFormData());
	};

	var onNativeInputKeyHandler = function (e) {
		var input = $(e.currentTarget);
		var item = Utils.parentUntil(input, ".form-item");
		hideErrorMsg.call(this, item);
	};

	var onNativeInputFocusHandler = function (e) {
		var input = $(e.currentTarget);
		var item = Utils.parentUntil(input, ".form-item");
		validateInput.call(this, item, input);
	};

	var onTextViewKeyHandler = function (e) {
		var item = Utils.parentUntil(e.currentTarget, ".form-item");
		item.removeClass("is-error");
	};

	var onTextViewFocusHandler = function (e) {
		var input = $(e.currentTarget);
		var item = Utils.parentUntil(input, ".form-item");
		var textView = Component.get(input.parent().parent());
		validateTextView.call(this, item, textView);
	};

	var onValueChangeHandler = function (e) {
		var target = $(e.currentTarget);
		var item = Utils.parentUntil(target, ".form-item");
		var contentView = Component.get(target);
		if (contentView instanceof Component.select) {
			validateSelectionView.call(this, item, contentView);
		}
		else if (contentView instanceof UIDateInput) {
			validateDateInputView.call(this, item, contentView);
		}
		else if (contentView instanceof UIDateRange) {
			validateDateRangeView.call(this, item, contentView);
		}
	};

	var onItemMouseHandler = function (e) {
		var item = Utils.parentUntil(e.currentTarget, ".form-item");
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
			else if (contentView instanceof Component.select) {
				validateSelectionView.call(this, item, contentView, callback);
			}
			else if (contentView instanceof UIDateInput) {
				validateDateInputView.call(this, item, contentView, callback);
			}
			else if (contentView instanceof UIDateRange) {
				validateDateRangeView.call(this, item, contentView, callback);
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

	var validateTextView = function (item, view, callback) {
		var self = this;
		view.validate(function () {
			if (view.hasError()) {
				item.addClass("is-error");
				item.children(".errmsg").remove();
			}
			else {
				item.removeClass("is-error");
				doItemValidate.call(self, item, view.val(), callback);
			}
		});
	};

	var validateSelectionView = function (item, view, callback) {
		doItemValidate.call(this, item, view.getSelectedKey(), callback);
	};

	var validateDateInputView = function (item, view, callback) {
		doItemValidate.call(this, item, view.getDate(), callback);
	};

	var validateDateRangeView = function (item, view, callback) {
		doItemValidate.call(this, item, view.getDateRange(), callback);
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
	var doSubmit = function (callback) {
		callback();
	};
	
	// ====================================================
	Component.register(".ui-formview", UIFormView);

})();