
//preview control item
function PreviewCtrolItem() {

    this.name = "";
    this.containerView = 0;
    this.headerView = 0;
    this.maxHeight = 0;
    this.isShow = false;

}

function DateButtonData() {

    this.type = 0; // 日历按键类型: month 向上、month 向下、today、 year 向上、 year 向下、 上月 日、 当前月 日、 下月日
    this.left = 0;
    this.top = 0;
    this.width = 0;
    this.height = 0;
    this.value = {};
    this.value.year = 0;
    this.value.month = 0;
    this.value.day = 0;
}

