function ControllerMain() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(ControllerMain);

var ua = navigator.userAgent.toLowerCase();
var isOldIE = ua.match(/msie/) ? true : false;

(function() {

    var _viewArray = [
        "loginDiv",
        "downloadDiv",
        "playerDiv",
        "loadingDiv",
        "infoViewDiv",
        "TimelineBox",
        "previewDiv",
        "player_bar",
        "preRight",
        "remote-config-app"
    ];

    ControllerMain.appVersion = clientInfo.version;

    ControllerMain.setAppVersion = function(version) {

        $("#app_version").html(version);
    };

    /**
     * 初始化整体页面
     */
    ControllerMain.init = function(uid, username, password, downLoadPath, pluginDes, loginType, language, streamType) {

        var tag = getFuncName(arguments);

        // 初始化设备
        g_device = new Device();
        console.dbg("Created a new device object.");

        ControllerLogin.init && ControllerLogin.init();

        // 初始化popover

        $("#popover_content_wrapper").hide();
        $("#playback_play_popover").hide();
        $("#preview_play_popover").hide();

        ControllerMain.showLoginPage();
        delete this.init;
    };

    /**
     * 初始化顶部控制栏
     */
    ControllerMain.initUI = function() {

        $([
            'cpu_button',
            'path_config_button'
        ]).each(function() {
            $('#' + this).remove();
        });
        // set button listener
        $("#menu_preview_button").on('click', function() {

            if (!PlayerPreview.isRefreshingRightBar) {
                ControllerMain.showPreviewPlayer();
                //ControllerMain.trigger('try_h5_preview');
            }
        });

        $("#menu_playback_button").on('click', function() {
            ControllerMain.showPlaybackPlayer();
        });

        $("#navigation_bar_remoteconfig").on('click', function() {
            if (ControllerLogin.level !== 'admin') {
                return;
            }
            ControllerMain.trigger('gotoRemoteConfig');
        });

        $("#navigation_bar_back").on('click', function() {
            ControllerMain.trigger('logout');
        });

        this.onLogout = function(target) {
            if (!target) { target = ''; }
            var url = target + window.location.pathname + '?' + (new Date()).getTime();
            document.cookie = '';
            window.localStorage.clear();
            if (console.isDebug) {
                url += '&debug=1';
            }
            if (console.isTracing) {
                url += '&trace=1';
            }
            window.location.href = url;
        };

        $(window).on('resize', function() {
            ControllerMain.trigger('resize');
        });

        ControllerMain.on('resize', function() {
            if (ViewManager.getMode() != EnumCurState.PLAYBACK) {
                $('#TimelineBox').hide();
            } else {
                $('#TimelineBox').css({ 'top': $('#preContent').offset().top + $('#preContent').outerHeight() }).show();
            }
            ControllerDownload.resize();
            ControllerSnap.resize();
            ViewManager.updateView();
        });

        ControllerRemoteConfig.init && ControllerRemoteConfig.init();

    };

    /**
     * 引导区
     */
    ControllerMain.boot = function() {
        if (isOldIE) {
            return;
        }
        var loginUID = 0;
        var loginUserName = 0;
        var loginPassword = 0;
        var downLoadPath = 0;
        var pluginDes = 0;
        var loginType = 0;
        var language = 0;
        var streamType = 0;
        // Worning: cgi set interface
        ControllerMain.init(loginUID, loginUserName, loginPassword, downLoadPath, pluginDes, loginType, language, streamType);

        delete this.boot;
    };

    /**
     * 切换到远程配置视图
     */
    ControllerMain.showConfigPage = function() {
        ViewManager.storeScreen();
        for (var i in _viewArray) {
            if (typeof(_viewArray[i]) == 'string')
                $('#' + _viewArray[i]).css({
                    "visibility": 'hidden'
                });
        }
        $('#TimelineBox').hide();
        ControllerMain.hidePlayers();
        $('.fplayer').hide();
        $('#playerDiv').css({ "visibility": 'visible' });
        remoteConfigManager.showPage();
        $('.menu_view_item.selected').removeClass('selected');
        $("#navigation_bar_remoteconfig").addClass("selected");
        $('.view-block').hide();
        $('#preRight_Playback').hide();
        ViewManager.setMode(EnumCurState.CONFIG);
    };

    ControllerMain.hideConfigPage = function() {
        ControllerRemoteConfig.trigger('beforeUnload');
        ControllerRemoteConfig.unbind('beforeUnload');
        remoteConfigManager.hidePage();
    };

    /**
     * 切换到登录视图
     */
    ControllerMain.showLoginPage = function() {
        if($('body').hasClass('no-balanced')){
            $('#default-stream-fluent').attr('checked','checked');
        }
        CGI.setLocation('LOGIN');
        for (var i in _viewArray) {
            if (typeof(_viewArray[i]) == 'string')
                $('#' + _viewArray[i]).css({
                    "visibility": 'hidden'
                });
        }
        $('#loginDiv').css({ "visibility": 'visible' });
        ViewManager.setMode(EnumCurState.LOGIN);
        ChannelManager.setMode(EnumCurState.LOGIN);
        $("#loginDiv").show();
        $('[data-toggle="popover"]').popover('hide');
    };

    /**
     * 切换到消息视图
     */
    ControllerMain.showInfoPage = function(infoType) {
        for (var i in _viewArray) {
            if (typeof(_viewArray[i]) == 'string')
                $('#' + _viewArray[i]).css({ "visibility": 'hidden' });
        }
        $('#infoViewDiv').css({ "visibility": 'visible' });
        ViewManager.setMode(EnumCurState.INFO);
        ChannelManager.setMode(EnumCurState.INFO);


        var infoString = "";
        switch (infoType) {
            case EnumErrorCode.NOT_SUPPORT_CANVAS:
                infoString = "Your browser does not support the canvas, please upgrade your browser!";
                break;
            case EnumErrorCode.NOT_SUPPORT_IE_8:
                infoString = "Your browser does not support the canvas, please upgrade your browser!";
                break;
            case EnumErrorCode.DOWNLOAD_IE_PLUGIN:
                infoString = "Your browser does not support the canvas, please upgrade your browser!";
                break;
            default:
                infoString = "Unknown error was found, please contact with Baichuan!";
                break;
        }
        $("#info_tip_text").text(infoString);

    };

    /**
     * 切换到预览视图
     */
    ControllerMain.showPreviewPlayer = function() {

        if (ViewManager.getMode() == EnumCurState.PREVIEW)
            return;
        try {
            
            if ( !flashCheck() ) {
                BcH5Player.showStatusImg(EnumFlvStatus.normal);
            }
        } catch (error) {
            console.error(error);
        }

        PlayerPreview.waiter.show('Refreshing the channel configurations...');

        CGI.setLocation(EnumCurState.PREVIEW);
        ControllerMain.hideConfigPage();

        ControllerMain.hidePlayers();
        ControllerMain.trigger('switchPreviewMode');
        $('.menu_view_item.selected').removeClass('selected');
        $("#menu_preview_button").addClass("selected");

        var $playerContainer = flashCheck() ? $("#preview_plugin_container") : $('.h5_player_wrapper');

        $playerContainer.removeClass('playbackMode');

        $(['player_bar', 'playerDiv', 'preRight', 'previewDiv']).each(function() {
            $('#' + this).css({ "visibility": 'visible' });
        });

        $('#TimelineBox').css({ "visibility": 'hidden' })
        $("#loginDiv").hide();
        $("#infoViewDiv").hide();
        $("#downloadDiv").hide();

        $("#preRight_Playback").hide();
        //mirror默认隐藏
        $("#pre_image_mirr_container").show();

        $("#preContent").css({
            "bottom": "0px"
        });
        $("#preview_main_ocx").css({
            "bottom": "0px"
        });

        $playerContainer.css({
            "bottom": "55px"
        });

        $('[data-toggle="popover"]').popover('hide');
        ChannelManager.setMode(EnumCurState.PREVIEW);
        ViewManager.storeScreen();
        ViewManager.setMode(EnumCurState.PREVIEW);
        if (!ViewManager.recoverScreen()) {
            ViewManager.setScreenViews(EnumScreenMode.NINE);
            ViewManager.setCurrentPage(0);
        }
        ViewManager.updateView();
        if ( !flashCheck() ) {
            BcH5Player.init();
        }
        if (ViewManager.getSelectedView()) {
            $('#view-block-PREVIEW-' + ViewManager.getSelectedView().getId()).click();
        } else {
            if (!PlayerPreview.isRefreshingRightBar) {
                $('#view-block-PREVIEW-0').click();
            }
        }
    };

    ControllerMain.hidePlayers = function() {
        var m = ChannelManager.getNumber();
        var i = 0;
        if (ChannelManager.get(0).getMode() == EnumCurState.PLAYBACK) {
            for (var i = 0; i < m; ++i) {
                try {
                    if ( flashCheck() ) {
                        FPlayer.close(i);
                    } else {
                        BcH5Player.destroy();
                    }
                } catch (e) {}
            }
        } else {
            for (var i = 0; i < m; ++i) {
                try {
                    if ( flashCheck() ) {
                        FPlayer.stop(i);
                        FPlayer.hide(i);
                    } else {
                        BcH5Player.destroy();
                    }
                } catch (e) {

                }
            }
        }
    }

    ControllerMain.enableAbility = function(ab) {

        $('#previewDiv .ab-enable-' + ab + ' .ui-slider').slider({ 'disabled': false });
        $('#previewDiv .ab-enable-' + ab + ' button').removeAttr('disabled');
        $('#previewDiv .ab-enable-' + ab + ' select').removeAttr('disabled');
        $('#previewDiv .ab-enable-' + ab + ' input').removeAttr('disabled');
    }

    ControllerMain.disableAbility = function(ab) {

        $('#previewDiv .ab-enable-' + ab + ' .ui-slider').slider({ 'disabled': true });
        $('#previewDiv .ab-enable-' + ab + ' button').attr('disabled', true);
        $('#previewDiv .ab-enable-' + ab + ' select').attr('disabled', true);
        $('#previewDiv .ab-enable-' + ab + ' input').attr('disabled', true);
    }

    /**
     * 切换到回放视图
     */
    ControllerMain.showPlaybackPlayer = function() {

        if (ViewManager.getMode() == EnumCurState.PLAYBACK) {
            return;
        }

        try {
            
            if ( !flashCheck() ) {
                BcH5Player.showStatusImg(EnumFlvStatus.normal);
            }
        } catch (error) {
            console.error(error);
        }

        ViewReplaySearch.waiter.show();
        CGI.setLocation(EnumCurState.PLAYBACK);
        ControllerMain.hideConfigPage();

        ControllerMain.hidePlayers();
        ControllerMain.trigger('switchPlaybackMode');
        $('.menu_view_item.selected').removeClass('selected');
        $("#menu_playback_button").addClass("selected");
        $('#TimelineBox').show();
        $(['TimelineBox', 'playerDiv', 'previewDiv']).each(function() {
            $('#' + this).css({ "visibility": 'visible' });
        });
        $(['preRight', 'player_bar']).each(function() {
            $('#' + this).css({ "visibility": 'hidden' })
        });
        $('#preRight_Playback').show();
        $("#loginDiv").hide();
        $("#preRight_Playback").show();
        $("#preContent").css({
            bottom: "176px"
        });
        $("#preview_main_ocx").css({
            bottom: "0px"
        });
        var $playerContainer = flashCheck() ? $("#preview_plugin_container") : $('.h5_player_wrapper');

        $playerContainer.css({
            bottom: "0px"
        });

        $playerContainer.addClass('playbackMode');

        $('[data-toggle="popover"]').popover('hide');

        ChannelManager.setMode(EnumCurState.PLAYBACK);
        ViewManager.storeScreen();
        ViewManager.setMode(EnumCurState.PLAYBACK);
        if (!ViewManager.recoverScreen()) {
            ViewManager.setScreenViews(EnumScreenMode.FOUR);
            ViewManager.setCurrentPage(0);
        }
        ViewManager.updateView();
        g_device.channels.forEach(function(ch) {
            ch.playbackFiles = [];
        });
        g_bcDatePicker.setDate(new Date(), true);

        ViewReplaySearch.isFirstVisited = 0;
        ControllerFlash.setView(ViewManager.getViewObject(0), 0);
        ViewManager.showScreen(EnumScreenMode.ONE);
        $('#view-block-PLAYBACK-0-shutdown').remove();
        // PlayerPlayback.setVolume(50);
        PlayerPlayback.trigger('monthChange', [(new Date()).getFullYear(), (new Date()).getMonth() + 1]);
        $('#TimelineBox').css({ 'top': $('#preContent').offset().top + $('#preContent').outerHeight() });

        PlayerPlayback.resetState();
        ControllerMain.trigger('resize');
        g_pbFileBarCanvas.setScale(1);
        g_pbFileBarCanvas.autoScale();
        g_pbFileBarCanvas.redrawPlaybackTool();
    };

    ControllerMain.resetTitleBar = function() {

        var isCanReplay = g_device.canReplay;

        var $pb_item_view = $("#menu_playback_button");

        if (isCanReplay) {

            $pb_item_view.show();
        } else {

            $pb_item_view.hide();
        }
    };

})();

if (isOldIE) {

    function showOldTips() {
        var outFrame = document.getElementById('old-browser-deny');
        var inFrame = document.getElementById('access-deny');
        var winHeight = window.innerHeight || window.screen.height;
        var winWidth = window.innerWidth || window.screen.width;
        outFrame.style.height = winHeight + 'px';
        outFrame.style.width = winWidth + 'px';
        outFrame.style.display = 'block';
        ControllerMain.boot = function() {};
        inFrame.style.marginTop = (winHeight - 212) / 2 + 'px';
    }

    if (!window.addEventListener) {
        setTimeout(showOldTips, 500);
    } else {
        $(showOldTips);
    }

    document.getElementById('old-browser-deny');

} else {

    $(function onGlobalInit() {

        $('body').append('<img src="img/op-no.png" style="display: none">');
        $('body').append('<img src="img/op-ok.png" style="display: none">');
        $('body').append('<img src="img/loading.gif" style="display: none">');

        PlayerPlayback.init && PlayerPlayback.init();

        PlayerPreview.init && PlayerPreview.init();

        // for the number input fixed.
        $('body').on('change', 'input[type=number]', function() {
            if ($(this).attr('disabled-auto-fixed') !== undefined) {
                return;
            }
            if ($(this).attr('max') !== undefined && $(this).attr('max') !== null) {
                if (parseInt($(this).val()) > parseInt($(this).attr('max'))) {
                    $(this).val($(this).attr('max'));
                }
            }
            if ($(this).attr('min') !== undefined && $(this).attr('max') !== null) {
                if (parseInt($(this).val()) < parseInt($(this).attr('min'))) {
                    $(this).val($(this).attr('min'));
                }
            }
        });
        $('.form_icon').each(function() {
            var $ref = $(this).parent().find('input');
            if ($ref.length == 0) return;
            $(this).css({
                "left": $ref.offset().left - $('.login_form_wrapper').offset().left
            });

        });
        $('#view-login-password').css({
            "left": $('#login_text_password').parent().offset().left - $('.login_form_wrapper').offset().left + $('#login_text_password').parent().width() + 8
        }).on('click', function() {
            if ($('#login_text_password').attr('type').toLowerCase() == 'text') {
                $('#login_text_password').attr('type', "password");
                $(this).attr("src", "img/eye-open.png").attr("title", "Show Password");
            } else {
                $('#login_text_password').attr("type", "text");
                $(this).attr("src", "img/eye-close.png").attr("title", "Hide Password");
            }
        }).show();
        ControllerMain.setAppVersion(ControllerMain.appVersion);
    });
}
