// ========================================================
// 表单
// @author shicy <shicy85@163.com>
// Create on 2018-06-10
// ========================================================


(function (backend) {
	if (!backend && VRender.Component.Render.formview)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;
	var UIButton = backend ? require("../../../ui/component/UIButton") : VRender.Component.Button;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	Renderer.VERTICAL = "vertical";
	Renderer.HORIZONTIAL = "horizontial";

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-formview");

		renderView.call(this, $, target);

		var labelAlign = this.getLabelAlign();
		if (labelAlign && labelAlign != "left")
			target.attr("opt-la", labelAlign);

		target.attr("opt-action", Utils.trimToNull(this.options.action));
		target.attr("opt-method", Utils.trimToNull(this.options.method));

		var orientation = this.getOrientation();
		target.addClass(orientation).attr("opt-orientate", orientation);

		if (backend) {
			if (this.options.params) {
				target.attr("opt-params", JSON.stringify(this.options.params));
			}

			var columns = this.getColumns();
			if (columns > 1)
				target.attr("opt-cols", columns);

			var labelWidth = this.getLabelWidth();
			if (labelWidth)
				target.attr("opt-lw", labelWidth);
		}

		return this;
	};

	_Renderer.renderData = function () {
		// do nothing
	};

	// ====================================================
	_Renderer.add = function (name, label, index) {
		var datas = Utils.toArray(this.options.data);
		var newData = {name: name, label: label};
		index = Utils.getIndexValue(index);
		if (index >= 0 && index < datas.length)
			datas.splice(index, 0, newData);
		else
			datas.push(newData);
		this.options.data = datas;
		return new FormItem(newData);
	};

	_Renderer.get = function (name) {
		if (Utils.isBlank(name))
			return null;

		var datas = Utils.toArray(this.options.data);
		var data = Utils.findBy(datas, "name", name);
		if (data)
			return new FormItem(data);

		return null;
	};

	_Renderer.getAt = function (index) {
		index = Utils.getIndexValue(index);
		var datas = Utils.toArray(this.options.data);
		if (index >= 0 && index < datas.length)
			return new FormItem(datas[index]);
		return null;
	};

	_Renderer.delete = function (name) {
		if (Utils.isBlank(name))
			return null;
		var datas = Utils.toArray(this.options.data);
		var items = Utils.deleteBy(datas, "name", name);
		if (items && items.length > 0)
			return items.length > 1 ? items : items[0];
		return null;
	};

	_Renderer.deleteAt = function (index) {
		index = Utils.getIndexValue(index);
		var datas = Utils.toArray(this.options.data);
		if (index >= 0 && index < datas.length)
			return datas.splice(index, 1)[0];
		return null;
	};

	// ====================================================
	_Renderer.getColumns = function () {
		if (this.isRenderAsApp())
			return 1;
		return parseInt(this.options.columns) || 1;
	};

	_Renderer.getLabelWidth = function () {
		if (!this.hasOwnProperty("labelWidth"))
			this.labelWidth = Utils.getFormatSize(this.options.labelWidth, this.isRenderAsRem());
		return this.labelWidth;
	};

	_Renderer.getLabelAlign = function () {
		if (!this.hasOwnProperty("labelAlign")) {
			var align = this.options.labelAlign;
			this.labelAlign = /^(left|right|center)$/.test(align) ? align : null;
		}
		return this.labelAlign;
	};

	_Renderer.getOrientation = function () {
		var orientation = this.options.orientation;
		if (Renderer.VERTICAL == orientation || Renderer.HORIZONTIAL == orientation)
			return orientation;
		return this.isRenderAsApp() ? Renderer.VERTICAL : Renderer.HORIZONTIAL;
	};

	// ====================================================
	var renderView = function ($, target) {
		renderItems.call(this, $, target, this.options.data);
		renderButtons.call(this, $, target, this.options.buttons);
	};

	var renderItems = function ($, target, datas) {
		var items = target.children(".items").empty();
		if (!items || items.length == 0)
			items = $("<div class='items'></div>").appendTo(target);

		var self = this;
		var columns = this.getColumns();
		Utils.each(Utils.toArray(datas), function (data) {
			var item = $("<div class='form-item'></div>").appendTo(items);
			renderOneItem.call(self, $, target, item, data);

			var colspan = parseInt(data.colspan) || 1;
			item.attr("opt-col", colspan);
			if (columns > 1 && columns > colspan) {
				item.css("width", (colspan * 100 / columns).toFixed(6) + "%");
			}
		});
	};

	var renderOneItem = function ($, target, item, data) {
		if (Utils.isNotBlank(data.name))
			item.attr("name", data.name);

		if (Utils.isTrue(data.required))
			item.attr("opt-required", "1");

		var empty = Utils.trimToNull(data.empty);
		if (empty)
			item.attr("opt-empty", empty);

		if (!Utils.isTrue(data.visible))
			item.attr("opt-hide", "1");

		var itemContent = $("<dl class='content'></dl>").appendTo(item);

		var label = $("<dt></dt>").appendTo(itemContent);
		label.text(Utils.trimToEmpty(data.label));
		var labelWidth = this.getLabelWidth();
		if (labelWidth)
			label.css("width", labelWidth);

		var container = $("<dd></dd>").appendTo(itemContent);
		container = $("<div></div>").appendTo(container);

		var contentView = data.content;
		if (contentView) {
			if (Utils.isFunction(contentView.render)) {
				contentView.render(container);
			}
			else if (contentView.hasOwnProperty("$el")) {
				container.append(contentView.$el);
			}
			else {
				container.append(contentView);
			}
		}

		BaseRender.fn.renderFunction.call(this, item, "validate", data.validate);
	};

	var renderButtons = function ($, target, datas) {
		target.children(".btnbar").remove();
		if (datas && datas.length > 0) {
			var self = this;
			var btnbar = $("<div class='btnbar'></div>").appendTo(target);

			var labelWidth = this.getLabelWidth();
			if (labelWidth && !this.isRenderAsApp())
				btnbar.css("paddingLeft", labelWidth);

			Utils.each(datas, function (data) {
				var button = $("<div></div>").appendTo(btnbar);
				if (data.type == "submit")
					button.addClass("is-submit");
				if (backend) {
					new UIButton(self.context, data).render(button);
				}
				else {
					new UIButton(Utils.extend({}, data, {target: button}));
				}
			})
		}
	};

	///////////////////////////////////////////////////////
	var FormItem = function (data) {
		this.data = data;
		this.data.visible = true;
	};
	var _FormItem = FormItem.prototype = new Object();

	_FormItem.getName = function () {
		return this.data.name;
	};
	_FormItem.setName = function (value) {
		this.data.name = value;
		return this;
	};

	_FormItem.getLabel = function () {
		return this.data.label;
	};
	_FormItem.setLabel = function (value) {
		this.data.label = value;
		return this;
	};

	_FormItem.content = function (value) {
		this.data.content = value;
		return this;
	};

	_FormItem.required = function (value) {
		this.data.required = Utils.isNull(value) ? true : Utils.isTrue(value);
		return this;
	};

	_FormItem.visible = function (value) {
		this.data.visible = Utils.isNull(value) ? true : Utils.isTrue(value);
		return this;
	};

	_FormItem.show = function () {
		this.data.visible = true;
		return this;
	};

	_FormItem.hide = function () {
		this.data.visible = false;
		return this;
	}

	_FormItem.emptyMsg = function (value) {
		this.data.empty = value;
		return this;
	};

	_FormItem.validate = function (value) {
		this.data.validate = value;
		return this;
	};

	_FormItem.colspan = function (value) {
		this.datas.colspan = value;
		return this;
	}


	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.renderItems = renderItems;
		Renderer.renderOneItem = renderOneItem;
		Renderer.renderButtons = renderButtons;
		VRender.Component.Render.formview = Renderer;
	}

})(typeof VRender === "undefined");