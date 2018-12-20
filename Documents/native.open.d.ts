declare module native {
    /**
     * 跳转到指定页面。
     * @param url 页面地址或页面协议。
     */
    function open(url: string): void;
}