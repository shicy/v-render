// ========================================================
// 组件视图基础类，实现了视图的属性、功能、及扩展等机制。
// 一个视图通常包含网页、样式和脚本，同时视图也可以包含其他视图。
// 由于现实中存在大量的异步过程，视图分为2个部分：初始化和渲染。
// 在初始化过程可以用来准备数据，比如读取/存储数据；而渲染过程则将最终结果返回给客户端。
// 其中初始化可以是一个异步过程，而渲染则必须是同步的，初始化完成必须执行响应的ready()方法。
// 
// 视图的“ready”机制
// 由于视图可以被继承和嵌套，同时视图存在异步性，为保证多视图共同参与设计页面，引入了“ready”机制。
// 要求每个视图定义一个准备完成标志(readyCode，即待渲染标志)，在视图准备完成可以进行渲染时执行ready(readyCode)方法。
// 具有继承关系的父子视图不能使用相同的readyCode，使用ready(function)方法注册视图“ready”监听器，仅当视图的所有父视图完成时，监听器被执行。
// 注：没有异步过程的视图不需要定义readyCode，以及不需要执行ready()方法。
// 
// @author shicy <shicy85@163.com>
// Create on 2016-10-10
// ========================================================


///////////////////////////////////////////////////////////
var View = module.exports = function (context, options, session) {
	if (context === View.CONTEXT_AS_PARENT)
		return ;

};
View.prototype = new Object();

// 标志视图将作为父类创建，此时创建视图的一些初始化过程忽略
View.CONTEXT_AS_PARENT = "contextAsParent";

// 视图扩展，通过改方法创建子视图，子视图拥有当前视图即起上级视图的属性和方法，
// 唯一的参数可以扩展或者覆盖父类属性和方法
// View.extend = function (proto) {
// 	var parent = this;
// 	var child = function () { parent.apply(this, arguments); };
// 	child.prototype = new parent(View.CONTEXT_AS_PARENT);

// 	for (var n in View) {
// 		child[n] = View[n];
// 	}

// 	var putProto = function (name, value) {
// 		if (name === "readyCode") {
// 			var codes = ArrayUtils.toArray(child.prototype[name]);
// 			// EasyWeb.logger.debug("<View.extend.putProto>", codes);
// 			child.prototype[name] = codes.concat(value);
// 		}
// 		else 
// 			child.prototype[name] = value;
// 	};

// 	if ((typeof proto === "object") && !(proto instanceof Array)) {
// 		for (var n in proto) {
// 			putProto(n, proto[n]);
// 		}
// 	}

// 	child.__super__ = parent.prototype;
// 	child.prototype.__owner__ = child;
// 	// EasyWeb.logger.debug("<View.extend>", child.prototype.readyCode);

// 	return child;
// };
