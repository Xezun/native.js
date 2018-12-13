
module.exports = function(callback) {
    if (!callback) {
        NativeCore.log("Method `login` called without a callback is not allowed.", NativeLogStyle.error);
        return this;
    }
    let that = this;
    this.core.perform(NativeMethod.login, function(currentUser) {
        that.setCurrentUser(currentUser);
        callback();
    });
}