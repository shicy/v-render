// ========================================================
// 下拉选择框
// 可选属性：data, idField, labelField, labelFunction, prompt, editable, width,
// 	selectedIndex, selectedId
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

var Utils = require("../../util/Utils");
var _UIItems = require("./_UIItems");
var VRender = require("../../v-render");
var ComboHolder = require("../../static/js/ui/combobox");


var UICombobox = _UIItems.extend(module, {
	doInit: function () {
		UICombobox.__super__.doInit.call(this);
		this.holder = new ComboHolder(this, this.options);
	},

	getWidth: function () {
		return this.options.width;
	},
	setWidth: function (value) {
		this.options.width = value;
	},

	getPrompt: function () {
		return this.options.prompt;
	},
	setPrompt: function (value) {
		this.options.prompt = value;
	},

	isEditable: function () {
		return Utils.isTrue(this.options.editable);
	},
	setEditable: function (bool) {
		this.options.editable = bool;
	},

	// 这里的数据映射用在选项上
	getMapData: function () {
		return null;
	},

	render: function (output) {
		UICombobox.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
	
});
