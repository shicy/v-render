// ========================================================
// 前端自定义组件构建方法
// @author shicy <shicy85@163.com>
// Create on 2017-01-10
// ========================================================

(function () {
	if (typeof VRender === "undefined")
		return ;

	if (VRender.FrontComponent)
		return ;

	var Utils = VRender.Utils;

	///////////////////////////////////////////////////////
	var FrontComponent = VRender.FrontComponent = function (clsname, Component) {
        this.className = clsname;
        this.ComponentClass = Component;
    };
    var _FrontComponent = FrontComponent.prototype = new VRender.EventEmitter();

    FrontComponent.get = function (target) {
        return $(target).data("mfhInstance");
    };

    // ====================================================
    _FrontComponent.find = function (target, options) {
        target = $(target);
        if (!target.is(this.className))
            target = target.find(this.className);
        var self = this;
        return Utils.map(target, function (item) {
            return self.make(item, options);
        });
    };

    _FrontComponent.create = function (options) {
        var target = $("<div></div>");
        options = options || {};
        if (options.target) {
            if (options.targetAsInstance)
                target = options.target;
            else
                target.appendTo(options.target);
        }
        target.addClass(this.className);
        target.attr("name", Utils.trimToNull(options.name));
        if (Utils.isFunction(this.render))
            this.render(target, options);
        var instance = new this.ComponentClass(target, options);
        target.data("mfhInstance", instance);
        return instance;
    };

    _FrontComponent.make = function (target, options) {
        target = $(target);
        var instance = target.data("mfhInstance");
        if (!instance) {
            instance = new this.ComponentClass(target, options);
            target.data("mfhInstance", instance);
        }
        return instance;
    };

    ///////////////////////////////////////////////////////
    VRender.frontComponent = function (clsname, Component, renderHander) {
        var _component = new FrontComponent(clsname, Component);
        _component.render = renderHander;
        return _component;
    };
})();
