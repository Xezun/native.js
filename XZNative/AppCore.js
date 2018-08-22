
(function() {
    
    let _core = new AppCore();
    
    Object.defineProperty(window, "core", {
        get: function () {
            return _core;
        }
    });
    
})();

function AppCore() {

}