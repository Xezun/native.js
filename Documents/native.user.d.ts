
interface NativeConfiguration {
    currentUser: {
        id: string,
        name: string,
        info: object,
        version: string
    }
}

declare module native {
    /**
     * 当前用户。
     */
    const currentUser: {id: string, name: string, info: object, version: string};

    /**
     * 设置当前用户。
     * @param {Object} newUser
     */
    function setCurrentUser(newUser: {id: string, name: string, info: object, version: string}): void;

    /**
     * 监听用户状态发生改变事件。
     * @param callback 回调函数。
     */
    function currentUserChange(callback: () => void): void;

    /**
     * 直接触发用户状态变更事件，所有监听都将执行。
     */
    function currentUserChange(): void;

    /**
     * 调起原生登陆界面。
     * @param callback 登陆回调。
     */
    function login(callback: (currentUser: {id: string, name: string, info: object, version: string}) => void): string;
}