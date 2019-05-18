// native.user.js

module.exports = require('../../native/js/native.js');

NativeMethod("login", "login");
NativeCookieKey("currentUser", "com.mlibai.native.cookie.currentUser");
NativeAction("setCurrentUser", "setCurrentUser");
NativeAction("currentUserChange", "currentUserChange");

global.native.extend(function(configuration) {
    // 定义用户
    let userInfo = configuration.currentUser;
    if ( !userInfo ) {
        userInfo = {"id": "0", "name": "Visitor", "info": {}, "version": "0" };
    }
    let _currentUser = new _NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
    // 保存 User 信息。
    global.native.cookie.value(NativeCookieKey.currentUser, JSON.stringify(_currentUser));

    this.addActionTarget(NativeAction.setCurrentUser, function (userInfo) {
        _currentUser = new _NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
        this.cookie.value(NativeCookieKey.currentUser, JSON.stringify(_currentUser));
        this.sendAction(NativeAction.currentUserChange, _currentUser);
    });

    function _currentUserChange(callback) {
        if (typeof callback === "function") {
            return this.addActionTarget(NativeAction.currentUserChange, callback);
        }
        return this.sendAction(NativeAction.currentUserChange, _currentUser);
    }

        // 设置当前用户，App 行为。
    function _setCurrentUser(userInfo) {
        return this.sendAction(NativeAction.setCurrentUser, userInfo);
    }

    function _NativeUser(_id, _name, _info, _version) {
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

    (function() {
        // 在页面隐藏时绑定显示时事件。
        // 页面显示时，从 cookie 读取信息。
        function _pageShow() {
            let userInfo = JSON.parse(global.native.cookie.value(NativeCookieKey.currentUser));
            if (userInfo.id === global.native.currentUser.id && userInfo.version === global.native.currentUser.version) {
                return;
            }
            _currentUser = new _NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
            global.native.sendAction(NativeAction.currentUserChange, _currentUser);
        }

        // 页面第一次隐藏后，监听页面显示事件。
        function _pageHide() {
            window.addEventListener('pageshow', _pageShow);
            window.removeEventListener('pagehide', _pageHide);
        }

        // 绑定页面隐藏时的事件
        window.addEventListener('pagehide', _pageHide);
    })();

    function _login(callback) {
	    return this.performMethod(NativeMethod.login, function(userInfo) {
			_currentUser = new _NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
			if (typeof callback === 'function') {
				callback(_currentUser);
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