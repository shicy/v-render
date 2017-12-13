// ========================================================
// 选项卡
// @author shicy <shicy85@163.com>
// Create on 2017-03-19
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Tabbar)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderItems = (isFront ? VRender.Component : require("./_base")).HolderItems;


	///////////////////////////////////////////////////////
	var Holder = function (context, options) {
		HolderItems.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderItems();

	_Holder.render = function ($, target) {
		HolderItems.render.call(this, $, target);
		target.addClass("ui-tabbar");
		renderTabItems.call(this, $, target);
		renderButtons.call(this, $, target);
		return this;
	};

	// ====================================================
	var renderTabItems = function ($, target) {
		target = $("<div class='bar'></div>").appendTo(target);
		var tabs = $("<ul class='tabs'></ul>").appendTo(target);

		var self = this;
		Utils.each(Utils.toArray(this.options.data), function (data, index) {
			renderTabItem.call(self, $, tabs, data, index);
		});
	};

	var renderTabItem = function ($, target, data, index) {
		if (Utils.isBlank(data))
			return ;
		if (typeof data === "string")
			data = {name: data, label: data};
		var tab = $("<li class='tab'></li>").appendTo(target);
		tab.append("<span>" + this.getDataLabel(data) + "</span>");
		if (Utils.isNotBlank(data.name))
			tab.attr("name", data.name);
		if (Utils.isTrue(data.closable)) {
			tab.addClass("closable");
			tab.append("<i class='close'></i>");
		}
		if (Utils.isTrue(data.disabled))
			tab.addClass("disabled");
		if (this.isDataSelected(data, index))
			tab.addClass("selected");
		return tab;
	};

	var renderButtons = function ($, target) {
		target = $("<div class='btns'></div>").appendTo(target);
		target.append("<span class='btn prev'>&lt;</span>");
		target.append("<span class='btn next'>&gt;</span>");
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;


	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UITabbar = window.UITabbar = Component.Tabbar = function (view, options) {
		if (this.init(view, options) != this)
			return Component.get(view);

		resizeChanged.call(this);

		this.$el.on("click", ".tab", itemClickHandler.bind(this));
		this.$el.on("click", ".btn", btnClickHandler.bind(this));
		this.$el.on("click", ".close", closeClickHandler.bind(this));
	};
	var _UITabbar = UITabbar.prototype = new Component.base();

	UITabbar.find = function (view) {
		return Component.find(view, ".ui-tabbar", UITabbar);
	};

	UITabbar.create = function (options) {
		return Component.create(options, UITabbar, Holder);
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

	// ====================================================
	// Component.register(".ui-tabbar", UITabbar);

})(typeof VRender !== "undefined");
