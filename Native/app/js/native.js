// native.js

/// 与原生交互的方式。
const NativeType = Object.freeze({
    // 使用 URL 方式交互。
    url: "url",
    // 使用安卓 JS 注入原生对象作为代理：函数参数支持基本数据类型，复杂数据使用 JSON 。
    json: "json",
    // 使用 iOS 注入原生对象作为代理：支持所有类型的数据。
    object: "object",
    // 调试或者 iOS WebKit 注入 js ，使用函数作为代理。
    javascript: "javascript"
});

/// 输出样式。
const NativeLogStyle = Object.freeze({
    default: 0,
    warning: 1,
    error: 2
});

/// 通用的原生支持的方法。
const NativeMethod = Object.freeze({
    ready: "ready",
    alert: "alert",
    // dataService
    cachedResourceForURL: "cachedResourceForURL",
    numberOfRowsInList: "numberOfRowsInList",
    dataForRowAtIndex: "dataForRowAtIndex",
    // eventService
    wasClickedOnElement: "wasClickedOnElement",
    didSelectRowAtIndex: "didSelectRowAtIndex",
    track: "track",
    // login
    login: "login",
    // navigation
    push: "push",
    pop: "pop",
    popTo: "popTo",
    setNavigationBarHidden: "setNavigationBarHidden",
    setNavigationBarTitle: "setNavigationBarTitle",
    setNavigationBarTitleColor: "setNavigationBarTitleColor",
    setNavigationBarBackgroundColor: "setNavigationBarBackgroundColor",
    // Networking
    http: "http",
    // Open
    open: "open",
    present: "present",
    dismiss: "dismiss",
    // theme
    setCurrentTheme: "setCurrentTheme"
});

const NativeCookieKey = Object.freeze({
    currentTheme: "com.mlibai.native.cookie.currentTheme",
    currentUser: "com.mlibai.native.cookie.currentUser"
});

// ready 方法用于需要在 AppCore 初始化后执行的操作。
// 而 delegate 决定了 AppCore 是否能够进行初始化，因此设置 delegate 需要先执行。

const native = (function () {
    let _native = new _Native();
    // window.native
    // Object.defineProperty(window, "native", {
    //     get: function () {
    //         return _native;
    //     }
    // });
    return _native;
})();

const Native = (function() {

    let _cookie = new _Cookie();

    // window.Native
    // Object.defineProperty(window, "Native", {
    //     get: function () {
    //         return _Native;
    //     }
    // });

    function _log(message, style) {
        if (typeof style !== "number" || style === NativeLogStyle.default) {
            console.log("[Native] " + message);
        } else if (style === NativeLogStyle.warning) {
            console.warn("[Native] " + message);
        } else if (style === NativeLogStyle.error) {
            console.error("[Native] " + message);
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
        cookie: {
            get: function () {
                return _cookie;
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

    return _Native;
})();


// ======================================
// ======================================
// ======================================
// MARK: - Native

function _Native() {
    
    let _configuration = null;
    let _extensions    = [];
    let _readies       = [];
    
    let native = this;
    
    // native 作为单例，其核心 core 与自身互为引用。
    let _core = new _CoreNative(function (configuration) {
        _configuration = configuration;
        // 加载拓展，extension 中 this 指向 native 对象。。
        while (_extensions.length > 0) {
            let extension = _extensions.shift();
            Object.defineProperties(native, extension.apply(native, [_configuration]));
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
            Object.defineProperties(this, callback.apply(this, [_configuration]));
        } else {
            _extensions.push(callback);
        }
        return this;
    }
    
    // 除以下方法外，其他方法原则上都应该留做原生方法的入口。
    Object.defineProperties(this, {
        core: {
            get: function () {
                return _core;
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


// ======================================
// ======================================
// ======================================
// MARK: - CoreNative

function _CoreNative(nativeWasReady) {
    
    let _uniqueID       = 10000000;      // 用于生成唯一的回调函数 ID 。
    let _keyedCallbacks = {};            // 按照 callbackID 保存的回调函数。
    let _dataType       = NativeType.url; // 交互的数据类型。
    let _delegate       = null;          // 事件代理，一般为原生注入到 JS 环境中的对象。
    let _scheme         = "native";      // 使用 URL 交互时使用
    
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
        switch (_dataType) {
            case NativeType.url:
                return _performByURL.apply(this, arguments);
            case NativeType.json:
                return _performByJSON.apply(this, arguments);
            case NativeType.object:
                return _performByObject.apply(this, arguments);
            case NativeType.javascript:
                let parameters = [];
                for (let i = 1; i < arguments.length; i++) {
                    parameters.push(arguments[i]);
                }
                window.setTimeout(function () {
                    _delegate.apply(window, [method, parameters]);
                });
                return;
            default:
                return Native.log("调用原生 App 方法失败，无法确定原生App可接受的数据类型。", NativeLogStyle.error);
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
        let url = _scheme + "://" + method + "?parameters=" + Native.parseURLQueryValue(parameters);
        let nativeFrame = document.createElement('iframe');
        nativeFrame.style.display = 'none';
        nativeFrame.setAttribute('src', url);
        document.body.appendChild(nativeFrame);
        window.setTimeout(function () {
            document.body.removeChild(nativeFrame);
        }, 2000);

        if (typeof _delegate === "function") {
            _delegate(url);
        }
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
            _callback(_readyID, true);
        }
        // 在 document.ready 之后执行，以避免 App 可能无法接收事件的问题。
        function _documentWasReady() {
            _readyID = _perform(NativeMethod.ready, function (configuration) {
                _isReady = true;
                _readyID = null;
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


// ======================================
// ======================================
// ======================================
// MARK: - Cookie

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





// ======================================
// ======================================
// ======================================
// MARK: - login

native.extend(function () {
    
    function _login(callback) {
        if (!callback) {
            Native.log("Method `login` called without a callback is not allowed.", NativeLogStyle.error);
            return this;
        }
        let that = this;
        this.core.perform(NativeMethod.login, function (currentUser) {
            that.setCurrentUser(currentUser);
            callback();
        });
    }
    
    return {
        login: {
            get: function () {
                return _login;
            }
        }
    };
});



// ======================================
// ======================================
// ======================================
// MARK: - User

native.extend(function (configuration) {
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
    
    class _User {
        constructor(userID, userName, userInfo, userVersion) {
            this._id = userID;
            this._name = userName;
            this._info = userInfo;
            this._version = userVersion;
        }
        
        get id() {
            return this._id;
        }
        
        get name() {
            return this._name;
        }
        
        get info() {
            return this._info;
        }
        
        get version() {
            return this._version;
        }
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
    
    (function (native) {
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
            get: function () {
                return _setCurrentUser;
            }
        },
        currentUserChange: {
            get: function () {
                return _currentUserChange;
            }
        },
        currentUser: {
            get: function () {
                return _currentUser;
            }
        }
    };
});


// ======================================
// ======================================
// ======================================
// MARK: - navigation

native.extend(function (configuration) {

    let _nativeCore = this.core;

    function _NavigationBar(barInfo) {
        
        let _title           = barInfo.title;
        let _titleColor      = barInfo.titleColor;
        let _backgroundColor = barInfo.backgroundColor;
        let _isHidden        = barInfo.isHidden;
        
        function _setTitle(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                Native.log("The navigation.bar.title must be a string value.", NativeLogStyle.error);
                return this;
            }
            _title = newValue;
            if (needsSyncToApp) {
                _nativeCore.perform(NativeMethod.setNavigationBarTitle, newValue);
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
                _nativeCore.perform(NativeMethod.setNavigationBarTitleColor, newValue);
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
                _nativeCore.perform(NativeMethod.setNavigationBarHidden, newValue, animated);
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
            _nativeCore.perform(NativeMethod.setNavigationBarBackgroundColor, newValue);
            return this;
        }
        
        Object.defineProperties(this, {
            title: {
                get: function () {
                    return _title;
                },
                set: function (newValue) {
                    _setTitle(newValue, true);
                }
            },
            titleColor: {
                get: function () {
                    return _titleColor;
                },
                set: function (newValue) {
                    _setTitleColor(newValue, true);
                }
            },
            backgroundColor: {
                get: function () {
                    return _backgroundColor;
                },
                set: function (newValue) {
                    _setBackgroundColor(newValue, true);
                }
            },
            isHidden: {
                get: function () {
                    return _isHidden;
                },
                set: function (newValue) {
                    _setHidden(newValue, false, true);
                }
            },
            setTitle: {
                get: function () {
                    return _setTitle;
                }
            },
            setTitleColor: {
                get: function () {
                    return _setTitleColor;
                }
            },
            setBackgroundColor: {
                get: function () {
                    return _setBackgroundColor;
                }
            },
            setHidden: {
                get: function () {
                    return _setHidden;
                }
            },
            hide: {
                get: function () {
                    return _hide;
                }
            },
            show: {
                get: function () {
                    return _show;
                }
            }
        });
    }
    
    function _Navigation(info) {
        // 3.1 进入下级页面。
        let _push = function (url, animated) {
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
            return _nativeCore.perform(NativeMethod.push, url, animated);
        };
        
        // 3.2 推出当前页面，使栈内页面数量 -1。
        let _pop = function (animated) {
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return _nativeCore.perform(NativeMethod.pop, animated);
        };
        
        // 3.3 移除栈内索引大于 index 的所有页面，即将 index 页面所显示的内容展示出来。
        let _popTo = function (index, animated) {
            if (typeof index !== 'number') {
                Native.log("Method `popTo` can not be called without a index parameter.", NativeLogStyle.error);
                return;
            }
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return _nativeCore.perform(NativeMethod.popTo, index, animated);
        };
        
        let _bar = new _NavigationBar(info.bar);
        
        Object.defineProperties(this, {
            push: {
                get: function () {
                    return _push;
                }
            },
            pop: {
                get: function () {
                    return _pop;
                }
            },
            popTo: {
                get: function () {
                    return _popTo;
                }
            },
            bar: {
                get: function () {
                    return _bar;
                }
            }
        });
    }
    
    let _navigation = new _Navigation(configuration.navigation);
    
    return {
        'navigation': {
            get: function () {
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

native.extend(function (configuration) {

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
            return _nativeCore.perform(NativeMethod.http, request, callback);
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
        
        Object.defineProperties(this, {
            isViaWiFi: {
                get: function () {
                    return (_status === NativeNetworkStatus.WiFi);
                }
            },
            status: {
                get: function () {
                    return _status;
                }
            },
            isReachable: {
                get: function () {
                    return !!_status
                }
            },
            statusChange: {
                get: function () {
                    return _statusChange;
                }
            },
            http: {
                get: function () {
                    return _http;
                }
            },
            setStatus: {
                get: function () {
                    return _setStatus;
                }
            }
        });
    }
    
    let _networking = new _Networking(configuration.networking);
    
    return {
        "networking": {
            get: function () {
                return _networking;
            }
        },
        "http": {
            get: function () {
                return _networking.http;
            }
        }
    };
});

// ======================================
// ======================================
// ======================================
// MARK: - Open

native.extend(function () {
    
    function _open(page) {
        if (typeof page !== 'string') {
            Native.log("Method `open`'s page parameter must be a string value.", NativeLogStyle.error);
            return null;
        }
        return this.core.perform(NativeMethod.open, page);
    }
    
    return {
        open: {
            get: function () {
                return _open;
            }
        }
    };
});


// ======================================
// ======================================
// ======================================
// MARK: - Present

native.extend(function () {
    
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
            get: function () {
                return _present;
            }
        },
        dismiss: {
            get: function () {
                return _dismiss;
            }
        }
    }
    
});



// ======================================
// ======================================
// ======================================
// MARK: - Theme

native.extend(function (configuration) {

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
            _currentThemeChangeHandlers.push({"callback": callback, "animated": animated});
            return this;
        }
        for (let i = 0; i < _currentThemeChangeHandlers.length; i++) {
            let obj = _currentThemeChangeHandlers[i];
            obj.callback.call(window, obj.animated);
        }
        return this;
    }
    
    (function (native) {
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
            get: function () {
                return _currentTheme;
            },
            set: function (newValue) {
                _setCurrentTheme(newValue, false, true);
            }
        },
        currentThemeChange: {
            get: function () {
                return _currentThemeChange;
            }
        },
        setCurrentTheme: {
            get: function () {
                return _setCurrentTheme;
            }
        }
    }
});


// ======================================
// ======================================
// ======================================
// MARK: - Event Service

native.extend(function () {
    
    // native 对象应该一直存在于内存中，拓展也应该一直存在于内存中（如果不是一直存在于内存中的拓展，可以考虑提供清理的方法。

    let _nativeCore = this.core;
    
    function _EventService() {
        
        /// 列表点击事件。
        function _didSelectRowAtIndex(documentName, elementName, index, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string' || typeof index !== 'number') {
                Native.log("Method `elementDidSelectRowAtIndex` first/second/third parameter must be a string/string/number value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.didSelectRowAtIndex, documentName, elementName, index, callback);
        }
        
        /// 页面元素点击事件。
        function _wasClickedOnElement(documentName, elementName, data, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string') {
                Native.log("Method `elementWasClicked` first/second parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            if (typeof data === 'function') {
                callback = data;
                data = null;
            }
            return _nativeCore.perform(NativeMethod.wasClickedOnElement, documentName, elementName, data, callback);
        }
        
        /// 事件埋点。
        function _track(eventName, parameters) {
            if (typeof eventName !== 'string') {
                Native.log("Method `track` first parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.track, eventName, parameters);
        }
        
        Object.defineProperties(this, {
            didSelectRowAtIndex: {
                get: function () {
                    return _didSelectRowAtIndex;
                }
            },
            wasClickedOnElement: {
                get: function () {
                    return _wasClickedOnElement;
                }
            },
            track: {
                get: function () {
                    return _track;
                }
            }
        });
    }
    
    let _eventService = new _EventService();
    
    return {
        eventService: {
            get: function () {
                return _eventService;
            }
        }
    }
    
});

// ======================================
// ======================================
// ======================================
// MARK: - Data Service

const NativeCachedResourceType = Object.freeze({
    image: "image"
});

native.extend(function () {

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
            return _nativeCore.perform(NativeMethod.numberOfRowsInList, documentName, listName, callback);
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
            return _nativeCore.perform(NativeMethod.dataForRowAtIndex, documentName, listName, index, callback);
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
            return _nativeCore.perform(NativeMethod.cachedResourceForURL, url, cacheType, completion);
        }
        
        Object.defineProperties(this, {
            numberOfRowsInList: {
                get: function () {
                    return _numberOfRowsInList;
                }
            },
            dataForRowAtIndex: {
                get: function () {
                    return _dataForRowAtIndex;
                }
            },
            cachedResourceForURL: {
                get: function () {
                    return _cachedResourceForURL;
                }
            }
        });
    }
    
    let _dataService = new _DataService();
    
    return {
        dataService: {
            get: function () {
                return _dataService;
            }
        }
    };
});



// ======================================
// ======================================
// ======================================
// MARK: - Alert

native.extend(function () {
    
    function _alert(message, callback) {
        if (!message || typeof message !== 'object') {
            Native.log("Method `alert` first parameter must be an message object.", NativeLogStyle.error);
            return null;
        }
        return this.core.perform(NativeMethod.alert, message, callback);
    }
    
    return {
        'alert': {
            get: function () {
                return _alert;
            }
        }
    };

});