
// 使用 URL 方式交互。
exports.url = "url";
// 使用安卓 JS 注入原生对象作为代理：函数参数支持基本数据类型，复杂数据使用 JSON 。
exports.json = "json";
// 使用 iOS 注入原生对象作为代理：支持所有类型的数据。
exports.object = "object";
// 调试或者 iOS WebKit 注入 js ，使用函数作为代理。
exports.javascript = "javascript";


/// 与原生交互的方式。
// const NativeMode = (function() {
//     let _NativeMode = Object.freeze({
//         url: "url", // 使用 URL 方式交互。
//         json: "json", // 使用安卓 JS 注入原生对象作为代理：函数参数支持基本数据类型，复杂数据使用 JSON 。
//         object: "object", // 使用 iOS 注入原生对象作为代理：支持所有类型的数据。
//         javascript: "javascript" // 调试或者 iOS WebKit 注入 js ，使用函数作为代理。
//     });
//     _NativeDefineProperty(window, "NativeMode", {
//         get: function() {
//             return _NativeMode;
//         }
//     });
//     _NativeDefineProperty(window, "NativeType", {
//         get: function() {
//             _NativeLog("NativeType was deprecated, please use NativeMode instead.", 1);
//             return _NativeMode;
//         }
//     });
//     return _NativeMode;
// })();