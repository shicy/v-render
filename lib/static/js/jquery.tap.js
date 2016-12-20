// ========================================================
// 点击事件定义，适用于触摸屏，改善触摸屏的“click”事件
// @author shicy <shicy85@163.com>
// Create on 2016-12-13
// ========================================================

(function () {
	var isTouchable = document.hasOwnProperty("ontouchstart");

	$.fn.tap = function (selector, data, callback, stopPropagation) {
		if (isFunction(selector)) {
			stopPropagation = data;
			callback = selector;
			data = selector = null;
		}
		if (isFunction(data)) {
			stopPropagation = callback;
			callback = data;
			data = selector;
			selector = null;
		}

		if (selector && (typeof selector !== "string")) {
			data = selector;
			selector = null;
		}

		var target = $(this);
		if (isFunction(callback)) {
			var _callback = function (e) {
				if (callback(e) === false || !!stopPropagation)
					return false;
			};
			callback.__tap_handler = _callback;
			if (isTouchable)
				bindTapHandler(target, selector, data, _callback);
			else
				bindClickHandler(target, selector, data, _callback);
		}
		else if (!selector) {
			if (isTouchable)
				target.trigger("touchstart").trigger("touchend", data);
			else 
				target.trigger("click", data);
		}
		return target;
	};

	// $.fn.untap = function (selector, callback) {
	// 	// 未实现
	// };

	///////////////////////////////////////////////////////
	var bindClickHandler = function (target, selector, data, callback) {
		if (selector) {
			if (data)
				target.on("click", selector, data, callback);
			else
				target.on("click", selector, callback);
		}
		else {
			if (data)
				target.on("click", data, callback);
			else 
				target.on("click", callback);
		}
	};

	var bindTapHandler = function (target, selector, data, callback) {
		var startT = 0, startX = 0, startY = 0;

		var start = function (e) {
			if ($(this).is(".disabled"))
				return false;
			startT = new Date().getTime();
			var touch = e.originalEvent && e.originalEvent.changedTouches[0];
			startX = touch ? touch.clientX : 0;
			startY = touch ? touch.clientY : 0;
			return false;
		};

		var end = function (e) {
			var touch = e.originalEvent && e.originalEvent.changedTouches[0];
			touch = touch || {clientX: 0, clientY: 0};
			var x = Math.abs(touch.clientX - startX), y = Math.abs(touch.clientY - startY);
			if (x < 6 && y < 6 && (new Date().getTime() - startT < 2000))
				return callback(e);
		};

		if (selector) {
			target.on("touchstart", selector, start);
			if (data)
				target.on("touchend", selector, data, end);
			else
				target.on("touchend", selector, end);
		}
		else {
			target.on("touchstart", start);
			if (data)
				target.on("touchend", data, end);
			else
				target.on("touchend", end);
		}
	};

	var isFunction = function (obj) {
		return obj && (typeof obj === "function");
	};

})();
