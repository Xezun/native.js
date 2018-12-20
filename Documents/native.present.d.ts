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