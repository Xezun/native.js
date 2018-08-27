// Native.d.ts

function NTLog(message: any, style?: number): void;
function NativeParseURLQuery(anObject: any): void;

const native: _Native;

interface _Native {

    /**
     * 只读。方便读取 Cookie 的对象，优化了 Cookie 的读取性能。
     */
    cookie: _Cookie;

    /**
     * 只读。核心功能，负责与原生代码交互的逻辑。
     */
    core: _NativeCore;

    /**
     * 所有与原生交互的操作，必须在 core.ready 之后进行。
     * 回调将在 ready 时执行，如果当前已经 ready 状态，则立即异步执行。
     * @param {() => void} callback 回调函数。
     * @return {_Native}
     */
    ready(callback: () => void): _Native;

    /**
     * 拓展 native 对象的方法。此方法的回调函数会在 core.ready 之后，但是在 ready(fn) 方法的回调函数之前执行。
     * @param callback 构造属性的函数。
     * @return {_Native}
     */
    extend(callback: (configuration: object) => object): _Native;

    // Theme

    /**
     * 当前主题。设置此属性，将调用原生方法。原生代码改变主题需调用 setCurrentTheme() 方法。
     */
    currentTheme: string;

    /**
     * 发送或注册主题变更事件。
     * @param {() => void} callback 回调函数。
     */
    currentThemeChange(callback?: () => void): void;

    /**
     * 设置当前主题。
     * @param {string} newTheme 新主题。
     * @param {boolean} animated 是否展示动画。
     * @param {boolean} toApp 是否同步到 App 。
     */
    setCurrentTheme(newTheme: string, animated: boolean, toApp: boolean): void;

    // User
    /**
     * 当前用户。
     */
    currentUser: _User;

    /**
     * 设置当前用户。
     * @param {Object} newUser
     */
    setCurrentUser(newUser: object): void;

    /**
     * 发送或注册当前用户变更事件。
     * @param {() => void} callback
     */
    currentUserChange(callback?: () => void): void;

    /**
     * 调用 App 原生 alert 方法。
     * @param {_NativeAlertMessage} message 需要 alert 的消息内容
     * @param {(index: number) => void} callback 按钮事件
     * @return {string} 回调 ID
     */
    alert(message: _NativeAlertMessage, callback?: (index: number) => void): string;

    /**
     * 数据服务。
     */
    dataService: _NativeDataService;

    /**
     * 事件服务。
     */
    eventService: _NativeEventService;

    /**
     * 网络。
     */
    networking: _NativeNetworking;

    /**
     * HTML 发送 App 网络请求。
     * @param {_NativeHTTPRequest} request
     * @param {(response: _NativeHTTPResponse) => void} callback
     */
    http(request: _NativeHTTPRequest, callback: (response: _NativeHTTPResponse) => void): void;


    /**
     * 页面导航管理。
     */
    navigation: _NativeNavigation;
}

interface _NativeCore {

    /**
     * 调度并删除指定标识符对应的回调函数。
     * @param {string} callbackID 回调函数的唯一标识符。
     * @param args 回调函数所需的参数。
     * @return any 回调函数的返回值。
     */
    dispatch(callbackID: string, ...args: any[]): any;

    /**
     * 删除指定标识符对应的回调函数。
     * @param {string} callbackID 标识符。
     */
    remove(callbackID: string): void;

    /**
     * 执行指定的原生方法。
     * @param {string} method 预定义的原生方法。
     * @param parameters 原生方法所需的参数。
     * @param {() => void} callback 回调函数，用于传递返回值。
     * @return {string}
     */
    perform(method: string, parameters: any[], callback?: () => void): string;

    /**
     * 注册已注入到 JS 环境注入的原生对象的方法。
     * 原生代码必须调用此方法注册已注入的对象，才能进行 JS 与原生代码按照既定规则交互。
     * @param nativeObject 一般是注入 JS 中的原生对象。
     * @param nativeType 交互方法或原生对象能接收的数据类型。
     */
    register(nativeObject, nativeType): void;

    /**
     * URL 交互方式的协议头，默认 native 。
     */
    scheme: string;

    /**
     * 当前是否已经 ready 。
     */
    isReady: boolean;

    /**
     * 一般时原生对象，与 JS 进行交互的对象。
     */
    delegate: any;

    /**
     * 原生对象能接收的数据类型。
     */
    dataType: string;
}

interface _Cookie {
    value(key: string): any;
    value(key: string, newValue: any): _Native;
    synchronize(): _Native;
}

interface _User {
    id: number;
    name: string;
    info: object;
    version: string;
}



/**
 * 描述 alert 的接口。
 */
interface _NativeAlertMessage {
    /**
     * alert 标题。
     */
    title: string;

    /**
     * alert 内容。
     */
    body: string;

    /**
     * 按钮文字。默认只有一个 确认 按钮。
     */
    actions?: [string]
}

interface _NativeDataService {
    /**
     * 当页面列表通过 App 管理数据源时，通过此方法获取列表的行数。
     *
     * @param {string} documentName 页面名称
     * @param {string} listName     列表名称
     * @param {(count: number) => void} callback 获取行数在此回调中
     * @return {string} 回调 ID
     */
    numberOfRowsInList(documentName: string, listName: string, callback: (count: number) => void): string;

    /**
     * 通过此方法获取指定页面，指定列表指定行的数据。
     * @param {string} documentName 页面名称
     * @param {string} listName     列表名称
     * @param {number} index        行索引
     * @param {(data: any) => void} callback 获取数据的回调。
     * @return {string} 回调 ID
     */
    dataForRowAtIndex(documentName: string, listName: string, index: number, callback: (data: any) => void): string;

    /**
     * 通过此接口让 App 缓存指定 URL 资源。
     * @param {string} url 资源的 URL
     * @param {string} cacheType 资源的类型
     * @param {(sourcePath: string) => void} callback 获取缓存资源的回调，获得缓存路径
     * @return {string} 回调 ID
     */
    cachedResourceForURL(url: string, cacheType?: _OMAppCacheType, callback?: (sourcePath: string) => void): string;
}

interface _NativeEventService {
    /**
     * 专门为列表提供的方法。当列表的行被选中时，调用此方法将事件传递给 App 。
     * @param {string} documentName 页面名称
     * @param {string} listName 列表名称
     * @param {number} index 行索引
     * @param {() => void} completion 回调。
     * @return {string} 回调 ID
     */
    didSelectRowAtIndex(documentName: string, listName: string, index: number, completion?: () => void): string;

    /**
     * 当页面元素被（不限于）点击时，调用此方法将事件传递给 App 。
     *
     * @param {string} documentName 页面名称
     * @param {string} elementName  元素名称
     * @param data 连同事件包含的数据
     * @param {(isSelected: boolean) => void} callback 回调，表示元素是否可以被选中。
     * @return {string} 回调 ID
     */
    elementWasClicked(documentName: string, elementName: string, data?: any, callback?: (isSelected: boolean) => void): string;
    /**
     * 统计跟踪一条用户行为。
     *
     * @param {string} event        事件名称
     * @param {Object} parameters   参数
     * @return {string} null
     */
    track(event: string, parameters?: object): string;
}

interface _NativeNetworking {
    /**
     * 只读。网络是否已连通互联网。
     */
    isReachable: boolean;

    /**
     * 是否通过 Wi-Fi 上网。
     */
    isViaWiFi: boolean;

    /**
     * 只读。当前 App 接入网络的类型。
     */
    status: string;

    /**
     * 仅供 App 同步导航条显示状态时使用。
     * - 调用此方法可能会触发 change 事件。
     */
    setStatus(newType: string): void;

    statusChange(callback?: () => void): void;

    /**
     * 发送网络请求。
     * @param {_NativeHTTPRequest} request 网络请求对象
     * @param {(response: _NativeHTTPResponse) => void} callback 网络请求回调
     * @return {string} 回调 ID
     */
    http(request: _NativeHTTPRequest, callback: (response: _NativeHTTPResponse) => void): string;
}

interface _NativeHTTPRequest {
    url:        string;
    method:     string;
    data?:      object;
    headers?:   object;
}

interface _NativeHTTPResponse {
    code: number;
    message: string;
    contentType: string;
    data?: any;
}

interface _NativeNavigation {
    /**
     * App 页面导航行为，进入下级页面，导航栈 +1。
     * @param {string} url 下级页面的 URL
     * @param {boolean} animated 是否展示转场动画
     */
    push(url: string, animated: boolean): void;

    /**
     * App 页面导航行为，弹出导航栈顶页面 -1。
     * @param {boolean} animated 是否展示转场动画
     */
    pop(animated: boolean): void;

    /**
     * App 页面导航行为，弹出导航栈内页面到指定页面。导航栈以 HTML 页面计算。
     * @param {number} index 页面在栈内的索引
     * @param {boolean} animated 是否展示转场动画
     */
    popTo(index: number, animated: boolean): void;

    /**
     * 只读。导航条对象。
     */
    bar: _NativeNavigationBar;
}

interface _NativeNavigationBar {

    /**
     * 可写。设置或获取导航条是否隐藏。
     * - 直接修改属性，会同步到 App 。
     */
    isHidden: boolean;

    /**
     * 可写。设置或获取导航条标题。
     * - 直接修改属性，会同步到 App 。
     */
    title: string;

    /**
     * 可写。设置或获取标题文字颜色。
     * - 直接修改属性，会同步到 App 。
     */
    titleColor: string;

    /**
     * 可写。设置或获取导航条背景色。
     * - 直接修改属性，会同步到 App 。
     */
    backgroundColor: string;

    /**
     * 隐藏导航条。
     *
     * @param {boolean} animated 是否展示动画效果
     */
    hide(animated: boolean): _OMAppNavigationBar;

    /**
     * 显示导航条。
     *
     * @param {boolean} animated 是否展示动画效果
     */
    show(animated: boolean): _OMAppNavigationBar;

    /**
     * 仅供 App 同步导航条显示状态时使用。
     * - 调用此方法可能会触发 change 事件。
     *
     * @param {boolean} isHidden 是否隐藏
     */
    setHidden(isHidden: boolean): _OMAppNavigationBar;

    /**
     * 仅供 App 同步导航条标题时使用。
     * - 调用此方法可能会触发 change 事件。
     *
     * @param {string} title
     */
    setTitle(title: string): _OMAppNavigationBar;

    /**
     * 仅供 App 同步导航条标题文字颜色时使用。
     * - 调用此方法可能会触发 change 事件。
     *
     * @param {string} titleColor
     */
    setTitleColor(titleColor: string): _OMAppNavigationBar;

    /**
     * 仅供 App 同步导航条背景色时使用。
     * - 调用此方法可能会触发 change 事件。
     *
     * @param {string} backgroundColor
     */
    setBackgroundColor(backgroundColor: string): _OMAppNavigationBar;
}