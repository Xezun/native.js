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
let _eventListeners = {};
// 唯一标识符。
let _uniqueID = 10000000;
// 使用 URL 交互时使用的协议头。
let _scheme = "native";
// 原生用于接收事件的对象。
let _delegate = null;


// 接口输出。

global.NativeLogStyle = _NativeLogStyle;
global.NativeMode = _NativeMode;
global.NativeParseURLQuery = _NativeParseURLQuery;
global.NativeParseURLQueryComponent = _NativeParseURLQueryComponent;
global.NativeLog = _NativeLog;
global.NativeDefineProperty = _NativeDefineProperty;
global.NativeDefineProperties = _NativeDefineProperties;
global.NativeObjectEnumerator = _NativeObjectEnumerator;
global.NativeMethod = _NativeMethod;
global.NativeCookieKey = _NativeCookieKey;

module.exports.mode = _mode;
module.exports.scheme = _scheme;
module.exports.delegate = _delegate;
module.exports.performMethod = _performMethod;
module.exports.callback = _callback;
module.exports.addEventListener = _addEventListener;
module.exports.removeEventListener = _removeEventListener;
module.exports.dispatchEvent = _dispatchEvent;

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
function _addEventListener(eventName, eventHandler) {
	if (typeof eventHandler !== 'function' || typeof eventName !== 'string' || eventName.length == 0) {
		return;
	}
	if (!_eventListeners.hasOwnProperty(eventName)) { 
		_eventListeners[eventName] = [eventHandler]; 
		return;
	}
	_eventListeners.push(eventHandler);
}

// 移除监听：事件名称，回调函数（可选，默认删除所有）。
function _removeEventListener(eventName, eventHandler) {
	if (typeof eventName !== 'string' || eventName.length == 0) {
		return;
	}
	if (!_eventListeners.hasOwnProperty(eventName)) {
		return;
	}
	if (!eventHandler) {
		delete _eventListeners[eventName];
		return;
	}
	let listeners = _eventListeners[eventName];
	for (var i = listeners.length - 1; i >= 0; i--) {
		if (listeners[i] == eventHandler) {
			listeners.splice(i, 1);
		}
	}
}

// 发送事件：事件名称，参数1（可选，与事件相关），参数2（可选，可选与事件相关），……。
function _dispatchEvent(eventName) {
	if (typeof eventName !== 'string' || eventName.length == 0) {
		return;
	}
	if (!_eventListeners.hasOwnProperty(eventName)) {
		return;
	}
	let parameters = [];
	for (var i = 1; i < arguments.length; i++) {
		parameters.push(arguments[i]);
	}
	let listeners = _eventListeners[eventName];
	for (var i = 0; i < listeners.length; i++) {
		listeners[i].apply(window, parameters);
	}
}


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
	window.setTimeout(function() {
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
	window.setTimeout(function() {
		let array = method.split("/");
		let object = _delegate;
		for (let i = 0; i < array.length; i++) {
			object = object[array[i]];
		}
		object.apply(window, parameters);
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
	window.setTimeout(function() {
		_delegate.apply(window, [method, parameters]);
	});
}


function _NativeLog(message, style) {
	if (typeof style !== "number" || style === _NativeLogStyle.default) {
		return console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #333333", message);
	}
	if (style === _NativeLogStyle.warning) {
		return console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #f7c644", message);
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
        if (anObject.hasOwnProperty(key)) {
            const element = object[key];
            switch (typeof element) {
                case "string":
                    if (callback(element)) { return true; }
                    break;
                case "object":
                    if (_NativeObjectEnumerator(element, callback)) { return true };
                    break;
                default:
                    break;
            }
        }
    }
    return false;
}

function _NativeMethod(methodName, methodValue) {
    if (typeof methodName !== "string" || methodName.length === 0) {
        return _NativeLog("The name of NativeMethod must be a nonempty string.", NativeLogStyle.error);
    }
    if ( _NativeObjectEnumerator(_NativeMethod, function (method) { return (method === methodValue); }) ) {
        return _NativeLog("NativeMethod." + methodName + " has been registered already.", NativeLogStyle.error);
    }
    _NativeDefineProperty(_NativeMethod, methodName, {
        get: function () {
            return methodValue;
        }
    });
    return methodValue;
}

function _NativeCookieKey(keyName, keyValue) {
    if (typeof keyName !== "string" || keyName.length === 0) {
        return _NativeLog("The name for NativeCookieKey must be a nonempty string.", NativeLogStyle.error);
    }
    if (typeof keyValue !== "string" || keyValue.length === 0) {
        return _NativeLog("The value for NativeCookieKey must be a nonempty string.", NativeLogStyle.error);
    }
    if ( _NativeCookieKey.hasOwnProperty(keyName) ) {
        return _NativeLog("The name for NativeCookieKey `" + keyName + "` has been registered already.", NativeLogStyle.error);
    }
    for (const key in _NativeCookieKey) {
        if (_NativeCookieKey.hasOwnProperty(key)) {
            const element = _NativeCookieKey[key];
            if (element === keyValue) {
                return _NativeLog("The value `"+ element +"` was registered with name `"+ key +"` already.", NativeLogStyle.error);;
            }
        }
    }
    _NativeDefineProperty(_NativeCookieKey, keyName, {
        get: function () {
            return keyValue;
        }
    });
    return keyValue;
}


