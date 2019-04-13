module.exports = function (grunt) {

	var commonScripts = [];
	commonScripts.push("js/util/*.js");
	commonScripts.push("js/EventEmitter.js");
	commonScripts.push("js/FrontComponent.js");

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		uglify: {
			options: {
				output: {
					max_line_len: 10240
				}
			},
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
					src: ["VRender.front.css"],
					dest: "VRender.front.min.css"
				}]
			},
			mobile: {
				files: [{
					src: ["VRender.front.mobile.css"],
					dest: "VRender.front.mobile.min.css"
				}]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");

	///////////////////////////////////////////////////////
	grunt.registerTask("minify", function () {
		grunt.file.setBase("./lib/static/");
		grunt.task.run(["uglify", "cssmin"]);

		var version = grunt.template.today("yymmdd");
		var files = ["PageView.js", "AppPageView.js", "WebPageView.js"];
		for (var i = 0, l = files.length; i < l; i++) {
			var filepath = "../ui/" + files[i];
			var text = grunt.file.read(filepath).toString("utf-8");
			text = text.replace(/\.min\.js\?v=.{6}/g, ".min.js?v=" + version);
			text = text.replace(/\.min\.css\?v=.{6}/g, ".min.css?v=" + version);
			grunt.file.write(filepath, text);
		}
	});

};
