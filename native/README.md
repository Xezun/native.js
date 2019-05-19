# native.js 文档

## 简介

`native.js` 旨在规范 JavaScript 与原生 native 的交互过程，以方便研发和维护。由于平台及环境的不同，原生与 JavaScript 交互的方式也可能不同。`native.js` 封装了几种常用的交互方式，
并定义了统一的接口，供 JavaScript 和原生交互使用。

## HTML

### 安装

`native.js` 支持使用 npm 安装，也可以直接下载 `Products` 目录下[已压缩好源码文件](../Products/native.js)。

终端命令：

```bash
$ npm install @mlibai/native.js
```

引用到项目中：

```javascript
var native = require('@mlibai/native.js');
// 或者
import '@mlibai/native.js'
```

### 如何使用

#### 定义消息

`native.js` 实现交互的过程类似于消息机制：JavaScript 调用原生方法的过程，称为发送 `NativeMethod` 消息；
原生调用 JavaScript 方法的过程，称为发送 `NativeAction` 消息。在进行交互前，原生和 H5 两端序先协定可
访问方法列表，即接口文档或交互文档。

```javascript
// 原生支持的方法
function nativeCustomMethod(arg1: string, arg2: string, callback: (value: string) => void): void;

// H5 支持的方法
function nativeCustomAction(arg1: string): void;
```

#### JavaScript 调用原生方法

比如，访问原生提供的 `nativeCustomMethod` 方法，使用 `native.js` 只需要下面这样写。

```javascript
native.performMethod("nativeCustomMethod", "参数1", "参数2", function(arg1) {
    // 回调函数。
});
```

由于平台及交互方式的不同，交互方法可能并非随 JavaScript 环境创建就可用，所以一般操作需在 `ready` 方法中进行。

```javascript
native.ready(function() {
    NativeLog("原生 App 已完成初始化，可以进行交互了。");

    native.performMethod("nativeCustomMethod", "参数1", "参数2", function(arg1) {
        // 回调函数。
    });
});
```

为了方便访问，可以对 `native` 对象进行拓展，比如。

```javascript
// define.js
// 在 NativeMethod 中注册方法，可以帮助检查方法定义冲突。
NativeMethod("nativeCustomMethod", "nativeCustomMethod");

// 拓展 native 。
native.extend(function(appInfo) {
    
    function _nativeCustomMethod(arg1, arg2, callback) {
        return this.performMethod(NativeMethod.nativeCustomMethod, arg1, arg2, callback);
    }

    return {
        "nativeCustomMethod": {
            get: function() {
                return _nativeCustomMethod;
            }
        }
    }
});

// main.js
native.ready(function() {
    NativeLog("原生 App 已完成初始化，可以进行交互了。");
    // 在业务逻辑中直接使用已拓展的方法，就像直接调用原生方法一样。
    native.nativeCustomMethod("参数1", "参数2", function(arg1) {
        // 回调函数。
    });
});
```

#### 提供给原生可访问的方法的实现

原生对 JavaScript 方法的访问被 `native.js` 抽象为原生行为，即 `NativeAction`，所以原生可访问的方法的实现，就变成了处理 `NativeAction` 消息。

```javascript
// 注册 NativeAction 可以帮助检查定义冲突。
NativeAction("nativeCustomAction", "nativeCustomAction");

// 注册原生行为触发时的函数。
native.addActionTarget(NativeAction.nativeCustomAction, function(arg1) {
    log("原生行为 " + NativeAction.nativeCustomAction + " 触发了：" + arg1);
});
```

建议为方法拓展便利函数。

```javascript
native.extend(function() {
    function _nativeCustomAction(arg1) {
        return this.sendAction(NativeAction.nativeCustomAction, arg1);
    }
    return {
        "nativeCustomAction": {
            get: function() {
                return _nativeCustomAction;
            }
        }
    }
});
```

#### 与其它框架兼容

`native.js` 的 ready 机制可以保证交互操作能够正常进行，但是如果每次交互操作都放在 ready 方法中进行的话就太过繁琐。
为了解决这个问题，可以通过调整各框架的执行顺序，以保证多框架混合开发时的兼容问题。

1. JQuery

因为 JQuery 提供了暂停的方法，所以可以在不改变原有编程风格的前提下，通过暂停来实现  `native` 与 JQuery 的顺序执行。

```javascript
// 使用 JQuery 实现业务逻辑
$(function() {
    // 业务逻辑、交互逻辑。
});

// 暂停 JQuery.ready 事件执行。。
$.holdReady(true);

 // 在 native 初始化后，恢复 JQuery.ready
native.ready(function() {
    $.holdReady(false); 
});
```

2. AngularJS

AngularJS 没有暂停执行的方法，但是可以设置它不自动执行，然后在 `native` 初始化后再启动即可。

```javascript
// 1. 禁止 AngularJS 自动执行：在 HTML 代码中，去掉标签上的 `ng-app` 属性。

// 2. 使用 AngularJS 实现业务逻辑（模块为 App）。
var app = angular.module('App', []);
app.controller('main', function($scope) {
    // 业务逻辑、交互逻辑。
});

// 3. 使用 `angular.bootstrap` 方法在 `native.ready` 中启动 AngularJS 模块。
native.ready(function () {
    // 在 angular.ready 中启动模块
    angular.element(document).ready(function () {
        // 第一个参数表示模块的根 DOM 元素。
        // 第二个参数就是模块名字。
        angular.bootstrap(document.body, ['App']);
    });
});
```


## 原生

### 调用 JavaScript 方法

不论使用何种交互方式，调用 JavaScript 方法都是执行一段类似如下的代码。

```javascript
// 原生调用 JavaScript 的 nativeCustomAction 方法 。
native.sendAction("nativeCustomAction", "参数1");
```

如果 H5 实现了便利方法，则可访问便利方法。

```javascript
native.nativeCustomAction("参数1");
```

### 实现 JavaScript 可访问的方法

由于平台和交互方式的不同，因此实现方式也各不同。

#### 通过拦截 URL 实现的交互。

默认的交互方式，安卓、iOS通用，具体怎么拦截这里就不说了，主要说下 `native.js` 的 URL 规则：

    native://method?paramēters=["arg1", "arg2"]

URL的协议名称默认为 native ，可以自定义；只有一个查询字段 parameters ，值为 JSON 数组通过 URL 编码后的字符串。 
通过 URL 进行交互，只需要拦截并解析 URL 即可，其中，**方法 ready 肯定为第一个拦截到的方法，开发者必须在拦截到此方法后，执行初始化 native 的操作**。

```swift
let method = url.host!

switch method {
case "ready": // 拦截到 ready 方法，执行 native 初始化。
    let appInfo = [String: String]()
    let js = String(format: "native.ready(%@);", String(json: appInfo))
    webView.stringByEvaluatingJavaScript(from: js);

case "nativeCustomMethod": // 使用上面 HTML 部分定义的交互文档。
    let parameters = Array<String>(json: url.queryValue(forKey: "parameters") as! String)
    let result = self.nativeCustomMethod(parameters[0], parameters[1]) // 假定回调函数是获取原生方法 nativeCustomMethod 的返回值。
    let callback = String(format: "native.callback('\(parameters[2])')('%@');", result); // 执行回调函数
    webView.stringByEvaluatingJavaScript(from: callback)

default:
    print("JavaScript 访问了尚未实现的方法 \(method) !")
}
```

#### 安卓平台注入对象的交互方式

#### iOS 平台注入对象的交互方式

#### iOS 平台 WKWebView 注入 JS 的交互方式

1. 创建处理交互的对象。

```swift
class NativeHandler: NSObject, WKScriptMessageHandler {
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let message = message.body as? [String: Any] else { return }
        guard let method = message["method"] as? String else { return }
        guard let parameters = message["parameters"] as? [Any] else { return }
        
        switch method {
        case "ready": break
        case "nativeCustomMethod":
            let result = self.nativeCustomMethod(parameters[0] as! String, parameters[1] as! String) // 假定回调函数是获取原生方法 nativeCustomMethod 的返回值。
            let callback = String(format: "native.callback('\(parameters[2])')('%@');", result); 
            webView.evaluateJavaScript(callback, completionHandler: nil) // 执行回调函数
        default:
            
        }
    }
    
}
// 注册 handler
webView.configuration.userContentController.add(NativeHandler(), name: "native")
```

2. 注入 JS ，设置交互方式为 `NativeMode.javascript` ，并将消息转发到已注册的 Handler ，如上例中的 NativeHandler 。

```swift
let script = WKUserScript.init(source: """
native.ready(function(method, parameters) {
    window.webkit.messageHandlers.native.postMessage({"method": method, "parameters": parameters});
}, NativeMode.javascript, \(1);
""", injectionTime: .atDocumentEnd, forMainFrameOnly: true)
webView.configuration.userContentController.addUserScript(script)
```