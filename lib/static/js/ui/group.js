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
	var GroupRender = VRender.Component.Render.group;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

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
	_UIGroup.doLayout = function () {
		layoutChanged.call(this);
	};

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
		return this.addChildren(Array.prototype.slice.call(arguments));
	};

	_UIGroup.addChild = function (child) {
		if (Utils.isNotBlank(child)) {
			this.$el.append(child.$el || child);
			layoutChanged.call(this);
		}
		return child;
	};

	_UIGroup.addChildren = function (children) {
		var self = this;
		Utils.each(Utils.toArray(children), function (child) {
			self.addChild(child);
		});
		return this;
	};

	// ====================================================
	var layoutChanged = function () {
		if (this.layoutTimerId) {
			clearTimeout(this.layoutTimerId);
		}
		var self = this;
		this.layoutTimerId = setTimeout(function () {
			self.layoutTimerId = 0;
			GroupRender.updateViewGaps.call(self, $, self.$el);
		}, 0);
	};

	///////////////////////////////////////////////////////
	// Component.register(".ui-group", UIGroup); // 默认不实例化

})();