// ========================================================
// 组件设计前端脚本
// @author shicy <shicy85@163.com>
// Create on 2016-11-11
// ========================================================

define(function ($, VR) {
	var body = $("body");

	///////////////////////////////////////////////////////
	// 路由变更
	VR.on(VR.event_routerchange, function (e, state) {
		var menus = body.find(".sidemenu");
		menus.find(".selected").removeClass("selected");
		if (state && state.name)
			menus.find("[name=" + state.name + "]").addClass("selected");
	});

	///////////////////////////////////////////////////////
	body.on("click", ".sidemenu .menu", function (e) {
		var item = $(e.currentTarget);
		if (item.is(".selected"))
			return ;
		body.find(".sidemenu .selected").removeClass("selected");
		var data = {name: item.attr("name")};
		VR.navigate(("/docs/components/" + data.name), data);
	});

	body.on("click", ".container > .comp-mod > .complist > .item > a", function (e) {
		var item = $(e.currentTarget).parent();
		var data = {name: item.attr("name")};
		VR.navigate(("/docs/components/" + data.name), data);
	});

	///////////////////////////////////////////////////////
	(function () {
		var SinglePage = VR.plugins.singlepage;
		if (SinglePage) {
			SinglePage.setViewHandler(function (state, callback) {
				var url = "/docs/components/module/";
				url += (state && state.name) ? state.name : "index";
				VR.require(url, function (err, html) {
					if (err) {
						var errmsg = err;
						callback(false, "<div class='text-error'>" + errmsg + "</div>");
					}
					else {
						callback(false, html);
					}
				});
			});
		}
	})();

});
