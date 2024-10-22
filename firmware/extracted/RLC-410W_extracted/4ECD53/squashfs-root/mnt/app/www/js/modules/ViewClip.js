
/**
 * ViewClip 类负责 预览界面的视频抠图控制
 */
function ViewClip() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(ViewClip);

(function() {

    var $statusCtrl;
    var $clipFrame;
    var $clipBox;
    var $dragSpot_lt, $dragSpot_rt, $dragSpot_lb, $dragSpot_rb;

    var _ratio;
    // var refreshWorking = false;

    var isMoving, moveTaskId, startId;
    var moveTarget; // 抠图小小窗相对 $clipFrame 的偏移
    var preCoordinate;
    var isEnabledClip, updateTimer;
    var isSchedWorking = false;  // 是否进行定时刷新的依据之一
    var isDragged = false;  // 判断鼠标松开前是拉伸抠图框还是点击移动抠图框
    var draggingSpot = null;

    // var first;

    var resolutionSize = { // 主码流分辨率
        "height": 1440,
        "width": 2560
    };

    var windowSize = { // 预览小窗口的尺寸
        "height": 360,
        "width": 640
    };

    var boxSize = {  // 不可拉伸抠图小小窗的尺寸
        "height": 360,
        "width": 640
    };

    var drowBox = {  // 可拉伸抠图小小窗的尺寸
        "height": 0,
        "width": 0
    };

    var boxPos = {  // 抠图小小窗相对 $clipFrame 的偏移
        "top": 0,
        "left": 0
    };

    var minBox = {  // 子码流分辨率
        "height": 0,
        "width": 0
    };

    this.setSchedule = function(status) {

        isSchedWorking = status;
    };

    this.initUI = function() {

        $statusCtrl = $("#toggle-clip-status");
        $clipFrame = $("#clip-view-frame");
        $clipBox = $("#clip-target-view");
        $dragSpot_lt = $clipBox.find('.left-top-spot');
        $dragSpot_rt = $clipBox.find('.right-top-spot'); 
        $dragSpot_lb = $clipBox.find('.left-bottom-spot'); 
        $dragSpot_rb = $clipBox.find('.right-bottom-spot');

        $statusCtrl.on("click", function() {

            ViewClip.toggleStatus();  // 切换抠图界面可操作性，切换码流类型
        });

        windowSize.width = $clipFrame.innerWidth();

        _ratio = resolutionSize.width / $clipFrame.innerWidth();

        $clipFrame.css({  // 获得等宽高比的预览小窗口
            "height": resolutionSize.height / _ratio
        });

        this.refreshBgImg(0);  // 刷新右侧抠图预览窗口

        this.onAutoUpdatePos(); // getCrop，定时更新右侧抠图界面

        var fixedTargetPosOnWeb = function() {  // 边缘位置处理

            if (moveTarget.left < 0) {

                moveTarget.left = 0;

            } else if (moveTarget.left + $clipBox.width() > $clipFrame.innerWidth()) {

                moveTarget.left = $clipFrame.innerWidth() - $clipBox.width();
            }

            if (moveTarget.top < 0) {

                moveTarget.top = 0;

            } else if (moveTarget.top + $clipBox.height() > $clipFrame.innerHeight()) {

                moveTarget.top = $clipFrame.innerHeight() - $clipBox.height();
            }
        };

        var doMove = function(pos) { // 响应不支持拉伸的拖动操作（只移动抠图小小窗的位置）

            moveTaskId = String.random(16);

            (function(id) {

                setTimeout(function() {

                    if (moveTaskId !== id) {

                        return;
                    }

                    ViewClip.setNewPos(pos, function() {

                        if (moveTaskId === id) {

                            ViewClip.switchAutoUpdate(true);
                        }
                    });

                }, 250);
            })(moveTaskId);
        };

        var onLoose = function(e) {  // 相应鼠标松开操作，设置抠图小小窗宽高 / 只移动位置，获取对应的抠图流

            e.stopPropagation();
            e.preventDefault();

            if (isMoving) {

                if (moveTaskId === startId) {

                    if(PCE.getFeatureVersion('videoClip') == 2){

                        if(isDragged) {  // 鼠标松开前抠图小小窗被拉伸

                            $clipFrame.off("mousemove", onResize).off("mouseup", onLoose).off("mouseleave", onLoose);
                            isDragged = false;

                        } else {

                            $clipFrame.off("mousemove", onDrag).off("mouseup", onLoose).off("mouseleave", onLoose);

                        }
                    
                    }

                    (function(id) {

                        ViewClip.setNewPos(moveTarget, function() {  // 获取当前抠图小小窗内的视频流

                            if (moveTaskId === id) {

                                ViewClip.switchAutoUpdate(true);
                            }
                        });

                    })(moveTaskId);
                }

                isMoving = false;
            }
        };

        var onMousedown = function(e) {

            e.stopPropagation();
            e.preventDefault();

            if (!ViewClip.isEnabledClip() || !PCE.isWritable("videoClip")) {
                return;
            }
            isMoving = true;

            startId = moveTaskId = String.random(16);
            ViewClip.switchAutoUpdate(false);

            preCoordinate = {
                "top": e.clientY - $clipFrame.offset().top,
                "left": e.clientX - $clipFrame.offset().left
            };

            moveTarget = {
                "left": $clipBox.offset().left - $clipFrame.offset().left,
                "top": $clipBox.offset().top - $clipFrame.offset().top
            };

            if($(e.target).hasClass('drag-spot')) {

                isDragged = true;
                draggingSpot = $(e.target);
                $clipFrame.on("mousemove", onResize).on("mouseup", onLoose).on("mouseleave", onLoose);
            
            } else {

                $clipFrame.on("mousemove", onDrag).on("mouseup", onLoose).on("mouseleave", onLoose);

            }

        };

        var onDrag = function(e) {  // 拖拽整个抠图窗口，则只移动抠图小小窗

            e.stopPropagation();
            e.preventDefault();

            if (isMoving && !isDragged) {

                moveTarget.left += (e.clientX - $clipFrame.offset().left - preCoordinate.left); // 水平移动
                moveTarget.top += (e.clientY - $clipFrame.offset().top - preCoordinate.top); // 上下移动

                preCoordinate = {
                    "left": e.clientX - $clipFrame.offset().left,
                    "top": e.clientY - $clipFrame.offset().top
                };

                fixedTargetPosOnWeb();
                ViewClip.setBoxPos(moveTarget);

            }

        };

        var onResize = function(e) {  // 即时更新抠图小小窗的尺寸和定位

            e.stopPropagation();
            e.preventDefault();

            if (isMoving) {
                
                if(PCE.getFeatureVersion('videoClip') == 2){ // 支持拉伸，获取拉伸的宽高

                    if(isDragged) {

                        var h, w;

                        var _this = draggingSpot;

                        var wh_ratio = drowBox.width / drowBox.height;

                        // 区分拖拽的对象
                        if(_this.hasClass('left-top-spot')) {  // 左上点

                            h = moveTarget.top + drowBox.height - (e.clientY - $clipFrame.offset().top);
                            w = h * ( resolutionSize.width / resolutionSize.height );
                            if( w < minBox.width || h < minBox.height ){
                                w = minBox.width;
                                h = minBox.height
                            }
                            if(h != drowBox.height) {
                                moveTarget.left -= (h - drowBox.height) * wh_ratio;
                                moveTarget.top -= (h - drowBox.height);
                            }

                        } else if(_this.hasClass('right-top-spot')) { // 右上点
                        
                            h = moveTarget.top + drowBox.height - (e.clientY - $clipFrame.offset().top);
                            w = h * ( resolutionSize.width / resolutionSize.height );
                            if( w < minBox.width || h < minBox.height ){
                                w = minBox.width;
                                h = minBox.height
                            }
                            if(h != drowBox.height) {
                                moveTarget.top -= (h - drowBox.height);
                            }
                        
                        } else if(_this.hasClass('left-bottom-spot')) { // 左下点

                            h = e.clientY - $clipBox.offset().top;
                            w = h * ( resolutionSize.width / resolutionSize.height );
                            if( w < minBox.width || h < minBox.height ){
                                w = minBox.width;
                                h = minBox.height
                            }
                            if(h != drowBox.height) {
                                moveTarget.left -= (h - drowBox.height) * wh_ratio;
                            }

                        } else if(_this.hasClass('right-bottom-spot')) { // 右下点

                            h = e.clientY - $clipBox.offset().top;
                            w = h * ( resolutionSize.width / resolutionSize.height );
                            if( w < minBox.width || h < minBox.height ){
                                w = minBox.width;
                                h = minBox.height
                            }

                        }

                        drowBox = {
                            "width": w,
                            "height": h 
                        };

                        ViewClip.setDrewBoxWidth();
                        fixedTargetPosOnWeb();
                        ViewClip.setBoxPos(moveTarget);

                    }

                } 
                
            }

        };

        $clipBox.on("mousedown", onMousedown);
        $dragSpot_lt.on("mousedown", onMousedown);
        $dragSpot_lb.on("mousedown", onMousedown);
        $dragSpot_rt.on("mousedown", onMousedown);
        $dragSpot_rb.on("mousedown", onMousedown);

        isEnabledClip = window.localStorage.getItem("/player/preview/clip") == 1;

        delete this.initUI;
    };

    this.isEnabledClip = function() {

        return isEnabledClip;
    };

    this.switchAutoUpdate = function(status) { // 切换自动更新的状态（是否自动更新）

        if (status) {

            if (updateTimer) {

                return;
            }

            updateTimer = setTimeout(function(id) {

                if (moveTaskId === id) {

                    ViewClip.onAutoUpdatePos(moveTaskId);
                }

            }, 1000, moveTaskId);
        }
        else {

            if (typeof updateTimer === "number") {

                clearTimeout(updateTimer);
            }

            updateTimer = null;
        }
    }

    this.onAutoUpdatePos = function(asyncId) { // 定时更新右图预览抠图界面

        if (asyncId !== moveTaskId) {

            return;
        }

        // no refresh when collapsed
        if (!isEnabledClip || isSchedWorking == false || ViewManager.getMode() != EnumCurState.PREVIEW || !PlayerPreview.allRightSections[5].isShow) {

            $clipBox.hide();
            $clipFrame.addClass('disabled');
            updateTimer = setTimeout(function() {

                if (asyncId === moveTaskId) {

                    ViewClip.onAutoUpdatePos(moveTaskId);
                }

            }, 500);
            return;
        }

        (function(id) {

            CGI.sendCommand("GetCrop", {}, function(data) {

                if (asyncId !== moveTaskId) {
                    return;
                }

                resolutionSize.height = data.Crop.mainHeight;
                resolutionSize.width = data.Crop.mainWidth;

                _ratio = resolutionSize.width / windowSize.width;

                minBox.height = data.Crop.minHeight / _ratio ;
                minBox.width = data.Crop.minWidth / _ratio;

                drowBox.height = data.Crop.cropHeight / _ratio;
                drowBox.width = data.Crop.cropWidth / _ratio;

                windowSize.height = resolutionSize.height / _ratio;

                $clipFrame.css({
                    "height": windowSize.height
                });

                boxPos.top = data.Crop.topLeftY / _ratio;
                boxPos.left = data.Crop.topLeftX / _ratio;

                boxSize.height = data.Crop.cropHeight / _ratio;
                boxSize.width = data.Crop.cropWidth / _ratio;

                refreshClipStatus();
                
                if(PCE.getFeatureVersion('videoClip') == 2){

                    if( drowBox.width < minBox.width || drowBox.height < minBox.height ){

                        drowBox.width = minBox.width;
                        drowBox.height = minBox.height;

                    }

                    ViewClip.setDrewBoxWidth();  // 设置宽高为 drowBox
                }else{
                    ViewClip.setBoxPosSize();  // 设置宽高为 boxSize
                }
                
                ViewClip.setBoxPos(boxPos);

                if (!$clipBox.is(":visible")) {

                    $clipBox.show();
                }
                $clipFrame.removeClass('disabled');

                updateTimer = setTimeout(function(id) {

                    ViewClip.onAutoUpdatePos(id);

                }, 5000, moveTaskId);

            }, function(a,b,c) {

                ControllerRemoteConfig.defaultErrorHandle(a,b,c);

                updateTimer = setTimeout(function(id) {

                    ViewClip.onAutoUpdatePos(id);

                }, 5000, moveTaskId);
            });
        })(asyncId);

    };

    var refreshClipStatus = function() {

        if (ViewClip.isEnabledClip()) {

            $statusCtrl.text("Disable Clips");
        }
        else {

            $statusCtrl.text("Enable Clips");
        }
    };

    this.toggleStatus = function() {  // 切换码流类型，切换抠图界面可操作性

        var chObj = ControllerFlash.getSelectedChannel();

        if (this.isEnabledClip()) {

            $clipBox.hide();
            $clipFrame.addClass('disabled');
            isEnabledClip = false;
            window.localStorage.setItem("/player/preview/clip", 0);
        }
        else {

            isEnabledClip = true;
            window.localStorage.setItem("/player/preview/clip", 1);
        }

        this.switchAutoUpdate(isEnabledClip);
        refreshClipStatus();

        if (chObj.getStream() == EnumStreamType.FLUENT || chObj.getStream() == EnumStreamType.CLIP) {

            if (this.isEnabledClip()) {

                chObj.open(EnumStreamType.CLIP);
            }
            else {

                chObj.open(EnumStreamType.FLUENT);
            }

        }
    };

    this.setNewPos = function(webPos, callback) {  // 获取抠图部分的码流 GetCrop

        var topLeftX = Math.floor(webPos.left * _ratio),
            topLeftY = Math.floor(webPos.top * _ratio);

        if( topLeftX < 0 ){
            topLeftX = 0;
        }

        if( topLeftY < 0 ){
            topLeftY = 0;
        }

        if( PCE.getFeatureVersion('videoClip') == 2 ){

            var cropWidth = Math.floor( drowBox.width * _ratio ),
                cropHeight = Math.floor( drowBox.height * _ratio );

            if( cropWidth + topLeftX  > resolutionSize.width || cropHeight + topLeftY > resolutionSize.height ){
                this.onAutoUpdatePos();
                return;
            }

            var crop = {
                "topLeftX": topLeftX,
                "topLeftY": topLeftY,
                "cropWidth": cropWidth,
                "cropHeight": cropHeight,
                "mainWidth": resolutionSize.width,
                "mainHeight": resolutionSize.height,
                "screenWidth": resolutionSize.width,
                "screenHeight": resolutionSize.height
            }

        }else{

            var crop = {
                "topLeftX": topLeftX,
                "topLeftY": topLeftY,
                "screenWidth": resolutionSize.width,
                "screenHeight": resolutionSize.height
            }

        }

        CGI.sendCommand("SetCrop", {
            "Crop": crop
        },function(data) {

            window.localStorage.setItem("/player/preview/clip", 1);
            callback && callback(true);

        }, function(a,b,c) {
            callback && callback(false);
            ControllerRemoteConfig.defaultErrorHandle(a,b,c);
        });
    };

    this.refreshBgImg = function(chId) {  // 刷新右侧抠图预览窗口

        // no refresh when collapsed
        if (isSchedWorking == false || ViewManager.getMode() != EnumCurState.PREVIEW || !PlayerPreview.allRightSections[5].isShow) {

            return setTimeout(function() {

                ViewClip.refreshBgImg(chId);

            }, 500);
        }

        var tag = document.createElement("img");
        var tagId = String.random(16);
        tag.src = "cgi-bin/api.cgi?cmd=Snap&channel=" + chId + "&width=320&height=180&rs=" + String.random(16) + "&token=" + localStorage.getItem("token");
        tag.id = "clip-bg-ldr-" + tagId;
        $(tag).css({
            "capacity": 0,
            "height": 0,
            "width": 0
        });
        
        tag.onerror = tag.onabort = tag.onload = tag.onreadystatechange = function() {

            setTimeout(function() {

                ViewClip.refreshBgImg(chId);

            }, 10000);

            $clipFrame.css({
                "background-image": "url(" + tag.src + ")"
            });

            $("#clip-bg-ldr-" + tagId).remove();
            tag = null;
            tagId = null;
        };

        document.getElementById("pre_clip_container").appendChild(tag);
    };

    this.setBoxPos = function(pos) { // 设置抠图小小窗的位置

        if (pos.top + drowBox.height > windowSize.height) {
            pos.top = windowSize.height - drowBox.height;
        }

        if (pos.left + drowBox.width > windowSize.width) {
            pos.left = windowSize.width - drowBox.width;
        }

        $clipBox.css(pos);
    };

    this.setBoxPosSize = function() {  // 设置不可拉伸的抠图小小窗的宽高

        $clipBox.css({
            "height": boxSize.height,
            "width": boxSize.width
        });
    };

    this.setDrewBoxWidth = function() { // 设置可拉伸抠图小小窗的宽高

        $clipBox.css({
            "height": drowBox.height,
            "width": drowBox.width
        });

    };

}).apply(ViewClip);