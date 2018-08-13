// ========================================================
// 文件上传
// @author shicy <shicy85@163.com>
// Create on 2018-06-20
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.fileupload)
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

		target.addClass("ui-fileupload").css("display", "none");

		target.attr("opt-action", Utils.trimToNull(this.options.action));
		target.attr("opt-upload", Utils.trimToNull(this.options.uploadName));
		target.attr("opt-filter", this.getFilter());
		target.attr("opt-limit", this.getLimit() || null);
		target.attr("opt-auto", this.isAutoUpload() ? "1" : null);
		target.attr("opt-mixed", this.isMixed() ? "1" : null);

		target.attr("opt-browser", this.getBrowser());

		renderInputView.call(this, $, target);

		if (backend) {
			if (this.options.params) {
				target.attr("opt-params", JSON.stringify(this.options.params));
			}
		}
	};

	_Renderer.getBrowser = function () {
		if (backend) {
			var browser = this.options.browser;
			if (browser) {
				if (typeof browser == "string")
					return browser;
				if (Utils.isFunction(browser.getViewId))
					return "[vid='" + browser.getViewId() + "']";
			}
		}
		return null;
	};

	_Renderer.getFilter = function () {
		return Utils.trimToNull(this.options.filter);
	};

	_Renderer.getLimit = function () {
		return Math.max(0, parseInt(this.options.limit)) || 0;
	};

	_Renderer.isMultiple = function () {
		return BaseRender.fn.isMultiple.call(this);
	};

	_Renderer.isAutoUpload = function () {
		if (this.options.hasOwnProperty("autoUpload"))
			return Utils.isTrue(this.options.autoUpload);
		return true;
	};

	_Renderer.isMixed = function () {
		return Utils.isTrue(this.options.mixed);
	};

	// ====================================================
	var renderInputView = function ($, target) {
		var input = $("<input type='file'/>").appendTo(target);

		if (this.isMultiple())
			input.attr("multiple", "multiple");

		input.attr("accept", Utils.trimToNull(getAccept.call(this)));
	};

	var getAccept = function () {
		var filter = this.getFilter();
		if (filter) {
			if (filter == "image")
				return "image/*";
			if (filter == "audio")
				return "audio/*";
			if (filter == "video")
				return "video/*";
			if (filter == "excel")
				return "application/vnd.ms-excel"; // ".xls,.xlsx,.xlc,.xlm,.xlt,.xltx,.xlw,.xlsb,.xlsm"
			if (filter == "word")
				return "application/msword"; // ".doc,.docx,.dot,.dotx"
			if (filter == "powerpoint")
				return "application/vnd.ms-powerpoint"; // ".ppt,.pptx,.pps,.ppsx,.pot,.potx"
			if (filter == "text")
				return "text/*";
		}
		return filter;
	};
	
	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.getAccept = getAccept;
		VRender.Component.Render.fileupload = Renderer;
	}

})(typeof VRender === "undefined");