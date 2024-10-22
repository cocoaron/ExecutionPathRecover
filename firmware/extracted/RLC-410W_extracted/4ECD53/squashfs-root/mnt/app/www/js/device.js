/**
 * Device class
 *
 *
 */

function Device() {
    
    this.language = "";
    this.uid = "";
    this.hostName = "";
    this.port = "";
    this.userName = "";
    this.password = "";
    this.streamType = "";
    this.loginType = "IP"
    this.deviceName = "";
    this.channelCount = 0;
    this.channels = new Array();
    this.ptzMode = 0;
    this.isIPC = false;
    this.canReplay = true;
    this.canReplaySubStream = false;
}

Device.prototype.refreshChannels = function() {
    
    this.channels.length = 0;
    
    for(var i = 0; i < this.channelCount; ++ i) {
        var channel = new ChannelInfo(i, false, false);
        this.channels.push(channel);
    }
}
