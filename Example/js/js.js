// js.js

// Native.js 静态方法。

let date1 = window.NativeCore.cookie.value("date");
if (date1) {
    NativeCore.log("上次访问日期：" + date1);
}
NativeCore.log("Native Version: " + NativeCore.version);

let date2 = (new Date()).toUTCString();
NativeCore.cookie.value("date", date2);

// NativeCore.ready

$.holdReady(true);  // 暂停 JQ
native.ready(function() {
    $.holdReady(false); // 恢复 JQ
    NativeCore.log("native is ready：" + (new Date()).toUTCString());
});

// 业务逻辑：JQ示例

$(function () {

    console.log(NativeCore.currentUser.name);

    // 网络请求
    $("#http").click(function () {
        NativeCore.http({
            url: "./dat/data.json?rnd="+Math.random(),
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
        NativeCore.eventService.documentElementWasClicked("EventPage", "ProductSelectButton", {"id": 1234}, function () {
            NativeCore.log("打开商品规格页回调。");
        });
    });

    // 点击事件2
    $("#event2").click(function () {
        NativeCore.eventService.documentElementWasClicked("EventPage", "ProductDetailButton", {"id": 5678}, function () {
            NativeCore.log("进入商品详情页页回调。");
        });
    });

    // 埋点事件
    $("#event3").click(function () {
        NativeCore.navigation.bar.title = "Navig";
        NativeCore.eventService.track("ItemClick", {"id": 123});
    });

    $("#delegate").change(function () {
        setDelegate($(this).val());
    });

    
    NativeCore.dataService.cachedResourceForURL("http://www.baidu.com/image.png", "image", function (cachePath) {
        
    });
    
    NativeCore.currentThemeChange(function () {
        
    })

    NativeCore.currentUserChange(function () {
        
    });

    NativeCore.log(NativeCore.parseURLQuery({"name": "John", "age": 12, "school": "Best One"}));

});







// JS 模拟 App 操作

setDelegate("javascript");

function setDelegate(type) {
    switch (type) {
        case "url":
            // 模拟 App 操作：基于 URL 的操作方式。
            native.core.register(function (url) {
                NativeCore.log(url);
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
            }, NativeMode.url);
            break;

        case "javascript":
            // 模拟 App 操作：JS 环境模拟 App 操作。
            native.core.register(function(method, parameters) {
                let methods = method.split("/");
                switch (methods[0]) {
                    case "ready":
                        NativeCore.log("App 已完成初始化！", NativeLogStyle.warning);
                        let callback = native.core.callback(parameters[0]);
                        callback({
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
                        break;

                    case "networking":
                        let request = parameters[0];
                        let headers = {
                            "Api-Version": "",
                            "lang": 1,
                            "country": 1876,
                            "currencyCode": "SAR",
                            "channel-id": 4,
                            "device-code": "76594ffa5a77276"
                        };
                        if (request.headers) {
                            for (let key in request.headers) {
                                if (!request.headers.hasOwnProperty(key)) {
                                    continue;
                                }
                                headers[key] = request.headers[key];
                            }
                        }
                        $.ajax({
                            url: request.url,
                            method: request.method,
                            headers: headers,
                            success: function (data) {
                                window.native.core.callback(parameters[1])(data);
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                window.native.core.callback(parameters[1])({
                                    code: 1,
                                    message: textStatus
                                });
                            }
                        });
                        NativeCore.log("App 执行网络请求：" + request.url, NativeLogStyle.warning);
                        break;

                    case "eventService":
                        switch (methods[1]) {
                            case "documentElementWasClicked":
                                switch (parameters[0]) {
                                    case "EventPage":
                                        switch (parameters[1]) {
                                            case "ProductSelectButton":
                                                NativeCore.log("App 展示商品规格选择页：" + parameters[2].id, NativeLogStyle.warning);
                                                break;

                                            case "ProductDetailButton":
                                                NativeCore.log("App 展示商品详情页：" + parameters[2].id, NativeLogStyle.warning);
                                                break;

                                            default: break;
                                        }

                                        let callback = window.native.core.callback(parameters[3]);
                                        if (callback) {
                                            callback()
                                        }
                                        break;

                                    case "EventPage2":
                                        break;
                                    default:
                                        break;
                                }
                                break;
                            case "track":
                                NativeCore.log("App 执行埋点操作：" + parameters[0] + "(" + JSON.stringify(parameters[1]) + ")", NativeLogStyle.warning);
                                break;
                            default: break;
                        }

                    case "dataService": break

                    default: break;
                }
            }, window.NativeMode.javascript);

            break;
        default: break;
    }
}