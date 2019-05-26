// native.dataService.js

import Native from "../../native/js/native.static";
import native from "../../native/js/native";

Native.Method("dataService", Object.freeze({
    "cachedResourceForURL": "dataService/cachedResourceForURL",
    "numberOfRowsInList": "dataService/numberOfRowsInList",
    "dataForRowAtIndex": "dataService/dataForRowAtIndex"
}));

const _NativeCachedResourceType = Object.freeze({
    image: "image"
});

Object.defineProperty(Native, "CachedResourceType", {
    get: function() {
        return _NativeCachedResourceType;
    }
});

native.extend(function() {

    function _NativeDataService() {

        function _numberOfRowsInList(documentName, listName, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string') {
                Native.log("Method `numberOfRowsInList` first/second parameter must be a string value.", Native.LogStyle.error);
                return null;
            }
            return native.performMethod(Native.Method.dataService.numberOfRowsInList, documentName, listName, callback);
        }

        function _dataForRowAtIndex(documentName, listName, index, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string' || typeof index !== 'number') {
                Native.log("Method `dataForRowAtIndex` first/second/third parameter must be a string/string/number value.", Native.LogStyle.error);
                return null;
            }
            return native.performMethod(Native.Method.dataService.dataForRowAtIndex, documentName, listName, index, callback);
        }

        function _cachedResourceForURL(url, cacheType, completion) {
            // 检查 URL
            if (typeof url !== 'string') {
                Native.log("Method `cachedResourceForURL` url parameter must be a string value.", Native.LogStyle.error);
                return null;
            }
            // 检查 cacheType
            switch (typeof cacheType) {
                case 'function':
                    completion = cacheType;
                    cacheType = Native.CachedResourceType.image;
                    break;
                case 'string':
                    break;
                default:
                    cacheType = Native.CachedResourceType.image;
                    break;
            }
            // 检查 handler
            if (typeof completion !== 'function') {
                Native.log("Method `cachedResourceForURL` must have a callback handler.", Native.LogStyle.error);
                return null;
            }
            return native.performMethod(Native.Method.dataService.cachedResourceForURL, url, cacheType, completion);
        }

        Object.defineProperties(this, {
            "numberOfRowsInList": {
                get: function() {
                    return _numberOfRowsInList;
                }
            },
            "dataForRowAtIndex": {
                get: function() {
                    return _dataForRowAtIndex;
                }
            },
            "cachedResourceForURL": {
                get: function() {
                    return _cachedResourceForURL;
                }
            }
        });
    }

    const _dataService = new _NativeDataService();

    return {
        "dataService": {
            get: function() {
                return _dataService;
            }
        }
    };
});

export { Native, native };
export default native;