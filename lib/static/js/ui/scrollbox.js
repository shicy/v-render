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

		var scroller = this.getScrollContainer();
		scroller.on("scroll.scrollbox", onScrollHandler.bind(this));
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
			var container = this.$el.children(".container");
			container.append(content.$el || content);
		}
	};

	// 
	_UIScrollBox.getScrollContainer = function () {
		if (!this.scroller) {
			if (this.options.hasOwnProperty("scroller")) {
				this.scroller = this.options.scroller;
			}
			else {
				this.scroller = this.$el.attr("opt-scroll");
			}
			this.$el.removeAttr("opt-scroller");
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
	_UIScrollBox.getLoadDistance = function () {
		if (!this.loadDistance) {
			if (this.options.hasOwnProperty("loadDistance")) {
				this.loadDistance = this.options.loadDistance;
			}
			else {
				this.loadDistance = this.$el.attr("opt-l-d");
				this.$el.removeAttr("opt-l-d");
			}
			if (!this.loadDistance)
				this.loadDistance = this.isRenderAsRem() ? "0.7rem" : "70px";
			this.loadDistance = Utils.toPx(this.loadDistance);
		}
		return this.loadDistance;
	};
	_UIScrollBox.setLoadDistance = function (value) {
		this.options.loadDistance = value;
		this.$el.removeAttr("opt-l-d");
		this.loadDistance = null;
	};

	// ====================================================
	var onScrollHandler = function (e) {
		var state = getScrollState.call(this, e);
		if (state.isUp) {
			if (state.bottom < this.getLoadDistance())
				onMoreHandler.call(this, state);
		}
	};

	var onMoreHandler = function (state) {
		if (this.isLoading)
			return ;
		this.isLoading = false;
		
		var contentView = this.getContentView();
		if (contentView) {
			
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

		// console.log(this.lastState.top, state.top, state.isUp);
		return state;
	};

	// ====================================================
	Component.register(".ui-scrollbox", UIScrollBox);

})();