/*
 * Channel class
 *
 *
 */

function _Channel() {

    this.index = 0;
    this.isPreviewSel = false;
    this.isPlaybackSel = false;
    this.playbackFiles = new Array()
    
}

function ChannelInfo(index, isPreviewSel, isPlaybackSel) {
    
    this.index = index;
    this.isPreviewSel = isPreviewSel;
    this.isPlaybackSel = isPlaybackSel;
    this.data = {
    };
    this.limits = {
    };
    this.initials = {
    };
    this.playbackFiles = [];
}