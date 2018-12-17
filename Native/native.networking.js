// native.networking.js

const Native = require("./native.static.js");

Native.Method("networking", Object.freeze({
    "http": "networking/http"
}));

const NativeNetworkStatus = Object.freeze({
    "WiFi": "WiFi"
});

Native.defineProperty(window, "NativeNetworkStatus", {
    get: function() {
        return NativeNetworkStatus;
    }
});

module.exports = require("./native.js").extend(function(configuration) {

    function NativeNetworking(_native, _networkingInfo) {

        let _status = _networkingInfo.status;
        let _statusChangeHandlers = [];

        // HTTP 请求
        function _http(request, callback) {
            if (!request || typeof request !== 'object') {
                Native.log("Method `http` first parameter must be an request object.", Native.LogStyle.error);
                return null;
            }
            return _native.core.perform(Native.Method.networking.http, request, callback);
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

        Native.defineProperties(this, {
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

    let _networking = new NativeNetworking(this, configuration.networking);

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