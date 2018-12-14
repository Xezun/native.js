// NativeLogStyle.js

const NativeLogStyle = Object.freeze({
	"default": 0,
	"warning": 1,
	"error": 2
});

Object.defineProperty(window, "NativeLogStyle", {
	get: function() {
		return NativeLogStyle;
	}
});

module.exports = NativeLogStyle;