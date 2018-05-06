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
		BaseRender._item.render.call(this, $, target);

		target.addClass("ui-popupmenu");

		if (backend) {
			var actionTarget = this.options.actionTarget;
			if (actionTarget) {
				if (Utils.isFunction(actionTarget.getViewId))
					target.attr("opt-target", "[vid='" + actionTarget.getViewId() + "']");
				else 
					target.attr("opt-target", Utils.trimToEmpty(actionTarget));
			}

			if (this.options.actionType)
				target.attr("opt-trigger", this.options.actionType);

			var iconFunction = this.options.iconFunction;
			if (Utils.isFunction(iconFunction))
				BaseRender.fn.renderFunction(target, "icfunc", iconFunction);
			else if (this.options.iconField)
				target.attr("opt-ic", this.options.iconField);

			if (this.options.childrenField)
				target.attr("opt-child", this.options.childrenField);

			if (this.options.disabledField)
				target.attr("opt-disable", this.options.disabledField);

			if (this.options.offsetLeft)
				target.attr("opt-offsetl", this.options.offsetLeft);
			if (this.options.offsetTop)
				target.attr("opt-offsett", this.options.offsetTop);
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