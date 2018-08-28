// Native.User.js
// requires Native.js


const NativeUserCookieKey = "com.mlibai.native.cookie.currentUser";

window.native.extend(function (configuration) {
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
    
    // 设置当前用户，App 行为。
    function _setCurrentUser(userInfo) {
        _currentUser = new _User(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
        _currentUserChange();
    }
    
    (function (native) {
        // 在页面隐藏时绑定显示时事件。
        // 页面显示时，从 cookie 读取信息。
        function _pageShow() {
            let userInfo = JSON.parse(native.cookie.value(NativeUserCookieKey));
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