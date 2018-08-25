// Native.Navigation.js
// requires Native.js

const NativeMethodPush = 'push';
const NativeMethodPop = 'pop';
const NativeMethodPopTo = 'popTo';
const NativeMethodSetNavigationBarHidden = "setNavigationBarHidden";
const NativeMethodSetNavigationBarTitle = "setNavigationBarTitle";
const NativeMethodSetNavigationBarTitleColor = "setNavigationBarTitleColor";
const NativeMethodSetNavigationBarBackgroundColor = "setNavigationBarBackgroundColor";

window.native.extend(function (configuration) {

    let _nativeCore = this.core;

    function _NavigationBar(barInfo) {
        
        let _title           = barInfo.title;
        let _titleColor      = barInfo.titleColor;
        let _backgroundColor = barInfo.backgroundColor;
        let _isHidden        = barInfo.isHidden;
        
        function _setTitle(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                NTLog("The navigation.bar.title must be a string value.", NativeLogStyleError);
                return this;
            }
            _title = newValue;
            if (needsSyncToApp) {
                _nativeCore.perform(NativeMethodSetNavigationBarTitle, [newValue]);
            }
            return this;
        }
        
        function _setTitleColor(newValue, needsSyncToApp) {
            if (typeof newValue !== 'string') {
                NTLog("The navigation.bar.titleColor must be a string value.", NativeLogStyleError);
                return this;
            }
            _titleColor = newValue;
            if (needsSyncToApp) {
                _nativeCore.perform(NativeMethodSetNavigationBarTitleColor, [newValue]);
            }
            return this;
        }
        
        function _setHidden(newValue, animated, needsSyncToApp) {
            if (typeof newValue !== 'boolean') {
                NTLog("The navigation.bar.isHidden must be a boolean value.", NativeLogStyleError);
                return this;
            }
            _isHidden = newValue;
            if (needsSyncToApp) {
                _nativeCore.perform(NativeMethodSetNavigationBarHidden, [newValue, animated]);
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
                NTLog("The navigation.bar.backgroundColor must be a string value.", 1);
                return this;
            }
            _backgroundColor = newValue;
            if (!needsSyncToApp) {
                return this;
            }
            _nativeCore.perform(NativeMethodSetNavigationBarBackgroundColor, [newValue]);
            return this;
        }
        
        Object.defineProperties(this, {
            title: {
                get: function () {
                    return _title;
                },
                set: function (newValue) {
                    _setTitle(newValue, true);
                }
            },
            titleColor: {
                get: function () {
                    return _titleColor;
                },
                set: function (newValue) {
                    _setTitleColor(newValue, true);
                }
            },
            backgroundColor: {
                get: function () {
                    return _backgroundColor;
                },
                set: function (newValue) {
                    _setBackgroundColor(newValue, true);
                }
            },
            isHidden: {
                get: function () {
                    return _isHidden;
                },
                set: function (newValue) {
                    _setHidden(newValue, false, true);
                }
            },
            setTitle: {
                get: function () {
                    return _setTitle;
                }
            },
            setTitleColor: {
                get: function () {
                    return _setTitleColor;
                }
            },
            setBackgroundColor: {
                get: function () {
                    return _setBackgroundColor;
                }
            },
            setHidden: {
                get: function () {
                    return _setHidden;
                }
            },
            hide: {
                get: function () {
                    return _hide;
                }
            },
            show: {
                get: function () {
                    return _show;
                }
            }
        });
    }
    
    function _Navigation(info) {
        // 3.1 进入下级页面。
        let _push = function (url, animated) {
            if (typeof url !== 'string') {
                NTLog("Method `push` can not be called without a url parameter.", 0);
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
            return _nativeCore.perform(NativeMethodPush, [url, animated], null);
        };
        
        // 3.2 推出当前页面，使栈内页面数量 -1。
        let _pop = function (animated) {
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return _nativeCore.perform(NativeMethodPop, [animated], null);
        };
        
        // 3.3 移除栈内索引大于 index 的所有页面，即将 index 页面所显示的内容展示出来。
        let _popTo = function (index, animated) {
            if (typeof index !== 'number') {
                NTLog("Method `popTo` can not be called without a index parameter.", 1);
                return;
            }
            if (typeof animated !== 'boolean') {
                animated = true;
            }
            return _nativeCore.perform(NativeMethodPopTo, [index, animated]);
        };
        
        let _bar = new _NavigationBar(info.bar);
        
        Object.defineProperties(this, {
            push: {
                get: function () {
                    return _push;
                }
            },
            pop: {
                get: function () {
                    return _pop;
                }
            },
            popTo: {
                get: function () {
                    return _popTo;
                }
            },
            bar: {
                get: function () {
                    return _bar;
                }
            }
        });
    }
    
    let _navigation = new _Navigation(configuration.navigation);
    
    return {
        'navigation': {
            get: function () {
                return _navigation;
            }
        }
    };
});