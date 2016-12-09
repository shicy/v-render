define(function ($, VR, Utils) {

	var view = $(".mod-textview");

	var demoIpt1 = VR.Component.TextView.find(view.find(".demo-first"))[0];

	demoIpt1.on("change", function (e, text) {
		console.log("value changed: ", text);
	});

	(function () {
		var demoIpt = VR.Component.TextView.create({target: ".demo-front",
			prompt: "文本输入框提示信息", required: true, empty: "输入框不能为空",
			desc: "该输入框组件由前端动态创建，输入框不能为空", value: "默认文本框内容"});
	})();
});