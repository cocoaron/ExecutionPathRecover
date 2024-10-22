// ----------------------------------------pbFileBarCanvas View---------------------------------

var g_pbFileBarCanvas;

///
function PbFileBarCanvas() {
    this.TAG = "pbFileBarCanvas";
    this.channelWidth = 80;
    this.baseItemWidth;
    this.itemWidth;
    this.itemHeight;
    this.markHeight = 20;
    this.timeShowWidth = 50;

    this.grid_cols = 24;
    this.grid_rows = 4;
    this.translateX = 0;
    this.dx = 0;
    this.division = 60;

    this.offset = 0.5; //画线偏移
    this.scale = 1;
    this.maxScale = 5;

    this.mouse = {};
    this.isMouseIn = false;
    this.timeCenterX;
    this.curTimeX;
    this.curTimeSecond = 0;
    this.moveTimeX = 0;
    this.moveTimeSecond = 0;

    //滚动条
    this.scrollMouse = {};
    this.scrollBgWidth;
    this.scrollBgHeight;

    this.scrollViewX = 0;
    this.scrollViewY;
    this.scrollViewHeight;
    this.scrollViewWidth;
    this.isScrollView;
    this.isScrollMouseOut;
    this.scrollDx = 0;

    //fileInfo
    this.canvasPositions = new Array();
    this.realDrawPositions = new Array();
    this.fileHeight;

    this.startTime = new Date();
}


PbFileBarCanvas.prototype.drawPBToolbar = function() {
    var canvas = document.getElementById("playback_toolbar_bg");
    if(null == canvas) {
        return;
    }

    var bgWidth = canvas.width;
    var bgHeight = canvas.height;


    var context = canvas.getContext("2d");

    context.clearRect(0, 0, bgWidth, bgHeight); //清空内容

    // 绘制背景
    var gradient = context.createLinearGradient(0,0,0,300);

    gradient.addColorStop(0,"#8b8786");
    gradient.addColorStop(1,"#8b8786");

    context.fillStyle = gradient;

    context.fillRect(0, 0, bgWidth, bgHeight);

    context.fillStyle = '#3d3a39';

    //darw time bg
    context.fillRect(0, 0, bgWidth, this.itemHeight);

    //draw files
    var fileColor = "rgba(60,191,252,0.9)";
    this.realDrawPositions = [];
    this.canvasPositions = [0,-1,-1,-1];
    for(var i = 0; i < this.canvasPositions.length; ++ i) {
        if(!(this.realDrawPositions.in_array(this.canvasPositions[i]))) {

            this.realDrawPositions.push(this.canvasPositions[i]);
        } else {

            continue;
        }

        var channel = g_device.channels[i];

        if(null == channel) {

            continue;
        }
        for(var j = 0; j < channel.playbackFiles.length; ++ j){
            //if(!PlayerPlayback.isFileTypeSel(channel.playbackFiles[j])) {

              //  continue;
            //}
            fileColor = this.getColorByfileType(channel.playbackFiles[j].type);
            this.drawFile(context, channel.playbackFiles[j], i, fileColor , j);
        }

    }

    //时间表格
    context.beginPath();

    context.lineWidth = 1;
    context.strokeStyle='#000000';

    //画时间表格竖线
    for (var col = 0; col <= this.grid_cols; col ++) {
        var startY;
        var endY;
        var start_end_X;
        var x;
        var y;
        if(0 == col) {

            if(this.translateX + col * this.itemWidth > this.channelWidth) {


                this.translateX = this.channelWidth;
            }
        } else if(this.grid_cols == col) {

            if(this.translateX + col * this.itemWidth <= bgWidth)	{

                this.translateX = 	bgWidth - col * this.itemWidth;
            }
        }
        x = this.translateX + col * this.itemWidth;
        if(0 == col || (this.grid_cols) == col) {

            y = 0;
        } else {

            y = this.markHeight;
        }
        startY = Math.round(y) + 0.5;
        endY = Math.round(this.markHeight + this.grid_rows * this.itemHeight) - 0.5;
        start_end_X = Math.round(x) - 0.5;
        context.moveTo(start_end_X, startY);
        context.lineTo(start_end_X, endY);
    }

    //绘制时间表格横线
    for(var row = 0; row <= this.grid_rows + 1; row ++){
        var startX;
        var endX;
        var start_end_Y;

        var y ;
        if(0 == row) {
            y = 0;
        } else {
            y = this.markHeight + (row - 1) * this.itemHeight;
        }
        startX = toLineUsePix(this.channelWidth);
        endX = Math.round(this.channelWidth + this.grid_cols * this.itemWidth) - 0.5;
        start_end_Y = Math.round(y) - 0.5;
        context.moveTo(startX, start_end_Y);
        context.lineTo(endX, start_end_Y);
    }

    //绘制时间文字
    var moveTextColor = "rgba(221,13,55,1)"
    var notMoveTextColor = "rgba(229,212,212,0.9)"
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = "rgba(229,212,212,0.9)";
    for(var i = 0; i < this.grid_cols; ++ i) {
        if(0 == i) {
            continue;
        }
        var x;
        var y;
        var dx = -200;
        x = this.translateX + this.itemWidth * i;
        y = this.itemHeight / 2;
        var time;
        if(60 !== this.division) {

            var hour = parseInt(i / parseInt(60 / this.division));
            var min = i % parseInt(60 / this.division);
            time = hour + ":" + oneToZeroOne(min * this.division);
        } else {

            time = i.toString();
        }


        context.fillText(time, x, y);
    }
    context.stroke();


    context.beginPath();
    context.fillStyle = '#3d3a39';
    //draw channel bg
    context.fillRect(0, 0, this.channelWidth, bgHeight);

    //通道表格竖线
    for (var col = 0; col <= 0; col ++) {
        var startY;
        var endY;
        var start_end_X;
        var x;
        var y;
        x = this.channelWidth + col * this.itemWidth;
        if(0 == col || (this.grid_cols) == col) {

            y = 0;
        } else {

            y = this.markHeight;
        }
        startY = Math.round(y) + 0.5;
        endY = Math.round(this.markHeight + this.grid_rows * this.itemHeight) - 0.5;
        start_end_X = Math.round(x) - 0.5;
        context.moveTo(start_end_X, startY);
        context.lineTo(start_end_X, endY);
    }

    //通道表格横线
    for(var row = 0; row <= this.grid_rows + 1; row ++){
        var startX;
        var endX;
        var start_end_Y;

        var y ;
        if(0 == row) {
            y = 0;
        } else {
            y = this.markHeight + (row - 1) * this.itemHeight;
        }
        startX = toLineUsePix(0);
        endX = Math.round(this.channelWidth) - 0.5;
        start_end_Y = Math.round(y) - 0.5;
        context.moveTo(startX, start_end_Y);
        context.lineTo(endX, start_end_Y);
    }
    context.stroke();

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#e5d4d4';

    //draw curDate
    var curDateX = 0;
    var curDateY = 0;
    curDateX = this.channelWidth / 2;
    curDateY = this.itemHeight / 2;
    var curDateString = oneToZeroOne(this.startTime.getMonth() + 1) + "-" + oneToZeroOne(this.startTime.getDate()) + "-" + this.startTime.getFullYear();
    context.fillText(curDateString, curDateX, curDateY);

    //draw channels
    for(var j = 0; j < this.grid_rows; ++ j) {

        var x;
        var y;
        x = this.channelWidth / 2;
        y = (j + 2) * this.itemHeight - this.itemHeight / 2;
        var channelString = "";
        if(this.canvasPositions[j] < 0) {

            channelString = "No channel";
        } else {

            channelString = "CH " + oneToZeroOne(this.canvasPositions[j] + 1);
        }

        context.fillText(channelString, x, y);
    }

    //draw curentLine
    var curBgColor = "rgba(56,31,34,0.9)";
    var curLineColor = "rgba(221,13,55,1)";
    var curTimeX = toLineUsePix(this.secondToPix(this.curTimeSecond) + this.translateX);
    var curTimeString = this.formatSeconds(this.curTimeSecond);
    if(curTimeX >= this.channelWidth) {

        this.drawTimeSelLine(context, curTimeX, curLineColor, curBgColor, curTimeString);
    }


    //draw moveLine
    var moveTimeX = this.mouse.x;
    this.moveTimeX = moveTimeX - this.translateX;
    this.moveTimeSecond = this.pixToSecond(this.moveTimeX);
    var moveTimeString = this.formatSeconds(this.moveTimeSecond);
    if(moveTimeX < this.channelWidth) {
        moveTimeX = toLineUsePix(this.channelWidth);
    } else {
        moveTimeX = toLineUsePix(moveTimeX);
    }
    var moveBgColor = "rgba(82,119,82,0.9)";
    var moveLineColor = "rgba(8,224,8,1)";

    this.drawTimeSelLine(context, moveTimeX, moveLineColor, moveBgColor, moveTimeString);
}

/*
 *
 * context: 上下文
 * cornX: 尖嘴x坐标
 * cornY: 尖嘴Y坐标
 * width : 内容宽度
 * height : 内容宽度
 * text: 内容
 * bgColor : 背景颜色
 * textColor : 文字颜色
 * left : 显示在左边还是右边
 */
PbFileBarCanvas.prototype.drawTimeText = function(context, cornX, cornY, width, height, text, bgColor, textColor, left) {
    var x;
    var y;
    var cornWidth = 2;
    context.fillStyle = bgColor;
    if(left) {

        x = cornX - cornWidth - width;
        y = cornY - height / 2;

    } else {

        x = cornX + cornWidth;
        y = cornY - height / 2;
    }

    var radius = 1;
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    if(left) {

        context.lineTo(x + width, y + height / 2 - cornWidth);
        context.lineTo(cornX, cornY);
        context.lineTo(x + width, y + height / 2 + cornWidth);

    }
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y+ height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    if(!left) {

        context.lineTo(x, y + height / 2 + cornWidth);
        context.lineTo(cornX, cornY);
        context.lineTo(x , y + height / 2 - cornWidth);
    }
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fill();
    context.fillStyle = textColor;
    if(left) {

        context.fillText(text, x + width / 2, cornY);
    } else {

        context.fillText(text, x + width / 2, cornY);
    }
    context.stroke();
}

// 绘制选择的时间线
PbFileBarCanvas.prototype.drawTimeSelLine = function(context, moveX, lineColor, bgColor, time) {

    context.beginPath();
    var lineHeight = toLineUsePix(this.markHeight + this.grid_rows * this.itemHeight);
    context.strokeStyle = lineColor;
    context.fillStyle = lineColor;
    context.moveTo(moveX, 0.5);
    context.lineTo(moveX, lineHeight);
    var timeX;
    if(moveX >= this.timeCenterX) {

        timeX = moveX - this.timeShowWidth;
    } else {

        timeX = moveX;
    }
    context.textAlign = "start";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    var timeY = this.offset;
    context.fillStyle = bgColor;
    context.fillRect(timeX, timeY, this.timeShowWidth, this.markHeight);

    context.fillStyle = lineColor;
    context.fillText(time, timeX + this.timeShowWidth / 2, timeY + this.markHeight / 2);

    context.stroke();
}

PbFileBarCanvas.prototype.drawFile = function(context, fileInfo, position, bgColor, index) {
    var fileY = this.markHeight + position * this.itemHeight + (this.itemHeight - this.fileHeight) / 2;
    var startSecond = fileInfo.startTime.getTime() / 1000;
    var startX = this.secondToPix((fileInfo.startTime.getTime() - this.startTime.getTime()) / 1000) + this.translateX;
    var endSecond = fileInfo.endTime.getTime() / 1000;
    var fileWidth = this.secondToPix(endSecond - startSecond);

    startx = startX < 0 ? 0 : startX;

    if(fileWidth < 0 ) {
        return;
    }
    context.fillStyle = bgColor;
    context.fillRect(startX, fileY, fileWidth, this.fileHeight);

}

PbFileBarCanvas.prototype.getColorByfileType = function(fileType) {

    var blueColor = "rgba(60, 191, 252, 1.0)";

    var oringeColor = "rgba(244, 104, 66, 1.0)";

    var greenColor = "rgba(163, 201, 74,1.0)";

    var selColor;

    switch(fileType) {
        case EnumPbShowFileType.SCHEDULE : {

            selColor = blueColor;
            break;
        }

        case EnumPbShowFileType.MANUAL : {

            selColor = greenColor;
            break;
        }

        case EnumPbShowFileType.ALARM : {

            selColor = oringeColor;
            break;
        }


        default:

            selColor = blueColor;
            break;
    }

    return selColor;
}

PbFileBarCanvas.prototype.getHoursSecond = function(time) {

    return time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
}

PbFileBarCanvas.prototype.drawScrollBar = function() {

    var canvas = document.getElementById("playback_toolbar_scroll");
    if(null == canvas) {

        return;
    }
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, this.scrollBgWidth, this.scrollBgHeight); //æ¸…ç©ºå†…å®¹

    // 绘制背景
    var gradient = context.createLinearGradient(0,0,0,300);

    gradient.addColorStop(0,"#3d3a39");
    gradient.addColorStop(1,"#8b8786");

    context.fillStyle = gradient;

    context.fillRect(0, 0, this.scrollBgWidth, this.scrollBgHeight);
    //绘制滑块
    if(this.scrollViewX < 0) {

        this.scrollViewX = 0;
    }
    if(this.scrollViewX + this.scrollViewWidth > this.scrollBgWidth) {

        this.scrollViewX = this.scrollBgWidth - this.scrollViewWidth;
    }
    context.fillStyle = "rgba(242,240,234, 0.8)";
    context.roundRect(this.scrollViewX, this.scrollViewY, this.scrollViewWidth, this.scrollViewHeight, 5, true, true);
}

PbFileBarCanvas.prototype.redrawPlaybackTool = function() {

    this.drawPBToolbar();
    this.drawScrollBar();
}

CanvasRenderingContext2D.prototype.roundRect =
function(x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y+ height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    if (stroke) {
        this.stroke();
    }
    if (fill) {
        this.fill();
    }
};


PbFileBarCanvas.prototype.initPlaybackToolbar = function() {

    var canvas = document.getElementById("playback_toolbar_bg");
    if(null == canvas) {

        return;
    }
    var content = document.getElementById("playbaack_toolbar_content");
    var contentWidth = content.clientWidth;
    var context = canvas.getContext("2d");
    canvas.width = contentWidth;
    var bgWidth = canvas.width;
    var bgHeight = canvas.height;

    this.grid_cols = 24;
    this.baseItemWidth = (bgWidth - this.channelWidth) / this.grid_cols;
    this.itemWidth = this.baseItemWidth * this.scale;
    this.itemHeight = (bgHeight) / (this.grid_rows + 1);
    this.markHeight = this.itemHeight;
    this.translateX = this.dx + this.channelWidth;

    this.timeCenterX = toLineUsePix((canvas.width - this.channelWidth) / 2);

    var curDate = new Date();
    var curSecond = curDate.getHours() * 3600 + curDate.getMinutes() * 60 + curDate.getSeconds();
    this.curTimeSecond = curSecond;
    this.curTimeX = this.secondToPix(this.curTimeSecond);

    canvas.onmousemove = function(e) {

        if(null == g_pbFileBarCanvas) {

            return;

        }
        if(g_pbFileBarCanvas.isScrollView) {
            return;
        }
        var point={};
        point = getPointOnCanvas(canvas, e.pageX, e.pageY);
        if(point.x < g_pbFileBarCanvas.channelWidth) {
            return;
        }
        g_pbFileBarCanvas.mouse = point;
        g_pbFileBarCanvas.isMouseIn = true;
        g_pbFileBarCanvas.redrawPlaybackTool();

    };

    canvas.onmouseout = canvas.onmouseleave = function(e) {
        if(null == g_pbFileBarCanvas) {

            return;

        }
        if(g_pbFileBarCanvas.isScrollView) {
            return;
        }
        g_pbFileBarCanvas.isMouseIn = false;
    };

    canvas.onmousedown = function(e) {
        if(null == g_pbFileBarCanvas) {

            return;

        }
        if(g_pbFileBarCanvas.isScrollView) {
            return;
        }
        var point={};
        point = getPointOnCanvas(canvas, e.pageX, e.pageY);
        if(point.x < g_pbFileBarCanvas.channelWidth) {
            return;
        }
        g_pbFileBarCanvas.mouse = point;
        g_pbFileBarCanvas.curTimeSecond = g_pbFileBarCanvas.moveTimeSecond;
        g_pbFileBarCanvas.isMouseIn = true;
        g_pbFileBarCanvas.redrawPlaybackTool();
        PlayerPlayback.timelineDidSeekToDate(g_pbFileBarCanvas.secondeToDate(g_pbFileBarCanvas.curTimeSecond));
    }

    if (canvas.addEventListener) {
        canvas.addEventListener('DOMMouseScroll', this.gridScrollFunc, false);
    }//W3C
    canvas.onmousewheel = g_pbFileBarCanvas.gridScrollFunc;


    // scrollbar
    var scrollCanvas = document.getElementById("playback_toolbar_scroll");
    if(null == scrollCanvas) {

        return;
    }
    var scrollContext = scrollCanvas.getContext("2d");
    scrollCanvas.width = contentWidth;
    this.scrollBgWidth = scrollCanvas.width;
    this.scrollBgHeight = scrollCanvas.height;
    this.updateScrollWidth();
    this.scrollViewHeight = this.scrollBgHeight - 4;
    this.scrollViewY = (this.scrollBgHeight - this.scrollViewHeight) / 2;
    this.updateScrollViewX();
    this.isScrollView = false;
    this.isScrollMouseOut = false;

    scrollCanvas.onmousedown = this.scrollbarMouseDown;
    scrollCanvas.onmousemove = this.scrollbarMouseMove;
    scrollCanvas.onmouseup = this.scrollbarMouseUp;
    $('#playbaack_toolbar_content').on('mouseleave', this.scrollbarMouseUp);
    scrollCanvas.onmouseout = this.scrollbarMouseOut;

    document.addEventListener('mousedown', this.documentMouseDown, false);
    document.addEventListener('mousemove', this.documentMouseMove, false);
    document.addEventListener('mouseup', this.documentMouseUp, false);

    //fileData
    this.fileHeight = 0.75 * this.itemHeight;

    this.redrawPlaybackTool();
}

PbFileBarCanvas.prototype.setChannelMode = function(channelMode) {

    if(EnumPbChannelMode.FOUR == channelMode) {

        this.grid_rows = 4;
    } else if(EnumPbChannelMode.ONE == channelMode) {

        this.grid_rows = 1;
    } else {

        this.grid_rows = 4;
    }

    this.redrawPlaybackTool();
}

PbFileBarCanvas.prototype.updateTranslateX = function() {

    this.translateX = this.channelWidth - (this.scale * this.grid_cols* this.baseItemWidth) * (this.scrollViewX / this.scrollBgWidth);
}

/*
 * update scrollbar width
 *
 */
PbFileBarCanvas.prototype.updateScrollWidth = function() {

    if(0 == this.scale) {

        this.scale = 1;
    }
    this.scrollViewWidth = (24 / (this.scale * this.grid_cols)) * this.scrollBgWidth;
}

/*
 * update scrollbar x location
 *
 */
PbFileBarCanvas.prototype.updateScrollViewX = function() {

    if(0 == this.scale) {

        this.scale = 1;
    }
    this.scrollViewX = (this.channelWidth - this.translateX) / (this.grid_cols * this.baseItemWidth * this.scale) * this.scrollBgWidth;
}

PbFileBarCanvas.prototype.isInScrollView = function(canvas, e) {

    this.scrollMouse = getPointOnCanvas(canvas, e.pageX  , e.pageY)
    if(this.scrollMouse.x >= this.scrollViewX && this.scrollMouse.x <= this.scrollViewWidth + this.scrollViewX) {

        return true;
    }
    return false;
}

PbFileBarCanvas.prototype.scrollbarMouseDown = function(e) {
    if(null == g_pbFileBarCanvas) {

        return;
    }
    var scrollCanvas = document.getElementById("playback_toolbar_scroll");
    if(null == scrollCanvas) {

        return;
    }
    g_pbFileBarCanvas.isScrollView = true;
    if(!(g_pbFileBarCanvas.isInScrollView(scrollCanvas, e))) {

        g_pbFileBarCanvas.scrollMouse = getPointOnCanvas(scrollCanvas, e.pageX, e.pageY);
        g_pbFileBarCanvas.scrollViewX = g_pbFileBarCanvas.scrollMouse.x - g_pbFileBarCanvas.scrollViewWidth / 2;
        if(g_pbFileBarCanvas.scrollViewX > g_pbFileBarCanvas.scrollBgWidth - g_pbFileBarCanvas.scrollViewWidth) {

            g_pbFileBarCanvas.scrollViewX = g_pbFileBarCanvas.scrollBgWidth - g_pbFileBarCanvas.scrollViewWidth;
        }
        g_pbFileBarCanvas.updateTranslateX();
        g_pbFileBarCanvas.redrawPlaybackTool();
    } else {

        g_pbFileBarCanvas.scrollDx = g_pbFileBarCanvas.scrollMouse.x - g_pbFileBarCanvas.scrollViewX;
    }
}

PbFileBarCanvas.prototype.scrollbarMouseMove = function(e) {
    if(null == g_pbFileBarCanvas) {

        return;
    }
    if(g_pbFileBarCanvas.isScrollView) {

        var scrollCanvas = document.getElementById("playback_toolbar_scroll");
        if(null == scrollCanvas) {

            return;
        }

        g_pbFileBarCanvas.scrollMouse = getPointOnCanvas(scrollCanvas, e.pageX, e.pageY);
        var scrollX;
        if(!g_pbFileBarCanvas.isInScrollView(scrollCanvas, e)) {

            scrollX = Math.round(g_pbFileBarCanvas.scrollMouse.x - g_pbFileBarCanvas.scrollViewWidth / 2);
        } else {

            scrollX = Math.round(g_pbFileBarCanvas.scrollMouse.x - g_pbFileBarCanvas.scrollDx);
        }
        if(scrollX < 0) {

            scrollX = 0;
        }
        if(scrollX + g_pbFileBarCanvas.scrollViewWidth > g_pbFileBarCanvas.scrollBgWidth) {

            scrollX = g_pbFileBarCanvas.scrollBgWidth - g_pbFileBarCanvas.scrollViewWidth;
        }
        g_pbFileBarCanvas.scrollViewX = scrollX;
        g_pbFileBarCanvas.updateTranslateX();
        g_pbFileBarCanvas.redrawPlaybackTool();
    }

}

PbFileBarCanvas.prototype.scrollbarMouseUp = function(e) {
    if(null == g_pbFileBarCanvas) {

        return;
    }
    g_pbFileBarCanvas.isScrollView = false;
    g_pbFileBarCanvas.isScrollMouseOut = false;
}

PbFileBarCanvas.prototype.scrollbarMouseOut = function(e) {
    if(null == g_pbFileBarCanvas) {

        return;
    }
    g_pbFileBarCanvas.isScrollMouseOut = true;
}

PbFileBarCanvas.prototype.documentMouseDown = function(e) {
    if(null == g_pbFileBarCanvas) {

        return;
    }
    g_pbFileBarCanvas.isScrollView = true;

}

PbFileBarCanvas.prototype.documentMouseMove = function(e) {
    if(null == g_pbFileBarCanvas) {

        return;
    }
    if(g_pbFileBarCanvas.isScrollView && g_pbFileBarCanvas.isScrollMouseOut && !g_pbFileBarCanvas.isMouseIn) {

        var scrollCanvas = document.getElementById("playback_toolbar_scroll");
        if(null == scrollCanvas) {

            return;
        }
        g_pbFileBarCanvas.scrollMouse = getPointOnCanvas(scrollCanvas, e.pageX, e.pageY);
        var scrollX;
        if(!g_pbFileBarCanvas.isInScrollView(scrollCanvas, e)) {

            scrollX = Math.round(g_pbFileBarCanvas.scrollMouse.x - g_pbFileBarCanvas.scrollViewWidth / 2);
        } else {

            scrollX = Math.round(g_pbFileBarCanvas.scrollMouse.x - g_pbFileBarCanvas.scrollDx);
        }
        if(scrollX < 0) {

            scrollX = 0;
        }
        if(scrollX + g_pbFileBarCanvas.scrollViewWidth > g_pbFileBarCanvas.scrollBgWidth) {

            scrollX = g_pbFileBarCanvas.scrollBgWidth - g_pbFileBarCanvas.scrollViewWidth;
        }
        g_pbFileBarCanvas.scrollViewX = scrollX;
        g_pbFileBarCanvas.updateTranslateX();
        g_pbFileBarCanvas.redrawPlaybackTool();
    }

}

PbFileBarCanvas.prototype.documentMouseUp = function(e) {
    if(null == g_pbFileBarCanvas) {

        return;
    }
    if(g_pbFileBarCanvas.isScrollView) {

        g_pbFileBarCanvas.isScrollView = false;
        g_pbFileBarCanvas.isScrollMouseOut = false;
    }
}


PbFileBarCanvas.prototype.scrollbarMove = function(event) {
    if(null == g_pbFileBarCanvas) {

        return;
    }
    var scrollCanvas = document.getElementById("playback_toolbar_scroll");
    if(null == scrollCanvas) {

        return;
    }
    if (event.targetTouches.length == 1) {
        event.preventDefault();// 阻止浏览器默认事件，重要
        var touch = event.targetTouches[0];
        // 把元素放在手指所在的位置
        g_pbFileBarCanvas.scrollViewX = getPointOnCanvas(scrollCanvas, event.pageX, event.pageY);
    }
    g_pbFileBarCanvas.redrawPlaybackTool();
}

PbFileBarCanvas.prototype.autoScale = function() {
    var intScale = g_pbFileBarCanvas.getScale();

    switch (intScale) {
    case 1:
        g_pbFileBarCanvas.division = 60;
        break;
    case 2:
        g_pbFileBarCanvas.division = 30;
        break;
    case 3:
        g_pbFileBarCanvas.division = 10;
        break;
    case 4:
        g_pbFileBarCanvas.division = 5;
        break;
    case 5:
        g_pbFileBarCanvas.division = 1;
        break;
    default:
        g_pbFileBarCanvas.division = 60;
        break;
    }

    g_pbFileBarCanvas.grid_cols = (60 / g_pbFileBarCanvas.division) * 24;

    g_pbFileBarCanvas.itemWidth = g_pbFileBarCanvas.baseItemWidth * g_pbFileBarCanvas.scale;
    var moveLocation = g_pbFileBarCanvas.secondToPix(g_pbFileBarCanvas.moveTimeSecond);
    g_pbFileBarCanvas.translateX = g_pbFileBarCanvas.mouse.x - moveLocation;
    g_pbFileBarCanvas.updateScrollWidth();
    g_pbFileBarCanvas.updateScrollViewX();

};

PbFileBarCanvas.prototype.getScale = function() {
    return parseInt(g_pbFileBarCanvas.scale);
};

PbFileBarCanvas.prototype.setScale = function(s) {
    var r = g_pbFileBarCanvas.getScaleRange();
    if (s > r.max || s < r.min) {
        return false;
    }
    g_pbFileBarCanvas.scale = s;
    return true;
};

PbFileBarCanvas.prototype.getScaleRange = function() {
    return {
        "max": g_pbFileBarCanvas.maxScale,
        "min": 1
    };
};

PbFileBarCanvas.prototype.gridScrollFunc = function (event) {
    if(null == g_pbFileBarCanvas) {

        return;
    }
    var direct = 0;
    var e = event || window.event;
    var deltaY = 0;
    var deltaX = 0;

    if (e.wheelDelta) {//IE/Opera/Chrome

        deltaY = e.wheelDelta;
        if(isMac()) {
            deltaY = -e.wheelDeltaY;
            deltaX = -e.wheelDeltaX;
        } else {
            if (e.wheelDelta !== undefined) {
                deltaY = e.wheelDelta;
                deltaX = 0;
            } else {
                deltaY = e.wheelDeltaY;
                deltaX = e.wheelDeltaX;
            }
        }
    } else if (e.detail) {//Firefox

        deltaY = -e.detail * 10;
    }
    if(Math.abs(deltaY) > Math.abs(deltaX)) {

        g_pbFileBarCanvas.scale = g_pbFileBarCanvas.scale + deltaY / 360;
        if(g_pbFileBarCanvas.scale < 1) {

            g_pbFileBarCanvas.scale = 1;
        } else if(g_pbFileBarCanvas.scale > g_pbFileBarCanvas.maxScale) {

            g_pbFileBarCanvas.scale = g_pbFileBarCanvas.maxScale;
        }
        g_pbFileBarCanvas.autoScale();

    } else {
        g_pbFileBarCanvas.scrollViewX = g_pbFileBarCanvas.scrollViewX + deltaX;
        if(g_pbFileBarCanvas.scrollViewX < 0) {

            g_pbFileBarCanvas.scrollViewX = 0;
        }
        if(g_pbFileBarCanvas.scrollViewX + g_pbFileBarCanvas.scrollViewWidth > g_pbFileBarCanvas.scrollBgWidth) {

            g_pbFileBarCanvas.scrollViewX = g_pbFileBarCanvas.scrollBgWidth - g_pbFileBarCanvas.scrollViewWidth;
        }
        g_pbFileBarCanvas.updateTranslateX();
    }

    g_pbFileBarCanvas.redrawPlaybackTool();
    return false;
}


function toLineUsePix(num) {
    return Math.round(num) + 0.5;
}

function getPointOnCanvas(canvas, x, y) {

    var bbox = canvas.getBoundingClientRect();

    return { x: x- bbox.left *(canvas.width / bbox.width),

    y:y - bbox.top  * (canvas.height / bbox.height)

    };

}

PbFileBarCanvas.prototype.pixToSecond = function(pix) {
    if(0 == this.itemWidth) {
        return 0;
    }
    return ((this.division * 60) / this.itemWidth) * pix;
}

PbFileBarCanvas.prototype.secondToPix = function(second) {

    return (this.itemWidth / (this.division * 60)) * second;
}

PbFileBarCanvas.prototype.formatSeconds = function(value) {
    var second = parseInt(value);// 秒
    var min = 0;// 分
    var hour = 0;// 小时
    if(second >= 60) {
        min = parseInt(second / 60);
        second = parseInt(second % 60);
        if(min >= 60) {
            hour = parseInt(min / 60);
            min = parseInt(min % 60);
        }
    }

    var result = "";

    var result = oneToZeroOne(parseInt(hour)) + ":" +
    oneToZeroOne(parseInt(min)) + ":" + oneToZeroOne(parseInt(second));
    return result;
}

function oneToZeroOne(num) {

    var numString = num.toString();
    numString.length == 1 ? numString = "0" + numString : numString = numString;
    return numString;
}

PbFileBarCanvas.prototype.setCanvasPositionArray = function(positions) {

    this.canvasPositions = positions;
    this.redrawPlaybackTool();
}

PbFileBarCanvas.prototype.setSearchStartTime = function(startDate) {

    this.startTime = startDate;
}

PbFileBarCanvas.prototype.secondeToDate = function(seconde) {

    var mSecond = seconde * 1000 + this.startTime.getTime();

    return new Date(mSecond);
}

PbFileBarCanvas.prototype.refreshCanvasByCurSecond = function(second) {
    //update curent time
    this.curTimeSecond = second;

    this.redrawPlaybackTool();
}


