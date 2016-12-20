define(function ($, VR, Utils) {
	var view = $(".mod-datagrid");
	var viewData = view.data("viewData"); console.log(viewData);

	(function () { // 前端创建
		var columns = [];
		columns.push({name: "id", title: "编号"});
		columns.push({name: "name", title: "名称"});
		columns.push({name: "desc", title: "备注"});
		columns.push({name: "actor", title: "主演"});
		var frontGrid = VR.Component.Datagrid.create({
			target: view.find(".demo-front"), columns: columns, data: viewData
		});
	})();

	(function () { // 绑定“oper”事件
		var datagrid = VR.Component.Datagrid.find(".demo-oper")[0];
		datagrid && datagrid.on("oper", function (e, name, data) {
			if (name === "detail")
				alert("您点击了“" + data.name + "”的详情");
			else if (name === "eval")
				alert("您点击了“" + data.name + "”的评价");
		});
	})();

});
