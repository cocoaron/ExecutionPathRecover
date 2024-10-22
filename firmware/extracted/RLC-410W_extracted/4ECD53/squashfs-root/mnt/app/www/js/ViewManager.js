/**
 * ViewManager 类负责各个视图的集中管理。
 * 
 * 作者：韦宏
 * 日期：2016-01-22 14:30
 */

/**
 * class ViewManager
 * 
 * Events:
 * 
 *   onDrop(View viewObj, jQuery $viewObj, jQuery $channelObj)
 *     该事件是在拖放事件触发时发生的
 *     View viewObj         视图对象
 *     jQuery $viewObj      视图jQuery对象
 *     jQuery $channelObj   通道jQuery对象
 * 
 *   onClose(View viewObj, jQuery $viewObj)
 *     该事件是在通道绑定被关闭时发生的
 *     View viewObj         视图对象
 *     jQuery $viewObj      视图jQuery对象
 * 
 *   onSnap(View viewObj, jQuery $viewObj)
 *     该事件是在截图按钮被单击时发生的
 *     View viewObj         视图对象
 *     jQuery $viewObj      视图jQuery对象
 * 
 *   onRecord(View viewObj, jQuery $viewObj)
 *     该事件是在录像按钮被单击时发生的
 *     View viewObj         视图对象
 *     jQuery $viewObj      视图jQuery对象
 */
function ViewManager() {
    throw {"msg": "Don't NEW a singleton."};
}

EventListener.apply(ViewManager);

(function() {

    var _screenViews = EnumScreenMode.NINE;
    
    var _mode = EnumCurState.LOGIN;

    var _curPage = 0;
    
    var _curPageCount = 1;

	var _maxViews = {
		"PREVIEW" : 16,
		"PLAYBACK" : 4
	};

	var _viewObjs = {
		"PREVIEW" : [],
		"PLAYBACK" : []
	};

	var _storedStatus = {
		"PREVIEW" : null,
		"PLAYBACK" : null
	};

	/**
	 * 储存当前模式下平面的状态信息。 
	 */
	ViewManager.storeScreen = function () {
		if (!this.checkMode())
			return false;

		_storedStatus[_mode] = {
			"selectedView": this.getSelectedView().getId(),
			"currentPage": _curPage,
			"currentPageCount": _curPageCount,
			"screenView": _screenViews
		};

		return true;
	};

	/**
	 * 还原上次储存的，当前模式下平面的状态信息。 
	 */
	ViewManager.recoverScreen = function () {
		if (!this.checkMode() || !_storedStatus[_mode])
			return false;

		this.getViewObject(_storedStatus[_mode].selectedView).setSelected();
		_curPage = _storedStatus[_mode].currentPage;
		_curPageCount = _storedStatus[_mode].currentPageCount;
		_screenViews = _storedStatus[_mode].screenView;

		_storedStatus[_mode] = null;

		return true;
	};

	/**
	 * 本方法检查 当前mode 是否为 ViewManager 的可用工作模式 
	 */
	ViewManager.checkMode = function () {
		if (_mode == EnumCurState.PREVIEW || _mode == EnumCurState.PLAYBACK)
			return true;
		return false;
	};

    ViewManager.setMode = function(mode) {
    	_mode = mode;
    	return this;
    };
    
    ViewManager.getMode = function() {
    	return _mode;
    };

	ViewManager.getMaxPage = function() {
		return _curPageCount;
	}

	//获取最大View值
    ViewManager.getMaxViewNumber = function() {
    	if (this.checkMode())
    		return _maxViews[_mode];
    	return null;
    };

	//获取画面数
    ViewManager.getScreenViews = function() {
        return _screenViews;
    };

	//设置当前画面数
    ViewManager.setScreenViews = function(newScreenViews) {
    	switch(newScreenViews){
		case EnumScreenMode.ONE:
		case EnumScreenMode.FOUR:
		case EnumScreenMode.NINE:
		case EnumScreenMode.SIXTEEN:
			break;
		default:
			return false;
    	}
    	_screenViews = newScreenViews;
    	_curPageCount = Math.ceil(this.getMaxViewNumber() / _screenViews);
    	return true;
    };
   
	//获取当前页
    ViewManager.getCurrentPage = function() {
        return _curPage;
    };

	//设置当前页
    ViewManager.setCurrentPage = function(newPage) {
        if (newPage >= 0 && newPage < this.getMaxPage()) {
            _curPage = newPage;
            return true;
        }
        return false;
    };

    ViewManager.getViewObject = function(index) {
    	if (this.checkMode())
    		return _viewObjs[_mode][index];
    	return null;
    };

    ViewManager.init = function(){
    	for (var mode in _maxViews) {
	    	for(var i = 0; i < _maxViews[mode]; i++) {
	    		var viewObj = new View(i, mode);
	    		viewObj.setup();
	    		_viewObjs[mode].push(viewObj);
	    	}
			_viewObjs[mode][0].setSelected();
	    }

    	this.initEvents();
    	delete this.init;
    };

	/**
	 * 绑定平面切换控制器的事件 
	 */
	ViewManager.initEvents = function () {
		
        // preview buttom button

        $("#preview_preview_screen_button").click(function () {
        	ViewManager.showPreviousPage();
        });

        $("#preview_next_screen_button").click(function () {
        	ViewManager.showNextPage();
        });

        $("#preview_screen_1").click(function () {
        	ViewManager.showScreen(EnumScreenMode.ONE);
        });

        $("#preview_screen_4").click(function () {
        	ViewManager.showScreen(EnumScreenMode.FOUR);
        });

        $("#preview_screen_9").click(function () {
        	ViewManager.showScreen(EnumScreenMode.NINE);
        });

        $("#preview_screen_16").click(function () {
        	ViewManager.showScreen(EnumScreenMode.SIXTEEN);
        });

		delete this.initEvents;

	};

	/**
	 *  根据视图数显示对应的屏幕
	 *  会切换到当前选择的视图对应的页面
	 * @param EnumScreenMode scrm
	 */
	ViewManager.showScreen = function (scrm, doforce) {
		if(this.getScreenViews() === scrm && !doforce)
			return;

		this.setScreenViews(scrm);
		this.setCurrentPage(Math.floor(this.getSelectedView().getId() / this.getScreenViews()));
		this.updateView();
	};

	/**
	 * 切换下一页 
	 */
	ViewManager.showNextPage = function () {
		var curPage = this.getCurrentPage();
		var maxPage = this.getMaxPage();
		if(curPage < maxPage - 1){
			this.setCurrentPage(curPage + 1);
			this.updateView();
		}
	};

	/**
	 * 切换上一页 
	 */
	ViewManager.showPreviousPage = function () {
		var curPage = this.getCurrentPage();
		if(curPage > 0){
			this.setCurrentPage(curPage - 1);
			this.updateView();
		}
	};

	ViewManager.getSelectedView = function () {
		var $obj = $('.view-block.selected[bc-view-mode="' + _mode + '"]');
		if ($obj.length == 0)
			return null;
		return this.getViewObject(parseInt($obj.attr('bc-view-id')));
	};
	

    ViewManager.updateView = function(){
    	if (!this.checkMode())
    		return false;
		var length = (1 + this.getCurrentPage()) * this.getScreenViews();

		$('.' + VIEW_DOM_CLASS).hide();
		$('.fplayer-mask').hide();

		var viewLength = Math.sqrt(this.getScreenViews());

		for(var index = this.getCurrentPage() * this.getScreenViews(); index < length; index++){
			var viewObj = this.getViewObject(index);
			if(viewObj != null ){
				viewObj.resize(viewLength, index % this.getScreenViews());
				viewObj.show();
				// var channel = viewObj.getChannelId();
				// if((channel != null) && (channel >= 0 && channel < ChannelManager.getNumber())){
				// 	var channelObj = ChannelManager.get(channel);
				// 	var channelStatus = channelObj.getStatus();
				// 	if(EnumChannelStatus.CLOSED === channelStatus){
				// 		continue;
				// 	}
				// 	var isAuto = channelObj.getAuto();
				// 	var streamType = channelObj.getStream();
				// 	channelObj.open(streamType, isAuto);
				// }
			}else{
				continue;
			}
			
		}

		this.trigger('updateView');
	};

	ViewManager.showScreenByChannels = function (){
		var channelCount = ChannelManager.getNumber();
		// TODO debug代码
        channelCount = 16; // debug
        var $screen1 = $("#preview_screen_1");
        var $screen4 = $("#preview_screen_4");
        var $screen9 = $("#preview_screen_9");
        var $screen16 = $("#preview_screen_16");
        var $scrollView = $("#preview_li_scroll");
        var $previewScrennControl = $("#preview_screnn_control");

        var $preScreenContainer = $("#pre_toolbar_screen_container");
        if (channelCount <= 1) {
            $screen1.hide();
            $screen4.hide();
            $screen9.hide();
            $screen16.hide();
        } else if (channelCount > 1 && channelCount <= 4) {
            $screen1.show();
            $screen4.show();
            $screen9.hide();
            $screen16.hide();
        } else if (channelCount > 4 && channelCount <= 9) {
            $screen1.show();
            $screen4.show();
            $screen9.show();
            $screen16.hide();
        } else {

            $screen1.show();
            $screen4.show();
            $screen9.show();
            $screen16.show();
        }

        if (channelCount <= 1) {
            $preScreenContainer.hide();
        } else {
            $preScreenContainer.show();
        }
	};
    
})();
