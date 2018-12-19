// native.static.js
// Doc 生成 ./node_modules/.bin/jsdoc ./native/native.static.js 。

/** 
 * Native 被定义为模块，但也是的 native 模块的（父类）原型，用来封装公用的方法和属性。
 * 开发者不应该使用 Native 类实例化新的对象。
 * @module Native 
 * */
module.exports = Native;

/**
 * 标识框架的版本号，例如 2.0.1 。
 * 
 * @constant
 * @name version
 */
const NativeVersion = "2.0.2";

/**
 * 控制台输出样式枚举。
 *
 * @constant
 * @name LogStyle
 * @property {number} default 在控制台输出普通样式文本，表示一条普通的输出信息。
 * @property {number} warning 输出警告样式文本，表示一条警告信息，可能需要开发者注意。 
 * @property {number} error   输出错误样式文本，表示一条错误信息，开发者需要修复。
 */
const NativeLogStyle = Object.freeze({
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
const NativeMode = Object.freeze({
    "url": "url",
    "json": "json",
    "object": "object",
    "javascript": "javascript"
});

/**
 * 全局统一的 Cookie 管理器，也是 cookie 模块的入口。
 *
 * @typedef {import("./native.cookie.js")} NativeCookie
 * @constant
 * @type {NativeCookie}
 */
const cookie = require("./native.cookie.js");

/// 定义 Native 静态函数。
NativeDefineProperties(Native, {
    "version": {
        get: function () {
            return NativeVersion;
        }
    },
    "LogStyle": {
        get: function () {
            return NativeLogStyle;
        }
    },
    "log": {
        get: function () {
            return NativeLog;
        }
    },
    "defineProperty": {
        get: function () {
            return NativeDefineProperty;
        }
    },
    "defineProperties": {
        get: function () {
            return NativeDefineProperties;
        }
    },
    "parseURLQueryValue": {
        get: function () {
            return NativeParseURLQueryValue;
        }
    },
    "parseURLQuery": {
        get: function () {
            return NativeParseURLQuery;
        }
    },
    "cookie": {
        get: function () {
            return cookie;
        }
    },
    "Mode": {
        get: function () {
            return NativeMode;
        }
    },
    "Method": {
        get: function () {
            return NativeMethod;
        }
    },
    "CookieKey": {
        get: function () {
            return NativeCookieKey;
        }
    }

});


// 定义全局名称。

NativeDefineProperty(window, "Native", {
    get: function () {
        return Native;
    }
});
NativeDefineProperty(window, "NativeMode", {
    get: function () {
        return NativeMode;
    }
});
NativeDefineProperty(window, "NativeType", {
    get: function () {
        NativeLog("NativeType was deprecated, please use NativeMode instead.", NativeLogStyle.warning);
        return NativeMode;
    }
});
NativeDefineProperty(window, "NativeLogStyle", {
    get: function () {
        return NativeLogStyle;
    }
});
NativeDefineProperty(window, "NativeLog", {
    get: function () {
        return NativeLog;
    }
});
NativeDefineProperty(window, "NativeDefineProperty", {
    get: function () {
        return NativeDefineProperty;
    }
});
NativeDefineProperty(window, "NativeDefineProperties", {
    get: function () {
        return NativeDefineProperties;
    }
});
NativeDefineProperty(window, "NativeParseURLQueryValue", {
    get: function () {
        return NativeParseURLQueryValue;
    }
});
NativeDefineProperty(window, "NativeParseURLQuery", {
    get: function () {
        return NativeParseURLQuery;
    }
});
NativeDefineProperty(window, "NativeMethod", {
    get: function () {
        return NativeMethod;
    }
});
NativeDefineProperty(window, "NativeCookieKey", {
    get: function () {
        return NativeCookieKey;
    }
});

// 函数、类定义

/**
 * 按照预定样式在控制台控制台输出信息。
 * @param {string} message 信息文本。
 * @param {number} style 可选。文本输出样式，参见 NativeLogStyle 枚举。
 *
 * @constant
 * @name log
 * @function
 */
function NativeLog(message, style) {
    if (typeof style !== "number" || style === NativeLogStyle.default) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #333333", message);
    } else if (style === NativeLogStyle.warning) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #f7c644", message);
    } else if (style === NativeLogStyle.error) {
        console.log("%c[Native]%c %s", "color: #0b78d7; font-weight: bold;", "color: #c2352d", message);
    }
}

/**
 * 给对象定义属性，如果属性已定义则不执行。
 * @param {object} anObject 待定义属性的对象。
 * @param {string} name 待定义的属性名。
 * @param {object} descriptor 属性描述对象，与 Object.defineProperty 方法参数相同。
 *
 * @constant
 * @name defineProperty
 * @function
 */
function NativeDefineProperty(anObject, name, descriptor) {
    if (typeof anObject === "undefined") {
        return NativeLog("Define property error: Can not define properties for an undefined value.", 2);
    }
    if (typeof name !== "string" || name.length === 0) {
        return NativeLog("Define property error: The name for " + anObject.constructor.name + "'s property must be a nonempty string.", 2);
    }
    if (anObject.hasOwnProperty(name)) {
        return NativeLog("Define property warning: The property " + name + " to be defined for " + anObject.constructor.name + " is already exist.", 1);
    }
    Object.defineProperty(anObject, name, descriptor);
    return anObject;
}
/**
 * 给对象定义多个属性，忽略已存在的属性。
 * @param {object} anObject 待定义属性的对象。
 * @param {object} descriptors 属性描述对象，与 Object.defineProperties 方法参数相同。
 *
 * @constant
 * @name defineProperties
 * @function
 */
function NativeDefineProperties(anObject, descriptors) {
    if (typeof anObject === "undefined") {
        return NativeLog("Define properties error: Can not define properties for an undefined value.", 2);
    }
    if (typeof descriptors !== "object") {
        return NativeLog("Define properties error: The property descriptors for " + anObject.constructor.name + " at second parameter must be an Object.", 2);
    }
    for (let propertyName in descriptors) {
        if (!descriptors.hasOwnProperty(propertyName)) {
            continue;
        }
        NativeDefineProperty(anObject, propertyName, descriptors[propertyName]);
    }
    return anObject;
}

/**
 * 将任意值转换为 URL 的查询字段值，转换后的值已编码，可以直接拼接到 URL 字符串中。
 * @param {any} aValue 待转换的值。
 *
 * @constant
 * @name parseURLQueryValue
 * @function
 */
function NativeParseURLQueryValue(aValue) {
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

/**
 * 将任意对象转换为 URL 查询字符串。
 * @param {any} anObject 待转换的值。
 *
 * @constant
 * @name parseURLQuery
 * @function
 */
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


/**
 * 遍历对象的所有属性值。
 * @param {*} anObject 待遍历的对象。
 * @param {*} callback 值处理函数，如果返回 true 则遍历终止。
 * @returns 如果遍历提前终止，则返回 true。
 * @private
 */
function NativeObjectEnumerator(anObject, callback) {
    for (const key in anObject) {
        if (anObject.hasOwnProperty(key)) {
            const element = object[key];
            switch (typeof element) {
                case "string":
                    if (callback(element)) { return true; }
                    break;
                case "object":
                    if (NativeObjectEnumerator(element, callback)) { return true };
                    break;
                default:
                    break;
            }
        }
    }
    return false;
}

/**
 * 注册一个 Native.Method 枚举。
 * @param {string} methodName 方法名。
 * @param {string/object} methodValue 方法值，可以是对象，表示一个方法集合。
 *
 * @constant
 * @name Native.Method
 * @function
 */
function NativeMethod(methodName, methodValue) {
    if (typeof methodName !== "string" || methodName.length === 0) {
        return NativeLog("The name of NativeMethod must be a nonempty string.", NativeLogStyle.error);
    }
    if ( NativeObjectEnumerator(NativeMethod, function (method) { return (method === methodValue); }) ) {
        return NativeLog("NativeMethod." + methodName + " has been registered already.", NativeLogStyle.error);
    }
    NativeDefineProperty(NativeMethod, methodName, {
        get: function () {
            return methodValue;
        }
    });
    return methodValue;
}

/**
 * 注册一个 Native.CookieKey 枚举。
 * @param {string} cookieKey 枚举名，方便引用。
 * @param {string} cookieValue 枚举值，存储 Cookie 所使用的 Key 。
 *
 * @constant
 * @name Native.CookieKey
 * @function
 */
function NativeCookieKey(cookieKey, cookieValue) {
    if (typeof cookieKey !== "string" || cookieKey.length === 0) {
        return NativeLog("The name of NativeCookieKey must be a nonempty string.", NativeLogStyle.error);
    }
    if (typeof cookieValue !== "string" || cookieValue.length === 0) {
        return NativeLog("The value of NativeCookieKey must be a nonempty string.", NativeLogStyle.error);
    }
    if ( NativeCookieKey.hasOwnProperty(cookieKey) ) {
        return NativeLog("NativeCookieKey." + cookieKey + " has been registered already.", NativeLogStyle.error);
    }
    NativeDefineProperty(NativeCookieKey, cookieKey, {
        get: function () {
            return cookieValue;
        }
    });
    return cookieValue;
}

/**
 * Native 是 native 对象的父类型，封装了一系列共享的静态属性和方法，但是不包含任何实例属性和方法；
 * native 对象的类型是私有的，以避免外部引用。
 * @private
 */
function Native() {

}