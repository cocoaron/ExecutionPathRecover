// JavaScript Document

function _FileInfo() {
    this.channelIndex = -1;
	this.fileName = 0;
	this.startTime = 0;
	this.endTime = 0;
	this.type = 0;
    this.duration = 0;
}


function FileInfo(iChannelIndex, iFileName, iStartTime, iEndTime, iFileSize, iType, streamType) {
    this.channelIndex = iChannelIndex;
	this.fileName = iFileName;
	this.startTime = iStartTime;
	this.endTime = iEndTime;
	this.type = iType;
    this.duration = iEndTime.getTime() - iStartTime.getTime();
    this.streamType = streamType;
	this.size = iFileSize;
}
