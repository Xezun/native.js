function OMLog(message) {
    OMApp.log( (new Date()).getTime() + " " + message, OMAppLogLevelDefault);
}

OMLog("开始");

$(function () {
    OMLog("JQuery ready.");
    
    $("table#test .version").text(OMApp.version);
    $("table#test .user_name").text(omApp.currentUser.name);
    
    omApp.onCurrentUserChange(function () {
        $("table#test .user_name").text(this.currentUser.name);
        if (this.currentUser.isOnline) {
            $("table#test .loginButton").val("已登录").attr("disabled", true);
        } else {
            $("table#test .loginButton").val("登录").attr("disabled", false);
        }
    });
    
    $("table#test .loginButton").click(function () {
        omApp.login(function (isSuccess) {
            OMLog("登录结果：" + isSuccess);
        });
    });
    
    $("table#test .themeName").text(omApp.currentTheme);
    omApp.onCurrentThemeChange(function () {
        $(document.body).toggleClass("night", this.currentTheme === OMApp.Theme.night);
        $("table#test .themeName").text(this.currentTheme);
    });
    
    $("table#test .changeThemeButton").click(function () {
        if (omApp.currentTheme === OMApp.Theme.day) {
            omApp.setCurrentTheme(OMApp.Theme.night);
        } else {
            omApp.setCurrentTheme(OMApp.Theme.day);
        }
    });
    
    var pages = [OMApp.Page.task, OMApp.Page.mall, OMApp.Page.news, OMApp.Page.video, OMApp.Page.web];
    for (var i = 0; i < pages.length; i++) {
        $("table#test .pages").append("<option value='"+ pages[i] +"'>"+ pages[i].toUpperCase() +"</option>");
    }
    
    $("table#test .openPageButton").click(function () {
        var value = $("table#test .pages").val();
        omApp.open(value, null);
    });
    
    omApp.services.data.cachedResourceForURL("live://onsports/1/1", "live", function (sourcePath) {
        $("video").attr('src', sourcePath);
    });
    
    omApp.present("http://www.baidu.com", true, function () {
        console.log("Did Present Baidu.com");
    });
    
    omApp.http({
        url: document.location.href, // 'http://17.dev.arabsada.com/api/shop/shop_index'
        method: "GET"
    }, function (response) {
        if (response.code !== 0) {
            OMLog("网络请求发生错误");
        } else {
            OMLog("网络请求结果：" + response.data);
        }
    });
    
    omApp.alert({
        title: "Alert Title",
        body: "Alert Body",
        actions: ["OK", "Cancel"]
    }, function (index) {
        console.log(index);
    });
    
    omApp.onCurrentUserChange(function () {
        $(".username").text(omApp.currentUser.name);
    });
});



$.holdReady(true);
omApp.ready(function () {
    OMLog("omApp 初始化已经完成");
    $.holdReady(false);
});




// 模拟 App

if (!OMApp.isInApp) {
    
    omApp.delegate.ready = function (callback) {
        OMLog("App 开始初始化 omApp。");
        window.setTimeout(function () {
            callback({
                isDebug: false,
                currentTheme: OMApp.Theme.day,
                currentUser: {
                    id: "0",
                    name: "Visitor " + parseInt(Math.random() * 100),
                    type: OMApp.UserType.visitor,
                    coin: 0
                },
                navigation: {
                    bar: {
                        title: "Onemena",
                        titleColor: "#000",
                        backgroundColor: "#FFF",
                        isHidden: false
                    }
                },
                networking: {
                    type: OMApp.NetworkingType.WiFi
                }
            });
        });
        OMLog("App 完成初始化 omApp。");
    };
    
    omApp.delegate.push = function (url) {
        window.open(url);
    };
    
    omApp.delegate.login = function (callback) {
        OMLog("App 登录：Super Man 。");
        $("div#login").css('display', "block");
        window.setTimeout(function () {
            $("div#login").css('display', "none");
            window.omApp.currentUser.setID("0");
            omApp.currentUser.setName("Super Man");
            window.omApp.currentUser.setType(OMApp.UserType.facebook);
            window.omApp.currentUser.setCoin(100020);
            callback(true);
        }, 2000);
    };
    
    omApp.delegate.open = function (page, parameters) {
        $("table#test .pageName").text("Page: "+ page + ", "+ JSON.stringify(parameters));
    };
    
}
