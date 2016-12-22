// ========================================================
// 分页组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-20
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIPaginator = VRender.UIPaginator;

var ModulePaginator = ModuleBase.extend(module, {
	className: "mod-paginator",

	getCompName: function () {
		return "UIPaginator";
	},

	getSubName: function () {
		return "分页";
	},

	getDescription: function () {
		return "分页通常适用于查询应用，根据总记录数、页大小和当前页显示分页信息，提供给用户分页切换的功能。";
	},

	renderView: function () {
		ModulePaginator.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.append(new UIPaginator(this));
		demoView.append(new UIPaginator(this, {total: 0, size: 20, page: 5}));
		demoView.append(new UIPaginator(this, {total: 99, size: 20, page: 1}));
		demoView.append(new UIPaginator(this, {total: 99, size: 20, page: 10}));
		demoView.append(new UIPaginator(this, {total: 26230, size: 45, page: 3}));

		var source = [];
		source.push("new UIPaginator(this); // 组件默认");
		source.push("new UIPaginator(this, {total: 0, size: 20, page: 5});");
		source.push("new UIPaginator(this, {total: 99, size: 20, page: 1});");
		source.push("new UIPaginator(this, {total: 99, size: 20, page: 10});");
		source.push("new UIPaginator(this, {total: 26230, size: 45, page: 3});");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("VRender.Component.Paginator.create({" +
			"target: '.demo-front', total: 133, size: 15, page: 6});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("显示分页状态信息");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.append(new UIPaginator(this, {total: 123, status: true}));
		demoView.append(new UIPaginator(this, {total: 123, page: 2,
			status: "共{totalCount}条数据 当前第{pageNo}/{pageCount}页({pageStart}-{pageEnd})"}));

		var source = [];
		source.push("new UIPaginator(this, {total: 123, status: true}); " +
			"// 默认显示: 共{totalCount}条");
		source.push("new UIPaginator(this, {total: 123, page: 2, " +
			"\n\tstatus: '共{totalCount}条数据 当前第{pageNo}/{pageCount}页({pageStart}-{pageEnd})'});");

		this.showDemo(section, demoView, source);
	}
});

ModulePaginator.import("./front/paginator.js");
