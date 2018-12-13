exports.ready = "ready";
exports.alert = "alert";
exports.dataService = Object.freeze({
    cachedResourceForURL: "dataService/cachedResourceForURL",
    numberOfRowsInList: "dataService/numberOfRowsInList",
    dataForRowAtIndex: "dataService/dataForRowAtIndex"
});
exports.eventService = Object.freeze({
    track: "eventService/track",
    documentElementWasClicked: "eventService/documentElementWasClicked",
    documentElementDidSelect: "eventService/documentElementDidSelect"
});
exports.login = "login";
exports.navigation = Object.freeze({
    push: "navigation/push",
    pop: "navigation/pop",
    popTo: "navigation/popTo",
    bar: Object.freeze({
        setHidden: "navigation/bar/setHidden",
        setTitle: "navigation/bar/setTitle",
        setTitleColor: "navigation/bar/setTitleColor",
        setBackgroundColor: "navigation/bar/setBackgroundColor"
    })
});
exports.networking = Object.freeze({
    http: "networking/http"
});
exports.open = "open";
exports.present = "present";
exports.dismiss = "dismiss";
exports.setCurrentTheme = "setCurrentTheme";

// /// 通用的原生支持的方法。
// const NativeMethod = (function() {
//     let _NativeMethod = Object.freeze({
//         ready: "ready",
//         alert: "alert",
//         dataService: Object.freeze({
//             cachedResourceForURL: "dataService/cachedResourceForURL",
//             numberOfRowsInList: "dataService/numberOfRowsInList",
//             dataForRowAtIndex: "dataService/dataForRowAtIndex"
//         }),
//         eventService: Object.freeze({
//             track: "eventService/track",
//             documentElementWasClicked: "eventService/documentElementWasClicked",
//             documentElementDidSelect: "eventService/documentElementDidSelect"
//         }),
//         login: "login",
//         navigation: Object.freeze({
//             push: "navigation/push",
//             pop: "navigation/pop",
//             popTo: "navigation/popTo",
//             bar: Object.freeze({
//                 setHidden: "navigation/bar/setHidden",
//                 setTitle: "navigation/bar/setTitle",
//                 setTitleColor: "navigation/bar/setTitleColor",
//                 setBackgroundColor: "navigation/bar/setBackgroundColor"
//             })
//         }),
//         networking: Object.freeze({
//             http: "networking/http"
//         }),
//         open: "open",
//         present: "present",
//         dismiss: "dismiss",
//         setCurrentTheme: "setCurrentTheme"
//     });
//     _NativeDefineProperty(window, "NativeMethod", {
//         get: function() {
//             return _NativeMethod;
//         }
//     });
//     return _NativeMethod;
// })();