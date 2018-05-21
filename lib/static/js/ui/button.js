// ========================================================
// 自定义按钮
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function () {
	if (VRender.Component.Button)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var ButtonRender = Component.Render.button;

	///////////////////////////////////////////////////////
	var UIButton = window.UIButton = Component.Button = function (view, options) {
		if (!Component.base.isElement(view))
			return UIButton.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);

		if (this.isRenderAsApp()) {
			this.$el.on("tap", ".dropdown", onDropdownTouchHandler.bind(this));
		}
		
		this.$el.on("tap", ".btn", onBtnClickHandler.bind(this));
		this.$el.on("tap", ".dropdownbtn", onDropdownBtnHandler.bind(this));
		this.$el.on("tap", ".dropdown li", onDropdownItemHandler.bind(this));
	};
	var _UIButton = UIButton.prototype = new Component.base();

	UIButton.find = function (view) {
		return Component.find(view, ".ui-btn", UIButton);
	};

	UIButton.create = function (options) {
		return Component.create(options, UIButton, ButtonRender);
	};

	// ====================================================
	_UIButton.getLabel = function () {
		return this.options.label;
	};

	_UIButton.setLabel = function (value) {
		this.options.label = value;
		var button = this.$el.children(".btn");
		button.children("span").remove();
		if (Utils.isNotBlank(value)) {
			$("<span></span>").appendTo(button).text(Utils.trimToEmpty(value) || " ");
		}
	};

	_UIButton.waiting = function (time) {
		if (Utils.isNull(time) || time === true)
			time = parseInt(this.$el.attr("opt-wait")) || -1;
		else
			time = Math.max(0, parseInt(time)) || 0;
		doWaiting.call(this, time);
	};

	_UIButton.isWaiting = function () {
		return this.$el.is(".waiting");
	};

	_UIButton.setWaiting = function (value) {
		if (value === true || Utils.isNull(value))
			value = -1;
		else
			value = Math.max(0, parseInt(value)) || 0;
		this.$el.attr("opt-wait", value);
	};

	// ====================================================
	var onBtnClickHandler = function (e) {
		if (this.$el.is(".disabled, .waiting"))
			return ;
		var target = this.$el;
		var link = target.attr("data-lnk");
		if (link) {
			window.open(link, "_self");
		}
		else {
			var isToggle = target.attr("opt-toggle") == 1;
			if (target.is(".has-items")) {
				if (!isToggle) {
					showDropdown.call(this);
					return ;
				}
			}
			else if (isToggle) {
				if (target.attr("active") == 1)
					target.removeAttr("active");
				else
					target.attr("active", "1");
			}

			this.trigger("tap", target.attr("name"));

			var waitTime = parseInt(target.attr("opt-wait"));
			if (waitTime) {
				doWaiting.call(this, waitTime);
			}
		}
	};

	var onDropdownBtnHandler = function (e) {
		if (this.$el.is(".disabled, .waiting"))
			return false;
		showDropdown.call(this);
		return false;
	};

	var onDropdownTouchHandler = function (e) {
		if ($(e.target).is(".dropdown"))
			hideDropdown.call(this);
	};

	var onDropdownItemHandler = function (e) {
		var item = $(e.currentTarget);
		var name = item.attr("name") || "";
		if (this.$el.attr("opt-toggle") == 1) {
			this.$el.attr("name", name);
			this.$el.children(".btn").find("span").text(item.text());
		}
		this.trigger("tap", item.attr("name"));
		hideDropdown.call(this);
		return false;
	};

	var onMouseHandler = function (e) {
		if (this.t_mouse) {
			clearTimeout(this.t_mouse);
			this.t_mouse = 0;
		}
		if (e.type == "mouseleave") {
			var self = this;
			this.t_mouse = setTimeout(function () {
				self.t_mouse = 0;
				hideDropdown.call(self);
			}, 500);
		}
	};

	// ====================================================
	var showDropdown = function () {
		if (this.$el.is(".show-dropdown"))
			return ;

		var target = this.$el.addClass("show-dropdown");
		var dropdown = target.children(".dropdown");

		var maxDropdownHeight = this.isRenderAsApp() ? ($(window).height() * 0.8) : 220;
		var dropdownItems = dropdown.children();
		if (maxDropdownHeight > dropdownItems[0].scrollHeight) {
			maxDropdownHeight = dropdownItems[0].scrollHeight;
			dropdownItems.css("maxHeight", maxDropdownHeight);
		}

		if (this.isRenderAsApp()) {
			$("html,body").addClass("ui-scrollless");
		}
		else {
			target.on("mouseenter", onMouseHandler.bind(this));
			target.on("mouseleave", onMouseHandler.bind(this));

			var offset = Utils.offset(dropdown, this._getScrollContainer(), 0, maxDropdownHeight);
			if (offset.isOverflowY)
				target.addClass("show-before");
		}

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);
	};

	var hideDropdown = function () {
		if (!this.$el.is(".show-dropdown"))
			return ;

		var target = this.$el.addClass("animate-out");
		target.children(".dropdown").children().css("maxHeight", "");

		if (this.isRenderAsApp()) {
			$("html,body").removeClass("ui-scrollless");
		}
		else {
			target.off("mouseenter").off("mouseleave");
		}

		setTimeout(function () {
			target.removeClass("show-dropdown").removeClass("show-before");
			target.removeClass("animate-in");
			target.removeClass("animate-out");
		}, 200);
	};

	var doWaiting = function (time) {
		if (this.t_wait) {
			clearTimeout(this.t_wait);
			this.t_wait = 0;
		}
		if (time) {
			var target = this.$el.addClass("waiting");
			if (time > 0) {
				var self = this;
				this.t_wait = setTimeout(function () {
					self.t_wait = 0;
					target.removeClass("waiting");
				}, time);
			}
		}
		else {
			this.$el.removeClass("waiting");
		}
	};

	// ====================================================
	Component.register(".ui-btn", UIButton);

})();