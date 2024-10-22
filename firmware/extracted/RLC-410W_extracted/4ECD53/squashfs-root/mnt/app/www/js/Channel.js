/*
 * Channel 类负责对每个 Channel 的处理，并转发给 ChannelManager 集中处理。
 *
 * 作者：曾鹏辉
 * 日期：2016-01-22 16:15
 */
function Channel(id, mode) {

	var _id = id,
		_mode = mode,
		_$this = null,
		_stream = EnumStreamType.FLUENT,
		_status = EnumChannelStatus.CLOSED,
		_ptzSpeed = 32,
		_hueValue = 150,
		_saturationValue = 150,
		_contrastValue = 150,
		_lightValue = 150,
		_auto = true,
		_viewId = null;

	EventListener.apply(this);

	/**
	 * 返回当前通道绑定的视图 ID，如果未绑定则返回 null。
	 */
	this.getViewId = function () {
		return _viewId;
	};

	this.getId = function () {
		return _id;
	};

	this.getMode = function () {
		return _mode;
	};
	
	/**
	 * 设置  获取通道是否自动选择码流
	 */
	this.setAuto = function (auto){
		_auto = auto;
		return this;
	}
	this.getAuto = function() {
		return _auto;
	}

	/**
	 * 设置和返回HSB、PTZSpeed值
	 * 
	 */
	this.setLightValue = function(value) {
		_lightValue = value;
		return this;
	};
	this.getLightValue = function() {
		return _lightValue;
	};
	
	this.setHueValue = function(value) {
		_hueValue = value;
		return this;
	};
	this.getHueValue = function() {
		return _hueValue;
	};
	
	this.setSaturationValue = function(value) {
		_saturationValue = value;
		return this;
	};
	this.getSaturationValue = function() {
		return _saturationValue;
	};
	
	this.setContrastValue = function(value) {
		_contrastValue = value;
		return this;
	};
	this.getContrastValue = function() {
		return _contrastValue;
	};
	
	this.setPTZSpeedValue = function(value) {
		_ptzSpeed = value;
		return this;
	};
	this.getPTZSpeedValue = function() {
		return _ptzSpeed;
	};
	
	/**
	 * 将该通道与指定ID的视图绑定。
	 */
	this.bindView = function (id) {
		_viewId = id;
		_$this.attr('bc-view-id', id);
		return this;
	};

	/**
	 * 将该通道与指定ID的视图绑定。
	 */
	this.unbindView = function (id) {
		_viewId = null;
		_$this.removeAttr('bc-view-id');
		return this;
	};

	/**
	 * 设置当前通道的状态。
	 * @param EnumChannelStatus status
	 */
	this.setStatus = function (status) {
		switch (status) {
		case EnumChannelStatus.PLAYING:
	        _$this.find('.CH_btn').removeClass('CH_btn-danger_disable').addClass('CH_btn-danger_active');
    		_$this.find('.channel_status_icon').removeClass('channel_status_icon_disconnected').addClass('channel_status_icon_connected');
    		break;
		case EnumChannelStatus.CLOSED:
    		_$this.find('.CH_btn').removeClass('CH_btn-danger_active').addClass('CH_btn-danger_disable');
        	_$this.find('.channel_status_icon').removeClass('channel_status_icon_connected').addClass('channel_status_icon_disconnected');
        	break;
        default:
        	return false;
		}
		_status = status;
		return true;
	};

	/**
	 * 获取当前通道的状态。
	 * @return EnumChannelStatus
	 */
	this.getStatus = function () {
		return _status;
	};

	/**
	 * 获取通道的码流类型。
	 * @return EnumStreamType
	 */
	this.getStream = function () {
		return _stream;
	};

	/**
	 * 更新通道的码流类型。
	 * @param EnumStreamType newStream
	 */
	this.updateStream = function (newStream) {
		_stream = newStream;
		switch (newStream) {
		case EnumStreamType.FLUENT:
			_$this.find('.text_right').text('F');
			break;
		case EnumStreamType.CLIP:
			_$this.find('.text_right').text('C');
			break;
		case EnumStreamType.CLEAR:
			_$this.find('.text_right').text('M');
			break;
		case EnumStreamType.BALANCED:
			_$this.find('.text_right').text('B');
			break;
		default: /* 默认为 AUTO*/
		case EnumStreamType.AUTO:
			_$this.find('.text_right').text('A');
		}
		return this;
	};

	/**
	 * 打开当前通道，或切换码流。
	 * @param EnumStreamType param_name
	 */
	this.open = function (newStream, newAutoStatus) {
		ChannelManager.trigger('open', [this, _$this, newStream === undefined ? _stream : newStream, newAutoStatus]);
		return this;
	};

	/**
	 * 暂停当前通道。
	 */
	this.pause = function () {
		ChannelManager.trigger('pause', [this, _$this]);
		return this;
	};

    this.setReplayData = function (url, seekTo) {
        this.url = url;
        this.seekTo = seekTo;
    }

	/**
	 * 关闭当前通道。
	 */
	this.close = function () {
		ChannelManager.trigger('close', [this, _$this]);
		return this;
	};

	function _createPreviewChannel(id) {
		var $itemLayout = $('<div class="CH_btn-group" bc-channel-id="' 
						+ id
						+ '"> <div class="channel_view_item CH_btn_sized1 channel_view_item_bg"><span class="channel_status_icon channel_status_icon_disconnected"></span><span class="channel_status_text_center">' 
						+ "CH " + oneToZeroOne(id + 1) 
						+ '</span><label class="text_right">F</label></div><div title="Stream" class="CH_btn CH_btn-danger dropdown-toggle" data-toggle="dropdown"></div> <ul class="dropdown-menu CH_dropdown-menu_margin" bc-channel-id="' 
						+ id
						+ '" role="menu"> <li><a href="javascript: void(0);" class="bc-channel-menu-clear">Clear</a></li><li class="divider"></li><li><a href="javascript: void(0);" class="bc-channel-menu-balanced">Balanced </a></li><li class="divider"></li><li><a href="javascript: void(0);" class="bc-channel-menu-fluent">Fluent</a></li><li class="divider"></li><li><a href="javascript: void(0);" class="bc-channel-menu-auto">Auto</a></li></ul></div>');
		$('#channelItems').append($itemLayout);
		$itemLayout.find('div.channel_view_item').draggable({
    		"revert": true,
    		"start": function() {
        		$('.preRight').css({
        			"overflow": "visible"
        		}).find('.preLeft').css({
        			"overflow": "visible"
        		});
        		$('#channelItems').css({
        			"overflow-y": "visible"
        		});
        	},
        	"stop": function() {
        		$('#channelItems').css({
        			"overflow-y": "auto"
        		});
        	}
    	});
    	$itemLayout.find('.dropdown-menu a.bc-channel-menu-clear').on('click', function() {
    		ChannelManager.get(parseInt($(this).parent().parent().attr('bc-channel-id'))).open(EnumStreamType.CLEAR, false);
    	});
    	$itemLayout.find('.dropdown-menu a.bc-channel-menu-balanced').on('click', function() {
    		ChannelManager.get(parseInt($(this).parent().parent().attr('bc-channel-id'))).open(EnumStreamType.BALANCED, false);
    	});
    	$itemLayout.find('.dropdown-menu a.bc-channel-menu-fluent').on('click', function() {
    		ChannelManager.get(parseInt($(this).parent().parent().attr('bc-channel-id'))).open(EnumStreamType.FLUENT, false);
    	});
    	$itemLayout.find('.dropdown-menu a.bc-channel-menu-auto').on('click', function() {
    		ChannelManager.get(parseInt($(this).parent().parent().attr('bc-channel-id'))).open(EnumStreamType.AUTO, true);
    	});
    	return $itemLayout;
	}

	function _createPlaybackChannel(id) {
		var $itemLayout = $('<div class="CH_btn-group" bc-channel-id="' 
						+ id
						+ '"> <div class="channel_view_item CH_pb_btn_sized channel_view_item_bg" data-toggle="button"> '
	                    + '<span class="channel_status_icon channel_status_icon_disconnected"></span>'
	                    + '<span class="channel_status_text_center">'
	                    + 'CH '
	                    + oneToZeroOne(id + 1) + '</span></div>');
		$('#pb_channels_content').append($itemLayout);
		$itemLayout.find('div.channel_view_item').draggable({
    		"revert": true,
    		"start": function() {
        		$('.preRight_Playback').css({
        			"overflow": "visible"
        		}).find('.preLeft').css({
        			"overflow": "visible"
        		});
        		$('#pb_channels_content').css({
        			"overflow-y": "visible"
        		});
        	},
        	"stop": function() {
        		$('#pb_channels_content').css({
        			"overflow-y": "auto"
        		});
        	}
    	});
    	return $itemLayout;
	}

	this.setup = function () {
		if (_mode == EnumCurState.PREVIEW) {
			_$this = _createPreviewChannel(_id);
		} else {
			_$this = _createPlaybackChannel(_id);
            _stream = EnumStreamType.FLUENT;
		}
		delete this.setup;
		return this;
	}
}
