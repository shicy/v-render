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

		this.tap("header > button", onSwitchBtnHandler.bind(this));
		// this.tap("tbody td", dateChangeHandler.bind(this));

		// if (this.isRenderAsApp()) {
		// 	this.$el.on("tap", function (e) { return false; });
		// 	this.$el.children(".content").on("touchstart touchmove touchend", touchSwipeHandler.bind(this));
		// }
	};
	var _UIDatePicker = UIDatePicker.prototype = new Component.base();

	UIDatePicker.find = function (view) {
		return Component.find(view, ".ui-datepicker", UIDatePicker);
	};

	UIDatePicker.create = function (options) {
		return Component.create(options, UIDatePicker, DatePickerRender);
	};

	// ====================================================
	// 在修改的时候就要判断是否超出范围，所以这里不需要判断了
	_UIDatePicker.getDate = function (format) {
		if (this.isRangeDate()) {
			var start = Utils.toDate(this.$el.attr("data-start"));
			if (start) {
				var end = Utils.toDate(this.$el.attr("data-end")) || new Date(start.getTime());
				end = Utils.toDate(Utils.toDateString(end, "yyyy-MM-dd 23:59:59"));
				if (format) {
					start = Utils.toDateString(start, format);
					end = Utils.toDateString(end, format);
				}
				return [start, end];
			}
		}
		else {
			var date = Utils.toDate(this.$el.attr("data-dt"));
			if (date && format)
				return Utils.toDateString(date, format);
			return date;
		}
		return null;
	};

	// setDate(new Date()), setDate("2018-01-01"), setDate("2018-01-01", "2018-01-31")
	_UIDatePicker.setDate = function (value) {
		var snapshoot = this._snapshoot();
		var min = this.getMinDate(), max = this.getMaxDate();
		var tmin = getTime(min), tmax = getTime(max);
		if (this.isRangeDate()) {
			var start = Utils.toDate(arguments[0]), end = null;
			if (start) {
				end = Utils.toDate(arguments[1]) || new Date(start.getTime());
				var tstart = getTime(start), tend = getTime(end);
				if (tmin && tstart < tmin)
					start = min;
				if (tmax && tend > tmax)
					end = max;
				if (getTime(start) <= getTime(end)) {
					start = Utils.toDateString(start, "yyyy-MM-dd");
					end = Utils.toDateString(end, "yyyy-MM-dd");
				}
				else {
					start = end = null;
				}
			}
			this.$el.attr("data-start", start || "");
			this.$el.attr("data-end", end || "");
			value = {start: start, end: end};
		}
		else {
			var date = Utils.toDate(value);
			if (date) {
				var tdate = getTime(date);
				if ((tmin && tdate < tmin) || (tmax && tdate > tmax))
					date = null;
			}
			this.$el.attr("data-dt", date ? Utils.toDateString(date, "yyyy-MM-dd") : "");
			value = date;
		}
		rerender.call(this, value);
		snapshoot.done(value);
	};

	_UIDatePicker.getMinDate = function () {
		return Utils.toDate(this.$el.attr("opt-min"));
	};
	_UIDatePicker.setMinDate = function (value) {
		var snapshoot = this._snapshoot();
		var min = Utils.toDate(value);
		this.$el.attr("opt-min", min ? Utils.toDateString(min, "yyyy-MM-dd") : "");
		if (min) {
			var tmin = getTime(min);
			if (this.isRangeDate()) {
				var end = Utils.toDate(this.$el.attr("data-end"));
				if (end && tmin > getTime(end)) {
					this.$el.attr("data-start", "").attr("data-end", "");
				}
				else {
					var start = Utils.toDate(this.$el.attr("data-start"));
					if (start && tmin > getTime(start))
						this.$el.attr("data-start", Utils.toDateString(min, "yyyy-MM-dd"));
				}
			}
			else {
				var date = Utils.toDate(this.$el.attr("data-dt"));
				if (date && tmin > getTime(date))
					this.$el.attr("data-dt", "");
			}
		}
		rerender.call(this);
		snapshoot.done();
	};

	_UIDatePicker.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("opt-max"));
	};
	_UIDatePicker.setMaxDate = function (value) {
		var snapshoot = this._snapshoot();
		var max = Utils.toDate(value);
		this.$el.attr("opt-max", max ? Utils.toDateString(max, "yyyy-MM-dd") : "");
		if (max) {
			var tmax = getTime(max);
			if (this.isRangeDate()) {
				var start = Utils.toDate(this.$el.attr("data-start"));
				if (start && tmax < getTime(start)) {
					this.$el.attr("data-start", "").attr("data-end", "");
				}
				else {
					var end = Utils.toDate(this.$el.attr("data-end"));
					if (end && tmax < getTime(end))
						this.$el.attr("data-end", Utils.toDateString(max, "yyyy-MM-dd"));
				}
			}
			else {
				var date = Utils.toDate(this.$el.attr("data-dt"));
				if (date && tmax < getTime(date))
					this.$el.attr("data-dt", "");
			}
		}
		rerender.call(this);
		snapshoot.done();
	};

	_UIDatePicker.isRangeDate = function () {
		return this.$el.is(".is-range");
	};

	// ====================================================
	_UIDatePicker._snapshoot_shoot = function (state, selectedDate) {
		state.selectedDate = selectedDate || this.getDate();
		state.data = state.selectedDate;
	};

	_UIDatePicker._snapshoot_compare = function (state, selectedDate) {
		var date = selectedDate || this.getDate();
		if (date && state.selectedDate) {
			if (this.isRangeDate()) {
				return getTime(date.start) == getTime(state.selectedDate.start)
					&& getTime(date.end) == getTime(state.selectedDate.end);
			}
			else {
				return getTime(date) == getTime(state.selectedDate);
			}
		}
		return true;
	};

	// ====================================================
	var onSwitchBtnHandler = function (e) {
		var btn = $(e.currentTarget);
		var title = btn.parent(), table = null;
		if (title.is(".s"))
			table = this.$el.find(".table.s");
		else if (title.is(".e"))
			table = this.$el.find(".table.e");
		else 
			table = this.$el.find(".table.t0");

		var year = parseInt(table.attr("data-y"));
		var month = parseInt(table.attr("data-m"));
		var date = new Date(year, month, 1);
		date.setMonth(date.getMonth() + ($(e.currentTarget).is(".prev") ? -1 : 1));
		// rerender.call(this, date);
	};

	// var monthSwitchHandler = function (e) {
	// 	var year = parseInt(this.$el.attr("opt-y"));
	// 	var month = parseInt(this.$el.attr("opt-m"));
	// 	var date = new Date(year, month, 1);
	// 	date.setMonth(date.getMonth() + ($(e.currentTarget).is(".prev") ? -1 : 1));
	// 	reRenderPicker.call(this, date);
	// };

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
	var rerender = function (pickerDate) {

	};

	var reRenderPicker = function (pickerDate, table) {
		// if (!pickerDate) {
		// 	var year = parseInt(this.$el.attr("opt-y"));
		// 	var month = parseInt(this.$el.attr("opt-m"));
		// 	pickerDate = new Date(year, month, 1);
		// }
		// this.$el.find("header > label").text(DatePickerRender.getMonthStr(pickerDate));
		// if (!table)
		// 	table = this.$el.find("table.t0");
		// var tbody = table.children("tbody").empty();
		// DatePickerRender.renderPickerDate.call(this, $, this.$el, tbody, pickerDate);
		// this.$el.attr("opt-y", pickerDate.getFullYear()).attr("opt-m", pickerDate.getMonth());
	};

	var getTime = function (date) {
		if (date)
			return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
		return 0;
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-datepicker", UIDatePicker);

})();
