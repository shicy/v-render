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
	_UIButton.isWaitting = function () {
		return this.$el.is(".waitting");
	};

	_UIButton.setWaitting = function (time) {
		if (this.waittingTimerId) {
			clearTimeout(this.waittingTimerId);
			this.waittingTimerId = 0;
		}

		if (Utils.isNull(time))
			time = parseInt(this.$el.attr("opt-wait")) || -1;

		if (Utils.isTrue(time)) {
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
	var onClickHandler = function (e) {
		if (this.$el.is(".disabled, .waitting"))
			return ;
		var waitTime = parseInt(this.$el.attr("opt-wait"));
		if (waitTime) {
			this.setWaitting(waitTime);
		}
	};

	// ====================================================
	Component.register(".ui-btn", UIButton); // 默认先不实例化

})();
