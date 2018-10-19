// ========================================================
// 通知
// @author shicy <shicy85@163.com>
// Create on 2018-06-08
// ========================================================

(function () {
	if (VRender.Component.Notice)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var NoticeRender = Renderer.notice;

	///////////////////////////////////////////////////////
	var UINotice = window.UINotice = Component.Notice = function (view, options) {
		if (!Component.base.isElement(view))
			return UINotice.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);

		this.open();
	};
	var _UINotice = UINotice.prototype = new Component.base();

	UINotice.find = function (view) {
		return Component.find(view, ".ui-notice", UINotice);
	};

	UINotice.create = function (options) {
		return Component.create(options, UINotice, NoticeRender);
	};

	UINotice.instance = function (target) {
		return Component.instance(target, ".ui-notice");
	};

	// ====================================================
	_UINotice.open = function () {
		doOpen.call(this);

		this.$el.on("tap", ".closebtn", onCloseBtnHandler.bind(this));

		if (!this.isRenderAsApp()) {
			this.$el.on("mouseenter", onMouseHandler.bind(this));
			this.$el.on("mouseleave", onMouseHandler.bind(this));
		}
	};

	_UINotice.close = function () {
		doClose.call(this);
	};

	// ====================================================
	var onCloseBtnHandler = function () {
		doClose.call(this);
	};

	var onMouseHandler = function (e) {
		if (e.type == "mouseenter") {
			if (this.t_close) {
				clearTimeout(this.t_close);
				this.t_close = null;
			}
		}
		else {
			waitToClose.call(this);
		}
	};

	// ====================================================
	var doOpen = function () {
		var wrapper = $("body").children(".ui-notice-wrap");
		if (!wrapper || wrapper.length == 0)
			wrapper = $("<div class='ui-notice-wrap'></div>").appendTo("body");

		var target = this.$el;
		if (this.isRenderAsApp())
			wrapper.append(target);
		else
			wrapper.prepend(target);
		
		setTimeout(function () {
			target.addClass("animate-in");
			// var maxHeight = target.children()[0].offsetHeight + 10;
			// target.css("maxHeight", maxHeight + "px");
		}, 50);

		if (this.isRenderAsApp()) {
			setTimeout(function () {
				var content = target.find(".content");
				var text = content.children();
				var contentWidth = content.width();
				var _width = text.width() - content.width();
				if (_width > 0) {
					content.addClass("over");
					var time = Math.max(5000, _width * 20);
					text.css("animation", "ui-notice-animate " + time + "ms infinite linear");
				}
			}, 1000);
		}

		waitToClose.call(this);
	};

	var doClose = function () {
		var target = this.$el.addClass("animate-out");
		// target.css("maxHeight", "");
		setTimeout(function () {
			target.removeClass("animate-in").removeClass("animate-out");
			target.remove();
			var wrapper = $("body").children(".ui-notice-wrap");
			if (wrapper.children().length == 0)
				wrapper.remove();
		}, 1500);

		this.trigger("close");
	};

	var waitToClose = function () {
		if (this.t_close) {
			clearTimeout(this.t_close);
			this.t_close = null;
		}

		var duration = this.$el.attr("opt-duration");
		if (Utils.isBlank(duration))
			duration = 10000;
		else
			duration = parseInt(duration) || 0;

		if (duration > 0) {
			var self = this;
			this.t_close = setTimeout(function () {
				self.t_close = null;
				doClose.call(self);
			}, duration);
		}
	};

	// ====================================================
	Component.register(".ui-notice", UINotice);

})();