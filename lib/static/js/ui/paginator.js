// ========================================================
// 分页
// @author shicy <shicy85@163.com>
// Create on 2016-12-20
// ========================================================

(function () {
	if (VRender.Component.Paginator)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var PaginatorRender = Component.Render.paginator;

	///////////////////////////////////////////////////////
	var UIPaginator = window.UIPaginator = Component.Paginator = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		// var self = this;
		// this.tap("button", function (e) { return buttonClickHandler.call(self, e); });
		// this.$el.on("keydown", "input", function (e) { return inputKeyHandler.call(self, e); });
		// this.$el.on("focusout", "input", function (e) { return inputFocusHandler.call(self, e); });
	};
	var _UIPaginator = UIPaginator.prototype = new Component.base();

	UIPaginator.find = function (view) {
		return Component.find(view, ".ui-paginator", UIPaginator);
	};

	UIPaginator.create = function (options) {
		return Component.create(options, UIPaginator, PaginatorRender);
	};

	// ====================================================
	_UIPaginator.set = function (total, page, size) {
		var snapshoot = this._snapshoot();
		setInner.call(this, total, page, size);
		snapshoot.done();
	};

	_UIPaginator.getPageNo = function () {
		return parseInt(this.$el.attr("data-no")) || 1;
	};

	_UIPaginator.setPageNo = function (value) {
		var snapshoot = this._snapshoot();
		setInner.call(this, null, value);
		snapshoot.done();
	};

	_UIPaginator.getSize = function () {
		return parseInt(this.$el.attr("data-size")) || 0;
	};

	_UIPaginator.setSize = function (value) {
		setInner.call(this, null, null, value);
	};

	_UIPaginator.getTotal = function () {
		return parseInt(this.$el.attr("data-total")) || 0;
	};

	_UIPaginator.setTotal = function (value) {
		var snapshoot = this._snapshoot();
		setInner.call(this, value);
		snapshoot.done();
	};

	_UIPaginator.setMode = function (value) {
		value = PaginatorRender.getMode(value);
		this.$el.attr("opt-mode", value || "");
		reRenderView.call(this);
	};

	_UIPaginator.setSizes = function (value) {
		var sizes = Utils.isArray(value) ? value : null;
		if (sizes)
			sizes = PaginatorRender.getSizes(sizes);
		this.options.sizes = sizes;
		if (sizes && sizes.length > 0)
			this.$el.attr("opt-sizes", sizes.join(","));
		else
			this.$el.removeAttr("opt-sizes");
		reRenderView.call(this);
	};

	_UIPaginator.setShowNum = function (value) {
		this.$el.attr("opt-nums", PaginatorRender.getShowNum(value));
		reRenderView.call(this);
	};

	_UIPaginator.setStatus = function (value) {
		value = PaginatorRender.getStatus(value);
		if (value)
			this.$el.attr("opt-status", value);
		else
			this.$el.removeAttr("opt-status");
		reRenderView.call(this);
	};

	_UIPaginator.setSkip = function (value) {
		value = PaginatorRender.getSkip(value);
		if (value)
			this.$el.attr("opt-skip", value);
		else
			this.$el.removeAttr("opt-skip");
		reRenderView.call(this);
	};

	_UIPaginator.setButtons = function (value) {
		this.options.buttons = value;
		this.$el.removeAttr("opt-btn").removeAttr("opt-btn-fn");
		reRenderView.call(this);
	};

	// ====================================================
	_UIPaginator._snapshoot_shoot = function (state) {
		state.data = this.getPageNo();
	};

	_UIPaginator._snapshoot_compare = function (state) {
		return state.data == this.getPageNo();
	};

	_UIPaginator._getMode = function () {
		return this.$el.attr("opt-mode") || false;
	};

	_UIPaginator._getSizes = function () {
		return PaginatorRender.getSizes(this.$el.attr("opt-sizes") || "");
	};

	_UIPaginator._getShowNum = function () {
		return parseInt(this.$el.attr("opt-nums")) || 0;
	};

	_UIPaginator._getStatus = function () {
		var status = this.$el.attr("opt-status");
		if (status === "_default")
			return "共{totalCount}条";
		return status || "";
	};

	_UIPaginator._getSkip = function () {
		var skip = this.$el.attr("opt-skip");
		if (skip == 1)
			return true;
		return skip ? skip.split("♮") : false;
	};

	_UIPaginator._getButtonLabelHandler = function () {
		var buttonHandler = this.$el.attr("opt-btn-fn");
		if (buttonHandler)
			return (new Function("var Utils=VRender.Utils;return (" + unescape(buttonHandler) + ");"))();

		buttonHandler = this.$el.attr("opt-btn");

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
	var setInner = function (total, page, size) {

	};

	var getPageInfos = function () {
		var data = {};

		data.totalCount = this.getTotal();

		data.pageSize = this.getSize();
		data.pageSizes = this._getSizes() || [];
		if (data.pageSizes.indexOf(data.pageSize) < 0)
			data.pageSizes.push(data.pageSize);
		data.pageSizes.sort(function (a, b) { return a - b; });

		data.pageCount = Math.ceil(data.totalCount / data.pageSize) || 1;
		data.pageNo = this.getPageNo();

		data.pageStart = Math.min(((data.pageNo - 1) * data.pageSize + 1), data.totalCount);
		data.pageEnd = Math.min((data.pageNo * data.pageSize), data.totalCount);

		data.mode = this._getMode();
		data.showNum = this._getShowNum();
		data.status = this._getStatus();
		data.skip = this._getSkip();

		data.isFirstPage = data.pageNo == 1;
		data.isLastPage = data.pageNo == data.pageCount;

		return data;
	};

	// 重新渲染视图
	var reRenderView = function () {
		if (this.rerenderViewTimerId) {
			clearTimeout(this.rerenderViewTimerId);
		}
		var self = this;
		this.rerenderViewTimerId = setTimeout(function () {
			clearTimeout(self.rerenderViewTimerId);
			PaginatorRender.renderView.call(self, $, self.$el, getPageInfos.call(self));
		}, 0);
	};

	// 如果只是页码变了，只要重新渲染页码相关部分即可
	var reRenderPages = function () {

	};

	// ====================================================
	Component.register(".ui-paginator", UIPaginator);

})();
