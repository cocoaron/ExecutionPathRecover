/**
 * PlayerPlayback 类负责回放界面的播放控制
 */
function PlayerPlayback() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(PlayerPlayback);

(function() {

    var _playingMode = EnumPBPlayState.IDLE;

    PlayerPlayback.setVolume = function(v) {
        $('#pb_sound_slider').slider2({
            "value": v
        });
        window.localStorage.setItem("/player/playback/volume", v);
    };

    PlayerPlayback.getVolume = function(v) {
        return $('#pb_sound_slider').slider2('value');
    };

    PlayerPlayback.init = function() {
        this.pbChannel_mode = 1;

        this.streamSel = 0;

        this.isSearching = false;

        // 选中的文件类型
        this.fileTypeSels = [];

        // 文件类型选择
        this.fileTypeSelIndex = 0;

        // 位置map
        this.chPositions = [];

        this.bcDatePicker;

        this.pbFileBarCanvas;

        this.trigger('init');

        this.initEvents();

        this.replayableDays = '0';

        this.initUI();

        ViewReplaySearch.init && ViewReplaySearch.init();

        delete this.init;
    };

    PlayerPlayback.initUI = function() {
        this.bcDatePicker = new BCDatePicker();
        g_bcDatePicker = this.bcDatePicker;
        this.bcDatePicker.initDatePicker();

        //
        this.pbFileBarCanvas = new PbFileBarCanvas();
        g_pbFileBarCanvas = this.pbFileBarCanvas;
        if (g_device) {
            this.pbFileBarCanvas.initPlaybackToolbar();
        }

        ControllerMain.on('resize', function() {
            setTimeout(function() {
                if (null == g_pbFileBarCanvas) {
                    return;
                }
                var canvas = document.getElementById("playback_toolbar_bg");
                if (null == canvas) {

                    return;
                }
                var content = document.getElementById("playbaack_toolbar_content");
                canvas.width = content.clientWidth;
                g_pbFileBarCanvas.redrawPlaybackTool();
                //zhengguishen add on 2016-6-29 12:22:43
                g_pbFileBarCanvas.initPlaybackToolbar();
            }, 50)
        });

        g_pbFileBarCanvas.mouse = { y: 20, x: 256 };

        $('#scroll-inc').on('click', function() {
            if (!g_pbFileBarCanvas.setScale(g_pbFileBarCanvas.getScale() + 1)) {
                return;
            }
            g_pbFileBarCanvas.autoScale();
            g_pbFileBarCanvas.redrawPlaybackTool();
        });

        $('#scroll-dec').on('click', function() {
            if (!g_pbFileBarCanvas.setScale(g_pbFileBarCanvas.getScale() - 1)) {
                return;
            }
            g_pbFileBarCanvas.autoScale();
            g_pbFileBarCanvas.redrawPlaybackTool();
        });

        $('#pb_button_pause').on('click', function() {
            PlayerPlayback.trigger('pauseAllStream');
            PlayerPlayback.updateState(EnumPBPlayState.PAUSED);
        });

        delete this.initUI;
    };

    PlayerPlayback.initEvents = function() {

        PlayerPlayback.streamSelectorTimerId = false;

        FPlayer.on('statechange', function(fplayer, newChannelStatus, newViewStatus) {
            if (FPlayer.getMode() != EnumViewStatus.PLAYBACK) {
                return;
            }
            switch (newViewStatus) {
                case EnumViewStatus.BUFFERING:
                case EnumViewStatus.PLAYING:
                    PlayerPlayback.updateState(EnumPBPlayState.PLAYING);
                    break;
                case EnumViewStatus.PAUSED:
                    PlayerPlayback.updateState(EnumPBPlayState.PAUSED);
                    break;
                case EnumViewStatus.ERROR:
                case EnumViewStatus.CLOSED:
                default:
                    PlayerPlayback.updateState(EnumPBPlayState.IDLE);
                    break;
            }
        });

        BcH5Player.on('statechange', function(BcH5Player, newChannelStatus, newViewStatus) {

            if (ChannelManager.get(0).getMode() != EnumViewStatus.PLAYBACK) {
                return;
            }
            switch (newViewStatus) {
                case EnumViewStatus.BUFFERING:
                case EnumViewStatus.PLAYING:
                    PlayerPlayback.updateState(EnumPBPlayState.PLAYING);
                    break;
                case EnumViewStatus.PAUSED:
                    PlayerPlayback.updateState(EnumPBPlayState.PAUSED);
                    break;
                case EnumViewStatus.ERROR:
                case EnumViewStatus.CLOSED:
                default:
                    PlayerPlayback.updateState(EnumPBPlayState.IDLE);
                    break;
            }
        });

        // 全部播放按钮
        $('#pb_button_start').on('click', function() {
            if ($('.popover-content #pb-stream-selector').length > 0) {
                return;
            }

            if (PlayerPlayback.streamSelectorTimerId) {
                clearInterval(PlayerPlayback.streamSelectorTimerId);
            }

            PlayerPlayback.streamSelectorTimerId = setInterval(function() {

                if (false === PlayerPlayback.streamSelectorTimerId) {
                    return;
                }

                if ($('#pb_button_start:hover').length == 1 || $('#pb-stream-selector .pb_play_start_pop_a:hover').length > 0) {
                    return;
                }

                if ($('.popover-content #pb-stream-selector').length > 0) {
                    $('#pb_button_start').click();
                }

                clearInterval(PlayerPlayback.streamSelectorTimerId);

                PlayerPlayback.streamSelectorTimerId = false;

            }, 3000);
        }).popover({
            html: true,
            trigger: "click",
            placement: 'top',
            content: function() {
                return $('#playback_play_popover').html();
            }
        });

        $("body").on("click", "a#pb_play_mainstream", function() {
            if($(this).hasClass('disabled')) {
                bc_alert(ControllerFlash.h265NotSupport, 'error');
                return;
            }
            PlayerPlayback.trigger('playAllStream', [EnumStreamType.CLEAR]);
        });

        $("body").on("click", "a#pb_play_substream", function() {
            if($(this).hasClass('disabled')) {
                bc_alert(ControllerFlash.h265NotSupport, 'error');
                return;
            }
            PlayerPlayback.trigger('playAllStream', [EnumStreamType.FLUENT]);
        });

        // 全部暂停按钮
        $("#pb_button_stop").click(function() {
            PlayerPlayback.trigger('stopAllStream');
            PlayerPlayback.resetState();
        });

        $("#pb_sound_slider").on("slidestart", function() {
            g_sliderIsMouseDown = true;
        });

        $("#pb_sound_slider").on("slidestop", function() {
            g_sliderIsMouseDown = false;
        });

        $("input[name=pb_type_checkbox_all]").on('click', function() {
            $("input[name=pb_type_checkbox_item]").prop("checked", $(this).is(":checked"));
            PlayerPlayback.updateFileTypeSels();
        });

        $("input[name=pb_type_checkbox_item]").on('click', function() {
            PlayerPlayback.updateFileTypeSels();
        });


        delete this.initEvents;
    };

    PlayerPlayback.on('dayChange', function() {
        ViewReplaySearch.searchFile(PlayerPlayback.bcDatePicker.getSearchDate());
    });

    PlayerPlayback.on('monthChange', function(year, month) {
        ViewReplaySearch.searchMonth(year, month);
    });

    PlayerPlayback.constructRTMPUrl = function(chId, filename, streamType) {
        var url = 'rtmp://' + window.location.hostname + ':' + ControllerFlash.rtmpPort + '/vod/' + filename.replace(/\//g, '%20');
        url += '?token=' + ControllerLogin.token;
        url += '&channel=' + chId;
        url += '&stream=' + EnumRTMPStreamType[streamType];
        console.dbg('PlayerPlayback.constructRTMPUrl: ', url);
        return url;
    };

    // PlayerPlayback.constructFlvUrl = function(filename, seekTo) {
    //     var port = window.location.port ? ':' + window.location.port : '';
    //     var url = window.location.protocol + '//' + window.location.hostname + port + 
    //         '/flv?port=' + ControllerFlash.rtmpPort + '&app=vod&stream=' + filename + '&token=' + ControllerLogin.token + '&start=' + seekTo;
    //     console.dbg('PlayerPlayback.constructFlvUrl: ', url);
    //     return url;
    // };

    PlayerPlayback.constructMP4Url = function(filename) {
        var url = '/cgi-bin/api.cgi?cmd=Playback&source=' + filename + '&output=' + filename + '&token=' + localStorage.getItem('token');
        console.dbg('PlayerPlayback.constructMP4Url: ', url);
        return url;
    };

    PlayerPlayback.reload = function() {

        PlayerPlayback.onInitPlaybackPop();

        //if (g_device.isIPC) {

        PlayerPlayback.pbChannel_mode = EnumPbChannelMode.ONE;
        $("#plabck_channels_views").hide();
        //} else {

        //    PlayerPlayback.pbChannel_mode = EnumPbChannelMode.FOUR;
        //    $("#plabck_channels_views").show();
        //}

        PlayerPlayback.pbFileBarCanvas.setChannelMode(PlayerPlayback.pbChannel_mode);

        for (var i = 0; i < 4; ++i) {

            PlayerPlayback.pbSetViewPositionWithChannel(i, -1);
        }

        PlayerPlayback.pbFileBarCanvas.initPlaybackToolbar();

        PlayerPlayback.bcDatePicker.initDatePicker();

        // init filetypeSel
        {
            if (PlayerPlayback.fileTypeSelIndex == 0) {

                $("input[name=pb_type_checkbox_all]").prop("checked", true);
                $("input[name=pb_type_checkbox_item]").prop("checked", true);
            } else {

                $("input[name=pb_type_checkbox_all]").prop("checked", false);
                $("input[name=pb_type_checkbox_item]").prop("checked", false);
                $("input[name=pb_type_checkbox_item]").eq(PlayerPlayback.fileTypeSelIndex - 1).prop("checked", true);
            }

            PlayerPlayback.updateFileTypeSels();
        }
    };

    PlayerPlayback.updateFileTypeSels = function() {
        PlayerPlayback.fileTypeSels.length = 0;

        $("input[name=pb_type_checkbox_item]").each(function() {

            if ($(this).prop("checked")) {

                PlayerPlayback.fileTypeSels.push(PlayerPlayback.getPbFileType($(this).val()));
            }
        });

        if (PlayerPlayback.fileTypeSels.length < 3) {

            $("input[name=pb_type_checkbox_all]").prop("checked", false);
        } else {

            $("input[name=pb_type_checkbox_all]").prop("checked", true);
        }
        PlayerPlayback.pbFileBarCanvas.setCanvasPositionArray(PlayerPlayback.chPositions);
    };

    PlayerPlayback.getPbFileType = function(selVal) {

        if ("Schedule" == selVal) {

            return EnumPbShowFileType.SCHEDULE;
        } else if ("Manual" == selVal) {

            return EnumPbShowFileType.MANUAL;
        } else if ("Alarm" == selVal) {

            return EnumPbShowFileType.ALARM;
        } else {

            return EnumPbShowFileType.ALL;

        }

    };

    PlayerPlayback.timelineDidSeekToDate = function(inDate) {
        ViewReplaySearch.seek(inDate);

    };


    PlayerPlayback.onInitPlaybackPop = function() {

        this.pbChangePlayStreamSel(PlayerPlayback.streamSel);
    };

    PlayerPlayback.pbChangePlayStreamSel = function(sel) {

        sel = parseInt(sel);

        clearInterval(PlayerPlayback.streamSelectorTimerId);
        PlayerPlayback.streamSelectorTimerId = false;

        $('#playback_play_popover .selected').removeClass('selected');
        if (EnumStreamType.CLEAR == sel) {

            $("#pb_play_mainstream").addClass('selected');

        } else if (EnumStreamType.FLUENT == sel) {

            $("#pb_play_substream").addClass('selected');
        }

        PlayerPlayback.streamSel = sel;
        ViewReplaySearch.setSelectedStream(sel);
    };


    PlayerPlayback.isFileTypeSel = function(file) {
        var i = 0;
        var isFound = false;
        for (i = 0; i < this.fileTypeSels.length; ++i) {

            if (file.type == this.fileTypeSels[i]) {

                isFound = true;
                return isFound;
            }
        }
        return isFound;
    };

    PlayerPlayback.pbSetViewPositionWithChannel = function(position, channelIndex) {
        // total is 4 positions
        if (position < 0 || position > 3) {

            return;
        }

        PlayerPlayback.chPositions[position] = channelIndex;
    };

    PlayerPlayback.getState = function() {
        return _playingMode;
    };

    PlayerPlayback.updateState = function(newState) {
        switch (newState) {
            case EnumPBPlayState.PLAYING:
                $('#pb_button_start').hide();
                $('#pb_button_pause').show();
                break;
            case EnumPBPlayState.IDLE:
            case EnumPBPlayState.PAUSED:
                $('#pb_button_start').show();
                $('#pb_button_pause').hide();
                break;
            default:
                throw {
                    "msg": "Unknown state found."
                };
        }
        _playingMode = newState;
    };

    PlayerPlayback.resetState = function() {
        this.updateState(EnumPBPlayState.IDLE);
        ViewReplaySearch.resetState();
    };

})();

/**
 * ViewReplaySearch 类负责 回放界面的 搜索控制
 */
function ViewReplaySearch() {
    throw { "msg": "Don't NEW a singleton." };
}

EventListener.apply(ViewReplaySearch);

(function() {

    var _selectedStream = EnumStreamType.CLEAR;
    var _status = 'idle';

    var _playingCursor = 0;

    var _replayableList = '0'.repeat(31);

    var _selectedDay = null;
    var _selectedMonth = null;

    var _monthSearchTaskId = null;
    var _daySearchTaskId = null;

    var _usingDay = null;
    var _usingMonth = null;
    var _isDirectlyPlayable = false;

    this.resetState = function() {
        _isDirectlyPlayable = false;
    };

    this.init = function() {

        this.waiter = new ViewWaiting({
            "id": "replay-wait-search",
            "text": "Searching files...",
            "cancel": function() {
                _status = 'idle';
                ViewReplaySearch.unbind('searchFileDone');
            }
        });

        delete this.init;
    };

    this.setSelectedStream = function(stream) {
        var old = _selectedStream;
        _selectedStream = stream;
        this.trigger('streamTypeChange', [old, stream]);
    };

    this.closeAllPlayer = function() {

        $(range(0, ChannelManager.getNumber() - 1)).each(function(j) {
            try {
                if ( flashCheck() ) {
                    FPlayer.close(j);
                } else {
                    BcH5Player.destroy();
                }
            } catch (e) {

            }
        });

        PlayerPlayback.updateState(EnumPBPlayState.IDLE);
    };

    this.on('streamTypeChange', function(oldType, newType) {

        if (ViewManager.getMode() != EnumCurState.PLAYBACK) {
            return;
        }
        if (newType != oldType) {
            _isDirectlyPlayable = false;
        }

        // 切换了码流，或者当前是停止状态（销毁了播放源），则需要重新构建播放源
        if (newType != oldType || PlayerPlayback.getState() == EnumPBPlayState.IDLE) {
            if (_isDirectlyPlayable) {
                if (this.firstSwitchedStream) {
                    this.seek(_playingCursor);
                } else {

                    this.firstSwitchedStream = true;
                }
            } else {
                this.closeAllPlayer();
                this.searchFile(_usingDay);
            }

        } else {
            var counter = 0;
            for (var i = 0; i < ChannelManager.getNumber(); i++) {
                var chObj = ChannelManager.get(i);
                if (chObj.getViewId() !== null) {
                    try {
                        if ( flashCheck() ) {
                            FPlayer.continuePlay(i);
                        } else {
                            BcH5Player.play();
                        }
                        counter++;
                    } catch (e) {

                    }
                }
            }

            if (counter) {
                PlayerPlayback.updateState(EnumPBPlayState.PLAYING);
            } else {
                PlayerPlayback.updateState(EnumPBPlayState.IDLE);
            }
        }

    });

    this.on('searchFileDone', function() {
        if (this.firstSwitchedStream) {
            this.seek(_playingCursor);
        } else {

            this.firstSwitchedStream = true;
        }
    });

    this.getSelectedStream = function() {
        return _selectedStream;
    };

    this.setSelectedDay = function(date) {
        _selectedDay = date;
    };

    this.getSelectedDay = function() {
        return _selectedDay;
    };

    this.isReplayableDay = function(date) {
        return _replayableList[date.getDate() - 1] == '1';
    };

    this.updateCursor = function(pos) {
        _playingCursor = new Date(pos * 1000 + _usingDay.getTime());
    };

    this.seek = function(datetime) {

        var counter = 0;

        _playingCursor = datetime;

        $(range(0, ChannelManager.getNumber() - 1)).each(function(j) {
            var files = g_device.channels[j].playbackFiles;
            var chObj = ChannelManager.get(j);
            var i = files.length - 1;
            if (!files) {
                return;
            }
            for (; i >= 0; --i) {
                var seekTo;
                if (files[i].startTime <= datetime && datetime <= files[i].endTime) {
                    seekTo = Math.round((datetime.getTime() - files[i].startTime) / 1000);
                } else if (i == 0 && files[i].startTime >= datetime) {
                    seekTo = 0;
                } else if (i > 0 && files[i].startTime >= datetime && files[i - 1].endTime <= datetime) {
                    seekTo = 0;
                }
                if (seekTo !== undefined) {
                    var sourceUrl;
                    if ( flashCheck() ) {
                        sourceUrl = PlayerPlayback.constructRTMPUrl(chObj.getId(), files[i].fileName, PlayerPlayback.streamSel);
                    } else {
                        sourceUrl = PlayerPlayback.constructMP4Url(files[i].fileName);
                    }
                    chObj.setReplayData(sourceUrl, seekTo);
                    break;
                }
            }
            if (i < 0 && chObj.getStatus() != EnumChannelStatus.CLOSED) {
                chObj.close();
            }

            try {
                chObj.playingFile = i;
                if ( i < 0 ) {
                    // 当天无文件时会报错执行close
                    if ( !flashCheck() ) {
                        BcH5Player.showStatusImg(EnumFlvStatus.nofile);
                    }
                    throw('no records');
                    // chObj.playingStart = (files[files.length - 1].endTime.getTime() - _usingDay.getTime()) / 1000;
                } else {
                    chObj.playingStart = (files[i].startTime.getTime() - _usingDay.getTime()) / 1000;
                }
                chObj.playingStream = _selectedStream;
                chObj.playingDay = _usingDay.getUnixDateOnly();
                if (seekTo !== undefined && i >= 0) {
                    chObj.open(PlayerPlayback.streamSel);
                    counter++;
                }
            } catch (error) {
                chObj.close();
            }


        });

        if (counter) {
            PlayerPlayback.updateState(EnumPBPlayState.PLAYING);
        } else {
            PlayerPlayback.updateState(EnumPBPlayState.IDLE);
        }
    };

    this.getUsingDay = function() {
        return _usingDay;
    };


    // push playback files into playbackFiles(an array) of current channel, after searchFileReceived
    this.on('searchFileReceived', function(resultList) {
        this.firstSwitchedStream = true;
        if (_status != 'searching') {
            return;
        }

        _usingDay = _selectedDay;

        for (var i = 0; i < resultList.length; ++i) {

            var ch = g_device.channels[i];
            var result = resultList[i];

            ch.playbackFiles = [];
            if (!result.File) {
                continue;
            }

            for (var x = 0; x < result.File.length; ++x) {

                var f = result.File[x];

                ch.playbackFiles.push(new FileInfo(0, f.name, new Date(
                    f.StartTime.year,
                    f.StartTime.mon - 1,
                    f.StartTime.day,
                    f.StartTime.hour,
                    f.StartTime.min,
                    f.StartTime.sec
                ), new Date(
                    f.EndTime.year,
                    f.EndTime.mon - 1,
                    f.EndTime.day,
                    f.EndTime.hour,
                    f.EndTime.min,
                    f.EndTime.sec
                ), f.size, EnumPbShowFileType.SCHEDULE, f.type));

            }
        }

        PlayerPlayback.pbFileBarCanvas.redrawPlaybackTool();

        this.trigger('searchFileDone');

        _isDirectlyPlayable = true;

    });

    this.on('searchFile', function(id) {

        this.waiter.show();

        this.closeAllPlayer();

        var startTime = {
            "year": _selectedDay.getFullYear(),
            "mon": _selectedDay.getMonth() + 1,
            "day": _selectedDay.getDate(),
            "hour": 0,
            "min": 0,
            "sec": 0
        };

        var endTime = {
            "year": _selectedDay.getFullYear(),
            "mon": _selectedDay.getMonth() + 1,
            "day": _selectedDay.getDate(),
            "hour": 23,
            "min": 59,
            "sec": 59
        };

        var prs = [];
        _status = 'searching';

        PlayerPlayback.pbFileBarCanvas.setSearchStartTime(_selectedDay);

        $(range(0, ChannelManager.getNumber() - 1)).each(function(i) {
            if (ChannelManager.get(i) && ChannelManager.get(i).getViewId() !== null)
                prs.push(new Promise(function(onOk, onFailed) {
                    CGI.sendCommand('Search', {
                        "Search": {
                            "channel": i,
                            "onlyStatus": 0,
                            "streamType": EnumStreamFullNames[_selectedStream],
                            "StartTime": startTime,
                            "EndTime": endTime
                        }
                    }, function(data) {
                        onOk(data.SearchResult);
                    }, onFailed, 0, function() {
                        ViewReplaySearch.waiter.cancel();
                        ViewReplaySearch.waiter.hide();
                    }, 16000);
                }));
        });

        Promise.all(prs).then(function(vals) {
            if (_daySearchTaskId === id) {
                ViewReplaySearch.trigger('searchFileReceived', [vals]);
                _playingCursor = new Date(_selectedDay.getTime() + g_pbFileBarCanvas.curTimeSecond * 1000);
            }
            ViewReplaySearch.waiter.hide();
            _status = 'idle';
        }, function() {
            _status = 'idle';
            ViewReplaySearch.waiter.hide();
            bc_alert('Failed to search records.', 'error');
        });

    });

    this.searchFile = function(date, refresh) {

        console.dbg('Playback: Cursor =', _playingCursor)
        // search 已有loading弹窗，播放器此时不显示任何状态
        if ( !flashCheck() ) {
            BcH5Player.showStatusImg(EnumFlvStatus.normal);
        }

        _playingCursor = 0;
        _selectedDay = new Date(date);

        _selectedDay.setHours(0);
        _selectedDay.setMinutes(0);
        _selectedDay.setSeconds(0);
        _selectedDay.setMilliseconds(0);
        _daySearchTaskId = String.random(32);
        ViewReplaySearch.trigger('searchFile', [_daySearchTaskId]);
    };

    this.on('searchMonth', function(year, month, id) {

        var prs = [];

        if (!ViewReplaySearch.isFirstVisited) {
            ViewReplaySearch.isFirstVisited = 1;
        }

        $(range(0, ChannelManager.getNumber() - 1)).each(function(i) {
            if (ChannelManager.get(i))
                prs.push(new Promise(function(onOk, onFailed) {
                    CGI.sendCommand('Search', {
                        "Search": {
                            "channel": i,
                            "onlyStatus": 1,
                            "streamType": EnumStreamFullNames[_selectedStream],
                            "StartTime": {
                                "year": year,
                                "mon": month,
                                "day": 1,
                                "hour": 0,
                                "min": 0,
                                "sec": 0
                            },
                            "EndTime": {
                                "year": year,
                                "mon": month,
                                "day": getDaysBayYearAndMonth(year, month),
                                "hour": 23,
                                "min": 59,
                                "sec": 59
                            }
                        }
                    }, function(data) {
                        onOk(data.SearchResult);
                    }, function(cmd, errno, msg) {
                        onFailed({
                            "cmd": cmd,
                            "errno": errno,
                            "msg": msg
                        });
                    }, false, undefined, 16000);
                }));
        });

        Promise.all(prs).then(function(vals) {

            if (_monthSearchTaskId != id) {
                return;
            }

            _replayableList = '0'.repeat(getDaysBayYearAndMonth(year, month)).split('');
            var replayList = [];
            for (var i in vals) {
                if (vals[i] && vals[i].Status && vals[i].Status[0]) {
                    var status = vals[i].Status[0];
                    if (status.mon == month && status.year == year) {
                        for (var i = 0; i < _replayableList.length; i++) {
                            if (status.table[i] == '1') {
                                _replayableList[i] = 1;
                            }
                        }
                    }
                }
            }

            for (var i = 0; i < _replayableList.length; i++) {
                if (_replayableList[i] == 1) {
                    replayList.push(new Date(year, month - 1, i + 1));
                }
            }

            g_bcDatePicker.refreshCanReplayList(replayList);

            // auto search today when first entering
            if ((ViewReplaySearch.isFirstVisited == 1 && _replayableList[PlayerPlayback.bcDatePicker.getSearchDate().getDate() - 1] == 1) || ViewReplaySearch.isFirstVisited == 3) {
                ViewReplaySearch.isFirstVisited = 2;
                setTimeout(function() {
                    ViewReplaySearch.searchFile(PlayerPlayback.bcDatePicker.getSearchDate());
                }, 500);
            } else {
                if ( !flashCheck() ) {
                    BcH5Player.showStatusImg(EnumFlvStatus.nofile);
                }
                ViewReplaySearch.waiter.hide();
            }

            _usingMonth = _selectedMonth;

        }, function(e) {

            if (_monthSearchTaskId != id) {
                return;
            }
            ViewReplaySearch.waiter.hide();

            CGI.autoErrorHandler(e.cmd, e.errno, e.msg);
        });
    });

    this.searchMonth = function(year, month) {

        _selectedMonth = year + '-' + month;
        _monthSearchTaskId = String.random(32);

        (function(selMonth, id, ext) {
            setTimeout(function() {
                if (id == _monthSearchTaskId && selMonth == _selectedMonth && ViewManager.getMode() == EnumCurState.PLAYBACK) {
                    ext.push(id);
                    ViewReplaySearch.trigger('searchMonth', ext);
                }
            }, 500);
        })(_selectedMonth, _monthSearchTaskId, [year, month]);

    };

}).apply(ViewReplaySearch);
