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
	var DialogRenderer = Component.Render.dialog;

	var openedDialogs = [];

	///////////////////////////////////////////////////////
	var UIDialog = window.UIDialog = Component.Dialog = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		// if (this.options.module)
		// 	this.load(this.options.module);
		
		var dialogView = this.dialogView = this.$el.children().children();

		var dialogHeader = dialogView.children("header");
		dialogHeader.on("tap", ".closebtn", closeBtnHandler.bind(this));

		var dialogFooter = dialogView.children("footer");
		dialogFooter.on("tap", ".btnbar > .btn", buttonClickHandler.bind(this));

		if (this.$el.is(".auto")) {
			$(window).on("resize", windowResizeHandler.bind(this));
			windowResizeHandler.call(this);
		}

		setContentViewEvents.call(this);
	};
	var _UIDialog = UIDialog.prototype = new Component.base();

	UIDialog.find = function (view) {
		return Component.find(view, ".ui-dialog", UIDialog);
	};

	UIDialog.create = function (options) {
		options = options || {};
		if (!options.target) {
			var target = $("body").children(".ui-dialog-wrap");
			if (!(target && target.length > 0))
				target = $("<div class='ui-dialog-wrap'></div>").appendTo($("body"));
			options.target = target;
		}
		return Component.create(options, UIDialog, DialogRenderer);
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
	_UIDialog.setTitle = function (value) {
		value = Utils.isBlank(value) ? "&nbsp;" : value;
		this.$el.find(".dialog-view > header > .title").html(value);
	};

	_UIDialog.setContent = function (view) {
		DialogRenderer.renderContentView.call(this, $, this.$el, view);
		setContentViewEvents.call(this);
	};

	_UIDialog.setButtons = function (buttons) {
		DialogRenderer.renderFootButtons.call(this, $, this.$el, buttons);
	};

	_UIDialog.open = function () {
		if (this.isopened)
			return ;
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
	};

	_UIDialog.close = function (forceClose, closedHandler) {
		if (!this.isopened)
			return ;

		if (Utils.isFunction(forceClose)) {
			closedHandler = forceClose;
			forceClose = false;
		}

		var data = {closeable: true};
		this._getContentView().trigger("dialog_close", data);

		if (!!forceClose || data.closeable) {
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

				self.trigger("closed");
			}, delay);
		}
	};

	_UIDialog.remove = function () {
		var self = this;
		this.close(false, function () {
			self.$el.remove();
		});
	};

	_UIDialog.isOpen = function () {
		return !!this.isopened;
	};

	_UIDialog.setButtonWaitting = function (name, waitTime) {
		var dialogFooter = this.dialogView.children("footer");
		var button = dialogFooter.find(".btnbar > .btn[name='" + name + "']");
		setBtnWaitting.call(this, button, waitTime);
	};

	// ====================================================
	_UIDialog._getContentView = function () {
		return this.dialogView.children("section").children(".container").children();
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
		var btnName = btn.attr("name") || "";

		var hasListen = false;
		if (btnName) {
			var btnEventName = btnName.split("");
			btnEventName = "on" + btnEventName[0].toUpperCase() + btnEventName.splice(1).join("");
			if (this.hasListen(btnEventName)) {
				hasListen = true;
				this.trigger(btnEventName, btnName, this);
			}
		}
		if (this.hasListen("btnclk")) {
			hasListen = true;
			this.trigger("btnclk", btnName, this);
		}

		var waitTime = parseInt(btn.attr("opt-wait"));
		if (waitTime)
			setBtnWaitting.call(this, btn, waitTime);

		if (!hasListen) {
			if (btnName == "cancel" || btnName == "close" || btnName == "ok") {
				var self = this;
				setTimeout(function () {
					self.close(btnName != "ok");
				}, Math.max(0, waitTime));
			}
		}
	};

	var windowResizeHandler = function () {
		if (this._isMounted()) {
			this.$el.find(".dialog-view > section > .container").css("maxHeight", $(window).height() - 200);
		}
		else {
			$(window).off("resize", arguments.callee);
		}
	};

	// ====================================================
	var setContentViewEvents = function () {

	};

	var setBtnWaitting = function (btn, waitTime) {
		var button = Component.get(btn.children());
		if (button)
			button.setWaitting(waitTime);
	};
	// var checkOpenDialogs = function () {
	// 	var body = $("body");
	// 	for (var i = openedDialogs.length - 1; i >= 0; i--) {
	// 		var dialog = openedDialogs[i];
	// 		if (!dialog.isOpen() || body.find(dialog.$el).length == 0)
	// 			openedDialogs.splice(i, 1);
	// 	}
	// 	if (openedDialogs.length == 0) {
	// 		body.children(".ui-dialog-mask").remove();
	// 	}
	// };

	// ====================================================
	Component.register(".ui-dialog", UIDialog);

})();
