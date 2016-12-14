// ========================================================
// 模块视图基类
// @author shicy <shicy85@163.com>
// Create on 2016-11-15
// ========================================================

var Prism = require("prismjs");
var VRender = require("../../index");


var Utils = VRender.Utils;
var UIGroup = VRender.UIGroup;
var UIText = VRender.UIText;

var ModuleBase = VRender.UIView.extend(module, {
	// 获取组件名称
	getCompName: function () {
		// 子类继承
	},

	// 获取组件子标题名称
	getSubName: function () {
		// 子类继承
	},

	// 获取组件描述信息，返回html源码
	getDescription: function () {
		// 子类继承
	},

	renderView: function () {
		ModuleBase.__super__.renderView.call(this);
		this.$el.addClass("comp-mod-base");

		this.renderCompInfos(this.$el);
	},

	// 渲染组件基本信息
	renderCompInfos: function (target) {
		var infos = new UIGroup(this, {cls: "compinfos"});

		var title = infos.addChild(new UIGroup(this, {cls: "title"}));
		var compName = this.getCompName();
		if (Utils.isNotBlank(compName))
			title.append(new UIText(this, {cls: "name", text: compName}));
		var subName = this.getSubName();
		if (Utils.isNotBlank(subName))
			title.append(new UIText(this, {cls: "subname", text: subName}));

		var description = this.getDescription();
		if (Utils.isNotBlank(description))
			infos.append("<div class='desc'>" + description + "</div>");

		infos.render(target);
	},

	// 渲染警告信息窗口
	// type：warn, danger, 默认danger
	showMessage: function (target, title, text, type) {
		if (!/danger|warn|info/.test(type))
			type = "danger";

		var msgbox = VRender.$("<div class='msgbox'></div>").appendTo(target || this.$el);
		msgbox.addClass(type);

		if (Utils.isNotBlank(title))
			msgbox.append("<div class='title'>" + title + "</div>");
		if (Utils.isNotBlank(text))
			msgbox.append("<div class='msg'>" + text + "</div>");

		return msgbox;
	},

	// 渲染实例章节
	appendSection: function (title, description, name) {
		var section = VRender.$("<section></section>").appendTo(this.$el);
		if (Utils.isNotBlank(title))
			section.append("<h3>" + title + "</h3>");
		if (Utils.isNotBlank(description))
			section.append("<div class='desc'>" + description + "</div>");
		return section;
	},

	// 展示组件事例
	showDemo: function (target, demoView, source) {
		var demo = VRender.$("<div class='demo'></div>").appendTo(target || this.$el);
		if (Utils.isNotBlank(demoView)) {
			new UIGroup(this, {cls: "preview"}).append(demoView).render(demo);
		}
		if (Utils.isNotBlank(source)) {
			if (Utils.isArray(source))
				source = source.join("\n");
			source = Prism.highlight(source, Prism.languages.javascript)
			demo.write("<div class='source'><pre>" + source + "</pre></div>");
		}
	}

});
