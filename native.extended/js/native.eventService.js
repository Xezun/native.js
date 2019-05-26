// native.eventService.js

import Native from "../../native/js/native.static";
import native from "../../native/js/native";

Native.Method("eventService", Object.freeze({
    "track": "eventService/track",
    "documentElementWasClicked": "eventService/documentElementWasClicked",
    "documentElementDidSelect": "eventService/documentElementDidSelect"
}));

native.extend(function() {

    // native 对象应该一直存在于内存中，拓展也应该一直存在于内存中（如果不是一直存在于内存中的拓展，可以考虑提供清理的方法。

    function _NativeEventService() {

        /// 列表点击事件。
        function _documentElementDidSelect(documentName, elementName, index, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string' || typeof index !== 'undefined') {
                Native.log("Method `documentElementDidSelect` first/second/third parameter must be a string/string/number value.", Native.LogStyle.error);
                return null;
            }
            return native.performMethod(Native.Method.eventService.documentElementDidSelect, documentName, elementName, index, callback);
        }

        /// 页面元素点击事件。
        function _documentElementWasClicked(documentName, elementName, data, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string') {
                Native.log("Method `elementWasClicked` first/second parameter must be a string value.", Native.LogStyle.error);
                return null;
            }
            if (typeof data === 'function') {
                callback = data;
                data = null;
            }
            return native.performMethod(Native.Method.eventService.documentElementWasClicked, documentName, elementName, data, callback);
        }

        /// 事件埋点。
        function _track(eventName, parameters) {
            if (typeof eventName !== 'string') {
                Native.log("Method `track` first parameter must be a string value.", Native.LogStyle.error);
                return null;
            }
            return native.performMethod(Native.Method.eventService.track, eventName, parameters);
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

    const _eventService = new _NativeEventService();

    return {
        "eventService": {
            get: function() {
                return _eventService;
            }
        }
    }

});


export { Native, native };
export default native;