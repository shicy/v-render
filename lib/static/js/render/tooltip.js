// ========================================================
// 提示框
// @author shicy <shicy85@163.com>
// Create on 2018-06-10
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.tooltip)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-tooltip");

		var type = this.getType();
		if (type)
			target.addClass("show-icon").attr("opt-type", type);

		target.attr("opt-duration", this.getDuration());

		renderView.call(this, $, target);

		return this;
	};

	_Renderer.getType = function () {
		if (/^(success|warn|danger|info)$/i.test(this.options.type))
			return this.options.type;
		return null;
	};

	_Renderer.getDuration = function () {
		if (Utils.isBlank(this.options.duration))
			return null;
		if (isNaN(this.options.duration))
			return null;
		return parseInt(this.options.duration) || 0;
	};

	_Renderer.isClosable = function () {
		if (Utils.isNull(this.options.closable))
			return true;
		return Utils.isTrue(this.options.closable);
	}

	// ====================================================
	var renderView = function ($, target) {
		var container = $("<div class='container'></div>").appendTo(target);

		var icon = $("<i class='img'></i>").appendTo(container);

		var content = $("<div class='content'></div>").appendTo(container);
		if (this.options.hasOwnProperty("focusHtmlContent")) {
			content.html(this.options.focusHtmlContent || "无");
		}
		else {
			content.text(this.options.content || "无");
		}
		
		if (this.isClosable())
			container.append("<div class='closebtn'></div>");

		if (this.options.icon) {
			target.addClass("show-icon");
			icon.css("backgroundImage", "url(" + this.options.icon + ")");
		}
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.tooltip = Renderer;
	}

})(typeof VRender === "undefined");