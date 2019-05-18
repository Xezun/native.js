// native.alert.js

module.exports = require("./native.js");

NativeMethod("alert", "alert");

native.extend(function() {

    function _alert(message, callback) {
        return this.performMethod(Native.Method.alert, message, callback);
    }

    return {
        "alert": {
            get: function() {
                return _alert;
            }
        }
    };

});