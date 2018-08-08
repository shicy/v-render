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

		this.$el.on("keydown", ".form-item > .content > dd > div > *", onNativeInputKeyHandler.bind(this));
		this.$el.on("focusout", ".form-item > .content > dd > div > *", onNativeInputFocusHandler.bind(this));
		this.$el.on("change", ".form-item > .content > dd > div > *", onValueChangeHandler.bind(this));

		this.$el.on("keydown", ".ui-textview > .ipt > *", onTextViewKeyHandler.bind(this));
		this.$el.on("focusout", ".ui-textview > .ipt > *", onTextViewFocusHandler.bind(this));

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
		var self = this;
		var errors = [];
		var formItems = this._getItems();
		var count = formItems.length;
		Utils.each(formItems, function (item, index) {
			validateItem.call(self, item, null, function (result) {
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

	_UIFormView.submit = function (action, callback) {
		if (this.$el.is(".is-loading"))
			return false;

		if (Utils.isFunction(action)) {
			callback = action;
			action = null;
		}
		if (Utils.isBlank(action))
			action = this.getAction();

		this.$el.addClass("is-loading");
		var submitBtn = this.$el.find(".btnbar .is-submit .ui-btn");
		Utils.each(submitBtn, function (button) {
			Component.get(button).waiting();
		});

		var self = this;
		var resultHandler = function (err, ret) {
			self.$el.removeClass("is-loading");
			Utils.each(submitBtn, function (button) {
				Component.get(button).waiting(0);
			});
			if (Utils.isFunction(callback)) {
				callback(err, ret);
			}
			if (action) {
				self.trigger("action_after", err, ret);
			}
		};

		this.validate(function (errors) {
			if (!errors && action) {
				doSubmit.call(self, action, resultHandler);
			}
			else {
				resultHandler(errors);
			}
		});
	};

	_UIFormView.getFormData = function () {
		var params = {};
		params = Utils.extend(params, this.getParams());
		Utils.each(this._getItems(), function (item) {
			var name = item.attr("name");
			if (Utils.isBlank(name))
				return ;
			var contentView = item.children(".content").children("dd").children().children();
			if (contentView.is("input, textarea")) {
				params[name] = contentView.val() || "";
			}
			else {
				contentView = Component.get(contentView) || VRender.FrontComponent.get(contentView);
				if (contentView) {
					if (contentView instanceof UIDateInput) {
						params[name] = contentView.getDate("yyyy-MM-dd");
					}
					else if (contentView instanceof UIDateRange) {
						params[name] = contentView.getDateRange("yyyy-MM-dd");
					}
					else if (contentView instanceof UICombobox) {
						params[name] = contentView.val();
					}
					else if (contentView instanceof Component.select) {
						params[name] = contentView.getSelectedKey();
					}
					else if (Utils.isFunction(contentView.getValue)) {
						params[name] = contentView.getValue();
					}
					else if (Utils.isFunction(contentView.val)) {
						params[name] = contentView.val();
					}
				}
			}
		});
		return params;
	};

	_UIFormView.setFormData = function (data) {
		data = data || {};
		var self = this;
		Utils.each(this._getItems(), function (item) {
			var name = item.attr("name");
			if (Utils.isBlank(name))
				return ;
			if (!data.hasOwnProperty(name))
				return ;
			var value = data[name];
			var content = item.children(".content").children("dd").children().children();
			if (content.is("input, textarea")) {
				content.val(value || "");
				validateInput.call(self, item, content);
			}
			else {
				var contentView = Component.get(content);
				if (contentView) {
					if (contentView instanceof Component.select) {
						contentView.setSelectedKey(value);
						validateSelectionView.call(self, item, contentView);
					}
					else if (Utils.isFunction(contentView.val)) {
						contentView.val(value || "");
						validateItem.call(this, item, content);
					}
				}
			}
		});
	};

	// ====================================================
	_UIFormView.add = function (name, label, index) {
		var container = this.$el.children(".items");

		var item = $("<div class='form-item'></div>").appendTo(container);
		item.attr("name", Utils.trimToNull(name));

		var content = $("<dl class='content'></dl>").appendTo(item);
		var labelTarget = $("<dt></dt>").appendTo(content);
		labelTarget.text(Utils.trimToEmpty(label));
		labelTarget.css("width", Utils.trimToEmpty(this.getLabelWidth()));

		content.append("<dd><div></div></dd>");

		index = Utils.getIndexValue(index);
		if (index >= 0) {
			var items = container.children();
			if (index < items.length - 1)
				items.eq(index).before(item);
		}

		return new FormItem(this, item);
	};

	_UIFormView.get = function (name) {
		if (Utils.isBlank(name))
			return null;
		var item = Utils.find(this._getItems(), function (item) {
			return item.attr("name") == name;
		});
		return !item ? null : (new FormItem(this, item));
	};

	_UIFormView.getAt = function (index) {
		index = Utils.getIndexValue(index);
		if (index >= 0) {
			var item = this._getItems().eq(index);
			return !item ? null : (new FormItem(this, item));
		}
		return null;
	};

	_UIFormView.delete = function (name) {
		if (Utils.isBlank(name))
			return null;
		var item = Utils.find(this._getItems(), function (item) {
			return item.attr("name") == name;
		});
		if (item)
			item.remove();
		return item;
	};

	_UIFormView.deleteAt = function (index) {
		index = Utils.getIndexValue(index);
		if (index >= 0) {
			var item = this._getItems().eq(index);
			if (item)
				item.remove();
			return item;
		}
		return null;
	};

	_UIFormView._getItems = function () {
		return this.$el.children(".items").children();
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
		if (this.isRenderAsApp())
			return 1;
		if (this.options.hasOwnProperty("columns"))
			return parseInt(this.options.columns) || 1;
		this.options.columns = parseInt(this.$el.attr("opt-cols")) || 1;
		this.$el.removeAttr("opt-cols");
		return this.options.columns;
	};
	_UIFormView.setColumns = function (value) {
		if (this.isRenderAsApp())
			return ;
		var columns = parseInt(value) || 1;
		if (columns < 1)
			columns = 1;
		this.options.columns = columns;
		this.$el.removeAttr("opt-cols");
		Utils.each(this._getItems(), function (item) {
			var colspan = parseInt(item.attr("opt-col")) || 1;
			if (columns > colspan)
				item.css("width", (colspan * 100 / columns).toFixed(6) + "%");
			else
				item.css("width", "");
		});
	};

	_UIFormView.getAction = function () {
		return this.$el.attr("opt-action");
	};
	_UIFormView.setAction = function (value) {
		this.$el.attr("opt-action", Utils.trimToEmpty(value));
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
		return this.$el.attr("opt-method");
	};
	_UIFormView.setMethod = function (value) {
		this.$el.attr("opt-method", Utils.trimToEmpty(value));
	};

	_UIFormView.getLabelWidth = function () {
		if (this.options.hasOwnProperty("labelWidth"))
			return this.options.labelWidth;
		var width = this.$el.attr("opt-lw");
		this.options.width = Utils.getFormatSize(width, this.isRenderAsRem());
		this.$el.removeAttr("opt-lw");
		return this.options.labelWidth;
	};
	_UIFormView.setLabelWidth = function (value) {
		this.options.labelWidth = value;
		this.$el.removeAttr("opt-lw");
	};

	_UIFormView.getLabelAlign = function () {
		var align = this.$el.attr("opt-la");
		return /^(center|right)$/.test(align) ? align : "left";
	};
	_UIFormView.setLabelAlign = function (value) {
		var align = /^(center|right)$/.test(value) ? align : "left";
		this.options.labelAlign = align;
		this.$el.attr("opt-la", align);
	};

	_UIFormView.getOrientation = function () {
		return this.$el.attr("opt-orientate");
	};
	_UIFormView.setOrientation = function (value) {
		if (FormViewRender.VERTICAL != value && FormViewRender.HORIZONTIAL != value) {
			value = this.isRenderAsApp() ? FormViewRender.VERTICAL : FormViewRender.HORIZONTIAL;
		}
		this.$el.removeClass(FormViewRender.VERTICAL);
		this.$el.removeClass(FormViewRender.HORIZONTIAL);
		this.$el.addClass(value).attr("opt-orientate", value);
	};

	_UIFormView.setButtons = function (value) {
		FormViewRender.renderButtons.call(this, $, this.$el, Utils.toArray(value));
	};

	// ====================================================
	var onSubmitBtnHandler = function (e) {
		this.submit();
	};

	var onNativeInputKeyHandler = function (e) {
		var input = $(e.currentTarget);
		if (!input.is("input, textarea"))
			return ;
		// console.log("onNativeInputKeyHandler");
		var item = Utils.parentUntil(input, ".form-item");
		hideErrorMsg.call(this, item);
	};

	var onNativeInputFocusHandler = function (e) {
		var input = $(e.currentTarget);
		if (!input.is("input, textarea"))
			return ;
		// console.log("onNativeInputFocusHandler");
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
		if (target.is("input, textarea"))
			return ;
		// console.log("onValueChangeHandler");
		var item = Utils.parentUntil(target, ".form-item");
		validateItem.call(this, item);
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
	var validateItem = function (item, contentView, callback) {
		// console.log("validateItem")
		if (item.attr("opt-hide") == 1)
			return callback(false);

		if (!contentView)
			contentView = item.children(".content").children("dd").children().children();
		if (contentView.is("input, textarea")) {
			validateInput.call(this, item, contentView, callback);
		}
		else {
			contentView = Component.get(contentView) || contentView;
			if (contentView instanceof UITextView) {
				validateTextView.call(this, item, contentView, callback);
			}
			else if (contentView instanceof UIDateInput) {
				validateDateInputView.call(this, item, contentView, callback);
			}
			else if (contentView instanceof UIDateRange) {
				validateDateRangeView.call(this, item, contentView, callback);
			}
			else if (contentView instanceof UICombobox) {
				validateComboboxView.call(this, item, contentView, callback);
			}
			else if (contentView instanceof Component.select) {
				validateSelectionView.call(this, item, contentView, callback);
			}
			else if (Utils.isFunction(contentView.val)) {
				validateInterfaceView.call(this, item, contentView, callback);
			}
			else {
				callback(false);
			}
		}
	};

	var validateInput = function (item, input, callback) {
		// console.log("validateInput");
		doItemValidate.call(this, item, input.val(), callback);
	};

	var validateInterfaceView = function (item, view, callback) {
		// console.log("validateInterfaceView");
		doItemValidate.call(this, item, view.val(), callback);
	};

	var validateTextView = function (item, view, callback) {
		// console.log("validateTextView")
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
		// console.log("validateSelectionView")
		doItemValidate.call(this, item, view.getSelectedKey(), callback);
	};

	var validateComboboxView = function (item, view, callback) {
		// console.log("validateComboboxView")
		if (view.isEditable()) {
			doItemValidate.call(this, item, view.val(), callback);
		}
		else {
			doItemValidate.call(this, item, view.getSelectedKey(), callback);
		}
	};

	var validateDateInputView = function (item, view, callback) {
		// console.log("validateDateInputView")
		doItemValidate.call(this, item, view.getDate(), callback);
	};

	var validateDateRangeView = function (item, view, callback) {
		// console.log("validateDateRangeView");
		doItemValidate.call(this, item, view.getDateRange(), callback);
	};

	var doItemValidate = function (item, value, callback) {
		// console.log("doItemValidate");
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
				validateFunction = "1"; // 无效的方法
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
	var doSubmit = function (action, callback) {
		var params = this.getFormData();
		var method = this.getMethod();
		doSubmitBefore.call(this, params, function (error) {
			if (!error) {
				if (/post|put|delete/.test(method)) {
					VRender.send(action, params, callback);
				}
				else {
					VRender.fetch(action, params, callback);
				}
			}
			else {
				callback(error);
			}
		});
	};

	var doSubmitBefore = function (params, callback) {
		var event = {type: "action_before"};
		this.trigger(event, params);
		if (event.isPreventDefault) {
			callback("canceled");
		}
		else {
			callback();
		}
	};

	// ====================================================
	var FormItem = function (form, item) {
		this.form = form;
		this.item = item;
	};
	var _FormItem = FormItem.prototype = new Object();

	_FormItem.getName = function () {
		return this.item.attr("name");
	};
	_FormItem.setName = function (value) {
		this.item.attr("name", Utils.trimToEmpty(value));
	};

	_FormItem.getLabel = function () {
		return this.item.children(".content").children("dt").text() || "";
	};
	_FormItem.setLabel = function (value) {
		this.item.children(".content").children("dt").text(Utils.trimToEmpty(value));
	};

	_FormItem.getContent = function () {
		var contentView = this.item.children(".content").children("dd").children().children();
		if (contentView.is("input, textarea"))
			return contentView;
		return Component.get(contentView) || contentView;
	};
	_FormItem.setContent = function (value) {
		this.item.removeClass("is-error");
		this.item.children(".errmsg").remove();
		var container = this.item.children(".content").children("dd").children().empty();
		if (Utils.isNotNull(value)) {
			container.append(value.$el || value);
		}
	};

	_FormItem.isRequired = function () {
		return this.item.attr("opt-required") == 1;
	};
	_FormItem.setRequired = function (value) {
		if (Utils.isNull(value) || Utils.isTrue(value))
			this.item.attr("opt-required", "1");
		else
			this.item.removeAttr("opt-required");
	};

	_FormItem.isVisible = function () {
		return this.item.attr("opt-hide") == 1;
	};
	_FormItem.setVisible = function (value) {
		if (Utils.isNull(value) || Utils.isTrue(value))
			this.item.removeAttr("opt-hide");
		else
			this.item.attr("opt-hide", "1");
	};

	_FormItem.getEmptyMsg = function () {
		return this.item.attr("opt-empty");
	};
	_FormItem.setEmptyMsg = function (value) {
		this.item.attr("opt-empty", Utils.trimToEmpty(value));
	};

	_FormItem.getColspan = function () {
		var colspan = parseInt(this.item.attr("opt-col")) || 1;
		return Math.max(colspan, 1);
	};
	_FormItem.setColspan = function (value) {
		var colspan = parseInt(value) || 1;
		colspan = Math.max(colspan, 1);
		this.item.attr("opt-col", colspan);

		var columns = this.form.getColumns();
		if (columns > 1 && columns > colspan) {
			this.item("width", (colspan * 100 / columns).toFixed(6) + "%");
		}
		else {
			this.item("width", "");
		}
	};

	_FormItem.getValidate = function () {
		var validate = getItemValidate.call(this.form, this.item);
		return Utils.isFunction(validate) ? validate : null;
	};
	_FormItem.setValidate = function (value) {
		this.item.data("validate", (Utils.isFunction(value) ? value : "1"));
		this.item.children(".ui-fn[name='validate']").remove();
	};

	
	// ====================================================
	Component.register(".ui-formview", UIFormView);

})();