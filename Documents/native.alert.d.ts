
declare module native {

    /**
     * 显示 alert 。
     * @param message alert 内容。
     * @param callback 回调函数，用于接收点击了按钮。
     * @returns 回调函数的标识符
     */
    function alert(message: {title: string, body: string, actions?: [string]}, callback: (index: number) => void): string;

}