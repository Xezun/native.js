// native.theme.js

import Native from "../../native/js/native.static";
import native from "../../native/js/native";

Native.Method("setCurrentTheme", "setCurrentTheme");
Native.CookieKey("currentTheme", "com.mlibai.native.cookie.currentTheme");
Native.Action("setCurrentTheme", "setCurrentTheme");
Native.Action("currentThemeChange", "currentThemeChange");

native.extend(function(_configuration) {

    let _currentTheme = _configuration.currentTheme;

    this.addActionTarget(Native.Action.setCurrentTheme, function(newTheme, animated) {
        _currentTheme = newTheme;
        Native.cookie.value(Native.CookieKey.currentTheme, newTheme); // 将主题保存到 cookie 中.
    });

    // 设置当前主题。
    function _setCurrentTheme(newTheme, animated, needsSyncToApp) {
        if (typeof needsSyncToApp === "undefined" || needsSyncToApp) { 
            // 由 JS 触发，需要同步到 App，不触发 Native.Action 事件。
            _currentTheme = newTheme;
            Native.cookie.value(Native.CookieKey.currentTheme, newTheme);
            return this.performMethod(Native.Method.setCurrentTheme, newValue, animated);
        }
        // 由 App 触发，发送事件。
        return this.sendAction(Native.Action.setCurrentTheme, newTheme, animated);
    }

    function _currentThemeChange(callback, animated) {
        if (typeof callback === 'function') {
            return this.addActionTarget(Native.Action.currentThemeChange, callback);
        }
        return this.sendAction(Native.Action.currentThemeChange, _currentTheme, !!animated);
    }

    (function() {
        function _pageShow() {
            // 从 Cookie 中恢复 cookie .
            let newTheme = Native.cookie.value(Native.CookieKey.currentTheme);
            if (!newTheme || newTheme === native.currentTheme) {
                return;
            }
            _currentTheme = newTheme;
            native.sendAction(Native.Action.currentThemeChange, newTheme, false);
        }

        function _pageHide() {
            window.removeEventListener('pagehide', _pageHide);
            window.addEventListener('pageshow', _pageShow);
        }

        // 页面第一隐藏后，每次出现时，都从 Cookie 检查主题是否发生变更。
        window.addEventListener('pagehide', _pageHide);
    })(this);

    return {
        "currentTheme": {
            get: function() {
                return _currentTheme;
            },
            set: function(newValue) {
                _setCurrentTheme(newValue, false, true);
            }
        },
        "currentThemeChange": {
            get: function() {
                return _currentThemeChange;
            }
        },
        "setCurrentTheme": {
            get: function() {
                return _setCurrentTheme;
            }
        }
    }
});


export { Native, native };
export default native;