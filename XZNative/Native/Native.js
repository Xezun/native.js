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
    
    Object.defineProperty(window, "native", {
        get: function () {
            return _native;
        }
    });
    
})();


function _Native() {
    
    let _core    = new _NativeCore(this);
    let _cookie  = new _Cookie();
    
    let _isReady = false;
    let _readyID = null;
    
    let _extensions = [];
    let _readies = [];
    
    let _configuration = null;
    
    /**
     * 注册 App 对象，以及 App 对象可接收的数据类型。
     * @param delegate App 对象。
     * @param dataType App 对象可接收的数据类型。
     * @private
     */
    function _register(delegate, dataType) {
        _core.delegate = delegate;
        _core.dataType = dataType;
        // 如果已经初始化，则不再初始化，仅仅是改变代理。
        if (_isReady) {
            return this;
        }
        // 删除已经发起的 ready 事件。
        if (!!_readyID) {
            _core.remove(_readyID);
        }
        // 当前对象。
        let native = this;
        // 在 document.ready 之后执行，以避免 App 可能无法接收事件的问题。
        $(document).ready(function () {
            _readyID = _core.perform(NativeMethodReady, dataType, function (configuration) {
                _isReady = true;
                _configuration = configuration;
                // 加载拓展。
                while (_extensions.length > 0) {
                    let callback = _extensions.shift();
                    Object.defineProperties(native, callback.apply(native, [_configuration]));
                }
                // 执行 ready 。
                while (_readies.length > 0) {
                    (_readies.shift()).apply(window);
                }
            });
        });
        return this;
    }
    
    /**
     * 绑定 ready 之后执行的操作。
     * @param callback
     * @return {_ready}
     * @private
     */
    function _ready(callback) {
        // 如果 App 已经初始化，则异步执行 callback。
        if (_isReady) {
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
        if (_isReady) {
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
        perform: {
            get: function () {
                return _core.perform;
            }
        },
        dispatch: {
            get: function () {
                return _core.dispatch;
            }
        },
        remove: {
            get: function () {
                return _core.remove;
            }
        },
        cookie: {
            get: function () {
                return _cookie;
            }
        },
        register: {
            get: function () {
                return _register;
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

function _NativeCore() {
    
    let _callbackID = 10000000;      // 用于生成唯一的回调函数 ID 。
    let _callbacks  = {};            // 按照 callbackID 保存的回调函数。
    let _dataType   = NativeTypeURL; // 交互的数据类型。
    let _delegate   = null;          // 事件代理，一般为原生注入到 JS 环境中的对象。
    let _scheme     = "native";      // 使用 URL 交互时使用
    
    /**
     * 保存 callback ，并返回其唯一 ID ，如果 callback 不合法，返回 null 。
     * @param callback
     * @return {*}
     * @private
     */
    function _uniqueID(callback) {
        if (!callback || (typeof callback !== 'function')) {
            return null;
        }
        let uniqueID = "NT" + (_callbackID++);
        _callbacks[uniqueID] = callback;
        return uniqueID;
    }

    function _dispatch(callbackID) {
        if (!callbackID || typeof callbackID !== "string") {
            return;
        }
        if (!_callbacks.hasOwnProperty(callbackID)) {
            return;
        }
        let callback = _callbacks[callbackID];
        delete _callbacks[callbackID];
        if (!callback) {
            return;
        }
        if (typeof callback !== 'function') {
            return;
        }
        let parameters = [];
        for (let i = 1; i < arguments.length; i++) {
            parameters.push(arguments[i]);
        }
        return callback.apply(window, parameters);
    }
    
    /**
     * 删除一个已保存的回调函数。
     * @param callbackID 回调函数的ID。
     * @private
     */
    function _remove(callbackID) {
        if (!callbackID || !_callbacks.hasOwnProperty(callbackID)) {
            return;
        }
        delete _callbacks[callbackID];
        return this;
    }
    
    /**
     * 调用 App 方法。
     * @param method App 方法。
     * @param parameters 方法参数。
     * @param callback 回调函数
     * @private
     */
    function _perform(method, parameters, callback) {
        switch (_dataType) {
            case NativeTypeURL:
                return _performByURL(method, parameters, callback);
            case NativeTypeJSON:
                return _performByJSON(method, parameters, callback);
            case NativeTypeObject:
                return _performByObject(method, parameters, callback);
            case NativeTypeFunction:
                return _performByFunction(method, parameters, callback);
            default:
                return NTLog("调用原生 App 方法失败，无法确定原生App可接受的数据类型。", NativeLogStyleError);
        }
    }
    
    // 代理是函数。
    function _performByFunction(method, parameters, callback) {
        let callbackID = _uniqueID(callback);
        window.setTimeout(function () {
            _delegate(method, parameters, callbackID);
        });
        return callbackID;
    }
    
    // 安卓对象可以接收基本数据类型。
    function _performByJSON(method, parameters, callback) {
        let _arguments = [];
        if (Array.isArray(parameters) && parameters.length > 0) {
            for (let i = 0; i < parameters.length; i += 1) {
                let value = parameters[i];
                switch (typeof value) {
                    case 'number':
                    case 'string':
                    case 'boolean':
                        _arguments.push(value);
                        break;
                    default:
                        _arguments.push(JSON.stringify(value));
                        break;
                }
            }
        }
        let callbackID = _uniqueID(callback);
        if (callbackID) {
            _arguments.push(callbackID);
        }
        window.setTimeout(function () {
            _delegate[method].apply(window, _arguments);
        });
        return callbackID;
    }
    
    // 能接收任意数据类型的对象。
    function _performByObject(method, parameters, callback) {
        let _arguments = [];
        if (Array.isArray(parameters)) {
            for (let i = 0; i < parameters.length; i++) {
                _arguments.push(parameters[i]);
            }
        }
        let callbackID = _uniqueID(callback);
        if (callbackID) {
            _arguments.push(function () {
                let parameters = [callbackID];
                for (let i = 0; i < arguments.length; i++) {
                    parameters.push(arguments[i]);
                }
                _dispatch.apply(window, parameters);
            });
        }
        window.setTimeout(function () {
            _delegate[method].apply(window, _arguments);
        });
        return callbackID;
    }
    
    // 没有代理，使用 URL 。
    function _performByURL(method, parameters, callback) {
        let url = _scheme + "://" + method;
        
        if (!Array.isArray(parameters)) {
            parameters = [];
        }
        
        let callbackID = _uniqueID(callback);
        
        if (callbackID) {
            parameters.push(callbackID);
        }
        
        let queryString = NativeParseURLQuery(parameters);
        if (queryString) {
            url += ("?arguments=" + queryString);
        }
        
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('src', url);
        document.body.appendChild(iframe);
        window.setTimeout(function () {
            document.body.removeChild(iframe);
        }, 2000);
        
        return callbackID;
    }
    
    Object.defineProperties(this, {
        dispatch: {
            get: function () {
                return _dispatch;
            }
        },
        remove: {
            get: function () {
                return _remove;
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
function NTLog(message, style) {
    if (typeof style !== "number" || style === NativeLogStyleDefault) {
        console.log("%c[Native]", "color: #357bbb; font-weight: bold;", message);
    } else if (style === NativeLogStyleWarning) {
        console.log("%c[Native] %c⚠️ " + message, "color: #357bbb; font-weight: bold;", "background-color: #ffffff; color: #f18f38");
    } else if (style === NativeLogStyleError) {
        console.log("%c[Native] %c🚫 " + message, "color: #357bbb; font-weight: bold;", "background-color: #ffffff; color: #e95648");
    }
}

/**
 * 将任意对象转换为 URL 查询字符串。
 * @param anObject 对象。
 * @return {*}
 * @private
 */
function NativeParseURLQuery(anObject) {
    if (!anObject) {
        return "";
    }
    // 1. 数组直接 JSON
    if (Array.isArray(anObject)) {
        return encodeURIComponent(JSON.stringify(anObject));
    }
    switch (typeof anObject) {
        case 'string':
            return encodeURIComponent(anObject);
        case 'object':
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
                if (typeof anObject[key] !== 'string') {
                    queryString += ("=" + encodeURIComponent(JSON.stringify(anObject[key])));
                } else {
                    queryString += ("=" + encodeURIComponent(anObject[key]));
                }
            }
            return queryString;
        case 'undefined':
            return '';
        default:
            return encodeURIComponent(JSON.stringify(anObject));
    }
}