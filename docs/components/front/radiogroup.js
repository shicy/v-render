define(function ($, VR, Utils) {
	var view = $(".mod-radgrp");

	(function () {
		VR.Component.RadioGroup.create({
			target: view.find(".demo-front"),
			data: ["a", "b", "c", "d"]
		});
	})();
});