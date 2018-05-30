// ========================================================
// 弹出菜单
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.popupmenu)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._item.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._item();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-popupmenu");
		BaseRender._item.render.call(this, $, target);

		var options = this.options || {};

		if (backend) {
			var actionTarget = options.actionTarget;
			if (actionTarget) {
				if (typeof actionTarget == "string")
					target.attr("opt-target", Utils.trimToEmpty(actionTarget));
				else if (Utils.isFunction(actionTarget.getViewId))
					target.attr("opt-target", "[vid='" + actionTarget.getViewId() + "']");
			}

			if (options.actionType)
				target.attr("opt-trigger", options.actionType);

			var iconFunction = options.iconFunction;
			if (Utils.isFunction(iconFunction))
				BaseRender.fn.renderFunction(target, "icfunc", iconFunction);
			else if (options.iconField)
				target.attr("opt-ic", options.iconField);

			if (options.childrenField)
				target.attr("opt-child", options.childrenField);

			if (options.disabledField)
				target.attr("opt-disable", options.disabledField);

			if (options.offsetLeft)
				target.attr("opt-offsetl", options.offsetLeft);
			if (options.offsetTop)
				target.attr("opt-offsett", options.offsetTop);
		}

		return this;
	};

	// ====================================================
	_Renderer._renderItems = function ($, target) {
		// 统一在前端渲染
		// target.empty();
		// var datas = this.getData();
		// if (datas && datas.length > 0) {
		// 	var container = $("<div class='menu-container'></div>").appendTo(target);
		// 	container.append("<div class='btn up'></div>");
		// 	container.append("<ul class='menus'></ul>");
		// 	container.append("<div class='btn down'></div>");
		// 	renderItems.call(this, $, container.children("ul"), datas);
		// }
	};

	_Renderer._renderEmptyView = function () {
		// do nothing
	};

	_Renderer._renderLoadView = function () {
		// do nothing
	};

	_Renderer._doAdapter = function (data, i) {
		if (Utils.isArray(data)) {
			var self = this;
			var _data = Utils.map(data, function (temp) {
				return BaseRender.fn.doAdapter.call(self, temp);
			});
			if (data.title) {
				if (backend)
					_data.unshift({__group__: data.title});
				else
					_data.title = data.title;
			}
			return _data;
		}
		return BaseRender.fn.doAdapter.call(this, data, i);
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.popupmenu = Renderer;
	}

})(typeof VRender === "undefined");