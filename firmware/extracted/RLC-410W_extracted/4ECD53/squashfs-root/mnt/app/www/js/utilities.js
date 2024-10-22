/*
 *
 * tool function 工具函数
 *
 */

if (!String.prototype.repeat) {
    String.prototype.repeat = function(l) {
        var rtn = '';
        while (l-- > 0) {
            rtn += this;
        }
        return rtn;
    }
}

if (!String.random) {
    String.random = function(l) {
        var rtn = '', seed="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
        while (l-- > 0) {
            rtn += seed[Math.floor(Math.random() * seed.length)];
        }
        return rtn;
    }
}

if (!String.prototype.leftPad) {
    String.prototype.leftPad = function(v, l) {
        var rtn = this, t = this;
        while ((t = v + t).length <= l) {
            rtn = t;
        }
        if (rtn.length < l) {
            rtn = v.substr(0, l - rtn.length) + rtn;
        }
        return rtn;
    }
}

if (!Date.prototype.getUnixDate) {
    Date.prototype.getUnixDate = function() {
        return this.getFullYear()
                 + '-'+ (this.getMonth() + 1).toString().leftPad('0', 2)
                 + '-' + this.getDate().toString().leftPad('0', 2)
                 + ' ' + this.getHours().toString().leftPad('0', 2)
                 + ':' + this.getMinutes().toString().leftPad('0', 2)
                 + ':' + this.getSeconds().toString().leftPad('0', 2);
    };
}

if (!Date.prototype.getUnixDateOnly) {
    Date.prototype.getUnixDateOnly = function() {
        return this.getFullYear()
                 + '-'+ (this.getMonth() + 1).toString().leftPad('0', 2)
                 + '-' + this.getDate().toString().leftPad('0', 2);
    };
}

if (!Date.prototype.getUnixTimeOnly) {
    Date.prototype.getUnixTimeOnly = function() {
        return this.getHours().toString().leftPad('0', 2)
                 + ':' + this.getMinutes().toString().leftPad('0', 2)
                 + ':' + this.getSeconds().toString().leftPad('0', 2);
    };
}

if (!String.formatSize) {
    String.formatSize = function(size, ac) {
        if (!ac)
            ac = 1;
        var k = size * 1.0;
        var i = 0;
        var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        while (k >= 1048576) {
            i++;
            k /= 1024.0;
        }
        if (k >= 1024) {
            i++;
            k /= 1024.0;
        }
        return {'num': k>0?k.toFixed(ac):'0', 'unit': units[i]};
    };
}

/*
 * description: 					错误码枚举类
 *
 */
var EnumErrorCode = {

	NOT_SUPPORT_IE_8 			: 			-10,
	NOT_SUPPORT_CANVAS 			: 			-11,
	DOWNLOAD_IE_PLUGIN 			: 			-12
}

/*
 * function：						控制台打印
 * param:
 * 		string message: 			控制台打印内容
 * return:
 * 		void
 *
 */
function log(target, message) {

    if(!target) {

        target = "";
    }
    if(!message) {

        message = "";
    }
    var target = message + " ----- " + target;
    console.dbg(target)
}

/*
 *
 * function: 				范围矫正，对超出范围的值进行边值矫正即，范围（1-100）则 -1时为1 ，101时为100
 * param:
 * 		int_32 baseData: 	待矫正的值
 * 		int_32 rangeStart:  范围开始值
 * 		int_32 rangeEnd:	范围结束值
 * return:
 * 		int ret：			返回矫正的值（rangeStart-rangeEnd）
 * 		default: 			默认矫正失败 -1
 *
 */
function adjustRange(baseData, rangeStart, rangeEnd) {

	var tag = getFuncName(arguments);
	try {

		if(rangeStart > rangeEnd) {

			log(tag, "range start is bigger than end");
			return -1;
		}
		if(baseData < rangeStart) {

			return rangeStart;
		} else if(baseData > rangeEnd) {

			return rangeEnd;
		}
		return baseData
	} catch(e) {

		log(tag, e.message);
		return -1;
	}

}

/*
 *
 * function: 				校验序号是否在范围内
 * param:
 * 		int_32 baseData: 	待校验的值
 * 		int_32 rangeStart:  范围开始值
 * 		int_32 rangeEnd:	范围结束值
 * return:
 * 		int ret：			校验结果（true 为在范围内， false为在范围外或者校验失败）
 * 		default: 			校验失败 false
 *
 */
function isInRange(baseData, rangeStart, rangeEnd) {

	var tag = getFuncName(arguments);
	try {

		if(rangeStart > rangeEnd) {

			log(tag, "range start is bigger than end");
			return false;
		}
		if(rangeStart > baseData || rangeEnd < baseData) {

			return false;
		}
		return true;
	} catch(e) {

		log(tag, e.message);
		return false;
	}
}

/*
 *
 * function: 						判断是否是字符串格式
 * param：
 * 		obj	value:					判断的值
 * return:
 * 		boolean: 					true为是字符串，false为不是字符串
 *
 */
function isString(value){

	var tag = getFuncName(arguments);
	return (typeof value == 'string') && value.constructor == String;
}

/*
 *
 * function: 						函数动态参数调用
 * param：
 * 		function functionName:		函数名称
 * 		array paramArray:			参数数组
 * return:
 * 		void
 *
 */
function doCallBack(functionName, paramArray) {

	var tag = getFuncName(arguments);
	if(!functionName) {

		log(tag, "function name is null")
		return;
	}
	return functionName.apply(this, paramArray);
}

/*
 *
 * function: 						获取方法名称（使用范围为 function fun(){]这种类型，
 * 											var fun = function(){}这种类型，暂时不支持）
 * param：
 * 		arguments argumentValues:	js函数的参数属性
 * return:
 * 		string ret: 				函数方法
 * 		default:					""
 *
 */
function getFuncName (argumentValues){

	var tag = "getFuncName";
	try {

		var tmp = argumentValues.callee.toString();
		var re = /function\s*(\w*)/i;
		var matches = re.exec(tmp);
		return matches[1];
	} catch(e) {

		log(tag, e.message);
		return ""
	}
}

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

var base64DecodeChars = new Array(
                                  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                                  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                                  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
                                  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
                                  -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
                                  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
                                  -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
                                  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

function utf16to8(str) {
    var out, i, len, c;

    out = "";
    len = str.length;
    for(i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
        }
    }
    return out;
}

function utf8to16(str) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = str.length;
    i = 0;
    while(i < len) {
        c = str.charCodeAt(i++);
        switch(c >> 4)
        {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += str.charAt(i-1);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) |
                                           ((char2 & 0x3F) << 6) |
                                           ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if(i == len)
        {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if(i == len)
        {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
        /* c1 */
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while(i < len && c1 == -1);
        if(c1 == -1)
            break;

        /* c2 */
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while(i < len && c2 == -1);
        if(c2 == -1)
            break;

        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if(c3 == 61)
                return out;
            c3 = base64DecodeChars[c3];
        } while(i < len && c3 == -1);
        if(c3 == -1)
            break;

        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if(c4 == 61)
                return out;
            c4 = base64DecodeChars[c4];
        } while(i < len && c4 == -1);
        if(c4 == -1)
            break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}

//input base64 encode
function str_decode(str){
    return utf8to16(base64decode(str));
}

function str_encode(str){
    return base64encode(utf16to8(str));
}


// array
Array.prototype.in_array = function(e) {

    for(var i = 0; i < this.length; ++ i) {

        if(this[i] == e) {
            return true;
        }
    }

    return false;
}

//
function GetArgsFromHref(sArgName) {

    var sHref = window.location.href;
    var args = sHref.split("?");
    var retval = "";

    if(args[0] == sHref) /*≤Œ ˝Œ™ø’*/
    {
        return retval; /*Œﬁ–Ë◊ˆ»Œ∫Œ¥¶¿Ì*/
    }
    var str = args[1];
    args = str.split("&");
    for(var i = 0; i < args.length; i ++)
    {
        str = args[i];
        var arg = str.split("=");
        if(arg.length <= 1) continue;
        if(arg[0] == sArgName) retval = arg[1];
    }
    return retval;
}

//
function oneToZeroOne(num) {

    var numString = num.toString();
    numString.length == 1 ? numString = "0" + numString : numString = numString;
    return numString;
}

function isIe() {
    //方便IE浏览器调试，最后可注释删除
    var strPlatform  = navigator.platform.toLowerCase();
    var strUserAgent = navigator.userAgent.toLowerCase();

    if (strPlatform.indexOf("win32") != -1
        || strUserAgent.indexOf("windows nt") != -1)
    {
        if (strUserAgent.indexOf("chromeframe") != -1)
        {
            return true;
        }
        else if (strUserAgent.indexOf("chrome") != -1
                 || strUserAgent.indexOf("firefox") != -1
                 || strUserAgent.indexOf("safari")  != -1)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
    else
    {
        return false;
    }
}

function isSafari()
{
    var strUserAgent = navigator.userAgent.toLowerCase();
    if(strUserAgent.indexOf("safari") != -1 && strUserAgent.indexOf("chrome") == -1 ){
        return true;
    }
    return false;
}

function isOldEdge() {
    var strUserAgent = navigator.userAgent.toLowerCase();
    if(strUserAgent.indexOf("edge") !== -1) {
        return true;
    }
    return false;
}

function isMac() {

    if(String(navigator.platform).indexOf("Mac") < 0) {
        return false;
    } else {
        return true;
    }
}

function LOG(text) {

    console.dbg(text);
}

if (Object.defineProperty) {

    Object.defineProperty(console, "isDebug", {

        "get" : function() {

            return this.__isDebug;
        },

        "set" : function(v) {

            this.__isDebug = v;

            if (v) {

                this.dbg = this.debug;

            } else {

                this.dbg = function() {};
            }
        }
    });

    console.dbg = function() {};

} else {

    console.dbg = function() {
        if (this.isDebug) {
            this.debug.apply(this, arguments);
            this.trace();
        }
    };

}

if (window.location.search.indexOf('debug') >= 0) {
    console.isDebug = true;
}

function isValidValue(v) {
    return !(v === null || v === undefined);
}
/** no semicolon input */
function containsSemicolon(list) {
    for(key in list) {
        if(typeof list[key] == "string" && list[key].indexOf(';') >= 0) {
            return true;
        }
    }
    return false;
}

function setCookie(name, value, time) {

    var expires = '';
    if ((typeof(time)==="number") && (time!==Infinity) && !isNaN(time)) {
        var date = new Date();
        date.setTime(date.getTime() + time);
        expires = '; expires=' + date.toGMTString();
    }

    document.cookie = name + '=' + value + '; path=/; ' + expires;

}

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    } else {
        return null;
    }
}

function allowFlv() {

    setCookie('is_allow_flv', '', -3600);

}

function closeFlv() {

    setCookie('is_allow_flv', 'not_allowed', 24 * 60 * 60 * 1000);

}

function isAllowFlv() {
    return getCookie('is_allow_flv') !== 'not_allowed';
}

function isBrowserSupportFlv() {  // 判断浏览器是否支持flv
    return (!isIe()) && flvjs.isSupported();
}

function flashCheck() {  // 判断是否使用flash播放
    return !isAllowFlv() || !isBrowserSupportFlv();
}

function cloneObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}
