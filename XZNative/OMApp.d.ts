// Type definitions for XZApp
//
// 2017-08-24
// Powered by mlibai.

/**
 * 默认 Log 格式。
 */
declare const XZAppLogLevelDefault: number;
/**
 * 警告的 LOG 。
 */
declare const XZAppLogLevelWarning: number;
/**
 * 错误 LOG 。
 */
declare const XZAppLogLevelError: number;

/**
 * iOS 平台。
 */
declare const XZAppPlatformIOS: string;
/**
 * 安卓平台。
 */
declare const XZAppPlatformAndroid: string;
/**
 * 保存当前主题的所使用的 Cookie 键名。
 */
declare const XZAppCurrentThemeCookieKey: string;
/**
 * 保存当前用户所使用的 Cookie 键名。
 */
declare const XZAppCurrentUserCookieKey: string;
/**
 * 网络状态 Wi-Fi 。
 */
declare const XZAppNetworkStatusWiFi: string;
/**
 * 缓存类型，图片。
 */
declare const XZAppResourceCacheTypeImage: string;

declare class XZApp {

    /********************* 静态方法 *************************/

    /**
     * 只读。标识当前 OMApp 版本，如 3.0.1 。
     */
    static version: string;

    /**
     * 拓展单个静态方法。
     *
     * @param propertyName 属性名
     * @param {(...data: any[]) => Object} propertyDescriptorMaker 构造属性的函数
     * @param data 构造函数所需的参数
     */
    static defineProperty(propertyName, propertyDescriptorMaker: (...data: any[]) => object, ...data: any[]): void;

    /**
     * 拓展多个静态方法。
     *
     * @param {(...data: any[]) => Object} propertyMaker 属性构造函数
     * @param data 属性构造函数参数
     */
    static defineProperties(propertyMaker: (...data: any[]) => object, ...data: any[]): void;

    /**
     * 输出一条废弃方法消息。
     *
     * @param {string} method 要废弃的方法
     * @param {string} newMethod 新的替代方法
     */
    static deprecate(method: string, newMethod?: string): void;

    /**
     * 输出控制台 LOG 。
     *
     * @param {string} message 要输出的内容
     * @param {number} level   0 普通；1，警告。
     */
    static log(message: string, level?: number): void;

    /**
     * 只读。OMApp 唯一实例对象，表示当前 App 对象。
     * - OMApp.current 与 window.omApp 都可以获取对它的引用。
     */
    static current: OMApp;

    /**
     * 只读。是否在 App 环境中，该属性不需要 omApp.ready 即可使用。
     * - 判断 userAgent 是否包含 Onemena 字段。
     */
    static isInApp: boolean;

    /**
     * 只读。当前 App 系统是否是安卓系统。
     */
    static isAndroid: boolean;

    /**
     * 只读。当前 App 系统是否是 iOS 系统。
     */
    static isiOS: boolean;

    /**
     * OMApp 提供的操作 Cookie 的工具。
     */
    static cookie: _OMAppCookie;

    /**
     * *OMApp 统一的对象转 URL query 标准*
     * 根据 anObject 类型的不同分别进行以下处理：
     * - Array：直接转换成 JSON 串，返回该串的 encodeURIComponent 值。
     * - String：直接返回该串的 encodeURIComponent 。
     * - Object：遍历所有属性 Key 和值 Value，以 key1=vlaue1&key2=value2 的形式拼接。
     * - Null/Undefined: 返回空字符串 。
     * - 其它值，对其 JSON.stringify 后返回其 encodeURIComponent 。
     *
     * @param {Object} anObject 待转换成 URLQuery 的任意值
     * @returns {string} a url query string.
     */
    static parseURLQuery(anObject: object): string;

    /**
     * 注册 OMApp.Method ，如果注册失败，请留意控制台输出。
     * - 只有 string 或以 string 为键值的 Object 类型可以注册为 Method 。
     *
     * @param method 将作为 OMApp.Method 的属性值
     * @param name 引用注册方法时调用 OMApp.Method 的属性名
     * @return boolean 是否注册成功
     */
    static registerMethod(method: any, name?: string): boolean;


    /*************************** 实例方法 ****************************/

    /**
     * 拓展单个实例属性，请参加静态方法。
     */
    defineProperty(propertyName, descriptor: () => object, ...data: any[]): void;

    /**
     * 拓展多个实例属性，参见静态方法。
     */
    defineProperties(descriptor: () => object, ...data: any[]): void;

    /**
     * 可写。OMApp 事件代理。
     * - 在非 App 环境中，该属性初始化，方便开发者在桌面浏览器中测试。
     * - 一般情况下，这个属性是原生 App 对象，用于接收 HTML 的事件。
     * - 在桌面浏览器中，可以通过设置此属性，来模拟 App 在接收到事件时的行为。
     * - 该属性不需要 omApp.ready 即可使用。
     */
    delegate: _OMAppDelegate/*|((message: OMAppDelegateMessage) => void)|any*/;

    /**
     * 执行 App 的指定的已约定的方法。
     * - 一般情况下，不需要调用此方法；直接使用 OMApp.current 的具体方法即可。
     * - 本访问主要是给拓展 OMApp.current 时使用。
     * - 方法参数可以包含一个回调函数，作为单独参数传入。
     * - 所有交互 callback 执行时，this 指向 window 。
     *
     * @param {OMAppMethod} method 已注册的方法
     * @param {[any]} parameters 方法对应的参数，不包括回调函数
     * @param {() => void} callback 方法的回调函数
     * @return {string} 如果方法有回调函数，将返回回调函数的唯一标识
     */
    perform(method: _OMAppMethod, parameters?: [any], callback?: () => void): string;

    /**
     * 本方法主要是提供给 App 使用。
     * - 因为交互机制的原因，如果 App 不能直接接收回调函数，那么回调函数将被保存起来，并生成唯一ID传递给 App。
     * - App 执行完相应的任务后，通过调用此方法来唤起回调函数执行。
     *
     * @param {string} callbackID
     * @param args 回调函数执行时的参数
     * @return {any} 回调函数的返回值
     */
    dispatch(callbackID: string, ...args: any[]): any;

    /**
     * 拓展 omApp 对象的属性。
     * - 通过此方法拓展的 omApp 属性只能在 ready 之后使用。
     *
     * @param {(configuation: _OMAppConfiguration) => object} descriptor
     */
    extend(descriptor: (configuation: _OMAppConfiguration) => object): OMApp;

    /**
     * 只读。标识当前 OMApp 是否已完成初始化。
     * - 如果操作必须在 OMApp 完成初始化后进行，请在 ready 方法中执行。
     */
    isReady: boolean;

    /**
     * 当 OMApp 实例对象完成初始化时，通过此方法传递的闭包函数会被执行。
     * - 若此方法不调用，omApp 对象不会进行初始化，所有 HTML 与 App 的交互操作都不会执行。
     *
     * @param {() => void} callback 需在 OMApp 实例对象完成初始化后执行的闭包函数
     */
    ready(callback: () => void): OMApp;

    /**
     * App 是否是调试模式。
     * - 在 omApp 完成初始化（ready）之前，此值为 true 。
     * - App 在 ready 方法的回调函数中，返回 App 当前的模式。
     *
     */
    isDebug: boolean;

    /**
     * 读写。获取或设置当前 App 主题。
     * - 更改此属性，将同步更改到 App 中，但不会触发已绑定的主题事件。
     * - 请在 ready 之后中使用。
     */
    currentTheme: _OMAppTheme;

    /**
     * 仅供 App 同步主题时使用。
     * - 调用此方法设置主题，会触发主题更改事件，但是更改不会同步到 App 。
     * - 请在 ready 之后中使用。
     *
     * @param {OMAppTheme} theme 新的主题
     */
    setCurrentTheme(theme: _OMAppTheme): OMApp;

    /**
     * 注册一个监听主题发生改变的闭包函数，可调用多次。
     * - 请在 ready 之后中使用。
     * - 在回调中 this 指向 omApp 。
     *
     * @param {(currentTheme: OMAppTheme) => void} callback
     */
    onCurrentThemeChange(callback: () => void): OMApp;

    /**
     * 触发所有已主题监听。
     * - 请在 ready 之后中使用。
     */
    currentThemeChange(): OMApp;

    /**
     * 发起 App 登录进程。
     * - 请在 ready 之后中使用。
     *
     * @param {(isSuccess: boolean) => void} callback 登录后的回调
     */
    login(callback: (isSuccess: boolean) => void): string;


    /**
     * 绑定一个函数，以监听当前用户或用户信息是否变化。
     * - 请在 ready 之后中使用。
     * - 在回调中 this 指向 omApp 。
     *
     * @param {() => void} callback
     */
    onCurrentUserChange(callback: ()=>void): OMApp;

    /**
     * 触发所有已绑定的用户监听事件。
     * - 请在 ready 之后中使用。
     */
    currentUserChange(): OMApp;

    /**
     * 获取当前 App 已登录的用户。
     * - 请在 ready 之后中使用。
     */
    currentUser: _OMAppUser;

    /**
     * 通过次方来打开 App 指定的页面。
     *
     * @param {OMAppPage} page 指定的页面
     * @param {Object} parameters 打开页面所需的参数
     * @return {string} 回调 ID，此方法无回调，返回 null
     */
    open(page: _OMAppPage, parameters?: object): string;

    /**
     * 封装了 App 管理导航行为的对象，通过此对象来控制 App 页面的导航行为。
     */
    navigation: _OMAppNavigation;

    /**
     * 以模态的方式，打开一个新的 HTML 页面，新打开的页面与当前页面处于不同的导航栈结构中。
     * @param {string} url 要打开的页面的 URL
     * @param {boolean} animated 是否展示动画效果，默认 true
     * @param {() => void} completion
     * @return {string} 回调 ID
     */
    present(url: string, animated?: boolean, completion?: () => void): string;

    /**
     * 关闭已打开的模态页面。如果当前页面是模态出来的页面，则关闭当前的页面，否则关闭当前页面模态出来的页面。
     * @param {boolean} animated
     * @param {() => void} completion
     */
    dismiss(animated: boolean, completion?: () => void): string;

    /**
     * 只读。封装了 App 网络功能的对象。
     */
    networking: _OMAppNetworking;

    /**
     * 调用 App 网络功能发送 HTTP 请求的快捷方法。
     *
     * @param {OMAppHTTPRequest} request 包含网络请求的信息
     * @param {(response: OMAppHTTPResponse) => void} callback 网络请求后的回调
     * @return {string} 回调 ID
     */
    http(request: _OMAppHTTPRequest, callback: (response: _OMAppHTTPResponse) => void): string;

    /**
     * 调用 App 原生 alert 方法。
     * @param {OMAppAlertMessage} message 需要 alert 的消息内容
     * @param {(index: number) => void} callback 按钮事件
     * @return {string} 回调 ID
     */
    alert(message: _OMAppAlertMessage, callback?: (index: number) => void): string;

    /**
     * 只读。封装了 App 提供的各类服务，通过此方法来获取 OMApp 实例对象更多的内容 。
     */
    services: {
        /**
         * 只读。App 数据服务。
         */
        data: {

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
             * @param {OMAppCacheType} cacheType 资源的类型
             * @param {(sourcePath: string) => void} callback 获取缓存资源的回调，获得缓存路径
             * @return {string} 回调 ID
             */
            cachedResourceForURL(url: string, cacheType?: _OMAppCacheType, callback?: (sourcePath: string) => void): string;
        };

        /**
         * 只读。App 事件服务。
         */
        event: {
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
        };

        /**
         * 只读。App 统计分析服务。
         */
        analytics: {

            /**
             * 统计跟踪一条用户行为。
             *
             * @param {string} event        事件名称
             * @param {Object} parameters   参数
             * @return {string} null
             */
            track(event: string, parameters?: object): string;
        };
    };



    /****************** 枚举 *******************/

    /**
     * App 与 HTML 交互机制。
     * - OMApp.Method 列举了 App 所支持的方法。
     * - App 通过 JavaScript 传递的 OMApp.Method 值来区分 HTML 要调用 App 方法。
     * - 所有 OMApp.Method 都是事先约定好的字符串。
     */
    static Method: {
        login: _OMAppMethod;
        open: _OMAppMethod;
        ready: _OMAppMethod;

        setCurrentTheme: _OMAppMethod;

        navigation: {
            push: _OMAppMethod;
            pop: _OMAppMethod;
            popTo: _OMAppMethod;
            bar: {
                setHidden: _OMAppMethod;
                setTitle: _OMAppMethod;
                setTitleColor: _OMAppMethod;
                setBackgroundColor: _OMAppMethod;
            };
        }

        present: _OMAppMethod;
        dismiss: _OMAppMethod;

        networking: {
            http: _OMAppMethod;
        };

        alert: _OMAppMethod;

        services: {
            data: {
                numberOfRowsInList: _OMAppMethod;
                dataForRowAtIndex: _OMAppMethod;
                cachedResourceForURL: _OMAppMethod;
            };
            event: {
                didSelectRowAtIndex: _OMAppMethod;
                elementWasClicked: _OMAppMethod;
            };
            analytics: {
                track: _OMAppMethod;
            };
        };
    };

    /**
     * OMApp.Page 列举了 App 的拥有的页面。
     */
    static Page: {
        mall:      _OMAppPage;
        task:      _OMAppPage;
        news:      _OMAppPage;
        video:     _OMAppPage;
        web:       _OMAppPage;
    };

    /**
     * OMApp.Theme 列举了 App 支持的主题。
     */
    static Theme: {
        day:      _OMAppTheme;
        night:    _OMAppTheme;
    };

    /**
     * OMApp.UserType 列举了 App 已登录用户的类型。
     */
    static UserType: {
        visitor: 	_OMAppUserType;
        google: 	_OMAppUserType;
        facebook: 	_OMAppUserType;
        twitter: 	_OMAppUserType;
    };


    /**
     * OMApp.NetworkingType 列举了 App 可能处于的网络类型。
     */
    static NetworkingType: {
        none: 		_OMAppNetworkingType;
        WiFi: 		_OMAppNetworkingType;
        WWan2G: 	_OMAppNetworkingType;
        WWan3G: 	_OMAppNetworkingType;
        WWan4G: 	_OMAppNetworkingType;
        other: 	    _OMAppNetworkingType;
    };

    /**
     * OMApp.CacheType 列举了 App 的缓存类型。
     */
    static CacheType: {
        image: _OMAppCacheType;
        live: _OMAppCacheType;   // 破解的第三方直播源
    };
}

declare const omApp: OMApp;


/**
 * 描述 App 网路请求信息的接口。
 */
interface _OMAppHTTPRequest {
    url:        string;
    method:     string;
    data?:      object;
    headers?:   object;
}

/**
 * 描述 App 网路请求结果信息的接口。
 */
interface _OMAppHTTPResponse {
    code: number;
    message: string;
    contentType: string;
    data?: any;
}


interface _OMAppCookie {

    /**
     * 设置/删除 Cookie ，如果第二个参数为 undefined 表示获取 Cookie，如果为 null 表示删除 Cookie 。
     *
     * @param {string} name The cookie name
     * @param value The cookie value to be set
     * @return {string} The cookie value for the name
     */
    value(name: string, value: any): _OMAppCookie;

    /**
     * 获取 Cookie 。
     *
     * @param {string} name
     * @returns {string}
     */
    value(name: string): string | undefined;

    /**
     * 为了提高效率，获取 cookie 使用了缓存。调用此方法以强制刷新缓存。
     * 1，如果在使用本框架的提供的方法时，也使用来其它方法操作 Cookie ，那么在使用本框架读取 Cookie 时，可能需要使用此方法来同步缓存。
     * 2，如果只使用本框架操作 Cookie ，无须调用此方法。
     * 最明显的例子就是：
     *  在同一逻辑中，先使用 OMApp.cookie 读取了值，接着又用其它方法修改了此值；
     *  此时，如果不调用此方法的话，再用 OMApp.cookie 读取值，还是修改前的值。
     */
    synchronize(): _OMAppCookie;
}

interface _OMAppUser {

    /**
     * 只读。是否在线。
     */
    isOnline: boolean;

    /**
     * 只读。用户唯一标识。
     */
    id: string;

    /**
     * 只读。用户显示名。
     */
    name: string;

    /**
     * 只读。用户类型。
     */
    type: _OMAppUserType;

    /**
     * 只读。金币数。
     */
    coin: number;

    /**
     * 仅供 App 同步用户标识符时使用。
     * - 调用此方法可能会触发 change 事件。
     *
     * @param {string} newID 用户 ID
     */
    setID(newID: string): _OMAppUser;

    /**
     * 仅供 App 同步用户名时使用。
     * - 调用此方法可能会触发 change 事件。
     *
     * @param {string} newName 用户名
     */
    setName(newName: string): _OMAppUser;

    /**
     * 仅供 App 同步用户类型时使用。
     * - 调用此方法可能会触发 change 事件。
     *
     * @param {string} newType 用户类型
     */
    setType(newType: _OMAppUserType): _OMAppUser;

    /**
     * 仅供 App 同步用户金币数时使用。
     * - 调用此方法可能会触发 change 事件。
     *
     * @param {string} newCoin
     */
    setCoin(newCoin: number): _OMAppUser;

}

/// omApp.navigation 对象
interface _OMAppNavigation {

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
    bar: _OMAppNavigationBar;
}

interface _OMAppNavigationBar {

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

interface _OMAppNetworking {

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
    type: _OMAppNetworkingType;

    /**
     * 仅供 App 同步导航条显示状态时使用。
     * - 调用此方法可能会触发 change 事件。
     *
     * @param {OMAppNetworkingType} newType
     * @return {_OMAppNetworking} 当前对象
     */
    setType(newType: _OMAppNetworkingType): _OMAppNetworking;

    // networkTypeChange(handler): void;

    /**
     * 发送网络请求。
     * @param {OMAppHTTPRequest} request 网络请求对象
     * @param {(response: OMAppHTTPResponse) => void} callback 网络请求回调
     * @return {string} 回调 ID
     */
    http(request: _OMAppHTTPRequest, callback: (response: _OMAppHTTPResponse) => void): string;
}



/**
 * 描述 alert 的接口。
 */
interface _OMAppAlertMessage {
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


/**
 * 枚举 OMApp.Theme.* 的类型。实际上是 string。
 */
interface _OMAppTheme {

}

/**
 * 枚举 OMApp.UserType.* 的类型。实际上是 string。
 */
interface _OMAppUserType {

}

/**
 * 枚举 OMApp.NetworkingType.* 的类型。实际上是 string。
 */
interface _OMAppNetworkingType {

}

/**
 * 枚举 OMApp.Method.* 的类型。实际上是 string。
 */
interface _OMAppMethod {

}

/**
 * 枚举 OMApp.Page.* 的类型。实际上是 string。
 */
interface _OMAppPage {

}

/**
 * 枚举 OMApp.CacheType.* 的类型。实际上是 string。
 */
interface _OMAppCacheType {

}

interface _OMAppConfiguration {
    isDebug: boolean;
    currentTheme: _OMAppTheme;
    currentUser: {
        id: string;
        name: string;
        type: _OMAppUserType;
        coin: number;
    };
    navigation: {
        bar: {
            title: string;
            titleColor: string;
            backgroundColor: string;
            isHidden: boolean;
        };
    };
    networking: {
        type: _OMAppNetworkingType;
    }
}


/**
 * OMAppDelegateAJAXSettings 描述了 omApp.delegate 对象在非 App 环境中，创建的 delegate 对象的全局 ajax 配置。
 */
interface _OMAppDelegateAJAXSettings {
    headers?: object;
    data?: object;
}



/**
 * OMAppDelegate 描述了 omApp 在非 App 环境中时的 delegate 对象。
 */
interface _OMAppDelegate {

    /**
     * 当 HTML 页面完成初始化时，此方法会被调用。
     *
     * @param {(configuration: _OMAppConfiguration) => void} callback
     */
    ready?: (callback: (configuration: _OMAppConfiguration) => void) => void;

    /**
     * 当 HTML 更改了 App 主题时，此方法会被调用。
     * @param {OMApp.Theme} newValue
     */
    setCurrentTheme?: (newValue: _OMAppTheme) => void;

    /**
     * 当 HTML 调用 App 登录功能时，此方法会被调用。
     * @param {(success: boolean) => void} callback 登录结果的回调
     */
    login?: (callback: (success: boolean) => void) => void;

    /**
     * 当 HTML 要打开新的页面时。
     * @param {OMApp.Page} page
     * @param {Object} parameters
     */
    open?: (page: _OMAppPage, parameters?: object) => void;

    /**
     * 模态出新的 HTML 窗口。
     * @param {string} url
     * @param {boolean} animated
     * @param {() => void} completion
     */
    present?: (url: string, animated: boolean, completion: () => void) => void;

    /**
     * 移除模态的 HTML 窗口。
     * @param {boolean} animated
     * @param {() => void} completion
     */
    dismiss?: (animated: boolean, completion?: () => void) => void;

    /**
     * 导航到下级页面。
     * @param {string} url
     * @param {boolean} animated
     */
    push?: (url: string, animated?: boolean) => void;

    /**
     * 导航到上级页面。
     * @param {boolean} animated
     */
    pop?: (animated?: boolean) => void;

    /**
     * 跳转到导航历史中的指定页面。
     * @param {number} index
     * @param {boolean} animated
     */
    popTo?: (index: number, animated?: boolean) => void;

    /**
     * HTML 设置隐藏导航条。
     * @param {boolean} newValue
     * @param {boolean} animated
     */
    setNavigationBarHidden?: (newValue: boolean, animated: boolean) => void;

    /**
     * HTML 设置导航条标题。
     * @param {string} newValue
     */
    setNavigationBarTitle?: (newValue: string) => void;

    /**
     * HTML 设置导航条标题文字颜色。
     * @param {string} newValue
     */
    setNavigationBarTitleColor?: (newValue: string) => void;

    /**
     * HTML 设置导航条背景色。
     * @param {string} newValue
     */
    setNavigationBarBackgroundColor?: (newValue: string) => void;

    /**
     * 统计分析。
     * @param {string} event
     * @param {Object} parameters
     */
    track?: (event: string, parameters?: object) => void;

    /**
     * 展示 alert 。
     * @param message
     * @param parameters
     */
    alert?:(message: _OMAppAlertMessage)=>void;

    /**
     * HTML 发送 App 网络请求。
     * @param {OMAppHTTPRequest} request
     * @param {(response: OMAppHTTPResponse) => void} callback
     */
    http?: (request: _OMAppHTTPRequest, callback: (response: _OMAppHTTPResponse) => void) => void;

    /**
     * HTML 查询某一列表的行数。
     * @param {string} documentName
     * @param {string} listName
     * @param {(count: number) => void} callback
     */
    numberOfRowsInList?: (documentName: string, listName: string, callback: (count: number) => void) => void;

    /**
     * HTML 获取某一列表行的数据。
     * @param {string} documentName
     * @param {string} listName
     * @param {number} index
     * @param {(data: any) => void} callback
     */
    dataForRowAtIndex?: (documentName: string, listName: string, index: number, callback: (data: any) => void) => void;

    /**
     * HTML 页面获取某一 URL 对应的资源。
     * @param {string} url
     * @param {OMAppCacheType} resourceType
     * @param {boolean} automaticallyDownload
     * @param {(filePath: string) => void} callback
     */
    cachedResourceForURL?: (url: string, resourceType: _OMAppCacheType, callback?: (filePath: string) => void) => void;

    /**
     * HTML 的某一列表行被点击事件。
     * @param {string} documentName
     * @param {string} listName
     * @param {number} index
     * @param {() => void} completion
     */
    didSelectRowAtIndex?: (documentName: string, listName: string, index: number, completion?: () => void) => void;

    /**
     * HTML 的某一元素被点击。
     * @param {string} documentName
     * @param {string} elementName
     * @param data
     * @param {(isSelected: boolean) => void} callback
     */
    elementWasClicked?: (documentName: string, elementName: string, data: any, callback: (isSelected: boolean) => void) => void;

    // 以下 App 不需要实现，仅供桌面浏览器调试使用。

    /**
     * 桌面浏览调试时，默认情况下，通过此来设置网络请求的全局参数。
     */
    ajaxSettings?: (newValue?: _OMAppDelegateAJAXSettings) => _OMAppDelegateAJAXSettings;

    /**
     * OMApp 提供的默认 Delegate 发送网络请求的方法。
     *
     * @param {OMAppHTTPRequest} request
     * @param {(response: OMAppHTTPResponse) => void} callback
     */
    ajax?: (request: _OMAppHTTPRequest, callback: (response: _OMAppHTTPResponse) => void) => void;
}


