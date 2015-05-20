

var SrvSynchroStatus = (function (qService) {
    'use strict';
    // Constructor
    function Service() {
        this.version = "0.2";

        this.PUB = {};
        this.PUB.NEW = 3;
        this.PUB.QUEUE = 2;
        this.PUB.NETWORK = 1;
        this.PUB.NONE = 0;// Must be ZERO (false test in srvData to know if synchro running or not)

        this.PUB.CLOUD_WAITFOR = 0;
        this.PUB.CLOUD_PB = 1;
        this.PUB.CLOUD_INPROGRESS = 2;
        this.PUB.CLOUD_IN = 3;

        this.PUB.CHANNEL_CREATE      = 'creating';
        this.PUB.CHANNEL_SHARE       = 'sharing';
        this.PUB.CHANNEL_WRITE       = 'writing';
        this.PUB.CHANNEL_READ        = 'reading';
        this.PUB.CHANNEL_DELETE      = 'deleting';
        this.PUB.CHANNEL_CLOUD       = 'cloud';
    }

    Service.prototype.resetChannels = function(object) {
        if (!object) return false;

        object.c4pSynchroStatus = {};
        object.c4pSynchroStatus[this.PUB.CHANNEL_CREATE] = this.PUB.NONE;
        object.c4pSynchroStatus[this.PUB.CHANNEL_SHARE] = this.PUB.NONE;
        object.c4pSynchroStatus[this.PUB.CHANNEL_WRITE] = this.PUB.NONE;
        object.c4pSynchroStatus[this.PUB.CHANNEL_READ] = this.PUB.NONE;
        object.c4pSynchroStatus[this.PUB.CHANNEL_DELETE] = this.PUB.NONE;
        object.c4pSynchroStatus[this.PUB.CHANNEL_CLOUD] = {     progress   : 0,
                                                                status     : this.PUB.CLOUD_WAITFOR,
                                                                hasBeenCanceled : false,
                                                                log        : 'init'};

        return true;
    };

    Service.prototype.hasChannels = function(object) {
        if (!object || !object.c4pSynchroStatus || a4p.isUndefinedOrNull(object.c4pSynchroStatus)) return false;

        return true;
    };

    Service.prototype.removeStatus = function(object) {
        if (!object || !object.c4pSynchroStatus || a4p.isUndefinedOrNull(object.c4pSynchroStatus)) return true;

        delete object.c4pSynchroStatus;  //delete the reference
        //object.c4pSynchroStatus = null;

        return true;
    };

    Service.prototype.isInInstableMode = function(object) {
        if (!object || !object.c4pSynchroStatus || a4p.isUndefinedOrNull(object.c4pSynchroStatus)) return true;

        if (    object.c4pSynchroStatus[this.PUB.CHANNEL_CREATE]  ||
                object.c4pSynchroStatus[this.PUB.CHANNEL_READ]  ||
                object.c4pSynchroStatus[this.PUB.CHANNEL_DELETE])
            return true;

        return false;
    };


    Service.prototype.hasToBeDeleted = function(object) {
        if (!object || !object.c4pSynchroStatus || a4p.isUndefinedOrNull(object.c4pSynchroStatus)) return false;

        var deleteChanel = this.PUB.CHANNEL_DELETE;
        if (object.c4pSynchroStatus[deleteChanel] != this.PUB.NONE) return true;

        return false;
    };

    Service.prototype.hasBeenCanceled = function(object) {
        if (!object || !object.c4pSynchroStatus || a4p.isUndefinedOrNull(object.c4pSynchroStatus)) return false;

        var cloudChanel = this.PUB.CHANNEL_CLOUD;
        if (object.c4pSynchroStatus[cloudChanel].hasBeenCanceled) return true;

        return false;
    };

    Service.prototype.copyChannels = function(object, objectToCopy) {
        if (!object) return false;

        if (a4p.isUndefinedOrNull(objectToCopy.c4pSynchroStatus))
            return this.resetChannels(object);

        object.c4pSynchroStatus[this.PUB.CHANNEL_CREATE] = objectToCopy.c4pSynchroStatus[this.PUB.CHANNEL_CREATE];
        object.c4pSynchroStatus[this.PUB.CHANNEL_SHARE] = objectToCopy.c4pSynchroStatus[this.PUB.CHANNEL_SHARE];
        object.c4pSynchroStatus[this.PUB.CHANNEL_WRITE] = objectToCopy.c4pSynchroStatus[this.PUB.CHANNEL_WRITE];
        object.c4pSynchroStatus[this.PUB.CHANNEL_READ] = objectToCopy.c4pSynchroStatus[this.PUB.CHANNEL_READ];
        object.c4pSynchroStatus[this.PUB.CHANNEL_DELETE] = objectToCopy.c4pSynchroStatus[this.PUB.CHANNEL_DELETE];
        object.c4pSynchroStatus[this.PUB.CHANNEL_CLOUD] = angular.copy(objectToCopy.c4pSynchroStatus[this.PUB.CHANNEL_CLOUD]);

        return true;
    };

    Service.prototype.pushChannelToLevel = function(object, channel, level, bForce) {
        if (!object || !channel || !a4p.isDefined(object.c4pSynchroStatus) || !a4p.isDefined(object.c4pSynchroStatus[channel])) return false;

        // Check that it was relevant with previous level
        var previous = object.c4pSynchroStatus[channel];
        var doChange = false;
        if (level == this.PUB.NEW && previous == this.PUB.NONE)           doChange = true;
        else if (level == this.PUB.QUEUE && previous == this.PUB.NEW)     doChange = true;
        else if (level == this.PUB.NETWORK && previous == this.PUB.QUEUE) doChange = true;
        else if (level == this.PUB.NONE && previous == this.PUB.NETWORK)  doChange = true;

        if (!doChange) {
            a4p.InternalLog.log('SrvSynchroStatus','pushChannelToLevel pb doChange:'+channel+' from '+previous+' to '+level);
        }

        // Do something special for DELETE : stop all other activities & channel
        if ((doChange || bForce) && channel == this.PUB.CHANNEL_DELETE) this.resetChannels(object);

        if (doChange || bForce) object.c4pSynchroStatus[channel] = level;
        if ((doChange || bForce) && level == this.PUB.NETWORK) {
            object.c4pSynchroStatus[this.PUB.CHANNEL_CLOUD] = {
                                progress    : 0,
                                status     : this.PUB.CLOUD_WAITFOR,
                                hasBeenCanceled : false,
                                log        : 'wait...'
                                };
        }

        return doChange;
    };
    Service.prototype.successChannel = function(object, channel, bForce) {
        if (!object || !channel || !a4p.isDefined(object.c4pSynchroStatus) || !a4p.isDefined(object.c4pSynchroStatus[channel])) return false;

        var previous = object.c4pSynchroStatus[channel];
        if (previous == this.PUB.NETWORK || bForce) object.c4pSynchroStatus[channel] = this.PUB.NONE;

        var sumChannel =    (object.c4pSynchroStatus[this.PUB.CHANNEL_CREATE] == this.PUB.NONE) +
                            (object.c4pSynchroStatus[this.PUB.CHANNEL_SHARE] == this.PUB.NONE) +
                            (object.c4pSynchroStatus[this.PUB.CHANNEL_WRITE] == this.PUB.NONE) +
                            (object.c4pSynchroStatus[this.PUB.CHANNEL_READ] == this.PUB.NONE) +
                            (object.c4pSynchroStatus[this.PUB.CHANNEL_DELETE] == this.PUB.NONE);
        var percent = sumChannel / 5 * 100;
        if (percent == 100) {
            object.c4pSynchroStatus[this.PUB.CHANNEL_CLOUD] = {   progress    : percent,
                                                                  status     : this.PUB.CLOUD_IN,
                                                                  hasBeenCanceled : false,
                                                                  log        : 'in!'
                                                                };
        }
        else if (percent > 0) {
            object.c4pSynchroStatus[this.PUB.CHANNEL_CLOUD] = {    progress    : percent,
                                                                    status     : this.PUB.CLOUD_INPROGRESS,
                                                                    hasBeenCanceled : false,
                                                                    log        : 'in progress...'
                                                                };
        }

        return true;
    };
    Service.prototype.cancelChannel = function(object, channel, log, bForce) {
        if (!object || !channel || !a4p.isDefined(object.c4pSynchroStatus) || !a4p.isDefined(object.c4pSynchroStatus[channel])) return false;

        var doChange = false;
        var previous = object.c4pSynchroStatus[channel];
        if (previous != this.PUB.NONE || bForce) {

            object.c4pSynchroStatus[channel] = this.PUB.NONE;
            object.c4pSynchroStatus[this.PUB.CHANNEL_CLOUD] = {    progress    : 0,
                                                                    status     : this.PUB.CLOUD_PB,
                                                                    hasBeenCanceled : true,
                                                                    log        : ':'+log
                                                                };
            doChange = true;
        }

        return doChange;
    };


    return Service;
})();
