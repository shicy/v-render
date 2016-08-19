// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2016-08-15
// ========================================================

console.log(">>>>>>>")
console.log(">> 开启服务（默认）");
console.log(">> ========================================");
console.log(">> 引用：var VRender = require('v-render');");
console.log(">> 默认方式开启服务：VRender.create().initialize().run();");
console.log(">>>>>>>");

///////////////////////////////////////////////////////////
var VRender = require("../index");

VRender.create().initialize().run();
