
/**
 * ViewISP 类负责预览界面的 ISP 控制
 */
function ViewISP() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(ViewISP);

(function() {
    var _batchOp = false;

    ViewISP.restoreDefault = function(chId) {
        var ch = ControllerFlash.getSelectedChannelInfo();
        var fieldOptions, fieldData;

        if (!ch) {
            return; // 无选中
        }

        this.restoring = true;

        fieldOptions = ch.limits.isp;
        fieldData = ch.initials.isp;

        $('#pv-adv-channel').val(fieldData.channel);

        $('#pv-gain-begin').val(fieldData.gain.min);
        $('#pv-gain-end').val(fieldData.gain.max);

        $('#pv-shutter-begin').val(fieldData.shutter.min);
        $('#pv-shutter-end').val(fieldData.shutter.max);

        $('#pv-red-gain').slider({
            "min": fieldOptions.redGain.min,
            "max": fieldOptions.redGain.max,
            "value": fieldData.redGain
        });

        $('#pv-blue-gain').slider({
            "min": fieldOptions.blueGain.min,
            "max": fieldOptions.blueGain.max,
            "value": fieldData.blueGain
        });

        $('#pv-gain-begin').attr({
            "max": fieldOptions.gain.max,
            "min": fieldOptions.gain.min,
            "title": fieldOptions.gain.min + '~' + fieldOptions.gain.max
        }).val(fieldData.gain.min);

        $('#pv-gain-end').attr({
            "max": fieldOptions.gain.max,
            "min": fieldOptions.gain.min,
            "title": fieldOptions.gain.min + '~' + fieldOptions.gain.max
        }).val(fieldData.gain.max);

        $('#pv-shutter-begin').attr({
            "max": fieldOptions.shutter.max,
            "min": fieldOptions.shutter.min,
            "title": fieldOptions.shutter.min + '~' + fieldOptions.shutter.max
        }).val(fieldData.shutter.min);

        $('#pv-shutter-end').attr({
            "max": fieldOptions.shutter.max,
            "min": fieldOptions.shutter.min,
            "title": fieldOptions.shutter.min + '~' + fieldOptions.shutter.max
        }).val(fieldData.shutter.max);

        $('#pv-blc').slider({
            "min": fieldOptions.blc.min,
            "max": fieldOptions.blc.max,
            "value": fieldData.blc
        });

        $('#pv-drc').slider({
            "min": fieldOptions.drc.min,
            "max": fieldOptions.drc.max,
            "value": fieldData.drc
        });

        if ($('#pv-3d-nr').is(':checked') != fieldData.nr3d) { $('#pv-3d-nr').click(); }

        $('#pv-anti-flicker').html('');
        $(fieldOptions.antiFlicker).each(function() {
            $('#pv-anti-flicker').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-anti-flicker').val(fieldData.antiFlicker);

        $('#pv-exposure').html('');
        $(fieldOptions.exposure).each(function() {
            $('#pv-exposure').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-exposure').val(fieldData.exposure).trigger('change');

        $('#pv-exposure').html('');
        $(fieldOptions.exposure).each(function() {
            $('#pv-exposure').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-exposure').val(fieldData.exposure).trigger('change');

        $('#pv-white-balance').html('');
        $(fieldOptions.whiteBalance).each(function() {
            $('#pv-white-balance').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-white-balance').val(fieldData.whiteBalance).trigger('change');

        $('#pv-backlight').html('');
        var EnumBackLightNames = {
            "DynamicRangeControl": "Dynamic Range",
            "BackLightControl": "Back-Light",
            "Off": "Off"
        };

        $(fieldOptions.backLight).each(function() {
            $('#pv-backlight').append('<option value="' + this + '">' + EnumBackLightNames[this] + '</option>');
        });
        $('#pv-backlight').val(fieldData.backLight).trigger('change');

        $('#pv-daynight').html('');
        $(fieldOptions.dayNight).each(function() {
            $('#pv-daynight').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-daynight').val(fieldData.dayNight);

        if (PCE.getFeatureVersion("powerLed", fieldData.channel) > 0) {
            $('#pv-power-light').html('');
            $(ch.limits.powerControl.state).each(function() {
                $('#pv-power-light').append('<option value="' + this + '">' + this + '</option>');
            });
            $('#pv-power-light').val(ch.initials.powerControl.state);
        }

        if ( PCE.getFeatureVersion('white_balance', chId) === 0 ) {  // 能力集通道中，white_balance字段版本号为0时，隐藏白平衡设置
            $('#pv-white-balance').parents('tr').hide();
        } else {
            $('#pv-white-balance').parents('tr').show();
        }

        $('#pv-adv-commit').click();

    };

    ViewISP.refreshView = function(chId) {
        var chId = chId === undefined ? ControllerFlash.getSelectedChannel().getId() : chId;
        var ch = ControllerFlash.getSelectedChannelInfo();
        var fieldOptions, fieldData;

        ControllerMain.disableAbility('isp');

        if (!ch) {
            return; // 无选中
        }

        ControllerMain.enableAbility('isp');

        fieldOptions = ch.limits.isp;
        fieldData = ch.data.isp;

        $('#pv-adv-channel').val(fieldData.channel);

        $('#pv-gain-begin').val(fieldData.gain.min);
        $('#pv-gain-end').val(fieldData.gain.max);

        $('#pv-shutter-begin').val(fieldData.shutter.min);
        $('#pv-shutter-end').val(fieldData.shutter.max);

        $('#pv-red-gain').slider({
            "min": fieldOptions.redGain.min,
            "max": fieldOptions.redGain.max,
            "value": fieldData.redGain
        });

        $('#pv-blue-gain').slider({
            "min": fieldOptions.blueGain.min,
            "max": fieldOptions.blueGain.max,
            "value": fieldData.blueGain
        });

        $('#pv-gain-begin').attr({
            "max": fieldOptions.gain.max,
            "min": fieldOptions.gain.min,
            "title": fieldOptions.gain.min + '~' + fieldOptions.gain.max
        }).val(fieldData.gain.min);

        $('#pv-gain-end').attr({
            "max": fieldOptions.gain.max,
            "min": fieldOptions.gain.min,
            "title": fieldOptions.gain.min + '~' + fieldOptions.gain.max
        }).val(fieldData.gain.max);

        $('#pv-shutter-begin').attr({
            "max": fieldOptions.shutter.max,
            "min": fieldOptions.shutter.min,
            "title": fieldOptions.shutter.min + '~' + fieldOptions.shutter.max
        }).val(fieldData.shutter.min);

        $('#pv-shutter-end').attr({
            "max": fieldOptions.shutter.max,
            "min": fieldOptions.shutter.min,
            "title": fieldOptions.shutter.min + '~' + fieldOptions.shutter.max
        }).val(fieldData.shutter.max);

        $('#pv-blc').slider({
            "min": fieldOptions.blc.min,
            "max": fieldOptions.blc.max,
            "value": fieldData.blc
        });

        $('#pv-drc').slider({
            "min": fieldOptions.drc.min,
            "max": fieldOptions.drc.max,
            "value": fieldData.drc
        });

        _batchOp = true;

        if ($('#pv-rotation').is(':checked') != fieldData.rotation) { $('#pv-rotation').click(); }

        if ($('#pv-mirroring').is(':checked') != fieldData.mirroring) { $('#pv-mirroring').click(); }

        _batchOp = false;

        if ($('#pv-3d-nr').is(':checked') != fieldData.nr3d) { $('#pv-3d-nr').click(); }

        if (PCE.isReadable("ledControl")) {

            $('#pv-led-light').html('');
            $(ch.limits.ledControl.state).each(function() {
                $('#pv-led-light').append('<option value="' + this + '">' + this + '</option>');
            });
            $('#pv-led-light').val(ch.data.ledControl.state);
        }

        if (PCE.getFeatureVersion("powerLed", fieldData.channel) > 0) {

            $('#pv-power-light').html('');
            $(ch.limits.powerControl.state).each(function() {
                $('#pv-power-light').append('<option value="' + this + '">' + this + '</option>');
            });
            $('#pv-power-light').val(ch.data.powerControl.state);
        }

        $('#pv-anti-flicker').html('');
        $(fieldOptions.antiFlicker).each(function() {
            $('#pv-anti-flicker').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-anti-flicker').val(fieldData.antiFlicker);

        $('#pv-exposure').html('');
        $(fieldOptions.exposure).each(function() {
            $('#pv-exposure').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-exposure').val(fieldData.exposure).trigger('change');

        $('#pv-exposure').html('');
        $(fieldOptions.exposure).each(function() {
            $('#pv-exposure').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-exposure').val(fieldData.exposure).trigger('change');

        $('#pv-white-balance').html('');
        $(fieldOptions.whiteBalance).each(function() {
            $('#pv-white-balance').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-white-balance').val(fieldData.whiteBalance).trigger('change');

        $('#pv-backlight').html('');
        var EnumBackLightNames = {
            "DynamicRangeControl": "Dynamic Range",
            "BackLightControl": "Back-Light",
            "Off": "Off"
        };

        $(fieldOptions.backLight).each(function() {
            $('#pv-backlight').append('<option value="' + this + '">' + EnumBackLightNames[this] + '</option>');
        });
        $('#pv-backlight').val(fieldData.backLight).trigger('change');

        $('#pv-daynight').html('');
        $(fieldOptions.dayNight).each(function() {
            $('#pv-daynight').append('<option value="' + this + '">' + this + '</option>');
        });
        $('#pv-daynight').val(fieldData.dayNight);

        if (!ControllerLogin.chkPermission('isp', 'write', ch.index)) {
            ControllerMain.disableAbility('isp');
        }

        if ( PCE.getFeatureVersion('white_balance', chId) === 0 ) {
            $('#pv-white-balance').parents('tr').hide();
        } else {
            $('#pv-white-balance').parents('tr').show();
        }
    };

    ViewISP.initUI = function() {

        $('#pv-blc').slider({
            "range": "min",
            "value": 50,
            "min": 0,
            "max": 100
        });

        $('#pv-drc').slider({
            "range": "min",
            "value": 50,
            "min": 0,
            "max": 100
        });

        $('#pv-blue-gain').slider({
            "range": "min",
            "value": 50,
            "min": 0,
            "max": 100
        });

        $('#pv-red-gain').slider({
            "range": "min",
            "value": 50,
            "min": 0,
            "max": 100
        });

        $('#pv-adv-default').on('click', function() {
            ViewISP.restoreDefault(parseInt($('#pv-adv-channel').val()));
        });

        $('#pv-gain-begin').on('change', function() {
            var vB = parseInt($(this).val()),
                vE = parseInt($('#pv-gain-end').val());
            if (vB > vE) {
                $('#pv-gain-end').val(vB);
            }
        });

        $('#pv-gain-end').on('change', function() {
            var vB = parseInt($('#pv-gain-begin').val()),
                vE = parseInt($(this).val());
            if (vB > vE) {
                $('#pv-gain-begin').val(vE);
            }
        });

        $('#pv-shutter-begin').on('change', function() {
            var vB = parseInt($(this).val()),
                vE = parseInt($('#pv-shutter-end').val());
            if (vB > vE) {
                $('#pv-shutter-end').val(vB);
            }
        });

        $('#pv-shutter-end').on('change', function() {
            var vB = parseInt($('#pv-shutter-begin').val()),
                vE = parseInt($(this).val());
            if (vB > vE) {
                $('#pv-shutter-begin').val(vE);
            }
        });

        $('#pv-adv-commit').on('click', function() {
            $(this).attr('disabled', true);
            var id = parseInt($('#pv-adv-channel').val());
            if (id < 0) {
                return bc_alert('Please select a view firstly.', 'error');
            }

            if (ViewISP.restoring) {
                PlayerPreview.waiter.show('Restoring advanced settings...');
            } else {
                PlayerPreview.waiter.show('Saving advanced settings...');
            }

            var prs = [];
            prs.push(new Promise(function(resolve, reject) {

                CGI.sendCommand('SetIsp', {
                    "Isp": {
                        "channel": id,
                        "antiFlicker": $('#pv-anti-flicker').val(),
                        "exposure": $('#pv-exposure').val(),
                        "gain": {
                            "min": parseInt($('#pv-gain-begin').val()),
                            "max": parseInt($('#pv-gain-end').val())
                        },
                        "shutter": {
                            "min": parseInt($('#pv-shutter-begin').val()),
                            "max": parseInt($('#pv-shutter-end').val())
                        },
                        "blueGain": parseInt($('#pv-blue-gain').slider('value')),
                        "redGain": parseInt($('#pv-red-gain').slider('value')),
                        "whiteBalance": $('#pv-white-balance').val(),
                        "dayNight": $('#pv-daynight').val(),
                        "backLight": $('#pv-backlight').val(),
                        "blc": parseInt($('#pv-blc').slider('value')),
                        "drc": parseInt($('#pv-drc').slider('value')),
                        "rotation": $('#pv-rotation').is(':checked') ? 1 : 0,
                        "mirroring": $('#pv-mirroring').is(':checked') ? 1 : 0,
                        "nr3d": $('#pv-3d-nr').is(':checked') ? 1 : 0
                    }
                }, resolve,
                function(cmd, errno, msg) {
                    reject({
                        "cmd": cmd,
                        "errno": errno,
                        "msg": msg
                    });
                });
            }));

            prs.push(new Promise(function(resolve, reject) {

                if (!PCE.isReadable("ledControl") || !PCE.isExecutable("ledControl")) {

                    return resolve();
                }

                CGI.sendCommand("SetIrLights", {
                    "IrLights": {
                        "state": $('#pv-led-light').val()
                    }
                }, resolve,
                function(cmd, errno, msg) {
                    reject({
                        "cmd": cmd,
                        "errno": errno,
                        "msg": msg
                    });
                });
            }));

            // 增加对电源灯的配置操作
            prs.push(new Promise(function(resolve, reject) {

                if(PCE.getFeatureVersion('powerLed', id) <= 0 || ! PCE.isExecutable('powerLed', id)) {
                    return resolve();
                }

                CGI.sendCommand(
                    'SetPowerLed', 
                    {
                        "PowerLed": {
                            "state": $('#pv-power-light').val(),
                            "channel": id
                        },
                    }, 
                    resolve,
                    function(cmd, errno, msg) {
                        reject({
                            "cmd": cmd,
                            "errno": errno,
                            "msg": msg
                        });
                    }
                );
            }));

            Promise.all(prs).then(function() {
                PlayerPreview.waiter.hide();
                bc_alert();
                $('#pv-adv-commit').removeAttr('disabled');
            }, function(error) {

                PlayerPreview.waiter.hide();
                CGI.autoErrorHandler(error.cmd, error.errno, error.msg);
                $('#pv-adv-commit').removeAttr('disabled');
            });
        });

        $('#pv-mirroring').on('click', function() {
            if (_batchOp) {
                return;
            }
            var id = parseInt($('#pv-adv-channel').val());
            $(this).attr('disabled', true);
            $('#pv-adv-commit').attr('disabled', true);

            g_device.channels[id].data.isp.mirroring = $('#pv-mirroring').is(':checked') ? 1 : 0;

            CGI.sendCommand('SetIsp', { "Isp": g_device.channels[id].data.isp }, function() {
                if (!$('#pv-mirroring').hasClass('image-isp-reset')) {
                    bc_alert();
                }
                $('#pv-mirroring').removeClass('image-isp-reset');
                $('#pv-mirroring').removeAttr('disabled');
                $('#pv-adv-commit').removeAttr('disabled');
            }, function(cmd, errno, msg) {
                CGI.autoErrorHandler(cmd, errno, msg);
                $('#pv-mirroring').removeAttr('disabled');
                $('#pv-adv-commit').removeAttr('disabled');
            });
        });

        $('#pv-rotation').on('click', function() {
            if (_batchOp) {
                return;
            }
            var id = parseInt($('#pv-adv-channel').val());
            $(this).attr('disabled', true);
            $('#pv-adv-commit').attr('disabled', true);

            g_device.channels[id].data.isp.rotation = $('#pv-rotation').is(':checked') ? 1 : 0;

            CGI.sendCommand('SetIsp', { "Isp": g_device.channels[id].data.isp }, function() {
                if (!$('#pv-rotation').hasClass('image-isp-reset')) {
                    bc_alert();
                }
                $('#pv-rotation').removeClass('image-isp-reset');
                $('#pv-rotation').removeAttr('disabled');
                $('#pv-adv-commit').removeAttr('disabled');
            }, function(cmd, errno, msg) {
                CGI.autoErrorHandler(cmd, errno, msg);
                $('#pv-rotation').removeAttr('disabled');
                $('#pv-adv-commit').removeAttr('disabled');
            });
        });

        $('#pv-exposure').on('change', function() {

            $('.pv-exposure').hide();
            switch ($(this).val()) {
                case 'Auto':
                    break;
                case 'LowNoise':
                    $('#pv-gain').show();
                    break;
                case 'Anti-Smearing':
                    $('#pv-shutter').show();
                    break;
                case 'Manual':
                    $('#pv-gain').show();
                    $('#pv-shutter').show();
                    break;
                default:
                    break;
            }
        });

        $('#pv-white-balance').on('change', function() {

            $('.pv-white-balance').hide();
            switch ($(this).val()) {
                case 'Auto':
                    break;
                case 'Manual':
                    if( PCE.getFeatureVersion('white_balance', parseInt($('#pv-adv-channel').val())) !== 0 ) {
                        $('.pv-white-balance').show();
                    }
                    break;
                default:
                    break;
            }
        });

        $('#pv-backlight').on('change', function() {

            $('.pv-backlight').hide();
            switch ($(this).val()) {
                case 'Auto':
                    break;
                case 'BackLightControl':
                    $('.pv-blc').show();
                    break;
                case 'DynamicRangeControl':
                    $('.pv-drc').show();
                    break;
                default:
                    break;
            }
        });
    };
})();
