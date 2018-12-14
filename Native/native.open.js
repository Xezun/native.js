// native.open.js

require("./native.js").extend(function() {

    function _open(page) {
        if (typeof page !== 'string') {
            Native.log("Method `open`'s page parameter must be a string value.", NativeLogStyle.error);
            return null;
        }
        return this.core.perform(NativeMethod.open, page);
    }

    return {
        "open": {
            get: function() {
                return _open;
            }
        }
    };
});