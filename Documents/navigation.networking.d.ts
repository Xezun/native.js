declare module Native {
    /**
     * 网络状态。
     */
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
    /**
     * 网络框架。
     */
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
    
        /**
         * 触发网络状态变更事件。
         */
        function statusChange(): void;
        
        /**
         * 监听网络状态变化。
         * @param callback 回调函数。
         */
        function statusChange(callback: () => void): void;
    
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