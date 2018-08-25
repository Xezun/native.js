// Native.Login.js
// requires Native.js

const NativeMethodLogin = "login";

window.native.extend(function () {
    
    function _login(callback) {
        if (!callback) {
            NTLog("Method `login` called without a callback is not allowed.", NativeLogStyleError);
            return this;
        }
        return window.native.perform(NativeMethodLogin, null, callback);
    }
    
    return {
        login: {
            get: function () {
                return _login;
            }
        }
    };
});