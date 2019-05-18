// native.networking.js

module.exports = require('../../native/js/native.js');

NativeMethod("networking", Object.freeze({
    "http": "networking/http"
}));

const NativeNetworkStatus = Object.freeze({
    "WiFi": "WiFi"
});
Object.defineProperty(global, "NativeNetworkStatus", {
    get: function() {
        return NativeNetworkStatus;
    }
});

global.native.extend(function(configuration) {

    function _NativeNetworking(_networkingInfo) {

        let _status = _networkingInfo.status;
        let _statusChangeHandlers = [];

        // HTTP 请求
        function _http(request, callback) {
            if (!request || typeof request !== 'object') {
                NativeLog("Method `http` first parameter must be an request object.", NativeLogStyle.error);
                return null;
            }
            return global.native.performMethod(NativeMethod.networking.http, request, callback);
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
            "isViaWiFi": {
                get: function() {
                    return (_status === NativeNetworkStatus.WiFi);
                }
            },
            "status": {
                get: function() {
                    return _status;
                }
            },
            "isReachable": {
                get: function() {
                    return !!_status
                }
            },
            "statusChange": {
                get: function() {
                    return _statusChange;
                }
            },
            "http": {
                get: function() {
                    return _http;
                }
            },
            "setStatus": {
                get: function() {
                    return _setStatus;
                }
            }
        });
    }

    let networkInfo = configuration.networking;
    if ( !networkInfo ) {
        networkInfo = { "status": "Unknown" };
    }
    let _networking = new _NativeNetworking(networkInfo);

    return {
        "networking": {
            get: function() {
                return _networking;
            }
        },
        "http": {
            get: function() {
                return _networking.http;
            }
        }
    };
});