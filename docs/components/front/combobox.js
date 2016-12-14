define(function ($, VR, Utils) {
	var view = $(".mod-combobox");

	(function () {
		VR.Component.Combobox.create({
			target: view.find(".demo-front"),
			prompt: "==请选择==",
			data: [{id: 1, label: "选项1"}, {id: 2, label: "选项2"},
				{id: 3, label: "选项3"}, {id: 4, label: "选项4"}]
		});
	})();
});
