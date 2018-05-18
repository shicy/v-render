// ========================================================
// 下拉选择框
// 可选属性：data, idField, labelField, labelFunction, prompt, editable, width,
// 	selectedIndex, selectedId
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

var Utils = require("../../util/Utils");
var UISelect = require("./_UISelect");
var VRender = require("../../v-render");
var ComboboxRender = require("../../static/js/render/combobox");


var UICombobox = UISelect.extend(module, {

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

	isNative: function () {
		return Utils.isTrue(this.options.native);
	},
	setNative: function (value) {
		this.options.native = value;
	},

	render: function (output) {
		UICombobox.__super__.render.call(this, output);
		var renderer = new ComboboxRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
	
});
