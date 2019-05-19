// Native.d.ts

/**
 * NativeLog 控制台文本输出样式。
 */
declare enum NativeLogStyle {
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
 * JavaScript 与原生对象的交互模式。
 */
declare enum NativeMode {
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
 * 将任意对象格式化成 URL 的查询字符串，格式如 key1=value1&key2=value2 ，且已转义，可直接拼接到 URL 中。
 * 
 * @param anObject 待转换成查询字符串的对象。
 */
declare function NativeParseURLQuery(anObject: any): string;

/**
 * 将任意值转换成 URL 查询字段值，已转义。
 * @param aValue URL查询字段值。
 */
declare function NativeParseURLQueryComponent(aValue: any): string;

/**
 * 在控制台输出信息。
 * @param message 待输出的信息。 
 * @param style   文本输出样式。
 * @see NativeLogStyle
 */
declare function NativeLog(message: string, style?: NativeLogStyle): void;

/**
 * 注册交互方法，同时该属性也是所有已注册的交互方法的对象。
 * 1. 如果交互方法已注册，则会注册失败，并在控制台输出错误信息。
 * 2. 通过点语法，按方法名获取已注册的方法。
 * 
 * @param name 交互方法名，在 JavaScript 中的命名，用于方便引用。
 * @param value 交换方法值，交互方法值，必须与所有已存在的方法都不相同。
 */
declare const NativeMethod: ((name: string, value: string|object) => void) | object;

/**
 * 注册交互事件。
 */
declare const NativeAction: ((name: string, value: string|object) => void) | object;

/**
 * 注册 Cookie 键，同时该属性也是获取所有已注册键的对象。
 * 1. 如果键已注册，则会注册失败，并在控制台输出错误信息。
 * 2. 通过点语法，按方法名获取已注册的键值。
 * 
 * @param cookieKeyName 交互方法名，在 JavaScript 中的命名，用于方便引用。
 * @param cookieKeyValue 交换方法值，交互方法值，必须与所有已存在的方法都不相同。
 */
declare const NativeCookieKey: ((cookieKeyName: string, cookieKeyValue: string) => void) | object;

/**
 * native 是统一的 JavaScript 访问原生的接口。
 */
declare module native {
    /**
     * 只读，交互模式。决定交互时所使用的数据类型。
     */
    const mode: string;

    /**
     * 只读。一般时原生对象，与 JS 进行交互的对象。
     */
    const delegate: any;

    /**
     * URL 交互方式的协议头，默认 native 。
     */
    const scheme: string;

    /**
     * 当前是否已经 ready 。
     */
    const isReady: boolean;

    /**
     * 执行原生方法。预定义字符串 method 与原生方法对应，原生代码比较该字符串并调用对应的方法。
     *
     * @param {string} method 预定义的原生方法字符串。
     * @param parameters 原生方法所需的参数。
     */
    function performMethod(method: string, ...parameters: any[]): void;

    /**
     * 获取指定标识符对应的回调函数。
     *
     * @param {string} identifier 回调函数的唯一标识符。
     * @param needsRemove 获取指定标识符对应的回调函数后是否移除该回调函数，默认移除。
     * @return 指定标识符对应的回调函数，如果不存在，则返回 undefined 。
     */
    function callback(identifier: string, needsRemove?: boolean): (...arg: any[]) => any;

    /**
     * 注册回调函数。
     *
     * @param  func 待保存的回调函数。
     * @return {string} 保存回调函数所使用的唯一标识符。
     */
    function callback(func: (...arg: any[]) => any): string;

    /**
     * 注册一个原生可以调用的方法。
     * @param actionName 方法名。
     * @param imp 方法实现。
     */
    function addActionTarget(actionName: string, imp: (...arg: any[]) => any): void;

    /**
     * 删除已注册的方法。
     * @param actionName 方法名。
     * @param imp 方法实现。
     */
    function removeActionTarget(actionName: string, imp: (...arg: any[]) => any): void;

    /**
     * 原生调用 H5 已注册的方法。
     * @param actionName 方法名。
     * @param parameters 方法参数。
     */
    function sendAction(actionName: string, ...parameters: any[]): any | [any];

    /**
     * 注册在 native 初始化完成后执行的操作。
     * @param {() => void} fn 回调函数，this 指向 window 。
     */
    function ready(fn: () => void): void;

    /**
     * 原生通过此方法初始化 native 对象，执行 NativeAction.ready 的便利方法。
     * @param delegate 接收交互消息的对象。
     * @param mode 交互模式。
     * @param configuration native 的初始化配置信息。
     */
    function ready(delegate: any, mode: number, configuration: NativeConfiguration): void;

    /**
     * native 框架通过消息机制与原生进行交互，消息机制包活方法 Native.Method 和执行方法所需的参数，即 
     * {@link native.performMethod(method,...parameters)} 方法，但是为了方便访问，native 提供了
     * 拓展方法，将自定义的交互方法封装成 native 对象的方法，以方便调用。
     * 
     * 在回调函数中 this 指向当前 native 对象。
     * @param callback 构造属性的函数。
     */
    function extend(callback: (configuration: NativeConfiguration) => object): void;

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
        function value(cookieKey: string): string;

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


/**
 * App 配置，用于 App 初始化。当 native 向 App 发送请求初始化信息后，App 需将包含如下的信息告诉
 * native 开始初始化。
 */
interface NativeConfiguration {

}








































