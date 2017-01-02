// ========================================================
// 框架设计文档路由适配器
// @author shicy <shicy85@163.com>
// Create on 2017-01-01
// ========================================================

var VRender = require(__vrender__);


var RouterAdapter = module.exports = function (context) {
	this.context = context;
};


// 客户端数据服务接口处理方法，如：“~/api?n=?&data={}”的请求会执行该方法
// @param name 服务或接口名称
// @param params 参数集，包含：session, data等
// @param callback 回调方法，型如：function (state, data) {}，
//        原则上只返回接口数据，允许返回 html 文档或文件路径
// @return 为 true 时表示接口请求被接管，必须执行callback()方法；为 false 时表示请求未受理
RouterAdapter.prototype.action = function (name, params, callback) {
	if (name === "demo.datas.musics") {
		callback({code: 0, data: {
			total: data_musics.length, 
			rows: getPageDatas(data_musics, params.data)
		}});
		return true;
	}
	return false;
};

// 路由方法，根据路由名称获取视图文件路径，路径相对于config.cwd
// @param name 当前路由名称，已经过 before() 方法转换
// @param params 参数集，包含session, data等
// @param path 在config.router.map配置中获得的视图路径，该方法可以做进一步处理
// @param callback 回调方法，返回路由状态和新的视图路径，型如：function (state, newpath) {}
// @return 为 true 时表示文件请求被接管，必须执行callback()方法；为 false 时表示请求未受理
RouterAdapter.prototype.router = function (name, params, path, callback) {
	var names = name.substr(1).split("/");
	if (names[1] === "components") {
		if (names[2] === "module")
			callback(VRender.RouterStatus.OK, ("./docs/components/ModuleView"));
		else
			callback(VRender.RouterStatus.OK, "./docs/components");
		return true;
	}
	return false;
};

// ========================================================
var getPageDatas = function (datas, params) {
	var results = [];
	if (datas && datas.length > 0) {
		var pageNo = parseInt(params.page) || 1;
		var pageSize = parseInt(params.rows) || 20;
		var start = (pageNo - 1) * pageSize;
		var end = Math.min((start + pageSize), datas.length);
		for (var i = start, l = datas.length; i < end; i++) {
			results.push(datas[i]);
		}
	}
	return results;
};

///////////////////////////////////////////////////////////
var data_musics = [];
data_musics.push({id: 7926593, name: "Song From A Secret Garden", singer: "Secret Garden", 
	album: "Song From A Secret Garden", singerId: 177878});
data_musics.push({id: 1990280, name: "献给爱丽丝", singer: "贝多芬", album: null});
data_musics.push({id: 1141248, name: "明天我要嫁给你", singer: "王菲", album: "王菲最精采的演唱会", singerId: 45561});
data_musics.push({id: 266322598, name: "告白气球", singer: "周杰伦", album: "周杰伦的床边故事", singerId: 7994});
data_musics.push({id: 242078437, name: "演员", singer: "薛之谦", album: "初学者", singerId: 2517});
data_musics.push({id: 490468, name: "独角戏", singer: "许茹芸", album: "如果云知道", singerId: 1204});
data_musics.push({id: 285100730, name: "远方的远方还是远方", singer: "凤凰传奇", album: "远方的远方还是远方", singerId: 1490});
data_musics.push({id: 291241, name: "甜蜜蜜", singer: "邓丽君", album: "甜蜜蜜", singerId: 1091});
data_musics.push({id: 277580289, name: "你在就好", singer: "崔子格", album: "你在就好", singerId: 1224778});
data_musics.push({id: 7320512, name: "偏偏喜欢你", singer: "陈百强", album: "世纪10星 - 永恒篇", singerId: 2707});
data_musics.push({id: 272952711, name: "下完这场雨", singer: "后弦", album: "下完这场雨", singerId: 1273});
