// native.present.js

import Native from "../../native/js/native.static";
import native from "../../native/js/native";

Native.Method("present", "present");
Native.Method("dismiss", "dismiss");

native.extend(function() {

    function _present(url, arg1, arg2) {
        if (typeof url !== 'string') {
            Native.log("Method `present` first parameter must be a string value.", Native.LogStyle.error);
            return null;
        }
        let animated = arg1;
        let completion = arg2;
        if (typeof arg1 === 'function') {
            animated = true;
            completion = arg1;
        }
        if (typeof animated !== 'boolean') {
            animated = true;
        }
        return this.performMethod(Native.Method.present, url, animated, completion);
    }

    function _dismiss(arg1, arg2) {
        let animated = arg1;
        let completion = arg2;
        if (typeof arg1 === 'function') {
            animated = true;
            completion = arg1;
        }
        if (typeof animated !== 'boolean') {
            animated = true;
        }
        return this.performMethod(Native.Method.dismiss, animated, completion);
    }

    return {
        "present": {
            get: function() {
                return _present;
            }
        },
        "dismiss": {
            get: function() {
                return _dismiss;
            }
        }
    }

});

export { Native, native };
export default native;