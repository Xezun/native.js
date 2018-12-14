// native.user.js

require("./native.js").extend(function(configuration) {
    // 存储监听
    const _currentUserChangeHandlers = [];

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
        "setCurrentUser": {
            get: function() {
                return _setCurrentUser;
            }
        },
        "currentUserChange": {
            get: function() {
                return _currentUserChange;
            }
        },
        "currentUser": {
            get: function() {
                return _currentUser;
            }
        }
    };
});