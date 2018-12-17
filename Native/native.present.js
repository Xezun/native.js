// native.present.js

const Native = require("./native.static.js");

Native.Method("present", "present");
Native.Method("dismiss", "dismiss");

module.exports = require("./native.js").extend(function() {

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
        return this.core.perform(Native.Method.present, url, animated, completion);
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
        return this.core.perform(Native.Method.dismiss, animated, completion);
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