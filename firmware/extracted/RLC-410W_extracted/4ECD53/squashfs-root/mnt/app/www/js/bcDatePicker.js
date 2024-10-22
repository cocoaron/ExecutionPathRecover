
/*---------------------------BC DatePicker----------------------------*/

var g_bcDatePicker;

///
var COLOR_TRANSPARENT = "rgba(255,255,255, 0)";
var COLOR_BULUE = "rgba(60, 191, 252, 1)";
var COLOR_LIGH_BULUE = "rgba(60, 191, 252, 0.5)";
var COLOR_BLACK = "rgba(0, 0, 0, 1)";
var COLOR_WHITE = "rgba(255, 255, 255, 1)";
var COLOR_GRAY = "rgba(126, 126, 126, 1)"
var COLOR_DARK_GRAY = "rgba(62, 62, 62, 1)";
var COLOR_GREEN = "rgba(163, 201, 74, 1)";
var COLOR_ORANGE = "rgba(255,165, 0, 1)";

var MONTH_IMAGE_WIDHT = 20;
var MONTH_TEXT_WIDTH = 60;
var MONTH_MARGING = 5;

var MONTH_BG_HEIGHT = 20;

var WEEK_BG_HEIGHT = 30;
var WEEK_ITEM_WIDTH = 32;
var WEEK_MARGING = 2;

var DAY_ITME_WIDTH = 32;
var DAY_ITEM_HEIGHT = 25;
var DAY_MARGIN = 2;

var IMAGE_TYPE_LEFT = 0;
var IMAGE_TYPE_RIGHT = 1;
var IMAGE_TYPE_CIRCLE = 2;

// 日历按键类型: month 向上、month 向下、today、 year 向上、 year 向下、 上月 日、 当前月 日、 下月日

var BUTTON_TYPE_MONTH_LEFT = 46;
var BUTTON_TYPE_MONTH_RIGHT = 45;
var BUTTON_TYPE_TODAY = 44;
var BUTTON_TYPE_YEAR_LEFT = 43;
var BUTTON_TYPE_YEAR_RIGHT = 42;
var BUTTON_TYPE_LAST_MONTH_DAY = 0;
var BUTTON_TYPE_CUR_MONTH_DAY = 1;
var BUTTON_TYPE_NEXT_MONTH_DAY = 2;

function BCDatePicker() {
    //date data
    this.monthTexts = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    this.weekTexts = new Array("SU", "MO", "TU", "WE", "TH", "FR", "SA");
    this.todayDate = new Date();

    // user to check
    this.selYear = 0;
    this.selMonth = 0;
    this.selDay = 0;

    // user sel to search date
    this.realSelYear = 0;
    this.realSelMonth = 0;
    this.reaLSelDay = 0;

    this.selDate = new Date();

    this.yearMonthHeight = 0;
    this.weekHeigh = 0;
    this.dayItemHeight = 0;

    this.buttonBgColor = 0;
    this.selColor = 0;
    this.hoverColor = 0;
    this.realDayColor = 0;
    this.notRealDayColor = 0;
    this.backgroundColor = 0;
    this.bgWidth = 0;
    this.bgHeight = 0;
    this.canvas;
    this.context;
    this.mousePosition = {};
    this.lineNumber = 6;

    this.buttonData = new Array();
    this.canReplayDates = new Array();
}

BCDatePicker.prototype.initDatePicker = function() {
    this.canvas = document.getElementById("pb_search_date_piker");
    if(null == this.canvas) {

        return;
    }
    this.selYear = this.todayDate.getFullYear();
    this.selMonth = this.todayDate.getMonth() + 1;
    this.selDay = this.todayDate.getDate();

    this.realSelYear = this.selYear;
    this.realSelMonth = this.selMonth;
    this.reaLSelDay = this.selDay;

    this.bgWidth = this.canvas.width;
    this.bgHeight = this.canvas.height;
    this.context = this.canvas.getContext("2d");

    this.canReplayDates.length = 0;

    //
    this.monthTexts
    this.lineNumber = 6;

    for(var i = 0 ; i < 47; ++ i) {

        this.buttonData[i] = new DateButtonData();
    }

    //month left img
    var month_img_left = MONTH_MARGING;
    var month_img_top = MONTH_MARGING;
    this.buttonData[BUTTON_TYPE_MONTH_LEFT].type = BUTTON_TYPE_MONTH_LEFT;
    this.buttonData[BUTTON_TYPE_MONTH_LEFT].left = month_img_left;
    this.buttonData[BUTTON_TYPE_MONTH_LEFT].top = month_img_top;
    this.buttonData[BUTTON_TYPE_MONTH_LEFT].width = MONTH_IMAGE_WIDHT;
    this.buttonData[BUTTON_TYPE_MONTH_LEFT].height = MONTH_IMAGE_WIDHT;

    //month right img
    var month_img_right = month_img_left + MONTH_IMAGE_WIDHT + MONTH_TEXT_WIDTH;
    var month_img_top = MONTH_MARGING;
    this.buttonData[BUTTON_TYPE_MONTH_RIGHT].type = BUTTON_TYPE_MONTH_RIGHT;
    this.buttonData[BUTTON_TYPE_MONTH_RIGHT].left = month_img_right;
    this.buttonData[BUTTON_TYPE_MONTH_RIGHT].top = month_img_top;
    this.buttonData[BUTTON_TYPE_MONTH_RIGHT].width = MONTH_IMAGE_WIDHT;
    this.buttonData[BUTTON_TYPE_MONTH_RIGHT].height = MONTH_IMAGE_WIDHT;

    //today img
    var today_img_left = month_img_right + MONTH_IMAGE_WIDHT;
    var today_img_top = MONTH_MARGING;
    this.buttonData[BUTTON_TYPE_TODAY].type = BUTTON_TYPE_TODAY;
    this.buttonData[BUTTON_TYPE_TODAY].left = today_img_left;
    this.buttonData[BUTTON_TYPE_TODAY].top = today_img_top;
    this.buttonData[BUTTON_TYPE_TODAY].width = MONTH_IMAGE_WIDHT;
    this.buttonData[BUTTON_TYPE_TODAY].height = MONTH_IMAGE_WIDHT;

    //year left img
    var year_img_left = today_img_left + MONTH_IMAGE_WIDHT;
    var year_img_top = MONTH_MARGING;
    this.buttonData[BUTTON_TYPE_YEAR_LEFT].type = BUTTON_TYPE_YEAR_LEFT;
    this.buttonData[BUTTON_TYPE_YEAR_LEFT].left = year_img_left;
    this.buttonData[BUTTON_TYPE_YEAR_LEFT].top = year_img_top;
    this.buttonData[BUTTON_TYPE_YEAR_LEFT].width = MONTH_IMAGE_WIDHT;
    this.buttonData[BUTTON_TYPE_YEAR_LEFT].height = MONTH_IMAGE_WIDHT;

    //year right img
    var year_img_right = year_img_left + MONTH_IMAGE_WIDHT + MONTH_TEXT_WIDTH;
    var year_img_top = MONTH_MARGING;
    this.buttonData[BUTTON_TYPE_YEAR_RIGHT].type = BUTTON_TYPE_YEAR_RIGHT;
    this.buttonData[BUTTON_TYPE_YEAR_RIGHT].left = year_img_right;
    this.buttonData[BUTTON_TYPE_YEAR_RIGHT].top = year_img_top;
    this.buttonData[BUTTON_TYPE_YEAR_RIGHT].width = MONTH_IMAGE_WIDHT;
    this.buttonData[BUTTON_TYPE_YEAR_RIGHT].height = MONTH_IMAGE_WIDHT;

    function getOffsetOnCanvas(canvas, x, y) {

        var bbox = $(canvas).offset();

        return {
            "x": x- bbox.left,
            "y": y - bbox.top
        };
    }
    this.canvas.onmousemove = function(e) {
        var point={};
        point = getOffsetOnCanvas(g_bcDatePicker.canvas, e.pageX, e.pageY);
        if(point.x < 0 || point.x > g_bcDatePicker.canvas.width || point.y < 0 || point.y > g_bcDatePicker.canvas.height) {
            return;
        }
        g_bcDatePicker.mousePosition = point;
        g_bcDatePicker.reDrawDatePicker();
    };

    this.canvas.onmouseout = function(e) {
        g_bcDatePicker.mousePosition.x = -1;
        g_bcDatePicker.mousePosition.y = -1;
        g_bcDatePicker.reDrawDatePicker();
    }

    this.canvas.onclick = function(e) {
        var point={};
        point = getOffsetOnCanvas(g_bcDatePicker.canvas, e.pageX, e.pageY);
        if(point.x < 0 || point.x > g_bcDatePicker.canvas.width || point.y < 0 || point.y > g_bcDatePicker.canvas.height) {
            return;
        }
        g_bcDatePicker.mousePosition = point;
        var getViewData = getClickViewData(g_bcDatePicker.mousePosition, g_bcDatePicker.buttonData);
        if(null == getViewData) {

            return;
        }
        else {

            var displayMonthChange = false;

            switch(getViewData.type) {
                case BUTTON_TYPE_LAST_MONTH_DAY:{

                    g_bcDatePicker.selMonth = g_bcDatePicker.selMonth - 1;
                    var time = updateYearAndMonth(g_bcDatePicker.selYear, g_bcDatePicker.selMonth);
                    g_bcDatePicker.selYear = time.year;
                    g_bcDatePicker.selMonth = time.month;
                    g_bcDatePicker.selDay = getViewData.value.day;
                    g_bcDatePicker.realSelYear = g_bcDatePicker.selYear;
                    g_bcDatePicker.realSelMonth = g_bcDatePicker.selMonth;
                    g_bcDatePicker.reaLSelDay = g_bcDatePicker.selDay;
                    PlayerPlayback.trigger('monthChange', [g_bcDatePicker.selYear, g_bcDatePicker.selMonth]);

                    //
                    displayMonthChange = true;
                    break;
                }
                case BUTTON_TYPE_CUR_MONTH_DAY:{

                    g_bcDatePicker.selDay = getViewData.value.day;
                    g_bcDatePicker.realSelYear = g_bcDatePicker.selYear;
                    g_bcDatePicker.realSelMonth = g_bcDatePicker.selMonth;
                    g_bcDatePicker.reaLSelDay = g_bcDatePicker.selDay;
                    PlayerPlayback.trigger('dayChange', [g_bcDatePicker.selYear, g_bcDatePicker.selMonth]);
                    break;
                }

                case BUTTON_TYPE_NEXT_MONTH_DAY:{

                    g_bcDatePicker.selMonth = g_bcDatePicker.selMonth + 1;
                    var time = updateYearAndMonth(g_bcDatePicker.selYear, g_bcDatePicker.selMonth);
                    g_bcDatePicker.selYear = time.year;
                    g_bcDatePicker.selMonth = time.month;
                    g_bcDatePicker.selDay = getViewData.value.day;
                    g_bcDatePicker.realSelYear = g_bcDatePicker.selYear;
                    g_bcDatePicker.realSelMonth = g_bcDatePicker.selMonth;
                    g_bcDatePicker.reaLSelDay = g_bcDatePicker.selDay;
                    PlayerPlayback.trigger('monthChange', [g_bcDatePicker.selYear, g_bcDatePicker.selMonth]);

                    //
                    displayMonthChange = true;
                    break;
                }

                case BUTTON_TYPE_MONTH_LEFT: {

                    g_bcDatePicker.selMonth = g_bcDatePicker.selMonth - 1;
                    var time = updateYearAndMonth(g_bcDatePicker.selYear, g_bcDatePicker.selMonth);
                    g_bcDatePicker.selYear = time.year;
                    g_bcDatePicker.selMonth = time.month;
                    PlayerPlayback.trigger('monthChange', [g_bcDatePicker.selYear, g_bcDatePicker.selMonth]);

                    //
                    displayMonthChange = true;
                    break;
                }

                case BUTTON_TYPE_MONTH_RIGHT: {

                    g_bcDatePicker.selMonth = g_bcDatePicker.selMonth + 1;
                    var time = updateYearAndMonth(g_bcDatePicker.selYear, g_bcDatePicker.selMonth);
                    g_bcDatePicker.selYear = time.year;
                    g_bcDatePicker.selMonth = time.month;
                    PlayerPlayback.trigger('monthChange', [g_bcDatePicker.selYear, g_bcDatePicker.selMonth]);

                    //
                    displayMonthChange = true;
                    break;
                }

                case BUTTON_TYPE_YEAR_LEFT: {

                    g_bcDatePicker.selYear = g_bcDatePicker.selYear - 1;
                    PlayerPlayback.trigger('monthChange', [g_bcDatePicker.selYear, g_bcDatePicker.selMonth]);

                    //
                    displayMonthChange = true;
                    break;
                }

                case BUTTON_TYPE_YEAR_RIGHT: {

                    g_bcDatePicker.selYear = g_bcDatePicker.selYear + 1;
                    PlayerPlayback.trigger('monthChange', [g_bcDatePicker.selYear, g_bcDatePicker.selMonth]);

                    //
                    displayMonthChange = true;
                    break;
                }

                case BUTTON_TYPE_TODAY: {

                    g_bcDatePicker.selYear = g_bcDatePicker.todayDate.getFullYear();
                    g_bcDatePicker.selMonth = g_bcDatePicker.todayDate.getMonth() + 1;
                    g_bcDatePicker.selDay = g_bcDatePicker.todayDate.getDate();
                    g_bcDatePicker.realSelYear = g_bcDatePicker.selYear;
                    g_bcDatePicker.realSelMonth = g_bcDatePicker.selMonth;
                    g_bcDatePicker.reaLSelDay = g_bcDatePicker.selDay;

                    //
                    displayMonthChange = true;
                    break;
                }

                default :
                    break;

            }

            g_bcDatePicker.reDrawDatePicker();
        }
    }

    this.drawDatePicker();
}

BCDatePicker.prototype.setDate = function(date, noRefresh) {

    if (!noRefresh && (g_bcDatePicker.selYear != date.getFullYear() || g_bcDatePicker.selMonth != date.getMonth() + 1)) {
        PlayerPlayback.trigger('monthChange', [date.getFullYear(), date.getMonth() + 1]);
    }

    g_bcDatePicker.selYear = date.getFullYear();
    g_bcDatePicker.selMonth = date.getMonth() + 1;
    g_bcDatePicker.selDay = date.getDate();
    g_bcDatePicker.realSelYear = g_bcDatePicker.selYear;
    g_bcDatePicker.realSelMonth = g_bcDatePicker.selMonth;
    g_bcDatePicker.reaLSelDay = g_bcDatePicker.selDay;

    this.reDrawDatePicker();

};

BCDatePicker.prototype.refreshCanReplayList = function(isCanReplayList) {

    this.canReplayDates = isCanReplayList;
    this.reDrawDatePicker();
}

BCDatePicker.prototype.getSearchDate = function() {

    this.selDate.setFullYear(this.realSelYear);
    this.selDate.setMonth(this.realSelMonth - 1);
    this.selDate.setDate(this.reaLSelDay);
    this.selDate.setHours(0);
    this.selDate.setMinutes(0);
    this.selDate.setSeconds(0);

    return new Date(this.selDate);
}

BCDatePicker.prototype.drawDatePicker = function() {

    this.context.clearRect(0, 0, this.bgWidth, this.bgHeight);

    //draw background
    var gradient = this.context.createLinearGradient(0,0,0,300);
    gradient.addColorStop(0,"#ffffff");
    gradient.addColorStop(1,"#ffffff");

    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0 , this.bgWidth, this.bgHeight);

    //daw months and years

    //month left img
    drawImageButton(this.context, this.mousePosition.x, this.mousePosition.y, this.buttonData[BUTTON_TYPE_MONTH_LEFT].left, this.buttonData[BUTTON_TYPE_MONTH_LEFT].top, this.buttonData[BUTTON_TYPE_MONTH_LEFT].width, this.buttonData[BUTTON_TYPE_MONTH_LEFT].height, IMAGE_TYPE_LEFT);

    //month text
    var month_text_left = this.buttonData[BUTTON_TYPE_MONTH_LEFT].left + MONTH_IMAGE_WIDHT + MONTH_TEXT_WIDTH /2;
    var month_text_top = MONTH_MARGING + 1 + MONTH_BG_HEIGHT / 2;
    this.context.font="normal normal normal 15px normal";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = COLOR_BULUE;
    this.context.fillText(getMonthTextByMonth(this.selMonth, this.monthTexts), month_text_left, month_text_top);

    //month right img
    drawImageButton(this.context, this.mousePosition.x, this.mousePosition.y, this.buttonData[BUTTON_TYPE_MONTH_RIGHT].left, this.buttonData[BUTTON_TYPE_MONTH_RIGHT].top, this.buttonData[BUTTON_TYPE_MONTH_RIGHT].width , this.buttonData[BUTTON_TYPE_MONTH_RIGHT].height, IMAGE_TYPE_RIGHT);

    //today img
    drawImageButton(this.context, this.mousePosition.x, this.mousePosition.y, this.buttonData[BUTTON_TYPE_TODAY].left, this.buttonData[BUTTON_TYPE_TODAY].top, this.buttonData[BUTTON_TYPE_TODAY].width, this.buttonData[BUTTON_TYPE_TODAY].height, IMAGE_TYPE_CIRCLE);

    //year left img
    drawImageButton(this.context, this.mousePosition.x, this.mousePosition.y, this.buttonData[BUTTON_TYPE_YEAR_LEFT].left, this.buttonData[BUTTON_TYPE_YEAR_LEFT].top, this.buttonData[BUTTON_TYPE_YEAR_LEFT].width, this.buttonData[BUTTON_TYPE_YEAR_LEFT].height, IMAGE_TYPE_LEFT);

    //year text
    var year_text_left = this.buttonData[BUTTON_TYPE_YEAR_LEFT].left + MONTH_IMAGE_WIDHT + MONTH_TEXT_WIDTH /2;
    var year_text_top = MONTH_MARGING + 1 +  MONTH_BG_HEIGHT / 2;

    this.context.font="normal normal normal 15px normal";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = COLOR_BULUE;
    this.context.fillText(this.selYear, year_text_left, year_text_top);

    //year right img
    drawImageButton(this.context, this.mousePosition.x, this.mousePosition.y, this.buttonData[BUTTON_TYPE_YEAR_RIGHT].left, this.buttonData[BUTTON_TYPE_YEAR_RIGHT].top, this.buttonData[BUTTON_TYPE_YEAR_RIGHT].width, this.buttonData[BUTTON_TYPE_YEAR_RIGHT].height, IMAGE_TYPE_RIGHT);

    // draw week views
    for(var i = 0; i < 7; ++i) {
        var itemLeft = WEEK_MARGING + i * WEEK_ITEM_WIDTH + WEEK_ITEM_WIDTH / 2;
        var itemTop = MONTH_MARGING + MONTH_BG_HEIGHT + WEEK_BG_HEIGHT / 2;

        this.context.font="normal normal bold 12px arial";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillStyle = COLOR_BLACK;
        this.context.fillText(this.weekTexts[i], itemLeft, itemTop);
    }

    // draw day views
    var firstDayIndex = getFirstDay(this.selYear, this.selMonth);
    var curMonthDaysCount = getDaysBayYearAndMonth(this.selYear, this.selMonth);
    var lastTime = updateYearAndMonth(this.selYear, this.selMonth - 1);
    var nextTime = updateYearAndMonth(this.selYear, this.selMonth + 1);
    var lastMonthDaysCount = getDaysBayYearAndMonth(lastTime.year, lastTime.month);
    var dayTexts = new Array();
    for(var i = 0; i < 7; ++ i) {
        for(var j = 0; j < 6; ++ j) {


            if((j * 7 + i) < firstDayIndex) {

                dayTexts[j * 7 + i] = (lastMonthDaysCount + (j * 7 + i) - firstDayIndex) % lastMonthDaysCount + 1;
                this.buttonData[j * 7 + i].type = BUTTON_TYPE_LAST_MONTH_DAY;
                this.buttonData[j * 7 + i].value.year = lastTime.year;
                this.buttonData[j * 7 + i].value.month = lastTime.month;
            } else if((j * 7 + i) < firstDayIndex + curMonthDaysCount) {

                dayTexts[j * 7 + i] = (j * 7 + i) - firstDayIndex + 1;
                this.buttonData[j * 7 + i].type = BUTTON_TYPE_CUR_MONTH_DAY;
                this.buttonData[j * 7 + i].value.year = this.selYear;
                this.buttonData[j * 7 + i].value.month = this.selMonth;
            } else if ((j * 7 + i) >= firstDayIndex + curMonthDaysCount) {

                dayTexts[j * 7 + i] = (j * 7 + i) - (firstDayIndex + curMonthDaysCount) + 1;
                this.buttonData[j * 7 + i].type = BUTTON_TYPE_NEXT_MONTH_DAY;
                this.buttonData[j * 7 + i].value.year = nextTime.year;
                this.buttonData[j * 7 + i].value.month = nextTime.month;
            }

            var itemLeft = DAY_MARGIN + i * DAY_ITME_WIDTH;
            var itemTop = MONTH_MARGING + MONTH_BG_HEIGHT + WEEK_BG_HEIGHT + DAY_ITEM_HEIGHT * j;
            this.buttonData[j * 7 + i].left = itemLeft;
            this.buttonData[j * 7 + i].top = itemTop;
            this.buttonData[j * 7 + i].width = DAY_ITME_WIDTH;
            this.buttonData[j * 7 + i].height = DAY_ITEM_HEIGHT;
            this.buttonData[j * 7 + i].value.day = dayTexts[j * 7 + i];
            var isSelDay = getIsSelDay(this.buttonData[j * 7 + i], this.realSelYear, this.realSelMonth, this.reaLSelDay);
            drawTextButton(this.context, this.mousePosition.x, this.mousePosition.y, this.buttonData[j * 7 + i], isSelDay, this.canReplayDates);
        }
    }
}

function updateYearAndMonth(year, month) {
    var time = {};
    var totalMonth = year * 12 + month - 1;

    time.year = parseInt(totalMonth / 12);
    time.month = totalMonth % 12 + 1;

    return time;

}

function getIsSelDay(buttonData, realSelYear, realSelMonth, reaLSelDay) {
    if(buttonData.value.year == realSelYear && buttonData.value.month == realSelMonth && buttonData.value.day == reaLSelDay) {

        return true;
    }
    return false;
}

function getMonthTextByMonth(month, monthTexts) {

    return monthTexts[month - 1];
}

function isInButton(mouseX, mouseY, left, top, buttonWidth, buttonHeight) {

    if(mouseX > left && mouseX < left + buttonWidth && mouseY > top && mouseY < top + buttonHeight) {
        return true;
    }
    return false;
}

function drawImageButton(context, mouseX, mouseY, buttonLeft, buttonTop, buttonWidth, buttonHeight, imageType) {
    var isInBut = isInButton(mouseX, mouseY, buttonLeft, buttonTop, buttonWidth, buttonHeight);
    //draw button bg
    context.fillStyle = COLOR_TRANSPARENT;
    context.fillRect(buttonLeft, buttonTop, buttonWidth, buttonHeight);

    if(IMAGE_TYPE_LEFT == imageType) {

        if(isInBut) {

            context.fillStyle = COLOR_BULUE;//填充颜色,默认是黑色
        } else {

            context.fillStyle = COLOR_DARK_GRAY;//填充颜色,默认是黑色
        }
        var startX = buttonLeft + buttonWidth / 4;
        var startY = buttonTop + buttonHeight / 2;

        var endX = buttonLeft + buttonWidth * 3 / 4;
        var endY1 = buttonTop + buttonHeight / 4;
        var endY2 = buttonTop + buttonHeight * 3 / 4;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY1);
        context.lineTo(endX, endY2);
        context.fill();
        context.closePath();

    } else if(IMAGE_TYPE_RIGHT == imageType) {

        if(isInBut) {

            context.fillStyle = COLOR_BULUE;
        } else {

            context.fillStyle = COLOR_DARK_GRAY;
        }
        var startX = buttonLeft + buttonWidth * 3 / 4;
        var startY = buttonTop + buttonHeight / 2;

        var endX = buttonLeft + buttonWidth / 4;
        var endY1 = buttonTop + buttonHeight / 4;
        var endY2 = buttonTop + buttonHeight * 3 / 4;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY1);
        context.lineTo(endX, endY2);
        context.fill();
        context.closePath();
    } else if(IMAGE_TYPE_CIRCLE == imageType) {

        if(isInBut) {

            context.fillStyle = COLOR_BULUE;
        } else {

            context.fillStyle = COLOR_DARK_GRAY;
        }

        context.beginPath();
        context.arc(buttonLeft + buttonWidth / 2, buttonTop + buttonHeight / 2, buttonWidth / 5, 0, 360, false);
        context.fill();//画实心圆
        context.closePath();
    }
}

function getClickViewData(mousePosition, buttonDatas) {

    for(var i = 0; i < buttonDatas.length; ++ i) {
        var buttonData = buttonDatas[i];
        if(isInButton(mousePosition.x, mousePosition.y, buttonData.left, buttonData.top, buttonData.width, buttonData.height)) {
            return buttonData;
        } else {
            continue;
        }
    }
    return null;
}

function drawTextButton(context, mouseX, mouseY, buttonData, isSelDay, canReplayDates) {
    var buttonLeft = buttonData.left;
    var buttonTop = buttonData.top;
    var buttonWidth = buttonData.width;
    var buttonHeight = buttonData.height;
    var text = buttonData.value.day;
    var isInBut = isInButton(mouseX, mouseY, buttonLeft, buttonTop, buttonWidth, buttonHeight);

    var textColor = COLOR_BLACK;
    if(BUTTON_TYPE_CUR_MONTH_DAY == buttonData.type) {
        textColor = COLOR_BLACK;
    } else {
        textColor = COLOR_GRAY;
    }
    var stroke = false;
    var fill = false;
    //draw button bg
    if(isInBut) {
        context.fillStyle = COLOR_LIGH_BULUE;
        textColor = COLOR_WHITE;
        fill = true;
    } else {

        context.fillStyle = COLOR_TRANSPARENT;

        for(var i = 0; i < canReplayDates.length; ++ i) {

            if((buttonData.value.year == canReplayDates[i].getFullYear())
            && (buttonData.value.month == canReplayDates[i].getMonth() + 1)
            && (buttonData.value.day == canReplayDates[i].getDate())) {
                context.fillStyle = COLOR_ORANGE;
                textColor = COLOR_WHITE;
                fill = true;
                break;
            }

        }

    }

    if(isSelDay) {

        if (!fill) {
            context.fillStyle = COLOR_TRANSPARENT;
            textColor = COLOR_BLACK;
        }

        context.strokeStyle = COLOR_BULUE;
        context.lineWidth = 2;
        stroke = true;
    }
    if (fill) {
        context.roundRect(buttonLeft + 2, buttonTop + 2, buttonWidth - 4, buttonHeight - 4, 3, true, false);
    }
    if (stroke) {
        context.roundRect(buttonLeft + 1, buttonTop + 1, buttonWidth - 2, buttonHeight - 2, 3, false, true);
    }
    context.fillStyle = textColor;
    context.font="normal normal normal 12px arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, buttonLeft + buttonWidth / 2, buttonTop + buttonHeight / 2);
}

//获取日历信息

//是否闰年
function isLeapYear(year) {

    return (year % 400 === 0) || (year % 100 !== 0 && year % 4 === 0) ? true : false;
}

var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

//返回某月天数
function getDaysBayYearAndMonth(year, month) {

    var rtn = monthDays[month - 1];

    if (month === 2 && isLeapYear(year)) {
        rtn++;
    }

    return rtn;
}

//某年某月第一天是周几
function getFirstDay(year, month) {

    var date = new Date();
    date.setFullYear(year);
    date.setMonth(month - 1);
    date.setDate(1);

    return date.getDay(); //返回是周几， 0 为周日
}

BCDatePicker.prototype.reDrawDatePicker = function () {

    this.drawDatePicker();
}

