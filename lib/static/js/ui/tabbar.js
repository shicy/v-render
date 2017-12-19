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

		resizeChanged.call(this);

		this.$el.on("click", ".tab", itemClickHandler.bind(this));
		this.$el.on("click", ".btn", btnClickHandler.bind(this));
		this.$el.on("click", ".close", closeClickHandler.bind(this));
	};
	var _UITabbar = UITabbar.prototype = new Component.list();

	UITabbar.find = function (view) {
		return Component.find(view, ".ui-tabbar", UITabbar);
	};

	UITabbar.create = function (options) {
		return Component.create(options, UITabbar, TabbarRender);
	};

	// ====================================================
	_UITabbar.close = function (name) {
		if (Utils.isNotBlank(name)) {
			var item = this.$el.find(".tab[name='" + name + "']");
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

	_UITabbar.addItem = function (data, index) {
		var target = this.$el.find(".tabs");
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

	// ====================================================
	var resizeChanged = function () {
		this.$el.removeClass("over");
		if (this.$el.width() < this.$el.find(".tabs").width())
			this.$el.addClass("over");
	};

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
			var _new = {index: item.index(), name: item.attr("name")};
			var _old = oldItem ? {index: oldItem.index(), name: oldItem.attr("name")} : null;
			this.trigger("change", _new, _old);
		}
	};

	var btnClickHandler = function (e) {
		var btn = $(e.currentTarget);

		var items = this.$el.find(".tab");
		var frontItem = Utils.find(items, function (item) {
			return !item.is(".hide");
		});

		if (btn.is(".prev")) {
			frontItem.prev().removeClass("hide");
		}
		else if (btn.is(".next")) {
			if (this.$el.find(".tabs").width() > this.$el.find(".bar").width())
				frontItem.addClass("hide");
		}
	};

	var closeClickHandler = function (e) {
		var item = $(e.currentTarget).parent();
		closeInner.call(this, item, true);
		return false;
	};

	// ====================================================
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
		if (!!trigger)
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
