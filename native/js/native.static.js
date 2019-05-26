// native.static.js

/**
 * native.js 模块。
 * @module Native
 */

const _version = "3.3.2";

/**
 * 控制台输出样式枚举。
 * @name LogStyle
 * @readonly
 * @enum {number}
 */
const _NativeLogStyle = {
    /**	在控制台输出普通样式文本，表示一条普通的输出信息。 */
    "default": 0,
    /**	输出警告样式文本，表示一条警告信息，可能需要开发者注意。  */
    "warning": 1,
    /** 输出错误样式文本，表示一条错误信息，开发者需要修复。 */
    "error": 2
};
Object.freeze(_NativeLogStyle);

/**	
 * 交互模式枚举。 
 * @name Mode
 * @readonly
 * @enum {string}
 */
const _NativeMode = {
    /**	使用 URL 方式交互。 */
    "url": "url",
    /** 使用安卓 JS 注入原生对象作为代理：函数参数支持基本数据类型，复杂数据使用 JSON 。 */
    "json": "json",
    /** 使用 iOS 注入原生对象作为代理：支持所有类型的数据。 */
    "object": "object",
    /** 调试或者 iOS WebKit 注入 js ，使用函数作为代理。 */
    "javascript": "javascript"
};
Object.freeze(_NativeMode);

/**
 * 控制台输出。
 * @name log
 * @param {string} message 输出消息。
 * @param {number} style 输出样式。
 */
function _NativeLog(message, style) {
    if (typeof style !== "number" || style === _NativeLogStyle.default) {
        return console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #333333", message);
    }
    if (style === _NativeLogStyle.warning) {
        return console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #f98300", message);
    }
    return console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #c2352d", message);
}

/**
 * 将任意对象转换 URLQuery 中可使用的字符串。
 * @param {any} aValue 待转换的值。
 * @name parseURLQueryComponent
 */
function _NativeParseURLQueryComponent(aValue) {
    switch (typeof aValue) {
        case 'undefined':
            return "";

        case 'number':
            return isNaN(aValue) ? "" : String(aValue);

        case 'string':
            return encodeURIComponent(aValue);

        case 'object':
            return !aValue ? "" : encodeURIComponent(JSON.stringify(aValue));

        default:
            return encodeURIComponent(JSON.stringify(aValue));
    }
}

/**
 * 将任意值转换成 URLQuery 字符串。
 * @name parseURLQuery
 * @param {any} anObject 待转换的值。
 */
function _NativeParseURLQuery(anObject) {
    switch (typeof anObject) {
        case 'string': // any string -> any%20string
            return encodeURIComponent(anObject);

        case 'object':
            if (!anObject) { return ""; }

            // [a,b,c] -> a&b&c
            if (Array.isArray(anObject)) {
                const queries = [];
                for (let i = 0; i < anObject.length; i++) {
                    queries.push(_NativeParseURLQueryComponent(anObject[i]));
                }
                return queries.join("&");
            }

            // { key1: value1, key2: value2 } -> key1=value1&key2=value2
            const queries = [];
            for (let key in anObject) {
                if (!anObject.hasOwnProperty(key)) {
                    continue;
                }
                queries.push(encodeURIComponent(key) + "=" + _NativeParseURLQueryComponent(anObject[key]))
            }
            return queries.join("&");

        case 'number':
            return isNaN(anObject) ? "" : String(number);

        case 'undefined':
            return '';

        default:
            return encodeURIComponent(JSON.stringify(anObject));
    }
}

/**
 * 使用回调遍历对象的所有属性，如果回调函数返回了 true 则停止遍历。
 * @name enumerate
 * @param {object} anObject 被遍历的对象。
 * @param {function} callback 是否继续遍历的回调函数。
 * @returns 返回 false 表示已遍历所有属性，true 表示遍历中断。
 */
function _NativeObjectEnumerator(anObject, callback) {
    for (let key in anObject) {
        if (!anObject.hasOwnProperty(key)) {
            continue;
        }
        const value = anObject[key];
        switch (typeof value) {
            case "string":
                if (callback(key, value)) {
                    return true;
                }
                break;
            case "object":
                if (!value) {
                    continue;
                }
                if (_NativeObjectEnumerator(value, callback)) {
                    return true
                }
                break;
            default:
                break;
        }
    }
    return false;
}

/**
 * 注册一个原生方法。如果方法已存在，则注册不成功，并在控制台输出相关信息。
 * @name Method
 * @param {string} methodName 原生方法名。
 * @param {string} methodValue 原生方法。
 */
function _NativeMethod(methodName, methodValue) {
    if (typeof methodName !== "string" || methodName.length === 0) {
        return _NativeLog("NativeMethod 注册失败，方法名称必须为长度大于 0 的字符串！", _NativeLogStyle.error);
    }
    if (_NativeMethod.hasOwnProperty(methodName)) {
        return _NativeLog("NativeMethod 注册失败，已存在名称为“" + methodName + "”的方法！", _NativeLogStyle.error);
    }
    if (_NativeObjectEnumerator(_NativeMethod, function (key, value) { return (value === methodValue); })) {
        return _NativeLog("NativeMethod 注册失败，已存在值为“" + methodValue + "”的方法！", _NativeLogStyle.error);
    }
    Object.defineProperty(_NativeMethod, methodName, {
        "get": function () {
            return methodValue;
        },
        "enumerable": true
    });
    return methodValue;
}

/**
 * 注册一个原生事件。如果事件已存在，则注册不成功，并在控制台输出相关信息。
 * @name Action
 * @param {string} actionName 原生事件名称。
 * @param {string} actionValue 原生事件。
 */
function _NativeAction(actionName, actionValue) {
    if (typeof actionName !== "string" || actionName.length === 0) {
        return _NativeLog("NativeAction 注册失败，事件名称必须为长度大于 0 的字符串！", _NativeLogStyle.error);
    }
    if (_NativeAction.hasOwnProperty(actionName)) {
        return _NativeLog("NativeAction 注册失败，已存在名称为“" + actionName + "”的事件！", _NativeLogStyle.error);
    }
    if (_NativeObjectEnumerator(_NativeAction, function (key, value) { return (value === actionValue); })) {
        return _NativeLog("NativeAction 注册失败，已存在值为“" + actionValue + "”的事件！", _NativeLogStyle.error);
    }
    Object.defineProperty(_NativeAction, actionName, {
        "get": function () {
            return actionValue;
        },
        "enumerable": true
    });
    return actionValue;
}

/**
 * 注册一个 Cookie 键。如果键已存在，则注册不成功，并在控制台输出相关信息。
 * @name CookieKey
 * @param {string} keyName Cookie 键名。
 * @param {string} keyValue Cookie 键。
 * @description native.js 也业务逻辑中可能会使用一些 Cookie 。
 */
function _NativeCookieKey(keyName, keyValue) {
    if (typeof keyName !== "string" || keyName.length === 0) {
        return _NativeLog("NativeCookieKey 注册失败，名称必须为长度大于 0 的字符串！", _NativeLogStyle.error);
    }
    if (typeof keyValue !== "string" || keyValue.length === 0) {
        return _NativeLog("NativeCookieKey 注册失败，值必须为大于 0 的字符串！", _NativeLogStyle.error);
    }
    if (_NativeCookieKey.hasOwnProperty(keyName)) {
        return _NativeLog("NativeCookieKey 注册失败，已存在名称为“`" + keyName + "`”的 Cookie 键！", _NativeLogStyle.error);
    }
    if (_NativeObjectEnumerator(_NativeCookieKey, function (key, value) { return (value === keyValue); })) {
        return _NativeLog("NativeCookieKey 注册失败，已存在值为“" + keyValue + "”的 Cookie 键！", _NativeLogStyle.error);
    }
    Object.defineProperty(_NativeCookieKey, keyName, {
        "get": function () {
            return keyValue;
        },
        "enumerable": true
    });
    return keyValue;
}

/**
 * Cookie 管理模块，优化了 Cookie 存取。
 * @name cookie
 * @property {function} value
 * @property {function} synchronize
 */
function _NativeCookie() {

    /**
    * 保存了已解析过的 Cookie 值。
    * @private
    */
    let _keyedCookies = null;

    (function () {
        // 当页面显示时，重置 Cookie 。
        window.addEventListener('pageshow', function () {
            _keyedCookies = null;
        });
    })()

    /**
    * 读取或设置 Cookie 值。
    * 调用此方法时，如果只有一个参数，或者第二个参数不是 string 类型，表示读取 Cookie 中对应的键值；
    * 第二个参数，null 表示删除 Cookie 值，string 表示设置新的值；
    * 第三个参数，Cookie 保存时长，默认 30 天，单位秒。
    * @name value
    * @param  {!string} key 保存Cookie所使用的键名。
    * @param  {?string} newValue 可选，待设置的值，如果没有此参数则表示读取。 
    * @param  {?number} cookieExpires 可选，Cookie 保存时长。
    * @return {?string} 已保存的Cookie值，如果未找到返回 null ，设置值时返回设置后的值。
    */
    function _value(key, newValue, cookieExpires) {
        if (typeof key !== "string") {
            return null;
        }
        // 读取 Cookie
        if (arguments.length === 1) {
            _readIfNeeded();
            if (_keyedCookies.hasOwnProperty(key)) {
                return _keyedCookies[key];
            }
            return null;
        }
        // 删除 Cookie 
        if (!newValue && typeof newValue === "object") {
            const expireDate = new Date();
            expireDate.setTime(expireDate.getTime() - 1);
            document.cookie = _NativeParseURLQueryComponent(key) + "; expires=" + expireDate.toUTCString();
            if (!!_keyedCookies && _keyedCookies.hasOwnProperty(key)) {
                delete _keyedCookies[key];
            }
            return null;
        }
        // 设置 Cookie
        const expireDate = new Date();
        if (typeof cookieExpires === "number") {
            expireDate.setTime(expireDate.getTime() + cookieExpires * 1000);
        } else {
            expireDate.setTime(expireDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
        document.cookie = _NativeParseURLQueryComponent(key) + "=" + _NativeParseURLQueryComponent(newValue) + "; expires=" + expireDate.toUTCString();
        if (!!_keyedCookies) {
            _keyedCookies[key] = newValue;
        }
        return newValue;
    }

    /**
    * 同步 Cookie ，刷新 Cookie 缓存，重新从系统 Cookie 中读取。
    * @name synchronize
    */
    function _synchronize() {
        _keyedCookies = null;
        return this;
    }

    /**
    * 解析 Cookie ，解析后的 Cookie 保存在 keyedCookies 中，并且只存在一个 runloop 周期；
    * 如果已解析则不操作。
    * @private
    */
    function _readIfNeeded() {
        if (!!_keyedCookies) {
            return;
        }
        _keyedCookies = {};
        const cookieStore = document.cookie;
        if (!cookieStore) {
            return;
        }
        const keyValues = cookieStore.split("; ");
        while (keyValues.length > 0) {
            const string = keyValues.pop();
            if (string.length === 0) {
                continue;
            }
            const keyValue = string.split("=");
            const key = decodeURIComponent(keyValue[0]);
            if (keyValue.length > 1) {
                _keyedCookies[key] = decodeURIComponent(keyValue[1]);
            } else {
                _keyedCookies[name] = "";
            }
        }
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

const _cookie = new _NativeCookie();

const Native = new (function() {
    Object.defineProperties(this, {
        version: {
            get: function() {
                return _version;
            }
        },
        LogStyle: {
            get: function() {
                return _NativeLogStyle;
            }
        },
        Mode:  {
            get: function() {
                return _NativeMode;
            }
        },
        CookieKey:  {
            get: function() {
                return _NativeCookieKey;
            }
        },
        Method:  {
            get: function() {
                return _NativeMethod;
            }
        },
        Action:  {
            get: function() {
                return _NativeAction;
            }
        },
        log:  {
            get: function() {
                return _NativeLog;
            }
        },
        parseURLQuery:  {
            get: function() {
                return _NativeParseURLQuery;
            }
        },
        parseURLQueryComponent:  {
            get: function() {
                return _NativeParseURLQueryComponent;
            }
        },
        cookie:  {
            get: function() {
                return _cookie;
            }
        },
        enumerate:  {
            get: function() {
                return _NativeObjectEnumerator;
            }
        }
    });

    if (typeof window !== 'undefined') {
        window.Native = this;
    } else if (typeof global !== 'undefined') {
        global.Native = this;
    } else {
        _NativeLog("不能输出全局引用 Native !", _NativeLogStyle.warning);
    }
})();


export default Native;