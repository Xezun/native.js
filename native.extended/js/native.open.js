// native.open.js

module.exports = require('../../native/js/native.js');

NativeMethod("open", "open");

global.native.extend(function() {

    function _open(page) {
        if (typeof page !== 'string') {
            NativeLog("Method `open`'s page parameter must be a string value.", NativeLogStyle.error);
            return null;
        }
        return this.performMethod(NativeMethod.open, page);
    }

    return {
        "open": {
            get: function() {
                return _open;
            }
        }
    };
});