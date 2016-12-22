define(function ($, VR, Utils) {
	var view = $(".mod-paginator");

	(function () {
		VR.Component.Paginator.create({
			target: ".demo-front", total: 133, size: 15, page: 6
		});
	})();
});
