// native.dataService.js
// requires native.js

const NativeCachedResourceType = Object.freeze({
    image: "image"
});

window.native.extend(function () {

    let _nativeCore = this.core;
    
    function _DataService() {
        // 获取 list 的行数。
        // - list: string
        // - callback: (number)=>void
        function _numberOfRowsInList(documentName, listName, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string') {
                Native.log("Method `numberOfRowsInList` first/second parameter must be a string value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.numberOfRowsInList, [documentName, listName], callback);
        }
        
        // 加载数据
        // - list: XZAppList
        // - index: number
        // - callback: (data)=>void
        function _dataForRowAtIndex(documentName, listName, index, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string' || typeof index !== 'number') {
                Native.log("Method `dataForRowAtIndex` first/second/third parameter must be a string/string/number value.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.dataForRowAtIndex, [documentName, listName, index], callback);
        }
    
        // 获取缓存。
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
                Native.log("Method `cachedResourceForURL` must have a callback handler.", NativeLogStyle.error);
                return null;
            }
            return _nativeCore.perform(NativeMethod.cachedResourceForURL, [url, cacheType], completion);
        }
        
        Object.defineProperties(this, {
            numberOfRowsInList: {
                get: function () {
                    return _numberOfRowsInList;
                }
            },
            dataForRowAtIndex: {
                get: function () {
                    return _dataForRowAtIndex;
                }
            },
            cachedResourceForURL: {
                get: function () {
                    return _cachedResourceForURL;
                }
            }
        });
    }
    
    let _dataService = new _DataService();
    
    return {
        dataService: {
            get: function () {
                return _dataService;
            }
        }
    };
});