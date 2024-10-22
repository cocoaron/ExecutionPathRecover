
/**
 * ViewImage 类负责 预览界面的图像控制
 */
function ViewImage() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(ViewImage);

(function() {
    var _batchOp = false;

    ViewImage.refreshView = function() {
        var chObj = ControllerFlash.getSelectedChannel();
        ControllerMain.disableAbility('image');
        if (!chObj) {
            return;
        }
        ControllerMain.enableAbility('image');
        var ch = g_device.channels[chObj.getId()];

        $(['bright', 'contrast', 'hue', 'saturation', 'sharpen']).each(function() {
            $('#image-' + this).prop('outerHTML', '<div id="image-' + this + '"></div>');
            (function(eId) {
                $('#image-' + eId).slider({
                    "range": "min",
                    "value": ch.data.image[eId],
                    "min": ch.limits.image[eId].min,
                    "max": ch.limits.image[eId].max,
                    "change": function(v) {
                        if (_batchOp) {
                            return;
                        }
                        var chObj = ControllerFlash.getSelectedChannel();
                        if (!chObj) {
                            return;
                        }
                        var ch = g_device.channels[chObj.getId()];
                        if (!ch.data.image) {
                            return;
                        }
                        ch.data.image[eId] = $('#image-' + eId).slider('value');

                        CGI.sendCommand('SetImage', {
                            "Image": ch.data.image
                        }, function() {}, function(cmd, errno, msg) {
                            CGI.autoErrorHandler(cmd, errno, msg);
                        });
                    }
                });
            })(this);
        });

        if (!ControllerLogin.chkPermission('image', 'write', ch.index)) {
            ControllerMain.disableAbility('image');
        }
    };

    ViewImage.initUI = function() {


        $('#pv-image-default').on('click', function() {

            var chObj = ControllerFlash.getSelectedChannel();
            if (!chObj) {
                return;
            }
            var ch = g_device.channels[chObj.getId()];
            var fieldData = ch.initials.isp;
            if (!ch.data.image) {
                return;
            }
            _batchOp = true;
            $(['bright', 'contrast', 'hue', 'saturation', 'sharpen']).each(function() {
                $('#image-' + this).slider({
                    "value": ch.initials.image[this]
                });
                ch.data.image[this] = ch.initials.image[this];
            });

            if ($('#pv-rotation').is(':checked') != fieldData.rotation) { $('#pv-rotation').addClass('image-isp-reset').click(); }

            if ($('#pv-mirroring').is(':checked') != fieldData.mirroring) { $('#pv-mirroring').addClass('image-isp-reset').click(); }

            $('#pv-image-default').attr('disabled', true);

            CGI.sendCommand('SetImage', {
                "Image": ch.data.image
            }, function() {
                bc_alert();
                _batchOp = false;
                $('#pv-image-default').removeAttr('disabled');
            }, function(cmd, errno, msg) {
                CGI.autoErrorHandler(cmd, errno, msg);
                _batchOp = false;
                $('#pv-image-default').removeAttr('disabled');
            });

        });
    };


})();
