// ========================================================
// 单页面视图，整站只在一个页面上显示，页面的切换不会刷新浏览器，页面主要内容通过动态异步加载实现。
// @author shicy <shicy85@163.com>
// Create on 2016-11-10
// ========================================================

(function () {
	var Utils = VRender.Utils;

	var SinglePage = VRender.plugins.singlepage = function (options) {};

	// 主视图容器，视图变更时，容器外的视图不变
	var pageContainer = $("body");
	// 获取视图方法，根据路由状态获取视图对象(jQuery/html)，
	// 是一个异步回调方法，通过 setViewHandler() 方法设置
	var viewHandler = null;
	// 当前视图路由状态
	var currentState = null;
	// 视图切换时需要保留的视图，以便还原
	var retainedViews = {};

	// 可选的动态视图切换效果
	var animateTypes = ["animate_default"];
	var defaultAnimate = "animate_default";
	
	///////////////////////////////////////////////////////
	SinglePage.init = function (options) {
		if (Utils.isNotBlank(options && options.target))
			pageContainer = $(options.target);
	};

	// 设置视图生成方法，
	// @param handler 获取视图方法，根据 state 获取新的视图对象(jQuery/html)，
	// 		视图通过回调方法返回，型如：function (state, callback) {}
	SinglePage.setViewHandler = function (handler) {
		viewHandler = handler;
	};

	///////////////////////////////////////////////////////
	// 重写 navigate() 方法
	VRender.navigate = function (url, options) {
		if (Utils.isBlank(url))
			return ;

		var state = (typeof url === "string") ? {router: url} : url;
		state = $.extend({}, state, {replace: false, trigger: true, animate: false, retain: false}, options);
		state.trigger = Utils.isTrue(state.trigger);
		state.replace = Utils.isTrue(state.replace);
		state.retain = Utils.isTrue(state.retain);

		VRender.trigger(VRender.event_routerbefore, state); // 这里可以修改 state

		if (Utils.isNotBlank(state.router) && state.isDefaultPrevented !== true) {
			if (state.retain) {
				var name = currentState ? currentState.router : "__root_router";
				retainedViews[name] = pageContainer.children();
			}

			if (state.replace) {
				if (Utils.isFunction(history.replaceState)) {
					history.replaceState(state, state.title, state.router);
					if (state.trigger)
						VRender.trigger(VRender.event_routerchange, state);
				}
				else {
					return window.location.replace(state.router);
				}
			}
			else {
				if (Utils.isFunction(history.pushState)) {
					history.pushState(state, state.title, state.router);
					if (state.trigger)
						VRender.trigger(VRender.event_routerchange, state);
				}
				else {
					return window.location = state.router;
				}
			}

			currentState = state;
		}
	};

	// 页面回退事件
	window.addEventListener("popstate", function () {
		var state = history.state || {};
		state.isPopstate = true;
		VRender.trigger(VRender.event_statepop, state);
		VRender.trigger(VRender.event_routerchange, state);
	});

	///////////////////////////////////////////////////////
	VRender.on(VRender.event_routerchange, function (e, state) {
		var animate = getTransAnimation(state);
		getTransView(state, function (err, view) {
			var reverse = !!state.isPopstate;
			if (Utils.isFunction(animate)) {
				animate(state, pageContainer, view, reverse);
			}
			else if (animate === "animate_default") {
				doDefaultAnimation(state, pageContainer, view, reverse);
			}
			else {
				if (state.retain && !reverse) {
					pageContainer.children().detach();
					pageContainer.append(view);
				}
				else {
					pageContainer.empty().append(view);
				}
			}
		});
	});

	var getTransAnimation = function (state) {
		var animate = state.isPopstate ? currentState.animate : state.animate;
		if (animate === true)
			return defaultAnimate;

		if (Utils.isFunction(animate))
			return animate;

		if (typeof animate === "string") {
			if (animateTypes.indexOf(animate))
				return animate;
		}

		return false;
	};

	var getTransView = function (state, callback) {
		if (state && state.isPopstate) { // 后退操作
			var name = state.router || "__root_router";
			var transView = retainedViews[name];
			if (transView) {
				delete retainedViews[name];
				return callback(false, transView);
			}
		}

		if (Utils.isFunction(viewHandler)) {
			viewHandler(state, function (err, result) {
				callback(false, (!err ? result : ""));
			});
		}
		else {
			VRender.require(state.router, function (err, result) {
				callback(false, (!err ? result : ""));
			});
		}
	};

	// ====================================================
	var doDefaultAnimation = function (state, target, view, reverse) {
		var animateTime = 300;
		target.addClass("singlepage-animate-default do");
		setTimeout(function () {
			if (state.retain && !reverse)
				target.children().detach();
			else
				target.children().remove();
			target.append(view);
			target.removeClass("do");
			setTimeout(function () {
				target.removeClass("singlepage-animate-default");
			}, animateTime);
		}, animateTime);
	};

})();