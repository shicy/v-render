module.exports = function (grunt) {

	var commonScripts = [];
	commonScripts.push("js/util/*.js");
	commonScripts.push("js/EventEmitter.js");
	commonScripts.push("js/FrontComponent.js");
	// commonScripts.push("js/render/*.js");
	// commonScripts.push("js/ui/*.js");
	commonScripts.push("js/render/_base.js");
	commonScripts.push("js/render/group.js");
	commonScripts.push("js/render/button.js");
	commonScripts.push("js/render/dropdownlist.js");
	commonScripts.push("js/render/combobox.js");
	commonScripts.push("js/render/textview.js");
	commonScripts.push("js/render/checkbox.js");
	
	commonScripts.push("js/ui/_base.js");
	commonScripts.push("js/ui/group.js");
	commonScripts.push("js/ui/button.js");
	commonScripts.push("js/ui/dropdownlist.js");
	commonScripts.push("js/ui/combobox.js");
	commonScripts.push("js/ui/textview.js");
	commonScripts.push("js/ui/checkbox.js");

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		uglify: {
			pc: {
				files: [{
					src: ["VRender.front.js"].concat(commonScripts),
					dest: "VRender.front.min.js"
				}]
			},
			mobile: {
				files: [{
					src: ["VRender.front.js", "VRender.front.mobile.js"].concat(commonScripts),
					dest: "VRender.front.mobile.min.js"
				}]
			}
		},

		cssmin: {
			pc: {
				files: [{
					src: ["VRender.front.css", "css/ui/*.p.css"],
					dest: "VRender.front.min.css"
				}]
			},
			mobile: {
				files: [{
					src: ["VRender.front.mobile.css", "css/ui/*.m.css"],
					dest: "VRender.front.mobile.min.css"
				}]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");

	///////////////////////////////////////////////////////
	grunt.registerTask("minify", function () {
		grunt.file.setBase("../lib/static/");
		grunt.task.run(["uglify", "cssmin"]);

		var version = grunt.template.today("yymmddHHMM");
		var files = ["PageView.js", "AppPageView.js", "WebPageView.js"];
		for (var i = 0, l = files.length; i < l; i++) {
			var filepath = "../ui/" + files[i];
			var text = grunt.file.read(filepath).toString("utf-8");
			text = text.replace(/\.min\.js\?v=.{10}/g, ".min.js?v=" + version);
			text = text.replace(/\.min\.css\?v=.{10}/g, ".min.css?v=" + version);
			grunt.file.write(filepath, text);
		}
	});

};
