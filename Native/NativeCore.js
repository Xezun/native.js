// ======================================
// ======================================
// ======================================
// MARK: - Native

const NativeLogStyle = require("./NativeLogStyle.js")

exports.log = _log;
exports.defineProperty = _defineProperty;
exports.defineProperties = _defineProperties;
exports.parseURLQueryValue = _parseURLQueryValue;
exports.parseURLQuery = _parseURLQuery;
exports.Core = _NativeCore;
exports.cookie = new _NativeCookie();

funtion _log(message, style) {
    if (typeof style !== "number" || style === NativeLogStyle.default) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #333333", message);
    } else if (style === NativeLogStyle.warning) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #fe7e3c", message);
    } else if (style === NativeLogStyle.error) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #d8463c", message);
    }
}


funtion _defineProperty(object, propertyName, propertyList) {
    if (typeof object === "undefined") {
        return _NativeLog("Define property error: Can not define properties for an undefined value.", 2);
    }
    if (typeof propertyName !== "string" || propertyName.length === 0) {
        return _NativeLog("Define property error: The name for "+ object.constructor.name +"'s property must be a nonempty string.", 2);
    }
    if (object.hasOwnProperty(propertyName)) {
        return _NativeLog("Define property warning: The property "+ propertyName +" to be defined for "+ object.constructor.name +" is already exist.", 1);
    }
    Object.defineProperty(object, propertyName, propertyList);
}


funtion _defineProperties(object, propertyList) {
    if (typeof object === "undefined") {
        return _NativeLog("Define properties error: Can not define properties for an undefined value.", 2);
    }
    if (typeof propertyList !== "object") {
        return _NativeLog("Define properties error: The property list for "+ object.constructor.name +" at second parameter must be an Object.", 2);
    }
    for (let propertyName in propertyList) {
        if (!propertyList.hasOwnProperty(propertyName)) {
            continue;
        }
        _NativeDefineProperty(object, propertyName, propertyList[propertyName]);
    }
}

// 将任意值转换为 URL QueryValue 。
function _parseURLQueryValue(value) {
    if (!value) {
        return "";
    }
    switch (typeof value) {
        case 'string':
            return encodeURIComponent(value);
        case 'undefined':
            return '';
        default:
            return encodeURIComponent(JSON.stringify(value));
    }
}


// 将任意对象转换为 URL 查询字符串。
function _parseURLQuery(anObject) {
    if (!anObject) {
        return "";
    }
    // [a,b,c] -> a&b&c
    if (Array.isArray(anObject)) {
        let values = [];
        for (let i = 0; i < anObject.length; i++) {
            values.push(_parseURLQueryValue(anObject[i]));
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
                queryString += ("=" + _parseURLQueryValue(anObject[key]));
            }
            return queryString;
        case 'undefined':
            return '';
        default:
            return encodeURIComponent(JSON.stringify(anObject));
    }
}


// ======================================
// ======================================
// ======================================
// MARK: - CoreNative

function _NativeCore(nativeWasReady) {

    let _uniqueID = 10000000; // 用于生成唯一的回调函数 ID 。
    let _keyedCallbacks = {}; // 按照 callbackID 保存的回调函数。
    let _mode = NativeMode.url; // 交互的数据类型。
    let _delegate = null; // 事件代理，一般为原生注入到 JS 环境中的对象。
    let _scheme = "native"; // 使用 URL 交互时使用

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
                Native.log("Only callback function or callback is allowed", NativeLogStyle.error);
                return undefined;
        }
    }

    // 调用 App 方法。
    function _perform(method) {
        switch (_mode) {
            case NativeMode.url:
                return _performByURL.apply(this, arguments);
            case NativeMode.json:
                return _performByJSON.apply(this, arguments);
            case NativeMode.object:
                return _performByObject.apply(this, arguments);
            case NativeMode.javascript:
                return _performByJavaScript.apply(this, arguments);
            default:
                return Native.log("调用原生 App 方法失败，无法确定原生App可接受的数据类型。", NativeLogStyle.error);
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
            _readyID = _perform(window.NativeMethod.ready, function(configuration) {
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

    _NativeDefineProperties(this, {
        callback: {
            get: function() {
                return _callback;
            }
        },
        perform: {
            get: function() {
                return _perform;
            }
        },
        scheme: {
            get: function() {
                return _scheme;
            },
            set: function(newValue) {
                _scheme = newValue;
            }
        },
        isReady: {
            get: function() {
                return _isReady;
            }
        },
        register: {
            get: function() {
                return _register;
            }
        },
        delegate: {
            get: function() {
                return _delegate;
            },
            set: function(newValue) {
                _delegate = newValue;
            }
        },
        mode: {
            get: function() {
                return _mode;
            },
            set: function(newValue) {
                _mode = newValue;
            }
        }
    });
}

// ======================================
// ======================================
// ======================================
// MARK: - Cookie

function _NativeCookie() {
    // 缓存
    let _keyedCookies = null;

    /**
     * 如果 Cookie 缓存不存在，则读取并缓存 Cookie 。
     * @private
     */
    function _readIfNeeded() {
        if (!!_keyedCookies) {
            return;
        }

        // 缓存只在当前 runLoop 中生效。
        _keyedCookies = {};
        window.setTimeout(function() {
            _keyedCookies = null;
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
                _keyedCookies[name] = decodeURIComponent(tmp[1]);
            } else {
                _keyedCookies[name] = null;
            }
        }
    }

    /**
     * 读取或设置指定键存储在 Cookie 中的值。
     * @param key 键名。
     * @param value 可选，表示设置 Cookie。
     * @return {*} 设置 Cookie 时返回对象自身。
     * @private
     */
    function _value(key, value) {
        // 读取
        if (typeof value === "undefined") {
            _readIfNeeded();
            if (_keyedCookies.hasOwnProperty(key)) {
                return _keyedCookies[key];
            }
            return undefined;
        }
        // 设置
        let date = new Date();
        if (!!value) { // null 值表示删除，否则就是设置新值。
            date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
            if (typeof value !== "string") {
                value = JSON.stringify(value);
            }
            document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + "; expires=" + date.toUTCString();
        } else {
            date.setTime(date.getTime() - 1);
            document.cookie = encodeURIComponent(key) + "; expires=" + date.toUTCString();
        }
        if (!!_keyedCookies) {
            _keyedCookies[key] = value;
        }
        return this;
    }

    /**
     * 同步最新的 Cookie 。
     * @return {_synchronize}
     * @private
     */
    function _synchronize() {
        _keyedCookies = null;
        return this;
    }

    _NativeDefineProperties(this, {
        value: {
            get: function() {
                return _value;
            }
        },
        synchronize: {
            get: function() {
                return _synchronize;
            }
        }
    });
}