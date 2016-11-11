// ========================================================
// 组件设计
// @author shicy <shicy85@163.com>
// Create on 2016-11-07
// ========================================================

var VRender = require("../../index");
var HeaderView = require("../HeaderView");
var SideMenuView = require("./SideMenuView");


var Utils = VRender.Utils;

var ComponentView = VRender.SinglePageView.extend(module, {

	getPageTitle: function () {
		return "VRender组件";
	},

	renderBody: function (body) {
		ComponentView.__super__.renderBody.call(this, body);

		new HeaderView(this, {menu: "components"}).render(body);

		var mainBody = VRender.$("<div id='main-body'></div>").appendTo(body);

		var paths = this.options.pathname.substr(1).split("/");
		new SideMenuView(this, {active: paths[2]}).render(mainBody);

		var container = VRender.$("<div class='container'></div>").appendTo(mainBody);
		this.renderContent(container, paths[2]);
	},

	renderContent: function (target, name) {
		if (Utils.isBlank(name))
			this.renderIndexView(target);
		else {

		}
	},

	renderIndexView: function (target) {
		target.write("<h1>组件</h1>");
	},

	getSinglePageContainer: function () {
		return "#main-body > .container";
	}
});

ComponentView.import(["/theme/css/style.css", "/theme/css/components.css"]);
