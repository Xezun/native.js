// NativeNetworkStatus.js

const NativeNetworkStatus = Object.freeze({
	"WiFi": "WiFi"
});

Object.defineProperty(this, "NativeNetworkStatus", {
	get: function() {
		return NativeNetworkStatus;
	}
});

module.exports = NativeNetworkStatus;