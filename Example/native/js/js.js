// js.js

import $ from "jquery";
import Native from "../../../native/js/native.static"
import native from "../../../native/js/native"


function log(message, style) {
    Native.log((new Date()).valueOf() + " " + message, style);
}

log("上次访问日期：" + Native.cookie.value("date"));
Native.cookie.value("date", (new Date()) + "");

$.holdReady(true); // 暂停 JQ
log("JQ 已暂停");

native.ready(function() {
    log("native.ready 执行：");
    $.holdReady(false); // 恢复 JQ
    log("JQ 已恢复");
});
log("已注册 native.ready 事件！");

// 业务逻辑：JQ示例

Native.Method("customMethod", "customMethod");
Native.Action("customAction", "customAction");

native.addActionTarget(Native.Action.customAction, function(arg1) {
    log("原生行为 " + Native.Action.customAction + " 触发了：" + arg1);
});

$(function() {
    log("JQ.ready 已执行！");

    // JS 调用原生方法。
    $("#event1").click(function() {
        native.performMethod(Native.Method.customMethod, "参数1", "参数2", function(arg1) {
            log("原生方法 " + Native.Method.customMethod + " 的回调执行了：" + arg1);
        });
    });

    // 原生调用 JS 方法。
    $("#event2").click(function() {
        native.sendAction(Native.Action.customAction, "参数1");
    });

});





// JS 模拟 App 操作
(function() {
    log("原生开始对 native 进行初始化！", 2);

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

    let mode = window.location.search;
    if (mode === "?mode=url") {
        log("设置通过 URL 进行交互！");
        // 模拟 App 操作：基于 URL 的操作方式。
        native.ready(function(url) {
            log("原生通过 URL 收到 JS 请求执行方法：" + url);
        }, Native.Mode.url, configuration);
    } else if (mode === "?mode=javascript") {
        log("设置通过 javascript 进行交互！");
        // 模拟 App 操作：JS 环境模拟 App 操作。
        native.ready(function(method, parameters) {
            let methods = method.split("/");
            switch (methods[0]) {
                case Native.Method.customMethod:
                    log("原生方法被 JS 调用：" + methods[0] + "(" + parameters[0] + ", " + parameters[1] + ", " + parameters[2] + ")");
                    native.callback(parameters[2])("原生方法 " + methods[0] + " 的回调函数的参数1");
                default:
                    break;
            }
        }, Native.Mode.javascript, configuration);
    } else if (mode === "?mode=object") {
        const app = {};
        app[Native.Method.customMethod] = function(arg1, arg2, callback) {
            log("原生方法被 JS 调用：" + Native.Method.customMethod + "(" + arg1 + ", " + arg2 + ", " + callback + ")");
            callback("参数1");
        }
        app[Native.Method.ready] = function() {

        }
        native.ready(app, Native.Mode.object, configuration);
    } else if (mode === "?mode=json") {
        const app = {};
        app[Native.Method.customMethod] = function(arg1, arg2, callback) {
            log("原生方法被 JS 调用：" + Native.Method.customMethod + "(" + arg1 + ", " + arg2 + ", " + callback + ")");
            native.callback(callback)("参数1");
        }
        app[Native.Method.ready] = function() {
            
        }
        native.ready(app, Native.Mode.json, configuration);
    } else {
        log("交互模式在本例中没有模拟实现：" + mode);
    }

    log("原生已完成对 native 的初始化！", 2);
})()


