
/**
 * ViewPTZAction 类负责 预览界面的 PTZ 动作控制
 */
function ViewPTZAction() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(ViewPTZAction);

(function() {

    ViewPTZAction.zoomFocusTimer = null;  // zoom-focus 滑动操作控制器：延时是为了避免频繁请求

    ViewPTZAction.zoomFocusStepTimer = null;  // zoom-focus 单步点击操作控制器

    ViewPTZAction.getZoomFocusTimer_1 = null;  // 单步点击操作或发送stop之后获取最新的zoom-focus信息：延时是为了等待操作完成

    ViewPTZAction.getZoomFocusTimer_2 = null;  // 操作zoom之后获取最新的focus值：定时去获取focus值，直至获取的值不再变化

    ViewPTZAction.zoomFocusTriggerTime = null;  // 记录按下 zoom-focus 单步操作的时间
    ViewPTZAction.zoomFocusSSTimer = null;  // 进行单步操作时，发送多一条“ptzCtrl”的计时器

    ViewPTZAction.zoomFocusOp = null;  // zoomPos || focusPos

    ViewPTZAction.speed = 32;

    ViewPTZAction.autoTimer = null;

    ViewPTZAction.isPatrolRunning = false;

    ViewPTZAction.on('channelChange', function(chId) {
        this.channel = chId;
        $("#slider_ptz_speed").slider({
            "value": this.getPTZSpeed()
        });
        this.speed = this.getPTZSpeed();
    });

    ViewPTZAction.isAutoWillStop = function() {

        var viewObj = ViewManager.getSelectedView();

        if (viewObj !== null) {

            var channel = viewObj.getChannelId();

            if (ControllerLogin.abilities.abilityChn[channel]) {

                return ControllerLogin.abilities.abilityChn[channel].ptzType.ver === EnumPTZType.GM8136S_PTZ;
            }
        }

        return false;
    };

    // 获取ptzspeed
    ViewPTZAction.getPTZSpeed = function() {
        var viewObj = ViewManager.getSelectedView();
        if (viewObj !== null) {
            var channel = viewObj.getChannelId();
            var channelObj = ChannelManager.get(channel);
            if ((channel !== null) && (channel >= 0 && channel < ChannelManager.getNumber())) {
                return channelObj.getPTZSpeedValue();
            } else {
                return 32;
            }
        } else {
            return 32;
        }
    };

    // 单步操作 或 PtzCtrl 命令后，获取 zoom-focus 位置
    ViewPTZAction.getZoomFocusPos = function() {
        CGI.sendCommand('GetZoomFocus', {
            "channel": ViewPTZAction.channel
        }, function(res) {
            $('#ptz-zoom').slider('option', 'value', res.ZoomFocus.zoom.pos);
            g_device.channels[ViewPTZAction.channel].data.zoom_focus['zoom'].pos = $('#ptz-zoom').slider('value');
            $('#ptz-focus').slider('option', 'value', res.ZoomFocus.focus.pos);
            g_device.channels[ViewPTZAction.channel].data.zoom_focus['focus'].pos = $('#ptz-focus').slider('value');

            var actionSource = $('.being-action.ptz-action-cmd-v2');
            if(actionSource.length == 0) {
                return;
            }
            actionSource.removeClass('being-action');
            if(actionSource.attr('title').indexOf('Zoom') != -1) {  // 操作的是 focus
                if( ViewPTZAction.getZoomFocusTimer_2 ) {
                    clearInterval(ViewPTZAction.getZoomFocusTimer_2);
                }
                ViewPTZAction.getZoomFocusTimer_2 = setInterval(function() {
                    CGI.sendCommand('GetZoomFocus', {
                        "channel": ViewPTZAction.channel
                    }, function(res) {
                        if(res.ZoomFocus.focus.pos === $('#ptz-focus').slider('value')) {
                            clearInterval(ViewPTZAction.getZoomFocusTimer_2);
                        } else {
                            $('#ptz-focus').slider('option', 'value', res.ZoomFocus.focus.pos);
                            g_device.channels[ViewPTZAction.channel].data.zoom_focus['focus'].pos = $('#ptz-focus').slider('value');
                        }
                    }, function(cmd, errno, msg) {
                        CGI.autoErrorHandler(cmd, errno, msg);
                    });
                }, 2000);
            }
        }, function(cmd, errno, msg) {
            CGI.autoErrorHandler(cmd, errno, msg);
        });
    }

    ViewPTZAction.on('ptzAction', function(ac) {

        if (this.isPatrolRunning !== false) {
            $('[patrol-id=' + this.isPatrolRunning + ']').click();
            $('#ptz_cruise_stop_btn').click();
            return;
        }

        if (this.status != 'idle') {

            if (this.status != 'stopping' && this.action == 'Auto') {

                this.trigger('ptzRelease');
            }
            return;
        }

        this.action = ac;

        var params = {
            "channel": this.channel,
            "op": ac,
            "speed": this.speed
        };

        this.status = 'sending';

        CGI.sendCommand('PtzCtrl', params, function() {

            if (ViewPTZAction.status == 'stopping') {

                ViewPTZAction.status = 'working';
                ViewPTZAction.trigger('ptzRelease');

            } else {

                if (ViewPTZAction.action === "Auto") {

                    ViewPTZAction.autoTimer = setTimeout(function() {

                        ViewPTZAction.status = "idle";
                        ViewPTZAction.autoTimer = null;

                    }, 60000);
                }

                ViewPTZAction.status = 'working';
            }

            ViewPTZAction.action = ac;

            console.dbg('PTZ Start Action -', ac);

        }, function(cmd, errno, msg) {

            CGI.autoErrorHandler(cmd, errno, msg);

            if (ViewPTZAction.status == 'stopping') {
                ViewPTZAction.status = 'working';
                ViewPTZAction.trigger('ptzRelease');
            } else {
                ViewPTZAction.status = 'working';
            }

        });
    });

    ViewPTZAction.on('ptzRelease', function() {

        if (this.status == 'idle') {
            return;
        }

        if (this.isPatrolRunning !== false) {
            $('[patrol-id=' + this.isPatrolRunning + ']').click();
            $('#ptz_cruise_controllers').click();
            return;
        }
        if (this.status == 'stopping') {
            return;
        }
        if (this.status == 'sending') {
            this.status = 'stopping';
            return;
        }

        if (this.status == 'working') {

            this.status = 'sendingStop';

            setTimeout(function() {
                CGI.sendCommand('PtzCtrl', {
                    "channel": ViewPTZAction.channel,
                    "op": "Stop"
                }, function() {

                    if (ViewPTZAction.autoTimer) {

                        clearTimeout(ViewPTZAction.autoTimer);
                        ViewPTZAction.autoTimer = null;
                    }

                    ViewPTZAction.status = 'idle';
                    ViewPTZAction.action = 'none';

                    if( PCE.getFeatureVersion('ptzCtrl', ViewPTZAction.channel) == 2 ) {
                        if( ViewPTZAction.getZoomFocusTimer_1 ) {
                            clearTimeout(ViewPTZAction.getZoomFocusTimer_1);
                        }
                        ViewPTZAction.getZoomFocusTimer_1 = setTimeout(ViewPTZAction.getZoomFocusPos, 1000);
                    }
                    
                    console.dbg('PTZ Stopped.');

                }, CGI.autoErrorHandler);
            }, 200);
        }
    });

    ViewPTZAction.initUI = function() {

        this.status = 'idle';
        this.action = 'none';

        this.acting = false;
        this.actingAuto = false;

        // ptz speed
        $("#slider_ptz_speed").slider({
            range: "min",
            value: ViewPTZAction.getPTZSpeed(), // g_plugin.preview.getPreviewPTZSpeed(),
            min: 1,
            max: 64,
            slide: function(event, ui) {
                ViewPTZAction.speed = ui.value;
                if (ChannelManager.get(ViewPTZAction.channel)) {
                    ChannelManager.get(ViewPTZAction.channel).setPTZSpeedValue(ui.value);
                }
                $("#amount_ptz_speed").val(ui.value);
            }
        });

        $("#amount_ptz_speed").val(ViewPTZAction.speed = $("#slider_ptz_speed").slider("value"));

        // preview ptz direction button

        function releasePTZDirection(e) {

            if ($(this).attr('ptz-ac') == 'Auto' || ViewPTZAction.action == 'Auto') {
                return;
            }

            if ($(this).attr('ptz-ac') != ViewPTZAction.action) {
                return;
            }

            ViewPTZAction.trigger('ptzRelease');
        };


        $(".ptz-action-cmd").each(function() {
            $(this)
                .on('blur', releasePTZDirection)
                .on('mouseup', function(e) {

                    if (e.button != 0 || $(this).attr('ptz-ac') == 'Auto' || ViewPTZAction.action == 'Auto') {
                        return;
                    }

                    ViewPTZAction.trigger('ptzRelease');
                })
                .on('mouseleave', releasePTZDirection)
                .mousedown(function(e) {
                    if (e.button != 0) { return; }
                    ViewPTZAction.trigger('ptzAction', [$(this).attr('ptz-ac')]);
                });
        });

        $("#ptz_dir_center").mousedown(function(e) {
            if (e.button != 0) { return; }
            ViewPTZAction.trigger('ptzAction', ["Auto"]);
        });

        delete this.initUI;
    };


    ViewPTZAction.refreshView = function() {


        var chId = ViewPTZAction.channel;
        var ch = g_device.channels[chId];
        if(PCE.getFeatureVersion('ptzCtrl', chId) == 2) {
            $('#ptz_dir_control_container').addClass('ptzctrl-version2');
            // 添加滑杆滑动监听事件
            $(['focus', 'zoom']).each(function() {
                $('#ptz-' + this).prop('outerHTML', '<div id="ptz-' + this + '"></div>');
                (function(eId) {
                    $('#ptz-' + eId).slider({
                        "range": "min",
                        "value": ch.data.zoom_focus[eId].pos,
                        "min": ch.limits.zoom_focus[eId].pos.min,
                        "max": ch.limits.zoom_focus[eId].pos.max,
                        "step": 1,
                        "stop": function(eve) {  // 300ms 内滑动多次，只发送一次请求

                            if( ViewPTZAction.zoomFocusTimer ) {
                                clearTimeout( ViewPTZAction.zoomFocusTimer );
                            }
                            ViewPTZAction.zoomFocusTimer = setTimeout(function() {
                                ch.data.zoom_focus[eId].pos = $('#ptz-' + eId).slider('value');
                                if(eId == 'zoom') {
                                    ViewPTZAction.zoomFocusOp = 'ZoomPos';
                                } else {
                                    ViewPTZAction.zoomFocusOp = 'FocusPos';
                                }
                                CGI.sendCommand('StartZoomFocus', {
                                    "ZoomFocus": {
                                        'channel': ViewManager.getSelectedView().getChannelId(),
                                        'pos': $('#ptz-' + eId).slider('value'),
                                        'op': ViewPTZAction.zoomFocusOp
                                    }
                                }, function() {
                                    if(ViewPTZAction.zoomFocusOp == 'ZoomPos') {
                                        if( ViewPTZAction.getZoomFocusTimer_2 ) {
                                            clearInterval(ViewPTZAction.getZoomFocusTimer_2);
                                        }
                                        var wait6Secs = 0;
                                        ViewPTZAction.getZoomFocusTimer_2 = setInterval(function() {
                                            CGI.sendCommand('GetZoomFocus', {
                                                "channel": ViewPTZAction.channel
                                            }, function(res) {
                                                if(wait6Secs <= 6) {
                                                    wait6Secs += 2;
                                                    $('#ptz-focus').slider('option', 'value', res.ZoomFocus.focus.pos);
                                                    ch.data.zoom_focus['focus'].pos = $('#ptz-focus').slider('value');
                                                } else {
                                                    if(res.ZoomFocus.focus.pos === $('#ptz-focus').slider('value')) {
                                                        clearInterval(ViewPTZAction.getZoomFocusTimer_2);
                                                    } else {
                                                        $('#ptz-focus').slider('option', 'value', res.ZoomFocus.focus.pos);
                                                        ch.data.zoom_focus['focus'].pos = $('#ptz-focus').slider('value');
                                                    }
                                                }
                                            }, function(cmd, errno, msg) {
                                                CGI.autoErrorHandler(cmd, errno, msg);
                                            });
                                        }, 2000);
                                    }
                                }, function(cmd, errno, msg) {
                                    CGI.autoErrorHandler(cmd, errno, msg);
                                });
                            }, 300);
                        }
                    });
                })(this);
            });

            $('#ptz_upgraded_base_control_container .ptz-action-cmd-v2').each(function() {

                $(this)
                .off('blur')
                .on('blur', function() {
                    ViewPTZAction.trigger('ptzRelease');
                })
                .off('mouseup')
                .on('mouseup', function(e) {
                    if (e.button != 0) {
                        return;
                    }
                    if( ViewPTZAction.zoomFocusTriggerTime && (new Date().getTime() - ViewPTZAction.zoomFocusTriggerTime <= 1000) ) { // 按下单步操作按钮不超过1s，不需要多发送一条“PtzCtrl”命令
                        clearTimeout(ViewPTZAction.zoomFocusSSTimer);
                    } else {
                        ViewPTZAction.trigger('ptzRelease');  // 按下单步操作按钮超过1s，会多发送一条“PtzCtrl”命令，松开需要发送“stop”命令
                    }
                })
                .off('mouseleave')
                .on('mouseleave', function() {
                    if( ViewPTZAction.zoomFocusTriggerTime && (new Date().getTime() - ViewPTZAction.zoomFocusTriggerTime <= 1000) ) {  // 作用同 mouseup
                        clearTimeout(ViewPTZAction.zoomFocusSSTimer);
                    } else {
                        ViewPTZAction.trigger('ptzRelease');
                    }
                })
                .off('mousedown')
                .on('mousedown',function(e) {
                    if (e.button != 0) {
                        return;
                    }

                    var source = $(e.target);
                    ViewPTZAction.zoomFocusTriggerTime = new Date().getTime();
                    var op = '';
                    switch(source.attr('ptz-ac')) {
                        case 'ZoomDec':
                            op = 'ZoomStepDec';
                            break;
                        case 'ZoomInc':
                            op = 'ZoomStepInc';
                            break;
                        case 'FocusDec':
                            op = 'FocusStepDec';
                            break;
                        case 'FocusInc':
                            op = 'FocusStepInc';
                            break;
                        default:
                            break;
                    }
                    if(! op) {
                        return false;
                    }
                    
                    if( ! ViewPTZAction.zoomFocusStepTimer ) {
                        ViewPTZAction.zoomFocusStepTimer = setTimeout(function() {
                            source.addClass('being-action'); // 用来后续判断点击的是zoom还是focus
                            CGI.sendCommand('PtzCtrl', {
                                "channel": ViewPTZAction.channel,
                                "op": op,
                                "speed": ViewPTZAction.speed
                            }, function() {
                                ViewPTZAction.zoomFocusStepTimer = null;
                                if(ViewPTZAction.getZoomFocusTimer_1) {
                                    clearTimeout(ViewPTZAction.getZoomFocusTimer_1);
                                }
                                ViewPTZAction.getZoomFocusTimer_1 = setTimeout(function() {
                                    ViewPTZAction.getZoomFocusPos();
                                }, 1000);
                            }, function(cmd, errno, msg) {
                                ViewPTZAction.zoomFocusStepTimer = null;
                                CGI.autoErrorHandler(cmd, errno, msg);
                            });
                        }, 0);
                    }

                    if(ViewPTZAction.zoomFocusSSTimer) {
                       clearTimeout(ViewPTZAction.zoomFocusSSTimer);
                       ViewPTZAction.zoomFocusSSTimer = null; 
                    }
                    ViewPTZAction.zoomFocusSSTimer = setTimeout(function() {
                        source.addClass('being-action');
                        ViewPTZAction.trigger('ptzAction', [source.attr('ptz-ac')]);
                    }, 1000);
                });

            });
        } else {
            $('#ptz_upgraded_base_control_container').remove();
        }

    };

})();

