// ========================================================
// 滚动加载
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================

(function () {
	if (VRender.Component.ScrollBox)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var ScrollBoxRender = Component.Render.scrollbox;

	///////////////////////////////////////////////////////
	var UIScrollBox = window.UIScrollBox = Component.ScrollBox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.$el.on("scroll", onScrollHandler.bind(this));
	};
	var _UIScrollBox = UIScrollBox.prototype = new Component.base();

	UIScrollBox.find = function (view) {
		return Component.find(view, ".ui-scrollbox", UIScrollBox);
	};

	UIScrollBox.create = function (options) {
		return Component.create(options, UIScrollBox, ScrollBoxRender);
	};

	// ====================================================
	_UIScrollBox.getContentView = function () {
		return this.options.content || this.options.view;
	};
	_UIScrollBox.setContentView = function (value) {
		var content = this.options.content = value;
		delete this.options.view;
		this.contentView = null;
		if (content) {
			var container = this.$el.children(".container");
			container.append(content.$el || content);
		}
	};

	// ====================================================
	var onScrollHandler = function (e) {

	};

	// ====================================================
	var getContentView = function () {
		if (!this.contentView) {
			var content = this.$el.children(".container");
			if (content && content.length === 1) {
				this.contentView = VRender.Component.get(content);
			}
		}
		return this.contentView;
	};

	// ====================================================
	Component.register(".ui-scrollbox", UIScrollBox);

})();