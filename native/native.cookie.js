// native.cookie.js
// 

/** 
 * 当前框架的 Cookie 管理器模块。相比于直接读取 Cookie ，本模块提供了更便捷的
 * 方法来获取或设置 Cookie ，且在性能上做了优化。
 * 管理器在首次读取 Cookie 时，会将 Cookie 缓存起来，以提高访问效率；
 * 并且在页面每次显示时，重新刷新缓存。
 * @typedef { import("./native.cookie.js") } CookieModule
 * @type {CookieModule} */
const cookie = new Object(null);

Object.defineProperties(cookie, {
    "value": {
        get: function () {
            return value;
        }
    },
    "synchronize": {
        get: function () {
            return synchronize;
        }
    }
});

module.exports = Object.freeze(cookie);

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
    if ( typeof cookieKey !== "string" ) {
        return undefined;
    }
    if ( typeof newCookieValue === "string" ) {
        // 设置 Cookie
        let expireDate = new Date();
        if ( typeof cookieExpires === "number" ) {
            expireDate.setTime(expireDate.getTime() + cookieExpires * 1000);
        } else {
            expireDate.setTime(expireDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
        let key = NativeParseURLQueryValue(cookieKey);
        let value = NativeParseURLQueryValue(newCookieValue);
        document.cookie = key + "=" + value + "; expires=" + expireDate.toUTCString();
        if (!!keyedCookies) {
            keyedCookies[cookieKey] = newCookieValue;
        }
        return newCookieValue;
    } else if ( newCookieValue === null ) { 
        // 删除 Cookie 
        let expireDate = new Date();
        date.setTime(date.getTime() - 1);
        document.cookie = NativeParseURLQueryValue(cookieKey) + "; expires=" + date.toUTCString();
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
    window.setTimeout(function () {
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

