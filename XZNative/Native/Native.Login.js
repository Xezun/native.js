// Native.Login.js
// requires Native.js

const NativeMethodLogin = "login";

window.native.extend(function () {
    
    function _login(callback) {
        if (!callback) {
            NativeLog("Method `login` called without a callback is not allowed.", NativeLogStyleError);
            return this;
        }
        return this.core.perform(NativeMethodLogin, null, callback);
    }
    
    return {
        login: {
            get: function () {
                return _login;
            }
        }
    };
});