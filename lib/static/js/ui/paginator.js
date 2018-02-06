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

		this.tap("button.btn", buttonClickHandler.bind(this));

		this.tap(".pagebar .page", pageClickHandler.bind(this));
		this.tap(".pagebar .lbl", dropdownClickHandler.bind(this));

		this.tap(".sizebar .lbl", sizebarClickHandler.bind(this));
		this.tap(".sizebar li", sizebarClickHandler.bind(this));

		this.$el.on("keydown", ".skipbar input", inputKeyHandler.bind(this));
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

	_UIPaginator.getPageCount = function () {
		return parseInt(this.$el.attr("data-pages")) || 1;
	};

	_UIPaginator.setMode = function (value) {
		this.$el.attr("opt-mode", (PaginatorRender.getMode(value) || ""));
		reRenderView.call(this);
	};

	_UIPaginator.setSizes = function (value) {
		var sizes = Utils.isArray(value) ? value : null;
		if (sizes)
			sizes = PaginatorRender.getSizes(sizes);
		if (sizes && sizes.length > 0)
			this.$el.attr("opt-sizes", sizes.join(","));
		else
			this.$el.removeAttr("opt-sizes");
		reRenderView.call(this);
	};

	_UIPaginator.setShowNum = function (value) {
		value = parseInt(value) || 0;
		if (value > 0) {
			this.$el.attr("opt-nums", value);
			reRenderView.call(this);
		}
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
		this.$el.removeAttr("opt-btn");
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
		var sizes = this.$el.attr("opt-sizes") || "";
		return PaginatorRender.getSizes(sizes.split(","));
	};

	_UIPaginator._getShowNum = function () {
		return parseInt(this.$el.attr("opt-nums")) || PaginatorRender.getShowNum(-1);
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

	_UIPaginator._getButtons = function () {
		if (this.options.hasOwnProperty("buttons"))
			return this.options.buttons;
		var buttons = this.$el.attr("opt-btns");
		if (buttons === "")
			return false;
		return buttons ? JSON.parse(buttons) : null;
	};

	_UIPaginator._isFirst = function () {
		return this.$el.is(".is-first");
	};

	_UIPaginator._isLast = function () {
		return this.$el.is(".is-last");
	};

	// ====================================================
	var buttonClickHandler = function (e) {
		var btn = $(e.currentTarget);
		if (btn.is(".disabled"))
			return false;
		if (btn.is(".skip")) {
			var skipInput = this.$el.find(".skipbar input");
			var page = parseInt(skipInput.val()) || 0;
			if (page > 0 && page != this.getPageNo())
				this.setPageNo(page);
			skipInput.val("");
		}
		else {
			var pageNo = this.getPageNo();
			if (btn.is(".prev")) {
				if (!this._isFirst())
					this.setPageNo(pageNo - 1);
			}
			else if (btn.is(".next")) {
				if (!this._isLast())
					this.setPageNo(pageNo + 1);
			}
			else if (btn.is(".first")) {
				if (!this._isFirst())
					this.setPageNo(1);
			}
			else if (btn.is(".last")) {
				if (!this._isLast())
					this.setPageNo(this.getPageCount());
			}
		}
	};

	var pageClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".selected"))
			return ;
		hidePageDropdown.call(this);
		if (this.isRenderAsApp()) {
			var self = this;
			setTimeout(function () {
				self.setPageNo(item.text());
			}, 200);
		}
		else {
			this.setPageNo(item.text());
		}
		return false;
	};

	var dropdownClickHandler = function (e) {
		var target = $(e.currentTarget).parent();
		if (target.is(".show-dropdown"))
			return ;

		target.addClass("show-dropdown");//.removeClass("show-before");
		var dropdown = target.children("ul");

		if (this.isRenderAsApp()) {
			$("html,body").addClass("ui-scrollless");
			$("body").on("tap.paginator", dropdownTouchHandler.bind(this));
			setTimeout(function () {
				target.addClass("animate-in");
			}, 0);
		}
		else {
			var offset = Utils.getViewScreenOffset(dropdown);
			if (offset.bottom < 0)
				target.addClass("show-before");
			target.on("mouseenter mouseleave", dropdownMouseHandler.bind(this));
		}

		var selectedItem = dropdown.children(".selected");
		if (selectedItem && selectedItem.length > 0) {
			var scrollTop = dropdown.scrollTop();
			scrollTop += selectedItem.offset().top;
			scrollTop -= dropdown.offset().top;
			dropdown.scrollTop(scrollTop);
		}
	};

	var dropdownMouseHandler = function (e) {
		if (this.t_dropdown) {
			clearTimeout(this.t_dropdown);
			this.t_dropdown = 0;
		}
		if (e.type == "mouseleave") {
			var self = this;
			this.t_dropdown = setTimeout(function () {
				self.t_dropdown = 0;
				hidePageDropdown.call(self);
			}, 500);
		}
	};

	var dropdownTouchHandler = function (e) {
		hidePageDropdown.call(this);
	};

	var sizebarClickHandler = function (e) {
		var target = $(e.currentTarget);
		if (target.is(".lbl")) {
			target = target.parent();
			if (target.is(".show-dropdown"))
				return ;
			target.addClass("show-dropdown").removeClass("show-before");
			if (Utils.getViewScreenOffset(target.children("ul")).bottom < 0)
				target.addClass("show-before");
			target.on("mouseenter mouseleave", sizebarMouseHandler.bind(this));
		}
		else {
			var size = parseInt(target.text());
			if (size != this.getSize())
				this.setSize(size);
			target = target.parent().parent();
			target.removeClass("show-dropdown");
			target.off("mouseenter mouseleave");
		}
	};

	var sizebarMouseHandler = function (e) {
		if (this.t_sizebar) {
			clearTimeout(this.t_sizebar);
			this.t_sizebar = 0;
		}
		if (e.type == "mouseleave") {
			var self = this;
			this.t_sizebar = setTimeout(function () {
				self.t_sizebar = 0;
				var target = self.$el.children(".sizebar");
				target.removeClass("show-dropdown");
				target.off("mouseenter mouseleave");
			}, 500);
		}
	};

	var inputKeyHandler = function (e) {
		if (e.type == "keydown") {
			if (e.which == 13) {
				var input = $(e.currentTarget);
				var page = parseInt(input.val()) || 0;
				if (page > 0 && page != this.getPageNo())
					this.setPageNo(page);
				input.val("");
				return true;
			}
			return Utils.isControlKey(e) || Utils.isNumberKey(e);
		}
	};

	// ====================================================
	var setInner = function (total, page, size) {
		total = Math.max(0, (Utils.isBlank(total) || isNaN(total)) ? this.getTotal() : parseInt(total));
		page = Math.max(0, (Utils.isBlank(page) || isNaN(page)) ? this.getPageNo() : parseInt(page));
		size = (Utils.isBlank(size) || isNaN(size)) ? this.getSize() : parseInt(size);

		var pageCount = Math.ceil(total / size) || 1;
		page = Math.min(page, pageCount);

		this.$el.attr("data-total", total);
		this.$el.attr("data-size", size);
		this.$el.attr("data-no", page);
		this.$el.attr("data-pages", pageCount);

		reRenderPages.call(this);

		this.$el.find(".sizebar .lbl").text(size);
	};

	var getPageInfos = function () {
		var data = {};

		data.totalCount = this.getTotal();

		data.pageSize = this.getSize();
		data.pageSizes = this._getSizes() || [];
		if (data.pageSizes.indexOf(data.pageSize) < 0)
			data.pageSizes.push(data.pageSize);
		data.pageSizes.sort(function (a, b) { return a - b; });

		data.pageNo = this.getPageNo();
		data.pageCount = this.getPageCount();

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
		if (this.t_renderview) {
			clearTimeout(this.t_renderview);
			this.t_renderview = 0;
		}
		if (this.t_renderpage) {
			clearTimeout(this.t_renderpage);
			this.t_renderpage = 0;
		}
		var self = this;
		this.t_renderview = setTimeout(function () {
			self.t_renderview = 0;
			PaginatorRender.renderView.call(self, $, self.$el.empty(), getPageInfos.call(self));
		}, 0);
	};

	// 如果只是页码变了，只要重新渲染页码相关部分即可
	var reRenderPages = function () {
		if (this.t_renderview)
			return ;
		if (this.t_renderpage) {
			clearTimeout(this.t_renderpage);
			this.t_renderpage = 0;
		}
		var self = this;
		this.t_renderpage = setTimeout(function () {
			self.t_renderpage = 0;
			var pageInfos = getPageInfos.call(self);
			var pageContainer = self.$el.children(".pagebar").empty();
			PaginatorRender.renderPageBar.call(self, $, self.$el, pageContainer, pageInfos);
			var statusContainer = self.$el.children(".statusbar");
			if (statusContainer && statusContainer.length > 0)
				PaginatorRender.renderPageStatusBar.call(self, $, self.$el, statusContainer, pageInfos);
		}, 0);
	};

	var hidePageDropdown = function () {
		var target = this.$el.children(".pagebar").children(".pages");
		if (this.isRenderAsApp()) {
			$("body").off("tap.paginator");
			$("html,body").removeClass("ui-scrollless");
			target.addClass("animate-out");
			setTimeout(function () {
				target.removeClass("show-dropdown");
				target.removeClass("animate-in").removeClass("animate-out");
			}, 200);
		}
		else {
			target.removeClass("show-dropdown").removeClass("show-before");
			target.off("mouseenter mouseleave");
		}
	};

	// ====================================================
	Component.register(".ui-paginator", UIPaginator);

})();
