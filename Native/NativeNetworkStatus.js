// NativeNetworkStatus.js

const NativeNetworkStatus = Object.freeze({
	"WiFi": "WiFi"
});

Object.defineProperty(window, "NativeNetworkStatus", {
	get: function() {
		return NativeNetworkStatus;
	}
});

module.exports = NativeNetworkStatus;