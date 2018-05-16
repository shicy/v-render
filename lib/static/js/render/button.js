// ========================================================
// 自定义按钮
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.button)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	// ====================================================
	// 默认按钮样式
	Renderer.innerStyles = ["ui-btn-default", "ui-btn-primary", "ui-btn-success", "ui-btn-danger", 
		"ui-btn-warn", "ui-btn-info", "ui-btn-link", "ui-btn-text"];
	// 按钮大小定义
	Renderer.sizes = ["bigger", "big", "normal", "small", "tiny"];

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-btn");

		var options = this.options || {};

		var size = options.size;
		if (size && Renderer.sizes.indexOf(size) >= 0)
			target.addClass(size);

		// 如果是内置 style 就用该样式，否则通过 type 获取一个样式
		// 注：style 样式已在 base 或 UIView 中添加
		var style = options.style || "";
		if (Renderer.innerStyles.indexOf(style) < 0) {
			target.addClass(getTypeStyle(options.type)); // 会返回一个默认样式
		}

		if (options.link && Utils.isNotBlank(options.link))
			target.attr("data-lnk", Utils.trimToNull(options.link));

		var mainBtn = $("<button class='btn'></button>").appendTo(target);
		var iconUrl = getIconUrl.call(this);
		if (Utils.isNotBlank(iconUrl)) {
			var icon = $("<i class='icon'></i>").appendTo(mainBtn);
			icon.css((backend ? "background-image" : "backgroundImage"), "url(" + iconUrl + ")");
		}
		if (Utils.isNotBlank(options.label)) {
			$("<span></span>").appendTo(mainBtn).text(Utils.trimToEmpty(options.label) || " ");
		}

		renderWaitingInfos.call(this, $, target);

		var items = this.getItems();
		if (items && items.length > 0) {
			target.addClass("has-items");
			renderItems.call(this, $, target, items);
		}

		return this;
	};

	_Renderer.getItems = function () {
		return Utils.toArray(this.options.items);
	};

	// ====================================================
	var renderWaitingInfos = function ($, target) {
		var waitTime = getWaitTime.call(this);
		if (waitTime)
			target.attr("opt-wait", waitTime);
		
		if (Utils.isTrue(this.options.waiting))
			target.addClass("waiting");
	};

	var renderItems = function ($, target, datas) {
		target.children(".items").remove();
		if (datas && datas.length > 0) {
			
		}
	};

	// ====================================================
	var getWaitTime = function () {
		var waitTime = 0;
		if (this.options.hasOwnProperty("waitTime"))
			waitTime = this.options.waitTime;
		else if (this.options.hasOwnProperty("wait"))
			waitTime = this.options.wait;
		if (waitTime === true)
			return -1;
		return Math.max(0, parseInt(waitTime)) || 0;
	};

	var getIconUrl = function () {
		var icon = this.options.icon;
		if (icon === true) {
			var type = this.options.type;
			if (type == "success")
				icon = "012b.png";
			else if (type == "warn")
				icon = "013b.png";
			else if (type == "danger")
				icon = "014b.png";
			else if (type == "info")
				icon = "015b.png";
			if (icon !== true)
				icon = "/VRender/icons/" + icon;
		}
		return (typeof icon === "string") ? icon : null;
	};

	var getTypeStyle = function (type) {
		if (Utils.isNotBlank(type)) {
			if (["ok", "submit", "save", "primary", "major"].indexOf(type) >= 0)
				return "ui-btn-primary";
			if (["danger", "error"].indexOf(type) >= 0)
				return "ui-btn-danger";
			if (["success", "complete", "finish"].indexOf(type) >= 0)
				return "ui-btn-success";
			if (["warn", "warning"].indexOf(type) >= 0)
				return "ui-btn-warn";
			if (["info", "highlight"].indexOf(type) >= 0)
				return "ui-btn-info";
			if (type === "text")
				return "ui-btn-text";
			if (type === "link")
				return "ui-btn-link";
		}
		return "ui-btn-default";
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.button = Renderer;
	}

})(typeof VRender === "undefined");