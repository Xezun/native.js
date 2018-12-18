// native.static.js
// Native 为 native 根原型，定义了没有依赖的公共函数。

module.exports = Native;

const NativeVersion = "2.0.1";
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
            return NativeVersion;
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
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #f7c644", message);
    } else if (style === NativeLogStyle.error) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #c2352d", message);
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

function Native() {

}