// native.navigation.js

module.exports = require("./native.js");

NativeMethod("navigation", Object.freeze({
    "push": "navigation/push",
    "pop": "navigation/pop",
    "popTo": "navigation/popTo",
    "bar": Object.freeze({
        "setHidden": "navigation/bar/setHidden",
        "setTitle": "navigation/bar/setTitle",
        "setTitleColor": "navigation/bar/setTitleColor",
        "setBackgroundColor": "navigation/bar/setBackgroundColor"
    })
}));

global.native.extend(function(configuration) {

    function _NativeNavigationBar(_barInfo) {

        let _title = _barInfo.title;
        let _titleColor = _barInfo.titleColor;
        let _backgroundColor = _barInfo.backgroundColor;
        let _isHidden = _barInfo.isHidden;

        function _setTitle(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                NativeLog("The navigation.bar.title must be a string value.", NativeLogStyle.error);
                return this;
            }
            _title = newValue;
            if (needsSyncToApp) {
                global.native.performMethod(NativeMethod.navigation.bar.setTitle, newValue);
            }
            return this;
        }

        function _setTitleColor(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                NativeLog("The navigation.bar.titleColor must be a string value.", NativeLogStyle.error);
                return this;
            }
            _titleColor = newValue;
            if (needsSyncToApp) {
                global.native.performMethod(NativeMethod.navigation.bar.setTitleColor, newValue);
            }
            return this;
        }

        function _setHidden(newValue, animated, needsSyncToApp) {
            if (typeof newValue !== 'boolean') {
                NativeLog("The navigation.bar.isHidden must be a boolean value.", NativeLogStyle.error);
                return this;
            }
            _isHidden = newValue;
            if (needsSyncToApp) {
                global.native.performMethod(NativeMethod.navigation.bar.setHidden, newValue, animated);
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
                NativeLog("The navigation.bar.backgroundColor must be a string value.", NativeLogStyle.error);
                return this;
            }
            _backgroundColor = newValue;
            if (!needsSyncToApp) {
                return this;
            }
            global.native.performMethod(NativeMethod.navigation.bar.setBackgroundColor, newValue);
            return this;
        }

        Object.defineProperties(this, {
            "title": {
                get: function() {
                    return _title;
                },
                set: function(newValue) {
                    _setTitle(newValue, true);
                }
            },
            "titleColor": {
                get: function() {
                    return _titleColor;
                },
                set: function(newValue) {
                    _setTitleColor(newValue, true);
                }
            },
            "backgroundColor": {
                get: function() {
                    return _backgroundColor;
                },
                set: function(newValue) {
                    _setBackgroundColor(newValue, true);
                }
            },
            "isHidden": {
                get: function() {
                    return _isHidden;
                },
                set: function(newValue) {
                    _setHidden(newValue, false, true);
                }
            },
            "setTitle": {
                get: function() {
                    return _setTitle;
                }
            },
            "setTitleColor": {
                get: function() {
                    return _setTitleColor;
                }
            },
            "setBackgroundColor": {
                get: function() {
                    return _setBackgroundColor;
                }
            },
            "setHidden": {
                get: function() {
                    return _setHidden;
                }
            },
            "hide": {
                get: function() {
                    return _hide;
                }
            },
            "show": {
                get: function() {
                    return _show;
                }
            }
        });
    }

    function _NativeNavigation(_info) {
        // 3.1 进入下级页面。
        let _push = function(url, animated) {
            if (typeof url !== 'string') {
                NativeLog("Method `push` can not be called without a url parameter.", NativeLogStyle.error);
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
            return global.native.performMethod(NativeMethod.navigation.push, url, animated);
        };

        // 3.2 推出当前页面，使栈内页面数量 -1。
        let _pop = function(animated) {
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return global.native.performMethod(NativeMethod.navigation.pop, animated);
        };

        // 3.3 移除栈内索引大于 index 的所有页面，即将 index 页面所显示的内容展示出来。
        let _popTo = function(index, animated) {
            if (typeof index !== 'number') {
                NativeLog("Method `popTo` can not be called without a index parameter.", NativeLogStyle.error);
                return;
            }
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return global.native.performMethod(NativeMethod.navigation.popTo, index, animated);
        };

        let barInfo = _info.bar;
        if ( !barInfo ) {
            barInfo = { "title": "native.js", "titleColor": "#000", "backgroundColor": "#fff", "isHidden": false };
        }
        let _bar = new _NativeNavigationBar(barInfo);

        Object.defineProperties(this, {
            "push": {
                get: function() {
                    return _push;
                }
            },
            "pop": {
                get: function() {
                    return _pop;
                }
            },
            "popTo": {
                get: function() {
                    return _popTo;
                }
            },
            "bar": {
                get: function() {
                    return _bar;
                }
            }
        });
    }

    let navigationInfo = configuration.navigation;
    if ( !navigationInfo ) {
        navigationInfo = { "bar": { "title": "native.js", "titleColor": "#000", "backgroundColor": "#fff", "isHidden": false } };
    }
    let _navigation = new _NativeNavigation(navigationInfo);

    return {
        "navigation": {
            get: function() {
                return _navigation;
            }
        }
    };
});