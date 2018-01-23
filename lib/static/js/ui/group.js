// ========================================================
// 组视图容器
// 可用属性：
// 	orientation: 布局方向，"vertical", "horizontial"
// 	gap: 元素间隔距离
// 	align: 对齐方式，"left", "center", "right", "top", "middle", "bottom"
// @author shicy <shicy85@163.com>
// Create on 2017-12-13
// ========================================================

(function () {
	if (VRender.Component.Group)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var GroupRender = Component.Render.group;

	///////////////////////////////////////////////////////
	var UIGroup = window.UIGroup = Component.Group = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UIGroup = UIGroup.prototype = new Component.base();

	UIGroup.find = function (view) {
		return Component.find(view, ".ui-group", UIGroup);
	};

	UIGroup.create = function (options) {
		return Component.create(options, UIGroup, GroupRender);
	};

	// ====================================================
	_UIGroup.setOrientation = function (value) {
		this.$el.removeClass(GroupRender.HORIZONTIAL).removeClass(GroupRender.VERTICAL);
		this.$el.removeAttr("opt-orientation");
		if (value === GroupRender.HORIZONTIAL || value === GroupRender.VERTICAL) {
			this.$el.addClass(value).attr("opt-orientation", value);
		}
		layoutChanged.call(this);
	};

	_UIGroup.setGap = function (value) {
		this.$el.removeAttr("opt-gap");
		this.$el.attr("opt-gap", (parseInt(value) || null));
		layoutChanged.call(this);
	};

	_UIGroup.setAlign = function (value) {
		this.$el.removeAttr("opt-align");
		this.$el.attr("opt-align", (value || null));
		layoutChanged.call(this);
	};

	_UIGroup.append = function (values) {
		if (!arguments || arguments.length == 0)
			return this;
		for (var i = 0, l = arguments.length; i < l; i++) {
			var item = arguments[i];
			if (Utils.isArray(item)) {
				for (var m = 0, n = item.length; m < n; m++) {
					this.add(item[m]);
				}
			}
			else {
				this.add(item);
			}
		}
		return this;
	};

	_UIGroup.add = function (child, index) {
		if (Utils.isNotBlank(child)) {
			index = (isNaN(index) || index === "") ? -1 : parseInt(index);
			var children = this.$el.children();
			if (index >= 0 && index < children.length) {
				children.eq(index).before(child.$el || child);
			}
			else {
				this.$el.append(child.$el || child);
			}
			layoutChanged.call(this);
		}
		return child;
	};

	_UIGroup.removeAt = function (index) {
		var item = this.$el.children().eq(index).remove();
		layoutChanged.call(this);
		return item;
	};

	// ====================================================
	var layoutChanged = function () {
		if (this.layoutTimerId) {
			clearTimeout(this.layoutTimerId);
		}
		var self = this;
		this.layoutTimerId = setTimeout(function () {
			self.layoutTimerId = 0;
			GroupRender.updateLayout.call(self, $, self.$el);
		}, 0);
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-group", UIGroup);

})();