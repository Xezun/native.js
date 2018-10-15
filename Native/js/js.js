// js.js

// Native.js 静态方法。

let date1 = Native.cookie.value("date");
if (date1) {
    Native.log("上次访问日期：" + date1, NativeLogStyle.warning);
}
Native.log("Native Version: " + Native.version, NativeLogStyle.warning);

let date2 = (new Date()).toUTCString();
Native.cookie.value("date", date2);

// native.ready

$.holdReady(true);  // 暂停 JQ
native.ready(function() {
    $.holdReady(false); // 恢复 JQ
    Native.log("native is ready：" + (new Date()).toUTCString());
});

// 业务逻辑：JQ示例

$(function () {
    // 网络请求
    $("#http").click(function () {
        native.http({
            url: "./data.json?rnd="+Math.random(),
            method: "GET",
            headers: {"Custom-Header": "ABCDEFG"},
            data: {}
        }, function (response) {
            let jq = $("#httpDiv");
            for (let i = 0; i < response.data.length; i++) {
                jq.append("<div>" + response.data[i] + "</div>");
            }
        });
    });

    // 点击事件1
    $("#event1").click(function () {
        native.eventService.wasClickedOnElement("EventPage", "ProductSelectButton", {"id": 1234}, function () {
            Native.log("打开商品规格页回调。");
        });
    });

    // 点击事件2
    $("#event2").click(function () {
        native.eventService.wasClickedOnElement("EventPage", "ProductDetailButton", {"id": 5678}, function () {
            Native.log("进入商品详情页页回调。");
        });
    });

    // 埋点事件
    $("#event3").click(function () {
        native.eventService.track("TrackName", {"id": 123});
    });


    $("#open").click(function () {
        native.open("momshop://product?id=1234")
    });

});



// 模拟 App 操作：基于 URL 的操作方式。

native.core.register(function (url) {
    Native.log(url);
    if (url.substr(0, 14) === "native://ready") {
        let id = url.substr(32, 10);
        let cb = native.core.callback(id);
        cb({
            currentTheme: "default",
            currentUser: {
                id: 123,
                name: "John",
                info: {},
                version: 1
            },
            navigation: {
                bar: {
                    title: "Test",
                    titleColor: "#000",
                    isHidden: false,
                    backgroundColor: "#fff"
                }
            },
            networking: {
                status: "WiFi"
            }
        });
    }
}, NativeType.url);

// 模拟 App 操作：JS 环境模拟 App 操作。

// native.core.register(function(method, parameters) {
//     if (method == NativeMethod.ready) {
//
//         Native.log("native 初始化开始：" + (new Date()).toUTCString());
//         // 使用延时来模拟 App 初始化过程。
//         setTimeout(function () {
//             Native.log("native 初始化完成：" + (new Date()).toUTCString());
//             parameters[0]({
//                 currentTheme: "default",
//                 currentUser: {
//                     id: 123,
//                     name: "John",
//                     info: {},
//                     version: 1
//                 },
//                 navigation: {
//                     bar: {
//                         title: "Test",
//                         titleColor: "#000",
//                         isHidden: false,
//                         backgroundColor: "#fff"
//                     }
//                 },
//                 networking: {
//                     status: "WiFi"
//                 }
//             });
//         }, Math.random() * 5000)
//
//     } else if (method === NativeMethod.http) {
//         let request = parameters[0];
//
//         let headers = {
//             "Api-Version": "",
//             "lang": 1,
//             "country": 1876,
//             "currencycode": "SAR",
//             "channel-id": 4,
//             "device-code": "76594ffa5a77276"
//         };
//         if (request.headers) {
//             for (let key in request.headers) {
//                 if (!request.headers.hasOwnProperty(key)) {
//                     continue;
//                 }
//                 headers[key] = request.headers[key];
//             }
//         }
//
//         $.ajax({
//             url: request.url,
//             method: request.method,
//             headers: headers,
//             success: function (data) {
//                 parameters[1](data);
//             },
//             error: function (XMLHttpRequest, textStatus, errorThrown) {
//                 parameters[1]({
//                     code: 1,
//                     message: textStatus
//                 });
//             }
//         })
//
//     } else if (method === NativeMethod.open) {
//         Native.log("Open page: " + parameters[0]);
//     } else if (method === NativeMethod.wasClickedOnElement) {
//         switch (parameters[0]) {
//             case "EventPage":
//                 switch (parameters[1]) {
//                     case "ProductSelectButton":
//                         Native.log("展示商品规格选择页：" + parameters[2].id);
//                         break;
//
//                     case "ProductDetailButton":
//                         Native.log("展示商品详情页：" + parameters[2].id);
//                         break;
//
//                     default: break;
//                 }
//
//                 let callback = parameters[3];
//                 if (callback) {
//                     callback()
//                 }
//                 break;
//
//             case "EventPage2":
//                 break;
//             default:
//                 break;
//         }
//     } else if (method === NativeMethod.track) {
//         Native.log("埋点：" + parameters[0] + " 参数：" + JSON.stringify(parameters[1]));
//     }
// }, NativeType.javascript);