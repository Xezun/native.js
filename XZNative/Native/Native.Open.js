// Native.Open.js
// requires Native.js

const NativeMethodOpen = "open";

window.native.extend(function () {
    
    function _open(page, parameters) {
        if (typeof page !== 'string') {
            NLog("Method `open`'s page parameter must be a XZApp.Page value.", NativeLogStyleError);
            return null;
        }
        let _arguments = [page];
        if (parameters) {
            _arguments.push(parameters);
        }
        return window.native.perform(NativeMethodOpen, _arguments);
    }
    
    return {
        open: {
            get: function () {
                return _open;
            }
        }
    };
});