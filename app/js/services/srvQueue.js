
angular.module('srvQueue', [])

.factory('srvQueue',  function ($q, $exceptionHandler, srvDataStore, srvSecurity) {
  return new SrvQueue($q, $exceptionHandler, srvDataStore, srvSecurity);
});



//--------------------------------------
// Queue Service
//--------------------------------------
var SrvQueue = (function() {
    'use strict';

    // Service states & config
    Service.READY = 1;
    Service.SENDING = 2;
    Service.STOP = 3;

    Service.TRY_COUNTMAX = 3;


    // Constructor
    function Service(qService, srvExceptionHandler, srvDataStore, srvSecurity) {
        this.q = qService;
        this.srvExceptionHandler = srvExceptionHandler;
        this.srvSecurity = srvSecurity;
        this.srvDataStore = srvDataStore;

        this.state = Service.STOP;
        this.pendingQueueRequests = [];
        this.callbacksStart = [];
        this.callbackHandle = 0;
        this.requestHandle = 0;
        this.synchroListeners = {};

        // All the possible queues
        this.PUB = {};
        this.PUB.QUEUE_DOWNLOAD  = 'queue-download';
        this.PUB.QUEUE_SAVE      = 'queue-save';
    }

    //
    // Start the service
    //
    Service.prototype.start = function () {
        a4p.InternalLog.log('SrvQueue', "start");

        this.stop();
        this.pendingQueueRequests = this.srvDataStore.getItems('queue');
        if (this.pendingQueueRequests.length > 0) {
           this.requestHandle = this.pendingQueueRequests[this.pendingQueueRequests.length-1].id;
        } else {
           this.requestHandle = 0;
        }

        this.state = Service.READY;
        sendCurrentRequest(this);
    };
    // Stop service
    Service.prototype.stop = function () {
        if (this.state == Service.STOP) return;
        a4p.InternalLog.log('SrvQueue', "stop");

        this.srvDataStore.setItems('queue', this.pendingQueueRequests);
        this.state = Service.STOP;
    };

    // @callbackFct : function callback(queueId, requestId, objectDbid, params, requestNbTry, callbackSuccessFct, callbackErrorFct) {
    //          do something ...
    //          if (ok) callbackSuccessFct(srvQueue);
    //          if (ko) callbackErrorFct(srvQueue);
    //      };
    Service.prototype.addListenerOnStart = function (queueName, callbackFct) {
        this.callbackHandle++;
        this.callbacksStart.push({id:this.callbackHandle, queue:queueName, callback:callbackFct});
        return this.callbackHandle;
    };

    Service.prototype.cancelListener = function (callbackHandle) {
        return removeIdFromList(this.callbacksStart, callbackHandle) !== false;
    };

    Service.prototype.addRequest = function (queueName, object, params) {
        if ((typeof object == 'undefined') || !object || !object.id || !object.id.dbid) {
            throw new Error("SrvQueue.addRequest requires a valid object");
        }

        if (this.isInQueue(queueName,object.id.dbid)) {
          a4p.InternalLog.log('srvQueue',''+object.id.dbid+' Already in the queue, not added');
          return -1;
        }

        this.requestHandle++;
        var request = {
            id:this.requestHandle,
            queue:queueName,
            objectDbid: object.id.dbid,
            params : params ? angular.copy(params) : null,
            nbTry:0
        };
        this.pendingQueueRequests.push(request);

        // launch service
        sendCurrentRequest(this);
        return this.requestHandle;
    };

    Service.prototype.isInQueue = function(queueName, objectDbid) {

        a4p.InternalLog.log('SrvQueue','isInQueue: '+queueName+' id:'+objectDbid);
        var i;
        for (i = 0; i < this.pendingQueueRequests.length; i++) {
            if (    this.pendingQueueRequests[i].queue == queueName &&
                    this.pendingQueueRequests[i].objectDbid == objectDbid) {
              return i+1;
            }
        }
        return false;
    };

    Service.prototype.addSynchroListener = function(objectDbid, listener) {

        a4p.InternalLog.log('SrvQueue','addSynchroListener: '+objectDbid);
        if (!this.synchroListeners[objectDbid]) this.synchroListeners[objectDbid] = [];
        this.synchroListeners[objectDbid].push(listener);

        // store it ?
    };

    Service.prototype.getSynchroListeners = function(objectDbid) {

        a4p.InternalLog.log('SrvQueue','getSynchroListeners: '+objectDbid);
        return this.synchroListeners[objectDbid];
    };


    //--------------------------
    // Private
    //--------------------------

    var callbackSuccessFct = function(self) {

        //if (self.state != Service.SENDING) return; PB!!

        if (!self.pendingQueueRequests || !self.pendingQueueRequests.length) return;
        var request = self.pendingQueueRequests[0];
        if (!a4p.isDefined(request)) return;
        a4p.InternalLog.log('SrvQueue','callbackSuccessFct : '+request.id);

        //remove the current request
        self.pendingQueueRequests.shift();

        // launch the next one
        self.state = Service.READY;
        setTimeout(function () {
            sendCurrentRequest(self);
        }, 100);
    };

    var callbackErrorFct = function (self) {

        if (!self.pendingQueueRequests || !self.pendingQueueRequests.length) return;
        var request = self.pendingQueueRequests[0];
        if (!a4p.isDefined(request)) return;
        a4p.InternalLog.log('SrvQueue','callbackErrorFct : '+request.id +' obj:'+request.objectDbid+' # '+request.nbTry);

        //remove the current request
        self.pendingQueueRequests.shift();
        // launch the next one
        self.state = Service.READY;
        setTimeout(function () {
            sendCurrentRequest(self);
        }, 100);

    };


    function triggerStart(self, request) {
        var callbacks = self.callbacksStart.slice(0);// Copy to be independant of updates
        for (var idx = 0, max = callbacks.length; idx < max; idx++) {
            if (request.queue != callbacks[idx].queue) continue;
            try {
                callbacks[idx].callback(callbacks[idx].id, request.id, request.objectDbid, request.params, request.nbTry, callbackSuccessFct, callbackErrorFct);
            } catch (e) {
                self.srvExceptionHandler(e, "SrvQueue.callbacksStart#" + idx);
            }
        }
    }


    function sendCurrentRequest(self) {
        a4p.InternalLog.log('SrvQueue','sendCurrentRequest: '+self.pendingQueueRequests.length);
        if (self.state != Service.READY) return;
        if (self.pendingQueueRequests.length <= 0) return;
        self.state = Service.SENDING;

        // sort Queue : DOWNLOAD Before ALL
        // cf srvData : Send object to save ONLY after ALL downloads are done (because new object can link on document not yet downloaded)
        var requests = self.pendingQueueRequests.sort(function(r1, r2){
            var keyA =  (r1.queue == self.PUB.QUEUE_DOWNLOAD),
            keyB =      (r2.queue == self.PUB.QUEUE_DOWNLOAD);
            if(keyA == keyB) return 0;
            if(keyA) return -1;
            return 1;
        });

        var request = requests[0];
        request.nbTry++;

        if (request.nbTry > Service.TRY_COUNTMAX) {
          //cancel current request
          callbackErrorFct(self);
        }
        else {
          triggerStart(self, request);
          // did in callbacks :  self.state = Service.READY;
        }
    }

    return Service;
})();
