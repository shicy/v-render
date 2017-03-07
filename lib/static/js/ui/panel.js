// ========================================================
// 面板
// @author shicy <shicy85@163.com>
// Create on 2017-02-05
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Panel)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("./base")).HolderBase;

	///////////////////////////////////////////////////////
	var Holder = function (context, options) {
		HolderBase.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		target.addClass("ui-panel");
		renderHeader.call(this, $, target);
		renderContent.call(this, $, target);
		return this;
	};

	// ====================================================
	var renderHeader = function ($, target) {
		var options = this.options || {};

		var header = $("<header></header>").appendTo(target);

		// 标题
		var title = options.hasOwnProperty("title") ? options.title : "标题";
		header.append("<div class='title'>" + (title || "") + "</div>");
	};

	var renderContent = function ($, target) {
		var container = $("<section></section>").appendTo(target);
		var contentView = this.options.content || this.options.view;
		if (Utils.isNotBlank(contentView)) {
			if (Utils.isFunction(contentView.render))
				contentView.render(container);
			else
				container.append(contentView.$el || contentView);
		}
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIPanel = Component.Panel = function (view, options) {
		if (this.init(view, options) != this)
			return Component.get(view);
	};
	var _UIPanel = UIPanel.prototype = new Component.base();

	UIPanel.find = function (view) {
		return Component.find(view, ".ui-panel", UIPanel);
	};

	UIPanel.create = function (options) {
		return Component.create(options, UIPanel, Holder);
	};

	// ====================================================
	Component.register(".ui-panel", UIPanel);

})(typeof VRender !== "undefined");
