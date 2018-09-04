// ========================================================
// 对话框
// @author shicy <shicy85@163.com>
// Create on 2017-01-11
// ========================================================

(function () {
	if (VRender.Component.Dialog)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var DialogRender = Component.Render.dialog;

	var openedDialogs = [];

	///////////////////////////////////////////////////////
	var UIDialog = window.UIDialog = Component.Dialog = function (view, options) {
		if (!Component.base.isElement(view))
			return UIDialog.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		// if (this.options.module)
		// 	this.load(this.options.module);
		
		var dialogView = this.dialogView = this.$el.children().children();

		var dialogHeader = dialogView.children("header");
		dialogHeader.on("tap", ".closebtn", closeBtnHandler.bind(this));

		var dialogFooter = dialogView.children("footer");
		dialogFooter.on("tap", ".btnbar > .btn", buttonClickHandler.bind(this));

		var activeBtn = getActiveButton.call(this);
		if (activeBtn && activeBtn.length > 0)
			activeBtn.on("tap", activeBtnClickHandler.bind(this));

		if (this.isRenderAsApp()) {
			this.$el.on("tap", onTouchHandler.bind(this));
		}
		else /*if (this.$el.is("[opt-size='auto']"))*/ {
			initResizeEvents.call(this);
		}

		initContentEvents.call(this);
	};
	var _UIDialog = UIDialog.prototype = new Component.base();

	UIDialog.find = function (view) {
		return Component.find(view, ".ui-dialog", UIDialog);
	};

	UIDialog.create = function (options) {
		options = options || {};
		if (!options.target) {
			var target = $("body").children(".ui-dialog-wrap");
			if (!target || target.length == 0)
				target = $("<div class='ui-dialog-wrap'></div>").appendTo($("body"));
			options.target = target;
		}
		return Component.create(options, UIDialog, DialogRender);
	};

	UIDialog.close = function (view, forceClose, closedHandler) {
		if (!view.is(".ui-dialog"))
			view = Utils.parentUntil(view, ".ui-dialog");
		if (view && view.length > 0) {
			var dialog = Component.get(view);
			if (dialog && (dialog instanceof UIDialog))
				dialog.close(forceClose, closedHandler);
		}
	};

	// ====================================================
	_UIDialog.getTitle = function () {
		return this.dialogView.children("header").find(".title").text();
	};
	_UIDialog.setTitle = function (value) {
		value = Utils.isBlank(value) ? "&nbsp;" : value;
		this.dialogView.children("header").find(".title").html(value);
	};

	_UIDialog.getContent = function () {
		var content = this._getContentView();
		if (content) {
			content = Component.get(content) || content;
		}
		return content;
	};
	_UIDialog.setContent = function (view) {
		DialogRender.renderContentView.call(this, $, this.$el, view);
		initContentEvents.call(this);
	};

	_UIDialog.setButtons = function (buttons) {
		DialogRender.renderFootButtons.call(this, $, this.$el, buttons);
	};

	_UIDialog.getSize = function () {
		return this.$el.attr("opt-size") || "normal";
	};
	_UIDialog.setSize = function (value) {
		if (/^small|big|auto$/.test(value))
			this.$el.attr("opt-size", value);
		else 
			this.$el.removeAttr("opt-size");
	};

	_UIDialog.isFill = function () {
		return this.$el.attr("opt-fill") == 1;
	};
	_UIDialog.setFill = function (value) {
		if (Utils.isNull(value) || Utils.isTrue(value))
			this.$el.attr("opt-fill", "1");
		else
			this.$el.removeAttr("opt-fill");
	};

	_UIDialog.open = function () {
		if (this.isopened)
			return this;
		this.isopened = true;

		var body = $("body").addClass("ui-scrollless");
		if (body.children(".ui-dialog-mask").length == 0)
			body.append("<div class='ui-dialog-mask'></div>");
		this.$el.css("display", "").addClass("show-dialog");
		openedDialogs.push(this);

		this._getContentView().trigger("dialog_open");

		var transName = this.$el.attr("opt-trans");
		if (transName) {
			var target = this.$el.addClass(transName + "-open");
			setTimeout(function () {
				target.addClass(transName + "-opened");
			}, 0);
			setTimeout(function () {
				target.removeClass(transName + "-open").removeClass(transName + "-opened");
			}, 300);
		}

		this.trigger("opened");
		return this;
	};

	_UIDialog.close = function (forceClose, closedHandler) {
		if (!this.isopened)
			return ;

		if (Utils.isFunction(forceClose)) {
			closedHandler = forceClose;
			forceClose = false;
		}

		var event = {type: "dialog_close"};
		this._getContentView().trigger(event);

		if (!!forceClose || !event.isPreventDefault) {
			this.isopened = false;
			var target = this.$el.removeClass("show-dialog");

			var transName = target.attr("opt-trans");
			if (transName) {
				target.addClass(transName + "-close");
				setTimeout(function () {
					target.addClass(transName + "-closed");
				}, 0);
			}

			var self = this, delay = !!transName ? 200 : 0;
			setTimeout(function () {
				if (transName) {
					target.removeClass(transName + "-close").removeClass(transName + "-closed");
				}

				var dialogWrap = $("body").children(".ui-dialog-wrap");
				if (self.$el.parent().is(dialogWrap))
					self.$el.remove();

				for (var i = openedDialogs.length - 1; i >= 0; i--) {
					if (openedDialogs[i] === self)
						openedDialogs.splice(i, 1);
				}
				if (openedDialogs.length == 0) {
					var mask = $("body").removeClass("ui-scrollless").children(".ui-dialog-mask").fadeOut(200);
					setTimeout(function () {
						mask.remove();
					}, 200);
				}

				if (Utils.isFunction(closedHandler))
					closedHandler();

			}, delay);
			
			this.trigger("closed");
		}
	};

	_UIDialog.destory = function () {
		var self = this;
		this.close(true, function () {
			self.$el.remove();
		});
	};

	_UIDialog.isOpen = function () {
		return !!this.isopened;
	};

	// 
	_UIDialog.waiting = function (waitFlag, btnName) {
		var button = null;
		if (Utils.isNotBlank(btnName)) {
			var dialogFooter = this.dialogView.children("footer");
			var button = dialogFooter.find(".btnbar > .btn[name='" + btnName + "']");
			if (!(button && button.length > 0))
				button = null;
		}

		var waitTime = button && parseInt(button.attr("opt-wait")) || 0;

		if (Utils.isNull(waitFlag) || waitFlag === true)
			waitTime = waitTime || -1;
		else if (waitFlag) {
			if (isNaN(waitFlag))
				waitTime = Utils.isTrue(waitFlag) ? (waitTime || -1) : 0;
			else 
				waitTime = Math.max(0, parseInt(waitFlag));
		}
		else {
			waitTime = 0;
		}

		setWaitting.call(this, waitTime, button);
	};

	_UIDialog.setButtonValue = function (name, value) {
		if (Utils.isNotBlank(name) && Utils.isNotNull(value)) {
			var dialogFooter = this.dialogView.children("footer");
			var button = dialogFooter.find(".btnbar > .btn[name='" + name + "']");
			if (button && button.length > 0) {
				button = Component.get(button.children());
				button && button.setLabel(value);
			}
		}
	};

	// ====================================================
	_UIDialog._getContentView = function () {
		return this.dialogView.children("section").children(".container").children();
	};

	_UIDialog._isTouchCloseable = function () {
		return this.options.touchCloseEnabled !== false;
	};

	// ====================================================
	// 模块，异步加载
	// _UIDialog.load = function (pathname, params, callback) {
	// 	if (Utils.isBlank(pathname))
	// 		return ;

	// 	var self = this;
	// 	if (params)
 //            pathname += (pathname.indexOf("?") < 0 ? "?" : "&") + $.param(params);

	// 	VRender.require(pathname, function (err, ret) {
	// 		self.setContent(err ? (err.msg || err) : ret);

	// 		var contentView = self.$el.find(".dialog-view > section").children();
	// 		if (contentView && contentView.length > 0) {
	// 			contentView.on("submit submit_to_dialog", function (e, data) {
	// 				self.trigger("view_submit", data);
	// 				self.close();
	// 			});
	// 			self.on("btnclick", function (e, name, btn) {
	// 				contentView.trigger(("dialog_" + name), self, btn);
	// 				if (["cancel", "close"].indexOf(name) >= 0) {
	// 					self.close();
	// 				}
	// 			});
	// 		}

	// 		if (Utils.isFunction(callback))
	// 			callback(err, ret);
	// 	});
	// };

	// ====================================================
	var closeBtnHandler = function (e) {
		this.close();
	};

	var buttonClickHandler = function (e) {
		var btn = $(e.currentTarget);
		if (btn.is(".disabled, .waiting"))
			return ;

		var btnName = btn.attr("name") || "";

		if (btnName)
			this._getContentView().trigger("dialog_btn_" + btnName, btnName, this);

		var hasListen = false;
		if (btnName) {
			var btnEventName = "btn_" + btnName;
			if (this.hasListen(btnEventName)) {
				hasListen = true;
				this.trigger(btnEventName, btnName, this);
			}
		}
		if (this.hasListen("btnclk")) {
			hasListen = true;
			this.trigger("btnclk", btnName, this);
		}

		var waitTime = btn.attr("opt-wait");
		if (waitTime || waitTime == 0) { // 0也是需要关闭的
			waitTime = parseInt(waitTime) || 0;
			setWaitting.call(this, waitTime, btn);
			if (waitTime > 0) {
				var self = this;
				this.closeTimerId = setTimeout(function () {
					self.closeTimerId = 0;
					self.close();
				}, waitTime);
			}
		}
		else if (!hasListen) {
			if (/^ok|cancel|submit|close|save|finish$/.test(btnName))
				this.close(/^cancel|close$/.test(btnName));
		}
	};

	var activeBtnClickHandler = function (e) {
		if (this._isMounted()) {
			this.open();
		}
		else {
			this.activeBtn.off("tap", arguments.callee);
		}
	};

	var windowResizeHandler = function () {
		if (this._isMounted()) {
			var container = this.dialogView.children("section").children(".container");
			container.css("maxHeight", $(window).height() - 200);
		}
		else {
			$(window).off("resize._" + this.getViewId());
		}
	};

	var onTouchHandler = function (e) {
		if ($(e.target).is(this.$el)) { console.log('===', this.options.touchCloseEnabled)
			if (this._isTouchCloseable())
				this.close();
		}
	}

	// ====================================================
	var initContentEvents = function () {
		var contentView = this._getContentView();
		if (contentView && contentView.length > 0) {
			contentView.off("submit_to_dialog");
			var self = this;
			contentView.on("submit_to_dialog", function (e, data) {
				self.trigger("view_submit", data);
				self.close();
			});
		}
	};

	var initResizeEvents = function () {
		var eventName = "resize._" + this.getViewId();
		var _window = $(window).off(eventName);
		if (this.getSize() == "auto") {
			_window.on(eventName, windowResizeHandler.bind(this));
			windowResizeHandler.call(this);
		}
	};

	var getActiveButton = function () {
		if (!this.options.hasOwnProperty("openbtn")) {
			this.options.openbtn = this.$el.attr("opt-active");
			this.$el.removeAttr("opt-active");
		}
		var activeBtn = this.options.openbtn;
		if (activeBtn) {
			if (activeBtn.$el)
				return activeBtn.$el;
			return $(activeBtn);
		}
		return null;
	};

	var setWaitting = function (waitTime, btn) {
		var button = btn ? Component.get(btn.children()) : null;
		if (waitTime) {
			if (button) {
				btn.addClass("waiting")
				button.waiting();
			}
			else {
				this.$el.addClass("waiting");
			}
			if (waitTime > 0) {
				var self = this;
				setTimeout(function () {
					setWaitting.call(self, false, btn);
				}, waitTime);
			}
		}
		else {
			if (button) {
				btn.removeClass("waiting");
				button.waiting(false);
			}
			else {
				this.$el.removeClass("waiting");
			}
		}
	};

	// ====================================================
	Component.register(".ui-dialog", UIDialog);

})();