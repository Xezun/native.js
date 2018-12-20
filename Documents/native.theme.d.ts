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