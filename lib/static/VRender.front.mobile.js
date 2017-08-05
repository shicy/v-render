// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2017-07-26
// ========================================================

(function () {
	// 初始化 rem 渲染模式
	var initWithREM = function () {
		var dpr = window.devicePixelRatio || 1;
		var html = $("html").attr("data-dpr", dpr);

		var scale = 1 / dpr;
		var viewport = "initial-scale=" + scale + 
			",maximum-scale=" + scale + ",minimum-scale=" + scale + ",user-scalable=no";
		$("meta[name='viewport']").attr("content", viewport);

		$(window).resize(function () {
			var width = document.documentElement.clientWidth * dpr;
			// width = width > 1280 ? 1280 : width; // 

			var designWidth = parseInt(html.attr("data-mw")) || 640;

			var baseFontSize = width * 100 / designWidth;
			html.css("fontSize", (baseFontSize + "px"));
		}).resize();
	};

	///////////////////////////////////////////////////////
	$(function () {
		if ($("html").attr("data-dpr")) {
			initWithREM();
		}
	});
})();