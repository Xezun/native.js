// native.js
// Created by mlibai. 2019.05.18

/**
 * 控制台输出样式枚举。
 *
 * @constant
 * @name LogStyle
 * @property {number} default 在控制台输出普通样式文本，表示一条普通的输出信息。
 * @property {number} warning 输出警告样式文本，表示一条警告信息，可能需要开发者注意。 
 * @property {number} error   输出错误样式文本，表示一条错误信息，开发者需要修复。
 */
const _NativeLogStyle = Object.freeze({
	"default": 0,
	"warning": 1,
	"error": 2
});

/**
 * Native 与原生的交互模式。
 *
 * @constant
 * @name Mode
 * @property {string} url        使用 URL 方式交互。
 * @property {string} json       使用安卓 JS 注入原生对象作为代理：函数参数支持基本数据类型，复杂数据使用 JSON 。
 * @property {string} object     使用 iOS 注入原生对象作为代理：支持所有类型的数据。
 * @property {string} javascript 调试或者 iOS WebKit 注入 js ，使用函数作为代理。
 */
const _NativeMode = Object.freeze({
	"url": "url",
	"json": "json",
	"object": "object",
	"javascript": "javascript"
});

// 交互模式。
let _mode = _NativeMode.url;
// _perform 方法中的回调函数：{"uniqueID": callback}
let _performedHandlers = {};
// 已注册的监听原生事件的函数：{"EventName": [hander1, handler2, ...]}
let _actionTargets = {};
// 唯一标识符。
let _uniqueID = 10000000;
// 使用 URL 交互时使用的协议头。
let _scheme = "native";
// 原生用于接收事件的对象。
let _delegate = null;
// 是否可以进行交互。
let _isReady = false;
// 共用的 Cookie 管理
const _cookie = new _NativeCookie();

// ---------- 模块输出 ---------- 

Object.defineProperties(global, {
	"NativeLogStyle": {
		get: function() {
			return _NativeLogStyle;
		}
	},
	"NativeMode": {
		get: function() {
			return _NativeMode;
		}
	},
	"NativeParseURLQuery": {
		get: function() {
			return _NativeParseURLQuery;
		}
	},
	"NativeParseURLQueryComponent": {
		get: function() {
			return _NativeParseURLQueryComponent;
		}
	},
	"NativeLog": {
		get: function() {
			return _NativeLog;
		}
	},
	"NativeMethod": {
		get: function() {
			return _NativeMethod;
		}
	},
	"NativeAction": {
		get: function() {
			return _NativeAction;
		}
	},
	"NativeCookieKey": {
		get: function() {
			return _NativeCookieKey;
		}
	},
	"native": {
		get: function() {
			return exports;
		}
	}
});

Object.defineProperties(exports, {
	"mode": {
		get: function() {
			return _mode;
		}
	},
	"scheme": {
		get: function() {
			return _scheme;
		}
	},
	"isReady": {
		get: function() {
			return _isReady;
		}
	},
	"delegate": {
		get: function() {
			return _delegate;
		}
	},
	"performMethod": {
		get: function() {
			return _performMethod;
		}
	},
	"callback": {
		get: function() {
			return _callback;
		}
	},
	"addActionTarget": {
		get: function() {
			return _addActionTarget;
		}
	},
	"removeActionTarget": {
		get: function() {
			return _removeActionTarget;
		}
	},
	"sendAction": {
		get: function() {
			return _sendAction;
		}
	},
	"ready": {
		get: function() {
			return _ready;
		}
	},
	"register": {
		get: function() {
			return _register;
		}
	},
	"extend": {
		get: function() {
			return _extend;
		}
	},
	"cookie": {
		get: function() {
			return _cookie;
		}
	}
});

// ------------- 主要实现代码 ----------------

// 执行原生方法：方法名，参数1，参数2，……。
function _performMethod(nativeMethod) {
	switch (_mode) {
		case _NativeMode.url:
			return _performByURL.apply(this, arguments);
		case _NativeMode.json:
			return _performByJSON.apply(this, arguments);
		case _NativeMode.object:
			return _performByObject.apply(this, arguments);
		case _NativeMode.javascript:
			return _performByJavaScript.apply(this, arguments);
		default:
			return _NativeLog("native.js 暂不支持 " + _mode + " 交互模式，请使用 NativeMode 所枚举的交互模式！", _NativeLogStyle.error);
	}
}

// 存储回调函数：回调函数 -> 唯一ID。
// 取出回调函数：唯一ID，是否删除回调函数（可选，默认true）。
function _callback(callbackOrUniqueID, needsRemoveAfterCalled) {
	switch (typeof callbackOrUniqueID) {
		case "function":
			let uniqueID = "NT" + (_uniqueID++);
			_performedHandlers[uniqueID] = callbackOrUniqueID;
			return uniqueID;
		case "string":
			if (!_performedHandlers.hasOwnProperty(callbackOrUniqueID)) {
				return _NativeLog("没有找到标识符 " + callbackOrUniqueID + " 所注册的回调函数！\n提示：如果回调函数须多次执行，请指定第二个参数为 false，以保证在回调函数执行后不被删除。", _NativeLogStyle.error);
			}
			let callback = _performedHandlers[callbackOrUniqueID];
			if (typeof needsRemoveAfterCalled === "undefined" || !!needsRemoveAfterCalled) {
				delete _performedHandlers[callbackOrUniqueID];
			}
			return callback;
		default:
			return _NativeLog("Parameters error: Only function or string is allowed for Native.callback()'s first argument.", Native.LogStyle.error);;
	}
}

// 监听原生事件：事件名称, 回调函数。		
function _addActionTarget(eventName, eventHandler) {
	if (typeof eventHandler !== 'function' || typeof eventName !== 'string' || eventName.length == 0) {
		return;
	}
	if (!_actionTargets.hasOwnProperty(eventName)) {
		_actionTargets[eventName] = [eventHandler];
		return;
	}
	_actionTargets.push(eventHandler);
}

// 移除监听：事件名称，回调函数（可选，默认删除所有）。
function _removeActionTarget(eventName, eventHandler) {
	if (typeof eventName !== 'string' || eventName.length == 0) {
		return;
	}
	if (!_actionTargets.hasOwnProperty(eventName)) {
		return;
	}
	if (!eventHandler) {
		delete _actionTargets[eventName];
		return;
	}
	let listeners = _actionTargets[eventName];
	for (var i = listeners.length - 1; i >= 0; i--) {
		if (listeners[i] == eventHandler) {
			listeners.splice(i, 1);
		}
	}
}

// 发送事件：事件名称，参数1（可选，与事件相关），参数2（可选，可选与事件相关），……。
function _sendAction(eventName) {
	if (typeof eventName !== 'string' || eventName.length == 0) {
		return;
	}
	if (!_actionTargets.hasOwnProperty(eventName)) {
		return;
	}
	let parameters = [];
	for (var i = 1; i < arguments.length; i++) {
		parameters.push(arguments[i]);
	}
	let listeners = _actionTargets[eventName];
	for (var i = 0; i < listeners.length; i++) {
		listeners[i].apply(this, parameters);
	}
}

// ---------- 交互初始化 ---------- 

// 注册 ready 方法。
_NativeMethod("ready", "ready");
// App 配置信息。
let _configuration = {};
// native 拓展。
const _extensions = [];
// 当前的 native.ready 回调函数标识符。
let _readyID = null;
// 已注册的 ready 事件函数。
const _readyListeners = [];

// App注册代理和交互方式。
function _register(delegate, mode) {
	_delegate = delegate;
	_mode = mode;
	// 如果已经初始化，则不再初始化，仅仅是改变代理。
	if (_isReady) {
		return this;
	}
	// 删除已经发起的 ready 事件。
	if (!!_readyID) {
		_callback(_readyID, true);
	}
	let that = this;
	// 在 document.ready 之后发送 native.ready 事件（避免 App 可能无法接收事件的问题），告诉 App 初始化 native 对象。
	function _documentWasReady() {
		_readyID = _performMethod.call(that, _NativeMethod.ready, function(configuration) {
			_isReady = true;
			_readyID = null;
			if (!!configuration) {
				_configuration = configuration;
			}
			while (_extensions.length > 0) {
				let extension = _extensions.shift();
				Object.defineProperties(that, extension.apply(that, [_configuration]));
			}
			// 执行 ready，回调函数中 this 指向 window 对象。。
			while (_readyListeners.length > 0) {
				(_readyListeners.shift()).apply(global);
			}
		});
	}
	// 检查 document 状态，根据状态来确定何时发送 native.ready 事件。
	if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
		setTimeout(function() {
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
	return this;
}

/**
 * 注册 native 交互初始化后的操作。
 * @param {NativeReadyCallback} callback 回调函数。
 */
function _ready(callback) {
	if (_isReady) {
		setTimeout(callback);
		return this;
	}
	_readyListeners.push(callback);
	return this;
}

// 自定义拓展的支持。
function _extend(callback) {
	if (typeof callback !== 'function') {
		return this;
	}
	if (_isReady) {
		Object.defineProperties(this, callback.apply(this, [_configuration]));
	} else {
		_extensions.push(callback);
	}
	return this;
}


// -------------- 支持函数 -------------

function _performByURL(method) {
	let parameters = [];
	for (let i = 1; i < arguments.length; i += 1) {
		let argument = arguments[i];
		if (typeof argument === 'function') {
			parameters.push(_callback(argument));
		} else {
			parameters.push(argument);
		}
	}
	// URL 示例：native://login?parameters=["John", "pw123456"]
	let url = _scheme + "://" + method + "?parameters=" + _NativeParseURLQueryComponent(parameters);

	// 如果 URL 模式下，delegate 存在，则将 URL 发送给 delegate 。
	if (typeof _delegate === "function") {
		return _delegate(url);
	}

	// 创建一个不显示，不占空间的 iframe 向 webView 发送请求。
	let nativeFrame = document.createElement('iframe');
	nativeFrame.style.display = 'none';
	nativeFrame.setAttribute('src', url);
	document.body.appendChild(nativeFrame);
	setTimeout(function() {
		document.body.removeChild(nativeFrame);
	}, 2000);
}

// 调用 App 方法前，将所有参数转换成 JSON 数据类型，number/string/boolean 类型除外。
function _performByJSON(method) {
	let parameters = [method];
	for (let i = 1; i < arguments.length; i += 1) {
		let argument = arguments[i];
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
	let parameters = [];
	for (let i = 1; i < arguments.length; i += 1) {
		parameters.push(arguments[i]);
	}
	setTimeout(function() {
		// Method 使用 / 分割属性，在使用 URL 交互方式时，
		// 方便判断方法的大类。
		let array = method.split("/");
		let object = _delegate;
		for (let i = 0; i < array.length; i++) {
			object = object[array[i]];
		}
		// 直接触发原生方法，this 指向 window 。
		object.apply(global, parameters);
	});
}

function _performByJavaScript(method) {
	let parameters = [];
	for (let i = 1; i < arguments.length; i++) {
		if (typeof arguments[i] === "function") {
			parameters.push(_callback(arguments[i]));
		} else {
			parameters.push(arguments[i]);
		}
	}
	setTimeout(function() {
		// 代理触发，this 指向 window 。
		_delegate.apply(global, [method, parameters]);
	});
}


function _NativeLog(message, style) {
	if (typeof style !== "number" || style === _NativeLogStyle.default) {
		return console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #333333", message);
	}
	if (style === _NativeLogStyle.warning) {
		return console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #f98300", message);
	}
	return console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #c2352d", message);
}

function _NativeParseURLQueryComponent(aValue) {
	if (!aValue) {
		return "";
	}
	switch (typeof aValue) {
		case 'string':
			return encodeURIComponent(aValue);
		case 'undefined':
			return '';
		default:
			return encodeURIComponent(JSON.stringify(aValue));
	}
}

function _NativeParseURLQuery(anObject) {
	if (!anObject) {
		return "";
	}

	// [a,b,c] -> a&b&c
	if (Array.isArray(anObject)) {
		let values = [];
		for (let i = 0; i < anObject.length; i++) {
			values.push(_NativeParseURLQueryComponent(anObject[i]));
		}
		return values.join("&");
	}

	switch (typeof anObject) {
		case 'string': // any string -> any%20string
			return encodeURIComponent(anObject);

		case 'object': // { key1: value1, key2: value2 } -> key1=value1&key2=value2
			let queryString = "";
			for (let key in anObject) {
				if (!anObject.hasOwnProperty(key)) {
					continue;
				}
				if (queryString.length > 0) {
					queryString += ("&" + encodeURIComponent(key));
				} else {
					queryString = encodeURIComponent(key);
				}
				if (!anObject[key]) {
					continue;
				}
				queryString += ("=" + _NativeParseURLQueryComponent(anObject[key]));
			}
			return queryString;
		case 'undefined':
			return '';
		default:
			return encodeURIComponent(JSON.stringify(anObject));
	}
}

function _NativeDefineProperty(anObject, name, descriptor) {
	if (typeof anObject === "undefined") {
		return _NativeLog("Define property error: Can not define properties for an undefined value.", 2);
	}
	if (typeof name !== "string" || name.length === 0) {
		return _NativeLog("Define property error: The name for " + anObject.constructor.name + "'s property must be a nonempty string.", 2);
	}
	if (anObject.hasOwnProperty(name)) {
		return _NativeLog("Define property warning: The property " + name + " to be defined for " + anObject.constructor.name + " is already exist.", 1);
	}
	descriptor.enumerable = true;
	Object.defineProperty(anObject, name, descriptor);
	return anObject;
}

function _NativeDefineProperties(anObject, descriptors) {
	if (typeof anObject === "undefined") {
		return _NativeLog("Define properties error: Can not define properties for an undefined value.", 2);
	}
	if (typeof descriptors !== "object") {
		return _NativeLog("Define properties error: The property descriptors for " + anObject.constructor.name + " at second parameter must be an Object.", 2);
	}
	for (let propertyName in descriptors) {
		if (!descriptors.hasOwnProperty(propertyName)) {
			continue;
		}
		_NativeDefineProperty(anObject, propertyName, descriptors[propertyName]);
	}
	return anObject;
}

function _NativeObjectEnumerator(anObject, callback) {
	for (const key in anObject) {
		const value = anObject[key];
		switch (typeof value) {
			case "string":
				if (callback(key, value)) {
					return true;
				}
				break;
			case "object":
				if (_NativeObjectEnumerator(value, callback)) {
					return true
				};
				break;
			default:
				break;
		}
	}
	return false;
}

function _NativeMethod(methodName, methodValue) {
	if (typeof methodName !== "string" || methodName.length === 0) {
		return _NativeLog("NativeMethod 注册失败，方法名称必须为长度大于 0 的字符串！", NativeLogStyle.error);
	}
	if (_NativeMethod.hasOwnProperty(methodName)) {
		return _NativeLog("NativeMethod 注册失败，已存在名称为“" + methodName + "”的方法！", NativeLogStyle.error);
	}
	if (_NativeObjectEnumerator(_NativeMethod, function(key, value) {
			return (value === methodValue);
		})) {
		return _NativeLog("NativeMethod 注册失败，已存在值为“" + methodValue + "”的方法！", NativeLogStyle.error);
	}
	_NativeDefineProperty(_NativeMethod, methodName, {
		get: function() {
			return methodValue;
		}
	});
	return methodValue;
}

function _NativeAction(eventName, eventValue) {
	if (typeof eventName !== "string" || eventName.length === 0) {
		return _NativeLog("NativeAction 注册失败，事件名称必须为长度大于 0 的字符串！", NativeLogStyle.error);
	}
	if (_NativeAction.hasOwnProperty(eventName)) {
		return _NativeLog("NativeAction 注册失败，已存在名称为“" + eventName + "”的事件！", NativeLogStyle.error);
	}
	if (_NativeObjectEnumerator(_NativeAction, function(key, value) {
			return (value === eventValue);
		})) {
		return _NativeLog("NativeAction 注册失败，已存在值为“" + eventValue + "”的事件！", NativeLogStyle.error);
	}
	_NativeDefineProperty(_NativeAction, eventName, {
		get: function() {
			return eventValue;
		}
	});
	return eventValue;
}

function _NativeCookieKey(keyName, keyValue) {
	if (typeof keyName !== "string" || keyName.length === 0) {
		return _NativeLog("NativeCookieKey 注册失败，名称必须为长度大于 0 的字符串！", NativeLogStyle.error);
	}
	if (typeof keyValue !== "string" || keyValue.length === 0) {
		return _NativeLog("NativeCookieKey 注册失败，值必须为大于 0 的字符串！", NativeLogStyle.error);
	}
	if (_NativeCookieKey.hasOwnProperty(keyName)) {
		return _NativeLog("NativeCookieKey 注册失败，已存在名称为“`" + keyName + "`”的 Cookie 键！", NativeLogStyle.error);
	}
	if (_NativeObjectEnumerator(_NativeCookieKey, function(key, value) {
			return (value === keyValue);
		})) {
		return _NativeLog("NativeCookieKey 注册失败，已存在值为“" + keyValue + "”的 Cookie 键！", NativeLogStyle.error);
	}
	_NativeDefineProperty(_NativeCookieKey, keyName, {
		get: function() {
			return keyValue;
		}
	});
	return keyValue;
}


function _NativeCookie() {
	/**
	 * 保存了已解析过的 Cookie 值。
	 * @private
	 */
	let keyedCookies = null;

	// 当页面显示时，重置 Cookie 。
	window.addEventListener('pageshow', function() {
		keyedCookies = null;
	});

	/**
	 * 读取或设置 Cookie 值。
	 * 调用此方法时，如果只有一个参数，或者第二个参数不是 string 类型，表示读取 Cookie 中对应的键值；
	 * 第二个参数，null 表示删除 Cookie 值，string 表示设置新的值；
	 * 第三个参数，Cookie 保存时长，默认 30 天，单位秒。
	 * @param  {!string} cookieKey 保存Cookie所使用的键名。
	 * @param  {?string} newCookieValue 可选，待设置的值，如果没有此参数则表示读取。 
	 * @param  {?number} cookieExpires 可选，Cookie 保存时长。
	 * @return {?string} 已保存的Cookie值，如果未找到返回 null ，设置值时返回设置后的值。
	 *
	 * @constant
	 */
	function value(cookieKey, newCookieValue, cookieExpires) {
		if (typeof cookieKey !== "string") {
			return undefined;
		}
		if (typeof newCookieValue === "string") {
			// 设置 Cookie
			let expireDate = new Date();
			if (typeof cookieExpires === "number") {
				expireDate.setTime(expireDate.getTime() + cookieExpires * 1000);
			} else {
				expireDate.setTime(expireDate.getTime() + 30 * 24 * 60 * 60 * 1000);
			}
			let key = _NativeParseURLQueryComponent(cookieKey);
			let value = _NativeParseURLQueryComponent(newCookieValue);
			document.cookie = key + "=" + value + "; expires=" + expireDate.toUTCString();
			if (!!keyedCookies) {
				keyedCookies[cookieKey] = newCookieValue;
			}
			return newCookieValue;
		} else if (newCookieValue === null) {
			// 删除 Cookie 
			let expireDate = new Date();
			date.setTime(date.getTime() - 1);
			document.cookie = _NativeParseURLQueryComponent(cookieKey) + "; expires=" + date.toUTCString();
			if (!!keyedCookies) {
				keyedCookies[cookieKey] = newCookieValue;
			}
			return newCookieValue;
		}
		// 读取 Cookie
		readIfNeeded();
		if (keyedCookies.hasOwnProperty(cookieKey)) {
			return keyedCookies[cookieKey];
		}
		return null;
	}

	/**
	 * 同步 Cookie ，刷新 Cookie 缓存，重新从系统 Cookie 中读取。
	 *
	 * @constant
	 */
	function synchronize() {
		keyedCookies = null;
		return this;
	}

	/**
	 * 解析 Cookie ，解析后的 Cookie 保存在 keyedCookies 中，并且只存在一个 runloop 周期；
	 * 如果已解析则不操作。
	 * @private
	 */
	function readIfNeeded() {
		if (!!keyedCookies) {
			return;
		}

		keyedCookies = {};
		setTimeout(function() {
			keyedCookies = null;
		});

		let cookieStore = document.cookie;
		if (!cookieStore) {
			return;
		}
		let cookies = cookieStore.split("; ");
		while (cookies.length > 0) {
			let tmp = (cookies.pop()).split("=");
			if (!Array.isArray(tmp) || tmp.length === 0) {
				continue;
			}

			let name = decodeURIComponent(tmp[0]);
			if (tmp.length > 1) {
				keyedCookies[name] = decodeURIComponent(tmp[1]);
			} else {
				keyedCookies[name] = null;
			}
		}
	}

	Object.defineProperties(this, {
		"value": {
			get: function() {
				return value;
			}
		},
		"synchronize": {
			get: function() {
				return synchronize;
			}
		}
	});
}