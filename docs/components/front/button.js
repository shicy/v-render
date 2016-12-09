define(function ($, VR, Utils) {
	var view = $(".mod-button");

	(function () {
		var demoBtn = VR.Component.Button.create({
			target: view.find(".demo-front"), label: "前端动态创建的按钮",
			style: "ui-btn-primary"
		});
	})();
});