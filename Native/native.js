// native.js
// Version: 3.0.0
// ES5 转换 https://babeljs.io/repl

const NativeMode = require("./NativeMode.js")
const NativeLogStyle = require("./NativeLogStyle.js")
const NativeMethod = require("./NativeMethod.js")
const NativeCookieKey = require("./NativeCookieKey.js")
const NativeCachedResourceType = require("./NativeCachedResourceType.js")
const Native = require("./NativeCore.js")


let _configuration = null;
let _extensions = [];
let _readies = [];

// native 作为单例，其核心 core 与自身互为引用。
let _core = new Native.Core(function(configuration) {
    _configuration = configuration;
    // 加载拓展，extension 中 this 指向 native 对象。。
    while (_extensions.length > 0) {
        let extension = _extensions.shift();
        Native.defineProperties(native, extension.apply(native, [_configuration]));
    }
    // 执行 ready，回调函数中 this 指向 window 对象。。
    while (_readies.length > 0) {
        (_readies.shift()).apply(window);
    }
});
exports.core = _core;

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
exports.ready = _ready;
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
        Native.defineProperties(this, callback.apply(this, [_configuration]));
    } else {
        _extensions.push(callback);
    }
    return this;
}
exports.extend = _extend;



// ======================================
// ======================================
// ======================================
// MARK: - login

native.extend(function() {

    function _login(callback) {
        if (!callback) {
            Native.log("Method `login` called without a callback is not allowed.", NativeLogStyle.error);
            return this;
        }
        let that = this;
        this.core.perform(NativeMethod.login, function(currentUser) {
            that.setCurrentUser(currentUser);
            callback();
        });
    }

    return {
        login: {
            get: function() {
                return _login;
            }
        }
    };
});



// ======================================
// ======================================
// ======================================
// MARK: - User

native.extend(function(configuration) {
    // 存储监听
    let _currentUserChangeHandlers = [];

    function _currentUserChange(callback) {
        if (typeof callback === "function") {
            _currentUserChangeHandlers.push(callback);
            return this;
        }
        for (let i = 0; i < _currentUserChangeHandlers.length; i++) {
            _currentUserChangeHandlers[i].call(window);
        }
        return this;
    }


    function _User(id, name, info, version) {
        Native.defineProperties(this, {
            "id": {
                get: function() {
                    return id;
                }
            },
            "name": {
                get: function() {
                    return name;
                }
            },
            "info": {
                get: function() {
                    return info;
                }
            },
            "version": {
                get: function() {
                    return version;
                }
            }
        })
    }

    // 定义用户
    let _currentUser = new _User(
        configuration.currentUser.id,
        configuration.currentUser.name,
        configuration.currentUser.info,
        configuration.currentUser.version
    );

    // 保存 User 信息。
    Native.cookie.value(NativeCookieKey.currentUser, JSON.stringify(_currentUser));

    // 设置当前用户，App 行为。
    function _setCurrentUser(userInfo) {
        _currentUser = new _User(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
        _currentUserChange();
    }

    (function(native) {
        // 在页面隐藏时绑定显示时事件。
        // 页面显示时，从 cookie 读取信息。
        function _pageShow() {
            let userInfo = JSON.parse(window.Native.cookie.value(NativeCookieKey.currentUser));
            if (userInfo.id !== native.currentUser.id || userInfo.version !== native.currentUser.version) {
                native.setCurrentUser(userInfo);
            }
        }

        // 页面第一次隐藏后，监听页面显示事件。
        function _pageHide() {
            window.addEventListener('pageshow', _pageShow);
            window.removeEventListener('pagehide', _pageHide);
        }

        // 绑定页面隐藏时的事件
        window.addEventListener('pagehide', _pageHide);
    })(this);


    return {
        setCurrentUser: {
            get: function() {
                return _setCurrentUser;
            }
        },
        currentUserChange: {
            get: function() {
                return _currentUserChange;
            }
        },
        currentUser: {
            get: function() {
                return _currentUser;
            }
        }
    };
});


// ======================================
// ======================================
// ======================================
// MARK: - navigation

native.extend(function(configuration) {

    let _nativeCore = this.core;

    function _NavigationBar(barInfo) {

        let _title = barInfo.title;
        let _titleColor = barInfo.titleColor;
        let _backgroundColor = barInfo.backgroundColor;
        let _isHidden = barInfo.isHidden;

        function _setTitle(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                Native.log("The navigation.bar.title must be a string value.", NativeLogStyle.error);
                return this;
            }
            _title = newValue;
            if (needsSyncToApp) {
                _nativeCore.perform(NativeMethod.navigation.bar.setTitle, newValue);
            }
            return this;
        }

        function _setTitleColor(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                Native.log("The navigation.bar.titleColor must be a string value.", NativeLogStyle.error);
                return this;
            }
            _titleColor = newValue;
            if (needsSyncToApp) {
                _nativeCore.perform(NativeMethod.navigation.bar.setTitleColor, newValue);
            }
            return this;
        }

        function _setHidden(newValue, animated, needsSyncToApp) {
            if (typeof newValue !== 'boolean') {
                Native.log("The navigation.bar.isHidden must be a boolean value.", NativeLogStyle.error);
                return this;
            }
            _isHidden = newValue;
            if (needsSyncToApp) {
                _nativeCore.perform(NativeMethod.navigation.bar.setHidden, newValue, animated);
            }
            return this;
        }

        function _hide(animated) {
            _setHidden(true, animated, true);
            return this;
        }

        function _show(animated) {
            _setHidden(false, animated, true);
            return this;
        }

        function _setBackgroundColor(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                Native.log("The navigation.bar.backgroundColor must be a string value.", NativeLogStyle.error);
                return this;
            }
            _backgroundColor = newValue;
            if (!needsSyncToApp) {
                return this;
            }
            _nativeCore.perform(NativeMethod.navigation.bar.setBackgroundColor, newValue);
            return this;
        }

        Native.defineProperties(this, {
            title: {
                get: function() {
                    return _title;
                },
                set: function(newValue) {
                    _setTitle(newValue, true);
                }
            },
            titleColor: {
                get: function() {
                    return _titleColor;
                },
                set: function(newValue) {
                    _setTitleColor(newValue, true);
                }
            },
            backgroundColor: {
                get: function() {
                    return _backgroundColor;
                },
                set: function(newValue) {
                    _setBackgroundColor(newValue, true);
                }
            },
            isHidden: {
                get: function() {
                    return _isHidden;
                },
                set: function(newValue) {
                    _setHidden(newValue, false, true);
                }
            },
            setTitle: {
                get: function() {
                    return _setTitle;
                }
            },
            setTitleColor: {
                get: function() {
                    return _setTitleColor;
                }
            },
            setBackgroundColor: {
                get: function() {
                    return _setBackgroundColor;
                }
            },
            setHidden: {
                get: function() {
                    return _setHidden;
                }
            },
            hide: {
                get: function() {
                    return _hide;
                }
            },
            show: {
                get: function() {
                    return _show;
                }
            }
        });
    }

    function _Navigation(info) {
        // 3.1 进入下级页面。
        let _push = function(url, animated) {
            if (typeof url !== 'string') {
                Native.log("Method `push` can not be called without a url parameter.", NativeLogStyle.error);
                return null;
            }
            // 判断 URL 是否是相对路径。
            if (!/^([a-z]+):\/\//i.test(url)) {
                if (/^(\/)/i.test(url)) { // 相对根目录的路径
                    url = window.location.protocol + "//" + window.location.host + url;
                } else { // 当前目录相对路径
                    let components = window.location.href.split("/");
                    components.pop();
                    url = components.join("/") + "/" + url;
                }
            }
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return _nativeCore.perform(NativeMethod.navigation.push, url, animated);
        };

        // 3.2 推出当前页面，使栈内页面数量 -1。
        let _pop = function(animated) {
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return _nativeCore.perform(NativeMethod.navigation.pop, animated);
        };

        // 3.3 移除栈内索引大于 index 的所有页面，即将 index 页面所显示的内容展示出来。
        let _popTo = function(index, animated) {
            if (typeof index !== 'number') {
                Native.log("Method `popTo` can not be called without a index parameter.", NativeLogStyle.error);
                return;
            }
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return _nativeCore.perform(NativeMethod.navigation.popTo, index, animated);
        };

        let _bar = new _NavigationBar(info.bar);

        Native.defineProperties(this, {
            push: {
                get: function() {
                    return _push;
                }
            },
            pop: {
                get: function() {
                    return _pop;
                }
            },
            popTo: {
                get: function() {
                    return _popTo;
                }
            },
            bar: {
                get: function() {
                    return _bar;
                }
            }
        });
    }

    let _navigation = new _Navigation(configuration.navigation);

    return {
        'navigation': {
            get: function() {
                return _navigation;
            }
        }
    };
});

// ======================================
// ======================================
// ======================================
// MARK: - Networking

const NativeNetworkStatus = Object.freeze({
    WiFi: "WiFi"
});

native.extend(function(configuration) {

    let _nativeCore = this.core;

    function _Networking(networkingInfo) {

        let _status = networkingInfo.status;
        let _statusChangeHandlers = [];

        // HTTP 请求
        function _http(request, callback) {
            if (!request || typeof request !== 'object') {
                Native.log("Method `http` first parameter must be an request object.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.networking.http, request, callback);
        }

        // 网络状态监听。
        function _statusChange(callback) {
            if (typeof callback === "function") {
                _statusChangeHandlers.push(callback);
                return this;
            }
            for (let i = 0; i < _statusChangeHandlers.length; i++) {
                _statusChangeHandlers[i].call(window);
            }
        }

        // 供 App 切换状态
        function _setStatus(newValue) {
            _status = newValue;
            _statusChange();
        }

        Native.defineProperties(this, {
            isViaWiFi: {
                get: function() {
                    return (_status === NativeNetworkStatus.WiFi);
                }
            },
            status: {
                get: function() {
                    return _status;
                }
            },
            isReachable: {
                get: function() {
                    return !!_status
                }
            },
            statusChange: {
                get: function() {
                    return _statusChange;
                }
            },
            http: {
                get: function() {
                    return _http;
                }
            },
            setStatus: {
                get: function() {
                    return _setStatus;
                }
            }
        });
    }

    let _networking = new _Networking(configuration.networking);

    return {
        "networking": {
            get: function() {
                return _networking;
            }
        },
        "http": {
            get: function() {
                return _networking.http;
            }
        }
    };
});

// ======================================
// ======================================
// ======================================
// MARK: - Open

native.extend(function() {

    function _open(page) {
        if (typeof page !== 'string') {
            Native.log("Method `open`'s page parameter must be a string value.", NativeLogStyle.error);
            return null;
        }
        return this.core.perform(NativeMethod.open, page);
    }

    return {
        open: {
            get: function() {
                return _open;
            }
        }
    };
});


// ======================================
// ======================================
// ======================================
// MARK: - Present

native.extend(function() {

    function _present(url, arg1, arg2) {
        if (typeof url !== 'string') {
            Native.log("Method `present` first parameter must be a string value.", NativeLogStyle.error);
            return null;
        }
        let animated = arg1;
        let completion = arg2;
        if (typeof arg1 === 'function') {
            animated = true;
            completion = arg1;
        }
        if (typeof animated !== 'boolean') {
            animated = true;
        }
        return this.core.perform(NativeMethod.present, url, animated, completion);
    }

    function _dismiss(arg1, arg2) {
        let animated = arg1;
        let completion = arg2;
        if (typeof arg1 === 'function') {
            animated = true;
            completion = arg1;
        }
        if (typeof animated !== 'boolean') {
            animated = true;
        }
        return this.core.perform(NativeMethod.dismiss, animated, completion);
    }

    return {
        present: {
            get: function() {
                return _present;
            }
        },
        dismiss: {
            get: function() {
                return _dismiss;
            }
        }
    }

});



// ======================================
// ======================================
// ======================================
// MARK: - Theme

native.extend(function(configuration) {

    let _currentTheme = configuration.currentTheme;

    let _currentThemeChangeHandlers = [];

    // 设置当前主题。
    function _setCurrentTheme(newValue, animated, needsSyncToApp) {
        _currentTheme = newValue;
        // 将主题保存到 cookie 中.
        window.Native.cookie.value(NativeCookieKey.currentTheme, newValue);
        // 同步到 App 说明更改主题是由 JS 触发的，则不发送事件；否则就发送事件。
        if (needsSyncToApp || typeof needsSyncToApp === "undefined") {
            this.core.perform(NativeMethod.setCurrentTheme, newValue, animated);
        } else {
            _currentThemeChange();
        }
    }

    function _currentThemeChange(callback, animated) {
        if (typeof callback === 'function') {
            _currentThemeChangeHandlers.push({
                "callback": callback,
                "animated": animated
            });
            return this;
        }
        for (let i = 0; i < _currentThemeChangeHandlers.length; i++) {
            let obj = _currentThemeChangeHandlers[i];
            obj.callback.call(window, obj.animated);
        }
        return this;
    }

    (function(native) {
        function _pageShow() {
            let currentTheme = window.Native.cookie.value(NativeCookieKey.currentTheme);
            if (!currentTheme || currentTheme === native.currentTheme) {
                return;
            }
            native.setCurrentTheme(currentTheme, false, false);
            native.currentThemeChange();
        }

        function _pageHide() {
            window.removeEventListener('pagehide', _pageHide);
            window.addEventListener('pageshow', _pageShow);
        }

        // 页面第一隐藏后，每次出现时，都从 Cookie 检查主题是否发生变更。
        window.addEventListener('pagehide', _pageHide);
    })(this);

    return {
        currentTheme: {
            get: function() {
                return _currentTheme;
            },
            set: function(newValue) {
                _setCurrentTheme(newValue, false, true);
            }
        },
        currentThemeChange: {
            get: function() {
                return _currentThemeChange;
            }
        },
        setCurrentTheme: {
            get: function() {
                return _setCurrentTheme;
            }
        }
    }
});


// ======================================
// ======================================
// ======================================
// MARK: - Event Service

native.extend(function() {

    // native 对象应该一直存在于内存中，拓展也应该一直存在于内存中（如果不是一直存在于内存中的拓展，可以考虑提供清理的方法。

    let _nativeCore = this.core;

    function _EventService() {

        /// 列表点击事件。
        function _documentElementDidSelect(documentName, elementName, index, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string' || typeof index !== 'undefined') {
                Native.log("Method `documentElementDidSelect` first/second/third parameter must be a string/string/number value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.eventService.documentElementDidSelect, documentName, elementName, index, callback);
        }

        /// 页面元素点击事件。
        function _documentElementWasClicked(documentName, elementName, data, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string') {
                Native.log("Method `elementWasClicked` first/second parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            if (typeof data === 'function') {
                callback = data;
                data = null;
            }
            return _nativeCore.perform(NativeMethod.eventService.documentElementWasClicked, documentName, elementName, data, callback);
        }

        /// 事件埋点。
        function _track(eventName, parameters) {
            if (typeof eventName !== 'string') {
                Native.log("Method `track` first parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.eventService.track, eventName, parameters);
        }

        Native.defineProperties(this, {
            documentElementDidSelect: {
                get: function() {
                    return _documentElementDidSelect;
                }
            },
            documentElementWasClicked: {
                get: function() {
                    return _documentElementWasClicked;
                }
            },
            track: {
                get: function() {
                    return _track;
                }
            }
        });
    }

    let _eventService = new _EventService();

    return {
        eventService: {
            get: function() {
                return _eventService;
            }
        }
    }

});

// ======================================
// ======================================
// ======================================
// MARK: - Data Service

native.extend(function() {

    let _nativeCore = this.core;

    function _DataService() {
        // 获取 list 的行数。
        // - list: string
        // - callback: (number)=>void
        function _numberOfRowsInList(documentName, listName, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string') {
                Native.log("Method `numberOfRowsInList` first/second parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.dataService.numberOfRowsInList, documentName, listName, callback);
        }

        // 加载数据
        // - list: XZAppList
        // - index: number
        // - callback: (data)=>void
        function _dataForRowAtIndex(documentName, listName, index, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string' || typeof index !== 'number') {
                Native.log("Method `dataForRowAtIndex` first/second/third parameter must be a string/string/number value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.dataService.dataForRowAtIndex, documentName, listName, index, callback);
        }

        // 获取缓存。
        function _cachedResourceForURL(url, cacheType, completion) {
            // 检查 URL
            if (typeof url !== 'string') {
                Native.log("Method `cachedResourceForURL` url parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            // 检查 cacheType
            switch (typeof cacheType) {
                case 'function':
                    completion = cacheType;
                    cacheType = NativeCachedResourceType.image;
                    break;
                case 'string':
                    break;
                default:
                    cacheType = NativeCachedResourceType.image;
                    break;
            }
            // 检查 handler
            if (typeof completion !== 'function') {
                Native.log("Method `cachedResourceForURL` must have a callback handler.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.dataService.cachedResourceForURL, url, cacheType, completion);
        }

        Native.defineProperties(this, {
            numberOfRowsInList: {
                get: function() {
                    return _numberOfRowsInList;
                }
            },
            dataForRowAtIndex: {
                get: function() {
                    return _dataForRowAtIndex;
                }
            },
            cachedResourceForURL: {
                get: function() {
                    return _cachedResourceForURL;
                }
            }
        });
    }

    let _dataService = new _DataService();

    return {
        dataService: {
            get: function() {
                return _dataService;
            }
        }
    };
});



// ======================================
// ======================================
// ======================================
// MARK: - Alert

native.extend(function() {

    function _alert(message, callback) {
        if (!message || typeof message !== 'object') {
            Native.log("Method `alert` first parameter must be an message object.", NativeLogStyle.error);
            return null;
        }
        return this.core.perform(NativeMethod.alert, message, callback);
    }

    return {
        'alert': {
            get: function() {
                return _alert;
            }
        }
    };

});

