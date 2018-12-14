// native.navigation.js

require("./native.js").extend(function(configuration) {

    function _NavigationBar(native, barInfo) {

        let _title = barInfo.title;
        let _titleColor = barInfo.titleColor;
        let _backgroundColor = barInfo.backgroundColor;
        let _isHidden = barInfo.isHidden;

        function _setTitle(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                NativeCore.log("The navigation.bar.title must be a string value.", NativeLogStyle.error);
                return this;
            }
            _title = newValue;
            if (needsSyncToApp) {
                native.core.perform(NativeMethod.navigation.bar.setTitle, newValue);
            }
            return this;
        }

        function _setTitleColor(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                NativeCore.log("The navigation.bar.titleColor must be a string value.", NativeLogStyle.error);
                return this;
            }
            _titleColor = newValue;
            if (needsSyncToApp) {
                native.core.perform(NativeMethod.navigation.bar.setTitleColor, newValue);
            }
            return this;
        }

        function _setHidden(newValue, animated, needsSyncToApp) {
            if (typeof newValue !== 'boolean') {
                NativeCore.log("The navigation.bar.isHidden must be a boolean value.", NativeLogStyle.error);
                return this;
            }
            _isHidden = newValue;
            if (needsSyncToApp) {
                native.core.perform(NativeMethod.navigation.bar.setHidden, newValue, animated);
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
                NativeCore.log("The navigation.bar.backgroundColor must be a string value.", NativeLogStyle.error);
                return this;
            }
            _backgroundColor = newValue;
            if (!needsSyncToApp) {
                return this;
            }
            native.core.perform(NativeMethod.navigation.bar.setBackgroundColor, newValue);
            return this;
        }

        NativeCore.defineProperties(this, {
            title: {
                get: function() {
                    return _title;
                },
                set: function(newValue) {
                    _setTitle(newValue, true);
                }
            },
            titleColor: {
                get: function() {
                    return _titleColor;
                },
                set: function(newValue) {
                    _setTitleColor(newValue, true);
                }
            },
            backgroundColor: {
                get: function() {
                    return _backgroundColor;
                },
                set: function(newValue) {
                    _setBackgroundColor(newValue, true);
                }
            },
            isHidden: {
                get: function() {
                    return _isHidden;
                },
                set: function(newValue) {
                    _setHidden(newValue, false, true);
                }
            },
            setTitle: {
                get: function() {
                    return _setTitle;
                }
            },
            setTitleColor: {
                get: function() {
                    return _setTitleColor;
                }
            },
            setBackgroundColor: {
                get: function() {
                    return _setBackgroundColor;
                }
            },
            setHidden: {
                get: function() {
                    return _setHidden;
                }
            },
            hide: {
                get: function() {
                    return _hide;
                }
            },
            show: {
                get: function() {
                    return _show;
                }
            }
        });
    }

    function _Navigation(native, info) {
        // 3.1 进入下级页面。
        let _push = function(url, animated) {
            if (typeof url !== 'string') {
                NativeCore.log("Method `push` can not be called without a url parameter.", NativeLogStyle.error);
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
            return native.core.perform(NativeMethod.navigation.push, url, animated);
        };

        // 3.2 推出当前页面，使栈内页面数量 -1。
        let _pop = function(animated) {
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return native.core.perform(NativeMethod.navigation.pop, animated);
        };

        // 3.3 移除栈内索引大于 index 的所有页面，即将 index 页面所显示的内容展示出来。
        let _popTo = function(index, animated) {
            if (typeof index !== 'number') {
                NativeCore.log("Method `popTo` can not be called without a index parameter.", NativeLogStyle.error);
                return;
            }
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return native.core.perform(NativeMethod.navigation.popTo, index, animated);
        };

        let _bar = new _NavigationBar(native, info.bar);

        NativeCore.defineProperties(this, {
            push: {
                get: function() {
                    return _push;
                }
            },
            pop: {
                get: function() {
                    return _pop;
                }
            },
            popTo: {
                get: function() {
                    return _popTo;
                }
            },
            bar: {
                get: function() {
                    return _bar;
                }
            }
        });
    }

    let _navigation = new _Navigation(this, configuration.navigation);

    return {
        'navigation': {
            get: function() {
                return _navigation;
            }
        }
    };
});