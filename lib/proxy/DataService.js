// ========================================================
// 后台数据服务对象
// @author shicy <shicy85@163.com>
// Create on 2016-08-24
// ========================================================

var Utils = require("../util/Utils");
var ArrayUtils = require("../util/ArrayUtils");

var propertys = ["default", "domain", "server", "contextPath", "fetchAsPost", "validCode"];


///////////////////////////////////////////////////////////
var DataService = module.exports = function (options) {
	this.init(options || {});
	// console.log(this.services);
};


///////////////////////////////////////////////////////////
DataService.prototype.init = function (options) {
	var services = this.services = [];
	var defaultService = null;

	var service = function (params, parent, domain, pattern) {
		if (!params || (typeof params !== "object"))
			return null;
		var domains = !!domain ? null : (params.domain || null);
		if (domains) {
			domains = String(domains).replace(/\s+/g, "").toLowerCase().split(",");
			for (var i in domains) {
				if (domains[i])
					service(params, parent, domains[i]);
			}
		}
		else if (params.server || params.contextPath) {
			parent = parent || defaultService || {};
			var item = {domain: domain || null};
			item.server = params.server || parent.server || options.server;
			if (item.server) {
				item.contextPath = getContextPath(params, parent);
				item.contentType = getContentType(params, parent);

				item.proxyHost = parent.proxyHost || false;
				if (params.proxyHost === true)
					item.proxyHost = getServerHost(item.server) || false;

				item.beDataFormat = parent.beDataFormat !== false;
				if (params.beDataFormat === false)
					item.beDataFormat = false;

				item.validCode = parent.validCode || 0;
				if (params.validCode || params.validCode === 0)
					item.validCode = parseInt(params.validCode) || 0;

				if (Utils.isNull(params.fetchAsPost) && parent.domain === domain)
					item.fetchAsPost = Utils.isTrue(parent.fetchAsPost);
				else
					item.fetchAsPost = Utils.isTrue(params.fetchAsPost);
				
				item.pattern = pattern ? new RegExp(pattern) : null;
				services.push(item);
			}
			if (!parent.domain) {
				for (var n in params) {
					if (propertys.indexOf(n) < 0)
						service(params[n], item, domain, n);
				}
			}
			return item.server ? item : null;
		}
	};

	defaultService = service(options["default"]);
	if (defaultService) {
		for (var m in options) {
			if (propertys.indexOf(m) < 0)
				service(options[m], defaultService, null, m);
		}
	}
	else {
		defaultService = service(options);
	}

	if (defaultService) {
		defaultService.domain = null;
		this.defaultService = defaultService;
	}
};

// 获取相应的后台数据服务器
// @param domain 指客户端使用的域名，而非 url 使用的域名
// @param url 后台的数据接口地址
DataService.prototype.getService = function (domain, url) {
	if (domain) {
		domain = domain.split(":")[0];
		var services = ArrayUtils.filter(this.services, function (temp) {
			return temp.domain === domain;
		});
		var service = ArrayUtils.find(services, function (temp) {
			return temp.pattern && temp.pattern.test(url);
		});
		if (!service && services.length > 0) {
			service = ArrayUtils.find(services, function (temp) {
				return !temp.pattern;
			});
		}
		return service || this.getService(null, url);
	}
	else {
		var service = ArrayUtils.find(this.services, function (temp) {
			return !temp.domain && temp.pattern && temp.pattern.test(url);
		});
		return service || this.defaultService;
	}
};

///////////////////////////////////////////////////////////
var getServerHost = function (server) {
	if (server) {
		server = server.split("/").pop();
		server = server.split(":")[0];
		if (!Utils.isIP(server))
			return server;
	}
	return null;
};

var getContextPath = function (params, parent) {
	if (params.contextPath) {
		if (!/^\//.test(params.contextPath))
			return "/" + params.contextPath;
		return params.contextPath;
	}
	return parent.contextPath;
};

var getContentType = function (params, parent) {
	if (Utils.isNull(params.contentType))
		return parent.contentType;
	if (params.contentType == "json")
		return "application/json;charset=UTF-8";
	return params.contentType;
}
