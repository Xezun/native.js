// native.open.js
// requires native.js

window.native.extend(function () {
    
    function _open(page, parameters) {
        if (typeof page !== 'string') {
            Native.log("Method `open`'s page parameter must be a string value.", NativeLogStyle.error);
            return null;
        }
        let _arguments = [page];
        if (parameters) {
            _arguments.push(parameters);
        }
        return this.core.perform(NativeMethod.open, _arguments);
    }
    
    return {
        open: {
            get: function () {
                return _open;
            }
        }
    };
});


window.native.extend(function () {
    
    function _present(url, arg1, arg2) {
        if (typeof url !== 'string') {
            Native.log("Method `present` first parameter must be a string value.", NativeLogStyle.error);
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
        return this.core.perform(NativeMethod.present, [url, animated], completion);
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
        return this.core.perform(NativeMethod.dismiss, [animated], completion);
    }
    
    return {
        present: {
            get: function () {
                return _present;
            }
        },
        dismiss: {
            get: function () {
                return _dismiss;
            }
        }
    }
    
});