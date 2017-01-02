// ========================================================
// 组件设计
// @author shicy <shicy85@163.com>
// Create on 2016-11-07
// ========================================================

var VRender = require("../../index");
var ModuleView = require("./ModuleView");
var HeaderView = require("../HeaderView");
var SideMenuView = require("./SideMenuView");


var Utils = VRender.Utils;

var ComponentView = VRender.SinglePageView.extend(module, {
	readyCode: "docs.components",

	getPageTitle: function () {
		return "VRender组件";
	},

	doInit: function () {
		ComponentView.__super__.doInit.call(this);

		var paths = this.options.pathname.substr(1).split("/");
		this.moduleName = this.options.moduleName = paths[2];

		var self = this;
		this.moduleView = new ModuleView(this, this.options);
		this.moduleView.ready(function () {
			self.ready("docs.components");
		});
	},

	renderBody: function (body) {
		ComponentView.__super__.renderBody.call(this, body);

		new HeaderView(this, {menu: "components"}).render(body);

		var mainBody = VRender.$("<div id='main-body'></div>").appendTo(body);

		new SideMenuView(this, {active: this.moduleName}).render(mainBody);

		var container = VRender.$("<div class='container'></div>").appendTo(mainBody);
		this.moduleView.render(container);
	},

	getSinglePageContainer: function () {
		return "#main-body > .container";
	}
});

ComponentView.import(["/theme/css/prism.css", "/theme/css/style.css", "../frame.front.js"]);
