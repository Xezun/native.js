// index.js

require("./NativeCachedResourceType.js");
require("./NativeCookieKey.js");
require("./NativeCore.js")
require("./NativeLogStyle.js");
require("./NativeMethod.js");
require("./NativeMode.js");
require("./NativeNetworkStatus.js");

require("./native.alert.js");
require("./native.dataService.js");
require("./native.eventService.js");
require("./native.login.js");
require("./native.navigation.js");
require("./native.networking.js");
require("./native.open.js");
require("./native.present.js");
require("./native.theme.js");
require("./native.user.js");
require("./native.js");

// (function(global, name, factory) {
// 	"use strict";
// 	if (typeof exports === 'object' && typeof module !== 'undefined') {
// 		module.exports = factory();
// 	} else if (typeof define === 'function' && (define.amd || define.cmd)) {
// 		define(factory);
// 	} else {
// 		let _object = factory.apply(this);
// 		Object.defineProperty(global, name, {
// 			get: function() {
// 				return _object;
// 			}
// 		});
// 	}
// }(this, "native", function() {
// 	return require("./native.js");
// }));