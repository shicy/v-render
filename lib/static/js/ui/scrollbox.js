// ========================================================
// 滚动加载
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================

(function () {
	if (VRender.Component.ScrollBox)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var ScrollBoxRender = Component.Render.scrollbox;

	///////////////////////////////////////////////////////
	var UIScrollBox = window.UIScrollBox = Component.ScrollBox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
		doInit.call(this);
	};
	var _UIScrollBox = UIScrollBox.prototype = new Component.base();

	UIScrollBox.find = function (view) {
		return Component.find(view, ".ui-scrollbox", UIScrollBox);
	};

	UIScrollBox.create = function (options) {
		return Component.create(options, UIScrollBox, ScrollBoxRender);
	};

	// ====================================================
	_UIScrollBox.reset = function () {
	};

	// ====================================================
	_UIScrollBox.getContentView = function () {
		if (!this.contentView) {
			var content = this.$el.children(".container").children();
			if (content && content.length > 0) {
				if (content.length === 1)
					this.contentView = VRender.Component.get(content);
				if (!this.contentView)
					this.contentView = content;
			}
		}
		return this.contentView;
	};
	_UIScrollBox.setContentView = function (value) {
		clearContentEvents.call(this);
		var content = this.options.content = value;
		delete this.options.view;
		this.contentView = null;
		if (content) {
			var container = this.$el.children(".container").empty();
			container.append(content.$el || content);
		}
		initContentEvents.call(this);
	};

	// 
	_UIScrollBox.getScrollContainer = function () {
		if (!this.scroller) {
			if (this.options.hasOwnProperty("scroller"))
				this.scroller = this.options.scroller;
			else
				this.scroller = this.$el.attr("opt-scroll");
			this.$el.removeAttr("opt-scroll");
			this.scroller = !this.scroller ? this.$el : $(this.scroller);
		}
		return this.scroller;
	};
	_UIScrollBox.setScrollContainer = function (value) {
		clearEvents.call(this);
		this.options.scroller = value;
		this.scroller = null;
		initEvents.call(this);
	};

	// 
	_UIScrollBox.getRefreshFunction = function () {
		return Component.base.getFunction.call(this, "refreshFunction", "refresh");
	};
	_UIScrollBox.setRefreshFunction = function (value) {
		this.options.refreshFunction = value;
	};

	// 
	_UIScrollBox.getMoreFunction = function () {
		return Component.base.getFunction.call(this, "moreFunction", "more");
	};
	_UIScrollBox.setMoreFunction = function (value) {
		this.options.moreFunction = value;
	};

	// 
	_UIScrollBox.getTopDistance = function () {
		if (Utils.isNull(this.topDistance)) {
			if (this.options.hasOwnProperty("topDistance")) {
				this.topDistance = this.options.topDistance;
			}
			else {
				this.topDistance = this.$el.attr("opt-top");
				this.$el.removeAttr("opt-top");
			}
			if (!this.topDistance/* && this.topDistance !== 0*/)
				this.topDistance = this.isRenderAsRem() ? "0.5rem" : "50px";
			this.topDistance = Utils.toPx(this.topDistance);
		}
		return this.topDistance;
	};
	_UIScrollBox.setTopDistance = function (value) {
		this.options.topDistance = value;
		this.$el.removeAttr("opt-top");
		this.topDistance = null;
	};

	// 
	_UIScrollBox.getBottomDistance = function () {
		if (Utils.isNull(this.bottomDistance)) {
			if (this.options.hasOwnProperty("bottomDistance")) {
				this.bottomDistance = this.options.bottomDistance;
			}
			else {
				this.bottomDistance = this.$el.attr("opt-bottom");
				this.$el.removeAttr("opt-bottom");
			}
			if (!this.bottomDistance && this.bottomDistance !== 0)
				this.bottomDistance = this.isRenderAsRem() ? "0.7rem" : "70px";
			this.bottomDistance = Utils.toPx(this.bottomDistance);
		}
		return this.bottomDistance;
	};
	_UIScrollBox.setBottomDistance = function (value) {
		this.options.bottomDistance = value;
		this.$el.removeAttr("opt-bottom");
		this.bottomDistance = null;
	};

	// ====================================================
	var doInit = function () {
		initEvents.call(this);
		checkIfEmpty.call(this);
		initContentEvents.call(this);
	};

	var initEvents = function () {
		var scroller = this.getScrollContainer();

		scroller.on("scroll.scrollbox", onScrollHandler.bind(this));

		if (this.isRenderAsApp()) {
			scroller.on("touchstart.scrollbox", onTouchHandler.bind(this));
			scroller.on("touchend.scrollbox", onTouchHandler.bind(this));
			scroller.on("touchmove.scrollbox", onTouchHandler.bind(this));
			scroller.on("touchcancel.scrollbox", onTouchHandler.bind(this));
		}
		else {
			scroller.on("mousedown.scrollbox", onMouseHandler.bind(this));
			scroller.on("mouseup.scrollbox", onMouseHandler.bind(this));
			scroller.on("mousemove.scrollbox", onMouseHandler.bind(this));
			scroller.on("mouseleave.scrollbox", onMouseHandler.bind(this));
		}
	};

	var clearEvents = function () {
		var scroller = this.getScrollContainer();

		scroller.off("scroll.scrollbox");

		if (this.isRenderAsApp()) {
			scroller.off("touchstart.scrollbox");
			scroller.off("touchend.scrollbox");
			scroller.off("touchmove.scrollbox");
			scroller.off("touchcancel.scrollbox");
		}
		else {
			scroller.off("mousedown.scrollbox");
			scroller.off("mouseup.scrollbox");
			scroller.off("mousemove.scrollbox");
			scroller.off("mouseleave.scrollbox");
		}
	};

	var initContentEvents = function () {
		var contentView = this.getContentView();
		if (contentView && Utils.isFunction(contentView.on)) {
			var loadedHandler = function () {
				onContentLoadHandler.call(this);
			};
			contentView.scrollbox_loaded = loadedHandler.bind(this);
			contentView.on("loaded", contentView.scrollbox_loaded);
		}
	};

	var clearContentEvents = function () {
		var contentView = this.getContentView();
		if (contentView && Utils.isFunction(contentView.off)) {
			if (contentView.scrollbox_loaded)
				contentView.off("loaded", contentView.scrollbox_loaded);
		}
	};

	// ====================================================
	var onScrollHandler = function (e) {
		var state = getScrollState.call(this, e);
		if (state.isUp) {
			if (state.bottom <= this.getBottomDistance())
				moreHandler.call(this, state);
		}
	};

	var onMouseHandler = function (e) {
		if (e.type == "mousedown") {
			dragStart.call(this, e);
		}
		else if (e.type == "mousemove") {
			dragMove.call(this, e);
		}
		else if (e.type == "mouseup") {
			dragEnd.call(this, e);
		}
		else if (e.type == "mouseleave") {
			dragEnd.call(this, e);
		}
	};

	var onTouchHandler = function (e) {
		if (e.type == "touchstart") {
			dragStart.call(this, e);
		}
		else if (e.type == "touchmove") {
			dragMove.call(this, e);
		}
		else if (e.type == "touchend") {
			dragEnd.call(this, e);
		}
		else if (e.type == "touchcancel") {
			dragEnd.call(this, e);
		}
	};

	var onContentLoadHandler = function () {
		checkIfEmpty.call(this);
	};

	// ====================================================
	var getScrollState = function (e) {
		var state = {offset: 0, isUp: true};
		state.time = Date.now();

		var scroller = this.getScrollContainer();
		state.scrollerHeight = scroller.height();

		var container = this.$el.children(".container");
		state.containerHeight = container.height();

		state.top = 0 - scroller.scrollTop();
		state.bottom = state.containerHeight + state.top - state.scrollerHeight;

		state.isTop = state.offsetTop >= 0;
		state.isBottom = state.offsetBottom <= 0;

		if (this.lastState) {
			state.offset = state.top - this.lastState.top;
			if (state.time - this.lastState.time > 30) {
				state.isUp = state.offset < 0;
				this.lastState = state;
			}
			else {
				state.isUp = this.lastState.isUp;
			}
		}
		else {
			this.lastState = state;
		}

		return state;
	};

	var refreshHandler = function () {
		if (this.$el.is(".is-refresh, .is-loading"))
			return ;
		var target = this.$el.addClass("is-refresh");

		var self = this;
		var complete = function () {
			target.removeClass("is-refresh");
			target.removeClass("no-more");
			hideRefreshView.call(self);
			checkIfEmpty.call(self);
		}

		var result = false;
		var contentView = this.getContentView();
		if (contentView && Utils.isFunction(contentView.reload)) {
			var result1 = result = contentView.reload(function () {
				setTimeout(function () {
					if (result1 !== false)
						complete();
				}, 0);
			});
		}

		if (result === false) {
			var refreshFunction = this.getRefreshFunction();
			if (Utils.isFunction(refreshFunction)) {
				var result2 = result = refreshFunction(function () {
					setTimeout(function () {
						if (result2 !== false)
							complete();
					}, 0);
				});
			}
		}

		this.trigger("refresh");

		if (result === false) {
			complete();
		}
	};

	var moreHandler = function (state) {
		if (this.$el.is(".is-loading, .is-refresh, .no-more"))
			return ;
		var target = this.$el.addClass("is-loading");
		
		var self = this;
		var complete = function (hasMore) {
			if (!hasMore)
				target.addClass("no-more");
			target.removeClass("is-loading");
			checkIfEmpty.call(self);
		};

		var result = false;
		var contentView = this.getContentView();
		if (contentView && Utils.isFunction(contentView.more)) {
			var result1 = result = contentView.more(function () {
				setTimeout(function () {
					if (result1 !== false)
						complete(Utils.isFunction(contentView.hasMore) ? contentView.hasMore() : true);
				}, 0);
			});
		}

		if (result === false) {
			var moreFunction = this.getMoreFunction();
			if (Utils.isFunction(moreFunction)) {
				var result2 = result = moreFunction(function (data) {
					setTimeout(function () {
						if (result2 !== false)
							complete((data && data.hasOwnProperty("hasMore")) ? Utils.isTrue(data.hasMore) : true);
					}, 0);
				});
			}
		}

		this.trigger("more");

		if (result === false) {
			complete();
		}
	};

	// ====================================================
	var dragStart = function (e) {
		var data = this.dragData = {};
		data.scroller = this.getScrollContainer();
		data.startTop = data.scroller.scrollTop();
		data.startX = e.pageX;
		data.startY = e.pageY;
	};

	var dragMove = function (e) {
		if (this.dragData) {
			var data = this.dragData;

			var offset = e.pageY - data.startY;
			data.offset = offset;

			if (!data.moveing) {
				if (e.type == "mousemove") { // pc
					if (offset > -10 && offset < 10)
						return ;
					var offsetX = e.pageX - data.startX;
					if (offsetX < -10 || offsetX > 10)
						return ;
					data.moveing = true;
				}
				else { // mobile
					if (offset > -20 && offset < 20)
						return ;
					data.moveing = true;
				}
			}

			if (data.moveing) {
				var isLoading = this.$el.is(".is-loading, .is-refresh");
				var scrollTop = data.startTop - offset;
				if (scrollTop == 0) {
					data.scroller.scrollTop(0);
					if (!isLoading)
						this.$el.children(".top").height(0);
				}
				else if (scrollTop > 0) {
					data.scroller.scrollTop(scrollTop);
				}
				else {
					data.scroller.scrollTop(0);
					if (!isLoading)
						showRefreshView.call(this, 0 - scrollTop);
				}
			}
		}
	};

	var dragEnd = function (e) {
		if (this.dragData) {
			var data = this.dragData;
			if (data.moveing && (data.startTop - data.offset < 0)) {
				if (!this.$el.is(".is-refresh"))
					hideRefreshView.call(this);
			}
			this.dragData = null;
		}
	};

	// ====================================================
	var showRefreshView = function (height) {
		this.$el.addClass("show-top");

		var refreshView = this.$el.children(".top");

		var content = refreshView.children();
		if (content && content.length > 0) {
			var distance = this.getTopDistance();
			if (height <= distance) {
				content.attr("state", "pull");
			}
			else {
				content.attr("state", "drop");
				var increment = (height - distance - 1) / (height - distance + 2);
				height = distance + (increment * increment * 40);
			}
			var scale = Math.min(1, (height / distance));
			content.css("transform", "scale(" + scale.toFixed(5) + ")");
		}

		refreshView.height(height);
	};

	var hideRefreshView = function () {
		if (!this.$el.is(".show-top"))
			return ;

		var refreshView = this.$el.children(".top");
		var content = refreshView.children();

		refreshView.addClass("animate");

		var self = this;
		var _hide = function () {
			refreshView.height(0);
			content.removeAttr("state");
			setTimeout(function () {
				self.$el.removeClass("show-top");
				refreshView.removeClass("animate");
			}, 200);
		};

		if (content && content.length > 0) {
			content.css("transform", "");
			if (content.attr("state") == "drop") {
				content.attr("state", "load");
				refreshView.height(this.getTopDistance());
				refreshHandler.call(this);
			}
			else {
				_hide();
			}
		}
		else {
			_hide();
		}
	};

	var checkIfEmpty = function () {
		this.$el.removeClass("is-empty");
		var contentView = this.getContentView();
		if (contentView) {
			if (Utils.isFunction(contentView.isEmpty)) {
				if (contentView.isEmpty())
					this.$el.addClass("is-empty");
			}
			else if (contentView.length <= 0) {
				this.$el.addClass("is-empty");
			}
		}
		else {
			this.$el.addClass("is-empty");
		}
	};

	// ====================================================
	Component.register(".ui-scrollbox", UIScrollBox);

})();