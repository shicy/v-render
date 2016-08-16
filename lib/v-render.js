// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2016-08-15
// ========================================================

var Node = require("util");
var Events = require("events");


///////////////////////////////////////////////////////////
var VRender = module.exports = function () {
	console.log("======> view render created.");
	Events.EventEmitter.call(this);
};

Node.inherits(VRender, Events.EventEmitter);

///////////////////////////////////////////////////////////
VRender.create = function () {
	return new VRender();
};
