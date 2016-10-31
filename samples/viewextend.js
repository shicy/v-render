// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2016-10-31
// ========================================================

console.log(">>>>>>>")
console.log(">> 视图继承设计");
console.log(">> ========================================");
console.log(">> View.extend(module, {})");
console.log(">>>");

///////////////////////////////////////////////////////////
var VRender = require("../index");
var MyFirstView = require("./views/MyFirstView");
var MySecondView = require("./views/MySecondView");

var vRender = VRender.create().initialize().run();

vRender.once("ready", function () {
	console.log("");
	console.log("==== MyFirstView ==========================");
	var myFirst = new MyFirstView(vRender);
	console.log(">> styles:");
	console.log(myFirst.getStyleFiles());
	console.log(">> scripts:");
	console.log(myFirst.getScriptFiles());

	console.log("");
	console.log("==== MySecondView ========================");
	var mySecond = new MySecondView(vRender);
	console.log(">> styles:");
	console.log(mySecond.getStyleFiles());
	console.log(">> scripts:");
	console.log(mySecond.getScriptFiles());
});
