
define("frame", function ($, VR, Utils) {

	VR.Component.dataAdapter = function (data) {
		if (Utils.isNotNull(data)) {
			if (Utils.isArray(data))
				return {total: data.length, results: data};
			var total = parseInt(data.total) || 0;
			data = data.rows || data;
			return {total: total, results: data};
		}
		return data;
	};

});
