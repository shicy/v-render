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

		this.$el.on("change", "input", onFileChangeHandler.bind(this));

		var browser = this.getBrowser();
		if (browser)
			browser.on("tap.fileupload", onBrowserClickHandler.bind(this));
	};
	var _UIFileUpload = UIFileUpload.prototype = new Component.base();

	UIFileUpload.find = function (view) {
		return Component.find(view, ".ui-fileupload", UIFileUpload);
	};

	UIFileUpload.create = function (options) {
		return Component.create(options, UIFileUpload, FileUploadRender);
	};

	UIFileUpload.instance = function (target) {
		return Component.instance(target, ".ui-fileupload");
	};

	// ====================================================
	_UIFileUpload.browser = function () {
		this.$el.children("input").click();
	};

	_UIFileUpload.remove = function (localId) {
		Utils.removeBy(this.files, "localId", localId);
	};

	_UIFileUpload.clear = function () {
		this.files = [];
	};

	_UIFileUpload.upload = function (action, params, callback) {
		if (this.isUploading)
			return false;

		if (Utils.isFunction(action)) {
			callback = action;
			action = params = null;
		}
		else if (Utils.isFunction(params)) {
			callback = params;
			params = null;
		}
		if (Utils.isBlank(action))
			action = this.getAction();

		if (Utils.isBlank(action)) {
			showError("上传失败：缺少 Action 信息！");
			return false;
		}

		if (this.files && this.files.length > 0) {
			var self = this;
			this.isUploading = true;
			doUpload.call(this, action, params, function (err, ret) {
				self.isUploading = false;
				if (Utils.isFunction(callback))
					callback(err, ret);
			});
		}
		else {
			if (Utils.isFunction(callback))
				callback("没有文件信息");
			return false;
		}
	};

	_UIFileUpload.cancel = function () {
		this.isUploading = false;
		Utils.each(this.files, function (file) {
			if (file.uploader) {
				file.uploader.abort();
				file.uploader = null;
			}
		});
	};

	_UIFileUpload.isEmpty = function () {
		return !this.files || this.files.length == 0;
	};

	// ====================================================
	_UIFileUpload.getAction = function () {
		return this.$el.attr("opt-action");
	};
	_UIFileUpload.setAction = function (value) {
		this.$el.attr("opt-action", Utils.trimToEmpty(value));
	};

	_UIFileUpload.getParams = function () {
		if (this.options.hasOwnProperty("params"))
			return this.options.params;
		var params = null;
		try {
			params = JSON.parse(this.$el.attr("opt-params"));
		}
		catch (e) {};
		this.options.params = params;
		return this.options.params;
	};
	_UIFileUpload.setParams = function (value) {
		this.options.params = value;
		this.$el.removeAttr("opt-params");
	};

	_UIFileUpload.getUploadName = function () {
		return Utils.trimToNull(this.$el.attr("opt-upload")) || "file";
	};
	_UIFileUpload.setUploadName = function (value) {
		this.$el.attr("opt-upload", Utils.trimToEmpty(value));
	};

	_UIFileUpload.getBrowser = function () {
		if (this.hasOwnProperty("browserBtn"))
			return this.browserBtn;
		if (this.options.hasOwnProperty("browser"))
			return this.options.browser;
		var browser = this.$el.attr("opt-browser");
		this.$el.removeAttr("opt-browser");
		this.browserBtn = Utils.isBlank(browser) ? null : $(browser);
		return this.browserBtn;
	};
	_UIFileUpload.setBrowser = function (value) {
		var browser = this.getBrowser();
		if (browser) {
			browser.off("tap.fileupload");
		}

		this.browserBtn = Utils.isBlank(value) ? null : (value.$el || $(value));
		this.options.browser = null;
		this.$el.removeAttr("opt-browser");

		initBrowserHandler.call(this, this.browserBtn);
		if (this.browserBtn) {
			this.browserBtn.on("tap.fileupload", onBrowserClickHandler.bind(this));
		}
	};

	_UIFileUpload.getFilter = function () {
		return this.$el.attr("opt-filter");
	};
	_UIFileUpload.setFilter = function (value) {
		this.$el.attr("opt-filter", Utils.trimToEmpty(value));

		var input = this.$el.children("input");
		var accept = FileUploadRender.getAccept.call(this);
		if (accept)
			input.attr("accept", accept);
		else
			input.removeAttr("accept");
	};

	_UIFileUpload.getLimit = function () {
		return parseInt(this.$el.attr("opt-limit")) || 0;
	};
	_UIFileUpload.setLimit = function (value) {
		if (value && !isNaN(value))
			this.$el.attr("opt-limit", value);
		else
			this.$el.removeAttr("opt-limit");
	};
	
	_UIFileUpload.isMultiple = function () {
		return this.$el.children("input").attr("multiple") == "multiple";
	};
	_UIFileUpload.setMultiple = function (value) {
		var input = this.$el.children("input");
		if (Utils.isNull(value) || Utils.isTrue(value))
			input.attr("multiple", "multiple");
		else
			input.removeAttr("multiple");
	};

	_UIFileUpload.isAutoUpload = function () {
		return this.$el.attr("opt-auto") == 1;
	};
	_UIFileUpload.setAutoUpload = function (value) {
		if (Utils.isNull(value) || Utils.isTrue(value))
			this.$el.attr("opt-auto", "1");
		else
			this.$el.removeAttr("opt-auto");
	};

	_UIFileUpload.isMixed = function () {
		return this.$el.attr("opt-mixed") == 1;
	};
	_UIFileUpload.setMixed = function (value) {
		if (Utils.isNull(value) || Utils.isTrue(value))
			this.$el.attr("opt-mixed", "1");
		else
			this.$el.removeAttr("opt-mixed");
	};

	// ====================================================
	var onBrowserClickHandler = function () {
		if (this.isUploading) {
			showError("正在上传，请稍候..");
		}
		else {
			this.browser();
		}
	};

	var onFileChangeHandler = function (e) {
		var input = $(e.currentTarget);
		
		var files = validateFiles.call(this, input[0].files);
		if (!files || files.length == 0)
			return ;
		
		var fileLocalId = Date.now();
		var multiple = input.attr("multiple") == "multiple";
		if (multiple) {
			this.files = Utils.toArray(this.files);
			for (var i = 0; i < files.length; i++) {
				files[i].localId = fileLocalId++;
				this.files.push(files[i]);
			}
		}
		else {
			files[0].localId = fileLocalId++;
			this.files = [files[0]];
		}

		input.remove();
		var newInput = $("<input type='file'/>").appendTo(this.$el);
		if (multiple)
			newInput.attr("multiple", "multiple");
		newInput.attr("accept", input.attr("accept"));

		this.trigger("change", this.files);

		if (this.isAutoUpload()) {
			if (Utils.isNotBlank(this.getAction()))
				this.upload();
		}
	};
	

	// ====================================================
	var validateFiles = function (files) {
		var filter = Utils.trimToNull(this.getFilter());
		if (filter) {
			if (/image|audio|video|excel|word|powerpoint|text/.test(filter))
				filter = null;
			else
				filter = filter.split(",");
		}
		var limit = this.getLimit();
		if (filter || limit > 0) {
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				if (filter) {
					var ext = file.name.split(".");
					ext = ext[ext.length - 1];
					var match = Utils.index(filter, function (tmp) {
						return Utils.endWith(tmp, ext);
					});
					if (match < 0) {
						showError("文件类型错误：" + file.name);
						return false;
					}
				}
				if (limit > 0) {
					if (limit < file.size) {
						showError("允许文件大小上限为：" + getFormatSize(limit));
						return false;
					}
				}
			}
		}
		return files;
	};

	// ====================================================
	var doUpload = function (action, params, callback) {
		var apiName = getActionName.call(this, action);
		var apiParams = Utils.extend({}, this.getParams(), params);

		var totalSize = 0;
		Utils.each(this.files, function (file) {
			totalSize += file.size;
			file.state = 0; // 初始化
		});
		this.totalSize = totalSize;
		this.totalSend = 0;

		var self = this;
		uploadFiles.call(this, apiName, apiParams, this.files, function (err, ret) {
			if (!err) {
				self.files = null;
				self.trigger("success", ret);
			}
			else {
				self.trigger("error", err);
			}
			if (Utils.isFunction(callback)) {
				callback(err, ret);
			}
		});
	};

	var uploadFiles = function (api, params, files, callback) {
		if (files.length == 1 || this.isMixed()) {
			Utils.each(files, function (file) {
				file.state = 1; // 正在上传
			});
			uploadFile.call(this, api, params, files, function (err, ret) {
				var localIds = [];
				Utils.each(files, function (file) {
					file.state = !err ? 2 : 3; // 成功、失败
					localIds.push(file.localId);
				});
				ret.localId = localIds.join(",");
				callback(err, ret);
			});
		}
		else {
			var self = this;
			var errors = [];
			var results = [];
			var loop = function () {
				var file = Utils.findBy(files, "state", 0);
				if (!file) {
					if (errors.length == 0)
						errors = null;
					callback(errors, results);
				}
				else {
					file.state = 1;
					uploadFile.call(self, api, params, [file], function (err, ret) {
						if (!err) {
							file.state = 2;
							ret.localId = file.localId;
							results.push(ret);
						}
						else {
							file.state = 3;
							errors.push(err);
						}
						loop();
					});
				}
			};
			loop();
		}
	};

	var uploadFile = function (api, params, file, callback) {
		var xhr = createHttpRequest();
		if (!xhr) {
			callback("当前浏览器版本较低，不支持该上传功能。或者使用其他浏览器（如：chrome）。");
		}
		else {
			var self = this;
			params = Utils.extend({}, params);
			doUploadBefore.call(this, file, params, function (error) {
				if (!error) {
					file[0].uploader = xhr;
					xhr.open("POST", api, true);

					xhr.onload = function (e) { uploadSuccessHandler.call(self, e, file, callback); };
					xhr.onerror = function (e) { uploadErrorHandler.call(self, e, file, callback); };
					xhr.onreadystatechange = function (e) { uploadStateHandler.call(self, e, file); };
					xhr.upload.onprogress = function (e) { uploadProgressHandler.call(self, e, file); };

					var form = new FormData();
					var uploadName = self.getUploadName();
					Utils.each(file, function (temp) {
						form.append(uploadName, temp);
						form.append("filename", temp.name);
					});
					for (var n in params) {
						form.append(n, params[n]);
					}

					xhr.send(form);
				}
				else if (error == "canceled") {
					callback("已取消");
				}
				else {
					callback(error);
				}
			});
		}
	};

	var getActionName = function (action) {
		if (/^(\/|http)/.test(action))
			return action;
		return "/upload?n=" + action;
	};

	var doUploadBefore = function (file, params, callback) {
		var event = {type: "upload-before"};
		this.trigger(event, file, params);
		if (event.isPreventDefault) {
			callback("canceled");
		}
		else {
			callback();
		}
	};

	var createHttpRequest = function () {
		if (window.XMLHttpRequest)
			return new XMLHttpRequest();

		if (window.ActiveXObject)
			return new ActiveXObject("Microsoft.XMLHTTP");

		// setTimeout(function () {
		// 	showError("当前浏览器版本较低，不支持该上传功能。或者使用其他浏览器（如：chrome）。", 60000);
		// }, 500);

		return false;
	};

	// ====================================================
	var uploadSuccessHandler = function (e, file, callback) {
		file[0].uploader = null;
		callback(file.errorMsg, file.resultMsg);
	};

	// 好像不会进这里来
	var uploadErrorHandler = function (e, file, callback) {
		console.log(e);
		file[0].uploader = null;
		callback(e);
	};

	var uploadStateHandler = function (e, file) {
		var xhr = file[0].uploader;
		if (xhr.readyState == 4) {
			var data = xhr.responseText;
			if (data) {
				try {
					data = JSON.parse(data);
				}
				catch (e) {}
			}
			if (xhr.status == 200) {
				file.resultMsg = data || xhr.responseText;
			}
			else { // 出错了，出错会进入 onload
				console.error(xhr.responseText);
				file.errorMsg = data || xhr.responseText || "文件上传失败！";
			}
		}
	};

	var uploadProgressHandler = function (e, file) {
		this.totalSend += e.loaded;
		if (this.totalSend > this.totalSize)
			this.totalSend = this.totalSize;
		this.trigger("progress", file, this.totalSend, this.totalSize);
	};

	// ====================================================
	var getFormatSize = function (value) {
		value = parseInt(value);
		if (value && value > 0) {
			if (value < 1024)
				return value + "B";
			value /= 1024;
			if (value < 1024)
				return value.toFixed(2) + "KB";
			value /= 1024;
			if (value < 1024)
				return value.toFixed(2) + "MB";
			value /= 1024;
			if (value < 1024)
				return value.toFixed(2) + "GB";
			value /= 1024;
			return value.toFixed(2) + "TB";
		}
		return "";
	};

	var showError = function (message, duration) {
		Component.Tooltip.create({type: "danger", content: message, duration: duration});
	};
	
	// ====================================================
	Component.register(".ui-fileupload", UIFileUpload);

})();