define(function ($, VR, Utils) {
	var view = $(".mod-tabbar");

	view.on("click", ".demo2 .ui-btn", function (e) {
		var btn = $(e.currentTarget);
		var tabbar = VR_Tabbar.find(view.find(".demo2"))[0];
		if (/enabled/.test(btn.attr("name")))
			tabbar.setEnabled("tab1");
		else
			tabbar.setDisabled("tab1");
	});

	view.on("click", "[name='demo3-add']", function (e) {
		var target = view.find(".demo3");
		var input = VR_TextView.find(target)[0];
		var chkbox = VR_Checkbox.find(target)[0];

		var data = {};
		data.label = input.val();
		data.closable = chkbox.isChecked();

		if (Utils.isBlank(data.label)) {
			input.showError("请输入选项卡名称");
		}
		else {
			input.val("");
			chkbox.setChecked(false);
			VR_Tabbar.find(target)[0].addItem(data);
		}
	});
});