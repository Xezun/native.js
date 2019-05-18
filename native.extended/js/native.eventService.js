// native.eventService.js

module.exports = require('../native/js/native.js');

NativeMethod("eventService", Object.freeze({
    "track": "eventService/track",
    "documentElementWasClicked": "eventService/documentElementWasClicked",
    "documentElementDidSelect": "eventService/documentElementDidSelect"
}));

global.native.extend(function() {

    // native 对象应该一直存在于内存中，拓展也应该一直存在于内存中（如果不是一直存在于内存中的拓展，可以考虑提供清理的方法。

    function _NativeEventService() {

        /// 列表点击事件。
        function _documentElementDidSelect(documentName, elementName, index, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string' || typeof index !== 'undefined') {
                NativeLog("Method `documentElementDidSelect` first/second/third parameter must be a string/string/number value.", NativeLogStyle.error);
                return null;
            }
            return global.native.performMethod(NativeMethod.eventService.documentElementDidSelect, documentName, elementName, index, callback);
        }

        /// 页面元素点击事件。
        function _documentElementWasClicked(documentName, elementName, data, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string') {
                NativeLog("Method `elementWasClicked` first/second parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            if (typeof data === 'function') {
                callback = data;
                data = null;
            }
            return global.native.performMethod(NativeMethod.eventService.documentElementWasClicked, documentName, elementName, data, callback);
        }

        /// 事件埋点。
        function _track(eventName, parameters) {
            if (typeof eventName !== 'string') {
                NativeLog("Method `track` first parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            return global.native.performMethod(NativeMethod.eventService.track, eventName, parameters);
        }

        Object.defineProperties(this, {
            "documentElementDidSelect": {
                get: function() {
                    return _documentElementDidSelect;
                }
            },
            "documentElementWasClicked": {
                get: function() {
                    return _documentElementWasClicked;
                }
            },
            "track": {
                get: function() {
                    return _track;
                }
            }
        });
    }

    let _eventService = new _NativeEventService();

    return {
        "eventService": {
            get: function() {
                return _eventService;
            }
        }
    }

});


