# OMApp 接口文档

## 目录

[TOC] 

## 说明

OMApp 是负责 App 与 HTML 交互的 JavaScript 的原型对象，omApp 是它的唯一实例对象。在 JavaScript 环境中，omApp 将 HTML 与 App 的交互逻辑封装成一系列属性和方法，简化开发流程。

## 更新日志

- 在版本 3.0.1 中，依赖于 `ready` 机制的方法，在 ready 之前都无法调用。
- 将不依赖于 ready 的实例方法（如 `isInApp`、`isAndroid`）调整为静态方法。
- 增加了对链式编程的支持。


## HTML 页面开发

### 开发环境

OMApp 支持在桌面浏览器中模拟 App 行为，因此开发调试过程，可以完全不必依赖 App 进行。

### 开发流程

#### 1. 引入 OMApp.js 框架

引入 OMApp.js 框架后，在 JS 环境中就可以调用 `OMApp`、`omApp` 了。其中，`OMApp` 的方法属于静态方法，在任何地方都可以调用，但是 `omApp` 的方法是实例方法，必须在 App 完成初始化（`ready`）后才能调用。

    关于 `omApp.ready` 和 App 初始化：
    在 App 中，JavaScript 环境启动后，根据交互方式的不同，并不一定能立即与 App 交互。因此 omApp 监听了 DOM 事件，并在可以交互时，第一时间向 App 发送 ready 消息。App 收到 ready 消息时，向 omApp 传送 App 的相关配置，为 omApp 初始化提供基础数据。

因此，除去 HTML 部分内容，JavaScript 代码应该总是在 `ready` 回调之中：

```
omApp.ready(function() {
    // 业务逻辑代码
});
```

#### 2. 与其它框架混合开发

OMApp 仅仅是负责了 HTML 与 App 交互的逻辑，更多的业务逻辑则需要其它框架来完成。由于 OMApp 机制问题，在与其它框架混合开发时，需要处理好各框架的优先级及执行顺序。

1. 代码嵌套。比如 JQuery ，两层 `ready` 会导致代码略显臃肿。

```
omApp.ready(function() {
    $(function() {
        // 业务逻辑。
    });
});

// 为了解决上面的代码臃肿问题，可以如下写。

$(function() {
    // 业务逻辑。
});
// 为了保证 JQ 与 OMApp 的执行顺序，需添加如下代码。
$.holdReady(true); // 暂停 JQuery.ready 事件执行。
omApp.ready(function() {
    $.holdReady(false); // 恢复 JQuery.ready
});
// 一般情况下 omApp.ready 与 $.ready 几乎是同时执行的，上述代码不会造成页面加载延迟。
```

2. AngularJS 页面载入就自动执行，从而导致业务逻辑在使用 `omApp` 时未初始化的问题。

```
// 1. 禁止 AngularJS 自动执行：在 HTML 代码中，去掉标签上的 `ng-app` 属性。
// 2. 使用 `angular.bootstrap` 方法在 `omApp.ready` 中启动 AngularJS 模块。
var app = angular.module('App', []);
app.controller('main', function($scope) {
    // 业务逻辑代码
});
omApp.ready(function () {
    // 在 angular.ready 中启动模块
    angular.element(document).ready(function () {
        // 第一个参数表示模块的根 DOM 元素。
        // 第二个参数就是模块名字。
        angular.bootstrap(document.body, ['App']);
    });
});
```

### 自动补全

为了方便开发以及检查错误，框架提供了 OMApp.d.ts 文件，将其添加到 WebStorm/Preferences/Languages & Frameworks/JavaScript/Libraies 中，即可实现自动补全以及基础的语法检查。

### 接口列表

    - 如非特殊说明所有回调函数 `callback` 中 `this` 指向 `omApp` 对象。
    - 属性格式：propertyName: propertyType 。
    - 方法格式：methodName(argumentName: argumentType): returnValueType 。
    - 闭包格式：(argumentName: argumentType) => returnValueType 。
    - 类型以大写字母或下划线开头：Bool、String、Object、Function、Number、OMApp 等。
    - 下划线开头的为私有变量或类。
    - 对象 `omApp` 的类型为 `OMApp`。
    - 与 App 交互的方法，会返回每次执行的回调标识符，如果没有回调返回 null 。

#### ***ready(callback: () => Void): OMApp***

- 接口说明：

    注册在 App 初始化完成后执行的操作。App 每开启一个 HTML 页面都需要初始化才能接收交互事件，因此，大部分情况下，所有交互操作都要放在该函数的回调中进行。
    OMApp 监听了 DOMContentLoaded 事件，并在事件触发后，主动与 App 交互，请求初始化 omApp 对象，这基本与其它 JS 框架一致。

- 参数说明：
    
    - `callback`：Function, 必选。omApp 在初始化完成后需要执行的操作。
    
- 示例代码：

```
omApp.ready(function() {
    // 某些属性只能在 omApp 完成初始化后才能进行，比如获取当前已登陆用户的用户名。
    console.log(omApp.currentUser.name);
});
```

#### ***isReady: Bool***

- 属性说明：

    只读，Bool。表示当前 omApp 对象是否已完成初始。

#### ***currentTheme: OMApp.Theme***

- 属性说明：

    可写，OMApp.Theme 枚举。该属性表明了当前 App 的主题。设置该属性会更改 App 当前的主题，但是不会触发绑定 JS 的主题事件。

- *OMApp.Theme* 枚举：
    
    - `OMApp.Theme.day`： String，白天模式。
    - `OMApp.Theme.night`：String，夜晚模式。
    
- 示例代码：

```
// 夜间模式下，为 body 添加 night 样式。
$(document.body).toggleClass("night", omApp.currentTheme === OMApp.Theme.night);
```

#### ***onCurrentThemeChange(callback: () => Void): OMApp***

- 接口说明：

    监听 App 主题变更事件，可绑定多个函数。

- 参数说明：

    - `callback`：Function，必选。

- 示例代码：

```
omApp.onCurrentThemeChange(function () {
    $(document.body).toggleClass("night", omApp.currentTheme === OMApp.Theme.night);
});
```

#### ***currentThemeChange(): OMApp***

- 接口说明：

    调用此方法以发送 App 主题变更事件，所有监听函数都会被执行。

- 示例代码：

```
omApp.currentTheme = OMApp.currentTheme.night;  // 改变主题
omApp.currentThemeChange();                     // 发送事件
```

#### ***login(callback: (success: Bool) => Void): String***

- 接口说明：

    发起 App 的用户登录流程。

- 参数说明：

    - `callback`：Function，必选，登录结果的回调函数。

- 回调函数：

    - `success`：Bool。登录是否成功。

- 示例代码：

```
omApp.login(function (success) {
    if (success) { /* Do something when success. */}
});
```


#### ***currentUser: _OMAppUser***

- 属性说明：

    只读，*_OMAppUser* 对象。该属性用于获取 App 的当前用户信息。

-  *_OMAppUser* 属性：
    
    - `id`： String，只读，用户唯一标识符。
    - `name`：String，只读，用户名。
    - `type`: OMApp.UserType 枚举，只读，用户类型。
    - `coin`：Number，只读，用户金币数。
    - `isOnline`：Bool，只读，用户是否在线。

- *OMApp.UserType* 枚举：

    - *OMApp.UserType*.visitor：String，游客用户。
    - *OMApp.UserType*.google：String，谷歌登录用户。
    - *OMApp.UserType*.facebook：String，脸书登录用户。
    - *OMApp.UserType*.twitter：String，推特登录用户。
    
- 示例代码：

```
// 显示用户名。
$("#userName").text(omApp.currentUser.name);
```

#### ***onCurrentUserChange(callback: () => Void): OMApp***

- 接口说明：

    监听 App 当前用户或者用户信息变更的事件。

- 参数说明：

    - `callback`：Function，必选。

- 示例代码：

```
omApp.onCurrentUserChange(function () {
    $("#userName").text(this.currentUser.name);
});
```

#### ***currentUserChange(): OMApp***

- 接口说明：

    发送 App 用户或用户信息发生变更事件，所有监听函数都会被执行。

- 示例代码：

```
omApp.currentUserChange();
```


#### ***open(page: OMApp.Page, parameters: Object): String***

- 接口说明：

    此方法用于跳转到指定的 App 界面。

- 参数说明：

    - `page`：OMApp.Page，必选。预定义的原生界面枚举。
    - `parameters`：Object，可选。目的页面参数。

- *OMAppPage* 枚举及相关参数：

    - 公共参数：
    
        | Name | Type    | Description                                     |
        | :--- | :------ | :---------------------------------------------- |
        | type | String  | 可选。跳转来源类型，如 web/push/share/launch 。    |

    - *OMAppPage.**news***：新闻页面。
    
        | Name        | Type           | Description                      |
        | :---------- | :------------- | :------------------------------- |
        | categoryID  | String         | 可选。新闻分类 ID。                |
        | id          | String         | 可选。新闻 ID 。                   |
        | actions     | String         | 可选。自动关注 follow。            |
 
    - *OMAppPage.**video***：视频页面。

        | Name        | Type    | Description                     |
        | :---------- | :------ | :------------------------------ |
        | categoryID  | String  | 可选。视频分类 ID，默认可传 0 。   |
        | id          | String  | 可选。视频 ID ，必选 categoryID。  |

    - *OMAppPage.**mall***：金币商城。
    - *OMAppPage.**task***：金币任务。
    - *OMAppPage.**web***：内置Web页面。
    
        | Name        | Type    | Description           |
        | :---------- | :------ | :-------------------- |
        | url         | String  | 必选。网址。            |

- 代码示例：

    ```
    // 打开金币商城页
    omApp.open(OMAppPage.mall); 
    // 打开金币任务页
    omApp.open(OMAppPage.task); 
    // 打开指定新闻
    omApp.open(OMAppPage.news, {categoryID: "1", id: "9523"});
    // 打开指定视频频道
    omApp.open(OMAppPage.video, {categoryID: "5"});
    // 打开指定网页
    omApp.open(OMAppPage.web, {url: "http://www.baidu.com"});
    ```

#### ***navigation: _OMAppNavigation***

- 属性说明：

    只读，*_OMAppNavigation* 对象。 App 的页面导航管理者。

- *_OMAppNavigation* 属性：

    - `push`：*(String, Bool) => String*，方法。
    - `pop`：*(Bool) => String*，方法。
    - `popTo`：*(Number, Bool) => String*，方法。
    - `bar`：*_OMAppNavigationBar*，属性。

#### ***navigation.push(url: String, animated: Bool): String***

- 接口说明：

    创建一个新窗口并打开指定 URL，常用于导航到下级页面。新窗口将压入到导航栈顶。

- 参数说明：

    - `url`：String，必选。下级页面的 URL。
    - `animated`：Bool，可选。是否展示转场动画，默认 true 。

- 代码示例：

    ```
    omApp.navigation.push('http://8.dev.arabsada.com/'); 
    omApp.navigation.push('http://8.dev.arabsada.com/', true); 
    ```

#### ***navigation.pop(animated: Bool): String***

- 接口说明：

    关闭当前窗口，并返回到上一个窗口，常用于返回到上级页面。当前窗口从导航栈中弹出。

- 参数说明：

    - `animated`：Bool，可选。是否展示转场动画，默认 true。

- 代码示例：

    ```
    omApp.navigation.pop(true); 
    ```

#### ***navigation.popTo(index: Number, animated: Bool): String***

- 接口说明：

    返回到导航栈内指定级页面。如果当前导航栈内已经有很多页面，此方法可以快速回到指定页面。

- 参数说明：

    - `index`：Number，必选。正整数，目的页面所在的位置索引，0 为第一个 HTML 页面。
    - `animated`：Bool，可选。是否展示转场动画，默认 true 。

- 代码示例：

    ```
    omApp.navigation.popTo(0, true);
    ```

#### ***navigation.bar: _OMAppNavigationBar***

- 接口说明：

    只读。_OMAppNavigationBar 对象，代表 App 导航条。

- 属性和方法：

    - `isHidden`：boolean，是否隐藏。
    - `title`：string，导航条标题。
    - `titleColor`：string，标题颜色。
    - `backgroundColor`：string，导航条背景色。
    - `show`：*(animated: boolean) => void*。显示导航条。
    - `hide`：*(animated: boolean) => void*。隐藏导航条。

- 示例代码：

```

```


#### ***present(url: String, animated: Bool, completion: () => Void): String***

- 接口说明：

    类似于在页面中呈现一个弹出层，只不过在 App 中，弹出层也是全屏显示的。与导航不同，present 没有栈结构，为单视图层。

- 参数说明：
    
    - `url`：String，必选。omApp 在登录完成后需要执行的操作。
    - `animated`：Bool，可选，默认 true 。是否展示转场动画。
    - `completion`：Function，可选。弹出层显示后执行的回调，无参数。
    
- 示例代码：

```
omApp.present("http://www.baidu.com", true, function() {
    // Do something when the view is presented.
});
```

#### ***dismiss(animated: Bool, completion: () => void): String***

- 接口说明：

    移除当前已 present 出来的视图。

- 参数说明：
    
    - `animated`：Bool，可选，默认 true 。是否展示转场动画。
    - `completion`：Function，可选。弹出层显示后执行的回调，无参数。
    
- 示例代码：

```
omApp.dismiss(true, function() {
    // Do something when the view is presented.
});
```

#### ***networking: _OMAppNetworking***

- 接口说明：

    属性。只读，_OMAppNetworking。App 网络环境及网络支持。

- 参数说明：
    
    - `isReachable`：Bool，只读。当前是否已联网。
    - `isViaWiFi`：Bool，只读，当前网络是否通过 Wi-Fi 连接。
    - `type`：OMApp.NetworkingType，只读。当前网络类型。
    - `http`：方法。网络请求，参见 omApp.http 方法。
    
- *OMAppNetworkingType* 枚举：

    | **Name**                          | **Type**    | **Description** |
    | :-------------------------------- | :---------- | :-------------- |
    | *OMAppNetworkingType.**none***    | String      | 无网络           |
    | *OMAppNetworkingType.**WiFi***    | String      | WiFi            |
    | *OMAppNetworkingType.WWan**2G***  | String      | 蜂窝网 2G        |
    | *OMAppNetworkingType.WWan**3G***  | String      | 蜂窝网 3G        |
    | *OMAppNetworkingType.WWan**4G***  | String      | 蜂窝网 4G        |
    | *OMAppNetworkingType.**other***   | String      | 未知的联网方式    |


- 示例代码：

```
if (!omApp.networking.isViaWiFi) {
    confirm("当前非 Wi-Fi 环境，请注意流量使用情况。");
}
```


#### ***http(request: _OMAppHTTPRequest, callback: (response: _OMAppHTTPResponse) => Void): String***

- 接口说明：

    本方法直接引用 omApp.networking.http 方法。

- *_OMAppHTTPRequest* 属性：

    网络请求参数信息，Object，所支持的参数如下。

    - `url`： String，必选。网络请求的 URL。
    - `method`： String，必选。网络请求的方法。
    - `data`： Object，可选。请求参数。
    - `headers`： Object，可选。请求头参数设置。

- *_OMAppHTTPResponse* 属性： 

    - `code`：Number。错误码，非 HTTP 状态码。0 表示没有错误。
    - `message`：String。错误消息。
    - `data`：Any。请求得到的数据。
    - `contentType`：String。请求的数据类型。
    
- 示例代码：

```
omApp.http({
    url: "http://api.host.com",
    method: "GET",
    data: {id: "1"},
}, function(response) {
    if (response.code !== 0) { alert(response.message); return; }
});
```

#### ***alert(message: _OMAppAlertMessage, callback: (index: Number) => Void): String***

- 接口说明：

    显示 App 原生的警告对话框。

- *_OMAppAlertMessage* 属性：

    - `title`：String，必选。标题。
    - `body`：String，必须。内容。
    - `actions`：[String]，可选。按钮文字。

- 回调参数说明：

    - `index`：Number，被点击的按钮的位置。

- 实例代码：

```
omApp.alert({
    title: "清空购物车？",
    body: "所有添加到购物车的商品就全部找不回了，请确认操作！",
    actions: ["确定", "取消"]
}, function(index) {
    if ( index === 0 ) {
        // 清空购物车
    }
});
```

#### services

- 接口说明：

    属性，只读。App 提供的功能服务。

- 属性列表：
    
    - `data`：_OMAppDataService，只读。数据服务。
        
        - `numberOfRowsInList(documentName, listName, callback)`
            - documentName: String
            - listName: String
            - callback(count): Function
                - count: Number
            
        - `dataForRowAtIndex(documentName, listName, index, callback)`
            - documentName: String
            - listName: String
            - index: Number
            - callback(): Function

        - `cachedResourceForURL(url, resourceType, autoDownload, callback)`
            - url: String
            - resourceType: OMApp.ResourceType
            - autoDownload: Bool
            - callback: Function

    - `event`：_OMAppEventService，只读。事件服务。
        
        - `didSelectRowAtIndex(documentName, listName, index, callback)`
            - documentName: String
            - listName: Stirng
            - index: Number
            - callback: Function

        - `elementWasClicked(documentName, listName, data, callback)`
            - documentName: String
            - listName: String
            - data: Any
            - callback: Function
        
    - `analytics`：_OMAppAnalyticsService。统计分析服务。
        
        - `track(eventName, parameters)`
            - `eventName`：String
            - `parameters`：Object
    
- 示例代码：

```

```


### 开发调试

在桌面浏览器环境中，`omApp.delegate` 是一个 JavaScript 对象，原型为 _OMAppDelegate ，用来表示原生的 App 对象。通过重写它的方法，就可以实现模拟 App 的行为。

- *_OMAppDelegate* 接口：

    - `ready`：*(callback: (configuration: _OMAppConfiguration) => Void) => Void*。初始化。
    - `setCurrentTheme`：*(newValue: _OMAppTheme) => void*。设置主题。
    - `login`：*(callback: (success: Bool) => void) => void*。登录。
    - `open`：*(page: _OMAppPage, parameters?: Object) => void*。打开页面。
    - `present`：*(url: String, animated: Bool, completion: () => Void) => Void*。弹出页面。
    - `dismiss`：*(animated: Bool, completion?: () => Void) => Void*。移除页面。
    - `push`：*(url: String, animated?: Bool) => Void*。导航下一级。
    - `pop`：*(animated: Bool) => Void*。返回上一级。
    - `popTo`：*(index: Number, animated: Bool) => Void*。导航到指定级。
    - `setNavigationBarHidden`：*(newValue: String, animated: Bool) => Void*。设置导航条是否隐藏。
    - `setNavigationBarTitle`：*(newValue: String) => Void*。设置导航标题。
    - `setNavigationBarTitleColor`：*(newValue: String) => Void*。设置导航标题文字颜色。
    - `setNavigationBarBackgroundColor`：*(newValue: String) => Void*。设置导航条背景色。
    - `track`：*(event: String, parameters?: Object) => Void*。统计分析。
    - `alert`：*(message: _OMAppAlertMessage)=>void*。警告提示框。
    - `http`：*(request: _OMAppHTTPRequest, callback: (response: _OMAppHTTPResponse) => Void) => Void*。网络请求。
    - `numberOfRowsInList`：*(documentName: String, listName: String, callback: (count: Number) => Void) => Void*。数据服务，获取数据数。
    - `dataForRowAtIndex`：*(documentName: String, listName: String, index: Number, callback: (data: Any) => Void) => Void*。数据服务，获取数据。
    - `cachedResourceForURL`：*(url: String, resourceType: _OMAppCacheType, callback?: (filePath: String) => Void) => Void*。数据服务，获取缓存。
    - `didSelectRowAtIndex`：*(documentName: String, listName: String, index: Number, completion?: () => Void) => Void*。事件服务，点击事件。
    - `elementWasClicked`：*(documentName: String, elementName: String, data: Any, callback: (isSelected: Bool) => Void) => Void*。事件服务，点击事件。

- 实例代码：

```
// 1. 模拟 App 登录。
omApp.delegate.login = function (callback) {
    $("div#login").toggleClass("show", true); // 显示登录界面
    $("div#login input.submit").one("click", function () {
        $("div#login").toggleClass("show", false);
        callback(true); // 确定按钮点击登录成功
    });
    $("div#login input.cancel").one("click", function () {
        $("div#login").toggleClass("show", false);
        callback(false); // 取消按钮点击登录失败
    });
};

// 2. 模拟 App HTTP 请求。 

// omApp.delegate 默认使用 AJAX 发送请求，一般情况下，你需要重新模拟此操作。

omApp.ajaxSettings({
    headers: {"User-Token": "Test Token"}
});

```




## App 开发


#### dispatch(*callbackID*, *argument1*, *argument2*, ...)

- 接口说明：

    由于平台的限制，当 JS 的函数不能直接传递到 App 环境中执行时，App 会收到一个标识该函数的 callbackID ，当 App 中执行完相关操作时，通过调用此方法来调度对应的函数。

- 参数说明：

    - `callbackID`: 必选，string。JS 函数的唯一标识。
    - `argumentN`: 可选。执行 JS 函数时的参数，必须保持参数顺序一致。

#### perform(*method*, *paramters*, *callback*)

- 接口说明：

    执行一个已预定义的 App 方法。

- 参数说明：
    
    - `method`：OMApp.Method 枚举, 必选。与 App 约定的方法标识。
    - `paramters`：array, 可选。方法参数，必选与约定的参数顺序一致。
    - `callback`：function，可选。回调函数，目前只支持一个回调函数。
    
- 示例代码：

```
omApp.perform(OMApp.Method.login, null, function(success) {
    // 接收登陆结果。
});
```

#### config(*configuration*)

- 接口说明：

    在非 App 环境中，配置 omApp 对象的初始属性。请在使用其它方法之前调用此方法。

- 参数说明：
    
    - `configuration`：Object, 必选。配置信息。
    
- 示例代码：

```
omApp.config({
    currentTheme: OMApp.Theme.night, // 模拟 App 夜间模式
    currentUser: {                   // 模拟 App 中的用户信息
        id: "0",
        name: "Jim",
        type: OMApp.UserType.google
    }
});
```

#### isReady

- 接口说明：

    属性。只读，boolean。标识 omApp 对象是否已经由 App 完成初始化。

#### ready(*callback*)




#### currentTheme

- 接口说明：

    属性。OMApp.Theme 枚举。App 当前主题。

#### login(callback)

- 接口说明：

    当 HTML 通过 omApp.currentUser.isOnline 判断用户未登录，但是用户操作必须在登录后才能执行时，可调用此方法，发起 App 登录流程。

- 参数说明：
    
    - `callback`：function, 必选。omApp 在登录完成后需要执行的操作。
    - `callback` 函数参数：
        - `success`：boolean，必选。是否登录成功。
    
- 示例代码：

```
omApp.login(function(success) {
    console.log(omApp.currentUser.name);
});
```

#### currentUser

- 接口说明：

    属性。Object，该对象描述了 App 已登录的用户的信息。
 
- 属性说明：
    
    | **Name**        | **Type**    | **Description** |
    | :-------------- | :---------- | :-------------- |
    | isOnline        | Bool        | 只读。是否已登录        |
    | id              | String      | 只读。用户ID           |
    | name            | String      | 只读。用户名           |
    | type            | String      | 只读。OMApp.UserType  |
    | coin            | Int         | 只读。用户金币数        |
    | token           | String      | 只读。user token        |

    <font size=2>* 说明： token 字段对外并不是一个好的 API 设计，未来优化的版本中将去掉此值。</font>

- 代码示例：

    ```
    // 判断用户是否登录
    if (omApp.currentUser.isOnline) {
        // do something when user is logged.
    } else {
        // do something
    }
    // get the user name
    var userName = omApp.currentUser.name;
    ```
    



#### navigation

- 接口说明：

    Object，只读，非空。
    为了使 HTML 提供类似原生 App 的操作体验，`navigation` 接口给 HTML 提供了创建新窗口的能，并通过 `导航栈` 来管理这一系列窗口。

##### navigation.push(*url*, *animated*)




##### navigation.pop(*animated*)


##### navigation.popTo(*index*, *animated*)



##### navigation.bar

- 接口说明：

    只读，Object。代表了 App 的原生导航条对象。通过此对象，可以控制导航条的外观。

- 属性说明：

    - `isHidden`：Bool。导航条是否隐藏。
    - `title`：String。标题。
    - `titleColor`：String。标题颜色。
    - `backgroundColor`：String。背景色。

- 代码示例：

    ```
    omApp.navigation.bar.isHidden = false;
    omApp.navigation.bar.title = '自定义的标题';
    omApp.navigation.bar.titleColor = '#FF0000';
    omApp.navigation.bar.backgroundColor = '#0000FF';
    ```

#### present(*url*, *animated*, *completion*)



#### dismiss(*animated*, *completion*)



#### networking



#### http(*request*, *callback*)








#### version

- 接口说明：

    属性。只读，String，标识框架的版本。

- 示例代码：

```
console.log(OMApp.version); // LOG 当前 OMApp 版本。
```

#### defineProperty(*propertyName*, *descriptor*)

- 接口说明：

    通过此方法为 OMApp 拓展单个静态属性。

- 参数说明：
    
    - `propertyName`: string，必选。属性名。
    - `descriptor`：function, 必选。该函数用于生成属性的描述信息，结构与 Object.defineProperty 方法相同。
    
- 示例代码：

```
OMApp.defineProperty("Method", function () {
    var _Method = {};
    return {
        get: function () {
            return _Method;
        }
    }
});

```


#### defineProperties(*descriptor*)

- 接口说明：

    通过此方法为 OMApp 拓展多个静态属性。

- 参数说明：
    
    - `descriptor`：function, 必选。该函数用于生成属性的描述信息，结构与 Object.defineProperty 方法相同。
    
- 示例代码：

```
OMApp.defineProperty("Method", function () {
    var _Method = {};
    function _registerMethod() {}
    return {
        version: { get: function () { return "3.0.0"; } },
        Method: { get: function () { return _Method; } },
        registerMethod: { get: function () { return _registerMethod; } }
    }
});
```
    
#### Method

- 接口说明：

    - 属性。
    - 只读，OMApp 枚举器。枚举器的所有属性都是一个枚举值，代表一个 App 方法；
    - 通过 `OMApp.registerMethod` 方法为枚举器拓展新的枚举值；
    - 枚举值可以是对象，但是对象最终必须以 String 为属性值。
    - 在 HTML 调用 OMApp 的方法时，OMApp 查找对应的枚举值，并将此值传递给 App ，App 根据此值来区分 HTML 的操作请求并执行相应的操作。
  
- 示例代码：

```
OMApp.Method.login; // 登录
```

#### registerMethod(*method*, *name*)

- 接口说明：

    通过此方法为 OMApp.Method 拓展枚举值。

- 参数说明：
    
    - `method`：string/object, 必选。与 App 约定的方法标识。
    - `name`: string, 可选。方法名，引用枚举值时使用的名字，当 method 参数为 object 类型时，必须指定 name 。
    
- 示例代码：

```
OMApp.registerMethod("login");
OMApp.registerMethod({
    http: "http"
}, "networking");

```

#### current

- 接口说明：

    属性。只读，OMApp 实例，代表当前 App 对象。也可以通过 `window.omApp` 引用。

- 示例代码：

```
var app = OMApp.current;
console.log(app);
```



### 实例方法

#### isInApp

- 接口说明：

    属性。只读，boolean。标识当前是否处于 App 环境。

#### system

- 接口说明：

    属性。只读，Object。当前 App 的系统信息。

- 属性列表： 
    
    system.isAndroid: 只读，boolean。是否是安卓系统。
    system.isiOS: 只读，boolean。是否是 iOS 系统。

#### name

- 接口说明：

    属性。string。标识 OMApp 实例对象，以及交互的 URL Scheme，必须是全小写字母。

#### defineProperty(*propertyName*, *descriptor*)

- 接口说明：

    通过此方法为 OMApp 实例拓展单个属性，参数与用法见 `OMApp.defineProperty`。

#### defineProperties(*descriptor*)

- 接口说明：

    通过此方法为 OMApp 实例拓展多个属性，参数与用法见 `OMApp.defineProperties`。












- <a name="OMAppTheme">***OMAppTheme*枚举**</a>

    | Name                   | Type     | Description | 
    | :--------------------- | :------- | :---------- |
    | *OMAppTheme.**day***   | String   | 新闻栏目 ID   |
    | *OMAppTheme.**night*** | String   | 新闻栏目 ID   |
- OMApp.UserType 枚举

    | **Name**                           | **Type**    | **Description** |
    | :--------------------------------- | :---------- | :-------------- |
    | *OMApp.UserType.**visitor***       | String      | 游客用户          |
    | *OMApp.UserType.**google***        | String      | Google 登录用户   |
    | *OMApp.UserType.**facebook***      | String      | Facebook 登录用户  |
    | *OMApp.UserType.**twitter***       | String      | Twitter 登录用户  |









## 基本约定

1. 通过 URL 参数传递数据时，使用 *Key-Value* 形式，如果 Value 不是基本数据类型，则用 `URL 编码后的 JSON 串` 表示。 
2. 所有标注为只读的属性，请在业务逻辑中，不要去修改这些值。它们虽然可能可写，但只是供 App 初始化值时使用。
3. 只读的属性，即使修改其值，也不会影响 App 里的内容。




