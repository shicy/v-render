// ========================================================
// 组件视图基类，本框架将组件作为网页基础，组件可以嵌套，可以继承。
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var Utils = require("../util/Utils");
var StringUtils = require("../util/StringUtils");
var PluginManager = require("../plugins/PluginManager");
var VRender = require("../v-render");
var View = require("./View");


var UIView = View.extend(module, {
	doInit: function (done) {
		UIView.super(this, (function () {
			this.viewId = VRender.uuid();
			if (Utils.isFunction(done))
				done();
		}).bind(this));
	},

	render: function (output) {
		UIView.super(this, output);

		var target = this.$el = output.appendTag(this.getTagName());
		target.attr("vid", this.getViewId());

		target.attr("id", this.getId());
		target.attr("name", this.getName());
		target.attr("ref", this.getRefName());
		target.addClass(this.getClassName());
		target.addClass(this.getStyle());

		if (this.isWidthEnabled())
			target.css("width", this.getWidth());
		if (this.isHeightEnabled())
			target.css("height", this.getHeight());

		if (this.isDisabled())
			target.addClass("disabled").attr("disabled", "disabled");

		var visible = this.getVisible();
		if (visible === false || visible === "gone")
			target.css("display", "none");
		else if (visible === "hidden")
			target.css("visibility", "hidden");

		var apiName = this.getApiName();
		if (StringUtils.isNotBlank(apiName)) {
			target.attr("api-name", apiName);
			var apiParams = this.getApiParams();
			if (StringUtils.isNotBlank(apiParams))
				target.attr("api-params", JSON.stringify(apiParams));
			if (this.isAutoLoad())
				target.attr("api-autoload", "1");
		}

		this.renderDatas();

		PluginManager.renderViewBefore.call(this, this.$el);
		this.renderView();
		PluginManager.renderViewAfter.call(this, this.$el);
		
		this.renderFrontComponentMake();
	},

	renderView: function () {
		// 渲染试图，供子类扩展，使用“this.$el”访问当前视图
	},

	renderDatas: function () {
		var data = this.getViewData();
		if (data)
			data = this.getMapData(data);
		if (data)
			this.$el.attr(data);
	},

	renderFrontComponentMake: function () {
		if (Utils.isFunction(this.getFrontComponentName)) {
			var componentName = this.getFrontComponentName();
			if (StringUtils.isNotBlank(componentName)) {
				var tagid = VRender.uuid();
				var script = this.$el.appendAndGet("<script vid='" + tagid + 
					"' class='vrender-fragment-script'></script>");
				script.write("VRender.one(VRender.event_buildcomplete, function(){");
				script.write("requirejs('" + componentName + 
					"',function(c){c&&c.make('[vid=" + this.getViewId() + "]');});");
				script.write("$('[vid=" + tagid + "]').remove();");
				script.write("});");
			}
		}
	},

	// getFrontComponentName: function () {
	// 	// 子类实现
	// },

	///////////////////////////////////////////////////////
	getViewId: function () {
		return this.viewId;
	},

	getId: function () {
		return this.options.id || this.id;
	},
	setId: function (value) {
		this.options.id = value;
	},

	getName: function () {
		return this.options.name;
	},
	setName: function (value) {
		this.options.name = value;
	},

	getTagName: function () {
		return this.options.tagName || this.options.tag || this.tagName || "div";
	},
	setTagName: function (value) {
		this.options.tagName = value;
		delete this.options.tag;
		delete this.tagName;
	},

	getClassName: function () {
		return this.options.className || this.options.clsName || this.options.cls || this.className;
	},
	setClassName: function (value) {
		this.options.className = value;
		delete this.options.clsName;
		delete this.options.cls;
		delete this.className;
	},

	getStyle: function () {
		return this.options.style;
	},
	setStyle: function (value) {
		this.options.style = value;
	},

	getRefName: function () {
		return this.options.ref || this.ref;
	},
	setRefName: function (value) {
		this.options.ref = value;
		delete this.ref;
	},

	getWidth: function () {
		return Utils.getFormatSize(this.options.width, this.isRenderAsRem());
	},
	setWidth: function (value) {
		this.options.width = value;
	},
	isWidthEnabled: function () {
		return true;
	},

	getHeight: function () {
		return Utils.getFormatSize(this.options.height, this.isRenderAsRem());
	},
	setHeight: function (value) {
		this.options.height = value;
	},
	isHeightEnabled: function () {
		return true;
	},

	isDisabled: function () {
		if (this.options.hasOwnProperty("disabled"))
			return Utils.isTrue(this.options.disabled);
		return false;
	},
	setDisabled: function (value) {
		this.options.disabled = Utils.isNull(value) ? true : Utils.isTrue(value);
	},

	getVisible: function () {
		return this.options.visible;
	},
	setVisible: function (value) {
		this.options.visible = value;
	},

	getApiName: function () {
		return this.options.apiName;
	},
	setApiName: function (value) {
		this.options.apiName = value;
	},

	getApiParams: function () {
		return this.options.apiParams;
	},
	setApiParams: function (value) {
		this.options.apiParams = value;
	},

	isAutoLoad: function () {
		return Utils.isNull(this.options.autoLoad) ? true : Utils.isTrue(this.options.autoLoad);
	},
	setAutoLoad: function (value) {
		this.options.autoLoad = value;
	},

	///////////////////////////////////////////////////////
	getViewData: function () {
		var data = this.options.data;
		var adapter = this.getDataAdapter();
		if (Utils.isFunction(adapter))
			data = adapter(data);
		return data;
	},
	setViewData: function (data) {
		this.options.data = data;
	},

	getDataAdapter: function () {
		return this.options.dataAdapter || this.options.adapter;
	},
	setDataAdapter: function (value) {
		this.options.dataAdapter = value;
		delete this.options.adapter;
	},

	getDataMapper: function () {
		return this.options.dataMapper || this.options.mapper;
	},
	setDataMapper: function (value) {
		this.options.dataMapper = value;
		delete this.options.mapper;
	},

	getMapData: function (data) {
		if (Utils.isNull(data))
			return {};
		var mapper = this.getDataMapper();
		if (Utils.isFunction(mapper))
			return mapper(data);
		var attrs = {};
		if (data.hasOwnProperty("id"))
			attrs["data-id"] = data.id;
		if (data.hasOwnProperty("code"))
			attrs["data-code"] = data.code;
		if (data.hasOwnProperty("name"))
			attrs["data-name"] = data.name;
		if (data.hasOwnProperty("value"))
			attrs["data-value"] = data.value;
		if (data.hasOwnProperty("label"))
			attrs["data-label"] = data.label;
		if (data.hasOwnProperty("text"))
			attrs["data-text"] = data.text;
		if (data.hasOwnProperty("status"))
			attrs["data-status"] = data.status;
		return attrs;
	}

});
