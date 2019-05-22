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
		}
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");

	///////////////////////////////////////////////////////
	grunt.registerTask("minify", function () {
		grunt.file.setBase("./lib/static/");
		grunt.task.run(["uglify"]);
	});
};
