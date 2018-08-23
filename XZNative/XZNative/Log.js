// XZLog

const XZ_LOG_DEFAULT = 0;
const XZ_LOG_WARNING = 1;
const XZ_LOG_ERROR = 2;

/**
 * 函数，在控制台输出。
 * @param message 输出的内容。
 * @param style 输出样式，可选。0，默认；1，警告；2，错误。
 */
export function XZLog(message, style) {
    if (typeof style !== "number" || style === XZ_LOG_DEFAULT) {
        console.log("%c[XZApp]", "color: #357bbb; font-weight: bold;", message);
    } else if (style === XZ_LOG_WARNING) {
        console.log("%c[XZApp] %c" + message, "color: #357bbb; font-weight: bold;", "background-color: #f18f38; color: #ffffff");
    } else if (style === XZ_LOG_ERROR) {
        console.log("%c[XZApp] %c" + message, "color: #357bbb; font-weight: bold;", "background-color: #e95648; color: #ffffff");
    }
}

/**
 * 将任意对象转换为 URL 查询字符串。
 * @param anObject 对象。
 * @return {*}
 * @private
 */
export function XZURLQuery(anObject) {
    if (!anObject) {
        return "";
    }
    // 1. 数组直接 JSON
    if (Array.isArray(anObject)) {
        return encodeURIComponent(JSON.stringify(anObject));
    }
    switch (typeof anObject) {
        case 'string':
            return encodeURIComponent(anObject);
        case 'object':
            let queryString = "";
            for (let key in anObject) {
                if (!anObject.hasOwnProperty(key)) {
                    continue;
                }
                if (queryString.length > 0) {
                    queryString += ("&" + encodeURIComponent(key));
                } else {
                    queryString = encodeURIComponent(key);
                }
                if (!anObject[key]) {
                    continue;
                }
                if (typeof anObject[key] !== 'string') {
                    queryString += ("=" + encodeURIComponent(JSON.stringify(anObject[key])));
                } else {
                    queryString += ("=" + encodeURIComponent(anObject[key]));
                }
            }
            return queryString;
        case 'undefined':
            return '';
        default:
            return encodeURIComponent(JSON.stringify(anObject));
    }
}