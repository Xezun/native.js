// js.js

const $ = require("jquery");
const native = require("@mlibai/native.js");

function log(message, style) {
    NativeLog((new Date()).valueOf() + " " + message, style);
}

log("上次访问日期：" + window.native.cookie.value("date"));
native.cookie.value("date", (new Date()) + "");

$.holdReady(true);  // 暂停 JQ
log("JQ 已暂停");

native.ready(function() {
    log("native.ready 执行：");
    $.holdReady(false); // 恢复 JQ
    log("JQ 已恢复");
});
log("已注册 native.ready 事件：");

// 业务逻辑：JQ示例

$(function () {
    log("JQ.ready 已执行！");

    native.perfromMethod("nativeMethod1", "method1_arg1", "method1_arg2", function() {
        log("nativeMethod1 callback executed!");
    });

    native.addActionTarget("nativeAction1", function(arg1) {
        log("nativeAction1 was called with " + arg1);
    });


    // 点击事件1
    $("#event1").click(function () {
        native.eventService.documentElementWasClicked("EventPage", "ProductSelectButton", {"id": 1234}, function () {
            NativeLog("打开商品规格页回调。");
        });
    });

    // 点击事件2
    $("#event2").click(function () {
        native.eventService.documentElementWasClicked("EventPage", "ProductDetailButton", {"id": 5678}, function () {
            NativeLog("进入商品详情页页回调。");
        });
    });

    // 埋点事件
    $("#event3").click(function () {
        native.navigation.bar.title = "Navig";
        native.eventService.track("ItemClick", {"id": 123});
    });

    $("#delegate").change(function () {
        setDelegate($(this).val());
    });

    native.addActionTarget("nameChange", function(newName) {
        NativeLog("The nameChange: " + newName);
    });
    
    native.dataService.cachedResourceForURL("http://www.baidu.com/image.png", "image", function (cachePath) {
        
    });
    
    native.currentThemeChange(function () {
        
    })

    native.currentUserChange(function () {
        
    });

    NativeLog(NativeParseURLQuery({"name": "John", "age": 12, "school": "Best One"}));

});







// JS 模拟 App 操作

setDelegate("javascript");

function setDelegate(type) {
    switch (type) {
        case "url":
            // 模拟 App 操作：基于 URL 的操作方式。
            native.register(function (url) {
                NativeLog(url);
                if (url.substr(0, 14) === "native://ready") {
                    let id = url.substr(32, 10);
                    let cb = native.callback(id);
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
            native.register(function(method, parameters) {
                let methods = method.split("/");
                switch (methods[0]) {
                    case "ready":
                        NativeLog("App 已完成初始化！", NativeLogStyle.warning);
                        let callback = native.callback(parameters[0]);
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
                                window.native.callback(parameters[1])(data);
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                window.native.callback(parameters[1])({
                                    code: 1,
                                    message: textStatus
                                });
                            }
                        });
                        NativeLog("App 执行网络请求：" + request.url, NativeLogStyle.warning);
                        break;

                    case "eventService":
                        switch (methods[1]) {
                            case "documentElementWasClicked":
                                switch (parameters[0]) {
                                    case "EventPage":
                                        switch (parameters[1]) {
                                            case "ProductSelectButton":
                                                NativeLog("App 展示商品规格选择页：" + parameters[2].id, NativeLogStyle.warning);
                                                break;

                                            case "ProductDetailButton":
                                                NativeLog("App 展示商品详情页：" + parameters[2].id, NativeLogStyle.warning);
                                                break;

                                            default: break;
                                        }

                                        let callback = window.native.callback(parameters[3]);
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
                                NativeLog("App 执行埋点操作：" + parameters[0] + "(" + JSON.stringify(parameters[1]) + ")", NativeLogStyle.warning);
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

    NativeLog("已注册 native 代理和交互方式：");
}