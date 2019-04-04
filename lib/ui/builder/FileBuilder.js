// ========================================================
// 脚本、样式等资源文件构建
// 
// 输入：[{path: "原路径", attributes: {group, index, ..}}]
//   其中：path为构建前的原路径，如“/VRender...”，“webroot:///images/..”，“file:///var/..”
// 
// 输出：[{path: "目录路径", uri: "", attributes: {}}]
// 
// @author shicy <shicy85@163.com>
// Create on 2019-04-02
// ========================================================

var FileBuilder = module.exports;

///////////////////////////////////////////////////////////
FileBuilder.build = function (context, srcFiles, type) {
	console.log("1111111 >>", type, srcFiles);

};