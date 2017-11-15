// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2017-07-26
// ========================================================

(function () {
	// 是否显示为移动端应用
	VRender.ENV.isApp = true;
	VRender.ENV.useRem = !!$("html").attr("data-dpr");

	// 初始化 rem 渲染模式
	var initWithREM = function () {
		var dpr = parseInt(window.devicePixelRatio) || 1;
		dpr = Math.min(dpr, 2);

		var scale = 1 / dpr;
		var deviceWidth = document.documentElement.clientWidth * dpr;
		
		var viewport = "width=" + deviceWidth + ",initial-scale=" + scale + 
			",maximum-scale=" + scale + ",minimum-scale=" + scale + ",user-scalable=no";
		$("meta[name='viewport']").attr("content", viewport);

		var html = $("html").attr("data-dpr", dpr);
		// document.body.style.minWidth = 0;
		$(window).resize(function () {
			var width = document.documentElement.clientWidth * dpr;
			var designWidth = parseInt(html.attr("data-mw")) || 640;
			var baseFontSize = width * 100 / designWidth;
			html.css("fontSize", (baseFontSize + "px"));
		}).resize();
	};

	///////////////////////////////////////////////////////
	if (VRender.ENV.useRem)
		initWithREM();
})();