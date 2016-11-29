// ========================================================
// 模块视图
// @author shicy <shicy85@163.com>
// Create on 2016-11-14
// ========================================================

var VRender = require("../../index");


var Utils = VRender.Utils;

var viewMap = {"group": "./module_group"};

var ModuleView = VRender.Fragment.extend(module, {
	className: "comp-mod",

	renderView: function () {
		ModuleView.__super__.renderView.call(this);

		var view = this.getView();
		if (view)
			view.render(this.$el);
		else
			this.$el.writeTmpl(__dirname + "/index_home.tmpl");
	},

	getView: function () {
		var moduleName = this.options.moduleName;
		if (Utils.isBlank(moduleName))
			moduleName = this.options.pathname.substr(1).split("/")[3];
		if (Utils.isNotBlank(moduleName)) {
			var viewpath = viewMap[moduleName];
			if (!viewpath)
				viewpath = "./module_" + moduleName;
			try {
				var ViewClass = this.use(viewpath);
				return new ViewClass(this);
			}
			catch (e) {
				console.log(e);
			}
		}
		return null;
	}
});
