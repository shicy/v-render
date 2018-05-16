// ========================================================
// 选项卡
// @author shicy <shicy85@163.com>
// Create on 2017-03-19
// ========================================================

(function () {
	if (VRender.Component.Tabbar)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var TabbarRender = Component.Render.tabbar;

	///////////////////////////////////////////////////////
	var UITabbar = window.UITabbar = Component.Tabbar = function (view, options) {
		if (!Component.base.isElement(view))
			return UITabbar.create(view);
		
		if (this.init(view, options) != this)
			return Component.get(view);

		this.tabsView = this.$el.find(".tabs");

		this.$el.on("tap", ".tab", itemClickHandler.bind(this));
		this.$el.on("tap", ".close", closeClickHandler.bind(this));

		if (this.isRenderAsApp()) {
			this.$el.on("touchstart", appTouchHandler.bind(this));
			this.$el.on("touchmove", appTouchHandler.bind(this));
			this.$el.on("touchend", appTouchHandler.bind(this));
			this.$el.on("taphold", ".tab", appTouchHoldHandler.bind(this));
		}
		else {
			this.$el.on("mousedown", ".btn", btnMouseHandler.bind(this));
			this.$el.on("mouseup", ".btn", btnMouseHandler.bind(this));
			this.$el.on("mouseleave", ".btn", btnMouseHandler.bind(this));
			$(window).on("resize", windowResizeHandler.bind(this));
		}

		doLayout.call(this);
	};
	var _UITabbar = UITabbar.prototype = new Component.select();

	UITabbar.find = function (view) {
		return Component.find(view, ".ui-tabbar", UITabbar);
	};

	UITabbar.create = function (options) {
		return Component.create(options, UITabbar, TabbarRender);
	};

	// ====================================================
	_UITabbar.setSelectedIndex = function (value) {
		var index = Utils.getIndexValue(value);
		setActive.call(this, (index >= 0 ? this._getItems().eq(index) : null));
		doLayout.call(this);
	};

	_UITabbar.removeItemAt = function (index) {
		this.close(Utils.getIndexValue(index));
	};

	_UITabbar.close = function (value) {
		var item = null;
		if (typeof value === "number") {
			if (value >= 0)
				item = this.tabsView.find(".tab").eq(value);
		}
		else if (Utils.isNotBlank(value)) {
			item = this.tabsView.find(".tab[name='" + value + "']");
		}
		if (item && item.length > 0) {
			closeInner.call(this, item);
			return item;
		}
		return null;
	};

	_UITabbar.isMultiple = function () {
		return false; // 只能是单选
	};

	// ====================================================
	_UITabbar._dataChanged = function (data) {
		layoutChanged.call(this);
	};

	_UITabbar._getItemContainer = function () {
		return this.$el.find(".tabs");
	};

	_UITabbar._getItems = function () {
		return this.$el.find(".tab");
	};

	_UITabbar._getNewItem = function ($, itemContainer, data, index) {
		return TabbarRender.getNewItem.call(this, $, itemContainer, data, index);
	};

	_UITabbar._renderOneItem = function ($, item, data, index, bSelected) {
		return TabbarRender.renderOneItem.call(this, $, item, data, index, bSelected);
	};

	// ====================================================
	var itemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;
		setActive.call(this, item);
		this.trigger("itemclick", this._getItemData(item));
	};

	var btnMouseHandler = function (e) {
		var btn = $(e.currentTarget);

		if (this.btnMouseTimerId) {
			clearInterval(this.btnMouseTimerId);
			this.btnMouseTimerId = 0;
		}

		if (e.type == "mousedown") {
			var self = this;
			var target = this.tabsView;
			var left = parseInt(target.attr("opt-l")) || 0;
			var step = ($(e.currentTarget).is(".prev") ? 1 : -1) * 20;
			this.btnMouseTimerId = setInterval(function () {
				left += step;
				scrollTo.call(self, left);
			}, 50);
		}
	};

	var appTouchHandler = function (e) {
		var touch = e.touches && e.touches[0];
		if (e.type === "touchstart") {
			this.touchData = {startX: touch.pageX};
			this.touchData.startL = parseInt(this.tabsView.attr("opt-l")) || 0;
		}
		else if (e.type === "touchmove") {
			if (e.touches.length > 1 || !this.$el.is(".over"))
				return ;

			var offset = touch.pageX - this.touchData.startX;
			if (!this.touchData.moving && Math.abs(offset) < 10)
				return ;
			this.touchData.moving = true;
			// this.touchData.lastOffset = offset;

			var left = this.touchData.startL + offset;
			scrollTo.call(this, left);
		}
		else if (e.type === "touchend") {
			//
		}
	};

	// 长按可删除
	var appTouchHoldHandler = function (e) { console.log(e);

	};

	var closeClickHandler = function (e) {
		var item = $(e.currentTarget).parent();
		closeInner.call(this, item);
		return false;
	};

	var windowResizeHandler = function (e) {
		if (this._isMounted()) {
			layoutChanged.call(this);
		}
		else {
			$(window).off("resize", arguments.callee);
		}
	};

	// ====================================================
	var doLayout = function () {
		layoutChanged.call(this);

		if (this.$el.is(".over")) {
			var selectedItem = this.tabsView.find(".tab.selected");
			if (selectedItem && selectedItem.length > 0) {
				var container = this.tabsView.parent();
				var itemOffset = selectedItem.offset().left;
				var containerOffset = container.offset().left;
				var left = parseInt(this.tabsView.attr("opt-l")) || 0;
				if (itemOffset < containerOffset) {
					scrollTo.call(this, left + containerOffset - itemOffset);
				}
				else if (itemOffset - containerOffset > container.width()) {
					scrollTo.call(this, left - 
						(itemOffset - containerOffset - container.width() + selectedItem.outerWidth()));
				}
			}
		}

		updateThumb.call(this);
	};

	var layoutChanged = function () {
		var target = this.tabsView;
		if (target.width() <= this.$el.width()) {
			this.$el.removeClass("over over-l over-r");
			scrollTo.call(this, 0);
		}
		else {
			this.$el.addClass("over");
			scrollTo.call(this, parseInt(target.attr("opt-l")) || 0);
		}
	};

	var scrollTo = function (position) {
		var w1 = this.tabsView.width();
		var w2 = this.tabsView.parent().width();

		if (position >= 0) {
			position = 0;
		}
		else {
			if (position + w1 < w2)
				position = w2 - w1;
		}

		this.$el.removeClass("over-l over-r");
		if (position < 0)
			this.$el.addClass("over-l");
		if (position + w1 > w2)
			this.$el.addClass("over-r");

		if (position) {
			this.tabsView.css("transform", "translate(" + position + "px,0px)");
			this.tabsView.attr("opt-l", position);
		}
		else {
			this.tabsView.css("transform", "").removeAttr("opt-l");
		}

		updateThumb.call(this);
	};

	var updateThumb = function () {
		if (this.thumbTimerId) {
			clearTimeout(this.thumbTimerId);
		}
		var self = this;
		this.thumbTimerId = setTimeout(function () {
			self.thumbTimerId = 0;
			var thumb = self.$el.find(".thumb");
			var selectedItem = self.tabsView.find(".tab.selected");
			if (selectedItem && selectedItem.length > 0) {
				var left = selectedItem.offset().left;
				left -= self.tabsView.parent().offset().left;
				var width = selectedItem.outerWidth();
				if (self.isRenderAsApp()) {
					var innerWidth = selectedItem.width();
					left += (width - innerWidth) / 2;
					width = innerWidth;
				}
				thumb.css("left", left + "px");
				thumb.width(width);
			}
			else {
				thumb.width(0);
			}
		}, 100);
	};

	var setActive = function (item) {
		var hasItem = item && item.length > 0;
		if (hasItem && item.is(".selected"))
			return ;

		var index = hasItem ? item.index() : [];
		Component.select.setSelectedIndex.call(this, index);

		var oldItem = getSelectedTab.call(this), oldItemData = null;
		if (oldItem && oldItem.length > 0) {
			oldItem.removeClass("selected");
			oldItemData = this._getItemData(oldItem);
			this.trigger("hide", oldItemData);
		}

		var itemData = null;
		if (hasItem) {
			item.addClass("selected");
			itemData = this._getItemData(item);
			this.trigger("show", itemData);
		}

		updateThumb.call(this);

		var self = this;
		setTimeout(function () {
			self.trigger("change", itemData, oldItemData);
		}, 0);
	};

	var closeInner = function (item) {
		var isSelected = item.is(".selected");
		var itemData = this._getItemData(item);
		var nextTab = null, nextData = null;

		if (isSelected) {
			nextTab = item.next();
			if (!nextTab || nextTab.length == 0)
				nextTab = item.prev();
			this.trigger("hide", itemData);
		}

		Component.item.removeItem.call(this, item);
		this.trigger("close", itemData);

		if (nextTab && nextTab.length > 0) {
			nextTab.addClass("selected");
			nextData = this._getItemData(nextTab);
			this.trigger("show", nextData);
			Component.select.setSelectedIndex.call(this, nextTab.index());
		}
		else {
			Component.select.setSelectedIndex.call(this, []);
		}

		if (isSelected)
			this.trigger("change", nextData, itemData);

		layoutChanged.call(this);
	};

	var getSelectedTab = function () {
		return this.tabsView.find(".tab.selected");
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-tabbar", UITabbar);

})();