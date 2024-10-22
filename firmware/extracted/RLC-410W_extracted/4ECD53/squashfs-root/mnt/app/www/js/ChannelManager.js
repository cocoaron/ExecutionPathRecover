/*
 * ChannelManager 类负责管理所有通道。
 * 
 * 作者：曾鹏辉
 * 日期：2016-01-22 16:15
 */

/**
 * class ChannelManager
 * 
 * Events:
 * 
 *   onInited()
 *     该事件是在初始化完成后触发
 * 
 *   onOpen(Channel channelObj, jQuery $channelObj)
 *     该事件是在一个通道需要被打开时触发。
 *     Channel channelObj      通道对象
 *     jQuery $channelObj      通道jQuery对象
 * 
 *   onClose(Channel channelObj, jQuery $channelObj)
 *     该事件是在一个通道需要被关闭时触发。
 *     Channel channelObj      通道对象
 *     jQuery $channelObj      视图jQuery对象
 * 
 *   onPause(Channel channelObj, jQuery $channelObj)
 *     该事件是在一个通道需要被暂停时触发。
 *     Channel channelObj      通道对象
 *     jQuery $channelObj      通道jQuery对象
 * 
 *   onStreamChange(Channel channelObj, jQuery $channelObj, EnumStreamType newType, EnumStreamType oldType)
 *     该事件是在一个通道需要被更新码流类型时触发。
 *     Channel channelObj      通道对象
 *     jQuery $channelObj      通道jQuery对象
 *     EnumStreamType newType  新的码流类型值
 *     EnumStreamType oldType  旧的码流类型值
 * 
 *   onModeChange(EnumCurState newMode, EnumCurState oldMode)
 *     该事件是在工作模式被修改时触发。
 *     EnumCurState newMode  新的工作模式
 *     EnumCurState oldMode  旧的工作模式
 * 
 */
function ChannelManager() {
	throw {"msg": "Don't NEW a singleton."};
}

EventListener.apply(ChannelManager);

(function() {

	var _channelNum = 0;

	var _mode = EnumCurState.PREVIEW;

	var _channels = {
		"PREVIEW": [],
		"PLAYBACK": []
	};

	/**
	 * 获取一个 Channel 对象
	 * @param int id       Channel Id
	 */
	ChannelManager.get = function(id) {
		return _channels[_mode][id];
	};

	/**
	 * 获取当前工作模式
	 */
	ChannelManager.getMode = function() {
		return _mode;
	};

	/**
	 * 设置当前工作模式
	 * @param EnumCurState mode  工作模式
	 * @return boolean
	 */
	ChannelManager.setMode = function(mode) {
		var oldMode = _mode;
		switch (mode) {
		case EnumCurState.PLAYBACK:
		case EnumCurState.PREVIEW:
			break;
		default:
			return false;
		}
		_mode = mode;
		this.trigger('modechange', [mode, oldMode]);
		return true;
	};

	/**
	 * 获取当前最大通道数。
	 */
	ChannelManager.getNumber = function () {
		return _channelNum;
	};

	/**
	 * 初始化 Channel 列表
	 * @param int channelNum 总的通道数
	 */
	ChannelManager.init = function (channelNum) {
		_channelNum = channelNum;
		for (var i = 0; i < channelNum; i++) {
			_channels[EnumCurState.PREVIEW].push((new Channel(i, EnumCurState.PREVIEW)).setup());
			_channels[EnumCurState.PLAYBACK].push((new Channel(i, EnumCurState.PLAYBACK)).setup());
		}
		this.trigger('inited');
		delete this.init;
	};

	/**
	 * 批量关闭指定通道。
	 * @param array channels
	 */
	ChannelManager.close = function (channels) {
		for (var i in channels) {
            typeof(channels[i]) == 'number' && this.get(channels[i]) && this.get(channels[i]).close();
            
		}
		return this;
	};

	/**
	 * 批量打开指定通道。
	 * @param array channels
	 */
	ChannelManager.open = function (channels, streamType, isAuto) {
		for (var i in channels) {
			typeof(channels[i]) == 'number' && this.get(channels[i]).open(streamType, isAuto);
		}
		return this;
	};

	/**
	 * 批量暂停指定通道。
	 * @param array channels
	 */
	ChannelManager.pause = function (channels) {
		for (var i in channels) {
			typeof(channels[i]) == 'number' && this.get(channels[i]).pause();
		}
		return this;
	};

})();
