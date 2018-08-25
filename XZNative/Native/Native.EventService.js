// Native.Event.js

const NativeMethodElementDidSelectRowAtIndex = "elementDidSelectRowAtIndex";
const NativeMethodElementWasClicked = "elementWasClicked";
const NativeMethodTrack = "track";



window.native.extend(function () {
    
    // native 对象应该一直存在于内存中，拓展也应该一直存在于内存中（如果不是一直存在于内存中的拓展，可以考虑提供清理的方法。
    
    function _EventService(native) {
        
        /// 列表点击事件。
        function _elementDidSelectRowAtIndex(documentName, elementName, index, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string' || typeof index !== 'number') {
                NTLog("Method `elementDidSelectRowAtIndex` first/second/third parameter must be a string/string/number value.", NativeLogStyleError);
                return null;
            }
            return native.perform(NativeMethodElementDidSelectRowAtIndex, [documentName, elementName, index], callback);
        }
        
        /// 页面元素点击事件。
        function _elementWasClicked(documentName, elementName, data, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string') {
                NTLog("Method `elementWasClicked` first/second parameter must be a string value.", NativeLogStyleError);
                return null;
            }
            if (typeof data === 'function') {
                callback = data;
                data = null;
            }
            return native.perform(NativeMethodElementWasClicked, [documentName, elementName, data], callback);
        }
        
        /// 事件埋点。
        function _track(eventName, parameters) {
            if (typeof eventName !== 'string') {
                NTLog("Method `track` first parameter must be a string value.", NativeLogStyleError);
                return null;
            }
            return native.perform(NativeMethodTrack, [eventName, parameters]);
        }
        
        Object.defineProperties(this, {
            elementDidSelectRowAtIndex: {
                get: function () {
                    return _elementDidSelectRowAtIndex;
                }
            },
            elementWasClicked: {
                get: function () {
                    return _elementWasClicked;
                }
            },
            track: {
                get: function () {
                    return _track;
                }
            }
        });
    }
    
    let _eventService = new _EventService(this);
    
    return {
        eventService: {
            get: function () {
                return _eventService;
            }
        }
    }
    
});