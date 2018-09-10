// Native.d.ts

declare function NativeLog(message: any, style?: number): void;
declare function NativeParseURLQuery(anObject: any): string;

// declare const native: _Native;

module native {
    /**
     * 只读。方便读取 Cookie 的对象，优化了 Cookie 的读取性能。
     */
    const cookie: {
        /**
         * 读取 Cookie 。
         * @param {string} key 键名。
         * @return {string} 值。
         */
        value(key: string): string;
        /**
         * 写入 Cookie 。
         * @param {string} key 键。
         * @param {string} newValue 值。
         */
        value(key: string, newValue: string): void;
        /**
         * 刷新并同步用来优化 Cookie 性能而使用的缓存。
         */
        synchronize(): void;
    };

    /**
     * 只读。核心功能，负责与原生代码交互的逻辑。
     */
    const core: {
        /**
         * 将回调函数通过唯一标识符保存起来。
         *
         * @param  func 待保存的回调函数。
         * @return {string} 保存回调函数所使用的唯一标识符。
         */
        callback(func: (...arg: any[]) => any): string;

        /**
         * 获取指定标识符对应的回调函数。
         *
         * @param {string} identifier 回调函数的唯一标识符。
         * @param needsRemove 获取指定标识符对应的回调函数后是否移除该回调函数。
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
         * @param nativeObject 一般是注入 JS 中的原生对象。
         * @param nativeType 交互方法或原生对象能接收的数据类型。
         */
        register(nativeObject: any | null, nativeType: NativeType): void;

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
        dataType: NativeType;
    };

    /**
     * 所有与原生交互的操作，必须在 core.ready 之后进行。
     * 回调将在 ready 时执行，如果当前已经 ready 状态，则立即异步执行。
     * @param {() => void} callback 回调函数。
     */
    function ready(callback: () => void): void;

    /**
     * 拓展 native 对象的方法。此方法的回调函数会在 core.ready 之后，但是在 ready(fn) 方法的回调函数之前执行。
     * @param callback 构造属性的函数。
     */
    function extend(callback: (configuration: object) => object): void;

    // Theme

    /**
     * 当前主题。设置此属性，将调用原生方法。原生代码改变主题需调用 setCurrentTheme() 方法。
     */
    const currentTheme: string;

    /**
     * 发送或注册主题变更事件。
     * @param {() => void} callback 回调函数。
     */
    function currentThemeChange(callback?: () => void): void;

    /**
     * 设置当前主题。
     * @param {string} newTheme 新主题。
     * @param {boolean} animated 是否展示动画。
     * @param {boolean} toApp 是否同步到 App 。
     */
    function setCurrentTheme(newTheme: string, animated: boolean, toApp: boolean): void;

    // User
    /**
     * 当前用户。
     */
    const currentUser: {
        id: number;
        name: string;
        info: object;
        version: string;
    };

    /**
     * 设置当前用户。
     * @param {Object} newUser
     */
    function setCurrentUser(newUser: object): void;

    /**
     * 发送或注册当前用户变更事件。
     * @param {() => void} callback
     */
    function currentUserChange(callback?: () => void): void;

    /**
     * 调用 App 原生 alert 方法。
     * @param {_NativeAlertMessage} message 需要 alert 的消息内容
     * @param {(index: number) => void} callback 按钮事件
     * @return {string} 回调 ID
     */
    function alert(message: _NativeAlertMessage, callback?: (index: number) => void): string;

    /**
     * 数据服务。
     */
    const dataService: {
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
         * @param {string} remoteULR 资源的 URL
         * @param {string} cacheType 资源的类型
         * @param {(cacheURL: string) => void} callback 获取缓存资源的回调，获得缓存路径
         * @return {string} 回调 ID
         */
        cachedResourceForURL(remoteULR: string, cacheType?: string, callback?: (cacheURL: string) => void): string;
    };

    /**
     * 事件服务。
     */
    const eventService: {
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
        wasClickedOnElement(documentName: string, elementName: string, data?: any, callback?: (isSelected: boolean) => void): string;
        /**
         * 统计跟踪一条用户行为。
         *
         * @param {string} event        事件名称
         * @param {Object} parameters   参数
         * @return {string} null
         */
        track(event: string, parameters?: object): string;
    };

    /**
     * 网络。
     */
    const networking: {
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
    };

    /**
     * HTML 发送 App 网络请求。
     * @param {_NativeHTTPRequest} request
     * @param {(response: _NativeHTTPResponse) => void} callback
     */
    function http(request: _NativeHTTPRequest, callback: (response: _NativeHTTPResponse) => void): void;


    /**
     * 页面导航管理。
     */
    const navigation: {
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
        bar: {
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
            hide(animated: boolean): void;

            /**
             * 显示导航条。
             *
             * @param {boolean} animated 是否展示动画效果
             */
            show(animated: boolean): void;

            /**
             * 仅供 App 同步导航条显示状态时使用。
             * - 调用此方法可能会触发 change 事件。
             *
             * @param {boolean} isHidden 是否隐藏
             */
            setHidden(isHidden: boolean): void;

            /**
             * 仅供 App 同步导航条标题时使用。
             * - 调用此方法可能会触发 change 事件。
             *
             * @param {string} title
             */
            setTitle(title: string): void;

            /**
             * 仅供 App 同步导航条标题文字颜色时使用。
             * - 调用此方法可能会触发 change 事件。
             *
             * @param {string} titleColor
             */
            setTitleColor(titleColor: string): void;

            /**
             * 仅供 App 同步导航条背景色时使用。
             * - 调用此方法可能会触发 change 事件。
             *
             * @param {string} backgroundColor
             */
            setBackgroundColor(backgroundColor: string): void;
        };
    };
}

module Native {
    const version: string;
    function log(message: string, style?: number);
    function parseURLQuery(anObject: any): string;
    function parseURLQueryValue(aValue: any): string;
}

/**
 * 原生对象的类型。
 */
declare enum NativeType {
    url = "url",                // 使用 URL 方式交互。
    android = "android",        // 使用安卓 JS 注入原生对象作为代理：函数参数支持基本数据类型，复杂数据使用 JSON 。
    iOS = "iOS",                // 使用 iOS 注入原生对象作为代理：支持所有类型的数据。
    javascript = "javascript"   // iOS WebKit 注入 js ，使用函数作为代理。
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



interface _NativeConfiguration {
    currentTheme: string,
    currentUser: {
        id: string,
        name: string,
        info: object,
        version: string
    },
    navigation: {
        bar: {
            title: string,
            titleColor: string,
            isHidden: boolean,
            backgroundColor: string
        }
    },
    networking: {
        status: string
    }
}