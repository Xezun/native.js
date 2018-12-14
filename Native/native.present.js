// native.present.js

require("./native.js").extend(function() {

    function _present(url, arg1, arg2) {
        if (typeof url !== 'string') {
            NativeCore.log("Method `present` first parameter must be a string value.", NativeLogStyle.error);
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
        return this.core.perform(NativeMethod.present, url, animated, completion);
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
        return this.core.perform(NativeMethod.dismiss, animated, completion);
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