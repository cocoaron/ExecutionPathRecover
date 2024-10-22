
function ControllerSnap() {
	throw {"msg": "Don't NEW a singleton."};
}

ControllerSnap.show = function (chId) {
    this.init && this.init();
    this.resize();
    this.refresh(chId);
    this.waiter.show();
};

ControllerSnap.hide = function () {
    $('#snap-dialog').hide(200);
};

ControllerSnap.resize = function () {
    $('#snap-dialog').css({
        "height": window.innerHeight,
        "width": window.innerWidth
    });
    $('#snap-dialog .bc-dialog').css({
        "top": (window.innerHeight - $('#snap-dialog .bc-dialog').innerHeight()) / 2,
        "left": (window.innerWidth - $('#snap-dialog .bc-dialog').innerWidth()) / 2
    });
    $('#snap-dialog .bc-dialog-vessel').height($('#snap-dialog').innerHeight() - $('#snap-dialog .bc-dialog-title').outerHeight());
    (function() {
        $(this).css({
            "max-width": "100%",
            "max-height": "100%"
        });
        if ($(this).height() < $('#snap-dialog .bc-dialog-vessel').innerHeight()) {
            $(this).css({"margin-top": ($('#snap-dialog .bc-dialog-vessel').innerHeight() - $(this).outerHeight()) / 2});
        } else {
            $(this).css({"margin-top": 0});
        }
        $(this).show();

    }).apply($('#snap-dialog img'));
};

ControllerSnap.refresh = function (chId) {
    var imgId = 'snap-img-' + String.random(8);
    $('#snap-channel-id').text(chId + 1);
    var imgsrc = 'cgi-bin/api.cgi?cmd=Snap&channel=' + chId + '&rs=' + String.random(16) + "&token=" + localStorage.getItem('token');
    $('#snap-dialog .bc-dialog-vessel').html('<img style="display:none;" id="' + imgId + '" src="' + imgsrc + '">');
    $('#snap-dialog img#' + imgId).load(function() {
        $('#snap-dialog').show(200);
        $(this).css({
            "max-width": $('#snap-dialog .bc-dialog-vessel').innerWidth(),
            "max-height": $('#snap-dialog .bc-dialog-vessel').innerHeight()
        });
        if ($(this).height() < $('#snap-dialog .bc-dialog-vessel').innerHeight()) {
            $(this).css({"margin-top": ($('#snap-dialog .bc-dialog-vessel').innerHeight() - $(this).height()) / 2});
        } else {
            $(this).css({"margin-top": 0});
        }
        ControllerSnap.waiter.hide();
        $(this).show();
    }).error(function(err) {
        ControllerSnap.waiter.hide();
        bc_alert('Failed to snap image.', 'error');
    });
};

ControllerSnap.init = function () {
    $('#snap-dialog').on('click', function(e) {
        if (e.target.id == 'snap-dialog') {
            ControllerSnap.hide();
        }
    });
    $('#snap-dialog').find('.bc-dialog-close').on('click', function() {
        ControllerSnap.hide();
    });
    this.waiter = new ViewWaiting({
        "id": "loading-snap",
        "text": "Snapping image..."
    });
    $('#snap-dialog > .bc-dialog').on('dblclick', function() {
        if ($('#snap-dialog').hasClass('fullscreen')) {
            $('#snap-dialog').removeClass('fullscreen');
        } else {
            $('#snap-dialog').addClass('fullscreen')
        }
        ControllerSnap.resize();
    });
    delete this.init;
};
