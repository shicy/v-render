// ========================================================
// 列表
// @author shicy <shicy85@163.com>
// Create on 2018-01-07
// ========================================================

var Utils = require("../../util/Utils");
var UIItems = require("./_UIItems");
var VRender = require(__vrender__);
var ListViewRenderer = require("../../static/js/render/listview");


var UIListView = UIItems.extend(module, {

	doInit: function () {
		UIListView.__super__.doInit.call(this);
		this.renderer = new ListViewRenderer(this, this.options);
	},

	isChkboxVisible: function () {
		return Utils.isTrue(this.options.chkbox);
	},

	setChkboxVisible: function (value) {
		this.options.chkbox = Utils.isNull(value) ? true : Utils.isTrue(value);
	},

	getPaginator: function () {
		return this.options.paginator || this.options.pager;
	},

	setPaginator: function (value) {
		this.options.paginator = value;
		delete this.options.pager;
	},

	render: function (output) {
		UIListView.__super__.render.call(this, output);
		this.renderer.render(VRender.$, this.$el);
	}
	
});

UIListView.item_renderer_simple = ListViewRenderer.itemRenderer_simple;

UIListView.item_renderer_icon = ListViewRenderer.itemRenderer_icon;

UIListView.item_renderer_button = ListViewRenderer.itemRenderer_button;

UIListView.item_renderer_icon_button = ListViewRenderer.itemRenderer_icon_button;
