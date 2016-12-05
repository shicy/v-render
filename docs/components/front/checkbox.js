define(function ($, VR, Utils) {
	var view = $(".mod-chkbox");

	view.on("change", ".test-value .ui-chkbox", function (e) {
		var chk = $(e.currentTarget);
		var checked = view.find(".test-value .ui-chkbox.checked");
		
		var msg = "点击：" + chk.text();
		if (checked && checked.length > 0) {
			msg += "，当前选中值：";
			msg += Utils.map(checked, function (chk) {
				return chk.find("input").val();
			}).join(", ");
		}
		else {
			msg += "，未选择项";
		}

		view.find(".test-value .msg").text(msg);
	});
});