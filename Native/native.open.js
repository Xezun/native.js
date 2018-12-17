// native.open.js

const Native = require("./native.static.js");

Native.Method("open", "open");

module.exports = require("./native.js").extend(function() {

    function _open(page) {
        if (typeof page !== 'string') {
            Native.log("Method `open`'s page parameter must be a string value.", Native.LogStyle.error);
            return null;
        }
        return this.core.perform(Native.Method.open, page);
    }

    return {
        "open": {
            get: function() {
                return _open;
            }
        }
    };
});