// native.present.js

module.exports = require("./native.js");

NativeMethod("present", "present");
NativeMethod("dismiss", "dismiss");

global.native.extend(function() {

    function _present(url, arg1, arg2) {
        if (typeof url !== 'string') {
            NativeLog("Method `present` first parameter must be a string value.", NativeLogStyle.error);
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
        return this.performMethod(NativeMethod.present, url, animated, completion);
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
        return this.performMethod(NativeMethod.dismiss, animated, completion);
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