// native.open.js

import Native from "../../native/js/native.static";
import native from "../../native/js/native";

Native.Method("open", "open");

native.extend(function() {

    function _open(page) {
        if (typeof page !== 'string') {
            Native.log("Method `open`'s page parameter must be a string value.", Native.LogStyle.error);
            return null;
        }
        return this.performMethod(Native.Method.open, page);
    }

    return {
        "open": {
            get: function() {
                return _open;
            }
        }
    };
});


export { Native, native };
export default native;