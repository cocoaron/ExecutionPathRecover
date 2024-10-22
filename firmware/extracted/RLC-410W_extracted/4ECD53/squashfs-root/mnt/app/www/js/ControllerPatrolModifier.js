
function ControllerPatrolModifier() {
	throw {"msg": "Don't NEW a singleton."};
}

(function(CPM) {

    this.show = function (patrol) {
        this.init && this.init();
        this.resize();

        this.refresh(patrol);
        $('#patrol-modifier').show(200);
    };

    this.hide = function () {
        $('#patrol-modifier').hide(200);
    };

    this.resize = function () {
        $('#patrol-modifier').css({
            "height": window.innerHeight,
            "width": window.innerWidth
        });
        $('#patrol-modifier .bc-dialog').css({
            "top": (window.innerHeight - $('#patrol-modifier .bc-dialog').innerHeight()) / 2,
            "left": (window.innerWidth - $('#patrol-modifier .bc-dialog').innerWidth()) / 2
        });
    };

    function mapLine(preset, $preset) {
        var presetData = getPresetsData();
        $preset.data('preset', preset);
        $preset.find('.patrol-row-preset').text(presetData[preset.id - 1].name);
        $preset.find('.patrol-row-time').text(preset.dwellTime);
        $preset.find('.patrol-row-speed').text(preset.speed);
    }

    function getPresetsData() {
        return g_device.channels[CPM.channel].data.ptzPreset;
    }

    this.refresh = function(patrol) {

        this.channel = patrol.channel;

        $('#patrols-list').html('');

        for (var i = 1; i <= 16; i++) {
            $('#patrols-list').append('<div class="patrol-row" patrol-index="' + (i - 1) + '">'
                    + '<div class="patrol-row-index">' + i.toString().leftPad('0', 2) + '</div>'
                    + '<div class="patrol-row-preset"></div>'
                    + '<div class="patrol-row-time"></div>'
                    + '<div class="patrol-row-speed"></div>'
                    + '</div>');
        }

        $('#mod-patrol-drop').attr('disabled', true);
        $('#mod-patrol-edit').val('Edit');

        this.patrol = patrol;

        $('#editing-patrol-ch-id').text(this.channel);

        $('#editing-patrol-id').text(patrol.id);

        if (patrol.preset) {
            for (var i = 0; i < patrol.preset.length; i++) {
                var $preset = $('[patrol-index=' + i + ']');
                mapLine(patrol.preset[i], $('[patrol-index=' + i + ']'));
            }
        }

        setTimeout(function() {
            if (ControllerLogin.abilities.abilityChn[patrol.channel].ptzType.ver === EnumPTZType.GM8136S_PTZ) {

                $('#patrols-list-header .patrol-row-time').css({
                    "margin-right": $('#patrols-list-header').innerWidth() - $('#patrols-list > div').outerWidth()
                });
                $('.patrol-row-speed').hide();
            } else {

                $('#patrols-list-header .patrol-row-speed').css({
                    "margin-right": $('#patrols-list-header').innerWidth() - $('#patrols-list > div').outerWidth()
                });
            }
        }, 0);
    };
    
    this.saveRow = function() {

        if ($('#patrol-modifier .selected').length == 0) {
            return true;
        }

        var $preset = $('#patrol-modifier .selected');
        var preset = $preset.data('preset');
        var presetData = getPresetsData();
        var $select;
        var range = g_device.channels[CPM.channel].limits.ptzPatrol;

        if (!$preset.length) {
            return true;
        }

        $select = $preset.find('.patrol-row-preset select');

        if (!$select.length) {
            return true;
        }

        preset = {
            "id": parseInt($select.val()),
            "dwellTime": parseInt($preset.find('.patrol-row-time input').val()),
            "speed": parseInt($preset.find('.patrol-row-speed input').val())
        };
        if (preset.id == 0) {
            preset = undefined;
        } else {
            if (preset.dwellTime < range.preset.dwellTime.min || preset.dwellTime > range.preset.dwellTime.max) {
                bc_alert('Time of preset is out of range(' + range.preset.dwellTime.min + '~' + range.preset.dwellTime.max + ').', 'error');
                return false;
            }
            if (preset.speed < range.preset.speed.min || preset.speed > range.preset.speed.max) {
                bc_alert('Speed of preset is out of range(' + range.preset.speed.min + '~' + range.preset.speed.max + ').', 'error');
                return false;
            }
        }

        if (preset) {
            mapLine(preset, $preset);
            $preset.data('preset', preset);
        } else {
            $preset.data('preset', null);
            $preset.find('.patrol-row-time').text('');
            $preset.find('.patrol-row-speed').text('');
            $preset.find('.patrol-row-preset').text('');
        }

        $('#mod-patrol-drop').attr('disabled', true);
        $('#mod-patrol-edit').removeAttr('disabled');

        return true;

    };

    this.init = function () {
        $('#patrol-modifier').on('click', function(e) {
            if (e.target.id == 'patrol-modifier') {
                CPM.hide();
            }
        });

        $('#patrols-list').on('click', '.patrol-row', function() {
            if ($('#patrol-modifier .selected').attr('patrol-index') == $(this).attr('patrol-index')) {
                return;
            }
            if (ControllerPatrolModifier.saveRow()) {
                $('#patrol-modifier .selected').removeClass('selected');
                $(this).addClass('selected');
            }
        }).on('dblclick', '.patrol-row', function(e) {
            $('#mod-patrol-edit').click();
        });

        $('#patrol-modifier').find('.bc-dialog-close').on('click', function() {
            CPM.hide();
        });

        $('#mod-patrol-edit').on('click', function() {

            if ($('#patrol-modifier .selected').length == 0 || $('#patrol-modifier .selected input').length > 0) {
                return;
            }

            var $preset = $('#patrol-modifier .selected');
            var preset = $preset.data('preset');
            var presetData = getPresetsData();
            var $select;

            var range = g_device.channels[CPM.channel].limits.ptzPatrol;

            $('#mod-patrol-drop').removeAttr('disabled');
            $(this).attr('disabled', true);

            $preset.find('.patrol-row-preset').html('<select><option value="0" style="color: #bbb;">(None)</option></select>');
            $preset.find('.patrol-row-time').html('<input max="' + range.preset.dwellTime.max + '" min="' + range.preset.dwellTime.min + '" type="number" value="' + range.preset.dwellTime.min + '">');
            $preset.find('.patrol-row-speed').html('<input max="' + range.preset.speed.max + '" min="' + range.preset.speed.min + '" type="number" value="' + range.preset.speed.min + '">');

            $select = $preset.find('.patrol-row-preset select');

            $(presetData).each(function() {
                if (this.enable) {
                    $select.append($('<option value="' + this.id + '"></option>').text(this.name));
                }
            });

            if (preset) {
                $preset.find('.patrol-row-time input').each(function() {
                    $(this).css({"width": $(this).parent().innerWidth() - 16});
                }).val(preset.dwellTime);
                $preset.find('.patrol-row-speed input').each(function() {
                    $(this).css({"width": $(this).parent().innerWidth() - 16});
                }).val(preset.speed);
                $select.val(preset.id).each(function() {
                    $(this).width($(this).parent().innerWidth() - 16);
                });
                if (!isValidValue($select.val())) {
                    $select.val(0);
                }
            } else {
                $preset.find('.patrol-row-time input').each(function() {
                    $(this).css({"width": $(this).parent().innerWidth() - 16});
                });
                $preset.find('.patrol-row-speed input').each(function() {
                    $(this).css({"width": $(this).parent().innerWidth() - 16});
                });
                $select.each(function() {
                    $(this).width($(this).parent().innerWidth() - 16);
                });
            }

        });

        $('#mod-patrol-drop').on('click', function() {
            $(this).attr('disabled', true);
            var $preset = $('#patrol-modifier .selected');
            var preset = $preset.data('preset');
            if (preset) {
                mapLine(preset, $preset);
            } else {
                $preset.find('.patrol-row-time').text('');
                $preset.find('.patrol-row-speed').text('');
                $preset.find('.patrol-row-preset').text('');
            }
            $('#mod-patrol-edit').removeAttr('disabled');
        });

        $('#mod-patrol-clear').on('click', function() {
            var $el;
            if ($('#patrol-modifier .selected').length > 0 && $('#patrol-modifier .selected').data('preset')) {
                $el = $('#patrol-modifier .selected');
            } else {
                $el = $('.patrol-row');
            }
            $el.each(function() {
                if ($(this).data('preset')) {
                    $(this).data('preset', null);
                    $(this).find('.patrol-row-time').text('');
                    $(this).find('.patrol-row-speed').text('');
                    $(this).find('.patrol-row-preset').text('');
                }
            });
            $el.removeClass('selected');
        });

        $('#mod-patrol-save').on('click', function() {
            CPM.patrol.preset = [];
            try {
                CPM.saveRow();
            } catch (e) {
                
            }
            $('.patrol-row').each(function() {
                if ($(this).data('preset')) {
                    CPM.patrol.preset.push($(this).data('preset'));
                }
            });
            ViewPTZPreset.savePatrol(CPM.patrol);
        });

        delete this.init;
    };

}).apply(ControllerPatrolModifier, [ControllerPatrolModifier]);
