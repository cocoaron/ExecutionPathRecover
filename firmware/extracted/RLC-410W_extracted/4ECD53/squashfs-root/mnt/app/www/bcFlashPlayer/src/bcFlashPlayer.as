package
{
	import flash.display.Bitmap;
	import flash.display.LoaderInfo;
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageDisplayState;
	import flash.display.StageScaleMode;
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.FullScreenEvent;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.media.SoundTransform;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.system.Security;
	import flash.text.TextField;
	import flash.ui.ContextMenu;
	import flash.ui.ContextMenuItem;
	import flash.utils.Timer;
	import flash.utils.getTimer;
	import flash.utils.setTimeout;
	
	[SWF(backgroundColor=0xcccccc)]
	public class bcFlashPlayer extends Sprite
	{
		// user set id.
		private var _jsId:String = null;
		private var _jsVersion:String = null;
		private var _jsData:Object = {};
		
		// user set callback
		private var js_on_player_ready:String = null;
		private var js_on_player_metadata:String = null;
		private var js_on_player_timer:String = null;
		private var js_on_player_empty:String = null;
		private var js_on_player_full:String = null;
		private var js_on_onPlay:String = null;
		
		// play param url.
		private var user_url:String = null;
		// play param, user set width and height
		private var user_w:int = 0;
		private var user_h:int = 0;
		
		private var user_set_w:Number = 0;
		private var user_set_h:Number = 0;
		private var user_set_x:Number = 0;
		private var user_set_y:Number = 0;
		private var video_w:Number = 0;
		private var video_h:Number = 0;
		
		private const SCREEN:String = "screen";
		private const VIDEO:String = "video";
		private const REFER_SCREEN:int = 0;
		private const REFER_VIDEO:int = 1;
		
		// user set dar den:num
		private var user_dar_den:int = 0;
		private var user_dar_num:int = 0;
		// user set fs(fullscreen) refer and percent.
		private var user_fs_refer:String = SCREEN;
		private var user_fs_percent:int = 100;
		
		// media specified.
		private var media_conn:NetConnection = null;
		private var media_stream:NetStream = null;
		private var media_video:Video = null;
		private var media_metadata:Object = {};
		private var media_timer:Timer = new Timer(400);
		
		private var _state:String = "BUFFERING";
		private static const STATE_PLAYING:String = "PLAYING";
		private static const STATE_IDLE:String = "IDLE";
		private static const STATE_PAUSED:String = "PAUSED";
		private static const STATE_BUFFERING:String = "BUFFERING";
		private static const STATE_ERROR:String = "ERROR";
		
		private var _logInfo:LogInfo;
		
		//loading动画
		private var _loadingMc:LoadMc;
		
		// controls.
		// flash donot allow js to set to fullscreen,
		// only allow user click to enter fullscreen.
		private var control_fs_mask:Sprite = new Sprite();
		
		private var _set_bufferTime:Number = 0.6;
		private var _mainFps:int = 0;
		private var _subFps:int = 0;
		private var _extFps:int = 0;
		private var _currentFps:int = 0;
		
		//cache old stream for changeing url 
		private var _oldStream:NetStream;
		private var _oldConnect:NetConnection;
		
		private var _videoBitmap:Bitmap;
		
		private const PLAYBACK_BUFFER_TIME:Number = 6;
		
		private var _isAreadyStop:Boolean = false;
		
		public function bcFlashPlayer()
		{
			if (!stage) {
				addEventListener(Event.ADDED_TO_STAGE, system_on_add_to_stage);
			} else {
				system_on_add_to_stage(null);
			}
		}
	
		
		public function get state():String
		{
			return _state;
		}
		
		public function set state(value:String):void
		{
			_state = value;
		}
		
		/**
		 * system event callback, when this control added to stage.
		 * the main function.
		 */
		private function system_on_add_to_stage(evt:Event):void 
		{
			removeEventListener(Event.ADDED_TO_STAGE, system_on_add_to_stage);
			
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			
			Security.allowDomain("*");
			
			_loadingMc = new LoadMc();
			
			addChild(control_fs_mask);
			control_fs_mask.buttonMode = true;
			control_fs_mask.addEventListener(MouseEvent.CLICK, user_on_click_video);
			
			contextMenu = new ContextMenu();
			contextMenu.hideBuiltInItems();
			
			var flashvars:Object = root.loaderInfo.parameters;
			
			if (!flashvars.hasOwnProperty("id")) {
				//throw new Error("must specifies the id");
			}
			
			flash.utils.setTimeout(system_on_js_ready, 0);
			
			//full screen
			stage.doubleClickEnabled=true;
			stage.addEventListener(MouseEvent.DOUBLE_CLICK,user_on_click_video);
			stage.addEventListener(FullScreenEvent.FULL_SCREEN, screenFullHandler);
			_logInfo = new LogInfo();
		}
		
		/**
		 * system callack event, when js ready, register callback for js.
		 * the actual main function.
		 */
		private function system_on_js_ready():void 
		{
			if (!isExternalInterfaceAvailable) {
				log("js not ready, try later.");
				flash.utils.setTimeout(system_on_js_ready, 100);
				return;
			}
			_addExternalInterfaceCallback();
		}
		
		
		/**
		 * system callack event, timer to do some regular tasks.
		 */
		private function system_on_timer(evt:TimerEvent):void 
		{
			if(isExternalInterfaceAvailable)
			{
				if(media_stream && media_stream.time)
				{
					flash.external.ExternalInterface.call("onTime",{position:media_stream.time},getInfo());
				}
			}
		}
		
		/**
		 * system callback event, when stream is empty.
		 */
		private function system_on_buffer_empty():void 
		{
			return;
			var time:Number = flash.utils.getTimer();
			log("stream is empty at " + time + "ms");
			if(isExternalInterfaceAvailable)
			{
				flash.external.ExternalInterface.call(js_on_player_empty, _jsId, time);
			}
		}
		
		private function system_on_buffer_full():void 
		{
			return;
			var time:Number = flash.utils.getTimer();
			log("stream is full at " + time + "ms");
			if(isExternalInterfaceAvailable)
			{
				flash.external.ExternalInterface.call(js_on_player_full, _jsId, time);
			}
		}
		
		/**
		 * system callack event, when got metadata from stream.
		 * or got video dimension change event(the DAR notification), to update the metadata manually.
		 */
		private function system_on_metadata(metadata:Object):void 
		{
			media_metadata = metadata;
			_dealFps();
			if(!media_video)
			{
				return;
			}
			var obj:Object = _get_video_size_object();
			if(user_set_h>0)
			{
				obj.width = user_set_w;
				obj.height = user_set_h;
				media_video.x = user_set_x;
				media_video.y = user_set_y;
			}
			setVideoWidth(0);
			media_video.height = 0;
			
			//reset position
			js_call_setSize(user_set_w,user_set_h,user_set_x,user_set_y);
			
			user_w = obj.width;
			user_h = obj.height;
			
			if(user_fs_refer == VIDEO)
			{
				js_call_set_fs_size(REFER_VIDEO);
			}else
			{
				js_call_set_fs_size(REFER_SCREEN);
			}
			
			_loadingMc.removeLoadingMc();
			
			if(isExternalInterfaceAvailable)
			{
				var code:int = flash.external.ExternalInterface.call(js_on_player_metadata, _jsId, obj);
				if (code != 0) {
					throw new Error("callback on_player_metadata failed. code=" + code);
				}
			}
		
			if(isExternalInterfaceAvailable)
			{
				flash.external.ExternalInterface.call("onPlay", {"newstate":"PLAYING"}, getInfo());
			}
		}
		
		private function _dealFps():void
		{
			if(!media_metadata.framerate)
			{
				return;
			}
			
			if(_currentFps <= 0)
			{
				return;
			}
			
			if(_currentFps != media_metadata.framerate)
			{
				_currentFps = media_metadata.framerate;
				js_call_stop();
				
				playAfterChangeFps(_currentFps);
			}
			
			_currentFps = media_metadata.framerate;
		}
		
		/**
		 * user event callback, js cannot enter the fullscreen mode, user must click to.
		 */
		private function user_on_click_video(evt:MouseEvent):void {
			if (!stage.allowsFullScreen) {
				log("donot allow fullscreen.");
				return;
			}
			
			// enter fullscreen to get the fullscreen size correctly.
			if (stage.displayState == StageDisplayState.FULL_SCREEN) {
				stage.displayState = StageDisplayState.NORMAL;	
			} else {
				stage.displayState = StageDisplayState.FULL_SCREEN;
			}
		}
		
		private function screenFullHandler(event:FullScreenEvent):void
		{
			if (stage.displayState != StageDisplayState.FULL_SCREEN) {
				if(user_fs_refer == SCREEN)
				{
					js_call_set_fs_size(0);
				}else
				{
					js_call_set_fs_size(1);
				}
				
				if(isExternalInterfaceAvailable)
				{
					flash.external.ExternalInterface.call("exitFullScreen",_jsId);
				}
				if(media_video)
				{
					media_video.x = (user_set_w - media_video.width)>> 1;
					media_video.y = (user_set_h - media_video.height)>> 1;
				}
				
			} else {
				setVideoWidth(stage.fullScreenWidth);
				media_video.height = stage.fullScreenHeight;
				
				if(isExternalInterfaceAvailable)
				{
					flash.external.ExternalInterface.call("onFullScreen",_jsId);
				}
				
				if(media_video)
				{
					media_video.x = (stage.fullScreenWidth - media_video.width)>> 1;
					media_video.y = (stage.fullScreenHeight - media_video.height)>> 1 +50;
				}
			}
		}
		
		
		private function js_continuePlay():Boolean 
		{
			if (media_stream) 
			{
				media_stream.resume();
			}else
			{
				js_call_resume();
			}
			return true;
		}
		
		/**
		 * set buffer time
		 */
		private function js_setBufferTime(bufferTime:Number):Boolean 
		{
			_set_bufferTime = bufferTime;
			return true;
		}
		
		
		// srs infos
		private var srs_server:String = null;
		private var srs_primary:String = null;
		private var srs_authors:String = null;
		private var srs_id:String = null;
		private var srs_pid:String = null;
		private var srs_server_ip:String = null;
		private function update_context_items():void {
			// for context menu
			var customItems:Array = [new ContextMenuItem("version : " + _jsVersion)];
			contextMenu.customItems = customItems;
		}
		
		private function _getParmByUrl(url:String,parmName:String):int
		{
			var tempUrlArr:Array = url.split("&");
			var parm:int = -1;
			for(var i:int = tempUrlArr.length -1;i >=0;i --)
			{
				if(tempUrlArr[i].indexOf(parmName) != -1)
				{
					parm = tempUrlArr[i].split("=")[1];
					return parm;
				}
			}
			return -1;
		}
		
		private function _getFps(channel:int,id:String):void
		{
			if(isExternalInterfaceAvailable)
			{
				flash.external.ExternalInterface.call("getFps",channel,id);
			}
		}
		
		private function js_afterGetFps(data:Object):void
		{
			_mainFps = data.mainStream;
			_subFps = data.subStream;
			_extFps = data.extStream;
			var streamType:int = _getParmByUrl(_tempParmObj.url,"stream");
			var fps:int;
			if(streamType == 1)
			{
				fps = _subFps;
			}else if(streamType == 2)
			{
				fps = _extFps;
			}else
			{
				fps = _mainFps;
			}
			
			playAfterGetFps(_tempParmObj.url,_tempParmObj.refer,_tempParmObj.seekTo,0,_tempParmObj.data,fps);
		}
		
		private function playAfterChangeFps(fps:int):void
		{
			playAfterGetFps(_tempParmObj.url,_tempParmObj.refer,_tempParmObj.seekTo,0,_tempParmObj.data,fps);
		}
		
		private function playAfterGetFps(url:String,refer:int, seekTo:Number,buffer_time:Number ,data:Object,fps:int):void
		{
			_calledFps = false;
			_jsData = data;
			_jsId = data.id;
			_jsVersion = data.version;
			user_fs_refer = (refer == REFER_SCREEN ? SCREEN:VIDEO);
			user_url = url;
			
			log("start to play url: " + user_url + ", w=" + user_w + ", h=" + user_h);
			
			js_call_stop();
			
			media_conn = new NetConnection();
			media_conn.client = {};
			media_conn.addEventListener(flash.events.SecurityErrorEvent.SECURITY_ERROR, _errorHandler);
			media_conn.addEventListener(flash.events.IOErrorEvent.IO_ERROR, _errorHandler);
			media_conn.addEventListener(flash.events.AsyncErrorEvent.ASYNC_ERROR, _errorHandler);
			media_conn.client.onBWDone = function():void {};
			media_conn.addEventListener(NetStatusEvent.NET_STATUS, function(evt:NetStatusEvent):void {
				trace ("NetConnection: code=" + evt.info.code);
				
				if (evt.info.hasOwnProperty("data") && evt.info.data) 
				{
					data = getInfo();
				}
				
				// TODO: FIXME: failed event.
				if (evt.info.code != "NetConnection.Connect.Success") 
				{
					return;
				}
				
				media_stream = new NetStream(media_conn);
				
				buffer_time = Number(21 / fps);
				_currentFps = fps;
				buffer_time = _dealBufferTime(buffer_time);
				
				if(!isPlayBack(data))
				{
					media_stream.bufferTime = buffer_time;
				}else
				{
					media_stream.bufferTime = PLAYBACK_BUFFER_TIME;
				}
				
				_set_bufferTime = buffer_time;
				media_stream.bufferTimeMax = media_stream.bufferTime;
				media_stream.client = {};
				
				media_stream.useHardwareDecoder = true;
				
				media_stream.client.onMetaData = system_on_metadata;
				media_stream.addEventListener(NetStatusEvent.NET_STATUS, onNetStatusEvent);
				
				var streamName:String = url.substr(url.lastIndexOf("/") + 1);
				media_stream.play(streamName,seekTo);
				media_stream.inBufferSeek = true;
				media_stream.soundTransform = new SoundTransform(_tempVol);
				_logInfo.setStream(media_stream);
				if(isExternalInterfaceAvailable)
					flash.external.ExternalInterface.call("onPlay", {"newstate":"PLAYING"}, getInfo());
				
				if(!media_video)
				{
					media_video = new Video();
					media_video.smoothing = true;
					addChild(media_video);
					// lowest layer, for mask to cover it.
					setChildIndex(media_video, 0);
				}
				media_video.attachNetStream(media_stream);
			});
			
			if (url.indexOf("http") == 0) {
				media_conn.connect(null);
			} else {
				var tcUrl:String = user_url.substr(0, user_url.lastIndexOf("/"));
				media_conn.connect(tcUrl);
			}
			state = STATE_PLAYING;
			
			if(isPlayBack(data))
			{
				media_timer.addEventListener(TimerEvent.TIMER, system_on_timer);
				media_timer.start();
				system_on_timer(null);
			}
			
			update_context_items();
		}
		
		private function isPlayBack(data:Object):Boolean
		{
			if(data.hasOwnProperty("isPlayBack") && data.isPlayBack > 0)
			{
				return true;
			}
			return false;
		}
		
		private function _dealBufferTime(bufferTime:Number):Number
		{
			if(bufferTime > 6)
			{
				bufferTime = 6;
			}
			if(bufferTime <= 0)
			{
				bufferTime = 1;
			}
			return bufferTime;
		}
		
		
		private function _errorHandler(evt:Event):void
		{
			throw new Error("connect fail");
		}
		
		private function onNetStatusEvent(evt:NetStatusEvent):void
		{
			trace ("NetStream: code=" + evt.info.code);
			
			switch (evt.info.code) {
				case "NetConnection.Connect.Failed":
				case "NetConnection.Connect.Rejected":
				case "NetConnection.Connect.InvalidApp":
					state = STATE_ERROR;
					if(isExternalInterfaceAvailable)
						flash.external.ExternalInterface.call("onError", media_stream.time, getInfo(),0);
					break;
				
				case "NetConnection.Connect.Success":
					state = STATE_BUFFERING;
					break;
				
				case "NetConnection.Connect.Closed":
					state = STATE_ERROR;
					break;
				
				case "NetStream.Play.Start":
					state = STATE_PLAYING;
					this._isAreadyStop = false;
					break;
				
				case "NetStream.Play.Stop":
				case "NetStream.Play.Complete":
					this._isAreadyStop = true;
					break;
				case "NetStream.Buffer.Flush":
					if(isExternalInterfaceAvailable)
					{
						if(media_stream)
						{
							flash.external.ExternalInterface.call("onBuffer", media_stream.time, getInfo());
						}
					}
						
					state = STATE_PLAYING;
					_loadingMc.removeLoadingMc();
					break;
				
				case "NetStream.Buffer.Empty":
					if(this._isAreadyStop && isExternalInterfaceAvailable)
					{
						this._isAreadyStop = false;
						flash.external.ExternalInterface.call("onComplete ",getInfo());
					}
					state = STATE_IDLE;
					system_on_buffer_empty();
					break;
				case "NetStream.Buffer.Full":
					state = STATE_PLAYING;
					system_on_buffer_full();
					break;
				case "NetStream.Video.DimensionChange":
					system_on_metadata(media_metadata);
					_loadingMc.removeLoadingMc();
					break;
			}
		}
		
		/**
		 * get the "right" size of video,
		 * 1. initialize with the original video object size.
		 * 2. override with metadata size if specified.
		 * 3. override with codec size if specified.
		 */
		private function _get_video_size_object():Object {
			var obj:Object = {
				width: media_video.width,
				height: media_video.height
			};
			
			// override with metadata size.
			if (media_metadata.hasOwnProperty("width")) {
				obj.width = media_metadata.width;
			}
			if (media_metadata.hasOwnProperty("height")) {
				obj.height = media_metadata.height;
			}
			
			// override with codec size.
			if (media_video.videoWidth > 0) {
				obj.width = media_video.videoWidth;
			}
			if (media_video.videoHeight > 0) {
				obj.height = media_video.videoHeight;
			}
			
			if(user_set_h>0)
			{
				obj.width = user_set_w;
				obj.height = user_set_h;
				obj.x = user_set_x;
				obj.y = user_set_y;
			}
			
			return obj;
		}
		
		private function log(msg:String):void 
		{
			if (!isExternalInterfaceAvailable) {
				flash.utils.setTimeout(log, 300, msg);
				return;
			}
			if(isExternalInterfaceAvailable)
			{
				ExternalInterface.call("console.dbg", msg);
			}
		}
		
		private function getInfo():Object
		{
			if(!media_stream)
			{
				return null;
			}
			
			var ms:NetStream = media_stream;
			var rtime:Number = flash.utils.getTimer();
			var bitrate:Number = Number((ms.info.videoBytesPerSecond + ms.info.audioBytesPerSecond) * 8 / 1000);
			
			var obj:Object = {};
			obj.js_id = _jsId;
			obj.bufferLength = ms.bufferLength;
			obj.bitrate = bitrate;
			obj.currentFPS = ms.currentFPS;
			obj.rtime = rtime;
			return obj;
		}
		
		private function setVideoWidth(w:Number):void
		{
			media_video.width = w;
		}
		
		private function get isExternalInterfaceAvailable():Boolean
		{
			if(flash.external.ExternalInterface.available)
			{
				return true;
			}
			return false;
		}
		
		private function _addExternalInterfaceCallback():void
		{
			flash.external.ExternalInterface.addCallback("setup", js_call_play);
			flash.external.ExternalInterface.addCallback("setSize", js_call_setSize);
			flash.external.ExternalInterface.addCallback("stop", js_call_stop);
			flash.external.ExternalInterface.addCallback("pause", js_call_pause);
			flash.external.ExternalInterface.addCallback("play", js_call_resume);
			flash.external.ExternalInterface.addCallback("seek", js_call_seek);
			flash.external.ExternalInterface.addCallback("setVolume", js_call_setVolume);
			flash.external.ExternalInterface.addCallback("getVolume", js_call_getVolume);
			flash.external.ExternalInterface.addCallback("setDisplayMode", js_call_set_fs_size);
			flash.external.ExternalInterface.addCallback("getState", js_call_getState);
			flash.external.ExternalInterface.addCallback("playUrl", js_playUrl);
			flash.external.ExternalInterface.addCallback("stretching", js_get_stretching);
			flash.external.ExternalInterface.addCallback("continuePlay", js_continuePlay);
			flash.external.ExternalInterface.addCallback("setBufferTime", js_setBufferTime);
			flash.external.ExternalInterface.addCallback("openLogInfo", js_openLogInfo);
			flash.external.ExternalInterface.addCallback("afterGetFps", js_afterGetFps);
			
			flash.external.ExternalInterface.call(js_on_player_ready, _jsId);
			
			var loadInfo:Object = getDomId();			
			flash.external.ExternalInterface.call("flashLoadComplete",loadInfo);
		}
		
		private function getDomId():Object{
			try {
				var keyStr:String ="";
				var valueStr:String ="";
				var paramObj:Object = LoaderInfo(this.root.loaderInfo).parameters;
				return paramObj;
			} catch (error:Error) {
				
			}
			return {};
		}
	
		/**
		 * function for js to call: to play the stream. stop then play.
		 * @param url, the rtmp/http url to play.
		 * @param _width, the player width.
		 * @param _height, the player height.
		 * @param buffer_time, the buffer time in seconds. recommend to >=0.5
		 * @param volume, the volume, 0 is mute, 1 is 100%, 2 is 200%.
		 */
		private var _tempParmObj:Object = {};
		private var _calledFps:Boolean = false;
		public function js_call_play(url:String,refer:int, seekTo:Number,buffer_time:Number ,data:Object):Boolean 
		{
			if(_calledFps)
			{
				return true;
			}
			
			_calledFps = true;
			
			_tempParmObj.url = url;
			_tempParmObj.refer = refer;
			_tempParmObj.seekTo = seekTo;
			_tempParmObj.buffer_time = buffer_time;
			_tempParmObj.data = data;
			
//			_getFps(_getParmByUrl(url,"channel"),data.id);
			playAfterGetFps(_tempParmObj.url,_tempParmObj.refer,_tempParmObj.seekTo,0,_tempParmObj.data,30);
			
			return true;
		}
		
		public function js_call_setSize(w:Number,h:Number,_x:Number,_y:Number):Boolean
		{
			if (stage.displayState == StageDisplayState.FULL_SCREEN) 
			{
				return false;
			}
			user_set_w = w;
			user_set_h = h;
			user_set_x = _x;
			user_set_y = _y;
			if(media_video)
			{
				if(js_get_stretching())
				{
					setVideoWidth ( w);
					media_video.height = h;
					media_video.x = _x;
					media_video.y = _y;
				}else
				{
					js_call_set_fs_size(REFER_VIDEO);
				}
			}
			
			_loadingMc.addLoadingMc(this);
			_loadingMc.setPosonCenter(user_set_w,user_set_h);
			
			return true;
		}
		
		/**
		 * function for js to call: to stop the stream. ignore if not play.
		 */
		private function js_call_stop():Boolean 
		{
			if (media_video){
				media_video.attachNetStream(null);
				media_video.clear();	
				media_video = null;
			}
			if (media_stream) {
				media_stream.dispose();				
				media_stream.close();
				media_stream = null;
				log("player stopped media_stream");
				_oldStream = media_stream;
			}
			if (media_conn) {
				media_conn.close();
				media_conn = null;
				log("player stopped media_conn");			
			}
			log("player stopped");
			
			if(isExternalInterfaceAvailable)
			{
				flash.external.ExternalInterface.call("onPause",{"newstate" : "PAUSED"} );
			}
			
			if(media_timer)
			{
				media_timer.removeEventListener(TimerEvent.TIMER, system_on_timer);
				media_timer.stop();
			}
			state = STATE_IDLE;
			return true;
		}
		
		/**
		 * function for js to call: to pause the stream. ignore if not play.
		 */
		private function js_call_pause():Boolean 
		{
			if (media_stream) 
			{
				media_stream.pause();
				if(isExternalInterfaceAvailable)
				{
					flash.external.ExternalInterface.call("onPause", media_stream.time, getInfo());
				}
			}
			state = STATE_PAUSED;
			return true;
		}
		
		/**
		 * function for js to call: to resume the stream. ignore if not play.
		 */
		private function js_call_resume():Boolean 
		{
			_loadingMc.addLoadingMc(this);
			state = STATE_PLAYING;
			if (media_stream) 
			{
				
			}else
			{
				var refer:int = (user_fs_refer == SCREEN) ? REFER_SCREEN : REFER_VIDEO;
				js_call_play(user_url,refer,1,_set_bufferTime,_jsData);
			}
			return true;
		}
		
		/**
		 * 定位播放
		 */
		private function js_call_seek(pos:Number):Boolean 
		{
			if (media_stream) {
				media_stream.seek(pos);
			}
			return true;
		}
		
		/**
		 * 设定音量
		 */
		private var _tempVol:Number = 0.5;
		private function js_call_setVolume(newVol:Number):Boolean 
		{
			if (media_stream) {
				var vol:Number = newVol /100;
				media_stream.soundTransform = new SoundTransform(vol);
			}else
			{
				_tempVol = newVol /100;
			}
			return true;
		}
		/**
		 * 获取音量
		 */
		private function js_call_getVolume():Number 
		{
			if (media_stream) {
				return media_stream.soundTransform.volume;
			}else
			{
				return _tempVol;
			}
			return -1;
		}
		
		/**
		 * set the fullscreen size data.
		 * @refer the refer fullscreen mode. it can be:
		 *       video: use video orignal size.
		 *       screen: use screen size to rescale video.
		 * @param percent, the rescale percent, where
		 *       100 means 100%.
		 */
		private function js_call_set_fs_size(refer:int):Boolean 
		{
			
			user_fs_refer = (refer == REFER_SCREEN ? SCREEN:VIDEO);
			
			if(media_video)
			{
				if(user_fs_refer == SCREEN)
				{
					setVideoWidth(user_set_w);
					media_video.height = user_set_h;
					media_video.x = 0;
				}else
				{
					if (media_metadata.hasOwnProperty("width")) {
						setVideoWidth ( media_metadata.width);
					}else
					{
						setVideoWidth ( video_w);
					}
					if (media_metadata.hasOwnProperty("height")) {
						media_video.height = media_metadata.height;
					}else
					{
						media_video.height = video_h;
					}
					
					var scale:Number = Number(user_set_h/media_video.height);
					
					media_video.height = user_set_h;
					setVideoWidth ( scale * media_video.width);
					
					media_video.x = (user_set_w - media_video.width)/2;
				}
			}
			
			user_fs_percent = 100;
			return true;
		}
		
		/**
		 * 获取当前播放状态
		 */
		private function js_call_getState():String {
			return state;
		}
		
		/**
		 * 播放指定url
		 */
		private function js_playUrl(url:String):Boolean 
		{
			js_call_play(url,0,1,_set_bufferTime,_jsData);
			return true;
		}
		
		private function js_get_stretching():Boolean 
			
		{
			return (user_fs_refer == SCREEN) ? true:false;
		}
		
		/**
		 * 是否显示调试信息
		 */
		private function js_openLogInfo(isShow:Boolean):void
		{
			if(!media_stream)
			{
				return;
			}
			if(!isShow)
			{
				_logInfo.stop();
				_logInfo.parent.removeChild(_logInfo);
			}else
			{
				addChild(_logInfo);
				_logInfo.start();
				_logInfo.y = 0;
			}
		}
	}
}
