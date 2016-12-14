define(function ($, VR, Utils) {
	var view = $(".mod-dropdownlist");

	(function () {
		VR.Component.DropdownList.create({
			target: view.find(".demo-front"),
			data: ["选项1", ["选项2", "选项3"], "选项4", "选项5"],
			selectedIndex: 1
		});
	})();
});