// NativeCachedResourceType.js

const NativeCachedResourceType = Object.freeze({
    image: "image"
});


Object.defineProperty(window, "NativeCachedResourceType", {
	get: function() {
		return NativeCachedResourceType;
	}
});


module.exports = NativeCachedResourceType;