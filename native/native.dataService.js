// native.dataService.js

const Native = require("./native.static.js");

Native.Method("dataService", Object.freeze({
    "cachedResourceForURL": "dataService/cachedResourceForURL",
    "numberOfRowsInList": "dataService/numberOfRowsInList",
    "dataForRowAtIndex": "dataService/dataForRowAtIndex"
}));

const NativeCachedResourceType = Object.freeze({
    image: "image"
});
Native.defineProperty(window, "NativeCachedResourceType", {
    get: function() {
        return NativeCachedResourceType;
    }
});

module.exports = require("./native.js").extend(function() {

    // TODO: 命名需要优化 document element

    function NativeDataService(_native) {

        function _numberOfRowsInList(documentName, listName, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string') {
                Native.log("Method `numberOfRowsInList` first/second parameter must be a string value.", Native.LogStyle.error);
                return null;
            }
            return _native.core.perform(Native.Method.dataService.numberOfRowsInList, documentName, listName, callback);
        }

        function _dataForRowAtIndex(documentName, listName, index, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string' || typeof index !== 'number') {
                Native.log("Method `dataForRowAtIndex` first/second/third parameter must be a string/string/number value.", Native.LogStyle.error);
                return null;
            }
            return _native.core.perform(Native.Method.dataService.dataForRowAtIndex, documentName, listName, index, callback);
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
                    cacheType = NativeCachedResourceType.image;
                    break;
                case 'string':
                    break;
                default:
                    cacheType = NativeCachedResourceType.image;
                    break;
            }
            // 检查 handler
            if (typeof completion !== 'function') {
                Native.log("Method `cachedResourceForURL` must have a callback handler.", Native.LogStyle.error);
                return null;
            }
            return _native.core.perform(Native.Method.dataService.cachedResourceForURL, url, cacheType, completion);
        }

        Native.defineProperties(this, {
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

    let _dataService = new NativeDataService(this);

    return {
        "dataService": {
            get: function() {
                return _dataService;
            }
        }
    };
});