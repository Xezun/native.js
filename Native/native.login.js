// MARK: - login

require("./native.js").extend(function() {
	function _login(callback) {
		if (!callback) {
			Native.log("Method `login` called without a callback is not allowed.", NativeLogStyle.error);
			return this;
		}
		let that = this;
		this.core.perform(NativeMethod.login, function(currentUser) {
			that.setCurrentUser(currentUser);
			callback();
		});
	}
	return {
		"login": {
			get: function() {
				return _login;
			}
		}
	};
});