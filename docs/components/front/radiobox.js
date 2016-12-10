define(function ($, VR, Utils) {
	var view = $(".mod-radbox");

	(function () {
		VR.Component.Radiobox.create({
			target: view.find(".demo-front"), name: "radio2", label: "单选框1"});
		VR.Component.Radiobox.create({
			target: view.find(".demo-front"), name: "radio2", label: "单选框2"});
	})();
});