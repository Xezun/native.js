// native.dataService.js

module.exports = require('../native/js/native.js');

NativeMethod("dataService", Object.freeze({
    "cachedResourceForURL": "dataService/cachedResourceForURL",
    "numberOfRowsInList": "dataService/numberOfRowsInList",
    "dataForRowAtIndex": "dataService/dataForRowAtIndex"
}));

const NativeCachedResourceType = Object.freeze({
    image: "image"
});

Object.defineProperty(global, "NativeCachedResourceType", {
    get: function() {
        return NativeCachedResourceType;
    }
});

native.extend(function() {

    function NativeDataService(_native) {

        function _numberOfRowsInList(documentName, listName, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string') {
                NativeLog("Method `numberOfRowsInList` first/second parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            return global.native.performMethod(NativeMethod.dataService.numberOfRowsInList, documentName, listName, callback);
        }

        function _dataForRowAtIndex(documentName, listName, index, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string' || typeof index !== 'number') {
                NativeLog("Method `dataForRowAtIndex` first/second/third parameter must be a string/string/number value.", NativeLogStyle.error);
                return null;
            }
            return global.native.performMethod(NativeMethod.dataService.dataForRowAtIndex, documentName, listName, index, callback);
        }

        function _cachedResourceForURL(url, cacheType, completion) {
            // 检查 URL
            if (typeof url !== 'string') {
                NativeLog("Method `cachedResourceForURL` url parameter must be a string value.", NativeLogStyle.error);
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
                NativeLog("Method `cachedResourceForURL` must have a callback handler.", NativeLogStyle.error);
                return null;
            }
            return global.native.performMethod(NativeMethod.dataService.cachedResourceForURL, url, cacheType, completion);
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

    let _dataService = new NativeDataService(this);

    return {
        "dataService": {
            get: function() {
                return _dataService;
            }
        }
    };
});

