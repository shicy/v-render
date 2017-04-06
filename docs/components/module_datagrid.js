// ========================================================
// 数据表格组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIDatagrid = VRender.UIDatagrid;
var UIPaginator = VRender.UIPaginator;

var ModuleDatagrid = ModuleBase.extend(module, {
	className: "mod-datagrid",

	doInit: function () {
		ModuleDatagrid.__super__.doInit.call(this);

		var datas = this.dataSource = [];
		datas.push({id: 1, name: '快手枪手快枪手', desc: '林更新爆笑夺宝大冒险', 
			actor: '林更新 / 张静初 / 锦荣 / 刘晓庆', director: '潘安子', year: 2016, 
			score: 8.2, type: '动作、喜剧', date: '2016-7-15', 
			shortName: 'For A Few Bullets', company: '五洲电影发行有限公司'});
		datas.push({id: 2, name: '废柴特工', desc: '废宅青年拯救美国', 
			actor: '杰西·艾森伯格 / 克里斯汀·斯图尔特 / 约翰·雷吉扎莫', director: '尼玛·诺里扎德', 
			year: 2015, score: 7.7, type: '动作、喜剧', date: '2015-8-21', 
			shortName: 'American Ultra', company: '电影国度娱乐公司'});
		datas.push({id: 3, name: '宅女侦探桂香', desc: '王珞丹周渝民斗智斗勇', 
			actor: '王珞丹 / 周渝民 / 任达华 / 天心 / 邵美琪', director: '彭顺', year: 2015, 
			score: 7.4, type: '侦探，爱情', date: '2015-8-13', 
			shortName: 'Detective Lady', compnay: '福建恒业电影发行有限公司'});
	},

	getViewData: function () {
		return this.dataSource;
	},

	getCompName: function () {
		return "UIDatagrid";
	},

	getSubName: function () {
		return "数据表格";
	},

	getDescription: function () {
		return "网状数据表格组件，用于显示一个数据集，按行列方式显示每个数据的相应属性值。";
	},

	renderView: function () {
		ModuleDatagrid.__super__.renderView.call(this);
		this.showMessage(this.$el, "数据源说明", 
			"该说明文档使用统一测试数据集，<span style='color:red;'>请查看页面底部</span>。", "info");
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		this.showDemo4();
		this.showDemo5();
		this.showDemo6();
		this.showDemo7();
		this.showDemo8();
		this.showDemo9();
		this.showDemo0();
	},

	showDemo0: function () {
		var section = this.appendSection("测试数据源");

		var source = [];
		source.push("var datas = [];");
		source.push("datas.push({id: 1, \n\tname: '快手枪手快枪手', \n\tdesc: '林更新爆笑夺宝大冒险', " +
			"\n\tactor: '林更新 / 张静初 / 锦荣 / 刘晓庆', \n\tdirector: '潘安子', \n\tyear: 2016, " +
			"\n\tscore: 8.2, \n\ttype: '动作、喜剧', \n\tdate: '2016-7-15', " +
			"\n\tshortName: 'For A Few Bullets', \n\tcompany: '五洲电影发行有限公司'});");
		source.push("datas.push({id: 2, \n\tname: '废柴特工', \n\tdesc: '废宅青年拯救美国', " +
			"\n\tactor: '杰西·艾森伯格 / 克里斯汀·斯图尔特 / 约翰·雷吉扎莫', \n\tdirector: '尼玛·诺里扎德', " +
			"\n\tyear: 2015, \n\tscore: 7.7, \n\ttype: '动作、喜剧', \n\tdate: '2015-8-21', " +
			"\n\tshortName: 'American Ultra', \n\tcompany: '电影国度娱乐公司'});");
		source.push("datas.push({id: 3, \n\tname: '宅女侦探桂香', \n\tdesc: '王珞丹周渝民斗智斗勇', " +
			"\n\tactor: '王珞丹 / 周渝民 / 任达华 / 天心 / 邵美琪', \n\tdirector: '彭顺', \n\tyear: 2015, " +
			"\n\tscore: 7.4, \n\ttype: '侦探，爱情', \n\tdate: '2015-8-13', " +
			"\n\tshortName: 'Detective Lady', \n\tcompnay: '福建恒业电影发行有限公司'});");

		this.showDemo(section, null, source);
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var columns = [];
		columns.push({name: "id", title: "编号"});
		columns.push({name: "name", title: "名称"});
		columns.push({name: "desc", title: "备注"});
		columns.push({name: "actor", title: "主演"});
		var demoView = new UIDatagrid(this, {columns: columns, 
			data: this.dataSource, empty: "没有数据信息"});

		var source = [];
		source.push("var columns = [];");
		source.push("columns.push({name: 'id', title: '编号'});");
		source.push("columns.push({name: 'name', title: '名称'});");
		source.push("columns.push({name: 'desc', title: '备注'});");
		source.push("columns.push({name: 'actor', title: '主演'});");
		source.push("new UIDatagrid(this, {columns: columns, data: datas});");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("var columns = [];");
		source.push("columns.push({name: 'id', title: '编号'});");
		source.push("columns.push({name: 'name', title: '名称'});");
		source.push("columns.push({name: 'desc', title: '备注'});");
		source.push("columns.push({name: 'actor', title: '主演'});");
		source.push("VRender.Component.Datagrid.create({" +
			"target: '.demo-front', columns: columns, data: datas});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("显示复选框及多选", "设置属性" +
			"<code>{chkbox: true}</code>显示表格的复选框列，表格默认为单选，设置属性" +
			"<code>{multi: true}</code>使用表格支持多选。");

		var demoView = new UIGroup(this, {gap: 10});
		var columns = [];
		columns.push({name: "name", title: "名称"});
		columns.push({name: "actor", title: "主演"});
		columns.push({name: "date", title: "上映时间", type: "date"});
		demoView.append("<div class='demo-title'>单选数据表</div>");
		demoView.append(new UIDatagrid(this, {columns: columns, data: this.dataSource,
			chkbox: true}));
		demoView.append("<div class='demo-title'>多选数据表，点击复选框可多选</div>");
		demoView.append(new UIDatagrid(this, {columns: columns, data: this.dataSource,
			chkbox: true, multi: true}));

		var source = [];
		source.push("var columns = [];");
		source.push("columns.push({name: 'name', title: '名称'});");
		source.push("columns.push({name: 'actor', title: '主演'});");
		source.push("columns.push({name: 'date', title: '上映时间', type: 'date'});");
		source.push("new UIDatagrid(this, {columns: columns, data: datas, chkbox: true});");
		source.push("new UIDatagrid(this, {columns: columns, data: datas, chkbox: true, multi: true});");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("空白表格", "当表格没有数据的时候，" +
			"显示一个空白的默认页面，设置属性<code>empty</code>指定空白页面内容。");

		var demoView = new UIGroup(this, {gap: 10});
		var columns = [];
		columns.push({name: "name", title: "名称"});
		columns.push({name: "actor", title: "主演"});
		columns.push({name: "year", title: "年份"});
		demoView.append("<div class='demo-title'>默认不显示空白信息</div>");
		demoView.append(new UIDatagrid(this, {columns: columns}));
		demoView.append("<div class='demo-title'>自定义文本空白信息</div>");
		demoView.append(new UIDatagrid(this, {columns: columns, 
			empty: "空白表格显示一个文本信息"}));
		demoView.append("<div class='demo-title'>显示空白的视图，带交互功能</div>");
		demoView.append(new UIDatagrid(this, {columns: columns, 
			empty: "<div style='font-size:20px;'><img src='/theme/icons/empty.png'/><div " +
				"style='margin-bottom:20px;'>点击 <a>新建</a> 影片信息</div></div>"}));

		var source = [];
		source.push("var columns = [];");
		source.push("columns.push({name: 'name', title: '名称'});");
		source.push("columns.push({name: 'actor', title: '主演'});");
		source.push("columns.push({name: 'year', title: '年份'});");
		source.push("new UIDatagrid(this, {columns: columns});");
		source.push("new UIDatagrid(this, {columns: columns, " +
			"empty: '空白表格显示一个文本信息'});");
		source.push("new UIDatagrid(this, {columns: columns, " +
			"empty: '<div style=\"font-size:20px;\">\' +" +
			"\n\t\'<img src=\"/theme/icons/empty.png\"/>\' +" +
			"\n\t\'<div style=\"margin-bottom:20px;\">点击<a>新建</a>影片信息</div>\' +" +
			"\n\t\'</div>'});");

		this.showDemo(section, demoView, source);
	},

	showDemo5: function () {
		var section = this.appendSection("项渲染器", "自定义项渲染器，" +
			"该组件允许按开发者的意愿渲染单元格。设置属性<code>renderer</code>" +
			"指定一个项渲染器方法，改方法接收参数：<code>columnName</code>, " +
			"<code>rowData</code>, <code>rowIndex</code>, <code>column</code>，返回单元格的视图。");

		this.showMessage(section, "项渲染器注意事项", "项渲染器返回值决定相应单元格的显示内容，" +
			"当返回值为空(<code>null</code>或<code>undefined</code>)时，使用组件内默认渲染器显示内容。", 
			"warn");

		var demoView = new UIGroup(this);
		var columns = [];
		columns.push({name: "name", title: "名称"});
		columns.push({name: "actor", title: "主演"});
		columns.push({name: "desc", title: "备注"});
		columns.push({name: "year", title: "年份"});
		columns.push({name: "op", title: "操作"});
		var columnRenderer = function (name, data) {
			if (name === "op")
				return "<a name='detail'>详情</a>";
			if (name === "name")
				return data.name + "(" + parseFloat(data.score).toFixed(1) + "分)";
			if (name === "year")
				return data.year + "年";
			if (name === "desc")
				return "<span style='color:gray;'>" + data.desc + "</span>";
		};
		demoView.append(new UIDatagrid(this, {columns: columns, 
			data: this.dataSource, renderer: columnRenderer}));

		var source = [];
		source.push("var columns = [];");
		source.push("columns.push({name: 'name', title: '名称'});");
		source.push("columns.push({name: 'actor', title: '主演'});");
		source.push("columns.push({name: 'desc', title: '备注'});");
		source.push("columns.push({name: 'year', title: '年份'});");
		source.push("columns.push({name: 'op', title: '操作'});");
		source.push("// ---------------------------------------------");
		source.push("var columnRenderer = function (name, data) {");
		source.push("\tif (name === \"op\")\n\t\treturn \"<a name='detail'>详情</a>\";");
		source.push("\tif (name === \"name\")" +
			"\n\t\treturn data.name + \"(\" + parseFloat(data.score).toFixed(1) + \"分)\";");
		source.push("\tif (name === \"year\")\n\t\treturn data.year + \"年\"");
		source.push("\tif (name === \"desc\")" +
			"\n\t\treturn \"<span style='color:gray;'>\" + data.desc + \"</span>\";");
		source.push("};");
		source.push("// ---------------------------------------------");
		source.push("new UIDatagrid(this, {columns: columns, data: datas, " +
			"renderer: columnRenderer});");

		this.showDemo(section, demoView, source);
	},

	showDemo6: function () {
		var section = this.appendSection("操作列的点击事件", 
			"名称为<code>op</code>的列认为是操作列，建议将操作列放在行末尾，其中每一个操作对应一个" +
			"<code>a</code>标签，如：<code>&lt;a name='detail'&gt;详情&lt;/a&gt;</code>，" +
			"绑定组件的<code>oper</code>可以监听操作项的点击事件。");

		this.showMessage(section, "操作列事件说明", "操作点击事件属于浏览器端操作，" +
			"因此事件绑定需要在前端脚本中处理。", "warn");

		var demoView = new UIGroup(this, {cls: "demo-oper"});
		var columns = [];
		columns.push({name: "name", title: "名称"});
		columns.push({name: "actor", title: "主演"});
		columns.push({name: "op", title: "操作"});
		var columnRenderer = function (name, data) {
			if (name === "op")
				return "<a name='detail'>详情</a><a name='eval'>评价</a>";
		};
		var dataMapper = function (data) {
			return {id: data.id, name: data.name};
		};
		demoView.append(new UIDatagrid(this, {columns: columns, data: this.dataSource,
			renderer: columnRenderer, dataMapper: dataMapper}));

		var source = [];
		source.push("// 前端获取组件实例");
		source.push("var datagrid = VRender.Component.Datagrid.find('.demo-oper')[0];");
		source.push("// 绑定操作点击事件");
		source.push("datagrid.on('oper', function (name, data) {");
		source.push("\tif (name === 'detail')\n\t\talert('您点击了\' + data.name + \'的详情');");
		source.push("\telse if (name === 'eval')\n\t\talert('您点击了\' + data.name + \'的评价信息');");
		source.push("});");

		this.showDemo(section, demoView, source);
	},

	showDemo7: function () {
		var section = this.appendSection("隐藏表头", "设置属性<code>{showHeader: false}</code>" +
			"可以将表头隐藏掉。");

		var columns = [];
		columns.push({name: "name", title: "名称"});
		columns.push({name: "actor", title: "主演"});
		columns.push({name: "desc", title: "备注"});
		var demoView = new UIDatagrid(this, {columns: columns, data: this.dataSource,
			showHeader: false});

		var source = [];
		source.push("var columns = [];");
		source.push("columns.push({name: 'name', title: '名称'});");
		source.push("columns.push({name: 'actor', title: '主演'});");
		source.push("columns.push({name: 'desc', title: '备注'});");
		source.push("new UIDatagrid(this, {columns: columns, data: datas, showHeader: false});");

		this.showDemo(section, demoView, source);
	},

	showDemo8: function () {
		var section = this.appendSection("设置默认选择项", "显示表格的时候使某几个数据处于选中状态。" +
			"属性<code>selectedId|selectedIds</code>设置选中的数据编号集，配合<code>idField</code>" +
			"属性一起使用；属性<code>selectedItem|selectedItems</code>设置选中的数据项；属性" +
			"<code>selectedIndex|selectedIndexs</code>设置相应索引的数据选中。");

		var demoView = new UIGroup(this, {gap: 10});
		var columns = [];
		columns.push({name: "id", title: "编号"});
		columns.push({name: "name", title: "名称"});
		columns.push({name: "actor", title: "主演"});
		columns.push({name: "desc", title: "备注"})
		demoView.append("<div class='demo-title'>按索引选择</div>");
		demoView.append(new UIDatagrid(this, {columns: columns, data: this.dataSource,
			selectedIndex: [0, 2], chkbox: true, multi: true}));
		demoView.append("<div class='demo-title'>按编号选择</div>");
		demoView.append(new UIDatagrid(this, {columns: columns, data: this.dataSource,
			selectedId: [2, 3], chkbox: true, multi: true}));
		demoView.append("<div class='demo-title'>按对象选择</div>");
		demoView.append(new UIDatagrid(this, {columns: columns, data: this.dataSource,
			selectedItem: this.dataSource[1], chkbox: true, multi: true}));
		demoView.append("<div class='demo-title'>按名称选择</div>");
		demoView.append(new UIDatagrid(this, {columns: columns, data: this.dataSource,
			selectedId: "宅女侦探桂香", idField: "name"}));

		var source = [];
		source.push("var columns = [];");
		source.push("columns.push({name: 'id', title: '编号'});");
		source.push("columns.push({name: 'name', title: '名称'});");
		source.push("columns.push({name: 'actor', title: '主演'});");
		source.push("columns.push({name: 'desc', title: '备注'});");
		source.push("// ---------------------------------------------");
		source.push("new UIDatagrid(this, {columns: columns, data: datas, selectedIndex: [0,2], chkbox: true, multi: true});");
		source.push("// ---------------------------------------------");
		source.push("new UIDatagrid(this, {columns: columns, data: datas, selectedId: [2,3], chkbox: true, multi: true});");
		source.push("// ---------------------------------------------");
		source.push("new UIDatagrid(this, {columns: columns, data: datas, selectedItem: datas[1], chkbox: true, multi: true});");
		source.push("// ---------------------------------------------");
		source.push("new UIDatagrid(this, {columns: columns, data: datas, selectedId: '宅女侦探桂香', idField: 'name'});");

		this.showDemo(section, demoView, source);
	},

	showDemo9: function () {
		var section = this.appendSection("动态数据及分页");

		var columns = [];
		columns.push({name: "name", title: "名称"});
		columns.push({name: "singer", title: "歌手"});
		columns.push({name: "album", title: "专辑"});

		var demoView = new UIGroup(this);
		var grid = demoView.addChild(new UIDatagrid(this, {columns: columns, apiName: "demo.datas.musics",
			multi: true, selectedIndex: [0, 2]}));
		var pager = demoView.addChild(new UIPaginator(this, {size: 3, status: true}));
		grid.setPaginator(pager);

		var source = [];
		source.push("var columns = [];");
		source.push("columns.push({name: 'name', title: '名称'});");
		source.push("columns.push({name: 'singer', title: '歌手'});");
		source.push("columns.push({name: 'album', title: '专辑'});");
		source.push("var grid = new UIDatagrid(this, {columns: columns, apiName: 'demo.datas.musics', " +
			"\n\tselectedIndex: [0, 2], multi: true});");
		source.push("grid.setPaginator(new UIPaginator(this, {size: 3, status: true}));");

		this.showDemo(section, demoView, source);
	}
});

ModuleDatagrid.import("./front/datagrid.js");
