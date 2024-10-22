/**
 * ViewOSD 类负责预览界面的 OSD 控制
 */
function ViewOSD() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(ViewOSD);

(function() {

    ViewOSD.refreshView = function() {

        var ch = ControllerFlash.getSelectedChannelInfo();
        ControllerMain.disableAbility('osd');
        if (!ch) {
            return;
        }
        ControllerMain.enableAbility('osd');

        var d = ch.data.osd;
        if (d.osdChannel.enable != $('#osd-name-select').is(':checked')) {
            setTimeout(function() {
                $('#osd-name-select').click();
            }, 100);
        }
        $('#osd-name').attr('maxlength', ch.limits.osd.osdChannel.name.maxLen).val(d.osdChannel.name);
        $("#osd-name-postion-settings-select").html('');
        $(ch.limits.osd.osdChannel.pos).each(function() {
            $("#osd-name-postion-settings-select").append('<option value="' + this + '">' + this + '</option>');
        });
        $("#osd-date-time-position-select").html('');
        $(ch.limits.osd.osdTime.pos).each(function() {
            $("#osd-date-time-position-select").append('<option value="' + this + '">' + this + '</option>');
        });
        if (d.osdTime.pos == '') {
            $('#osd-date-time-position-select').val(ch.initials.osd.osdTime.pos);
        } else {
            $('#osd-date-time-position-select').val(d.osdTime.pos);
        }
        if (d.osdChannel.pos == '') {
            $('#osd-name-postion-settings-select').val(ch.initials.osd.osdChannel.pos);
        } else {
            $('#osd-name-postion-settings-select').val(d.osdChannel.pos);
        }
        if (d.osdTime.enable != $('#osd-date-select').is(':checked')) {
            setTimeout(function() {
                $('#osd-date-select').click();
            }, 100);
        }
        $('#osd-date-time-position-select').val(d.osdTime.pos);

        if (!ControllerLogin.chkPermission('osd', 'write', ch.index)) {
            ControllerMain.disableAbility('osd');
        }

        $('#osd-name-select').click().click();
        $('#osd-date-select').click().click();

    };

    ViewOSD.initUI = function() {

        $('#osd-name-select').on('click', function() {
            if ($(this).is(':checked')) {
                $('#osd-name').removeAttr('disabled');
                $('#osd-name-postion-settings-select').removeAttr('disabled');
            } else {
                $('#osd-name').attr('disabled', true);
                $('#osd-name-postion-settings-select').attr('disabled', true);
            }
        });

        $('#osd-date-select').on('click', function() {
            if ($(this).is(':checked')) {
                $('#osd-date-time-position-select').removeAttr('disabled');
            } else {
                $('#osd-date-time-position-select').attr('disabled', true);
            }
        });

        $('#preview-commit-osd').on('click', function() {
            var osdName = $('#osd-name').val().trim();
            if (osdName != "" && !validators.devicename(osdName)) {
                bc_alert('Camera name can only consist of alphabet or digtal charactors.', 'error');
                return;
            }

            var viewObj = ViewManager.getSelectedView();
            if (viewObj.getChannelId() == null) {
                return;
            }
            var chObj = ChannelManager.get(viewObj.getChannelId());

            if ($('#osd-name-postion-settings-select').val() == $('#osd-date-time-position-select').val() && $('#osd-name-postion-settings-select').val() != "Other Configuration") {
                if ($('#osd-name-select').is(':checked') && $('#osd-date-select').is(':checked')) {
                    bc_alert('Don\'t select a same position for both date and OSD.', 'error');
                    return;
                }
            }

            $('#preview-commit-osd').attr('disabled', true);
            PlayerPreview.waiter.show('Saving OSD settings...');
            CGI.sendCommand('SetOsd', {
                "Osd": {
                    "channel": chObj.getId(),
                    "osdChannel": {
                        "name": osdName,
                        "enable": $('#osd-name-select').is(':checked') ? 1 : 0,
                        "pos": $('#osd-name-postion-settings-select').val()
                    },
                    "osdTime": {
                        "enable": $('#osd-date-select').is(':checked') ? 1 : 0,
                        "pos": $('#osd-date-time-position-select').val()
                    }
                }
            }, function(d) {
                PlayerPreview.waiter.hide();
                if( osdName != ControllerMain.deviceInfo.name ) {
                    ControllerMain.deviceInfo.name = osdName;
                }
                bc_alert('OSD configured successfully.');
                $('#preview-commit-osd').removeAttr('disabled');
            }, function(cmd, errno, msg) {
                PlayerPreview.waiter.hide();
                CGI.autoErrorHandler(cmd, errno, msg);
                $('#preview-commit-osd').removeAttr('disabled');
            });
        });
    };

})();
