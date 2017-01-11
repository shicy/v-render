define(function ($, VR, Utils) {
	var view = $(".mod-dialog");

	view.on("click", ".demo2 button", function (e) {
		var dialog = VR.Component.Dialog.create({content: "这是前端创建的对话框"});
	});

	view.on("click", ".demo3 button", function (e) {
		var content = $("<div></div>");
		VR.Component.TextView.create({target: content, prompt: "请输入"});
		VR.Component.DateInput.create({target: content});
		VR.Component.Dialog.create({content: content});
	});

	view.on("click", ".demo4 .ui-btn", function (e) {
		var name = $(e.currentTarget).attr("name");
		if (name === "btn1")
			VR.Component.Dialog.create({title: "自动缩放", content: "随着内容的大小自动调整对话框大小"});
		else if (name === "btn2")
			VR.Component.Dialog.create({title: "固定中等大小", style: "normal"});
		else if (name === "btn3")
			VR.Component.Dialog.create({title: "最大化", style: "full"});
		else if (name === "btn4")
			VR.Component.Dialog.create({title: "内容填充无边距", style: "fill", content: "无边距，内容靠边显示"});
	});

});
