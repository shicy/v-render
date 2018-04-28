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

		this.getScrollContainer().on("scroll.scrollbox", onScrollHandler.bind(this));
	};
	var _UIScrollBox = UIScrollBox.prototype = new Component.base();

	UIScrollBox.find = function (view) {
		return Component.find(view, ".ui-scrollbox", UIScrollBox);
	};

	UIScrollBox.create = function (options) {
		return Component.create(options, UIScrollBox, ScrollBoxRender);
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
		var content = this.options.content = value;
		delete this.options.view;
		this.contentView = null;
		if (content) {
			var container = this.$el.children(".container").empty();
			container.append(content.$el || content);
		}
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
		this.getScrollContainer().off("scroll.scrollbox");
		this.options.scroller = value;
		this.$el.removeAttr("opt-scroller");
		this.scroller = null;
		this.getScrollContainer().on("scroll.scrollbox", onScrollHandler.bind(this));
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
		if (!this.topDistance) {
			if (this.options.hasOwnProperty("topDistance")) {
				this.topDistance = this.options.topDistance;
			}
			else {
				this.topDistance = this.$el.attr("opt-top");
				this.$el.removeAttr("opt-top");
			}
			if (!this.topDistance)
				this.topDistance = this.isRenderAsRem() ? "0.3rem" : "30px";
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
		if (!this.bottomDistance) {
			if (this.options.hasOwnProperty("bottomDistance")) {
				this.bottomDistance = this.options.bottomDistance;
			}
			else {
				this.bottomDistance = this.$el.attr("opt-bottom");
				this.$el.removeAttr("opt-bottom");
			}
			if (!this.bottomDistance)
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
	var onScrollHandler = function (e) {
		var state = getScrollState.call(this, e);
		if (state.isUp) {
			if (state.bottom < this.getBottomDistance())
				onMoreHandler.call(this, state);
		}
	};

	var onMoreHandler = function (state) {
		if (this.$el.is(".is-loading"))
			return ;
		if (this.$el.is(".no-more"))
			return ;
		var target = this.$el.addClass("is-loading");
		
		var beLoading = false;
		var complete = function (hasMore) {
			if (!hasMore)
				target.addClass("no-more");
			target.removeClass("is-loading");
		};

		var contentView = this.getContentView();
		if (contentView) {
			if (Utils.isFunction(contentView.more)) {
				beLoading = contentView.more(function (err) {
					if (beLoading) {
						if (Utils.isFunction(contentView.hasMore))
							complete(contentView.hasMore());
						else
							complete(true);
					}
				});
			}
		}

		if (!beLoading) {
			var moreFunction = this.getMoreFunction();
			if (Utils.isFunction(moreFunction)) {
				beLoading = moreFunction(function (data) {
					setTimeout(function () {
						if (beLoading) {
							if (data && data.hasOwnProperty("hasMore"))
								complete(Utils.isTrue(data.hasMore));
							else
								complete(true);
						}
					}, 0);
				});
			}
		}

		this.trigger("more");

		if (!beLoading) {
			target.addClass("no-more");
			target.removeClass("is-loading");
		}
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

	// ====================================================
	Component.register(".ui-scrollbox", UIScrollBox);

})();