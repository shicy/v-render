define(function ($, VR, Utils) {
	var view = $(".mod-daterange");

	(function () {
		VR.Component.DateRange.create({
			target: ".demo-front", start: "2016-12-10", end: "2016-12-20"
		});
	})();
});
