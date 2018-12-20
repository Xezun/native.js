
declare module Native {
    /**
     * 缓存资源的类型。
     */
    enum CachedResourceType {
        /**
         * 图片缓存。
         */
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