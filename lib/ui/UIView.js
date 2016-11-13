// ========================================================
// 组件视图基类，本框架将组件作为网页基础，组件可以嵌套，可以继承。
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var Utils = require("../util/Utils");
var StringUtils = require("../util/StringUtils");
var VRender = require("../v-render");
var View = require("./View");


var UIView = View.extend(module, {
	doInit: function () {
		UIView.__super__.doInit.call(this);

		this.viewId = VRender.uuid();

		var options = this.options || {};
		this.setId(options.id);
		this.setTagName(options.tagName || options.tag);
		this.setClassName(options.clsName || options.className || options.cls);
		this.setStyle(options.style);

		if (options.hasOwnProperty("disabled"))
			this.setEnabled(!Utils.isTrue(options.disabled));
		else //if (options.hasOwnProperty("enabled"))
			this.setEnabled(options.enabled);

		this.setVisible(options.visible);

		this.setApiName(options.apiName);
		this.setApiParams(options.apiParams);
		this.setAutoLoad(options.autoLoad);

		this.setViewData(options.data);
		this.setDataMapper(options.dataMapper);
	},

	render: function (output) {
		UIView.__super__.render.call(this, output);

		this.$el = output.appendTag(this.getTagName());
		this.$el.attr("vid", this.getViewId());
		// this.$el.addClass("ui-view").attr("uid", this.getViewId());

		this.$el.attr("id", this.getId());
		this.$el.attr("name", this.getName());
		this.$el.addClass(this.getClassName());
		this.$el.addClass(this.getStyle());

		if (!this.isEnabled())
			this.$el.addClass("disabled");

		var visible = this.getVisible();
		if (visible === false || visible === "gone")
			this.$el.css("display", "none");
		else if (visible === "hidden")
			this.$el.css("visibility", "hidden");

		var apiName = this.getApiName();
		if (StringUtils.isNotBlank(apiName)) {
			this.$el.attr("api-name", apiName);
			var apiParams = this.getApiParams();

			if (StringUtils.isNotBlank(apiParams))
				this.$el.attr("api-params", JSON.stringify(apiParams));

			if (this.isAutoLoad())
				this.$el.attr("api-autoload", "1");
		}

		this.$el.attr(this.getMapData(this.getViewData()));

		this.renderView();
	},

	renderView: function () {
		// 渲染试图，供子类扩展，使用“this.$el”访问当前视图
	},

	///////////////////////////////////////////////////////
	getViewId: function () {
		return this.viewId;
	},

	getId: function () {
		return this.v_id || this.id;
	},
	setId: function (value) {
		this.v_id = value;
	},

	getName: function () {
		return this.v_name;
	},
	setName: function (value) {
		this.v_name = value;
	},

	getTagName: function () {
		return this.v_tagName || this.tagName || "div";
	},
	setTagName: function (value) {
		this.v_tagName = value;
	},

	getClassName: function () {
		return this.v_className || this.className;
	},
	setClassName: function (value) {
		this.v_className = value;
	},

	getStyle: function () {
		return this.v_style;
	},
	setStyle: function (value) {
		this.v_style = value;
	},

	isEnabled: function () {
		return Utils.isNull(this.v_enabled) ? true : Utils.isTrue(this.v_enabled);
	},
	setEnabled: function (value) {
		this.v_enabled = value;
	},

	getVisible: function () {
		return this.v_visible;
	},
	setVisible: function (value) {
		this.v_visible = value;
	},

	getApiName: function () {
		return this.v_apiName;
	},
	setApiName: function (value) {
		this.v_apiName = value;
	},

	getApiParams: function () {
		return this.v_apiParams;
	},
	setApiParams: function (value) {
		this.v_apiParams = value;
	},

	isAutoLoad: function () {
		return Utils.isNull(this.v_autoLoad) ? true : Utils.isTrue(this.v_autoLoad);
	},
	setAutoLoad: function (value) {
		this.v_autoLoad = value;
	},

	///////////////////////////////////////////////////////
	getViewData: function () {
		return this.v_data || this.data;
	},
	setViewData: function (data) {
		this.v_data = data;
	},

	setDataMapper: function (value) {
		this.dataMapper = value;
	},

	getMapData: function (data) {
		if (Utils.isFunction(this.dataMapper))
			return this.dataMapper(data);
		var attrs = {};
		if (Utils.notNull(data)) {
			if (data.hasOwnProperty("id"))
				attrs.id = data.id;
			if (data.hasOwnProperty("code"))
				attrs.code = data.code;
			if (data.hasOwnProperty("name"))
				attrs.name = data.name;
			if (data.hasOwnProperty("value"))
				attrs.value = data.value;
			if (data.hasOwnProperty("label"))
				attrs.label = data.label;
			if (data.hasOwnProperty("text"))
				attrs.text = data.text;
			if (data.hasOwnProperty("status"))
				attrs.status = data.status;
		}
		return attrs;
	}

});
