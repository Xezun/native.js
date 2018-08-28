// Native.Alert.js
// requires Native.js

const NativeMethodAlert = "alert";

window.native.extend(function () {
    
    function _alert(message, callback) {
        if (!message || typeof message !== 'object') {
            NativeLog("Method `alert` first parameter must be an message object.", NativeLogStyleError);
            return null;
        }
        return this.core.perform(NativeMethodAlert, [message], callback);
    }
    
    return {
        'alert': {
            get: function () {
                return _alert;
            }
        }
    };
});