// native.alert.js

const Native = require("./native.static.js");

Native.Method("alert", "alert");

module.exports = require("./native.js").extend(function() {

    function _alert(message, callback) {
        return this.core.perform(Native.Method.alert, message, callback);
    }

    return {
        "alert": {
            get: function() {
                return _alert;
            }
        }
    };

});