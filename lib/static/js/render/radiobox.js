// ========================================================
// 单选框
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.radiobox)
		return ;

	///////////////////////////////////////////////////////
	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRenderer = backend ? require("./_base").BaseRenderer : VRender.Component.Render._base;

	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
		target.addClass("ui-radbox");

		var options = this.options || {};

		var input = $("<input type='radio'/>").appendTo(target);

		if (Utils.isNotNull(options.value))
			input.val(options.value);

		if (Utils.isTrue(options.checked)) {
			target.addClass("checked");
			input.attr("checked", "checked");
		}

		if (Utils.isNotNull(options.label))
			target.append("<span>" + options.label + "</span>");

		if (Utils.isNotBlank(options.name))
			input.attr("name", options.name);

		return this;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.radiobox = Renderer;
	}

})(typeof VRender === "undefined");