// NativeMethod.js

const NativeMethod = Object.freeze({
    ready: "ready",
    alert: "alert",
    dataService: Object.freeze({
        cachedResourceForURL: "dataService/cachedResourceForURL",
        numberOfRowsInList: "dataService/numberOfRowsInList",
        dataForRowAtIndex: "dataService/dataForRowAtIndex"
    }),
    eventService: Object.freeze({
        track: "eventService/track",
        documentElementWasClicked: "eventService/documentElementWasClicked",
        documentElementDidSelect: "eventService/documentElementDidSelect"
    }),
    login: "login",
    navigation: Object.freeze({
        push: "navigation/push",
        pop: "navigation/pop",
        popTo: "navigation/popTo",
        bar: Object.freeze({
            setHidden: "navigation/bar/setHidden",
            setTitle: "navigation/bar/setTitle",
            setTitleColor: "navigation/bar/setTitleColor",
            setBackgroundColor: "navigation/bar/setBackgroundColor"
        })
    }),
    networking: Object.freeze({
        http: "networking/http"
    }),
    open: "open",
    present: "present",
    dismiss: "dismiss",
    setCurrentTheme: "setCurrentTheme"
});

Object.defineProperty(this, "NativeMethod", {
    get: function() {
        return NativeMethod;
    }
});

module.exports = NativeMethod;