// ========================================================
// 树形下拉选择框
// @author shicy <shicy85@163.com>
// Create on 2018-08-12
// ========================================================


(function () {
	if (VRender.Component.TreeCombobox)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var TreeComboboxRender = Renderer.treecombobox;

	///////////////////////////////////////////////////////
	var UITreeCombobox = window.UITreeCombobox = Component.TreeCombobox = function (view, options) {
		if (!Component.base.isElement(view))
			return UITreeCombobox.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.tree = UITreeView.find(this.$el)[0];

		this.$el.on("tap", ".ipt", iptClickHandler.bind(this));
		this.$el.on("change", ".dropdown", function () { return false; });

		this.tree.on("change", treeChangeHandler.bind(this));
		this.tree.on("itemclick", treeItemClickHandler.bind(this));

		if (this.isRenderAsApp()) {
			this.$el.on("tap", ".dropdown", dropdownTouchHandler.bind(this));
		}
	};
	var _UITreeCombobox = UITreeCombobox.prototype = new Component.select();

	UITreeCombobox.find = function (view) {
		return Component.find(view, ".ui-treecombobox", UITreeCombobox);
	};

	UITreeCombobox.create = function (options) {
		return Component.create(options, UITreeCombobox, TreeComboboxRender);
	};

	// ====================================================
	_UITreeCombobox.getData = function () {
		return this.tree.getData();
	};
	_UITreeCombobox.setData = function (value) {
		this.tree.setData(value);
	};

	_UITreeCombobox.getPrompt = function () {
		return this.$el.children(".ipt").find(".prompt").text();
	};
	_UITreeCombobox.setPrompt = function (value) {
		var target = this.$el.children(".ipt");
		target.find(".prompt").remove();
		if (Utils.isNotBlank(value)) {
			$("<span class='prompt'></span>").appendTo(target).text(value);
		}
	};

	_UITreeCombobox.getDataAdapter = function () {
		return this.tree.getDataAdapter();
	};
	_UITreeCombobox.setDataAdapter = function (value) {
		this.tree.setDataAdapter(value);
	};

	_UITreeCombobox.getDataMapper = function () {
		return this.tree.getDataMapper();
	};
	_UITreeCombobox.setDataMapper = function (value) {
		this.tree.setDataMapper(value);
	};

	// ====================================================
	_UITreeCombobox.load = function (api, params, callback) {
		this.tree.load(api, params, callback);
	};

	_UITreeCombobox.reload = function (page, callback) {
		this.tree.reload(page, callback);
	};

	_UITreeCombobox.isLoading = function () {
		return this.tree.isLoading();
	};

	_UITreeCombobox.getDataAt = function (index) {
		return this.tree.getDataAt(index);
	};

	_UITreeCombobox.getDataIndex = function (data) {
		return this.tree.getDataIndex(data);
	};

	_UITreeCombobox.getDataByKey = function (key) {
		return this.tree.getDataByKey(key);
	};

	_UITreeCombobox.getIndexByKey = function (key) {
		return this.tree.getIndexByKey(key);
	};

	_UITreeCombobox.getDataByName = function (name) {
		return this.tree.getDataByName(name);
	};

	_UITreeCombobox.getIndexByName = function (name) {
		return this.tree.getIndexByName(name);
	};

	_UITreeCombobox.getKeyField = function () {
		return this.tree.getKeyField();
	};

	_UITreeCombobox.setKeyField = function (value) {
		this.tree.setKeyField(value);
	};

	_UITreeCombobox.getLabelField = function () {
		return this.tree.getLabelField;
	};

	_UITreeCombobox.setLabelField = function (value) {
		this.tree.setLabelField(value);
	};

	_UITreeCombobox.getLabelFunction = function () {
		return this.tree.getLabelFunction();
	};

	_UITreeCombobox.setLabelFunction = function (value) {
		this.tree.setLabelFunction(value);
	};

	_UITreeCombobox.getItemRenderer = function () {
		return this.tree.getItemRenderer();
	};

	_UITreeCombobox.setItemRenderer = function (value) {
		this.tree.setItemRenderer(value);
	};

	_UITreeCombobox.isDisabled = function (index) {
		return this.tree.isDisabled(index);
	};

	_UITreeCombobox.setDisabled = function (disabled, index) {
		this.tree.setDisabled(disabled, index);
	};

	_UITreeCombobox.addItem = function (data, index) {
		return this.tree.addItem(data, index);
	};

	_UITreeCombobox.updateItem = function (data, index) {
		return this.tree.updateItem(data, index);
	};

	_UITreeCombobox.removeItem = function (data) {
		return this.tree.removeItem(data);
	};

	_UITreeCombobox.removeItemAt = function (index) {
		return this.tree.removeItemAt(index);
	};

	_UITreeCombobox.addOrUpdateItem = function (data) {
		this.tree.addOrUpdateItem(data);
	};

	_UITreeCombobox.getItemData = function (target) {
		return this.tree.getItemData(target);
	};

	_UITreeCombobox.isEmpty = function () {
		return this.tree.isEmpty();
	};

	// ====================================================
	_UITreeCombobox.isMultiple = function () {
		return this.$el.attr("multiple") == "multiple";
	};

	_UITreeCombobox.setMultiple = function (value) {
		value = (Utils.isNull(value) || Utils.isTrue(value)) ? true : false;
		if (this.isMultiple() != value) {
			if (value)
				this.$el.attr("multiple", "multiple");
			else
				this.$el.removeAttr("multiple");
			this.tree.setMultiple(value);
		}
	};

	_UITreeCombobox.getSelectedIndex = function (needArray) {
		return this.tree.getSelectedIndex(needArray, true);
	};

	_UITreeCombobox.setSelectedIndex = function (value) {
		this.tree.setSelectedIndex(value, true);
	};

	_UITreeCombobox.getSelectedKey = function (needArray) {
		return this.tree.getSelectedKey(needArray, true);
	};

	_UITreeCombobox.setSelectedKey = function (value) {
		this.tree.setSelectedKey(value, true);
	};

	_UITreeCombobox.getSelectedData = function (needArray) {
		return this.tree.getSelectedData(needArray, true);
	};

	_UITreeCombobox.isSelectedIndex = function (index) {
		return this.tree.isSelectedIndex(index);
	};

	_UITreeCombobox.isSelectedKey = function (value) {
		return this.tree.isSelectedKey(value);
	};

	_UITreeCombobox.isAllSelected = function () {
		return this.tree.isAllSelected();
	};

	_UITreeCombobox.length = function () {
		return this.tree.length();
	};

	// ====================================================
	var iptClickHandler = function (e) {
		showDropdown.call(this);
	};

	var dropdownTouchHandler = function (e) {
		if ($(e.target).is(".dropdown"))
			hideDropdown.call(this);
	};

	var treeChangeHandler = function (e) {
		itemChanged.call(this);
	};

	var treeItemClickHandler = function (e, data) {
		if (!this.isMultiple()) {
			itemChanged.call(this);
			if (data.leaf || !this.isRenderAsApp())
				hideDropdown.call(this);
		}
	};

	var comboMouseHandler = function (e) {
		Renderer.fn.mouseDebounce(e, hideDropdown.bind(this));
	};

	// ====================================================
	var isDropdownVisible = function () {
		return this.$el.is(".show-dropdown");
	};

	var showDropdown = function () {
		if (isDropdownVisible.call(this))
			return ;

		var target = this.$el.addClass("show-dropdown");

		if (this.isRenderAsApp()) { // 不会是 native
			$("html,body").addClass("ui-scrollless");
		}
		else {
			target.on("mouseenter", comboMouseHandler.bind(this));
			target.on("mouseleave", comboMouseHandler.bind(this));

			var dropdown = target.children(".dropdown");
			var maxHeight = Renderer.fn.getDropdownHeight.call(this, dropdown);
			var offset = Utils.offset(dropdown, this._getScrollContainer(), 0, maxHeight);
			if (offset.isOverflowY)
				target.addClass("show-before");
		}

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);
	};

	var hideDropdown = function () {
		$("html,body").removeClass("ui-scrollless");

		var target = this.$el.addClass("animate-out");
		target.off("mouseenter").off("mouseleave");

		setTimeout(function () {
			target.removeClass("show-dropdown").removeClass("show-before");
			target.removeClass("animate-in").removeClass("animate-out");
		}, 300);
	};

	var itemChanged = function () {
		// var snapshoot = this._snapshoot();

		// var indexs = this.getSelectedIndex(true);
		// Component.select.setSelectedIndex.call(this, indexs);

		var self = this;
		var datas = this.getSelectedData(true);
		var labels = Utils.map(Utils.toArray(datas), function (data) {
			return self.tree._getDataLabel(data);
		});

		labels = labels.join(", ");
		this.$el.children(".ipt").find("input").val(labels || "");

		if (labels) {
			this.$el.addClass("has-val");
		}
		else {
			this.$el.removeClass("has-val");
		}

		this.trigger("change");
		this.$el.trigger("change");

		// console.log("====>", indexs, snapshoot.compare())

		// snapshoot.done();
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-treecombobox", UITreeCombobox);

})();