
function ViewWaiting(cfg) {

    var $obj;

    EventListener.apply(this);

    this.id = cfg.id ? cfg.id: String.random(32);
    this.text = cfg.text? cfg.text: 'Operating...';

    cfg.cancel && this.on('cancel', cfg.cancel);

    function createView(id, text) {
        var $rtn;
        $('body').append('<div id="view-wait-' + id + '" class="view-wait-frame default-hidden"><div class="view-wait-helper"></div><div class="view-wait-hc-helper"><div class="view-wait-helper"></div><div class="view-wait-box"><div class="wait-image"></div><div class="wait-text"></div><div class="wait-text wait-text-tips" style="margin-top: 8px; font-weight: bold; color: gray;">Please wait a while.</div></div><div class="view-wait-helper"></div></div><div class="view-wait-helper"></div></div>');
        $rtn = $('#view-wait-' + id);
        $rtn.find('.wait-text').eq(0).html(text);
        return $rtn;
    }

    $obj = $('#view-wait-' + this.id);

    if (!$obj.length) {
        $obj = createView(this.id, this.text);
    }

    this.setText = function(text) {
        $obj.find('.wait-text').eq(0).html(text);
    };

    this.$ = function() {
        return $obj;
    };

    this.show = function (text) {
        if (text !== undefined) {
            this.setText(text);
        }
        $obj.removeClass('default-hidden');
        ViewWaiting.resize();
    };

    this.hide = function () {
        $obj.addClass('default-hidden');
    };

    this.cancel = function () {
        this.hide();
        this.trigger('cancel');
    };

    this.destroy = function() {
        $obj.remove();
    };

    this.setQuickCancel = function(flag) {
        if (flag) {
            $obj.unbind('click');
            (function(view, $obj) {
                $obj.on('click', function(e) {

                    if ($(e.target).attr('id') == $(this).attr('id') || $(e.target).hasClass('view-wait-helper')) {
                        view.cancel();
                    }
                });
            })(this, $obj);
        } else {
            $obj.unbind('click');
        }
    };

    this.setQuickCancel(cfg.quickCancel);

}

ViewWaiting.resize = function() {
    $('.view-wait-frame').height($(window).innerHeight());
    $('.view-wait-frame').width($(window).innerWidth());
};

