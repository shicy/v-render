// ========================================================
// 日历
// @author shicy <shicy85@163.com>
// Create on 2016-12-22
// ========================================================

(function () {
	if (VRender.Component.DatePicker)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var DatePickerRender = Component.Render.datepicker;

	///////////////////////////////////////////////////////
	var UIDatePicker = window.UIDatePicker = Component.DatePicker = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.tap("header > button", monthSwitchHandler.bind(this));
		this.tap("tbody td", dateChangeHandler.bind(this));

		if (this.isRenderAsApp()) {
			this.$el.on("tap", function (e) { return false; });
			this.$el.children(".content").on("touchstart touchmove touchend", touchSwipeHandler.bind(this));
		}
	};
	var _UIDatePicker = UIDatePicker.prototype = new Component.base();

	UIDatePicker.find = function (view) {
		return Component.find(view, ".ui-datepicker", UIDatePicker);
	};

	UIDatePicker.create = function (options) {
		return Component.create(options, UIDatePicker, DatePickerRender);
	};

	// ====================================================
	_UIDatePicker.getDate = function () {
		return Utils.toDate(this.$el.attr("data-dt"));
	};
	_UIDatePicker.setDate = function (value, trigger) {
		var date = Utils.toDate(value);
		if (date) {
			this.$el.attr("data-dt", Utils.toDateString(date, "yyyy/MM/dd"));
			reRenderPicker.call(this, date);
		}
		else {
			this.$el.removeAttr("data-dt");
			this.$el.find("td.selected").removeClass("selected");
		}
		if (!!trigger)
			this.trigger("change", this.getDate());
	};

	_UIDatePicker.getMinDate = function () {
		return Utils.toDate(this.$el.attr("opt-min"));
	};
	_UIDatePicker.setMinDate = function (value) {
		var date = Utils.toDate(value);
		if (date)
			this.$el.attr("opt-min", Utils.toDateString(date, "yyyy/MM/dd"));
		else
			this.$el.removeAttr("opt-min");
		reRenderPicker.call(this);
	};

	_UIDatePicker.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("opt-max"));
	};
	_UIDatePicker.setMaxDate = function (value) {
		var date = Utils.toDate(value);
		if (date)
			this.$el.attr("opt-max", Utils.toDateString(date, "yyyy/MM/dd"));
		else
			this.$el.removeAttr("opt-max");
		reRenderPicker.call(this);
	};

	// ====================================================
	var monthSwitchHandler = function (e) {
		var year = parseInt(this.$el.attr("opt-y"));
		var month = parseInt(this.$el.attr("opt-m"));
		var date = new Date(year, month, 1);
		date.setMonth(date.getMonth() + ($(e.currentTarget).is(".prev") ? -1 : 1));
		reRenderPicker.call(this, date);
	};

	var dateChangeHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;
		if (item.is(".selected"))
			return ;

		this.$el.find("tbody td.selected").removeClass("selected");
		item.addClass("selected");

		this.$el.attr("data-dt", item.attr("data-dt"));
		this.trigger("change", this.getDate());
	};

	var touchSwipeHandler = function (e) { // console.log(e);
		var touch = e.touches && e.touches[0];
		if (e.type == "touchstart") {
			this.touchData = {startX: touch.pageX};
			this.touchData.mainTable = this.$el.find("table.t0");
		}
		else if (e.type == "touchmove") {
			if (e.touches.length > 1)
				return ;

			var offset = touch.pageX - this.touchData.startX;
			if (!this.touchData.moving && Math.abs(offset) < 10)
				return ;
			this.touchData.moving = true;
			// this.touchData.endX = touch.pageX;
			this.touchData.lastOffset = offset;

			this.touchData.mainTable.css("transform", "translate(" + offset + "px,0px)");

			var table = null;
			if ((offset > 0 && !this.touchData.prevTable) || (offset < 0 && !this.touchData.nextTable)) {
				var year = parseInt(this.$el.attr("opt-y"));
				var month = parseInt(this.$el.attr("opt-m"));
				table = $("<table class='t1'><tbody></tbody></table>").appendTo(this.$el.children(".content"));
				if (offset > 0) {
					month -= 1;
					this.touchData.prevTable = table;
				}
				else {
					month += 1;
					this.touchData.nextTable = table;
				}
				DatePickerRender.renderPickerDate.call(this, $, this.$el, table.children("tbody"), new Date(year, month, 1));
			}

			table = offset > 0 ? this.touchData.prevTable : this.touchData.nextTable;
			if (!this.touchData.contentWidth)
				this.touchData.contentWidth = this.$el.children(".content").width();
			offset += this.touchData.contentWidth * (offset > 0 ? -1 : 1);
			table.css("transform", "translate(" + offset + "px,0px)");
		}
		else if (e.type == "touchend") {
			if (this.touchData.moving) {
				var offset = 0, delay = 200;
				if (Math.abs(this.touchData.lastOffset) > 20)
					offset += this.touchData.contentWidth * (this.touchData.lastOffset > 0 ? 1 : -1);
				var transition = "transform " + delay + "ms";
				this.touchData.mainTable.css("transition", transition);
				this.touchData.mainTable.css("transform", "translate(" + offset + "px,0px)");
				if (this.touchData.lastOffset > 0) {
					this.touchData.prevTable.css("transition", transition);
					this.touchData.prevTable.css("transform", "translate(0px,0px)");
				}
				else {
					this.touchData.nextTable.css("transition", transition);
					this.touchData.nextTable.css("transform", "translate(0px,0px)");
				}
				var self = this, touchData = this.touchData;
				setTimeout(function () {
					if (touchData.prevTable)
						touchData.prevTable.remove();
					if (touchData.nextTable)
						touchData.nextTable.remove();
					touchData.mainTable.css("transition", "");
					touchData.mainTable.css("transform", "");
					if (Math.abs(touchData.lastOffset) > 20) {
						var button = touchData.lastOffset > 0 ? ".prev" : ".next";
						self.$el.children("header").children(button).tap();
					}
				}, delay);
			}
		}
	};

	// ====================================================
	var reRenderPicker = function (pickerDate, table) {
		if (!pickerDate) {
			var year = parseInt(this.$el.attr("opt-y"));
			var month = parseInt(this.$el.attr("opt-m"));
			pickerDate = new Date(year, month, 1);
		}
		this.$el.find("header > label").text(DatePickerRender.getMonthStr(pickerDate));
		if (!table)
			table = this.$el.find("table.t0");
		var tbody = table.children("tbody").empty();
		DatePickerRender.renderPickerDate.call(this, $, this.$el, tbody, pickerDate);
		this.$el.attr("opt-y", pickerDate.getFullYear()).attr("opt-m", pickerDate.getMonth());
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-datepicker", UIDatePicker);

})();
