// ========================================================
// 分页
// @author shicy <shicy85@163.com>
// Create on 2018-01-26
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.paginator)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	var defaultPageSize = 20;
	var defaultShowNum = 10;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	Renderer.getMode = function (value) {
		if (value === false)
			return false;
		if (value == "spread" || value == "dropdown")
			return value;
		return "normal";
	};

	Renderer.getShowNum = function (value) {
		value = parseInt(value) || 0;
		return value > 0 ? value : defaultShowNum;
	};

	Renderer.getSizes = function (value) {
		if (value) {
			var values = [];
			Utils.each(Utils.toArray(value), function (tmp) {
				tmp = parseInt(tmp) || 0;
				if (tmp > 0 && values.indexOf(tmp) < 0)
					values.push(tmp);
			});
			return values.length > 0 ? values : null;
		}
		return null;
	};

	Renderer.getStatus = function (value) {
		if (value === true)
			return "_default";
		if (value === false)
			return null;
		return Utils.trimToNull(value);
	};

	Renderer.getSkip = function (value) {
		if (Utils.isNull(value) || value === true)
			return "1";
		if (Utils.isArray(value)) {
			return Utils.trimToEmpty(value[0]) + "♮" + Utils.trimToEmpty(value[1]);
		}
		return null;
	};

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-paginator");

		var pageInfo = getPageInfos.call(this);

		target.attr("data-no", pageInfo.pageNo);
		target.attr("data-size", pageInfo.pageSize);
		target.attr("data-pages", pageInfo.pageCount);
		target.attr("data-total", pageInfo.totalCount);

		target.attr("opt-mode", pageInfo.mode || "");
		target.attr("opt-nums", pageInfo.showNum);
		if (pageInfo.status)
			target.attr("opt-status", pageInfo.status);
		if (pageInfo.skip)
			target.attr("opt-skip", pageInfo.skip);
		if (pageInfo.pageSizes.length > 1)
			target.attr("opt-sizes", pageInfo.pageSizes.join(","));

		renderView.call(this, $, target, pageInfo);

		if (backend) {
			var buttons = this.options.buttons;
			if (buttons === false)
				target.attr("opt-btns", "");
			else if (buttons !== true) {
				if (Utils.isNotBlank(buttons))
					target.attr("opt-btns", JSON.stringify(buttons));
			}
		}
	};

	// ====================================================
	_Renderer._getButtons = function () {
		return this.options.buttons;
	};

	// ====================================================
	var renderView = function ($, target, pageInfo) {
		var pagebar = $("<div class='pagebar'></div>").appendTo(target);
		renderPageBar.call(this, $, target, pagebar, pageInfo);

		if (!this.isRenderAsApp()) {
			if (pageInfo.pageSizes.length > 1) {
				var sizebar = $("<div class='sizebar'></div>").appendTo(target);
				renderPageSizeBar.call(this, $, target, sizebar, pageInfo);
			}

			if (Utils.isNotBlank(pageInfo.status)) {
				var statusbar = $("<div class='statusbar'></div>").appendTo(target);
				renderPageStatusBar.call(this, $, target, statusbar, pageInfo);
			}

			if (Utils.isNotBlank(pageInfo.skip)) {
				var skipbar = $("<div class='skipbar'></div>").appendTo(target);
				renderPageSkipBar.call(this, $, target, skipbar, pageInfo);
			}
		}
	};

	var renderPageBar = function ($, target, container, pageInfo) {
		var firstBtn = getButtonLabel.call(this, "first");
		firstBtn && $("<button class='btn first'></button>").appendTo(container).text(firstBtn);

		var prevBtn = getButtonLabel.call(this, "prev");
		prevBtn && $("<button class='btn prev'></button>").appendTo(container).text(prevBtn);

		renderPagesView.call(this, $, target, container, pageInfo);

		var nextBtn = getButtonLabel.call(this, "next");
		nextBtn && $("<button class='btn next'></button>").appendTo(container).text(nextBtn);

		var lastBtn = getButtonLabel.call(this, "last");
		lastBtn && $("<button class='btn last'></button>").appendTo(container).text(lastBtn);

		target.removeClass("is-first").removeClass("is-last");
		if (pageInfo.isFirstPage)
			target.addClass("is-first");
		if (pageInfo.isLastPage)
			target.addClass("is-last");
	};

	var renderPagesView = function ($, target, pagebar, pageInfo) {
		var mode = pageInfo.mode;
		if (mode !== false && mode !== "false") {
			var container = $("<div class='pages'></div>").appendTo(pagebar);
			if (mode == "spread") {
				renderPagesAsSpread.call(this, $, target, container, pageInfo);
			}
			else if (mode == "dropdown") {
				renderPagesAsDropdown.call(this, $, target, container, pageInfo);
			}
			else {
				renderPagesAsDefault.call(this, $, target, container, pageInfo);
			}
		}
	};

	var renderPagesAsDefault = function ($, target, container, pageInfo) {
		var view = [];
		view.push("<span class='pageno'>" + pageInfo.pageNo + "</span>");
		view.push("<span class='pagecount'>" + pageInfo.pageCount + "</span>");
		container.html(view.join("/"));
	};

	var renderPagesAsSpread = function ($, target, container, pageInfo) {
		var showNum = pageInfo.showNum;
		showNum = showNum > 0 ? showNum : defaultShowNum;
		if (showNum > 3 && this.isRenderAsApp())
			showNum = 3;

		var page = pageInfo.pageNo - Math.floor(showNum / 2);
		if (page + showNum - 1 > pageInfo.pageCount)
			page = pageInfo.pageCount - showNum + 1;
		if (page < 1)
			page = 1;

		container.removeClass("has-prev").removeClass("has-next");
		if (page > 1)
			container.addClass("has-prev");
		for (var i = 0; i < showNum && page <= pageInfo.pageCount; i++) {
			var item = $("<span class='page'></span>").appendTo(container);
			item.text(page);
			if (page == pageInfo.pageNo)
				item.addClass("selected");
			page += 1;
		}
		if (page - 1 < pageInfo.pageCount)
			container.addClass("has-next");
	};

	var renderPagesAsDropdown = function ($, target, container, pageInfo) {
		var label = $("<div class='lbl'></div>").appendTo(container);
		label.text(pageInfo.pageNo + "/" + pageInfo.pageCount);

		var isApp = this.isRenderAsApp();

		var dropdown = $("<div class='dropdown'></div>").appendTo(container);
		var items = $("<ul></ul>").appendTo(dropdown);
		for (var i = 1; i <= pageInfo.pageCount; i++) {
			var item = $("<li class='page'></li>").appendTo(items);
			if (isApp)
				item.append("<span>" + i + "</span>");
			else 
				item.text(i);
			if (i == pageInfo.pageNo)
				item.addClass("selected");
		}
	};

	var renderPageSizeBar = function ($, target, container, pageInfo) {
		var label = $("<div class='lbl'></div>").appendTo(container);
		label.text(pageInfo.pageSize);

		var dropdown = $("<div class='dropdown'></div>").appendTo(container);
		var items = $("<ul></ul>").appendTo(dropdown);
		Utils.each(pageInfo.pageSizes, function (value) {
			items.append("<li>" + value + "</li>");
		});
	};

	var renderPageStatusBar = function ($, target, container, pageInfo) {
		container.html(getFormatStatus.call(this, pageInfo.status, pageInfo));
	};

	var renderPageSkipBar = function ($, target, container, pageInfo) {
		var skips = /♮/.test(pageInfo.skip) ? pageInfo.skip.split("♮") : ["", ""];

		if (Utils.isBlank(skips[0]) && pageInfo.status)
			skips[0] = "到第";
		if (Utils.isNotBlank(skips[0]))
			$("<span class='txt t1'></span>").appendTo(container).text(skips[0]);

		container.append("<input type='number'/>");

		if (Utils.isBlank(skips[1]) && pageInfo.status)
			skips[1] = "页";
		if (Utils.isNotBlank(skips[1]))
			$("<span class='txt t2'></span>").appendTo(container).text(skips[1]);

		var skipBtn = getButtonLabel.call(this, "skip") || "GO";
		$("<button class='btn skip'></button>").appendTo(container).text(skipBtn);
	};

	// ====================================================
	var getPageInfos = function () {
		var data = {};

		data.totalCount = parseInt(this.options.total) || 0;
		data.totalCount = Math.max(0, data.totalCount);

		data.pageSize = parseInt(this.options.size) || 0;
		data.pageSizes = Renderer.getSizes(this.options.sizes) || [];
		if (data.pageSize <= 0 && data.pageSizes && data.pageSizes.length > 0)
			data.pageSize = data.pageSizes[0];
		if (data.pageSize <= 0)
			data.pageSize = defaultPageSize;
		if (data.pageSizes.indexOf(data.pageSize) < 0)
			data.pageSizes.push(data.pageSize);
		data.pageSizes.sort(function (a, b) { return a - b; });

		data.pageCount = Math.ceil(data.totalCount / data.pageSize) || 1;

		data.pageNo = parseInt(this.options.page) || 0;
		data.pageNo = Math.max(1, Math.min(data.pageNo, data.pageCount));

		data.pageStart = Math.min(((data.pageNo - 1) * data.pageSize + 1), data.totalCount);
		data.pageEnd = Math.min((data.pageNo * data.pageSize), data.totalCount);

		data.mode = Renderer.getMode(this.options.mode);
		data.showNum = Renderer.getShowNum(this.options.showNum);
		data.status = Renderer.getStatus(this.options.status);
		data.skip = Renderer.getSkip(this.options.skip);

		data.isFirstPage = data.pageNo == 1;
		data.isLastPage = data.pageNo == data.pageCount;

		return data;
	};

	var getButtonLabel = function (name) {
		var buttons = this._getButtons();
		if (buttons === false)
			return false;

		var label = null;
		if (Utils.isArray(buttons)) {
			if (name == "first")
				label = buttons[0];
			else if (name == "prev")
				label = buttons[1];
			else if (name == "next")
				label = buttons[2];
			else if (name == "last")
				label = buttons[3];
			else if (name == "skip")
				label = buttons[4];
		}

		if (label === false)
			return false;

		if (label !== true && Utils.isNotBlank(label))
			return "" + label;

		if (name == "first")
			return "|<";
		if (name == "last")
			return ">|";
		if (name == "prev")
			return "<";
		if (name == "next")
			return ">";
		if (name == "skip")
			return "GO";
		return "" + name;
	};

	var getFormatStatus = function (status, pageInfo) {
		if (status === true || status == "_default")
			return "共" + pageInfo.totalCount + "条";
		if (Utils.isNotBlank(status)) {
			status = status.replace(/\{pageNo\}/g, pageInfo.pageNo);
			status = status.replace(/\{pageSize\}/g, pageInfo.pageSize);
			status = status.replace(/\{pageCount\}/g, pageInfo.pageCount);
			status = status.replace(/\{totalCount\}/g, pageInfo.totalCount);
			status = status.replace(/\{pageStart\}/g, pageInfo.pageStart);
			status = status.replace(/\{pageEnd\}/g, pageInfo.pageEnd);
		}
		return Utils.trimToEmpty(status);
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.renderView = renderView;
		Renderer.renderPageBar = renderPageBar;
		Renderer.renderPageSizeBar = renderPageSizeBar;
		Renderer.renderPageStatusBar = renderPageStatusBar;
		VRender.Component.Render.paginator = Renderer;
	}

})(typeof VRender === "undefined");