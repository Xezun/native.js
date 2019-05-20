// native.theme.js

module.exports = require('@mlibai/native.js');

NativeMethod("setCurrentTheme", "setCurrentTheme");
NativeCookieKey("currentTheme", "com.mlibai.native.cookie.currentTheme");
NativeAction("setCurrentTheme", "setCurrentTheme");
NativeAction("currentThemeChange", "currentThemeChange");

global.native.extend(function(_configuration) {

    let _currentTheme = _configuration.currentTheme;

    this.addActionTarget(NativeAction.setCurrentTheme, function(newTheme, animated) {
        _currentTheme = newTheme;
        this.cookie.value(NativeCookieKey.currentTheme, newTheme); // 将主题保存到 cookie 中.
    });

    // 设置当前主题。
    function _setCurrentTheme(newTheme, animated, needsSyncToApp) {
        if (typeof needsSyncToApp === "undefined" || needsSyncToApp) { 
            // 由 JS 触发，需要同步到 App，不触发 NativeAction 事件。
            _currentTheme = newTheme;
            this.cookie.value(NativeCookieKey.currentTheme, newTheme);
            return this.performMethod(NativeMethod.setCurrentTheme, newValue, animated);
        }
        // 由 App 触发，发送事件。
        return this.sendAction(NativeAction.setCurrentTheme, newTheme, animated);
    }

    function _currentThemeChange(callback, animated) {
        if (typeof callback === 'function') {
            return this.addActionTarget(NativeAction.currentThemeChange, callback);
        }
        return this.sendAction(NativeAction.currentThemeChange, _currentTheme, !!animated);
    }

    (function() {
        function _pageShow() {
            // 从 Cookie 中恢复 cookie .
            let newTheme = global.native.cookie.value(NativeCookieKey.currentTheme);
            if (!newTheme || newTheme === global.native.currentTheme) {
                return;
            }
            _currentTheme = newTheme;
            global.native.sendAction(NativeAction.currentThemeChange, newTheme, false);
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