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

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-formview");

		renderView.call(this, $, target);

		return this;
	};

	_Renderer.renderData = function () {
		// do nothing
	};

	// ====================================================
	_Renderer.add = function (name, label, index) {
		return new FormItem();
	};

	_Renderer.get = function (name) {

	};

	_Renderer.getAt = function (index) {

	};

	_Renderer.delete = function (name) {

	};

	_Renderer.deleteAt = function (index) {

	};

	// ====================================================
	var renderView = function ($, target) {
		var columns = parseInt(this.options.columns) || 0;
		if (columns > 1)
			target.attr("opt-cols", columns);

		renderItems.call(this, $, target, this.options.data, columns);
		renderButtons.call(this, $, target, this.options.buttons);
	};

	var renderItems = function ($, target, datas, columns) {
		target = $("<div class='items'></div>").appendTo(target);

		var self = this;
		Utils.each(Utils.toArray(datas), function (data) {
			var item = $("<div class='form-item'></div>").appendTo(target);
			var content = $("<div class='content'></div>").appendTo(item);
			renderOneItem.call(self, $, target, content, data);

			var colspan = parseInt(data.colspan) || 1;
			item.attr("opt-col", colspan);
			if (columns > 1) {
				item.css("width", (colspan * 100 / columns).toFixed(6) + "%");
			}
		});
	};

	var renderOneItem = function ($, target, item, data) {
		if (Utils.isNotBlank(data.name))
			item.attr("name", data.name);

		var label = $("<dt></dt>").appendTo(item);
		label.text(Utils.trimToEmpty(data.label));

		var container = $("<dd></dd>").appendTo(item);
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
	};

	var renderButtons = function ($, target, datas) {
		if (datas && datas.length > 0) {
			var btnbar = $("<div class='btnbar'></div>").appendTo(target);
			for (var i = 0, l = datas.length; i < l; i++) {
				var button = $("<div></div>").appendTo(btnbar);
				if (backend) {
					new UIButton(this.context, datas[i]).render(button);
				}
				else {
					new UIButton(Utils.extend({}, datas[i], {target: button}));
				}
			}
		}
	};

	///////////////////////////////////////////////////////
	var FormItem = function (name, label) {
		this.name = name;
		this.label = label;
	};
	var _FormItem = FormItem.prototype = new Object();

	_FormItem.getName = function () {
		return this.name;
	};

	_FormItem.getLabel = function () {
		return this.label;
	};

	_FormItem.content = function (value) {
		return this;
	};

	_FormItem.focusHtmlContent = function (value) {
		return this;
	};

	_FormItem.required = function () {
		return this;
	};

	_FormItem.validate = function (value) {
		return this;
	};

	_FormItem.colspan = function (value) {
		return this;
	}


	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.formview = Renderer;
	}

})(typeof VRender === "undefined");