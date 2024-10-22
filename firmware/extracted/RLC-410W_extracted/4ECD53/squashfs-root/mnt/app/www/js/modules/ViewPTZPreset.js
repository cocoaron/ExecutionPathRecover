
/**
 * ViewPTZPreset 类负责 预览界面的 PTZ 预置点和巡航控制
 */
function ViewPTZPreset() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(ViewPTZPreset);

(function() {

    var $presetVessel;
    var $cruiseVessel;

    var $presetDelButton;
    var $presetCallButton;
    var $presetSetButton;
    var $presetRenameButton;

    var $patrolRunButton;
    var $patrolStopButton;
    var $patrolModifyButton;

    var _preset_menu_sel = EnumPrePresetMenuType.PRESET;

    this.refreshPresetMenuSel = function() {

        if (EnumPrePresetMenuType.PRESET == _preset_menu_sel) {

            $("#pre_preset_menu_preset_view").addClass("pre_preset_menu_item_sel");
            $("#pre_preset_menu_cruise_view").removeClass("pre_preset_menu_item_sel");
            $("#pre_preset_preset_container").show();
            $("#pre_preset_cruise_container").hide();

        } else if (EnumPrePresetMenuType.CRUISE == _preset_menu_sel) {

            $("#pre_preset_menu_preset_view").removeClass("pre_preset_menu_item_sel");
            $("#pre_preset_menu_cruise_view").addClass("pre_preset_menu_item_sel");
            $("#pre_preset_preset_container").hide();
            $("#pre_preset_cruise_container").show();
        }
    };

    this.initUI = function() {

        $("#pre_preset_menu_preset_view").click(function(event) {

            if (_preset_menu_sel == EnumPrePresetMenuType.PRESET) {

                return;
            }
            _preset_menu_sel = EnumPrePresetMenuType.PRESET;
            ViewPTZPreset.refreshPresetMenuSel();

        });

        $("#pre_preset_menu_cruise_view").click(function(event) {
            if (_preset_menu_sel == EnumPrePresetMenuType.CRUISE) {
                return;
            }

            _preset_menu_sel = EnumPrePresetMenuType.CRUISE;
            ViewPTZPreset.refreshPresetMenuSel();
        });

        $presetCallButton = $('#ptz_preset_call_btn');
        $presetDelButton = $('#ptz_preset_del_btn');
        $presetSetButton = $('#ptz_preset_set_btn');

        $patrolRunButton = $('#ptz_cruise_run_btn');
        $patrolStopButton = $('#ptz_cruise_stop_btn');
        $patrolModifyButton = $('#ptz_cruise_modify_btn');

        $presetVessel = $('#pre_preset_preset_listContainer');
        $cruiseVessel = $('#pre_preset_cruise_listContainer');

        $presetVessel.on('click', 'div', function(e) {

            if (e.target.nodeName != 'SPAN' && e.target.nodeName != 'DIV') {
                return;
            }

            var preset = ViewPTZPreset.getSelectedPreset();

            if ($(e.target).hasClass('pre_preset_list_name')) {
                if ($(this).hasClass('selected')) {
                    if ($(this).find('input').length == 0) {
                        $(this).find('.pre_preset_list_name').html('<input maxlength="' + ViewPTZPreset.maxNameLength + '" type="text" id="preset-name-modifier">');
                        $('#preset-name-modifier').val(preset.name).focus();
                        return;
                    }
                }
            }

            if (!$(this).hasClass('selected') && $presetVessel.find('input').length > 0) {
                var newName = $presetVessel.find('input').val();
                if (newName == preset.name) {
                    $presetVessel.find('.selected .pre_preset_list_name').text(newName);
                } else {
                    ViewPTZPreset.renamePresetPoint(preset, newName);
                }
                return;
            }

            $presetVessel.find('.selected').removeClass('selected');
            $(this).addClass('selected');

            if ($(this).find('.pre_preset_list_status').text() == 'Set') {
                $('#ptz_preset_controllers button').removeAttr('disabled');
            } else {
                $('#ptz_preset_controllers button').attr('disabled', true);
                $presetSetButton.removeAttr('disabled').text('Set');
            }
        });

        $presetVessel.on('dblclick', 'div', function(e) {

            if (e.target.nodeName != 'SPAN' && e.target.nodeName != 'DIV') {
                return;
            }

            if ($(e.target).hasClass('pre_preset_list_name')) {
                return;
            }

            if ($(this).find('.pre_preset_list_status').text() == 'Set') {
                $presetCallButton.click();
            } else {
                $presetSetButton.click();
            }

            return false;
        });

        $cruiseVessel.on('click', 'a', function() {
            $cruiseVessel.find('.selected').removeClass('selected');
            $(this).addClass('selected');
            if ($(this).find('.pre_preset_list_status').text() == 'Running') {
                $('#ptz_cruise_controllers button').removeAttr('disabled');
                $patrolRunButton.attr('disabled', true);
            } else {
                $('#ptz_cruise_controllers button').attr('disabled', true);
                $patrolRunButton.removeAttr('disabled');
            }
            $patrolModifyButton.removeAttr('disabled');
        });

        $presetDelButton.on('click', function() {
            var point = ViewPTZPreset.getSelectedPreset();
            if (!point) {
                return;
            }
            ViewPTZPreset.removePresetPoint(point);
        });

        $presetSetButton.on('click', function() {
            var point = ViewPTZPreset.getSelectedPreset();
            if (!point) {
                return;
            }

            ViewPTZPreset.setPresetPoint(point);

        });

        $presetCallButton.on('click', function() {
            var point = ViewPTZPreset.getSelectedPreset();
            if (!point) {
                return;
            }
            if (point.enable) {
                ViewPTZPreset.callPresetPoint(point);
            } else {
                $(this).attr('disable', true);
            }
        });

        $patrolRunButton.on('click', function() {
            var patrol = ViewPTZPreset.getSelectedPatrol();
            if (!patrol) {
                return;
            }
            if (!patrol.running) {
                ViewPTZPreset.runPatrol(patrol);
            } else {
                $(this).attr('disable', true);
            }
        });

        $patrolStopButton.on('click', function() {
            var patrol = ViewPTZPreset.getSelectedPatrol();
            if (!patrol) {
                return;
            }
            if (patrol.running) {
                ViewPTZPreset.stopPatrol(patrol);
            } else {
                $(this).attr('disable', true);
            }
        });

        $patrolModifyButton.on('click', function() {
            var patrol = ViewPTZPreset.getSelectedPatrol();
            if (!patrol) {
                return;
            }
            ControllerPatrolModifier.show(patrol);
        });

        delete this.initUI;
    };

    this.callPresetPoint = function(point) {
        PlayerPreview.waiter.show('Calling PTZ-Preset point...');
        CGI.sendCommand('PtzCtrl', {
            "channel": point.channel,
            "op": "ToPos",
            "speed": ViewPTZAction.speed,
            "id": point.id
        }, function() {
            PlayerPreview.waiter.hide();
        }, function(cmd, errno, msg) {
            PlayerPreview.waiter.hide();
            CGI.autoErrorHandler(cmd, errno, msg);
        });
    };

    this.runPatrol = function(patrol) {
        if (patrol.running != 0) {
            return;
        }
        PlayerPreview.waiter.show('Starting a PTZ-Patrol...');
        CGI.sendCommand('PtzCtrl', {
            "channel": patrol.channel,
            "op": "StartPatrol",
            "id": patrol.id
        }, function() {
            $patrolRunButton.attr('disabled', true);
            $patrolStopButton.removeAttr('disabled');
            patrol.running = 1;
            ViewPTZAction.isPatrolRunning = patrol.id;
            $('[patrol-id=' + patrol.id + ']').find('.pre_preset_list_status').text('Running');
            PlayerPreview.waiter.hide();
        }, function(cmd, errno, msg) {
            PlayerPreview.waiter.hide();
            CGI.autoErrorHandler(cmd, errno, msg);
        });
    };

    this.stopPatrol = function(patrol) {
        if (patrol.running == 0) {
            return;
        }
        PlayerPreview.waiter.show('Stopping a PTZ-Patrol...');
        CGI.sendCommand('PtzCtrl', {
            "channel": patrol.channel,
            "op": "StopPatrol",
            "id": patrol.id
        }, function() {
            patrol.running = 0;
            ViewPTZAction.isPatrolRunning = false;
            $patrolRunButton.removeAttr('disabled');
            $patrolStopButton.attr('disabled', true);
            $('[patrol-id=' + patrol.id + ']').find('.pre_preset_list_status').text('Idle');
            PlayerPreview.waiter.hide();
        }, function(cmd, errno, msg) {
            PlayerPreview.waiter.hide();
            CGI.autoErrorHandler(cmd, errno, msg);
        });
    };

    this.renamePresetPoint = function(point, newName) {
        var enableTarget = point.enable,
            enableOld = point.enable;
        var oldName = point.name;
        if (newName.trim() == '') {
            ViewPTZPreset.refreshView();
            $('[preset-id=' + point.id + ']').click();
            return;
        }
        point.name = newName;
        if (point.enable) {
            delete point.enable;
        } else {
            point.enable = enableTarget = 1;
        }
        PlayerPreview.waiter.show('Renaming a PTZ-Preset point...');
        CGI.sendCommand('SetPtzPreset', { "PtzPreset": point }, function() {
            point.enable = enableTarget;
            ViewPTZPreset.refreshView();
            $('[preset-id=' + point.id + ']').click();
            PlayerPreview.waiter.hide();
        }, function(cmd, errno, msg) {
            point.name = oldName;
            point.enable = enableOld;
            CGI.autoErrorHandler(cmd, errno, msg);
            PlayerPreview.waiter.hide();
        });
    };

    this.removePresetPoint = function(point) {
        PlayerPreview.waiter.show('Removing PTZ-Preset point...');
        point.enable = 0;
        CGI.sendCommand('SetPtzPreset', { "PtzPreset": point }, function() {
            point.name = 'pos' + point.id;
            ViewPTZPreset.refreshView();
            $('[preset-id=' + point.id + ']').click();
            PlayerPreview.waiter.hide();
        }, function(cmd, errno, msg) {
            CGI.autoErrorHandler(cmd, errno, msg);
            PlayerPreview.waiter.hide();
        });
    };

    this.savePatrol = function(patrol) {
        PlayerPreview.waiter.show('Saving PTZ-Patrol settings...');
        patrol.enable = 1;
        delete patrol.name;
        CGI.sendCommand('SetPtzPatrol', { "PtzPatrol": patrol }, function() {
            ViewPTZPreset.refreshView();
            $('[patrol-id=' + patrol.id + ']').click();
            PlayerPreview.waiter.hide();
        }, function(cmd, errno, msg) {
            CGI.autoErrorHandler(cmd, errno, msg);
            PlayerPreview.waiter.hide();
        });
    };

    this.setPresetPoint = function(point) {
        if ($presetVessel.find('input').length > 0) {
            if ($presetVessel.find('input').val() == "") {
                return;
            }
            point.name = $presetVessel.find('input').val();
        }
        PlayerPreview.waiter.show('Setting PTZ-Preset point...');
        point.enable = 1;
        CGI.sendCommand('SetPtzPreset', { "PtzPreset": point }, function() {
            ViewPTZPreset.refreshView();
            $('[preset-id=' + point.id + ']').click();
            PlayerPreview.waiter.hide();
        }, function(cmd, errno, msg) {
            CGI.autoErrorHandler(cmd, errno, msg);
            PlayerPreview.waiter.hide();
        });
    };

    this.getSelectedPreset = function() {
        var ch = ControllerFlash.getSelectedChannelInfo();
        var $selected = $presetVessel.find('.selected');

        if (!ch || $selected.length == 0) {
            return null;
        }

        return ch.data.ptzPreset[parseInt($selected.attr('preset-id')) - 1];
    };

    this.getSelectedPatrol = function() {
        var ch = ControllerFlash.getSelectedChannelInfo();
        var $selected = $cruiseVessel.find('.selected');

        if (!ch || $selected.length == 0) {
            return null;
        }

        return ch.data.ptzPatrol[parseInt($selected.attr('patrol-index'))];
    };

    this.maxNameLength = 16;

    this.refreshView = function() {

        var ch = ControllerFlash.getSelectedChannelInfo();

        $('.pre_preset_preset_list_base_item').remove();

        if (!ch) {
            return;
        }

        $('.ptz-preset-modifier').hide();
        $('.ptz-preset-normal').show();

        var presetData = ch.data.ptzPreset;
        var patrolData = ch.data.ptzPatrol;
        if (ControllerLogin.chkVersion("ptzPreset", EnumPatrolType.NORMAL, ch.index) && ControllerLogin.chkPermission('ptzPreset', 'exec', ch.index)) {

            this.maxNameLength = ch.limits.ptzPreset.name.maxLen;

            for (var j = 0; j < presetData.length; ++j) {
                var presetPoint = presetData[j];
                $presetVessel.append('<div class="' +
                    'pre_preset_preset_list_base_item pre_preset_preset_list_item' +
                    '" preset-id="' +
                    presetPoint.id +
                    '">' +
                    '<span class="pre_preset_preset_list_item_item pre_preset_list_id">' +
                    presetPoint.id +
                    '</span>' +
                    '<span class="pre_preset_preset_list_item_item pre_preset_list_name" title="' + presetPoint.name + '">' + presetPoint.name + '</span>' +
                    '<span class="pre_preset_preset_list_item_item pre_preset_list_status">' + (presetPoint.enable ? 'Set' : 'Unused') + '</span>' +
                    '</div>');
                if (presetPoint.name.trim().length == 0) {
                    $('[preset-id=' + presetPoint.id + ']').addClass('noname').find('.pre_preset_list_name').text('--noname--');
                }
            }
        }

        if (ControllerLogin.chkVersion("ptzPatrol", EnumPatrolType.NORMAL, ch.index) && ControllerLogin.chkPermission('ptzPatrol', 'exec', ch.index)) {
            for (var j = 0; j < patrolData.length; ++j) {
                var patrolLine = patrolData[j];
                $cruiseVessel.append('<a patrol-index="' + j + '" class="' +
                    'pre_preset_preset_list_base_item pre_preset_preset_list_item' +
                    '" href="javascript:void(0)" patrol-id="' +
                    patrolLine.id +
                    '">' +
                    '<span class="pre_preset_preset_list_item_item pre_preset_list_id">' +
                    patrolLine.id +
                    '</span>' +
                    '<span class="pre_preset_preset_list_item_item pre_preset_list_name">Cruise Path 0</span>' +
                    '<span class="pre_preset_preset_list_item_item pre_preset_list_status">' + (patrolLine.running ? 'Running' : 'Idle') + '</span>' +
                    '</a>');
            }

        }

        if( $presetVessel.children().length == 0 ) {
            $('#pre_preset_preset_container').hide();
            if( $cruiseVessel.children().length != 0 ) {
                $('.prev_preset_menu_container').hide();
            }
        }
    };

}).apply(ViewPTZPreset);
