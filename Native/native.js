// native.js
// Version: 3.0.0
// ES5 转换 https://babeljs.io/repl

const NativeMode = require("./NativeMode.js")
const NativeLogStyle = require("./NativeLogStyle.js")
const NativeMethod = require("./NativeMethod.js")
const NativeCookieKey = require("./NativeCookieKey.js")
const NativeCachedResourceType = require("./NativeCachedResourceType.js")
const NativeNetworkStatus = require("./NativeNetworkStatus.js")
const NativeCore = require("./NativeCore.js")

let _configuration = null;
let _extensions = [];
let _readies = [];

// native 作为单例，其核心 core 与自身互为引用。
let _core = new NativeCore(function(configuration) {
    _configuration = configuration;
    // 加载拓展，extension 中 this 指向 native 对象。。
    while (_extensions.length > 0) {
        let extension = _extensions.shift();
        NativeCore.defineProperties(native, extension.apply(native, [_configuration]));
    }
    // 执行 ready，回调函数中 this 指向 window 对象。。
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
        NativeCore.defineProperties(this, callback.apply(this, [_configuration]));
    } else {
        _extensions.push(callback);
    }
    return this;
}

const _native = {
    "core": _core,
    "ready": _ready,
    "extend": _extend
};

NativeCore.defineProperty(window, "native", {
    get: function() {
        return _native;
    }
});

module.exports = _native;

