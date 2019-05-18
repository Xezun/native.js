// native.alert.js

module.exports = require('@mlibai/native.js');

NativeMethod("alert", "alert");

native.extend(function() {

    function _alert(message, callback) {
        return this.performMethod(NativeMethod.alert, message, callback);
    }

    return {
        "alert": {
            get: function() {
                return _alert;
            }
        }
    };

});