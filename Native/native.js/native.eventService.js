// native.eventService.js
// requires native.js

window.native.extend(function () {
    
    // native 对象应该一直存在于内存中，拓展也应该一直存在于内存中（如果不是一直存在于内存中的拓展，可以考虑提供清理的方法。

    let _nativeCore = this.core;
    
    function _EventService() {
        
        /// 列表点击事件。
        function _didSelectRowAtIndex(documentName, elementName, index, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string' || typeof index !== 'number') {
                Native.log("Method `elementDidSelectRowAtIndex` first/second/third parameter must be a string/string/number value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.didSelectRowAtIndex, [documentName, elementName, index], callback);
        }
        
        /// 页面元素点击事件。
        function _wasClickedOnElement(documentName, elementName, data, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string') {
                Native.log("Method `elementWasClicked` first/second parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            if (typeof data === 'function') {
                callback = data;
                data = null;
            }
            return _nativeCore.perform(NativeMethod.wasClickedOnElement, [documentName, elementName, data], callback);
        }
        
        /// 事件埋点。
        function _track(eventName, parameters) {
            if (typeof eventName !== 'string') {
                Native.log("Method `track` first parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.track, [eventName, parameters]);
        }
        
        Object.defineProperties(this, {
            didSelectRowAtIndex: {
                get: function () {
                    return _didSelectRowAtIndex;
                }
            },
            wasClickedOnElement: {
                get: function () {
                    return _wasClickedOnElement;
                }
            },
            track: {
                get: function () {
                    return _track;
                }
            }
        });
    }
    
    let _eventService = new _EventService();
    
    return {
        eventService: {
            get: function () {
                return _eventService;
            }
        }
    }
    
});