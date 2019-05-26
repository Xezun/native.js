# native.js 文档

## 一、简介

`native.js` 旨在规范 JavaScript 与原生 native 的交互过程，以方便研发和维护。由于平台及环境的不同，原生与 JavaScript 交互的方式也可能不同。`native.js` 封装了几种常用的交互方式，
并定义了统一的接口，供 JavaScript 和原生交互使用。

## 二、HTML

### 1. 安装

`native.js` 支持使用 npm 安装，也可以直接下载 `Products` 目录下[已压缩好源码文件](../Products/native.js)。

终端命令：

```bash
$ npm install @mlibai/native.js
```

引用到项目中：

```javascript
import native from '@mlibai/native.js'
// 或者
import { Native, native } from '@mlibai/native.js'
```

### 2. 如何使用

#### 2.1 定义消息

`native.js` 实现交互的过程类似于消息机制：JavaScript 调用原生方法的过程，称为发送 `Native.Method` 消息；
原生调用 JavaScript 方法的过程，称为发送 `Native.Action` 消息。在进行交互前，建议两端先协定好交互文档，
将可访问的原生方法和可访问的 JavaScript 方法列成文档，方便查看维护。

```typescript
// Native.Method.doc
// 原生支持的方法
function nativeCustomMethod(arg1: string, arg2: string, callback: (value: string) => void): void;

// Native.Action.doc
// H5 支持的方法
function nativeCustomAction(arg1: string): void;
```

#### 2.1 JavaScript 调用原生方法

比如，访问原生提供的 `nativeCustomMethod` 方法，使用 `native.js` 只需要下面这样写。

```javascript
native.performMethod("nativeCustomMethod", "参数1", "参数2", function(arg1) {
    // 回调函数。
});
```

由于平台及交互方式的不同，交互操作可能并非随 JavaScript 环境创建就可以立即进行。为了解决此问题，`native.js` 引入了 `ready` 机制。

```javascript
native.ready(function() {
    Native.log("原生 App 已完成初始化，可以进行交互了。");

    native.performMethod("nativeCustomMethod", "参数1", "参数2", function(arg1) {
        // 回调函数。
    });
});
```

*注意：native.ready(fn) 注册的是 native 对象初始化完成后执行的函数，表示原生端已准备好接受交互操作；*
*而原生收到 ready 方法的调用，则是 document 加载完成的 DOM 事件，原生最迟要在此时完成 native 的初始化操作；*
*两端的 `ready` 触发的时机不一定相同，一般情况下，除使用拦截 URL 交互方式外，方法 native.ready(fn) 的回调函数在 DOM 事件之前调用。*

为了方便使用，可以对 `native` 对象进行方法拓展，比如。

```javascript
// define.js
// 在 Native.Method 中注册方法，可以帮助检查方法定义冲突。
Native.Method("nativeCustomMethod", "nativeCustomMethod");

// 拓展 native 。
native.extend(function(appInfo) {
    
    function _nativeCustomMethod(arg1, arg2, callback) {
        return this.performMethod(Native.Method.nativeCustomMethod, arg1, arg2, callback);
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
    Native.log("原生 App 已完成初始化，可以进行交互了。");
    // 在业务逻辑中直接使用已拓展的方法。
    native.nativeCustomMethod("参数1", "参数2", function(arg1) {
        // 回调函数。
    });
});
```

#### 2.3 Native.Action（原生可访问的方法）的实现

原生对 JavaScript 方法的访问被 `native.js` 抽象为原生行为，即 `Native.Action`，所以原生可访问的方法的实现，就变成了处理 `Native.Action` 消息。

```javascript
// 注册 Native.Action 可以帮助检查定义冲突。
Native.Action("nativeCustomAction", "nativeCustomAction");

// 注册原生行为触发时的函数。
native.addActionTarget(Native.Action.nativeCustomAction, function(arg1) {
    log("原生行为 " + Native.Action.nativeCustomAction + " 触发了：" + arg1);
});
```

建议为方法拓展便利函数。

```javascript
native.extend(function() {
    function _nativeCustomAction(arg1) {
        return this.sendAction(Native.Action.nativeCustomAction, arg1);
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

#### 2.4 与其它框架兼容

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


## 三、原生

### 1. 调用 JavaScript 方法

不论使用何种交互方式，调用 JavaScript 方法都是执行一段类似如下的代码。

```javascript
// 原生调用 JavaScript 的 nativeCustomAction 方法 。
native.sendAction("nativeCustomAction", "参数1");
```

如果 H5 实现了便利方法，则可访问便利方法。

```javascript
native.nativeCustomAction("参数1");
```

### 2. 实现 JavaScript 可访问的方法

由于平台和交互方式的不同，因此实现方式也各不同。

#### 2.1 通过拦截 URL 实现的交互。

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
*示例中使用的关于 URL 解析方法来自 [XZKit](https://github.com/mlibai/XZKit) 框架中的类目拓展，下同。*

#### 2.2 安卓平台注入对象的交互方式

#### 2.3 iOS 平台注入对象的交互方式

#### 2.4 iOS 平台 WKWebView 注入 JS 的交互方式

1. 创建处理交互的对象。

```swift
protocol NativeHandlerDelegate: AnyObject {
    
    func ready()
    func nativeCustomMethod(arg1: String, arg2: String, completion: ((String) -> Void)?)
    
}

class NativeHandler: NSObject, WKScriptMessageHandler {
    
    weak var delegate: NativeHandlerDelegate?
    
    init(_ userContentController: WKUserContentController, delegate: NativeHandlerDelegate?) {
        super.init()
        
        self.delegate = delegate
        
        userContentController.add(self, name: "native")
        let info = String.init(json: [:])
        let script = WKUserScript.init(source: """
            native.ready(function(method, parameters) {
                window.webkit.messageHandlers.native.postMessage({"method": method, "parameters": parameters});
            }, Native.Mode.javascript, \(info));
            """, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        userContentController.addUserScript(script)
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive scriptMessage: WKScriptMessage) {
        guard let message = scriptMessage.body as? [String: Any] else { return }
        guard let method = message["method"] as? String else { return }
        
        switch method {
        case "ready":
            delegate?.ready()
            
        case "nativeCustomMethod":
            guard let parameters = message["parameters"] as? [String] else { return }
            guard parameters.count >= 2 else {
                return
            }
            switch parameters.count {
            case 0, 1:
                print("参数错误：方法 nativeCustomMethod 需要三个参数，详情请查看接口文档！")
            case 2:
                delegate?.nativeCustomMethod(arg1: parameters[0], arg2: parameters[1], completion: nil)
            default:
                delegate?.nativeCustomMethod(arg1: parameters[0], arg2: parameters[1], completion: { (result) in
                    let encoded = result.addingPercentEncoding(withAllowedCharacters: .alphanumerics)!
                    let js = "native.callback(\(parameters[2]))(decodeURIComponent('\(encoded)'))"
                    scriptMessage.webView?.evaluateJavaScript(js, completionHandler: nil)
                })
            }
            
        default:
            print("执行错误：方法 \(method) 尚未实现！")
        }
    }
    
}
```

2. 在需要交互的页面注入 JS 。

```swift
class WebViewController: UIViewController, NativeHandlerDelegate {

    override func loadView() {
        self.view = WKWebView.init(frame: UIScreen.main.bounds)
    }
    
    var webView: WKWebView {
        return view as! WKWebView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // 注入 JS
        NativeHandler.init(webView.configuration.userContentController, delegate: self)
    }
    
    func ready() {
        print("document was ready.")
    }
    
    func nativeCustomMethod(arg1: String, arg2: String, completion: ((String) -> Void)?) {
        print("do someting.")
        completion?("The result of nativeCustomMethod.")
    }
    
}
```
