// native.alert.js

require("./native.js").extend(function() {

    function _alert(message, callback) {
        if (!message || typeof message !== 'object') {
            Native.log("Method `alert` first parameter must be an message object.", NativeLogStyle.error);
            return null;
        }
        return this.core.perform(NativeMethod.alert, message, callback);
    }

    return {
        "alert": {
            get: function() {
                return _alert;
            }
        }
    };

});