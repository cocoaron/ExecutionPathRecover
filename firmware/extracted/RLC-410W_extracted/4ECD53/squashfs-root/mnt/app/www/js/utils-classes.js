
/**
 * class WebLoader
 * 用于异步加载资源
 */
function WebLoader(onOkay, onFail) {
    var _cnt = 0;
    var _completed = 0;
    var _vars = {};

    this.onOkay = onOkay;
    this.onFail = onFail;

    this.fail = function(data) {
        this.onFail && this.onFail(data);
        this.onFail = undefined;
        return this;
    };

    this.success = function () {
        _completed++;
        if (_completed == _cnt) {
            this.onOkay && this.onOkay(_vars);
            this.onOkay = undefined;
        }
        return this;
    };

    this.regVar = function (n, v) {
        _vars[n] = v;
        return this;
    };

    this.listen = function (fn) {
        _cnt++;
        fn(this);
        return this;
    };

    this.loadAjax = function (dataId, ajaxCfg) {
        var loader = this;
        ajaxCfg.success = function (dat) {
            loader.regVar(dataId, dat);
            loader.success();
        };
        ajaxCfg.error = function (e) {
            loader.fail(dataId);
        };
        ajaxCfg.dataType = 'text';
        ajaxCfg.complete = function(XHR, TS) { XHR = null; };
        $.ajax(ajaxCfg);
        _cnt++;
        return this;
    };

    this.loadCSS = function (dataId, url) {

        var loader = this;

        var tag = document.createElement('link');
        tag.href = url;
        tag.rel = 'stylesheet';
        tag.type = 'text/css';
        tag.id = dataId;
        tag.onload = tag.onreadystatechange = function() {

            if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {

                loader.success();

            } else {

                loader.fail();
            }
        };

        document.getElementsByTagName('head')[0].appendChild(tag);

        _cnt++;
        return this;
    };

}

function EventListener() {
    var _eventList = {};

    /**
     * Bind a function as an event listener.
     */
    this.on = function(e, fn) {
        if (!_eventList[e]) {
            _eventList[e] = [];
        }
        _eventList[e].push(fn);
        return this;
    };

    /**
     * Unbind an event's listeners.
     */
    this.unbind = function(e) {
        _eventList[e] = [];
        return this;
    };

    /**
     * Invoke an event.
     */
    this.trigger = function(e, args) {
        var elist = _eventList[e];

        if (!elist) {
            return this;
        }

        for ( var i in elist) {
            if (elist[i].apply(this, args) === false)
                break;
        }

        return this;
    };

    /**
     * Invoke an event in async way.
     */
    this.asyncTrigger = function(e, args) {
        var elist = _eventList[e];

        if (!elist) {
            return this;
        }

        (function(elist, obj, args) {
            setTimeout(function() {
                for ( var i in elist) {
                    if (elist[i].apply(obj, args) === false)
                        break;
                }
            }, 0);
        })(elist, this, args);

        return this;
    };
}
