// ========================================================
// 分页
// @author shicy <shicy85@163.com>
// Create on 2016-12-20
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Paginator)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("./base")).HolderBase;

	var Holder = function (options) {
		HolderBase.call(this, options);
		this.setTotalCount(this.options.total);
		this.setPageSize(this.options.size);
		this.setPageNo(this.options.page);
		this.setStatus(this.options.status);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		target.addClass("ui-paginator");

		var pageNo = this.getPageNo();
		var pageSize = this.getPageSize();
		var pageCount = this.getPageCount();
		var totalCount = this.getTotalCount();

		target.attr("data-total", totalCount);
		target.attr("data-no", pageNo);
		target.attr("data-size", pageSize);
		target.attr("data-pages", pageCount);

		var content = $("<div class='pages'></div>").appendTo(target);
		content.append("<button class='prev'>&lt;</button>");
		content.append("<span class='page'><span class='pageno'>" + pageNo + 
			"</span>/<span class='pagecount'>" + pageCount + "</span></span>");
		content.append("<button class='next'>&gt;</button>");
		content.append("<input class='pageipt'/>");
		content.append("<button class='goto'>跳转</button>");

		renderStatus.call(this, $, target, pageNo, pageSize, pageCount, totalCount);
		setButtonEnabled.call(this, target, pageNo, pageSize, pageCount);

		return this;
	};

	// ====================================================
	_Holder.getTotalCount = function () {
		var totalCount = parseInt(this.p_totalcount) || 0;
		return totalCount > 0 ? totalCount : 0;
	};
	_Holder.setTotalCount = function (value) {
		this.p_totalcount = value;
	};

	_Holder.getPageNo = function () {
		var pageNo = parseInt(this.p_pageno) || 0;
		if (pageNo <= 1)
			return 1;
		var pageCount = this.getPageCount();
		return pageNo < pageCount ? pageNo : pageCount;
	};
	_Holder.setPageNo = function (value) {
		this.p_pageno = value;
	};

	_Holder.getPageSize = function () {
		var pageSize = parseInt(this.p_pagesize) || 0;
		return pageSize > 0 ? pageSize : 20;
	};
	_Holder.setPageSize = function (value) {
		this.p_pagesize = value;
	};

	_Holder.getStatus = function () {
		return this.p_status;
	}
	_Holder.setStatus = function (value) {
		this.p_status = value
	};
	_Holder.setTitle = function (value) { // 兼容老的
		this.setStatus(value);
	};

	_Holder.getPageCount = function () {
		return Math.ceil(this.getTotalCount() / this.getPageSize()) || 1;
	};

	// ====================================================
	var renderStatus = function ($, target, pageNo, pageSize, pageCount, totalCount) {
		var statusPattern = this.getStatus();
		if (statusPattern === true)
			statusPattern = "共{totalCount}条";
		if (Utils.isBlank(statusPattern))
			return ;

		var pageStart = Math.min(((pageNo - 1) * pageSize + 1), totalCount);
		var pageEnd = Math.min((pageNo * pageSize), totalCount);

		var status = statusPattern.replace(/\{pageNo\}/g, pageNo);
		status = status.replace(/\{pageSize\}/g, pageSize);
		status = status.replace(/\{pageCount\}/g, pageCount);
		status = status.replace(/\{totalCount\}/g, totalCount);
		status = status.replace(/\{pageStart\}/g, pageStart);
		status = status.replace(/\{pageEnd\}/g, pageEnd);

		if (isFront)
			target.children(".status").remove();

		target.append("<div class='status'>" + status + "</div>");

		if (!isFront)
			$("<div class='status-src'></div>").appendTo(target).text(statusPattern);
	};

	var setButtonEnabled = function (target, pageNo, pageSize, pageCount) {
		target.removeClass("page-first").removeClass("page-last");
		var prev = target.find(".pages > .prev").removeClass("disabled");
		var next = target.find(".pages > .next").removeClass("disabled");

		if (pageNo === 1) {
			target.addClass("page-first");
			prev.addClass("disabled");
		}
		if (pageNo === pageCount) {
			target.addClass("page-last");
			next.addClass("disabled");
		}
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIPaginator = Component.Paginator = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		var self = this;
		this.$el.tap("button", function (e) { return buttonClickHandler.call(self, e); });
		this.$el.on("keydown", "input", function (e) { return inputKeyHandler.call(self, e); });
		this.$el.on("focusout", "input", function (e) { return inputFocusHandler.call(self, e); });
	};
	var _UIPaginator = UIPaginator.prototype = new Component.base();

	UIPaginator.find = function (view) {
		return Component.find(view, ".ui-paginator", UIPaginator);
	};

	UIPaginator.create = function (options) {
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIPaginator(target, options, holder);
	};

	// ====================================================
	_UIPaginator.set = function (total, page, size, trigger) {
		setInner.call(this, total, page, size, trigger);
	};

	_UIPaginator.getPageNo = function () {
		var pageNo = parseInt(this.$el.attr("data-no")) || 0;
		if (pageNo <= 1)
			return 1;
		var pageCount = this.getPageCount();
		return pageNo < pageCount ? pageNo : pageCount;
	};
	_UIPaginator.setPageNo = function (value, trigger) { console.log("setPageNo", value);
		setInner.call(this, null, value, null, trigger);
	};

	_UIPaginator.getPageSize = function () {
		var pageSize = parseInt(this.$el.attr("data-size")) || 0;
		return pageSize > 0 ? pageSize : 20;
	};
	_UIPaginator.setPageSize = function (value, trigger) {
		setInner.call(this, null, null, value, trigger);
	};

	_UIPaginator.getTotalCount = function () {
		var totalCount = parseInt(this.$el.attr("data-total")) || 0;
		return totalCount > 0 ? totalCount : 0;
	};
	_UIPaginator.setTotalCount = function (value, trigger) {
		setInner.call(this, value, null, null, trigger);
	};

	_UIPaginator.getPageCount = function () {
		return Math.ceil(this.getTotalCount() / this.getPageSize()) || 1;
	};

	_UIPaginator.getStatus = function () {
		return this.$el.children(".status-src").text();
	};
	_UIPaginator.setStatus = function (value) {
		this.$el.children(".status-src").remove();
		if (Utils.isNotBlank(value))
			$("<div class='status-src'></div>").appendTo(this.$el).text(value);
		reRenderStatus.call(this, this.getPageNo(), this.getPageSize(), 
			this.getPageCount, this.getTotalCount());
	};

	// ====================================================
	var buttonClickHandler = function (e) {
		var btn = $(e.currentTarget);
		if (btn.is(".disabled"))
			return false;

		var pageNo = this.getPageNo();
		if (btn.is(".prev")) {
			pageNo -= 1;
		}
		else if (btn.is(".next")) {
			pageNo += 1;
		}
		else if (btn.is(".goto")) {
			var pageIpt = this.$el.find(".pageipt");
			pageNo = parseInt(pageIpt.val());
			pageIpt.val("");
		}
		
		if (pageNo >= 0 && pageNo <= this.getPageCount()) {
			this.trigger("onpage", pageNo, this.getPageSize());
			if (!this.hasListen("onpage"))
				this.setPageNo(pageNo);
		}
	};

	var inputKeyHandler = function (e) {
		if (e.which === 13) {
			var self = this;
			setTimeout(function () {
				self.$el.find("button.goto").trigger("click");
			}, 0);
			return false;
		}

		if (Utils.isControlKey(e))
			return true;

		return Utils.isNumberKey(e);
	};

	var inputFocusHandler = function (e) {
		var input = $(e.currentTarget);
		input.val(parseInt(input.val()) || "");
	};

	// ====================================================
	var setInner = function (total, page, size, trigger) {
		var totalCount = parseInt(total);
		totalCount = isNaN(totalCount) ? this.getTotalCount() : (totalCount > 0 ? totalCount : 0);

		var pageNo = parseInt(page);
		pageNo = isNaN(pageNo) ? this.getPageNo() : (pageNo > 0 ? pageNo : 1);

		var pageSize = parseInt(size);
		pageSize = isNaN(pageSize) ? this.getPageSize() : (pageSize > 0 ? pageSize : 20);

		var pageCount = Math.ceil(totalCount / pageSize) || 1;

		pageNo = Math.min(pageNo, pageCount);
		// console.log(pageNo, pageSize, pageCount, totalCount);

		this.$el.attr("data-total", totalCount);
		this.$el.attr("data-no", pageNo);
		this.$el.attr("data-size", pageSize);
		this.$el.attr("data-pages", pageCount);

		this.$el.find(".pages .pageno").text(pageNo);
		this.$el.find(".pages .pagecount").text(pageCount);

		reRenderStatus.call(this, pageNo, pageSize, pageCount, totalCount);
		setButtonEnabled.call(this, this.$el, pageNo, pageSize, pageCount);

		if (!!trigger)
			this.trigger("onpage", pageNo, pageSize);
	};

	var reRenderStatus = function (pageNo, pageSize, pageCount, totalCount) {
		renderStatus.call(this, $, this.$el, pageNo, pageSize, pageCount, totalCount);
	};

	// ====================================================
	Component.register(".ui-paginator", UIPaginator);

})(typeof VRender !== "undefined");
