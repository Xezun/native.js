
declare interface NativeConfiguration {
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