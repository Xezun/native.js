// native.navigation.js

const Native = require("./native.static.js");

Native.Method("navigation", Object.freeze({
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

module.exports = require("./native.js").extend(function(configuration) {

    function NativeNavigationBar(_native, barInfo) {

        let _title = barInfo.title;
        let _titleColor = barInfo.titleColor;
        let _backgroundColor = barInfo.backgroundColor;
        let _isHidden = barInfo.isHidden;

        function _setTitle(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                Native.log("The navigation.bar.title must be a string value.", Native.LogStyle.error);
                return this;
            }
            _title = newValue;
            if (needsSyncToApp) {
                _native.core.perform(Native.Method.navigation.bar.setTitle, newValue);
            }
            return this;
        }

        function _setTitleColor(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                Native.log("The navigation.bar.titleColor must be a string value.", Native.LogStyle.error);
                return this;
            }
            _titleColor = newValue;
            if (needsSyncToApp) {
                _native.core.perform(Native.Method.navigation.bar.setTitleColor, newValue);
            }
            return this;
        }

        function _setHidden(newValue, animated, needsSyncToApp) {
            if (typeof newValue !== 'boolean') {
                Native.log("The navigation.bar.isHidden must be a boolean value.", Native.LogStyle.error);
                return this;
            }
            _isHidden = newValue;
            if (needsSyncToApp) {
                _native.core.perform(Native.Method.navigation.bar.setHidden, newValue, animated);
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
                Native.log("The navigation.bar.backgroundColor must be a string value.", Native.LogStyle.error);
                return this;
            }
            _backgroundColor = newValue;
            if (!needsSyncToApp) {
                return this;
            }
            _native.core.perform(Native.Method.navigation.bar.setBackgroundColor, newValue);
            return this;
        }

        Native.defineProperties(this, {
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

    function NativeNavigation(_native, info) {
        // 3.1 进入下级页面。
        let _push = function(url, animated) {
            if (typeof url !== 'string') {
                Native.log("Method `push` can not be called without a url parameter.", Native.LogStyle.error);
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
            return _native.core.perform(Native.Method.navigation.push, url, animated);
        };

        // 3.2 推出当前页面，使栈内页面数量 -1。
        let _pop = function(animated) {
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return _native.core.perform(Native.Method.navigation.pop, animated);
        };

        // 3.3 移除栈内索引大于 index 的所有页面，即将 index 页面所显示的内容展示出来。
        let _popTo = function(index, animated) {
            if (typeof index !== 'number') {
                Native.log("Method `popTo` can not be called without a index parameter.", Native.LogStyle.error);
                return;
            }
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return _native.core.perform(Native.Method.navigation.popTo, index, animated);
        };

        let _bar = new NativeNavigationBar(_native, info.bar);

        Native.defineProperties(this, {
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

    let _navigation = new NativeNavigation(this, configuration.navigation);

    return {
        "navigation": {
            get: function() {
                return _navigation;
            }
        }
    };
});