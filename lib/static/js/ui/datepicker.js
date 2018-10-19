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
		if (!Component.base.isElement(view))
			return UIDatePicker.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.$el.on("tap", "header .title button", onSwitchBtnHandler.bind(this));
		this.$el.on("tap", "section td", onDateClickHandler.bind(this));
		this.$el.on("tap", "footer .okbtn", onSubmitBtnHandler.bind(this));
		this.$el.on("tap", "footer .cancelbtn", onCancelBtnHandler.bind(this));

		if (this.isRenderAsApp()) {
			this.$el.on("tap", function (e) { return false; });
			this.$el.on("tap", "header .today", onTodayBtnHandler.bind(this));
			this.$el.on("tap", "header .clear", onClearBtnHandler.bind(this));

			var tables = this.$el.children("section");
			tables.on("touchstart", touchSwipeHandler.bind(this));
			tables.on("touchmove", touchSwipeHandler.bind(this));
			tables.on("touchend", touchSwipeHandler.bind(this));
		}
	};
	var _UIDatePicker = UIDatePicker.prototype = new Component.base();

	UIDatePicker.find = function (view) {
		return Component.find(view, ".ui-datepicker", UIDatePicker);
	};

	UIDatePicker.create = function (options) {
		return Component.create(options, UIDatePicker, DatePickerRender);
	};

	UIDatePicker.instance = function (target) {
		return Component.instance(target, ".ui-datepicker");
	};

	// ====================================================
	// 在修改的时候就要判断是否超出范围，所以这里不需要判断了
	_UIDatePicker.getDate = function (format) {
		if (this.isRangeDate()) {
			var start = Utils.toDate(this.$el.attr("data-start"));
			if (start) {
				var end = Utils.toDate(this.$el.attr("data-end")) || new Date(start.getTime());
				end = Utils.toDate(Utils.toDateString(end, "yyyy-MM-dd 23:59:59"));
				if (Utils.isNotBlank(format)) {
					start = Utils.toDateString(start, format);
					end = Utils.toDateString(end, format);
				}
				return [start, end];
			}
		}
		else {
			var date = Utils.toDate(this.$el.attr("data-dt"));
			if (date && Utils.isNotBlank(format))
				return Utils.toDateString(date, format);
			return date;
		}
		return null;
	};

	// setDate(new Date()), setDate("2018-01-01"), setDate("2018-01-01", "2018-01-31")
	_UIDatePicker.setDate = function (value) {
		var snapshoot = this._snapshoot();
		if (this.isRangeDate()) {
			var start = Utils.toDate(arguments[0]), end = null;
			if (start) {
				end = Utils.toDate(arguments[1]) || new Date(start.getTime());
				var tstart = getTime(start), tend = getTime(end);
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
		}
		else {
			var date = Utils.toDate(value);
			this.$el.attr("data-dt", date ? Utils.toDateString(date, "yyyy-MM-dd") : "");
		}
		if (!snapshoot.compare())
			rerender.call(this, this.getDate());
		snapshoot.done();
	};

	_UIDatePicker.getMinDate = function () {
		return Utils.toDate(this.$el.attr("opt-min"));
	};
	_UIDatePicker.setMinDate = function (value) {
		var min = Utils.toDate(value);
		if (getTime(min) != getTime(this.getMinDate())) {
			this.$el.attr("opt-min", min ? Utils.toDateString(min, "yyyy-MM-dd") : "");
			rerender.call(this);
		}
	};

	_UIDatePicker.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("opt-max"));
	};
	_UIDatePicker.setMaxDate = function (value) {
		var max = Utils.toDate(value);
		if (getTime(max) != getTime(this.getMaxDate())) {
			this.$el.attr("opt-max", max ? Utils.toDateString(max, "yyyy-MM-dd") : "");
			rerender.call(this);
		}
	};

	_UIDatePicker.isRangeDate = function () {
		return this.$el.is(".is-range");
	};

	_UIDatePicker.submit = function () {
		onSubmitBtnHandler.call(this);
	};

	_UIDatePicker.cancel = function () {
		onCancelBtnHandler.call(this);
	};


	// ====================================================
	_UIDatePicker._snapshoot_shoot = function (state, selectedDate) {
		state.selectedDate = selectedDate || this.getDate();
		state.pickerDate = getCurrentPickerDate.call(this);
		state.data = state.selectedDate;
	};

	_UIDatePicker._snapshoot_compare = function (state, selectedDate) {
		var date = selectedDate || this.getDate();
		if (date && state.selectedDate) {
			if (this.isRangeDate()) {
				return getTime(date[0]) == getTime(state.selectedDate[0])
					&& getTime(date[1]) == getTime(state.selectedDate[1]);
			}
			return getTime(date) == getTime(state.selectedDate);
		}
		return !(date || state.selectedDate);
	};

	// ====================================================
	var onSwitchBtnHandler = function (e) {
		var btn = $(e.currentTarget);
		var table = null;
		if (this.isRangeDate() && !this.isRenderAsApp()) {
			var title = btn.parent();
			if (title.is(".s"))
				table = this.$el.find(".table.s");
			else if (title.is(".e"))
				table = this.$el.find(".table.e");
		}
		else {
			table = this.$el.find(".table.t0");
		}

		var year = parseInt(table.attr("data-y"));
		var month = parseInt(table.attr("data-m"));
		var date = new Date(year, month, 1);
		if (btn.is(".y")) {
			date.setFullYear(year + (btn.is(".prev") ? -1 : 1));
		}
		else {
			date.setMonth(month + (btn.is(".prev") ? -1 : 1));
		}
		table.attr("data-y", date.getFullYear()).attr("data-m", date.getMonth());

		rerender.call(this);
	};

	var onDateClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;

		if (this.isRangeDate()) {
			if (!this.selectedSnapshoot)
				this.selectedSnapshoot = this._snapshoot();

			if (this.lastSelectedDate && this.lastSelectedDate.length == 1) { // 第2次点击
				var end = Utils.toDate(item.attr("data-dt"));
				if (end.getTime() >= this.lastSelectedDate[0].getTime())
					this.lastSelectedDate.push(end);
				else
					this.lastSelectedDate.unshift(end);
			}
			else { // 第1次点击
				this.lastSelectedDate = [];
				this.lastSelectedDate.push(Utils.toDate(item.attr("data-dt")));
			}

			rerender.call(this);
		}
		else {
			var snapshoot = this._snapshoot();
			this.$el.find("td.selected").removeClass("selected");
			item.addClass("selected");
			this.$el.attr("data-dt", item.attr("data-dt"));
			var date = Utils.toDate(item.attr("data-dt"));
			this.$el.find(".title .item .val").text(Utils.toDateString(date, "yyyy.MM.dd"));
			snapshoot.done();
		}
	};

	// 确认选择
	var onSubmitBtnHandler = function () {
		if (this.isRangeDate()) {
			if (this.lastSelectedDate && this.lastSelectedDate.length > 0) {
				var start = this.lastSelectedDate[0];
				var end = this.lastSelectedDate[1] || start;
				this.$el.attr("data-start", Utils.toDateString(start, "yyyy-MM-dd"));
				this.$el.attr("data-end", Utils.toDateString(end, "yyyy-MM-dd"));
				this.lastSelectedDate = null;
			}
			clearCurrentSnapshoot.call(this, true);
		}
		this.trigger("submit", this.getDate());
	};

	// 取消选择
	var onCancelBtnHandler = function () {
		if (this.isRangeDate()) {
			this.lastSelectedDate = null;
			if (this.selectedSnapshoot) {
				var state = this.selectedSnapshoot.getState();
				clearCurrentSnapshoot.call(this);
				
				var selectedDate = state.selectedDate;
				var start = selectedDate && selectedDate[0];
				var end = selectedDate && selectedDate[1];
				this.$el.attr("data-start", start ? Utils.toDateString(start, "yyyy-MM-dd") : "");
				this.$el.attr("data-end", end ? Utils.toDateString(end, "yyyy-MM-dd") : "");

				rerender.call(this, state.pickerDate);
			}
			else {
				rerender.call(this);
			}
		}
		this.trigger("cancel", this.getDate());
	};

	// 日历回到今天
	var onTodayBtnHandler = function () {
		rerender.call(this, [new Date()]);
	};

	// 清除选择
	var onClearBtnHandler = function () {
		var snapshoot = this._snapshoot();
		if (this.isRangeDate()) {
			clearCurrentSnapshoot.call(this);
			this.$el.attr("data-start", "").attr("data-end", "");
		}
		else {
			this.$el.attr("data-dt", "");
		}
		rerender.call(this);
		snapshoot.done();
		this.trigger("clear");
	};

	// 移到端滑动
	var touchSwipeHandler = function (e) { // console.log(e);
		var touch = e.touches && e.touches[0];
		if (e.type == "touchstart") {
			this.touchData = {startX: touch.pageX, startY: touch.pageY};
			this.touchData.tableContainer = this.$el.find(".table.t0");
			this.touchData.mainTable = this.touchData.tableContainer.children("table.body");
		}
		else if (e.type == "touchmove") {
			if (e.touches.length > 1)
				return ;

			var offset = touch.pageX - this.touchData.startX;
			if (!this.touchData.moving) {
				if (Math.abs(offset) < 10 || Math.abs(touch.pageY - this.touchData.startY) > 15)
					return ;
			}
			this.touchData.moving = true;
			// this.touchData.endX = touch.pageX;
			this.touchData.lastOffset = offset;

			this.touchData.mainTable.css("transform", "translate(" + offset + "px,0px)");

			var table = offset > 0 ? this.touchData.prevTable : this.touchData.nextTable;
			if (!table) {
				var year = parseInt(this.touchData.tableContainer.attr("data-y"));
				var month = parseInt(this.touchData.tableContainer.attr("data-m"));

				table = DatePickerRender.createTable($, this.$el.children("section")).addClass("t1");
				if (offset > 0) {
					month -= 1;
					this.touchData.prevTable = table;
				}
				else {
					month += 1;
					this.touchData.nextTable = table;
				}

				var pickerDate = new Date(year, month, 1);
				var selectedDate = this.lastSelectedDate || this.getDate();
				DatePickerRender.renderPickerDate.call(this, $, this.$el, table, pickerDate, selectedDate);
			}

			if (!this.touchData.contentWidth)
				this.touchData.contentWidth = this.$el.children("section").width();
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
				if (Math.abs(touchData.lastOffset) > 20) {
					var button = touchData.lastOffset > 0 ? ".prev.m" : ".next.m";
					self.$el.children("header").find(button).eq(0).tap();
				}
				setTimeout(function () {
					if (touchData.prevTable)
						touchData.prevTable.remove();
					if (touchData.nextTable)
						touchData.nextTable.remove();
					touchData.mainTable.css("transition", "");
					touchData.mainTable.css("transform", "");
				}, delay);
			}
		}
	};

	// ====================================================
	var rerender = function (pickerDate) {
		var self = this;
		Utils.debounce("datepicker_render-" + this.getViewId(), function () {
			var selectedDate = self.lastSelectedDate || self.getDate();
			pickerDate = pickerDate || getCurrentPickerDate.call(self);
			DatePickerRender.renderDate.call(self, $, self.$el, selectedDate, pickerDate);
		});
	};

	var clearCurrentSnapshoot = function (isDone) {
		this.lastSelectedDate = null;
		if (this.selectedSnapshoot) {
			if (isDone)
				this.selectedSnapshoot.done();
			else
				this.selectedSnapshoot.release();
			this.selectedSnapshoot = null;
		}
	};

	var getCurrentPickerDate = function () {
		var pickerDate = [];
		if (this.isRangeDate() && !this.isRenderAsApp()) {
			var tstart = this.$el.find(".table.s");
			pickerDate.push(new Date(parseInt(tstart.attr("data-y")), parseInt(tstart.attr("data-m")), 1));
			var tend = this.$el.find(".table.e");
			pickerDate.push(new Date(parseInt(tend.attr("data-y")), parseInt(tend.attr("data-m")), 1));
		}
		else {
			var table = this.$el.find(".table.t0");
			pickerDate.push(new Date(parseInt(table.attr("data-y")), parseInt(table.attr("data-m")), 1));
		}
		return pickerDate;
	};

	var getTime = function (date) {
		if (date) {
			return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
		}
		return 0;
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-datepicker", UIDatePicker);

})();