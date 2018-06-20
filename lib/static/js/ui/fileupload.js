// ========================================================
// 文件上传
// @author shicy <shicy85@163.com>
// Create on 2018-06-20
// ========================================================

(function () {
	if (VRender.Component.FileUpload)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var FileUploadRender = Component.Render.fileupload;

	///////////////////////////////////////////////////////
	var UIFileUpload = window.UIFileUpload = Component.FileUpload = function (view, options) {
		if (!Component.base.isElement(view))
			return UIFileUpload.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.fileInput = this.$el.children("input");

		initEvents.call(this);
	};
	var _UIFileUpload = UIFileUpload.prototype = new Component.base();

	UIFileUpload.find = function (view) {
		return Component.find(view, ".ui-fileupload", UIFileUpload);
	};

	UIFileUpload.create = function (options) {
		return Component.create(options, UIFileUpload, FileUploadRender);
	};

	// ====================================================
	_UIFileUpload.getBrowser = function () {
		if (this.hasOwnProperty("browser"))
			return this.browser;
		if (this.options.hasOwnProperty("browser"))
			return this.options.browser;
		var browser = this.$el.attr("opt-browser");
		this.$el.removeAttr("opt-browser");
		this.browser = Utils.isBlank(browser) ? null : $(browser);
		return this.browser;
	};
	_UIFileUpload.setBrowser = function (value) {
		var browser = this.getBrowser();
		if (browser) {
			browser.off("tap.fileupload");
		}

		this.browser = Utils.isBlank(value) ? null : (value.$el || $(value));
		this.options.browser = null;
		this.$el.removeAttr("opt-browser");

		initBrowserHandler.call(this, this.browser);
		if (this.browser) {
			this.browser.on("tap.fileupload", onBrowserClickHandler.bind(this));
		}
	};
	

	// ====================================================
	var onBrowserClickHandler = function () {
		this.fileInput.click();
	};
	

	// ====================================================
	var initEvents = function () {
		var browser = this.getBrowser();
		if (browser) {
			browser.on("tap.fileupload", onBrowserClickHandler.bind(this));
		}
	};

	// ====================================================
	

	// ====================================================
	

	// ====================================================
	Component.register(".ui-fileupload", UIFileUpload);

})();