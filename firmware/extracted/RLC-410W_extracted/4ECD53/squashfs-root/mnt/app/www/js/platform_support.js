
/*
 * description: 					浏览器类型枚举类		
 * 
 */
var EnumBroserType = {
    
    IE 					: 			"msie",
    IE11 				: 			"trident",
    FIRFOX 				: 			"firefox",
    CHROME 				: 			"chrome",
    OPERA 				: 			"opera",
    SAFARI 				: 			"safari",
    OTHER 				: 			"other"
}

/*
 * description: 					系统平台		
 * 
 */
var EnumSystemPlatform = {
    
    MAC 				: 			"mac",
    WIN64 				: 			"win64",
    WIN32 				: 			"win32",
    OTHER 				: 			"other"
}

/*
 * description: 					浏览器类型枚举类		
 * 	
 */
var EnumPluginType = {
    
    ACTIVIEX_32			: 			"activeX_32",
    ACTIVIEX_64 		: 			"activeX_64",
    NPAPI_MAC 			: 			"npapi_mac",
    NPAPI_WIN 			: 			"npapi_win",
    FLASH				:			"flash",
    OTHRE				:			"other"
}

/*
 * description: 					插件下载地址			
 */
var EnumPluginDownLoadURL = {
    
    ACTIVIEX_32 		:			"DvrWebClient_win32.exe",
    ACTIVIEX_64			:			"DvrWebClient_win64.exe",
    NPAPI_MAC			:			"DvrWebClient_macNp.exe",
    NPAPI_WIN			:			"DvrWebClient_winNp.exe",
}

/*----------------------------------------------------------------------------
 * 
 * 								去平台接口
 * 
 *----------------------------------------------------------------------------*/

/*
 * function:   						比较两个版本号的大小
 * parame: 							
 * 		string version_1: 			版本1，（格式为4位点分制，如1.0.0.0)
 * 		string version_2:			版本2，（格式为4位点分制，如1.0.0.0)
 * return:
 * 		int ret: 					比较结果
 * 									返回 －1 则 version_1 < version_2
 * 									返回 0   则 version_1 == version_2
 * 									返回 1   则 version_1 > version_2
 */
function compareVersion(version_1, version_2) {
    
    var words_1 = version_1.split(".");
    
    var words_2 = version_2.split(".");
    
    var length = Math.min(words_1.length, words_2.length);
    
    for (var i = 0; i < length; i ++) {
        
        var shortVersion_1 = Number(words_1[i]);
        
        var shortVersion_2 = Number(words_2[i]);
        
        if (shortVersion_1 > shortVersion_2) {
            
            return 1;
            
        }
        else if (shortVersion_1 < shortVersion_2) {
            
            return -1;
        }
    }
    
    if (words_1.length > words_2.length) {
        
        return 1;
    }
    else if (words_1.length < words_2.length) {
        
        return -1;
    }
    
    return 0;
}


/*
 * function：						获取当前浏览器类型
 * param:
 * return: 
 * 		borserinfo:					浏览器信息（browser为浏览器名称， ver为浏览器版本）
 * 	
 */
function getBrowserInfo() {
    
    var browserInfo = {};
    var userAngent = navigator.userAgent.toLowerCase();
    var info =/(msie|firefox|chrome|trident|opera|version).*?([\d.]+)/;
    var data = userAngent.match(info);
    browserInfo.browser = data[1].replace(/version/, "'safari");
    browserInfo.ver = data[2];
    return browserInfo;
}

/*
 * function：						获取当前系统平台
 * param:
 * return: 
 * 		string systemPlatform:		平台信息（mac为mac 系统； win64为windows 64位；win32为windows 32位，other为其他系统）
 * 		dafult: 					其他系统 other
 */
function getSystemPlatform() {
    
    var systemPlatform = EnumSystemPlatform.WIN32;
    var tmpPlatform  = navigator.platform.toLowerCase();	
    var isMac = (tmpPlatform.indexOf("mac") != -1);
    var isWin = (tmpPlatform.indexOf("win") != -1);
    if(isMac){

        systemPlatform = EnumSystemPlatform.MAC;
    } else if(isWin){
        
        var isWin64 = (navigator.platform.indexOf("win64") != -1);
        if(isWin64) {
            
            systemPlatform = EnumSystemPlatform.WIN64;
        } else {
            
            systemPlatform = EnumSystemPlatform.WIN32;
        }
    } else {
        
        systemPlatform = EnumSystemPlatform.OTHER;
    }
    return systemPlatform;
}

/*
 * function:						获取浏览器支持的条件
 * param:							
 * return:
 * 		int ret:					0为支持，-10为ie浏览器低于9，-11为不支持canvas
 */
function getBroserSupport() {
    
    var browserInfo = getBrowserInfo();
    if(EnumBroserType.IE == browserInfo.browser) {
        
        var versions = browserInfo.ver.split(".");
        if(versions[0] < 10) {

            return EnumErrorCode.NOT_SUPPORT_IE_8;
        }
    }
    
    if(supports_canvas()) {
        
        return EnumErrorCode.NOT_SUPPORT_CANVAS;
    }
    return 0;
}

/*
 * function:						获取浏览器是否支持canvas
 * param:							
 * return:
 * 		int ret:					true为支持，false为不支持
 */
function supports_canvas() {
    
  return !document.createElement('canvas').getContext;
}

