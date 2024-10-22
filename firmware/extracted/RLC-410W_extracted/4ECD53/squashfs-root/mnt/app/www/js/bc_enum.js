/*----------------------------------------------------------------------------
 *
 * 								接口枚举类
 *
 *----------------------------------------------------------------------------*/

/*
 * description: 		当前页面
 */
var EnumCurState = {

    PREVIEW: "PREVIEW",
    PLAYBACK: "PLAYBACK",
    LOGIN: "LOGIN",
    LOADING: "LOADING",
    DOWNLOAD: "DOWNLOAD",
    INFO: "INFO",
    CONFIG: "CONFIG"
};

/*
 * description: 					ptz模式（0为不支持ptz	；1为AF模式；2为PTZ模式）
 */
var EnumPTZMode = {

    NONE: 0,
    AF: 1,
    PTZ: 2
};


/*
 * description: 					连接类型 (0为ip；1为p2p)
 */
var EnumLoginType = {

    IP: 0,
    UID: 1
};

/*
 * description: 					login返回结果 (0为成功；-1为失败， -2为用户名或密码错误)
 */
var EnumLoginResult = {

    SUCCESS: 0,
    FAIL: -1,
    PASSWORD_ERROR: -2
};

/*
 * description: 					通道状态
 */
var EnumChannelStatus = {
    CLOSED: 0,
    PLAYING: 1
};

/*
 * description: 					视图状态
 */
var EnumViewStatus = {
    CLOSED: 0,
    PAUSED: 1,
    PLAYING: 2,
    ERROR: 3,
    BUFFERING: 4
};

/*
 * description: 					画面模式（1为一画面；4为四画面；9为九画面；16为十六画面）
 */
var EnumScreenMode = {

    ONE: 1,
    FOUR: 4,
    NINE: 9,
    SIXTEEN: 16
};

/*
 * description: 					码流类型（0为小码流；1为辅助码流；2为大码流；3为自动）
 */
var EnumStreamType = {

    FLUENT: 0,
    BALANCED: 1,
    CLEAR: 2,
    CLIP: 4,
    AUTO: 3
};

var EnumRTMPStreamType = [
    1, 2, 0, 0, 3
];

/*
 * description: 					HSB类型（0为hue；1为saturation；2为brightness；3为contrast）
 */
var EnumHSBType = {

    HUE: 0,
    SATURATION: 1,
    BRIGHTNESS: 2,
    CONTRAST: 3
};

/*
 * description: 					是否自动切换码流    (treu为自动   ；   false为手动)
 */
var EnumIsAutoStream = {
    AUTO: true,
    MANUAL: false
};

/*
 * description:  右边栏元素列表顺序
 */
var EnumPreRightItem = {
    CHANNELS: 0,
    PTZ: 1,
    PRESET: 2,
    IMG: 3,
    ADV: 4,
    CROP: 5
};

/**
 * description:  ptz preset菜单类型
 */
var EnumPrePresetMenuType = {
    PRESET: 0,
    CRUISE: 1
};

/**
 * description:    回放显示文件类型
 */
var EnumPbShowFileType = {
    SCHEDULE: 1 << 0,
    MANUAL: 1 << 1,
    ALARM: 1 << 2,
    ALL: 1 << 3
};

/**
 * description:		回放mode
 */
var EnumPbChannelMode = {
    ONE: 0,
    FOUR: 1
};

var EnumPBPlayState = {
    "PLAYING": 0,
    "IDLE": 1,
    "PAUSED": 2
};

var EnumPTZType = {
    "NONE": 0,
    "AF": 1,
    "PTZ": 2,
    "PT": 3,
    "PTZS": 4,
    "GM8136S_PTZ": 5
};

var EnumPatrolType = {
    "NONE": 0,
    "NORMAL": 1
};

var g_device;
var g_flashMode = false;
var g_sliderIsMouseDown = false;

var EnumCGIError = {
    "-3": "Failed to recognize the file format.",
    "-5": "No more available connections.",
    "-4": "Wrong input, please check again.",
    "-6": "Session expired, please log in again.",
    "-7": "Invalid username or password.",
    "-8": "Operation timeout! Please try again later.",
    "-9": "The upgrade method is not supported.",
    "-12": "Failed to get configuration, please try again.",
    "-13": "Failed to verify configuration, please try again.",
    "-20": "No enough memory for urgrade.",
    "-26": "You are not allowed to do this.",
    "-27": "Your account is invalid, please login again.",
    "-28": "The new user name has been taken.",
    "-29": "Failed to add more users because you’ve reached the max number limit.",
    "-30": "Failed to upgrade as the selected package is identical with the current version.",
    "-31": "Device is busy, please try again later.",
    "-32": "Specific network address is conficted with other machine.",
    "-33": "Please type in the CAPTCHA in the image.",
    "-34": "Require binding email address",
    "-35": "Failed to bind",
    "-36": "Network timeout",
    "-37": "The password is incorrect",
    "-38": "UID is not valid",
    "-39": "The cloud account doesn't exist.",
    "-41": "Sorry,cloud storage is not available.",
    "-43": "Fail to bind",
    "-44": "An unknown error has occurred.",
    "-45": "Please type in the CAPTCHA in the image.",
    "-100": "Configuration test failed.",
    "-200": "FTP Login Failed.",
    "-201": "FTP Create Dir Failed.",
    "-202": "FTP Upload Failed.",
    "-203": "FTP Connect Server Failed.",
    0xfffffffa: "Location is changed.",
    0xffffffff: "Fatal error: Device responsed with an unexpected command result.",
    0xfffffffe: "Fatal error: Device returned a result with the invalid format..",
    0xfffffffc: "Fatal error: Failed to recognize data from the device.",
    0xfffffffd: "Network error: Unable to connect to device.",
    0xfffffffb: "Network error: Request timeout."
};

var EnumStreamFullNames = [
    'sub', 'extern', 'main', 'main', 'clip'
];

var EnumFlvStatus = {
    "normal": 0,
    "loading": 1,
    "disconnect": 2,
    'pause': 3,
    'stop': 4,
    'nofile': 5
};

var EnumFlvStretching = {
    'exactfit': 0,
    'screen': 1
}
