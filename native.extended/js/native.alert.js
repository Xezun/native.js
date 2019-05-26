// native.alert.js

import Native from "../../native/js/native.static";
import native from "../../native/js/native";

Native.Method("alert", "alert");

native.extend(function() {

    /**
     * 
     * @param {object} message Message
     * @param {function} callback 回调
     */
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

export { Native, native };
export default native;