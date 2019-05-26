// native.networking.js

import Native from "../../native/js/native.static";
import native from "../../native/js/native";

Native.Method("networking", Object.freeze({
    "http": "networking/http"
}));

const _NativeNetworkStatus = Object.freeze({
    "WiFi": "WiFi"
});
Object.defineProperty(Native, "NetworkStatus", {
    get: function() {
        return _NativeNetworkStatus;
    }
});

native.extend(function(configuration) {

    function _NativeNetworking(_networkingInfo) {

        let _status = _networkingInfo.status;
        let _statusChangeHandlers = [];

        // HTTP 请求
        function _http(request, callback) {
            if (!request || typeof request !== 'object') {
                Native.log("Method `http` first parameter must be an request object.", Native.LogStyle.error);
                return null;
            }
            return native.performMethod(Native.Method.networking.http, request, callback);
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
                    return (_status === _NativeNetworkStatus.WiFi);
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
    const _networking = new _NativeNetworking(networkInfo);

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

export { Native, native };
export default native;