// native.login.js
// requires native.js

window.native.extend(function () {
    
    function _login(callback) {
        if (!callback) {
            Native.log("Method `login` called without a callback is not allowed.", NativeLogStyle.error);
            return this;
        }
        return this.core.perform(NativeMethod.login, null, callback);
    }
    
    return {
        login: {
            get: function () {
                return _login;
            }
        }
    };
});