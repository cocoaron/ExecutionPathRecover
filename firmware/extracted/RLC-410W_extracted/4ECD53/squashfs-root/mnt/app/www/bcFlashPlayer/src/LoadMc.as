package
{
	import flash.display.Sprite;

	public class LoadMc extends Sprite
	{
		//loading动画
		private var _loadingMc:LoadingMc;
		
		public function LoadMc()
		{
			_loadingMc = new LoadingMc();
		}
		
		/**
		 * 设置位置
		 * @param x
		 * @param y
		 * 
		 */		
		public function setPosonCenter(w:Number,h:Number):void
		{
			if(_loadingMc && _loadingMc.parent)
			{
				_loadingMc.x = (w - _loadingMc.width) /2;
				_loadingMc.y = (h - _loadingMc.height)/2;
			}
		}
		
		/**
		 * 移除加载动画
		 */
		public function removeLoadingMc():void
		{
			if(_loadingMc && _loadingMc.parent)
			{
				_loadingMc.parent.removeChild(_loadingMc);
			}
		}
		/**
		 * 添加加载动画
		 */
		public function addLoadingMc(parent:Sprite):void
		{
			parent.addChildAt(_loadingMc,0);
		}
	}
}