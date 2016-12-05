// ========================================================
// 网页局部，嵌套在网页中可异步加载的内容
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var StringUtils = require("../util/StringUtils");
var ArrayUtils = require("../util/ArrayUtils");
var VRender = require("../v-render");
var UIView = require("./UIView");


var Fragment = UIView.extend(module, {
	addScript: function (value) {
		if (!ArrayUtils.isArray(this._scripts))
			this._scripts = [];
		this._scripts.push(value);
	},

	render: function (output) {
		Fragment.__super__.render.call(this, output);

		var tagid = VRender.uuid();
		var target = this.$el.appendAndGet("<script vid='" + tagid + "' class='vrender-fragment-script'></script>");

		target.write("$(function(){");

		// components init
		target.write("VRender.Component.build('[vid=" + this.getViewId() + "]');");

		// imports
		if (!this.getViewOwner()) {
			var files = ArrayUtils.pushAll([], this.getMergedStyleFiles(), this.getMergedScriptFiles());
			if (files.length > 0)
				target.write("VRender.load('[vid=" + this.getViewId() + "]'," + JSON.stringify(files) + ");");
		}

		// render scripts
		ArrayUtils.each(this._scripts, function (script) {
			if (StringUtils.isNotBlank(script))
				target.write(script);
		});

		target.write("$('[vid=" + tagid + "]').remove();");
		target.write("});");
	}
});
