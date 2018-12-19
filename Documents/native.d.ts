// Native.d.ts

/**
 * App 配置，用于 App 初始化。当 native 向 App 发送请求初始化信息后，App 需将包含如下的信息告诉
 * native 开始初始化。
 */
interface NativeConfiguration {

}

/**
 * native 是统一的 JavaScript 访问原生的接口。
 */
declare module native {

    /**
     * 注册与 App 的交互操作。
     * 由于交互方式的不同，JavaScript 环境运行时，与原生的交互并不都是可以立即进行的。所以 native 提供了此接口，
     * 用于注册涉及交互的操作，并在 native 初始化可以进行交互后，按照注册顺序依次执行这些回调函数。如果注册回调时，
     * native 已经可以进行交互，那么回调函数会立即异步执行。
     * 
     * 回调函数中，this 指向 window 。
     * @param {() => void} fn 回调函数。
     */
    function ready(fn: () => void): void;

    /**
     * native 框架通过消息机制与原生进行交互，消息机制包活方法 Native.Method 和执行方法所需的参数，即 
     * {@link native.core.perform(method,...parameters)} 方法，但是为了方便访问，native 提供了
     * 拓展方法，将自定义的交互方法封装成 native 对象的方法，以方便调用。
     * 
     * 在回调函数中 this 指向当前 native 对象。
     * @param callback 构造属性的函数。
     */
    function extend(callback: (configuration: NativeConfiguration) => object): void;

    /// 核心功能，负责与原生代码交互的逻辑。
    const core: {
        /**
         * 注册回调函数。
         *
         * @param  func 待保存的回调函数。
         * @return {string} 保存回调函数所使用的唯一标识符。
         */
        callback(func: (...arg: any[]) => any): string;

        /**
         * 获取指定标识符对应的回调函数。
         *
         * @param {string} identifier 回调函数的唯一标识符。
         * @param needsRemove 获取指定标识符对应的回调函数后是否移除该回调函数，默认移除。
         * @return 指定标识符对应的回调函数，如果不存在，则返回 undefined 。
         */
        callback(identifier: string, needsRemove?: boolean): (...arg: any[]) => any;

        /**
         * 执行原生方法。预定义字符串 method 与原生方法对应，原生代码比较该字符串并调用对应的方法。
         *
         * @param {string} method 预定义的原生方法字符串。
         * @param parameters 原生方法所需的参数。
         */
        perform(method: string, ...parameters: any[]): void;

        /**
         * 注册已注入到 JS 环境注入的原生对象的方法。
         * 原生代码必须调用此方法注册已注入的对象，才能进行 JS 与原生代码按照既定规则交互。
         *
         * @param delegate 一般是注入 JS 中的原生对象。
         * @param mode 交互方法或原生对象能接收的数据类型，详见 Native.Mode 枚举。
         */
        register(delegate: object | ((method: string, parameters: [any]) => void) | null, mode: string): void;

        /**
         * URL 交互方式的协议头，默认 native 。
         */
        scheme: string;

        /**
         * 当前是否已经 ready 。
         */
        isReady: boolean;

        /**
         * 只读。一般时原生对象，与 JS 进行交互的对象。
         */
        delegate: any;

        /**
         * 只读。原生对象能接收的数据类型、交互方式。
         */
        mode: string;
    };
}


/// native 类。
declare module Native {
    /**
     * JavaScript 与原生对象的交互模式。
     */
    enum Mode {
        /**
         * 使用 URL 方式交互。
         */
        url = "url", 
        /**
         * 使用安卓 JS 注入原生对象作为代理：函数参数支持基本数据类型，复杂数据使用 JSON 。
         */
        json = "json",            
        /**
         * 使用 iOS 注入原生对象作为代理：支持所有类型的数据。
         */
        object = "object",       
        /**
         * iOS WebKit 注入 js ，使用函数作为代理。
         */
        javascript = "javascript"
    }
    /**
     * Native.log 控制台文本输出样式。
     */
    enum LogStyle {
        /**
         * 在控制台输出普通文本信息，代码运行过程中的信息输出，用于调试。
         */
        default = 0,
        /**
         * 在控制台输出警告文本信息，用于检测到代码没有按照预定方式运行，但是不影响结果或不清楚是否影响结果时的信息输出。
         */
        warning = 1,
        /**
         * 在控制台输出错误文本信息，当代码执行发生错误时的信息输出。
         */
        error = 2
    }

    /**
     * 注册一个交互方法，如果待注册的方法已注册，则会注册失败，并在控制台输出错误信息。
     * @param name 交互方法名，在 JavaScript 中的命名，用于方便引用。
     * @param value 交换方法值，交互方法值，必须与所有已存在的方法都不相同。
     */
    function Method(name: string, value: string|object): void;

    /**
     * 交互方法枚举。
     */
    enum Method {

    };

    /**
     * 注册一个 Cookie 键，如果待注册的键已注册，则会注册失败，并在控制台输出错误信息。
     * @param cookieKeyName 交互方法名，在 JavaScript 中的命名，用于方便引用。
     * @param cookieKeyValue 交换方法值，交互方法值，必须与所有已存在的方法都不相同。
     */
    function CookieKey(cookieKeyName: string, cookieKeyValue: string): void;

    /**
     * 枚举了框架所用到的 Cookie 键名。
     */
    enum CookieKey {

    }

    /**
     * 框架版本号，本框架使用三位版本号，如 2.0.0 等。
     */ 
    const version: string;
    /**
     * 在控制台输出信息。
     * @param message 待输出的信息。 
     * @param style   文本输出样式。
     * @see Native.LogStyle
     */
    function log(message: string, style?: NativeLogStyle): void;
    /**
     * 将任意对象格式化成 URL 的查询字符串，格式如 key1=value1&key2=value2 ，且已转义，可直接拼接到 URL 中。
     * 
     * @param anObject 待转换成查询字符串的对象。
     */
    function parseURLQuery(anObject: any): string;
    /**
     * 将任意值转换成 URL 查询字段值，已转义。
     * @param aValue URL查询字段值。
     */
    function parseURLQueryValue(aValue: any): string;

    /**
     * 给对象定义属性，如果属性已定义则不执行。
     * @param {object} anObject 待定义属性的对象。
     * @param {string} name 待定义的属性名。
     * @param {object} descriptor 属性描述对象，与 Object.defineProperty 方法参数相同。
     */
    function defineProperty(anObject: any, name: string, descriptor: object): void;

    /**
     * 给对象定义多个属性，忽略已存在的属性。
     * @param {object} anObject 待定义属性的对象。
     * @param {object} descriptors 属性描述对象，与 Object.defineProperties 方法参数相同。
     */
    function defineProperties(anObject: any, descriptors: object): void;
    
    /**
     * 当前框架的 Cookie 管理器模块。相比于直接读取 Cookie ，本模块提供了更便捷的
     * 方法来获取或设置 Cookie ，且在性能上做了优化。
     * 管理器在首次读取 Cookie 时，会将 Cookie 缓存起来，以提高访问效率；
     * 并且在页面每次显示时，重新刷新缓存。
     */
    module cookie {
        /**
         * 读取 Cookie 。
         * @param cookieKey 保存 Cookie 所使用的键。
         */
        function value(cookieKey: string): string?;
        /**
         * 设置 Cookie 。
         * @param cookieKey 键名。
         * @param cookieValue 值。
         * @param cookieExpires 有效期，单位秒，默认 30 天。
         */
        function value(cookieKey: string, cookieValue?: string, cookieExpires?: number): void;
        /**
         * 同步 Cookie ，刷新 Cookie 缓存，下次读取将重新读取。
         */
        function synchronize(): void;
    }
}

declare module native {
    /**
     * 显示 alert 。
     * @param message 
     * @param callback 
     */
    function alert(message: {title: string, body: string, actions?: [string]}, callback: (index: number) => void): void;

}

declare module Native {
    /**
     * 缓存资源的类型。
     */
    enum CachedResourceType {
        image = "image"
    }
}

declare module native {
    /**
     * 数据服务。
     */
    module dataService {

        /**
         * 通过此接口让 App 缓存指定 URL 资源。
         * @param {string} remoteULR 资源的 URL
         * @param {string} cacheType 资源的类型 { @see Native.CachedResourceType }
         * @param {(cacheURL: string) => void} callback 获取缓存资源的回调，获得缓存路径
         * @return {string} 回调 ID
         */
        function cachedResourceForURL(remoteULR: string, cacheType?: string, callback?: (cacheURL: string) => void): string;
    }
}

declare module native {
    /**
     * 事件服务。
     */
    module eventService {
        /**
         * 当页面元素被（不限于）点击时，调用此方法将事件传递给 App 。
         *
         * @param {string} documentName 页面名称
         * @param {string} elementName  元素名称
         * @param data 连同事件包含的数据
         * @param {(isSelected: boolean) => void} callback 回调，表示元素是否可以被选中。
         * @return {string} 回调 ID
         */
        function wasClickedOnElement(documentName: string, elementName: string, data?: any, callback?: (isSelected: boolean) => void): string;
        /**
         * 统计跟踪一条用户行为。
         *
         * @param {string} event        事件名称
         * @param {Object} parameters   参数
         * @return {string} null
         */
        function track(event: string, parameters?: object): string;
    };


}


interface NativeConfiguration {
    navigation: {
        bar: {
            title: string,
            titleColor: string,
            isHidden: boolean,
            backgroundColor: string
        }
    }
}
declare module native {

    /**
     * 页面导航控制器。
     */
    module navigation {

        /**
         * 导航条。
         */
        module bar {
            /**
             * 可写。设置或获取导航条是否隐藏。
             * @description 直接修改属性，会同步到 App 。
             */
            var isHidden: boolean;
            /**
             * 可写。设置或获取导航条标题。
             * @description 直接修改属性，会同步到 App 。
             */
            var title: string;
            /**
             * 可写。设置或获取标题文字颜色。
             * @description 直接修改属性，会同步到 App 。
             */
            var titleColor: string;
            /**
             * 可写。设置或获取导航条背景色。
             * @description 直接修改属性，会同步到 App 。
             */
            var backgroundColor: string;
            /**
             * 隐藏导航条。
             *
             * @param {boolean} animated 是否展示动画效果
             */
            function hide(animated: boolean): void;
            /**
             * 显示导航条。
             *
             * @param {boolean} animated 是否展示动画效果
             */
            function show(animated: boolean): void;
        
            function setHidden(isHidden: boolean): void;
            function setTitle(title: string): void;
            function setTitleColor(titleColor: string): void;
            function setBackgroundColor(backgroundColor: string): void;
        }

        /**
         * App 页面导航行为，进入下级页面，导航栈 +1。
         * @param {string} url 下级页面的 URL
         * @param {boolean} animated 是否展示转场动画
         */
        function push(url: string, animated: boolean): void;
    
        /**
         * App 页面导航行为，弹出导航栈顶页面 -1。
         * @param {boolean} animated 是否展示转场动画
         */
        function pop(animated: boolean): void;
    
        /**
         * App 页面导航行为，弹出导航栈内页面到指定页面。导航栈以 HTML 页面计算。
         * @param {number} index 页面在栈内的索引
         * @param {boolean} animated 是否展示转场动画
         */
        function popTo(index: number, animated: boolean): void;
    }
    
}


declare module Native {
    enum NetworkStatus {
        WiFi = "WiFi"
    }
}
interface NativeConfiguration {
    networking: {
        status: string
    }
}
declare module native {
    module networking {
        /**
         * 只读。网络是否已连通互联网。
         */
        const isReachable: boolean;
    
        /**
         * 是否通过 Wi-Fi 上网。
         */
        const isViaWiFi: boolean;
    
        /**
         * 只读。当前 App 接入网络的类型。
         */
        const status: string;
    
        /**
         * 仅供 App 同步导航条显示状态时使用。
         * - 调用此方法可能会触发 change 事件。
         */
        function setStatus(newStatus: string): void;
    
        function sstatusChange(): void;
        function sstatusChange(fn: () => void): void;
    
        /**
         * 发送 HTTP 请求。
         * @typedef {url: string, method: string, data?: object, headers?: object} NativeHTTPRequest
         * @typedef {code: number, message: string, contentType: string, data?: any} NativeHTTPResponse
         * 
         * @param {NativeHTTPRequest} request 网络请求对象
         * @param {(response: NativeHTTPResponse) => void} callback 网络请求回调
         * @return {string} 回调 ID
         */
        function http(
            request: {url: string, method: string, data?: object, headers?: object}, 
            callback: (response: {code: number, message: string, contentType: string, data?: any}) => void): string;
    }
    
    /**
     * 发送 HTTP 请求。
     * @param {NativeHTTPResponse} request
     * @param {(response: NativeHTTPResponse) => void} callback
     */
    function http(
        request: {url: string, method: string, data?: object, headers?: object}, 
        callback: (response: {code: number, message: string, contentType: string, data?: any}) => void): string;
}

declare module native {
    /**
     * 跳转到指定页面。
     * @param url 页面地址或页面协议。
     */
    function open(url: string): void;
}

declare module native {
    /**
     * @see native.present(0)
     */
    function present(url: string): void;
    /**
     * @see native.present(0)
     */
    function present(url: string, animated: boolean): void;
    /**
     * 打开一个模态窗口。
     * @param url 页面地址或页面协议。
     * @param animated 是否展示转场动画。
     * @param completion 页面转场后的回调。
     * @variation 0
     */
    function present(url: string, animated: boolean, completion: () => void): void;
    /**
     * @see native.present(0)
     */
    function present(url: string, completion: () => void): void;

    /**
     * @see native.dismiss(0)
     */
    function dismiss(): void;
    /**
     * @see native.dismiss(0)
     */
    function dismiss(animated: boolean): void;
    /**
     * 如果当前页面模态窗口，则可以通过此方法移除。
     * @param animated 是否展示转场动画。
     * @param completion 页面转场后的回调。
     * @variation 0
     */
    function dismiss(animated: boolean, completion: () => void): void;
    /**
     * @see native.dismiss(0)
     */
    function dismiss(completion: () => void): void;
}


interface NativeConfiguration {
    currentTheme: string
}
declare module native {

    /**
     * 当前主题。设置此属性，将调用原生方法。原生代码改变主题需调用 setCurrentTheme() 方法。
     */
    const currentTheme: string;

    /**
     * 注册主题变更事件。
     * @param {() => void} fn 回调函数。
     */
    function currentThemeChange(fn: () => void): void;

    /**
     * 发送主题变更事件。
     */
    function currentThemeChange(): void;

    /**
     * 设置当前主题。
     * @param {string} newTheme 新主题。
     * @param {boolean} animated 是否展示动画。
     * @param {boolean} toApp 是否同步到 App 。
     */
    function setCurrentTheme(newTheme: string, animated: boolean, toApp: boolean): void;
}


interface NativeConfiguration {
    currentUser: {
        id: string,
        name: string,
        info: object,
        version: string
    }
}
declare module native {
    /**
     * 当前用户。
     */
    const currentUser: {id: string, name: string, info: object, version: string};

    /**
     * 设置当前用户。
     * @param {Object} newUser
     */
    function setCurrentUser(newUser: {id: string, name: string, info: object, version: string}): void;

    function currentUserChange(fn: () => void): void;
    function currentUserChange(): void;

    /**
     * 调起原生登陆界面。
     * @param callback 登陆回调。
     */
    function login(callback: (currentUser: User) => void): string;
}


















