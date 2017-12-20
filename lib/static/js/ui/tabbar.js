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
		if (this.init(view, options) != this)
			return Component.get(view);

		this.tabsView = this.$el.find(".tabs");

		this.tap(".tab", itemClickHandler.bind(this));
		this.tap(".close", closeClickHandler.bind(this));
		this.$el.on("mousedown", ".btn", btnMouseHandler.bind(this));
		this.$el.on("mouseup", ".btn", btnMouseHandler.bind(this));
		this.$el.on("mouseleave", ".btn", btnMouseHandler.bind(this));
		$(window).on("resize", windowResizeHandler.bind(this));

		doInit.call(this);
	};
	var _UITabbar = UITabbar.prototype = new Component.list();

	UITabbar.find = function (view) {
		return Component.find(view, ".ui-tabbar", UITabbar);
	};

	UITabbar.create = function (options) {
		return Component.create(options, UITabbar, TabbarRender);
	};

	// ====================================================
	_UITabbar.setData = function (value) {
		value = Component.list.doAdapter.call(this, value);
		this.options.data = value;
		Component.list.setSelectedIndex.call(this, []);
		TabbarRender.renderItems.call(this, $, this.tabsView.empty());
	};

	_UITabbar.addItem = function (data, index) {
		var target = this.tabsView;
		var item = renderTabItem.call(this, $, target, data);
		index = parseInt(index);
		if (!isNaN(index) && index >= 0) {
			var items = target.children();
			if (index < items.length - 1)
				items.eq(index).before(item.detach());
		}
	};

	_UITabbar.removeItem = function (data) {
		if (Utils.isNotBlank(data)) {
			if (typeof data === "string")
				this.close(data);
			else if (data.name)
				this.close(data.name);
		}
	};

	_UITabbar.removeItemAt = function (index) {
		index = parseInt(index);
		if (!isNaN(index)) {
			var item = this.$el.find(".tab").eq(index);
			if (item && item.length > 0)
				closeInner.call(this, item, true);
		}
	};

	_UITabbar.setEnabled = function (name) {
		if (Utils.isNotBlank(name))
			this.$el.find(".tab[name='" + name + "']").removeClass("disabled");
	};

	_UITabbar.setDisabled = function (name) {
		if (Utils.isNotBlank(name))
			this.$el.find(".tab[name='" + name + "']").addClass("disabled");
	};

	_UITabbar.close = function (name) {
		if (Utils.isNotBlank(name)) {
			var item = this.tabsView.find(".tab[name='" + name + "']");
			if (item && item.length > 0)
				closeInner.call(this, item, true);
		}
	};

	_UITabbar.getJQItems = function () {
		return this.$el.find(".tab");
	};

	_UITabbar.isMultiple = function () {
		return false; // 只能是单选
	};

	// ====================================================
	var itemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;

		var changed = !item.is(".selected");
		var oldItem = this.$el.find(".tab.selected");
		if (changed) {
			if (oldItem && oldItem.length > 0) {
				oldItem.removeClass("selected");
				this.trigger("hide", oldItem.attr("name"), oldItem.index());
			}
			item.addClass("selected");
			this.trigger("show", item.attr("name"), item.index());
		}

		this.trigger("click", item.attr("name"), item.index());

		if (changed) {
			updateThumb.call(this);
			var _new = {index: item.index(), name: item.attr("name")};
			var _old = oldItem ? {index: oldItem.index(), name: oldItem.attr("name")} : null;
			this.trigger("change", _new, _old);
		}
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

	var closeClickHandler = function (e) {
		var item = $(e.currentTarget).parent();
		closeInner.call(this, item, true);
		return false;
	};

	var windowResizeHandler = function (e) {
		layoutChanged.call(this);
	};

	// ====================================================
	var doInit = function () {
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
				thumb.css("left", left + "px");
				thumb.width(selectedItem.outerWidth());
			}
			else {
				thumb.width(0);
			}
		}, 60);
	};

	var closeInner = function (item, trigger) {
		var temp1 = {index: item.index(), name: item.attr("name")};

		var nextTab = null;
		if (item.is(".selected")) {
			nextTab = item.next();
			if (!nextTab || nextTab.length == 0)
				nextTab = item.prev();
			this.trigger("hide", temp1.name, temp1.index);
		}

		item.remove();
		if (trigger)
			this.trigger("close", temp1.name, temp1.index);

		if (nextTab && nextTab.length > 0) {
			nextTab.addClass("selected");
			var temp2 = {index: nextTab.index(), name: nextTab.attr("name")};
			this.trigger("show", temp2.name, temp2.index);
			this.trigger("change", temp2, temp1);
		}
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-tabbar", UITabbar);

})();
