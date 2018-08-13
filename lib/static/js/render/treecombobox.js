// ========================================================
// 树形下拉选择框
// @author shicy <shicy85@163.com>
// Create on 2018-08-12
// ========================================================


(function (backend) {
	if (!backend && VRender.Component.Render.treecombobox)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;
	var UITreeView = backend ? require("../../../ui/component/UITreeView") : VRender.Component.TreeView;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-treecombobox");

		// 容器，用于下拉列表定位
		target.attr("opt-box", this.options.container);

		if (this.isMultiple())
			target.attr("multiple", "multiple");

		renderTextView.call(this, $, target);
		renderTreeView.call(this, $, target);

		return this;
	};

	_Renderer.renderData = function () {
		// do nothing
	};

	_Renderer.getDataAdapter = function () {
		return null;
	};

	_Renderer.getDataMapper = function () {
		return null;
	};

	_Renderer.isMultiple = function () {
		return BaseRender.fn.isMultiple.call(this);
	};

	// ====================================================
	var renderTextView = function ($, target) {
		var ipttag = $("<div class='ipt'></div>").appendTo(target);

		var input = $("<input type='text'/>").appendTo(ipttag);
		input.attr("readonly", "readonly");

		ipttag.append("<button class='dropdownbtn'></button>");
		ipttag.append("<span class='prompt'>" + Utils.trimToEmpty(this.options.prompt) + "</span>");
	};

	var renderTreeView = function ($, target) {
		target = $("<div class='dropdown'></div>").appendTo(target);

		var treeOptions = getTreeOptions.call(this, this.options);
		if (backend) {
			new UITreeView(this, treeOptions).render(target);
		}
		else {
			treeOptions.target = target;
			UITreeView.create(treeOptions);
		}
	};

	var getTreeOptions = function (options) {
		var _options = {};
		_options.data = options.data;
		_options.keyField = options.keyField;
		_options.labelField = options.labelField;
		_options.labelFunction = options.labelFunction;
		_options.itemRenderer = options.itemRenderer;
		_options.selectedIndex = options.selectedIndex;
		_options.selectedKey = options.selectedKey;
		_options.multiple = this.isMultiple();
		_options.chkbox = !!_options.multiple;
		_options.dataAdapter = options.dataAdapter;
		_options.dataMapper = options.dataMapper;
		_options.loadingView = options.loadingView;
		_options.loadingText = options.loadingText;
		_options.emptyView = options.emptyView;
		_options.emptyText = options.emptyText;
		_options.moreView = options.moreView;
		_options.moreText = options.moreText;
		_options.apiName = options.apiName;
		_options.apiParams = options.apiParams;
		_options.autoLoad = options.autoLoad;
		_options.icon = options.icon;
		_options.openIndex = options.openIndex;
		_options.openId = options.openId;
		return _options;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.treecombobox = Renderer;
	}

})(typeof VRender === "undefined");