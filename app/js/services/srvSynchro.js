
angular.module('srvSynchro', [])

.factory('srvSynchro',  function ($q, srvDataTransfer, srvFileTransfer, $exceptionHandler, srvRunning, srvLocalStorage, srvSecurity) {
  return new SrvSynchro($q, srvDataTransfer, srvFileTransfer, $exceptionHandler, srvRunning, srvLocalStorage, srvSecurity);
});



/**
 * Synchronization Service, which send HTTP requests or files as soon as possible,
 * in same order as user has asked them.
 * User can pause and resume this service when he knows that a network is ready or not.
 *
 * For each request/file to send, many events are triggered :
 *   N start and (N-1) error and 1 success,
 *   or, N start and (N-1) or N error and 1 cancel.
 * Each try on request/file will trigger 1 start event :
 * Each try on request/file will trigger 1 error event if error, or 1 cancel event, or else 1 success event.
 * If user cancel this request/file, then he will trigger 1 cancel event, or else he will retry this request/file.
 * In case of error, a retry is done infinitely on the same request/file until success or cancel.
 */
var SrvSynchro = (function() {
    'use strict';
    function Service(qService, srvDataTransfer, srvFileTransfer, exceptionHandlerService, srvRunning, srvLocalStorage, srvSecurity) {
        this.q = qService;
        this.dataTransfer = srvDataTransfer;
        this.fileTransfer = srvFileTransfer;
        this.exceptionHandler = exceptionHandlerService;
        this.srvRunning = srvRunning;
        this.srvLocalStorage = srvLocalStorage;
        this.srvSecurity = srvSecurity;
        this.pingUrl = '';
        this.pinging = false;
        this.initDone = false;

        this.synchroState = Service.READY;
        this.serverState = Service.READY;
        this.pendingRequests = [];
        this.requestHandle = 0;
        this.callbacksStart = [];
        this.callbacksError = [];
        this.callbacksCancel = [];
        this.callbacksSuccess = [];
        this.callbackHandle = 0;

        this.TRY_COUNTMAX = 3;
    }
    Service.READY = 1;
    Service.SENDING = 2;
    Service.PAUSE = 3;


    //Start the service
    Service.prototype.init = function () {
        if (this.initDone) return;
        //this.pendingRequests = this.srvLocalStorage.get('SrvSynchro-requests', []);
        //if (this.pendingRequests.length > 0) {
        //    this.requestHandle = this.pendingRequests[this.pendingRequests.length-1].id;
        //} else {
        //    this.requestHandle = 0;
        //}
        var self = this;
        this.onlineHandle = this.srvRunning.addListenerOnOnline(function(callbackId, isOnline) {
            if (isOnline) {
                resume(self);
            } else {
                pause(self);
            }
        });
        if (this.srvRunning.online) {
            a4p.InternalLog.log('srvSynchro', "start as ready");
            this.synchroState = Service.READY;
        } else {
            a4p.InternalLog.log('srvSynchro', "start in pause");
            this.synchroState = Service.PAUSE;
        }
        this.serverState = Service.READY;
        this.initDone = true;
        a4p.InternalLog.log('srvSynchro', "initialized");
        //sendNextRequest(this);
    };

    // Stop the service
    Service.prototype.reset = function () {
        if (!this.initDone) return;
        this.srvRunning.cancelListener(this.onlineHandle);
        //this.initDone = false;
        this.synchroState = Service.READY;
        this.serverState = Service.READY;
        //this.srvLocalStorage.set('SrvSynchro-requests', this.pendingRequests ); ???
    };

    /**
     * Give an URL to use to check resume() by requesting a "ping" on the C4P Server.
     * This is needed to take into account maintenance of C4P Server : database or source updates
     *
     * @param pingUrl
     */
    Service.prototype.setPingUrl = function (pingUrl) {
        this.pingUrl = pingUrl;
        checkServerStatus(this);
    };


    Service.prototype.addListenerOnStart = function (channel, fct) {
        this.callbackHandle++;
        this.callbacksStart.push({id:this.callbackHandle, channel:channel, callback:fct});
        return this.callbackHandle;
    };
    Service.prototype.addListenerOnError = function (channel, fct) {
        this.callbackHandle++;
        this.callbacksError.push({id:this.callbackHandle, channel:channel, callback:fct});
        return this.callbackHandle;
    };
    Service.prototype.addListenerOnCancel = function (channel, fct) {
        this.callbackHandle++;
        this.callbacksCancel.push({id:this.callbackHandle, channel:channel, callback:fct});
        return this.callbackHandle;
    };
    Service.prototype.addListenerOnSuccess = function (channel, fct) {
        this.callbackHandle++;
        this.callbacksSuccess.push({id:this.callbackHandle, channel:channel, callback:fct});
        return this.callbackHandle;
    };
    Service.prototype.cancelListener = function (callbackHandle) {
        if (removeIdFromList(this.callbacksStart, callbackHandle) === false) {
            if (removeIdFromList(this.callbacksError, callbackHandle) === false) {
                if (removeIdFromList(this.callbacksCancel, callbackHandle) === false) {
                    return (removeIdFromList(this.callbacksSuccess, callbackHandle) !== false);
                }
            }
        }
        return true;
    };
    function triggerStart(self, request) {
        var callbacks = self.callbacksStart.slice(0);// Copy to be independant of updates
        for (var idx = 0, max = callbacks.length; idx < max; idx++) {
            if (request.channel != callbacks[idx].channel) continue;
            try {
                callbacks[idx].callback(callbacks[idx].id, request.id, request.ctx, request.nbTry);
            } catch (e) {
                self.exceptionHandler(e, "SrvSynchro.callbacksStart#" + idx);
            }
        }
    }
    function triggerCancel(self, request) {
        var callbacks = self.callbacksCancel.slice(0);// Copy to be independant of updates
        for (var idx = 0, max = callbacks.length; idx < max; idx++) {
            if (request.channel != callbacks[idx].channel) continue;
            try {
                callbacks[idx].callback(callbacks[idx].id, request.id, request.ctx, request.nbTry);
            } catch (e) {
                self.exceptionHandler(e, "SrvSynchro.callbacksCancel#" + idx);
            }
        }
    }
    function triggerError(self, request, message) {
        var callbacks = self.callbacksError.slice(0);// Copy to be independant of updates
        for (var idx = 0, max = callbacks.length; idx < max; idx++) {
            if (request.channel != callbacks[idx].channel) continue;
            try {
                callbacks[idx].callback(callbacks[idx].id, request.id, request.ctx, request.nbTry, message);
            } catch (e) {
                self.exceptionHandler(e, "SrvSynchro.callbacksError#" + idx);
            }
        }
    }
    function triggerSuccess(self, request, responseCode, responseData, responseHeaders) {
        var callbacks = self.callbacksSuccess.slice(0);// Copy to be independant of updates
        for (var idx = 0, max = callbacks.length; idx < max; idx++) {
            if (request.channel != callbacks[idx].channel) continue;
            try {
                callbacks[idx].callback(callbacks[idx].id, request.id, request.ctx, request.nbTry,
                    responseCode, responseData, responseHeaders);
            } catch (e) {
                self.exceptionHandler(e, "SrvSynchro.callbacksSuccess#" + idx);
            }
        }
    }

    Service.prototype.addRequest = function (channel, ctx, url, method, params, headers) {
        this.requestHandle++;
        if ((typeof(ctx) == 'undefined') || (!ctx)) {
            throw new Error("SrvSynchro.send requires a ctx parameter");
        }
        if ((typeof(url) == 'undefined') || (!url)) {
            throw new Error("SrvSynchro.send requires a url parameter");
        }
        if ((typeof(method) == 'undefined') || (!method)) {
            throw new Error("SrvSynchro.send requires a method parameter");
        }
        if (typeof(params) == 'undefined') params = null;
        if (typeof(headers) == 'undefined') headers = null;
        var request = {
            id:this.requestHandle,
            channel:channel,
            ctx:ctx,
            url:url,
            method:method,
            params:params,
            headers:headers,
            nbTry:0
        };
        this.pendingRequests.push(request);
        //this.srvLocalStorage.set('SrvSynchro-requests', this.pendingRequests);
        sendNextRequest(this);
        return this.requestHandle;
    };
    Service.prototype.addFileRequest = function (channel, ctx, url, method, params, filePath, headers, options) {

        a4p.InternalLog.log('srvSynchro','addFileRequest '+channel+' url:'+url);
        this.requestHandle++;
        if ((typeof(ctx) == 'undefined') || (!ctx)) {
            throw new Error("SrvSynchro.send requires a ctx parameter");
        }
        if ((typeof(url) == 'undefined') || (!url)) {
            throw new Error("SrvSynchro.send requires a url parameter");
        }
        if ((typeof(method) == 'undefined') || (!method)) {
            throw new Error("SrvSynchro.send requires a method parameter");
        }
        if (typeof(params) == 'undefined') params = null;
        if (typeof(headers) == 'undefined') headers = null;
        var request = {
            id:this.requestHandle,
            channel:channel,
            ctx:ctx,
            url:url,
            method:method,
            params:params,
            filePath:filePath,
            headers:headers,
            options:options,
            nbTry:0
        };
        this.pendingRequests.push(request);
        //this.srvLocalStorage.set('SrvSynchro-requests', this.pendingRequests);
        sendNextRequest(this);
        return this.requestHandle;
    };
    Service.prototype.cancelRequest = function (requestToCancel) {
        for (var idx = this.pendingRequests.length - 1; idx >= 0; idx--) {
            if (this.pendingRequests[idx].id == requestToCancel.id) {
                var request = this.pendingRequests[idx];
                this.pendingRequests.splice(idx, 1);
                //this.srvLocalStorage.set('SrvSynchro-requests', this.pendingRequests);
                triggerCancel(this, request);
                if (idx === 0) {
                    sendNextRequestWithTimer(this);
                }
                return true;
            }
        }
        return false;
    };
    Service.prototype.clearChannel = function (channel) {
        var found = false;
        var firstRemoved = false;
        for (var idx = this.pendingRequests.length - 1; idx >= 0; idx--) {
            if (this.pendingRequests[idx].channel == channel) {
                var request = this.pendingRequests[idx];
                this.pendingRequests.splice(idx, 1);
                //this.srvLocalStorage.set('SrvSynchro-requests', this.pendingRequests);
                triggerCancel(this, request);
                if (idx === 0) firstRemoved = true;
                found = true;
            }
        }
        if (firstRemoved) {
          sendNextRequestWithTimer(this);
        }
        return found;
    };
    Service.prototype.nbPendingRequests = function () {
        return this.pendingRequests.length;
    };
    Service.prototype.tryAgainCurrentRequest = function () {
        this.tryAgain = true;
    };

    /**
     * Force this Service to be onPause
     * and, if pingUrl is NOT empty, check C4P Server status before returning to onResume
     */
    Service.prototype.serverHs = function () {
        if (this.serverState == Service.PAUSE) return;
        a4p.InternalLog.log('srvSynchro', "serverState pause");
        this.serverState = Service.PAUSE;
        if (this.synchroState == Service.READY) {
            checkServerStatus(this);
        }
    };
    /**
     * Force this Service to be onResume (needed ONLY if pingUrl is empty)
     */
    Service.prototype.serverOk = function () {
        if (this.serverState != Service.PAUSE) return;
        a4p.InternalLog.log('srvSynchro', "serverState resume");
        this.serverState = Service.READY;
        if (this.synchroState == Service.READY) {
            // this.synchroState AND this.serverState MUST BE READY
            sendNextRequest(this);
        }
    };
    function pause(self) {
        if (self.synchroState == Service.PAUSE) return;
        a4p.InternalLog.log('srvSynchro', "state pause");
        self.synchroState = Service.PAUSE;
    }
    function resume(self) {
        if (self.synchroState != Service.PAUSE) return;
        a4p.InternalLog.log('srvSynchro', "state resume");
        self.synchroState = Service.READY;
        if (self.serverState == Service.READY) {
            // self.synchroState AND self.serverState MUST BE READY
            sendNextRequest(self);
        } else {
            // We will check C4P Server maintenance before doing resume()
            checkServerStatus(self);
        }
    }

    function checkServerStatus(self) {
        // Useless to check if not in right state
        if (self.serverState == Service.READY) return;
        if (self.synchroState != Service.READY) return;
        // Useless to check if no URL
        if (self.pingUrl.length <= 0) return;
        // Useless to check if already doing
        if (self.pinging) return;

        self.pinging = true;
        var fctOnHttpSuccess = function (response) {
            //response.data, response.status, response.headers
            if (a4p.isUndefined(response.data)) {
                setTimeout(function () {
                    self.pinging = false;
                    checkServerStatus(self);
                }, 60000);
                return;
            }

            var responseOk = response.data.responseOK;
            if (a4p.isUndefined(responseOk) || !responseOk) {
                // Server does not send its OK status => we wait for 1 minute
                setTimeout(function () {
                    self.pinging = false;
                    checkServerStatus(self);
                }, 60000);
                return;
            }
            // Server is now READY
            self.pinging = false;
            self.serverOk();
        };
        var fctOnHttpError = function (response) {
            //response.data, response.status, response.headers
            // Server is not here => we wait for 1 minute
            setTimeout(function () {
                self.pinging = false;
                checkServerStatus(self);
            }, 60000);
        };
        a4p.InternalLog.log('srvSynchro', "pinging server");
        self.dataTransfer.recvData(self.pingUrl).then(fctOnHttpSuccess, fctOnHttpError);
    }

    function sendNextRequestWithTimer(self) {
        // Send next request only in 0.1 second
        var sendNextFct = function() {
          sendNextRequest(self);
        };
        setTimeout(sendNextFct, 100);
    }

    function sendNextRequest(self) {

        a4p.InternalLog.log('srvSynchro','sendNextRequest');
        // Useless to check if not in right state
        if (!self.initDone) return;
        if (self.serverState != Service.READY) return;
        if (self.synchroState != Service.READY) return;
        if (self.pendingRequests.length <= 0) return;

        self.synchroState = Service.SENDING;
        var request = self.pendingRequests[0];
        request.nbTry++;
        var requestId = request.id;
        a4p.InternalLog.log('srvSynchro','sendNextRequest after check with data: '+a4pDumpData(request, 2));


        var fctOnHttpSuccess = function (response) {
            a4p.InternalLog.log('srvSynchro','sendNextRequest success : '+response.status+' : '+response.data);
            //response.data, response.status, response.headers
            var request = self.pendingRequests[0];
            self.tryAgain = false;
            if (a4p.isDefined(request) && (requestId == request.id)) {

                // Any listener can estimate this is a failure by calling tryAgainCurrentRequest()
                triggerSuccess(self, request, response.status, response.data, response.headers);
                if (self.synchroState != Service.PAUSE) {
                    self.synchroState = Service.READY;
                    if (self.serverState != Service.READY) {
                        checkServerStatus(self);
                    }
                }
                if (self.tryAgain) {
                    if (request.nbTry <= self.TRY_COUNTMAX) {
                        // User estimates this is a failure : he has called tryAgainCurrentRequest()
                        // Retry this request only in some seconds : 1, 4, 9, 16, 25, 36, 49, etc.
                        setTimeout(function () {
                            sendNextRequest(self);
                        }, 1000*request.nbTry*request.nbTry);
                    } else {
                        self.cancelRequest(request);
                    }

                } else {
                    // Next request
                    self.pendingRequests.shift();
                    sendNextRequestWithTimer(self);
                }
            } else {
                // cancel already done
                if (self.synchroState != Service.PAUSE) {
                    self.synchroState = Service.READY;
                    if (self.serverState != Service.READY) {
                        checkServerStatus(self);
                    }
                }
                // Send next request
                sendNextRequestWithTimer(self);
            }
        };
        var fctOnHttpError = function (response) {
            a4p.InternalLog.log('srvSynchro','sendNextRequest error : '+response.status+' : '+response.data);
            //response.data, response.status, response.headers
            var request = self.pendingRequests[0];
            if (a4p.isDefined(request) && (requestId == request.id)) {
                // error
                // data contains the error message
                triggerError(self, request, response.data);
                if (self.synchroState != Service.PAUSE) {
                    self.synchroState = Service.READY;
                    if (self.serverState != Service.READY) {
                        checkServerStatus(self);
                    }
                }

                a4p.InternalLog.log('srvSynchro','sendNextRequest retry : '+request.id+' # '+request.nbTry);
                if (request.nbTry > self.TRY_COUNTMAX) {// We CANCEL automatically after 3 tries

                    //MLE why not ?
                    self.cancelRequest(request);

                    //MLE if ((self.pendingRequests.length > 0) && (self.pendingRequests[0].id == requestId)) {
                    //MLE     self.pendingRequests.splice(0, 1);
                    //MLE }
                    // Send next request only in 0.1 second
                    //MLE setTimeout(function () {
                    //MLE    sendNextRequest(self);
                    //MLE }, 100);
                } else {
                    // Retry this request only in some seconds : 1, 4, 9, 16, 25, 36, 49, etc.
                    setTimeout(function () {
                        sendNextRequest(self);
                    }, 1000*request.nbTry*request.nbTry);
                }
            } else {
                a4p.InternalLog.log('srvSynchro','sendNextRequest cancel already done '+request.id+' # '+request.nbTry);
                // cancel already done
                if (self.synchroState != Service.PAUSE) {
                    self.synchroState = Service.READY;
                    if (self.serverState != Service.READY) {
                        checkServerStatus(self);
                    }
                }
                // Send next request only in 0.1 second
                setTimeout(function () {
                    a4p.InternalLog.log('srvSynchro','sendNextRequest WHY ?');
                    sendNextRequest(self);
                }, 100);
            }
        };
        triggerStart(self, request);

        a4p.InternalLog.log('srvSynchro','sendNextRequest send '+request.id+' # '+request.nbTry);
        // We MUST renew c4pToken because it can be outdated if we are waiting for too long in the queue
        if (request.filePath) {

            a4p.InternalLog.log('srvSynchro','sendNextRequest send file '+request.url);
            if (request.method.toLowerCase() == 'post') {
                request.params.c4pToken = self.srvSecurity.getHttpRequestToken();
                self.fileTransfer.sendFile(request.filePath, request.options, request.url, request.params, request.headers)
                    .then(fctOnHttpSuccess, fctOnHttpError);
            } else {
                if (request.url.indexOf('?') >= 0) {
                    self.fileTransfer.recvFile(request.filePath, request.url+'&c4pToken='+encodeURIComponent(self.srvSecurity.getHttpRequestToken()))
                        .then(fctOnHttpSuccess, fctOnHttpError);
                } else {
                    self.fileTransfer.recvFile(request.filePath, request.url+'?c4pToken='+encodeURIComponent(self.srvSecurity.getHttpRequestToken()))
                        .then(fctOnHttpSuccess, fctOnHttpError);
                }
            }
        } else {
            if (request.method.toLowerCase() == 'post') {
                request.params.c4pToken = self.srvSecurity.getHttpRequestToken();
                self.dataTransfer.sendData(request.url, request.params, request.headers)
                    .then(fctOnHttpSuccess, fctOnHttpError);
            } else {
                if (request.url.indexOf('?') >= 0) {
                    self.dataTransfer.recvData(request.url+'&c4pToken='+encodeURIComponent(self.srvSecurity.getHttpRequestToken()))
                        .then(fctOnHttpSuccess, fctOnHttpError);
                } else {
                    self.dataTransfer.recvData(request.url+'?c4pToken='+encodeURIComponent(self.srvSecurity.getHttpRequestToken()))
                        .then(fctOnHttpSuccess, fctOnHttpError);
                }
            }
        }
    }

    return Service;
})();
