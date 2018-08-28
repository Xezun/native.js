// Native.EventService.js
// requires Native.js

const NativeMethodDidSelectRowAtIndex = "didSelectRowAtIndex";
const NativeMethodWasClickedOnElement = "wasClickedOnElement";
const NativeMethodTrack = "track";


window.native.extend(function () {
    
    // native 对象应该一直存在于内存中，拓展也应该一直存在于内存中（如果不是一直存在于内存中的拓展，可以考虑提供清理的方法。

    let _nativeCore = this.core;
    
    function _EventService() {
        
        /// 列表点击事件。
        function _didSelectRowAtIndex(documentName, elementName, index, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string' || typeof index !== 'number') {
                NativeLog("Method `elementDidSelectRowAtIndex` first/second/third parameter must be a string/string/number value.", NativeLogStyleError);
                return null;
            }
            return _nativeCore.perform(NativeMethodDidSelectRowAtIndex, [documentName, elementName, index], callback);
        }
        
        /// 页面元素点击事件。
        function _wasClickedOnElement(documentName, elementName, data, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string') {
                NativeLog("Method `elementWasClicked` first/second parameter must be a string value.", NativeLogStyleError);
                return null;
            }
            if (typeof data === 'function') {
                callback = data;
                data = null;
            }
            return _nativeCore.perform(NativeMethodWasClickedOnElement, [documentName, elementName, data], callback);
        }
        
        /// 事件埋点。
        function _track(eventName, parameters) {
            if (typeof eventName !== 'string') {
                NativeLog("Method `track` first parameter must be a string value.", NativeLogStyleError);
                return null;
            }
            return _nativeCore.perform(NativeMethodTrack, [eventName, parameters]);
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