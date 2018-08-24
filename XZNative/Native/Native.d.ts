// Native.d.ts

const native: _Native;

interface _Native {

    cookie: _Cookie;

    execute(callbackID: string, ...args: any[]): any;
    remove(callbackID: string): _Native;
    perform(method: string, parameters: [any], callback: () => void): string;

    scheme: string;

    register(nativeObject, nativeType): _Native;

    ready(callback: () => void): _Native;

    extend(callback: (configuation: object, ...args: any[]) => object, ...args: any[]): _Native;

    // Theme

    currentTheme: string;
    currentThemeChange(callback?: () => void): void;
    setCurrentTheme(newTheme: string, animated: boolean, toApp: boolean): void;

    // User

    currentUser: _User;
    setCurrentUser(newUser: object): void;
    currentUserChange(callback?: () => void): void;
}

interface _Cookie {
    value(key: string): any;
    value(key: string, newValue: any): _Native;
    synchronize(): _Native;
}

interface _User {
    id: number;
    name: string;
    info: object;
    version: string;
}

function NLog(message: any, style?: number): void;
function NativeParseURLQuery(anObject: any): void;