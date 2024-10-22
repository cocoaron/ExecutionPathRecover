/**
 * View 类提供各个具体视图的操作接口，由 ViewManager 类统一管理。
 * 
 * 作者：曾鹏辉
 * 日期：2016-01-22 14:50
 */
var VIEW_DOM_ID_PREFIX = 'view-block-';
var VIEW_DOM_CLASS = 'view-block';

function View(id, mode) {

    var _mode = mode,
        _id = id,
        _$this = null,
        _channel = null,
        _status;

    EventListener.apply(this);

    /**
     * 判断是否正在录像。 
     */
    this.isRecording = function () {
        return _$this.find('.view-record.onwork').length == 1;
    };

    /**
     * 绑定一个通道 
     * @param uint id   被绑定的通道号
     */
    this.bindChannel = function(id) {
        _$this.attr('bc-channel-id', id).find('.view-channel-id').text(id + 1);
        _$this.removeClass('no-channel');
        _channel = id;
        return this;
    };

    /**
     * 与当前绑定的通道解绑 
     */
    this.unbindChannel = function() {
        if (this.isEmpty()) {
            return this;
        }
        _$this.addClass('no-channel');
        var id = _channel;
        _$this.removeAttr('bc-channel-id').find('.view-channel-id').text('00');
        _channel = null;
        return this;
    };

    /**
     * 本 View 是否已经创建。 
     */
    this.isAvailable = function() {
        return _$this !== null;
    };

    /**
     * 获取当前 View 的可视区尺寸。
     * @return jQuery
     */
    this.getClientArea = function() {
        var rtn = {
            "top": 2 + parseFloat(_$this.css('top')) + _$this.find('.view-toolbar').outerHeight(),
            "left": 2 + parseFloat(_$this.css('left'))
        };
        rtn.height = _$this.height() - _$this.find('.view-toolbar').outerHeight();
        rtn.width = _$this.width();
        return rtn;
    };

    /**
     * 是否有绑定通道。 
     */
    this.isEmpty = function() {
        return _channel === null;
    };

    /**
     * 获取通道号，如果当前未绑定，返回 null
     */
    this.getChannelId = function() {
        return _channel;
    };

    /**
     * 获取工作模式（Preview/Playback） 
     */
    this.getMode = function() {
        return _mode;
    };

    /**
     * 获取视图 ID 
     */
    this.getId = function() {
        return _id;
    };

    /**
     * 设置该视图为选中视图 
     */
    this.setSelected = function() {
        $('.' + VIEW_DOM_CLASS + '.selected[bc-view-mode="' + _mode + '"]').removeClass('selected');
        _$this.addClass('selected');
        ViewManager.trigger('selected', [this]);
        return this;
    };

    /**
     * 判断视图是否被选中。 
     */
    this.isSelected = function() {
        return _$this.hasClass('selected');
    };

    /**
     * 显示该视图 
     */
    this.show = function() {
        _$this.show();
        this.trigger('show');
        return this;
    };

    /**
     * 隐藏该视图
     */
    this.hide = function() {
        _$this.hide();
        this.trigger('hide');
        return this;
    };

    /**
     * 刷新标题处显示的Channel状态 
     * @param EnumViewStatus status     新的播放状态
     * @param EnumStreamType    streamType 当前码流类型
     */
    this.updateStatus = function(status, streamType) {
        var $status = _$this.find('.view-channel-status');
        var streamTypes = ['Fluent', 'Balanced', 'Clear', "Auto", "Clip"];
        _$this.removeClass('playing');
        switch (status) {
        case EnumViewStatus.BUFFERING:
            $status.text('Buffering');
            break;
        case EnumViewStatus.ERROR:
            $status.text('Error Occured');
            break;
        case EnumViewStatus.PAUSED:
            $status.text('Paused');
            break;
        case EnumViewStatus.PLAYING:
            _$this.addClass('playing');
            if (streamTypes[streamType] !== undefined) {
                $status.text(streamTypes[streamType]);
            } else
                $status.text('Error');
            break;
        case EnumViewStatus.CLOSED: //直接被隐藏了，不显示
        default:
            break;
        }
        _status = status;

        _$this.find('.view-fill').attr('title', 'Center').addClass('exfit'); 
    };

    this.getStatus = function () {
        return _status;
    };

    /**
     * 计算该视图的 DOM Id 
     * @param int id
     * @param string mode
     */
    function _getDOMId(id, mode) {
        return VIEW_DOM_ID_PREFIX + mode + '-' + _id;
    }

    if ($('#' + _getDOMId(_id, _mode)).length > 0) {
        throw {"msg": "This view block was already created."};
    }

    /**
     * 创建视图的DOM对象 
     */
    this.setup = function() {

        var domId = _getDOMId(_id, _mode);
        var $title = $('<div id="' + domId + '-toolbar" class="view-toolbar"><div class="view-title">CH <span class="view-channel-id">00</span> - <span class="view-channel-status">Paused</span></div></div>');
        _$this = $('<div id="' + domId + '" bc-view-mode="' + _mode + '" bc-view-id="' + _id + '" class="' + VIEW_DOM_CLASS + ' no-channel"></div>');

        var $playerWraper = flashCheck() ? $('#preview_plugin_container') : $('.h5_player_wrapper');

        $playerWraper.append(_$this);

        _$this.append($title);

        (function(viewObj, domId, $obj, $title) {
            var $tmp;

            if(isBrowserSupportFlv()) {
                $tmp = $('<div title="" id="' + domId + '-switch" class="view-tool-button view-switch-player"></div>');
                $title.append($tmp);
                if(flashCheck()) {
                    $tmp.attr('title', 'Switch to HTML5 player');
                    $tmp.addClass('h5-player');
                } else {
                    $tmp.attr('title', 'Switch to flash player');
                    $tmp.addClass('flash-player');
                }
                $tmp.on('click', function() {
                    $(this).hasClass('h5-player') ? allowFlv() : closeFlv();
                    location.reload();
                });

            }
            $tmp = $('<div title="Center" id="' + domId + '-fill" class="view-tool-button view-fill exfit"></div>');
            $title.append($tmp);
            $tmp.on('click', function() {
                ViewManager.trigger('fillmode', [viewObj, $obj]);
                return false;
            });
            if (viewObj.getMode() === EnumCurState.PLAYBACK) {
                $tmp = $('<div title="Download" id="' + domId + '-download" class="view-tool-button view-download"></div>');
                $title.append($tmp);
                $tmp.on('click', function() {
                    if (ControllerLogin.chkPermission('recDownload', 'read', 0)) {
                        ViewManager.trigger('download', [viewObj, $obj]);
                    } else {
                        bc_alert("You have no permission to download video.", "error");
                    }
                    return false;
                });
            } else {
                $tmp = $('<div title="WLAN" id="' + domId + '-network" class="view-tool-button view-network-style view-wifi"></div>');
                $title.prepend($tmp);
                $tmp = $('<div title="Snap" id="' + domId + '-snap" class="view-tool-button view-snap"></div>');
                $title.append($tmp);
                $tmp.on('click', function() {
                    if (ControllerLogin.chkPermission('snap', 'read', 0)) {
                        ViewManager.trigger('snap', [viewObj, $obj]);
                    } else {
                        bc_alert("You have no permission to download video.", "error");
                    }
                    return false;
                });
            }

            $tmp = $('<div title="Close" id="' + domId + '-shutdown" class="view-tool-button view-shutdown"></div>');
            $title.append($tmp);
            $tmp.on('click', function() {
                ViewManager.trigger('close', [viewObj, $obj]);
                $(this).addClass('no-channel');
                return false;
            });

            $obj.droppable({"drop": function(ev, ui) {
                ViewManager.trigger('drop', [viewObj, $obj, ui.draggable.parent()]);
            }});

            $obj.on('click', function(e) {
                viewObj.setSelected();
                ViewManager.trigger('click', [viewObj, $obj]);
            });

            $obj.on('dblclick', function() {
                ViewManager.trigger('dblclick', [viewObj, $obj]);
            });

        })(this, domId, _$this, $title);
        delete this.setup;

        return this;
    };

    /**
     * 调整视图的位置和尺寸。
     * @param int length 每行或每列有多少个视图
     * @param int pos    该视图所在的位置（相对于当前页）。
     */
    this.resize = function(length, pos) {

        $('#preview_main_ocx').width($(window).innerWidth() - 240);
        var $playerWraper = flashCheck() ? $('#preview_plugin_container') : $('.h5_player_wrapper');
        var height = $playerWraper.height() / length;
        var width = ($(window).innerWidth() - 240) / length;
        var x;
        var cr;

        if (length == 1) {
            _$this.height(height - 4);
            _$this.width(width - 4);
        } else {
            _$this.height(height);
            _$this.width(width);
        }

        x = pos % length;
        _$this.css({"left": x * width});

        x = Math.floor(pos / length);
        _$this.css({"top": x * height});

    };


}
