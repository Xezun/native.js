// Native.Theme.js
// requires Native.js

const NativeThemeCookieKey = "com.mlibai.native.cookie.currentTheme";
const NativeMethodSetCurrentTheme = "setCurrentTheme";

window.native.extend(function (configuration) {
    let _currentTheme = configuration.currentTheme;
    let _currentThemeChangeHandlers = [];
    
    // 设置当前主题。
    function _setCurrentTheme(newValue, animated, needsSyncToApp) {
        _currentTheme = newValue;
        // 将主题保存到 cookie 中.
        window.native.cookie.value(NativeThemeCookieKey, newValue);
        // 同步到 App 说明更改主题是由 JS 触发的，则不发送事件；否则就发送事件。
        if (needsSyncToApp || typeof needsSyncToApp === "undefined") {
            window.native.perform(NativeMethodSetCurrentTheme, [newValue, animated], null);
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
    
    (function () {
        function _pageShow() {
            let currentTheme = window.native.cookie.value(NativeThemeCookieKey);
            if (!currentTheme || currentTheme === native.currentTheme) {
                return;
            }
            window.native.setCurrentTheme(currentTheme, false, false);
            window.native.currentThemeChange();
        }
        
        function _pageHide() {
            window.removeEventListener('pagehide', _pageHide);
            window.addEventListener('pageshow', _pageShow);
        }
        
        // 页面第一隐藏后，每次出现时，都从 Cookie 检查主题是否发生变更。
        window.addEventListener('pagehide', _pageHide);
    })();
    
    return {
        currentTheme: {
            get: function () {
                return _currentTheme;
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