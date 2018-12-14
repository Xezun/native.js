// native.eventService.js

require("./native.js").extend(function() {

    // native 对象应该一直存在于内存中，拓展也应该一直存在于内存中（如果不是一直存在于内存中的拓展，可以考虑提供清理的方法。

    function _EventService(native) {

        /// 列表点击事件。
        function _documentElementDidSelect(documentName, elementName, index, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string' || typeof index !== 'undefined') {
                NativeCore.log("Method `documentElementDidSelect` first/second/third parameter must be a string/string/number value.", NativeLogStyle.error);
                return null;
            }
            return native.core.perform(NativeMethod.eventService.documentElementDidSelect, documentName, elementName, index, callback);
        }

        /// 页面元素点击事件。
        function _documentElementWasClicked(documentName, elementName, data, callback) {
            if (typeof documentName !== 'string' || typeof elementName !== 'string') {
                NativeCore.log("Method `elementWasClicked` first/second parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            if (typeof data === 'function') {
                callback = data;
                data = null;
            }
            return native.core.perform(NativeMethod.eventService.documentElementWasClicked, documentName, elementName, data, callback);
        }

        /// 事件埋点。
        function _track(eventName, parameters) {
            if (typeof eventName !== 'string') {
                NativeCore.log("Method `track` first parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            return native.core.perform(NativeMethod.eventService.track, eventName, parameters);
        }

        NativeCore.defineProperties(this, {
            documentElementDidSelect: {
                get: function() {
                    return _documentElementDidSelect;
                }
            },
            documentElementWasClicked: {
                get: function() {
                    return _documentElementWasClicked;
                }
            },
            track: {
                get: function() {
                    return _track;
                }
            }
        });
    }

    let _eventService = new _EventService(this);

    return {
        "eventService": {
            get: function() {
                return _eventService;
            }
        }
    }

});