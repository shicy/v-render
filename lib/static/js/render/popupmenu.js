// ========================================================
// 弹出菜单
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.popupmenu)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./_base").ListRenderer : VRender.Component.Render._list;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		ListRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new ListRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-popupmenu");
		ListRenderer.render.call(this, $, target);
		return this;
	};

	// ====================================================
	_Renderer._renderItems = function ($, target) {
		target.empty();
		var datas = this.getData();
		if (datas && datas.length > 0) {
			var container = $("<div class='menu-container'></div>").appendTo(target);
			container.append("<div class='btn up'></div>");
			container.append("<ul class='menus'></ul>");
			container.append("<div class='btn down'></div>");
			renderItems.call(this, $, container.children("ul"), datas);
		}
	};

	_Renderer._getIcon = function (data) {
		return getIcon.call(this, data);
	};

	_Renderer._getIconField = function () {
		return this.options.iconField;
	};

	_Renderer._getIconFunction = function () {
		return this.options.iconFunction;
	};

	_Renderer._getChildrenField = function () {
		// return Utils.trimToNull(this.options.childrenField) || "children";
		return "children";
	};

	_Renderer._getDisabledField = function () {
		// return Utils.trimToNull(this.options.disabledField) || "disabled";
		// return "disabled";
	};

	// ====================================================
	var renderItems = function ($, container, datas) {
		var self = this;
		Utils.each(Utils.toArray(datas), function (data) {
			var item = $("<li class='menu'></li>").appendTo(container);
			renderOneItem.call(self, $, item, data);
		});
	};

	var renderOneItem = function ($, item, data) {
		if (backend)
			this.renderItemData($, item, data);
		else
			item.data("itemData", data);

		var iconUrl = this._getIcon(data);
		if (Utils.isNotBlank(iconUrl)) {
			var icon = $("<i></i>").appendTo(item);
			icon.css("backgroundImage", "url(" + iconUrl + ")");
		}

		var content = $("<div></div>").appendTo(item);
		var itemRenderer = this.getItemRenderer();
		if (Utils.isFunction(itemRenderer)) {
			var result = itemRenderer($, content, data);
			if (Utils.isNotNull(result))
				content.empty().append(result);
		}
		else {
			var label = this._getDataLabel(data);
			content.html(Utils.isNull(label) ? "" : label);
		}

		if (hasChildren.call(this, data))
			item.addClass("has-child");

		if (isDisabled.call(this, data))
			item.addClass("disabled").attr("disabled", "disabled");
	};

	// ====================================================
	var getIcon = function (data) {
		var iconFunction = this._getIconFunction();
		if (Utils.isFunction(iconFunction))
			return iconFunction(data);
		if (data) {
			var iconField = Utils.trimToNull(this._getIconField()) || "icon";
			return data[iconField];
		}
		return null;
	};

	var hasChildren = function (data) {
		if (data) {
			var childrenField = this._getChildrenField();
			return Utils.isArray(data[childrenField]);
		}
		return false;
	};

	var isDisabled = function (data) {
		if (data) {
			if (this.options.hasOwnProperty("disabledField")) {
				var disabledField = this.options.disabledField;
				if (Utils.isNotBlank(disabledField))
					return true;
				if (data.hasOwnProperty(disabledField))
					return Utils.isTrue(data[disabledField]);
				return false;
			}
			else if (data.hasOwnProperty("disabled")) {
				return Utils.isTrue(data.disabled);
			}
		}
		return false;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.popupmenu = Renderer;
	}

})(typeof VRender === "undefined");