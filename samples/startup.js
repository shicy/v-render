// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2016-08-15
// ========================================================

console.log(">>>>>>>")
console.log(">> 开启服务（默认）");
console.log(">> ========================================");
console.log(">> 引用：var VRender = require('v-render');");
console.log(">> 默认方式开启服务：VRender.create().initialize().run();");
console.log(">> 打开浏览器输入http://localhost:8888，了解更多关于VRender的使用方法。");
console.log(">>>");

///////////////////////////////////////////////////////////
var VRender = require("../index");

VRender.create().initialize().run();
