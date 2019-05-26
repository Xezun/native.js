// native.user.js

import Native from "../../native/js/native.static";
import native from "../../native/js/native";

Native.Method("login", "login");
Native.CookieKey("currentUser", "com.mlibai.native.cookie.currentUser");
Native.Action("setCurrentUser", "setCurrentUser");
Native.Action("currentUserChange", "currentUserChange");

native.extend(function(configuration) {
    // 定义用户
    let userInfo = configuration.currentUser;
    if ( !userInfo ) {
        userInfo = {"id": "0", "name": "Visitor", "info": {}, "version": "0" };
    }
    let _currentUser = new _NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
    // 保存 User 信息。
    Native.cookie.value(Native.CookieKey.currentUser, JSON.stringify(_currentUser));

    this.addActionTarget(Native.Action.setCurrentUser, function (userInfo) {
        _currentUser = new _NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
        Native.cookie.value(Native.CookieKey.currentUser, JSON.stringify(_currentUser));
        this.sendAction(Native.Action.currentUserChange, _currentUser);
    });

    function _currentUserChange(callback) {
        if (typeof callback === "function") {
            return this.addActionTarget(Native.Action.currentUserChange, callback);
        }
        return this.sendAction(Native.Action.currentUserChange, _currentUser);
    }

        // 设置当前用户，App 行为。
    function _setCurrentUser(userInfo) {
        return this.sendAction(Native.Action.setCurrentUser, userInfo);
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
            let userInfo = JSON.parse(Native.cookie.value(Native.CookieKey.currentUser));
            if (userInfo.id === native.currentUser.id && userInfo.version === native.currentUser.version) {
                return;
            }
            _currentUser = new _NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
            native.sendAction(Native.Action.currentUserChange, _currentUser);
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
	    return this.performMethod(Native.Method.login, function(userInfo) {
			_currentUser = new _NativeUser(userInfo.id, userInfo.name, userInfo.info, userInfo.version);
			if (typeof callback === 'function') {
				callback.call(this, _currentUser);
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


export { Native, native };
export default native;