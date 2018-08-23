// XZNative

import {XZLog, XZURLQuery} from './XZNative.Log.js'

export * from './XZNative.Log.js'

/// 使用 URL 方式交互。
export const XZ_DATA_URL = 0;
/// 使用代理，但是基本数据类型和 JSON 数据进行交互。
export const XZ_DATA_JSON = 1;
/// 代理使用对象进行交互。
export const XZ_DATA_OBJECT = 2;
/// 代理为函数。
export const XZ_DATA_FUNCTION = 3;

// ready 方法用于需要在 AppCore 初始化后执行的操作。
// 而 delegate 决定了 AppCore 是否能够进行初始化，因此设置 delegate 需要先执行。

export const XZ_METHOD_READY = "ready";


export const native = (function() {
    
    let _native = new _XZNative();
    
    Object.defineProperty(window, "native", {
        get: function () {
            return _native;
        }
    });
    
    return _native;
})();


function _XZNative() {
    
    let _callbackID     = 10000000;
    let _callbacks      = {};
    
    /**
     * 注册一个 callback ，并返回其 ID ，如果 callback 不合法，返回 null 。
     * @param callback
     * @return {*}
     * @private
     */
    function _dispatch(callback) {
        if (!callback || (typeof callback !== 'function')) {
            return null;
        }
        let uniqueID = "XZ" + (_callbackID++);
        _callbacks[uniqueID] = callback;
        return uniqueID;
    }
    
    /**
     * 执行指定 callbackID 对应的回调函数。
     * 除第一个参数外，其他参数将作为回调函数的参数。
     * @param callbackID 回调函数ID。
     * @return {*} 回调函数的返回值。
     * @private
     */
    function _execute(callbackID) {
        if (!callbackID || typeof callbackID !== "string") {
            return;
        }
        if (!_callbacks.hasOwnProperty(callbackID)) {
            return;
        }
        let callback = _callbacks[callbackID];
        delete _callbacks[callbackID];
        if (!callback) {
            return;
        }
        if (typeof callback !== 'function') {
            return;
        }
        let parameters = [];
        for (let i = 1; i < arguments.length; i++) {
            parameters.push(arguments[i]);
        }
        return callback.apply(window, parameters);
    }
    
    Object.defineProperty(this, "execute", {
        get: function () {
            return _execute;
        }
    });
    
    
    
    
    /**
     * 删除一个已保存的回调函数。
     * @param callbackID 回调函数的ID。
     * @private
     */
    function _remove(callbackID) {
        if (!callbackID || !_callbacks.hasOwnProperty(callbackID)) {
            return;
        }
        delete _callbacks[callbackID];
        return this;
    }
    
    Object.defineProperty(this, "remove", {
        get: function () {
            return _remove;
        }
    });
    
    /// 交互的数据类型。
    let _dataType = XZ_DATA_URL;
    let _delegate = null;
    
    /**
     * 调用 App 方法。
     * @param method App 方法。
     * @param parameters 方法参数。
     * @param callback 回调函数
     * @private
     */
    function _call(method, parameters, callback) {
        switch (_dataType) {
            case XZ_DATA_URL:
                return _performByURL(method, parameters, callback);
            case XZ_DATA_JSON:
                return _performByJSON(method, parameters, callback);
            case XZ_DATA_OBJECT:
                return _performByObject(method, parameters, callback);
            case XZ_DATA_FUNCTION:
                return _performByFunction(method, parameters, callback);
            default:
                return XZLog("调用原生 App 方法失败，无法确定原生App可接受的数据类型。", XZ_LOG_ERROR);
        }
    }
    
    Object.defineProperty(this, "call", {
        get: function () {
            return _call;
        }
    });
    
    
    // 代理是函数。
    function _performByFunction(method, parameters, callback) {
        let callbackID = _dispatch(callback);
        window.setTimeout(function () {
            _delegate(method, parameters, callbackID);
        });
        return callbackID;
    }
    
    // 安卓对象可以接收基本数据类型。
    function _performByJSON(method, parameters, callback) {
        let _arguments = [];
        if (Array.isArray(parameters) && parameters.length > 0) {
            for (let i = 0; i < parameters.length; i += 1) {
                let value = parameters[i];
                switch (typeof value) {
                    case 'number':
                    case 'string':
                    case 'boolean':
                        _arguments.push(value);
                        break;
                    default:
                        _arguments.push(JSON.stringify(value));
                        break;
                }
            }
        }
        let callbackID = _dispatch(callback);
        if (callbackID) {
            _arguments.push(callbackID);
        }
        window.setTimeout(function () {
            _delegate[method].apply(window, _arguments);
        });
        return callbackID;
    }
    
    // 能接收任意数据类型的对象。
    function _performByObject(method, parameters, callback) {
        let _arguments = [];
        if (Array.isArray(parameters)) {
            for (let i = 0; i < parameters.length; i++) {
                _arguments.push(parameters[i]);
            }
        }
        let callbackID = _dispatch(callback);
        if (callbackID) {
            _arguments.push(function () {
                let parameters = [callbackID];
                for (let i = 0; i < arguments.length; i++) {
                    parameters.push(arguments[i]);
                }
                _execute.apply(window, parameters);
            });
        }
        window.setTimeout(function () {
            _delegate[method].apply(window, _arguments);
        });
        return callbackID;
    }
    
    // 没有代理，使用 URL 。
    function _performByURL(method, parameters, callback) {
        let url = "app://" + method;
        
        if (!Array.isArray(parameters)) {
            parameters = [];
        }
        
        let callbackID = _dispatch(callback);
        
        if (callbackID) {
            parameters.push(callbackID);
        }
        
        let queryString = XZURLQuery(parameters);
        if (queryString) {
            url += ("?arguments=" + queryString);
        }
        
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('src', url);
        document.body.appendChild(iframe);
        window.setTimeout(function () {
            document.body.removeChild(iframe);
        }, 2000);
        
        return callbackID;
    }
    
    let _isReady = false;
    let _readyID = null;
    
    let _extensions = [];
    let _readies = [];
    
    let _configuration = null;
    
    /**
     * 启动服务。
     * @param delegate 代理对象。
     * @param dataType 代理可接收的数据类型。
     * @private
     */
    function _startService(delegate, dataType) {
        _delegate = delegate;
        _dataType = dataType;
        // 如果已经初始化，则不再初始化，仅仅是改变代理。
        if (_isReady) {
            return this;
        }
        // 删除已经发起的 ready 事件。
        if (!!_readyID) {
            _remove(_readyID);
        }
        // 当前对象。
        let that = this;
        // 在 document.ready 之后执行，以避免 App 可能无法接收事件的问题。
        $(document).ready(function () {
            _readyID = _call(XZ_METHOD_READY, dataType, function (configuration) {
                _isReady = true;
                _configuration = configuration;
                // 加载拓展。
                while (_extensions.length > 0) {
                    let callback = _extensions.shift();
                    Object.defineProperties(that, callback(_configuration));
                }
                // 执行 ready 。
                while (_readies.length > 0) {
                    (_readies.shift()).apply(window);
                }
            });
        });
        return this;
    }
    
    Object.defineProperty(this, "startService", {
        get: function () {
            return _startService;
        }
    });
    
    /**
     * 绑定 ready 之后执行的操作。
     * @param callback
     * @return {_ready}
     * @private
     */
    function _ready(callback) {
        // 如果 App 已经初始化，则异步执行 callback。
        if (_isReady) {
            window.setTimeout(callback);
            return this;
        }
        _readies.push(callback);
        return this;
    }
    
    Object.defineProperty(this, "ready", {
        get: function () {
            return _ready;
        }
    });
    
    /**
     * 拓展 AppCore 的方法。
     * @param callback
     * @return {_extend}
     * @private
     */
    function _extend(callback) {
        if (typeof callback !== 'function') {
            return this;
        }
        if (_isReady) {
            Object.defineProperties(this, callback(_configuration));
        } else {
            _extensions.push(callback);
        }
        return this;
    }
    
    Object.defineProperty(this, "extend", {
        get: function () {
            return _extend;
        }
    });
    
}