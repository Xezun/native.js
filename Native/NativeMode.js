// NativeMode.js

const NativeMode = Object.freeze({
    url: "url", // 使用 URL 方式交互。
    json: "json", // 使用安卓 JS 注入原生对象作为代理：函数参数支持基本数据类型，复杂数据使用 JSON 。
    object: "object", // 使用 iOS 注入原生对象作为代理：支持所有类型的数据。
    javascript: "javascript" // 调试或者 iOS WebKit 注入 js ，使用函数作为代理。
});

Object.defineProperty(window, "NativeMode", {
	get: function() {
		return NativeMode;
	}
});

Object.defineProperty(window, "NativeType", {
	get: function() {
		console.warn("NativeType was deprecated, please use NativeMode instead.");
		return NativeMode;
	}
});

module.exports = NativeMode;
