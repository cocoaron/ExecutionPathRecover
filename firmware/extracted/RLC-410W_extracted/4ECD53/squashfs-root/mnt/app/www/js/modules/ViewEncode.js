
/**
 * ViewEncode 类负责 预览界面的编码控制
 */
function ViewEncode() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(ViewEncode);

(function() {

    var _originalResolution = undefined; // 此变量用于暂存上次保存的 resolution 值
    var _originalProfile = undefined;    // 此变量用于暂存上次保存的 profile 值

    var isResolutionChange = false,
        isProfileChange = false;

    ViewEncode.getCurrentData = function() {  // 返回当前码流的相关配置
        var chObj = ControllerFlash.getSelectedChannel();
        if (!chObj) {
            return null;
        }

        if (this.isMainStream()) {

            if(_originalResolution == undefined) {
                _originalResolution = g_device.channels[chObj.getId()].data.encode.mainStream.size;
            }
            if(_originalProfile == undefined) {
                _originalProfile = g_device.channels[chObj.getId()].data.encode.mainStream.profile;
            }
            return g_device.channels[chObj.getId()].data.encode.mainStream;
        } else {

            if(_originalResolution == undefined) {
                _originalResolution = g_device.channels[chObj.getId()].data.encode.subStream.size;
            }
            if(_originalProfile == undefined) {
                _originalProfile = g_device.channels[chObj.getId()].data.encode.subStream.profile;
            }
            return g_device.channels[chObj.getId()].data.encode.subStream;
        }
    };

    ViewEncode.getAllData = function() {
        var chObj = ControllerFlash.getSelectedChannel();
        if (!chObj) {
            return null;
        }

        return g_device.channels[chObj.getId()].data.encode;
    };

    ViewEncode.getCurrentSetting = function() {

        var chObj = ControllerFlash.getSelectedChannel();
        if (!chObj) {
            return null;
        }
        var setting = this.pickRange(chObj);
        if (this.isMainStream()) {
            return setting.mainStream;
        } else {
            return setting.subStream;
        }
    };

    ViewEncode.pickRange = function(chObj) {
        var settings = g_device.channels[chObj.getId()].limits.encode;
        var data = g_device.channels[chObj.getId()].data.encode;
        var setting = null;
        for (var i = 0; i < settings.length; ++i) {
            if (data.mainStream.size == settings[i].mainStream.size) {
                setting = settings[i];
                break;
            }
        }
        return setting;
    };

    ViewEncode.isMainStream = function() {
        return ($('#record-stream-select').val() == 'main');
    };

    ViewEncode.disableAll = function() {
        $('#basic-encode-settings *').attr('disabled', true);
    };

    ViewEncode.enableAll = function() {

        $('#basic-encode-settings *').removeAttr('disabled');
    };

    ViewEncode.refreshView = function() {
        $('#encode-resolution-select').html('');
        $('#encode-frame-rate-select').html('');
        $('#encode-maxinum-bit-select').html('');

        var chObj = ControllerFlash.getSelectedChannel();
        ControllerMain.disableAbility('enc');

        if (!chObj) {
            return;
        }
        ControllerMain.enableAbility('enc');

        var setting = this.getCurrentSetting();
        var data = this.getCurrentData();
        var ranges = g_device.channels[chObj.getId()].limits.encode;
        var audio = g_device.channels[chObj.getId()].data.encode.audio;

        if (this.isMainStream()) {

            if (audio !== undefined && chObj.getId() < ControllerMain.deviceInfo.audioNum) {

                $('#record-audio-select-vessel').show();

                if ($('#record-audio-select').is(':checked') != audio) {

                    $('#record-audio-select').click();
                }

            } else {

                $('#record-audio-select-vessel').hide();
            }

            for (var i = 0; i < ranges.length; ++i) {

                $('#encode-resolution-select').append('<option value="' + ranges[i].mainStream.size + '">' + ranges[i].mainStream.size + '</option>');
            }
        } else {
            $('#record-audio-select-vessel').hide();
            $('#encode-resolution-select').append('<option value="' + setting.size + '">' + setting.size + '</option>');
        }

        $('#encode-resolution-select').val(data.size);


        for (var i = 0; i < setting.bitRate.length; ++i) {
            $('#encode-maxinum-bit-select').append('<option value="' + setting.bitRate[i] + '">' + setting.bitRate[i] + '</option>');
        }

        for (var i = 0; i < setting.frameRate.length; ++i) {
            $('#encode-frame-rate-select').append('<option value="' + setting.frameRate[i] + '">' + setting.frameRate[i] + '</option>');
        }

        if (setting.profile) {
            $('#encode-profile-select').html('');
            for (var i = 0; i < setting.profile.length; ++i) {
                $('#encode-profile-select').append('<option value="' + setting.profile[i] + '">' + setting.profile[i] + '</option>');
            }
            $('#encode-profile-select').val(data.profile);
            $('#encode-profile-select-vessel').show();
        } else {
            $('#encode-profile-select-vessel').hide();
        }

        $('#encode-maxinum-bit-select').val(data.bitRate);
        $('#encode-frame-rate-select').val(data.frameRate);

        if (!ControllerLogin.chkPermission('enc', 'write', chObj.getId())) {
            ControllerMain.disableAbility('enc');
        }
    };

    ViewEncode.initUI = function() {

        isResolutionChange = false;
        isProfileChange = false;

        $('#record-stream-select').on('change', function() {  // 码流更改：encode其他配置可取值范围可能发生变化

            _originalResolution = undefined;
            _originalProfile = undefined;
            ViewEncode.refreshView();
        });

        $('#encode-resolution-select').on('change', function() {

            var chObj = ControllerFlash.getSelectedChannel();

            if (!chObj) {
                return;
            }

            ViewEncode.getCurrentData().size = $(this).val();

            var data = g_device.channels[chObj.getId()].data.encode;
            var range = ViewEncode.pickRange(chObj);

            if (ViewEncode.isMainStream()) { // 强制修改为默认码率和帧率
                data.subStream.bitRate = range.subStream.default.bitRate;
                data.subStream.frameRate = range.subStream.default.frameRate;

                data.mainStream.bitRate = range.mainStream.default.bitRate;
                data.mainStream.frameRate = range.mainStream.default.frameRate;
            }
            ViewEncode.refreshView();
        });

        $('#record-audio-select').on('click', function() {
            var data = ViewEncode.getAllData();
            if (data.audio !== undefined) {
                data.audio = $(this).is(':checked') ? 1 : 0;
            }
        });

        $('#encode-frame-rate-select').on('change', function() {

            ViewEncode.getCurrentData().frameRate = parseInt($(this).val());

        });

        $('#encode-maxinum-bit-select').on('change', function() {

            ViewEncode.getCurrentData().bitRate = parseInt($(this).val());

        });

        $('#encode-profile-select').on('change', function() {

            ViewEncode.getCurrentData().profile = $(this).val();

        });

        $('#preview_commit_encode').on('click', function() {

            $(this).attr('disabled', true);

            var chObj = ControllerFlash.getSelectedChannel();

            if (!chObj) {
                return;
            }

            PlayerPreview.waiter.show('Saving encode settings...');

            if(ViewEncode.getCurrentData().size != _originalResolution) {
                isResolutionChange = true;
                _originalResolution = ViewEncode.getCurrentData().size;
            }

            if(ViewEncode.getCurrentData().profile != _originalProfile) {
                isProfileChange = true;
                _originalProfile = ViewEncode.getCurrentData().profile;
            }

            var data = g_device.channels[chObj.getId()].data.encode;
            CGI.sendCommand('SetEnc', {
                "Enc": data
            }, function() {
                PlayerPreview.waiter.hide();
                if (isProfileChange || isResolutionChange) {
                    bc_alert('Save encoding configuration successfully.<br>Now device will reboot, please wait and login later.', 'ok');
                    setTimeout(function() {
                        ControllerMain.onLogout();
                    }, 3000);
                } else {
                    bc_alert('Save encoding configuration successfully.', 'ok');
                }

                isResolutionChange = false;
                isProfileChange = false;
                _originalResolution = undefined;
                _originalProfile = undefined;

                $('#preview_commit_encode').removeAttr('disabled');
            }, function(cmd, errno, msg) {
                PlayerPreview.waiter.hide();
                CGI.autoErrorHandler(cmd, errno, msg);
                $('#preview_commit_encode').removeAttr('disabled');
            });

        });

        delete this.initUI;

    };


})();
