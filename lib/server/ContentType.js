// ========================================================
// HTTP Content-type（常用）
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var Path = require("path");
var StringUtils = require("../util/StringUtils");


var ContentType = module.exports = {};

// 文档编码
ContentType.charset = "utf-8";

// 默认文档内容
ContentType.defaultType = "text/plain";


var types = {
	".*": "application/octet-stream",
	".ai": "application/postscript",
	".aif": "audio/aiff",
	".apk": "application/vnd.android.package-archive",
	".asf": "video/x-ms-asf",
	".asp": "text/asp",
	".avi": "video/avi",
	".awf": "application/vnd.adobe.workflow",
	".bmp": "application/x-bmp",
	".class": "java/*",
	".css": "text/css",
	".doc": "application/msword",
	".dot": "application/msword",
	".dtd": "text/xml",
	".dwf": "application/x-dwf",
	".exe": "application/x-msdownload",
	".gif": "image/gif",
	".hta": "application/hta",
	".htm": "text/html",
	".html": "text/html",
	".htt": "text/webviewhtml",
	".htx": "text/html",
	".ico": "image/x-icon",
	".img": "application/x-img",
	".java": "java/*",
	".jpe": "image/jpeg",
	".jpeg": "image/jpeg",
	".jpg": "application/x-jpg",
	".js": "application/x-javascript",
	".json": "application/json",
	".jsp": "text/html",
	".ltr": "application/x-ltr",
	".mdb": "application/msaccess",
	".mfp": "application/x-shockwave-flash",
	".mhtml": "message/rfc822",
	".mocha": "application/x-javascript",
	".mp3": "audio/mp3",
	".mp4": "video/mpeg4",
	".ls": "application/x-javascript",
	".net": "image/pnetvue",
	".pdf": "application/pdf",
	".pl": "application/x-perl",
	".png": "application/x-png",
	".ppa": "application/vnd.ms-powerpoint",
	".pps": "application/vnd.ms-powerpoint",
	".ppt": "application/x-ppt",
	".pwz": "application/vnd.ms-powerpoint",
	".r3t": "text/vnd.rn-realtext3d",
	".rjs": "application/vnd.rn-realsystem-rjs",
	".rlc": "application/x-rlc",
	".rm": "application/vnd.rn-realmedia",
	".rmvb": "application/vnd.rn-realmedia-vbr",
	".rtf": "application/msword",
	".rv": "video/vnd.rn-realvideo",
	".stm": "text/html",
	".swf": "application/x-shockwave-flash",
	".svg": "text/xml",
	".tif": "image/tiff",
	".tiff": "image/tiff",
	".torrent": "application/x-bittorrent",
	".tsd": "text/xml",
	".txt": "text/plain",
	".vpg": "application/x-vpeg005",
	".vsd": "application/x-vsd",
	".wav": "audio/wav",
	".wiz": "application/msword",
	".wma": "audio/x-ms-wma",
	".wsdl": "text/xml",
	".xhtml": "text/html",
	".xls": "application/x-xls",
	".xml": "text/xml",
	".xsd": "text/xml",
	".xsl": "text/xml"
};

// 图片类型
var image_types = [".bmp", ".gif", ".ico", ".img", ".jpe", ".jpeg", ".jpg", ".png", ".tif", ".tiff"];

// 文档类型
var doc_types = [".doc", ".dot", ".ppa", ".pps", ".ppt", ".pwz", ".rtf", ".wiz"];

// 文本类型
var txt_types = [".dtd", ".htm", ".html", ".htt", ".htx", ".js", ".jsp", ".mhtml", ".mocha", ".ls", ".stm", 
	".svg", ".tsd", ".txt", ".wsdl", ".xhtml", ".xls", ".xml", ".xsd", ".xsl"];

// 媒体类型
var madia_types = [".avi", ".mfp", ".mp3", ".mp4", ".rm", ".rmvb", ".rv", ".swf", ".wav"];


// 获取文件名对应的文档类型，默认是“text/plain”
ContentType.get = function (filename) {
	// 默认没有点或者点开头的都返回空字符串，加上“_”允许点开头
	var ext = Path.extname("_" + filename);
	var type = StringUtils.isBlank(ext) ? null : types[ext];
	if (!type)
		type = ContentType.defaultType;
	return type + ";charset=" + ContentType.charset;
};

ContentType.getTextContent = function () {
	return "text/plain;charset=" + ContentType.charset;
};

ContentType.getHtmlContent = function () {
	return "text/html;charset=" + ContentType.charset;
};

ContentType.getJsonContent = function () {
	return "application/json;charset=" + ContentType.charset;
};
