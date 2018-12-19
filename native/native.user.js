// native.user.js

const Native = require("./native.static.js");

Native.Method("login", "login");
Native.CookieKey("currentUser", "com.mlibai.native.cookie.currentUser");

module.exports = require("./native.js").extend(function(configuration) {
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

    function NativeUser(_id, _name, _info, _version) {
        Object.defineProperties(this, {
            "id": {
                get: function() {
                    return _id;
                }
            },
            "name": {
                get: function() {
                    return _name;
                }
            },
            "info": {
                get: function() {
                    return _info;
                }
            },
            "version": {
                get: function() {
                    return _version;
                }
            }
        })
    }

    // 定义用户
    let userInfo = configuration.currentUser;
    if ( !userInfo ) {
        userInfo = {"id": "0", "name": "Visitor", "info": {}, "version": "0" };
    }
    let _currentUser = new NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);

    // 保存 User 信息。
    Native.cookie.value(Native.CookieKey.currentUser, JSON.stringify(_currentUser));

    // 设置当前用户，App 行为。
    function _setCurrentUser(userInfo) {
        _currentUser = new NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
        _currentUserChange();
    }

    (function(native) {
        // 在页面隐藏时绑定显示时事件。
        // 页面显示时，从 cookie 读取信息。
        function _pageShow() {
            let userInfo = JSON.parse(Native.cookie.value(Native.CookieKey.currentUser));
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

    function _login(callback) {
		let _native = this;
	    return this.core.perform(Native.Method.login, function(currentUser) {
			_native.setCurrentUser(currentUser);
			if (!!callback) {
				callback(_native.currentUser);
			}
		});
    }
    
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
        },
        "login": {
			get: function() {
				return _login;
			}
		}
    };
});