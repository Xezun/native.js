// js.js

import $ from "jquery"
import { Native, native } from "../../../native.extended/js/native.extended"

function log(message, style) {
    Native.log((new Date()).valueOf() + " " + message, style);
}

log("上次访问日期：" + Native.cookie.value("date"));
Native.cookie.value("date", (new Date()) + "");

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

    native.performMethod("nativeMethod1", "method1_arg1", "method1_arg2", function() {
        log("nativeMethod1 callback executed!");
    });

    native.addActionTarget("nativeAction1", function(arg1) {
        log("nativeAction1 was called with " + arg1);
    });

    $("#http").click(function () {
        native.http({
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
        native.eventService.documentElementWasClicked("EventPage", "ProductSelectButton", {"id": 1234}, function () {
            log("打开商品规格页回调。");
        });
    });

    // 点击事件2
    $("#event2").click(function () {
        native.eventService.documentElementWasClicked("EventPage", "ProductDetailButton", {"id": 5678}, function () {
            log("进入商品详情页页回调。");
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
        log("The nameChange: " + newName);
    });
    
    native.dataService.cachedResourceForURL("http://www.baidu.com/image.png", "image", function (cachePath) {
        
    });
    
    native.currentThemeChange(function () {
        
    })

    native.currentUserChange(function () {
        
    });

    log(Native.parseURLQuery({"name": "John", "age": 12, "school": "Best One"}));

});







// JS 模拟 App 操作

setDelegate(Native.Mode.javascript);

function setDelegate(type) {

    const configuration = {
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
    };

    switch (type) {
        case Native.Mode.url:
            // 模拟 App 操作：基于 URL 的操作方式。
            native.ready(function(){
                log(url);
            }, Native.Mode.url, configuration);
            break;

        case Native.Mode.javascript:
            // 模拟 App 操作：JS 环境模拟 App 操作。
            native.ready(function(method, parameters) {
                let methods = method.split("/");
                switch (methods[0]) {
                    case "ready":
                        log("The document is ready!", Native.LogStyle.warning);
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
                                native.callback(parameters[1])(data);
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                native.callback(parameters[1])({
                                    code: 1,
                                    message: textStatus
                                });
                            }
                        });
                        log("App 执行网络请求：" + request.url, Native.LogStyle.warning);
                        break;

                    case "eventService":
                        switch (methods[1]) {
                            case "documentElementWasClicked":
                                switch (parameters[0]) {
                                    case "EventPage":
                                        switch (parameters[1]) {
                                            case "ProductSelectButton":
                                                log("App 展示商品规格选择页：" + parameters[2].id, Native.LogStyle.warning);
                                                break;

                                            case "ProductDetailButton":
                                                log("App 展示商品详情页：" + parameters[2].id, Native.LogStyle.warning);
                                                break;

                                            default: break;
                                        }

                                        let callback = native.callback(parameters[3]);
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
                                log("App 执行埋点操作：" + parameters[0] + "(" + JSON.stringify(parameters[1]) + ")", Native.LogStyle.warning);
                                break;
                            default: break;
                        }

                    case "dataService": break

                    default: break;
                }
            }, Native.Mode.javascript, configuration);
            break;

        default: 
            break;
    }

    log("已注册 native 代理和交互方式：");
}