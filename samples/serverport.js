// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2016-10-17
// ========================================================

console.log(">>>>>>>")
console.log(">> 设置WEB服务器端口号");
console.log(">> ========================================");
console.log(">> 框架WEB服务器默认端口号8888，使用自定义端口号需设置配置参数server.port");
console.log(">> 如：设置端口号为80，VRender.create().initialize({server: {port: 80}}).run();");
console.log(">> 如果80端口已被占用(Error: listen EACCES)则无法启动，请用其他端口测试");
console.log(">>>");

///////////////////////////////////////////////////////////
var VRender = require("../index");

VRender.create().initialize({server: {port: 80}}).run();
