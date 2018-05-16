// ========================================================
// 自定义按钮
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function () {
	if (VRender.Component.Button)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var ButtonRender = Component.Render.button;

	///////////////////////////////////////////////////////
	var UIButton = window.UIButton = Component.Button = function (view, options) {
		if (!Component.base.isElement(view))
			return UIButton.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);
		
		this.$el.on("tap", onClickHandler.bind(this));
	};
	var _UIButton = UIButton.prototype = new Component.base();

	UIButton.find = function (view) {
		return Component.find(view, ".ui-btn", UIButton);
	};

	UIButton.create = function (options) {
		return Component.create(options, UIButton, ButtonRender);
	};

	// ====================================================
	_UIButton.getLabel = function () {
		return this.options.label;
	};

	_UIButton.setLabel = function (value) {
		this.options.label = value;
		var button = this.$el.children(".btn");
		button.children("span").remove();
		if (Utils.isNotBlank(value)) {
			$("<span></span>").appendTo(button).text(Utils.trimToEmpty(value) || " ");
		}
	};

	_UIButton.waiting = function (time) {
		if (Utils.isNull(time) || time === true)
			time = parseInt(this.$el.attr("opt-wait")) || -1;
		else
			time = Math.max(0, parseInt(time)) || 0;
		doWaiting.call(this, time);
	};

	_UIButton.isWaiting = function () {
		return this.$el.is(".waiting");
	};

	_UIButton.setWaiting = function (value) {
		if (value === true || Utils.isNull(value))
			value = -1;
		else
			value = Math.max(0, parseInt(value)) || 0;
		this.$el.attr("opt-wait", value);
	};

	// ====================================================
	var onClickHandler = function (e) {
		if (this.$el.is(".disabled, .waiting"))
			return ;

		var link = this.$el.attr("data-lnk");
		if (link)
			window.open(link, "_self");

		this.trigger("tap");

		var waitTime = parseInt(this.$el.attr("opt-wait"));
		if (waitTime) {
			doWaiting.call(this, waitTime);
		}
	};

	// ====================================================
	var doWaiting = function (time) {
		if (this.t_wait) {
			clearTimeout(this.t_wait);
			this.t_wait = 0;
		}
		if (time) {
			var target = this.$el.addClass("waiting");
			if (time > 0) {
				var self = this;
				this.t_wait = setTimeout(function () {
					self.t_wait = 0;
					target.removeClass("waiting");
				}, time);
			}
		}
		else {
			this.$el.removeClass("waiting");
		}
	};

	// ====================================================
	Component.register(".ui-btn", UIButton);

})();