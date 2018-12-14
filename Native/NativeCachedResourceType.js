// NativeCachedResourceType.js

const NativeCachedResourceType = Object.freeze({
    image: "image"
});


Object.defineProperty(this, "NativeCachedResourceType", {
	get: function() {
		return NativeCachedResourceType;
	}
});


module.exports = NativeCachedResourceType;