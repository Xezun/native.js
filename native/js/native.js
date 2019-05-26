// native.js
// Created by mlibai. 2019.05.18

/**
 * native 模块。
 * @module native
 */

import Native from './native.static';

// 注册 ready 事件/方法。
Native.Action("ready", "ready");
Native.Method("ready", "ready");

/** 
* 交互模式。 
* @name mode
* @readonly
*/
let _mode = Native.Mode.url;
/**
 * 使用 URL 交互时使用的协议头。
 * @name scheme
 */
let _scheme = "native";
/**
 * 原生用于接收事件的对象。
 * @name delegate
 * @readonly
 */
let _delegate = null;
/**
 * 是否可以进行交互。
 * @name isReady
 * @readonly
 */
let _isReady = false;

/// _perform 方法中的回调函数：{"uniqueID": callback} 
let _performedHandlers = {};
/// 已注册的监听原生事件的函数：{"EventName": [hander1, handler2, ...]}
let _actionTargets = {};
/// 唯一标识符，每次生产唯一标识符自增。
let _uniqueID = 10000000;
/// App 配置信息。
let _configuration = {};
/// native 拓展函数。
const _extensions = [];
// 已注册的 ready 事件函数。
const _readyListeners = [];

/**
 * 执行原生方法：方法名，参数1，参数2，……。
 * @name performMethod
 * @param {string} method 原生方法。
 * @param {any} [args] 方法所需的参数。
 */
function _performMethod() {
	switch (_mode) {
		case Native.Mode.url:
			return _performByURL.apply(this, arguments);
		case Native.Mode.json:
			return _performByJSON.apply(this, arguments);
		case Native.Mode.object:
			return _performByObject.apply(this, arguments);
		case Native.Mode.javascript:
			return _performByJavaScript.apply(this, arguments);
		default:
			break;
	}
}

/**
 * 存储或取出回调函数。
 * @name callback
 * @param {function|string} callbackOrID 待保存的回调函数或待取出回调函数的唯一ID。
 * @param {boolen} [removes=true] 取出回调函数时，是否同时删除该回调函数。
 * @param {boolen} [wraps=true] 是否包装原始函数，函数包装后，执行时 this 指向 native。
 * @returns {string|function} 保存回调函数所用的唯一ID或取出的回调函数。
 * @description 包装后的函数，并非原始保存的函数。
 */
function _callback(callbackOrID, removes, wraps) {
	switch (typeof callbackOrID) {
		case "function":
			const uniqueID = "NTCB" + (_uniqueID++);
			_performedHandlers[uniqueID] = callbackOrID;
			return uniqueID;

		case "string":
			if (!_performedHandlers.hasOwnProperty(callbackOrID)) {
				Native.log("指定标识符对应的注册函数没有找到：" + callbackOrID, Native.LogStyle.error);
				return;
			}
			const callback = _performedHandlers[callbackOrID];
			if (typeof removes === "undefined" || !!removes) {
				delete _performedHandlers[callbackOrID];
			}
			if (typeof wraps === "undefined" || !!wraps) {
				const that = this;
				return function () {
					return callback.apply(that, arguments);
				};
			}
			return callback;

		default:
			Native.log("native.callback() 方法第一个参数必须为回调函数或回调函数的唯一ID。");
			return;
	}
}

/**
 * 监听原生事件。
 * @name addActionTarget
 * @param {string} action 原生事件。
 * @param {string} target 监听函数。
 */
function _addActionTarget(action, target) {
	if (typeof target !== 'function' || typeof action !== 'string' || action.length == 0) {
		return this;
	}
	if (!_actionTargets.hasOwnProperty(action)) {
		_actionTargets[action] = target;
		return this;
	}
	const array = _actionTargets[action];
	if (Array.isArray(array)) {
		array.push(target);
	} else {
		_actionTargets[action] = [array, target];
	}
	return this;
}

/**
 * 移除原生事件监听。
 * @name removeActionTarget
 * @param {string} action 原生事件。
 * @param {function} target 监听函数。
 */
function _removeActionTarget(action, target) {
	if (typeof action !== 'string' || action.length == 0) {
		return this;
	}
	if (!_actionTargets.hasOwnProperty(action)) {
		return this;
	}
	if (!target) { // if null, delete all targets.
		delete _actionTargets[action];
		return this;
	}
	const targets = _actionTargets[action];
	if (Array.isArray(targets)) {
		for (var i = targets.length - 1; i >= 0; i--) {
			if (targets[i] === target) {
				targets.splice(i, 1); // target may added mutiple times.
			}
		}
		return this;
	}
	if (targets === target) {
		delete _actionTargets[action];
	}
	return this;
}

/**
 * 将函数 arguments 从指定位置开始后面的所有参数转换成数组。
 * @private
 * @param {Arguments} args 函数的 arguments 
 * @param {number} from 起始 index
 */
function _sliceArguments(args, from) {
	const params = [];
	while (from < args.length) {
		params.push(args[from++]);
	}
	return params;
}

/**
 * 发送原生事件。
 * @name sendAction
 * @param {string} action 事件名称。
 * @param {any} [args] 事件参数。
 * @returns {any|array} 返回值，JSON 字符串。
 * @description 如果事件被多处监听，则返回结果为所有监听函数返回值数组的 JSON 字符串。
 */
function _sendAction(action) {
	if (typeof action !== 'string' || action.length == 0) {
		return null;
	}
	if (!_actionTargets.hasOwnProperty(action)) {
		return null;
	}
	const parameters = _sliceArguments(arguments, 1);
	const targets = _actionTargets[action];
	if (typeof targets === "function") {
		return JSON.stringify(targets.apply(this, parameters));
	}
	const results = targets.slice(0); // 复制数组，避免遍历的过程中发生了改变。
	for (var i = 0; i < targets.length; i++) {
		results.splice(i, 1, targets[i].apply(this, parameters))
	}
	return JSON.stringify(results);
}

// 监听 native 的 ready 事件。
_addActionTarget(Native.Action.ready, function _nativeWasReady(delegate, mode, configuration) {
	if (_isReady) {
		Native.log("重复初始化被忽略：native 已完成初始化，但是又收到初始化事件，请检查！");
		return;
	}
	// 检查 mode 是否合法。
	if (!Native.enumerate(Native.Mode, function (key, value) { return value === mode; })) {
		Native.log("初始化错误：不支持 " + mode + " 交互模式！", Native.LogStyle.error);
		return;
	}
	_isReady = true;
	_delegate = delegate;
	_mode = mode;
	_configuration = configuration;
	// 执行拓展函数。
	while (_extensions.length > 0) {
		const descriptors = _extensions.shift().call(this, _configuration);
		if (!!descriptors && typeof descriptors === 'object') {
			Object.defineProperties(this, descriptors);
		}
	}
	// 执行 ready 回调函数。
	while (_readyListeners.length > 0) {
		(_readyListeners.shift()).call(this);
	}
	// 删除回调。
	_removeActionTarget(Native.Action.ready, _nativeWasReady);
});

/**
 * 监听或触发原始 ready 事件的便利方法。
 * @name ready
 * @param {function|object|null} callbackOrDelegate 监听原生 ready 事件的的函数或原生发送 ready 事件时指定的与 JavaScript 交互的代理对象。
 * @param {string} [mode] 第二个参数，原生在发送 ready 消息时，指定与 JavaScript 的交互模式。
 * @param {object} [configuration] 第三个参数，原生在发送 ready 消息时，提供的关于原生的配置信息。
 * @description 默认交互方式为 NativeMode.url ，在此模式下，原生发送 ready 消息，可以只在第一个参数提供 configuration 对象。 
 */
function _ready(callbackOrDelegate) {
	if (!callbackOrDelegate) {
		return this;
	}
	// 注册 ready 事件：只有一个参数且为函数。
	if (arguments.length === 1 && typeof callbackOrDelegate === 'function') {
		if (_isReady) {
			setTimeout(callbackOrDelegate);
			return this;
		}
		_readyListeners.push(callbackOrDelegate);
		return this;
	}
	// 一般初始化 native 函数：三个参数。
	if (arguments.length == 3) {
		_sendAction.call(this, Native.Action.ready, callbackOrDelegate, arguments[1], arguments[2]);
		return this;
	}
	// URL交互方式时，初始 native：只有一个参数，且为对象。
	if (arguments.length === 1 && typeof callbackOrDelegate === 'object' && _mode === Native.Mode.url) {
		_sendAction.call(this, Native.Action.ready, null, Native.Mode.url, callbackOrDelegate);
		return this;
	}
	Native.log("方法 native.ready 不支持当前调用：" + callbackOrDelegate, Native.LogStyle.error);
	return this;
}

(function (native) {
	// 向原生发送 ready 消息。
	function _documentWasReady() {
		_performMethod.call(native, Native.Method.ready, _isReady);
	}
	// 检查 document 状态，根据状态来确定何时发送 native.ready 事件。
	if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
		setTimeout(function () {
			_documentWasReady();
		});
	} else {
		// document.ready 事件监听。
		function _docummentLoadedEventListener() {
			document.removeEventListener("DOMContentLoaded", _docummentLoadedEventListener);
			window.removeEventListener("load", _docummentLoadedEventListener);
			_documentWasReady();
		}

		document.addEventListener("DOMContentLoaded", _docummentLoadedEventListener);
		// WKWebView 某些情况下获取不到 DOMContentLoaded 事件。
		window.addEventListener("load", _docummentLoadedEventListener);
	}
})(this);

/**
 * 给 native 添加拓展自定义方法。
 * @private
 * @param {function} callback 回调函数，回调函数的返回值为属性配置。
 * @description 拓展回调函数将在收到原生 ready 消息时执行；如果原生当前已经初始化，则立即执行；回调函数中 this 指向 native 对象。
 */
function _extend(callback) {
	if (typeof callback !== 'function') {
		return this;
	}
	if (_isReady) {
		const descriptors = callback.call(this, _configuration);
		if (!!descriptors && typeof descriptors === 'object') {
			Object.defineProperties(this, descriptors);
		}
		return this;
	}
	_extensions.push(callback);
	return this;
}


// -------------- 支持函数 -------------

function _performByURL(method) {
	const parameters = [];
	for (let i = 1; i < arguments.length; i += 1) {
		const argument = arguments[i];
		if (typeof argument === 'function') {
			parameters.push(_callback(argument));
		} else {
			parameters.push(argument);
		}
	}
	// URL 示例：native://login?parameters=["John", "pw123456"]
	const url = _scheme + "://" + method + "?parameters=" + Native.parseURLQueryComponent(parameters);

	// 如果 URL 模式下，delegate 存在，则将 URL 发送给 delegate 。
	if (typeof _delegate === "function") {
		return _delegate(url);
	}

	// 创建一个不显示，不占空间的 iframe 向 webView 发送请求。
	const nativeFrame = document.createElement('iframe');
	nativeFrame.style.display = 'none';
	nativeFrame.setAttribute('src', url);
	document.body.appendChild(nativeFrame);
	setTimeout(function () {
		document.body.removeChild(nativeFrame);
	}, 2000);
}

// 调用 App 方法前，将所有参数转换成 JSON 数据类型，number/string/boolean 类型除外。
function _performByJSON(method) {
	const parameters = [method];
	for (let i = 1; i < arguments.length; i += 1) {
		const argument = arguments[i];
		switch (typeof argument) {
			case 'number':
			case 'string':
			case 'boolean':
				parameters.push(argument);
				break;
			case 'function':
				parameters.push(_callback(argument));
				break;
			default:
				parameters.push(JSON.stringify(argument));
				break;
		}
	}
	_performByObject.apply(this, parameters);
}

function _performByObject(method) {
	// Method 使用 / 分割属性，在使用 URL 交互方式时，
	// 方便判断方法的大类。
	const keyPaths = method.split("/");
	let nativeMethod = _delegate;
	for (let i = 0; i < keyPaths.length; i++) {
		const key = keyPaths[i];
		if (nativeMethod.hasOwnProperty(key)) {
			nativeMethod = nativeMethod[key];
			continue;
		}
		nativeMethod = null;
	}
	if (!nativeMethod || typeof nativeMethod !== 'function') {
		return Native.log("执行原生方法发生错误：在代理对象（" + _delegate + "）上没有找到待执行的方法（" + nativeMethod + "）！", Native.LogStyle.error);
	}
	return nativeMethod.apply(this, _sliceArguments(arguments, 1));
}

function _performByJavaScript(method) {
	const parameters = [];
	for (let i = 1; i < arguments.length; i++) {
		if (typeof arguments[i] === "function") {
			parameters.push(_callback(arguments[i]));
		} else {
			parameters.push(arguments[i]);
		}
	}
	_delegate.call(this, method, parameters);
}


const native = new (function () {
	Object.defineProperties(this, {
		mode: {
			get: function () {
				return _mode;
			}
		},
		scheme: {
			get: function () {
				return _scheme;
			}
		},
		delegate: {
			get: function () {
				return _delegate;
			}
		},
		isReady: {
			get: function () {
				return _isReady;
			}
		},
		performMethod: {
			get: function () {
				return _performMethod;
			}
		},
		callback: {
			get: function () {
				return _callback;
			}
		},
		addActionTarget: {
			get: function () {
				return _addActionTarget;
			}
		},
		removeActionTarget: {
			get: function () {
				return _removeActionTarget;
			}
		},
		sendAction: {
			get: function () {
				return _sendAction;
			}
		},
		ready: {
			get: function () {
				return _ready;
			}
		},
		extend: {
			get: function () {
				return _extend;
			}
		}
	})

	if (typeof window !== 'undefined') {
		window.native = this;
	} else if (typeof global !== 'undefined') {
		global.native = this;
	} else {
		Native.log("不能输出全局引用 native !", Native.LogStyle.warning);
	}
})();

export { Native, native };
export default native;