// ========================================================
// 通知
// @author shicy <shicy85@163.com>
// Create on 2018-06-08
// ========================================================

(function () {
	if (VRender.Component.Notification)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var NotificationRender = Renderer.notification;

	///////////////////////////////////////////////////////
	var UINotification = window.UINotification = Component.Notification = function (view, options) {
		if (!Component.base.isElement(view))
			return UINotification.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);

		show.call(this);
	};
	var _UINotification = UINotification.prototype = new Component.base();

	UINotification.find = function (view) {
		return Component.find(view, ".ui-notification", UINotification);
	};

	UINotification.create = function (options) {
		return Component.create(options, UINotification, NotificationRender);
	};

	// ====================================================
	var show = function () {
		var wrapper = $("body").children(".ui-notification-wrap");
		if (!wrapper || wrapper.length == 0)
			wrapper = $("<div class='ui-notification-wrap'></div>").appendTo("body");

		var target = this.$el.prependTo(wrapper);
		setTimeout(function () {
			target.addClass("show");
		}, 0);
	};

	var close = function () {

	};


	// ====================================================
	Component.register(".ui-notification", UINotification);

})();