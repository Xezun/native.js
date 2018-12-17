// MARK: - login

const Native = require("./native.static.js");

Native.Method("login", "login");

module.exports = require("./native.user.js").extend(function() {

	function _login(callback) {
		if (!callback) {
			Native.log("Method `login` called without a callback is not allowed.", Native.LogStyle.error);
			return this;
		}
		let that = this;
		this.core.perform(Native.Method.login, function(currentUser) {
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