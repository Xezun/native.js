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
    }


}