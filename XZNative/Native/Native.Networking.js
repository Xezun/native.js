// Native.Networking.js
// requires Native.js


const NativeMethodHTTP = "http";
const NativeNetworkStatusWiFi = "WiFi";

window.native.extend(function (AppInfo) {
    
    function _Networking(NetworkingInfo) {
        
        let _status = NetworkingInfo.status;
        let _statusChangeHandlers = [];
        
        // HTTP 请求
        function _http(request, callback) {
            if (!request || typeof request !== 'object') {
                NTLog("Method `http` first parameter must be an request object.", NativeLogStyleError);
                return null;
            }
            return window.native.perform(NativeMethodHTTP, [request], callback);
        }
        
        // 网络状态监听。
        function _statusChange(callback) {
            if (typeof callback === "function") {
                _statusChangeHandlers.push(callback);
                return this;
            }
            for (let i = 0; i < _statusChangeHandlers.length; i++) {
                _statusChangeHandlers[i].call(window);
            }
        }
        
        // 供 App 切换状态
        function _setStatus(newValue) {
            _status = newValue;
            _statusChange();
        }
        
        Object.defineProperties(this, {
            isViaWiFi: {
                get: function () {
                    return (_status === NativeNetworkStatusWiFi);
                }
            },
            status: {
                get: function () {
                    return _status;
                }
            },
            isReachable: {
                get: function () {
                    return !!_status
                }
            },
            statusChange: {
                get: function () {
                    return _statusChange;
                }
            },
            http: {
                get: function () {
                    return _http;
                }
            },
            setStatus: {
                get: function () {
                    return _setStatus;
                }
            }
        });
    }
    
    let _networking = new _Networking(AppInfo.networking);
    
    return {
        "networking": {
            get: function () {
                return _networking;
            }
        },
        "http": {
            get: function () {
                return _networking.http;
            }
        }
    };
});