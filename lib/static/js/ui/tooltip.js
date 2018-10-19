// ========================================================
// 提示框
// @author shicy <shicy85@163.com>
// Create on 2018-06-10
// ========================================================

(function () {
	if (VRender.Component.Tooltip)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var TooltipRender = Renderer.tooltip;

	///////////////////////////////////////////////////////
	var UITooltip = window.UITooltip = Component.Tooltip = function (view, options) {
		if (!Component.base.isElement(view))
			return UITooltip.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);

		this.open();
	};
	var _UITooltip = UITooltip.prototype = new Component.base();

	UITooltip.find = function (view) {
		return Component.find(view, ".ui-tooltip", UITooltip);
	};

	UITooltip.create = function (options) {
		return Component.create(options, UITooltip, TooltipRender);
	};

	UITooltip.instance = function (target) {
		return Component.instance(target, ".ui-tooltip");
	};

	// ====================================================
	_UITooltip.open = function () {
		doOpen.call(this);

		if (this.isRenderAsApp()) {
			if (this.$el.find(".closebtn").length > 0)
				this.$el.on("tap", onClickHandler.bind(this));
		}
		else {
			this.$el.on("tap", ".closebtn", onCloseBtnHandler.bind(this));
			this.$el.on("tap", ".content", onContentClickHandler.bind(this));
			this.$el.on("mouseenter", onMouseHandler.bind(this));
			this.$el.on("mouseleave", onMouseHandler.bind(this));
		}
	};

	_UITooltip.close = function () {
		doClose.call(this);
	};

	// ====================================================
	var onClickHandler = function (e) {
		if ($(e.target).is(this.$el)) {
			doClose.call(this);
		}
	};

	var onCloseBtnHandler = function () {
		doClose.call(this);
	};

	var onContentClickHandler = function () {
		this.$el.addClass("active");
	};

	var onMouseHandler = function (e) {
		if (e.type == "mouseenter") {
			if (this.t_close) {
				clearTimeout(this.t_close);
				this.t_close = null;
			}
		}
		else {
			this.$el.removeClass("active");
			waitToClose.call(this);
		}
	};

	// ====================================================
	var doOpen = function () {
		var wrapper = $("body").children(".ui-tooltip-wrap");
		if (!wrapper || wrapper.length == 0)
			wrapper = $("<div class='ui-tooltip-wrap'></div>").appendTo("body");

		var target = this.$el.appendTo(wrapper);
		
		setTimeout(function () {
			target.addClass("animate-in");
		}, 50);

		waitToClose.call(this);
	};

	var doClose = function () {
		var target = this.$el.addClass("animate-out");
		setTimeout(function () {
			target.removeClass("animate-in").removeClass("animate-out");
			target.remove();
			var wrapper = $("body").children(".ui-tooltip-wrap");
			if (wrapper.children().length == 0)
				wrapper.remove();
		}, 500);
		this.trigger("close");
	};

	var waitToClose = function () {
		if (this.t_close) {
			clearTimeout(this.t_close);
			this.t_close = null;
		}

		var duration = this.$el.attr("opt-duration");
		if (Utils.isBlank(duration))
			duration = 3000;
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
	Component.register(".ui-tooltip", UITooltip);

})();