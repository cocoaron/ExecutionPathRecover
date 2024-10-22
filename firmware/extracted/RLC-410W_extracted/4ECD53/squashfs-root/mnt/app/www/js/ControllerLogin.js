function ControllerLogin() {
    throw { "msg": "Don't NEW a singleton," };
}

EventListener.apply(ControllerLogin);

(function() {

    if ((navigator.userAgent.indexOf('MSIE') >= 0) &&
        (navigator.userAgent.indexOf('Opera') < 0)) {
        ControllerLogin.isIE = true;
    } else if (navigator.userAgent.indexOf('Trident') >= 0) {
        ControllerLogin.isIE = true;
    }

    ControllerLogin.init = function() {
        console.dbg('loginTime: ', new Date());
        $('#loginDiv input').on('keydown', function onDocKeydown(e) {
            // 回车按钮监听事件
            var keyCode = 0,
                e = e || event;
            keyCode = e.keyCode || e.which || e.charCode;
            if (13 == keyCode) {
                ControllerLogin.login();
            }
        });
        $("#login_login_button").on('click', function() {
            ControllerLogin.login();
        });

        LoginPageController();

        this.waiter = new ViewWaiting({
            "id": "login-buffer",
            "text": "Logging in..."
        });

        if (window.localStorage.getItem('token')) {
            CGI.sendCommand('GetPerformance', {}, function() {
                ControllerLogin.userName = window.localStorage.getItem('userName');
                ControllerLogin.token = window.localStorage.getItem('token');
                ControllerLogin.waiter.show();
                ControllerLogin.onLogined();
            }, function() {});
        }
        delete this.init;
    };

    ControllerLogin.chkPermission = function(name, rights, channel) {
        switch (rights) {
            case 'write':
                rights = 2;
                break;
            case 'read':
                rights = 4;
                break;
            case 'exec':
                rights = 1;
                break;
            default:
                bc_alert('wrong rights ' + rights + ' in [' + name + '], channel ' + channel, 'error');
        }
        if (channel === undefined) {
            return (this.abilities[name] && (this.abilities[name].permit & rights)) ? true : false;
        } else {
            var chAb = this.abilities.abilityChn[channel];
            return (chAb && chAb[name] && (chAb[name].permit & rights)) ? true : false;
        }
    };

    ControllerLogin.chkVersion = function(name, ver, channel) {
        if (channel === undefined) {
            return (this.abilities[name] && this.abilities[name].ver == ver) ? true : false;
        } else {
            var chAb = this.abilities.abilityChn[channel];
            return (chAb && chAb[name] && (chAb[name].ver == ver)) ? true : false;
        }
    };

    ControllerLogin.login = function() {
        if($('#login_text_username').val() == ''){
            bc_alert('Invalid username.', 'error');
            return;
        }
        ControllerLogin.waiter.show();
        CGI.sendCommand('Login', {
                "User": {
                    "userName": $('#login_text_username').val(),
                    "password": $('#login_text_password').val()
                }
            },
            function(data) {
                ControllerLogin.userName = $('#login_text_username').val();
                ControllerLogin.token = data.Token.name;
                window.localStorage.clear();
                window.localStorage.setItem('token', data.Token.name);
                window.localStorage.setItem('userName', ControllerLogin.userName);
                ControllerLogin.onLogined();
            },
            function(cmd, code, msg) {
                ControllerLogin.waiter.hide();
                CGI.autoErrorHandler(cmd, code, msg);
            });

    };

    ControllerLogin.onLogined = function() {

        ControllerLogin.getChannelStateOntime();

        CGI.login();

        CGI.clearCommands();

        CGI.prepareCommand('GetAbility', {
            "User": {
                "userName": ControllerLogin.userName
            }
        });
        CGI.prepareCommand('GetNetPort', {});
        CGI.prepareCommand('GetDevInfo', {});
        CGI.prepareCommand('GetLocalLink', {});
        CGI.prepareCommand('GetUser', {});

        CGI.commitCommands(function(cmd, data) {

            switch (cmd) {
            case 'GetNetPort':
                ControllerFlash.rtmpPort = data.NetPort.rtmpPort;
                break;
            case 'GetAbility':
                PCE.init(data.Ability);
                ControllerLogin.abilities = data.Ability;
                break;
            case 'GetDevInfo':
                ControllerMain.deviceInfo = data.DevInfo;
                break;
            case 'GetLocalLink':
                g_device.connectionType = data.LocalLink.activeLink;
                break;
            case 'GetUser':
                var userDatas = data.User;
                for(var i = 0; i < userDatas.length; i++){
                    var myUser = userDatas[i];
                    if(myUser.userName == ControllerLogin.userName) {
                        ControllerLogin.level = myUser.level;
                        if (ControllerLogin.level !== 'admin') {
                            $("#navigation_bar_remoteconfig").hide();
                        }
                        return;
                    }
                }

                break;
            default:
                bc_alert('An unexpected result returned.');
                break;
            }

        }, function(cmd, errno, msg) {
            ControllerLogin.waiter.hide();
            CGI.autoErrorHandler(cmd, errno, msg);
        }, function() {

            PlayerPlayback.init && PlayerPlayback.init();

            PlayerPreview.init && PlayerPreview.init();

            if ((ControllerFlash.streamSel = window.localStorage.getItem('/player/default-stream')) === null) {
                if ($('#default-stream-auto').is(':checked')) {
                    if (ControllerLogin.abilities.wifi && ControllerLogin.abilities.wifi.ver > 0) { // For WIFI detected
                        ControllerFlash.streamSel = EnumStreamType.FLUENT;
                    } else {
                        ControllerFlash.streamSel = EnumStreamType.CLEAR;
                    }
                } else if ($('#default-stream-clear').is(':checked')) {
                    console.dbg('Default Stream: Clear');
                    ControllerFlash.streamSel = EnumStreamType.CLEAR;
                } else if ($('#default-stream-extern').is(':checked')) {
                    console.dbg('Default Stream: Balance');
                    ControllerFlash.streamSel = EnumStreamType.BALANCED;
                } else if ($('#default-stream-fluent').is(':checked')) {
                    console.dbg('Default Stream: Fluent');
                    ControllerFlash.streamSel = EnumStreamType.FLUENT;
                }

                window.localStorage.setItem('/player/default-stream', ControllerFlash.streamSel);
            }

            PlayerPreview.previewChangePlayStreamSel(ControllerFlash.streamSel);
            PlayerPlayback.pbChangePlayStreamSel(EnumStreamType.CLEAR);

            ControllerLogin.deviceWillBeginLogin();

            ChannelManager.init(ControllerMain.deviceInfo.channelNum);
            $('title').append(' - ' + ControllerMain.appVersion);

            $("#loginDiv").removeClass("cursor_point");
            $("#login_login_button").attr("disabled", false);
            ViewManager.init && ViewManager.init();
            ControllerFlash.init && ControllerFlash.init();

            ControllerMain.showPreviewPlayer();

            ControllerLogin.deviceDidLoginSuccess();

            if (ControllerMain.deviceInfo.channelNum == 1) {

                if (ControllerLogin.abilities.abilityChn[0] && ControllerLogin.abilities.abilityChn[0].live.ver == 2) {

                    $('#preview_play_balancestream').remove();

                    if (ControllerFlash.streamSel === EnumStreamType.BALANCED) {

                        ControllerFlash.streamSel = EnumStreamType.FLUENT;
                        PlayerPreview.previewChangePlayStreamSel(ControllerFlash.streamSel);
                    }
                }

                $('#pre_toolbar_screen_container').hide();
                setTimeout(function() {
                    ControllerFlash.setView(ViewManager.getViewObject(0), 0);
                    PlayerPreview.initRightViewPos();
                    ViewManager.showScreen(EnumScreenMode.ONE);
                    $('#view-block-PREVIEW-0-shutdown').remove();
                    (!PlayerPreview.isRefreshingRightBar) && $('#view-block-PREVIEW-0').click();
                    if (g_device.connectionType == 'LAN') {
                        $('.view-network-style.view-wifi').removeClass('view-wifi')
                            .addClass('view-lan')
                            .attr('title', 'LAN');
                    }
                }, 100);
            }

            g_device.channelCount = ControllerMain.deviceInfo.channelNum;

            for (var i = 0; i < g_device.channelCount; ++i) {
                g_device.channels.push(new ChannelInfo(i));
            }

            if (!ControllerLogin.chkPermission('sdCard', 'read')) {
                $('#menu_playback_button').remove();
            }

            ControllerLogin.waiter.destroy();
        });

    };

    /**
     * 登录前初始化
     */
    ControllerLogin.deviceWillBeginLogin = function() {
        ControllerMain.initUI && ControllerMain.initUI();
    };


    /**
     * 登录成功重新加载页面
     */
    ControllerLogin.deviceDidLoginSuccess = function() {
        ControllerMain.resetTitleBar();


        g_device.refreshChannels();

        PlayerPreview.reload();

        PlayerPlayback.reload();
    };

    /**
     * 循环请求IPC状态
     */
    ControllerLogin.getChannelStateOntime = function(upgradedCallback, isUpgrading){

        isUpgrading = !!isUpgrading;

        ControllerLogin.timerAutoRefresher && clearInterval(ControllerLogin.timerAutoRefresher);

        ControllerLogin.timerAutoRefresher = setInterval(function(){

            CGI.clearCommands();

            CGI.prepareCommand('GetAbility', {
                "User": {
                    "userName": ControllerLogin.userName
                }
            });

            CGI.prepareCommand('GetDevInfo', {});

            CGI.commitCommands(function(cmd, data) {

                switch (cmd) {
                    case 'GetAbility':
                        PCE.init(data.Ability);
                        ControllerLogin.abilities = data.Ability;
                        break;
                    case 'GetDevInfo':
                        ControllerMain.deviceInfo = data.DevInfo;
                        break;
                    default:
                        bc_alert('alert.unexpected_result');
                        break;
                }

            }, function(cmd, errno, msg) {
                if (!isUpgrading) {
                    CGI.autoErrorHandler(cmd, errno, msg);
                } else {
                    if (errno === -6 && upgradedCallback) {
                        upgradedCallback();
                    }
                }

            });

        },8000);
    }

})();

function getRadioValue(radioName) {
    //通过控件名称获取radio控件所选的值
    var obj;
    obj = document.getElementsByName(radioName);
    if (obj != null) {
        var i;
        for (i = 0; i < obj.length; i++) {
            if (obj[i].checked) {

                var objId = obj[i].id + "_label";
                var obj = document.getElementById(objId);
                var checkVal = obj.innerHTML;
                return checkVal;
            }
        }
    }
    return null;
}


function LoginPageController() {

    this.TAG = "LoginPageController";

    g_device.language = "English";
}
