// native.js
// exports native.

const Native = require("./native.static.js");

// 注册 Native.Method.ready 。
Native.Method("ready", "ready");

// 继承 Native 类的子类。
const _Native = (function() {
	function _Native() {
		// 继承 Native 的属性。
		Native.call(this);
		// 自定义属性。
		let _configuration = null;
		const _extensions = [];
		const _readies = [];
		const _native = this;

		const _core = new _CoreNative(function(configuration) {
			_configuration = configuration;
			while (_extensions.length > 0) {
				let extension = _extensions.shift();
				Native.defineProperties(_native, extension.apply(_native, [_configuration]));
			}
			// 执行 ready，回调函数中 this 指向 window 对象。。
			while (_readies.length > 0) {
				(_readies.shift()).apply(window);
			}
		});

		function _ready(callback) {
			if (_core.isReady) {
				window.setTimeout(callback);
				return this;
			}
			_readies.push(callback);
			return this;
		}

		function _extend(callback) {
			if (typeof callback !== 'function') {
				return this;
			}
			if (_core.isReady) {
				Native.defineProperties(this, callback.apply(this, [_configuration]));
			} else {
				_extensions.push(callback);
			}
			return this;
		}

		Object.defineProperties(this, {
			"core": {
				get: function() {
					return _core;
				}
			},
			"ready": {
				get: function() {
					return _ready;
				}
			},
			"extend": {
				get: function() {
					return _extend;
				}
			}
		});
	}
	// 继承自 Native();
	_Native.prototype = new Native();
	return _Native;
})();


const native = new _Native();
Native.defineProperty(window, "native", {
	get: function() {
		return native;
	}
});
module.exports = native;


function _CoreNative(nativeWasReady) {

	let _uniqueID 		= 10000000; // 用于生成唯一的回调函数 ID 。
	let _keyedCallbacks = {}; // 按照 callbackID 保存的回调函数。
	let _mode 			= Native.Mode.url; // 交互的数据类型。
	let _delegate 		= null; // 事件代理，一般为原生注入到 JS 环境中的对象。
	let _scheme 		= "native"; // 使用 URL 交互时使用

	// 保存或读取 callback 。
	function _callback(callbackOrID, needsRemove) {
		switch (typeof callbackOrID) {
			case "function":
				let uniqueID = "NT" + (_uniqueID++);
				_keyedCallbacks[uniqueID] = callbackOrID;
				return uniqueID;
			case "string":
				if (!_keyedCallbacks.hasOwnProperty(callbackOrID)) {
					return undefined;
				}
				let callback = _keyedCallbacks[callbackOrID];
				if (needsRemove || typeof needsRemove === "undefined") {
					delete _keyedCallbacks[callbackOrID]
				}
				return callback;
			default:
				return Native.log("Parameters error: Only function or string is allowed for Native.callback()'s first argument.", Native.LogStyle.error);;
		}
	}

	// 调用 App 方法。
	function _perform(method) {
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
				return Native.log("Not supported interaction mode `" + _mode + "`, see more in NativeMode enum.", Native.LogStyle.error);
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
		// native://login?parameters=["John", "pw123456"]
		let url = _scheme + "://" + method + "?parameters=" + Native.parseURLQueryValue(parameters);
		let nativeFrame = document.createElement('iframe');
		nativeFrame.style.display = 'none';
		nativeFrame.setAttribute('src', url);
		document.body.appendChild(nativeFrame);
		window.setTimeout(function() {
			document.body.removeChild(nativeFrame);
		}, 2000);

		if (typeof _delegate === "function") {
			_delegate(url);
		}
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

	let _isReady = false;
	let _readyID = null;

	/**
	 * 注册 App 对象，以及 App 对象可接收的数据类型。
	 * @param delegate App 对象。
	 * @param mode App 对象可接收的数据类型。
	 * @private
	 */
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
		// 在 document.ready 之后执行，以避免 App 可能无法接收事件的问题。
		function _documentWasReady() {
			_readyID = _perform(Native.Method.ready, function(configuration) {
				_isReady = true;
				_readyID = null;
				nativeWasReady(configuration);
			});
		}

		if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
			window.setTimeout(function() {
				_documentWasReady();
			});
		} else {
			function _eventListener() {
				document.removeEventListener("DOMContentLoaded", _eventListener);
				window.removeEventListener("load", _eventListener);
				_documentWasReady();
			}
			document.addEventListener("DOMContentLoaded", _eventListener);
			// WKWebView 某些情况下获取不到 DOMContentLoaded 事件。
			window.addEventListener("load", _eventListener);
		}

		return this;
	}

	Object.defineProperties(this, {
		"callback": {
			get: function() {
				return _callback;
			}
		},
		"perform": {
			get: function() {
				return _perform;
			}
		},
		"scheme": {
			get: function() {
				return _scheme;
			},
			set: function(newValue) {
				_scheme = newValue;
			}
		},
		"isReady": {
			get: function() {
				return _isReady;
			}
		},
		"register": {
			get: function() {
				return _register;
			}
		},
		"delegate": {
			get: function() {
				return _delegate;
			}
		},
		"mode": {
			get: function() {
				return _mode;
			}
		}
	});
}