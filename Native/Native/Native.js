// XZNative.js


const NativeTypeURL         = 0; // 使用 URL 方式交互。
const NativeTypeJSON        = 1; // 使用代理，但是基本数据类型和 JSON 数据进行交互。
const NativeTypeObject      = 2; // 代理使用对象进行交互。
const NativeTypeFunction    = 3; // 代理为函数。

const NativeLogStyleDefault = 0;
const NativeLogStyleWarning = 1;
const NativeLogStyleError   = 2;

// ready 方法用于需要在 AppCore 初始化后执行的操作。
// 而 delegate 决定了 AppCore 是否能够进行初始化，因此设置 delegate 需要先执行。

const NativeMethodReady = "ready";

(function() {
    let _native = new _Native();
    
    // window.native
    Object.defineProperty(window, "native", {
        get: function () {
            return _native;
        }
    });
    
    // window.Native
    Object.defineProperty(window, "Native", {
        get: function () {
            return _Native;
        }
    });
    
    // native.version
    Object.defineProperties(_Native, {
        version: {
            get: function () {
                return "1.0.0";
            }
        },
        log: {
            get: function () {
                return _log;
            }
        },
        parseURLQueryValue: {
            get: function () {
                return _parseURLQueryValue;
            }
        },
        parseURLQuery: {
            get: function () {
                return _parseURLQuery;
            }
        }
    });
    
})();


function _Native() {
    
    let _cookie        = new _Cookie();
    let _configuration = null;
    let _extensions    = [];
    let _readies       = [];
    
    let native = this;
    
    // native 作为单例，其核心 core 与自身互为引用。
    let _core = new _CoreNative(function (configuration) {
        _configuration = configuration;
        // 加载拓展，callback 中 this 指向 native 对象。。
        while (_extensions.length > 0) {
            let callback = _extensions.shift();
            Object.defineProperties(native, callback.apply(native, [_configuration]));
        }
        // 执行 ready，callback 中 this 指向 window 对象。。
        while (_readies.length > 0) {
            (_readies.shift()).apply(window);
        }
    });
    
    /**
     * 绑定 ready 之后执行的操作。
     * @param callback
     * @return {_ready}
     * @private
     */
    function _ready(callback) {
        // 如果 App 已经初始化，则异步执行 callback。
        if (_core.isReady) {
            window.setTimeout(callback);
            return this;
        }
        _readies.push(callback);
        return this;
    }
    
    /**
     * 拓展 AppCore 的方法，拓展函数中，this 指向 native 。
     * @param callback
     * @return {_extend}
     * @private
     */
    function _extend(callback) {
        if (typeof callback !== 'function') {
            return this;
        }
        if (_core.isReady) {
            Object.defineProperties(this, callback.apply(this, [_configuration]));
        } else {
            _extensions.push(callback);
        }
        return this;
    }
    
    Object.defineProperties(this, {
        core: {
            get: function () {
                return _core;
            }
        },
        cookie: {
            get: function () {
                return _cookie;
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
    });
    
}

function _CoreNative(nativeWasReady) {
    
    let _uniqueID       = 10000000;      // 用于生成唯一的回调函数 ID 。
    let _keyedCallbacks = {};            // 按照 callbackID 保存的回调函数。
    let _dataType       = NativeTypeURL; // 交互的数据类型。
    let _delegate       = null;          // 事件代理，一般为原生注入到 JS 环境中的对象。
    let _scheme         = "native";      // 使用 URL 交互时使用
    
    // 保存或读取 callback 。
    function _callback(argument, needsRemove) {
        switch (typeof argument === 'function') {
            case "function":
                let uniqueID = "NT" + (_uniqueID++);
                _keyedCallbacks[uniqueID] = argument;
                return uniqueID;
            case "string":
                if (!_keyedCallbacks.hasOwnProperty(argument)) {
                    return undefined;
                }
                let callback = _keyedCallbacks[argument];
                if (needsRemove) {
                    delete _keyedCallbacks[argument]
                }
                return callback;
            default:
                NativeLog("Only callback function or callback is allowed", NativeLogStyleError);
                return undefined;
        }
    }
    
    // 调用 App 方法。
    function _perform(method) {
        switch (_dataType) {
            case NativeTypeURL:
                return _performByURL.apply(this, arguments);
            case NativeTypeJSON:
                return _performByJSON.apply(this, arguments);
            case NativeTypeObject:
                return _performByObject.apply(this, arguments);
            case NativeTypeFunction:
                return window.setTimeout(function () { _delegate.apply(window, arguments); });
            default:
                return NativeLog("调用原生 App 方法失败，无法确定原生App可接受的数据类型。", NativeLogStyleError);
        }
    }
    
    // 调用 App 方法前，将所有参数转换成 JSON 数据类型，number/string/boolean 类型除外。
    function _performByJSON(method) {
        let parameters = [];
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
        window.setTimeout(function () {
            _delegate[method].apply(window, parameters);
        });
    }
    
    function _performByObject(method) {
        let parameters = [];
        for (let i = 1; i < arguments.length; i += 1) {
            parameters.push(arguments[i]);
        }
        window.setTimeout(function () {
            _delegate[method].apply(window, parameters);
        });
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
        let url = _scheme + "://" + method + "?parameters=" + NativeParseURLQuery(parameters);
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('src', url);
        document.body.appendChild(iframe);
        window.setTimeout(function () {
            document.body.removeChild(iframe);
        }, 2000);
    }
    
    let _isReady = false;
    let _readyID = null;
    
    /**
     * 注册 App 对象，以及 App 对象可接收的数据类型。
     * @param delegate App 对象。
     * @param dataType App 对象可接收的数据类型。
     * @private
     */
    function _register(delegate, dataType) {
        _delegate = delegate;
        _dataType = dataType;
        // 如果已经初始化，则不再初始化，仅仅是改变代理。
        if (_isReady) {
            return this;
        }
        // 删除已经发起的 ready 事件。
        if (!!_readyID) {
            _callback(_readyID, false);
        }
        // 在 document.ready 之后执行，以避免 App 可能无法接收事件的问题。
        function _documentWasReady() {
            _readyID = _perform(NativeMethodReady, dataType, function (configuration) {
                _isReady = true;
                nativeWasReady(configuration);
            });
        }
        
        // documentReady 判断不支持 IE 。
        if (document.readyState === 'complete') {
            window.setTimeout(function () {
                _documentWasReady();
            });
        } else {
            document.addEventListener("DOMContentLoaded", function _eventListener() {
                document.removeEventListener("DOMContentLoaded", _eventListener);
                window.setTimeout(function () {
                    _documentWasReady();
                });
            }, false);
        }
        
        return this;
    }
    
    Object.defineProperties(this, {
        callback: {
            get: function () {
                return _callback;
            }
        },
        perform: {
            get: function () {
                return _perform;
            }
        },
        scheme: {
            get: function () {
                return _scheme;
            },
            set: function (newValue) {
                _scheme = newValue;
            }
        },
        isReady: {
            get: function () {
                return _isReady;
            }
        },
        register: {
            get: function () {
                return _register;
            }
        },
        delegate: {
            get: function () {
                return _delegate;
            },
            set: function (newValue) {
                _delegate = newValue;
            }
        },
        dataType: {
            get: function () {
                return _dataType;
            },
            set: function (newValue) {
                _dataType = newValue;
            }
        }
    });
}

/**
 * 类。AppCore 管理 Cookie 的模块。ACCookie 将 Cookie 缓存起来以提高读取性能。
 * 为了让不同页面的 Cookie 及时同步，缓存只在同一 RunLoop 中有效。
 * @constructor
 */
function _Cookie() {
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
        window.setTimeout(function () {
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
            document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + "; expires=" + date.toGMTString();
        } else {
            date.setTime(date.getTime() - 1);
            document.cookie = encodeURIComponent(key) + "; expires=" + date.toGMTString();
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
    
    Object.defineProperties(this, {
        value: {
            get: function () {
                return _value;
            }
        },
        synchronize: {
            get: function () {
                return _synchronize;
            }
        }
    });
}


/**
 * 函数，在控制台输出。
 * @param message 输出的内容。
 * @param style 输出样式，可选。0，默认；1，警告；2，错误。
 */
function _log(message, style) {
    if (typeof style !== "number" || style === NativeLogStyleDefault) {
        console.log("%c[Native] " + message, "color: #357bbb; font-weight: bold;");
    } else if (style === NativeLogStyleWarning) {
        console.log("%c[Native] %c" + message, "color: #357bbb; font-weight: bold;", "background-color: #ffffff; color: #f18f38");
    } else if (style === NativeLogStyleError) {
        console.log("%c[Native] %c" + message, "color: #357bbb; font-weight: bold;", "background-color: #ffffff; color: #e95648");
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


