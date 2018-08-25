// Native.DataService.js
// requires Native.js

const NativeMethodCachedResourceForURL = "cachedResourceForURL";
const NativeMethodNumberOfRowsInList = "numberOfRowsInList";
const NativeMethodDataForRowAtIndex = "dataForRowAtIndex";
const NativeCachedResourceTypeImage = "image";

window.native.extend(function () {

    let _nativeCore = this.core;
    
    function _DataService() {
        // 获取 list 的行数。
        // - list: string
        // - callback: (number)=>void
        function _numberOfRowsInList(documentName, listName, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string') {
                NTLog("Method `numberOfRowsInList` first/second parameter must be a string value.", NativeLogStyleError);
                return null;
            }
            return _nativeCore.perform(NativeMethodNumberOfRowsInList, [documentName, listName], callback);
        }
        
        // 加载数据
        // - list: XZAppList
        // - index: number
        // - callback: (data)=>void
        function _dataForRowAtIndex(documentName, listName, index, callback) {
            if (typeof documentName !== 'string' || typeof listName !== 'string' || typeof index !== 'number') {
                NTLog("Method `dataForRowAtIndex` first/second/third parameter must be a string/string/number value.", NativeLogStyleError);
                return null;
            }
            return _nativeCore.perform(NativeMethodDataForRowAtIndex, [documentName, listName, index], callback);
        }
    
        // 获取缓存。
        function _cachedResourceForURL(url, cacheType, completion) {
            // 检查 URL
            if (typeof url !== 'string') {
                NTLog("Method `cachedResourceForURL` url parameter must be a string value.", NativeLogStyleError);
                return null;
            }
            // 检查 cacheType
            switch (typeof cacheType) {
                case 'function':
                    completion = cacheType;
                    cacheType = NativeCachedResourceTypeImage;
                    break;
                case 'string':
                    break;
                default:
                    cacheType = NativeCachedResourceTypeImage;
                    break;
            }
            // 检查 handler
            if (typeof completion !== 'function') {
                NTLog("Method `cachedResourceForURL` must have a callback handler.", NativeLogStyleError);
                return null;
            }
            return _nativeCore.perform(NativeMethodCachedResourceForURL, [url, cacheType], completion);
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