// native.static.js

module.exports = Native;

NativeMethod("ready", "ready");

const NativeLogStyle = Object.freeze({
    "default": 0,
    "warning": 1,
    "error": 2
});
const NativeMode = Object.freeze({
    url: "url", // 使用 URL 方式交互。
    json: "json", // 使用安卓 JS 注入原生对象作为代理：函数参数支持基本数据类型，复杂数据使用 JSON 。
    object: "object", // 使用 iOS 注入原生对象作为代理：支持所有类型的数据。
    javascript: "javascript" // 调试或者 iOS WebKit 注入 js ，使用函数作为代理。
});
const _cookie = new NativeCookie();

NativeDefineProperties(Native, {
    "version": {
        get: function() {
            return "2.0.0";
        }
    },
    "LogStyle": {
        get: function() {
            return NativeLogStyle;
        }
    },
    "log": {
        get: function() {
            return NativeLog;
        }
    },
    "defineProperty": {
        get: function() {
            return NativeDefineProperty;
        }
    },
    "defineProperties": {
        get: function() {
            return NativeDefineProperties;
        }
    },
    "parseURLQueryValue": {
        get: function() {
            return NativeParseURLQueryValue;
        }
    },
    "parseURLQuery": {
        get: function() {
            return NativeParseURLQuery;
        }
    },
    "cookie": {
        get: function() {
            return _cookie;
        }
    },
    "Mode": {
        get: function() {
            return NativeMode;
        }
    },
    "Method": {
        get: function() {
            return NativeMethod;
        }
    },
    "CookieKey": {
        get: function() {
            return NativeCookieKey;
        }
    }

});


// 定义全局名称。

NativeDefineProperty(window, "Native", {
    get: function() {
        return Native;
    }
});
NativeDefineProperty(window, "NativeMode", {
    get: function() {
        return NativeMode;
    }
});
NativeDefineProperty(window, "NativeType", {
    get: function() {
        NativeLog("NativeType was deprecated, please use NativeMode instead.", NativeLogStyle.warning);
        return NativeMode;
    }
});
NativeDefineProperty(window, "NativeLogStyle", {
    get: function() {
        return NativeLogStyle;
    }
});
NativeDefineProperty(window, "NativeLog", {
    get: function() {
        return NativeLog;
    }
});
NativeDefineProperty(window, "NativeDefineProperty", {
    get: function() {
        return NativeDefineProperty;
    }
});
NativeDefineProperty(window, "NativeDefineProperties", {
    get: function() {
        return NativeDefineProperties;
    }
});
NativeDefineProperty(window, "NativeParseURLQueryValue", {
    get: function() {
        return NativeParseURLQueryValue;
    }
});
NativeDefineProperty(window, "NativeParseURLQuery", {
    get: function() {
        return NativeParseURLQuery;
    }
});
NativeDefineProperty(window, "NativeCookie", {
    get: function() {
        return NativeCookie;
    }
});
NativeDefineProperty(window, "NativeMethod", {
    get: function() {
        return NativeMethod;
    }
});
NativeDefineProperty(window, "NativeCookieKey", {
    get: function() {
        return NativeCookieKey;
    }
});

// 函数、类定义

function NativeLog(message, style) {
    if (typeof style !== "number" || style === NativeLogStyle.default) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #333333", message);
    } else if (style === NativeLogStyle.warning) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #fe7e3c", message);
    } else if (style === NativeLogStyle.error) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #d8463c", message);
    }
}

function NativeDefineProperty(object, propertyName, propertyDescriptor) {
    if (typeof object === "undefined") {
        return NativeLog("Define property error: Can not define properties for an undefined value.", 2);
    }
    if (typeof propertyName !== "string" || propertyName.length === 0) {
        return NativeLog("Define property error: The name for "+ object.constructor.name +"'s property must be a nonempty string.", 2);
    }
    if (object.hasOwnProperty(propertyName)) {
        return NativeLog("Define property warning: The property "+ propertyName +" to be defined for "+ object.constructor.name +" is already exist.", 1);
    }
    Object.defineProperty(object, propertyName, propertyDescriptor);
    return object;
}

function NativeDefineProperties(object, propertyDescriptors) {
    if (typeof object === "undefined") {
        return NativeLog("Define properties error: Can not define properties for an undefined value.", 2);
    }
    if (typeof propertyDescriptors !== "object") {
        return NativeLog("Define properties error: The property descriptors for "+ object.constructor.name +" at second parameter must be an Object.", 2);
    }
    for (let propertyName in propertyDescriptors) {
        if (!propertyDescriptors.hasOwnProperty(propertyName)) {
            continue;
        }
        NativeDefineProperty(object, propertyName, propertyDescriptors[propertyName]);
    }
    return object;
}

// 将任意值转换为 URL QueryValue 。
function NativeParseURLQueryValue(value) {
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
function NativeParseURLQuery(anObject) {
    if (!anObject) {
        return "";
    }
    // [a,b,c] -> a&b&c
    if (Array.isArray(anObject)) {
        let values = [];
        for (let i = 0; i < anObject.length; i++) {
            values.push(NativeParseURLQueryValue(anObject[i]));
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
                queryString += ("=" + NativeParseURLQueryValue(anObject[key]));
            }
            return queryString;
        case 'undefined':
            return '';
        default:
            return encodeURIComponent(JSON.stringify(anObject));
    }
}

function NativeCookie() {

    let _keyedCookies = null;

    function _readIfNeeded() {
        if (!!_keyedCookies) {
            return;
        }

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

    function _synchronize() {
        _keyedCookies = null;
        return this;
    }

    Object.defineProperties(this, {
        "value": {
            get: function() {
                return _value;
            }
        },
        "synchronize": {
            get: function() {
                return _synchronize;
            }
        }
    });
}

function NativeMethod(methodName, methodValue) {
    if (typeof methodName !== "string" || methodName.length === 0) {
        return NativeLog("The name of NativeMethod must be a nonempty string.", NativeLogStyle.error);
    }
    if (NativeMethod.hasOwnProperty(methodName)) {
        return NativeLog("Native Method " + methodName + " has been registered already.", NativeLogStyle.error);
    }
    NativeDefineProperty(NativeMethod, methodName, {
        get: function() {
            return methodValue;
        }
    });
    return methodValue;
}

function NativeCookieKey(cookieKey, cookieValue) {
    if (typeof cookieKey !== "string" || cookieKey.length === 0) {
        return NativeLog("The name of NativeMethod must be a nonempty string.", NativeLogStyle.error);
    }
    if (NativeCookieKey.hasOwnProperty(cookieKey)) {
        return NativeLog("Native Method " + cookieKey + " has been registered already.", NativeLogStyle.error);
    }
    NativeDefineProperty(NativeCookieKey, cookieKey, {
        get: function() {
            return cookieValue;
        }
    });
    return cookieValue;
}

function CoreNative(nativeWasReady) {

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
                return NativeLog("Parameters error: Only function or string is allowed for Native.callback()'s first argument.", NativeLogStyle.error);;
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
                return NativeLog("Not supported interaction mode `" + _mode + "`, see more in NativeMode enum.", NativeLogStyle.error);
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
        let url = _scheme + "://" + method + "?parameters=" + NativeParseURLQueryValue(parameters);
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

function Native() {
    let _configuration = null;
    const _extensions = [];
    const _readies    = [];
    const _native = this;

    const _core = new CoreNative(function(configuration) {
        _configuration = configuration;
        while (_extensions.length > 0) {
            let extension = _extensions.shift();
            NativeDefineProperties(_native, extension.apply(_native, [_configuration]));
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
            NativeDefineProperties(this, callback.apply(this, [_configuration]));
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

