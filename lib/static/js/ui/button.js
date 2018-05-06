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

	_UIButton.waitting = function (time) {
		if (Utils.isNull(time) || time === true)
			time = parseInt(this.$el.attr("opt-wait")) || -1;
		else if (time) {
			if (isNaN(time))
				time = Utils.isTrue(time) ? (parseInt(this.$el.attr("opt-wait")) || -1) : 0;
			else 
				time = Math.max(0, parseInt(time));
		}
		else {
			time = 0;
		}
		doWaitting.call(this, time);
	};

	_UIButton.isWaitting = function () {
		return this.$el.is(".waitting");
	};

	_UIButton.setWaitting = function (value) {
		if (value === true || Utils.isNull(value))
			value = -1;
		else if (value) {
			if (isNaN(value))
				value = Utils.isTrue(value) ? -1 : 0;
			else
				value = Math.max(0, parseInt(value));
		}
		else {
			value = 0;
		}
		this.$el.attr("opt-wait", value);
	};

	// ====================================================
	var onClickHandler = function (e) {
		if (this.$el.is(".disabled, .waitting"))
			return ;
		this.trigger("tap");
		var waitTime = parseInt(this.$el.attr("opt-wait"));
		if (waitTime) {
			doWaitting.call(this, waitTime);
		}
	};

	// ====================================================
	var doWaitting = function (time) {
		if (this.waittingTimerId) {
			clearTimeout(this.waittingTimerId);
			this.waittingTimerId = 0;
		}
		if (time) {
			var target = this.$el.addClass("waitting");
			if (time > 0) {
				var self = this;
				this.waittingTimerId = setTimeout(function () {
					self.waittingTimerId = 0;
					target.removeClass("waitting");
				}, time);
			}
		}
		else {
			this.$el.removeClass("waitting");
		}
	};

	// ====================================================
	Component.register(".ui-btn", UIButton);

})();