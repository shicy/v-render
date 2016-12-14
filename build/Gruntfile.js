module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		uglify: {
			pc: {
				files: [{
					src: ["js/jquery.tap.js", "VRender.front.js",
						"js/util/*.js", "js/EventEmitter.js", "js/ui/*.js"],
					dest: "VRender.front.min.js"
				}]
			},
			mobile: {
				files: [{
					src: ["js/jquery.tap.js", "VRender.front.js", 
						"js/util/*.js", "js/EventEmitter.js", "js/ui/*.js"],
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
					src: ["VRender.front.css", "css/ui/*.m.css"],
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
