// native.js
// exports native.

const Native = require("./native.static.js");

const native = new Native();

Native.defineProperty(window, "native", {
	get: function() {
		return native;
	}
});

module.exports = native;

