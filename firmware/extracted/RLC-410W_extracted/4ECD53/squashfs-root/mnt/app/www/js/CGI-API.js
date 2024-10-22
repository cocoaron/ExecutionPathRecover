/**
 * class CGI
 * 提供远程配置的访问接口。
 */
function CGI() {
    throw { "msg": "Don't NEW a singleton," };
}

EventListener.apply(CGI);


(function() {
    var _cgi_logined = false;
    var _location = 'LOGIN';
    CGI.login = function() {
        _cgi_logined = true;
    };
    CGI.isLogined = function() {
        return _cgi_logined;
    };

    CGI.setLocation = function(loc) {
        _location = loc;
    };

    CGI.getLocation = function() {
        return _location;
    };

    /**
     * 本方法用于发送单条命令请求。
     */
    CGI.sendCommand = function(cmd, param, onSuccess, onFailed, action, onTimeout, timeout) {
        if (action === undefined) { action = 0; } else { action = 1; }
        if (!timeout) { timeout = 15000; }
        (function(loc) {
            $.ajax({ /* Reboot request with no response. */
                "url": "cgi-bin/api.cgi?cmd=" + cmd + "&token=" + localStorage.getItem('token'),
                "type": "POST", // debug with GET method.
                "contentType": "application/json",
                "timeout": timeout,
                "data": JSON.stringify([{
                    "cmd": cmd,
                    "action": action,
                    "param": param
                }]),
                "success": function(data) {
                    if (CGI.getLocation() != loc) {
                        return;
                    }
                    try {
                        data = JSON.parse(data);
                        if (data[0]) {
                            if (data[0].cmd == cmd) {
                                if (data[0].code == 0) {
                                    if (action) {
                                        onSuccess(data[0].value, data[0].range, data[0].initial);
                                    } else {
                                        onSuccess(data[0].value);
                                    }
                                    delete data[0];
                                } else {
                                    if (CGI.isLogined() && (data[0].error.rspCode == -6 || data[0].error.rspCode == -27)) {
                                        bc_alert('Login expired, for security reason, please login again.', 'error');
                                        setTimeout(function() {
                                            ControllerMain.onLogout();
                                        }, 3000);
                                    } else {
                                        onFailed(data[0].cmd, data[0].error.rspCode, data[0].error.detail);
                                    }
                                }
                            } else {
                                onFailed(data[0].cmd, 0xffffffff, 'Device responsed a wrong command result.');
                            }
                        } else {
                            onFailed(data[0].cmd, 0xfffffffe, 'Device responsed a result in wrong format.');
                        }
                    } catch (e) {
                        onFailed(cmd, 0xfffffffc, 'Failed to parse the data from device.');
                        return;
                    }
                },
                "error": function(e) {
                    if (e && e.statusText == 'timeout') {
                        if (onTimeout && typeof onTimeout === 'function') {
                            //存在且是function
                            onTimeout();
                        } else {
                            onFailed(cmd, 0xfffffffb, 'Network timeout.');
                        }
                        return;
                    }
                    if (CGI.getLocation() != loc) {
                        return;
                    }
                    onFailed(cmd, 0xfffffffd, 'Network connection failure.');
                },
                "complete": function(XHR, TS) {
                    XHR = null;
                }
            });
        })(this.getLocation());
    };

    /**
     * 本方法用于发送单条Set命令请求。
     * @TODO 仅用于DEBUG!!!!
     */
    CGI.sendSetCommand = CGI.sendCommand;

    CGI.cmds = [];

    CGI.clearCommands = function() {
        this.cmds = [];
    };

    CGI.prepareCommand = function(cmd, param, action) {

        if (action === undefined) { action = 0; } else { action = 1; }

        this.cmds.push(JSON.stringify({
            "cmd": cmd,
            "action": action,
            "param": param
        }));
    };

    CGI.operatorErrorHandler = function(msg) {
        if (!msg) {
            msg = ' Error:<br>Operation failed due to unknown reason.';
        }else{
            msg = ' Error:<br>' + msg; 
        }

        bc_alert(msg, 'error');

    };

    CGI.autoErrorHandler = function(cmd, errno, msg) {
        var msg = EnumCGIError[errno];
        if (!msg) {
            msg = cmd + ' Error(' + errno + '):<br>Operation failed due to unknown reason.';
        }
        bc_alert(msg, 'error');

        console.dbg('-------- Error Begin --------');
        console.dbg('Command: ', cmd);
        console.dbg('Code:    ', errno);
        console.dbg('Detail:  ', msg);
        console.dbg('--------- Error End ---------');
    };

    CGI.commitCommands = function(onSuccess, onFailed, onAllDone, onTimeout, timeout) {
        if (!timeout) { timeout = 15000; }
        (function(loc) {
            $.ajax({
                "url": "cgi-bin/api.cgi?token=" + localStorage.getItem('token'),
                "type": "POST",
                "contentType": "application/json",
                "data": '[' + CGI.cmds.join(',') + ']',
                "timeout": timeout,
                "success": function(data) {
                    if (CGI.getLocation() != loc) {
                        return;
                    }
                    try {
                        data = JSON.parse(data);
                        var len = data.length;
                        for (var i = 0; i < len; ++i) {

                            if (data[i]) {
                                if (data[i].code == 0) {
                                    onSuccess(data[i].cmd, data[i].value, data[i].range, data[i].initial);
                                } else {
                                    if (CGI.isLogined() && (data[i].error.rspCode == -6 || data[i].error.rspCode == -27)) {
                                        bc_alert('Login expired, for security reason, please login again.', 'error');
                                        setTimeout(function() {
                                            ControllerMain.onLogout();
                                        }, 2000);
                                    } else {
                                        onFailed(data[i].cmd, data[i].error.rspCode, data[i].error.detail);
                                    }
                                }
                            } else {
                                onFailed(data[i].cmd, 0xfffffffe, 'Device responsed a result in wrong format.');
                            }
                        }
                        if (onAllDone !== undefined) {
                            onAllDone();
                        }
                    } catch (e) {
                        onFailed('?', 0xfffffffc, 'Failed to parse the data from device.');
                        return;
                    }
                },
                "error": function(e) {
                    if (e && e.statusText == 'timeout') {
                        if (onTimeout && typeof onTimeout === 'function') {
                            //存在且是function
                            onTimeout();
                        } else {
                            onFailed('?', 0xfffffffb, 'Network timeout.');
                        }
                        return;
                    }
                    if (CGI.getLocation() != loc) {
                        return;
                    }
                    onFailed('?', 0xfffffffd, 'Network connection failure.');
                },
                "complete": function(XHR, TS) {
                    XHR = null
                }
            });
        })(this.getLocation());
    };

})();