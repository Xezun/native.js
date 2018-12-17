// native.theme.js

const Native = require("./native.static.js");

Native.Method("setCurrentTheme", "setCurrentTheme");
Native.CookieKey("currentTheme", "com.mlibai.native.cookie.currentTheme");

module.exports = require("./native.js").extend(function(_configuration) {

    let _currentTheme = _configuration.currentTheme;

    let _currentThemeChangeHandlers = [];

    // 设置当前主题。
    function _setCurrentTheme(newValue, animated, needsSyncToApp) {
        _currentTheme = newValue;
        // 将主题保存到 cookie 中.
        Native.cookie.value(Native.CookieKey.currentTheme, newValue);
        // 同步到 App 说明更改主题是由 JS 触发的，则不发送事件；否则就发送事件。
        if (needsSyncToApp || typeof needsSyncToApp === "undefined") {
            this.core.perform(Native.Method.setCurrentTheme, newValue, animated);
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

    (function(_native) {
        function _pageShow() {
            let currentTheme = Native.cookie.value(Native.CookieKey.currentTheme);
            if (!currentTheme || currentTheme === _native.currentTheme) {
                return;
            }
            _native.setCurrentTheme(currentTheme, false, false);
            _native.currentThemeChange();
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