package 
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.net.NetStream;
	import flash.net.NetStreamInfo;
	import flash.text.TextField;
	import flash.text.TextFieldType;
	import flash.utils.Timer;

	public class LogInfo extends Sprite
	{
		private var _stream:NetStream;
		
		private var _logger:TextField;
		private var _streaminfo:TextField;
		private var _timer:Timer;
		
		public function LogInfo()
		{
			_init();
		}
		
		public function setStream(stream:NetStream):void
		{
			_stream = stream;
		}
		
		public function start():void
		{
			_timer.start();
		}
		
		public function stop():void
		{
			_timer.stop();
		}
		
		private function _init():void
		{	
			_streaminfo = new TextField();
			_streaminfo.multiline = true;
			_streaminfo.textColor = 0xcccccc;
			_streaminfo.type = TextFieldType.DYNAMIC;
			_streaminfo.text = "\n\n\n\n\n\n\n\n\n\n\n";
			_streaminfo.width = 200;
			_streaminfo.height = _streaminfo.textHeight+300;
			addChild(_streaminfo);
			
			_timer = new Timer(1000);
			_timer.addEventListener(TimerEvent.TIMER,update);
		}
		
		public function update(evt:Event):void
		{
			var stream:NetStream = this._stream;
			if(!stream)
				return;
			
			if(!stream.hasOwnProperty("info"))
				return;
			try{
				var info:NetStreamInfo = stream.info;
			}catch(e:Error)
			{
				return;
			}
			
			var text:String;
			text = ("isLive: "+info.isLive+"\n"+
				"byteCount: "+info.byteCount+"\n"+
				"audioBufferLength: "+info.audioBufferLength+"\n"+
				"videoBufferLength: "+info.videoBufferLength+"\n"+
				"currentBytesPerSecond: "+Math.floor(info.currentBytesPerSecond)+"\n"+
				"maxBytesPerSecond: "+Math.floor(info.maxBytesPerSecond)+"\n"+
				"audioBytesPerSecond: "+Math.floor(info.audioBytesPerSecond)+"\n"+
				"videoBytesPerSecond: "+Math.floor(info.videoBytesPerSecond)+"\n"+
				"playbackBytesPerSecond: "+Math.floor(info.playbackBytesPerSecond)+"\n"+
				"bandwidth: "+Math.floor(info.maxBytesPerSecond * 8 / 1024)+"KB/s\n"+
				"droppedFrames: "+info.droppedFrames+"\n"+
				"time: "+stream.time+"\n"+
				"bufferLength: "+stream.bufferLength+"\n"+
				"backBufferLength: "+stream.backBufferLength+"\n"+
				"bytesLoaded: "+stream.bytesLoaded+"\n"+
				"bytesTotal: "+stream.bytesTotal+"\n"+
				"currentFPS: "+Math.floor(stream.currentFPS)+"\n"+
				"bufferTimeMax: "+Number(stream.bufferTimeMax)+"\n"+
				"bufferTime: "+Number(stream.bufferTime)+"\n"+
				"liveDelay: "+stream.liveDelay+"\n");
			_streaminfo.text = text;
		}
	}
}

