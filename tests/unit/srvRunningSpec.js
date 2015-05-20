

describe('SrvRunning', function () {
'use strict';

    var srvRunning;

    beforeEach(module('c4pServices'));

    beforeEach(inject(function ($injector) {
        var exceptionHandlerService = $injector.get('$exceptionHandler');

        srvRunning = new SrvRunning(exceptionHandlerService);

    }));

    it('should be correctly initialized', function () {

        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(true);

    });

    it('should update its pause state', function () {

        var refreshStatus = null;
        var refreshHandle = null;
        var handleRefresh = srvRunning.addListenerOnRefresh(function (handle, value) {
            refreshHandle = handle;
            refreshStatus = value;
        });
        var pauseStatus = null;
        var pauseHandle = null;
        var handlePause = srvRunning.addListenerOnPause(function (handle, value) {
            pauseHandle = handle;
            pauseStatus = value;
        });
        var onlineStatus = null;
        var onlineHandle = null;
        var handleOnline = srvRunning.addListenerOnOnline(function (handle, value) {
            onlineHandle = handle;
            onlineStatus = value;
        });

        srvRunning.setPause(true);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(true);
        expect(srvRunning.online).toEqual(true);
        expect(refreshStatus).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(onlineStatus).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(pauseHandle).toEqual(handlePause);
        expect(pauseStatus).toEqual(true);

        srvRunning.setPause(false);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(true);
        expect(refreshStatus).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(onlineStatus).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(pauseHandle).toEqual(handlePause);
        expect(pauseStatus).toEqual(false);

        srvRunning.cancelListener(handlePause);
        pauseStatus = null;
        pauseHandle = null;

        srvRunning.setPause(true);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(true);
        expect(srvRunning.online).toEqual(true);
        expect(refreshStatus).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(onlineStatus).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(pauseStatus).toBeNull();

        srvRunning.setPause(false);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(true);
        expect(refreshStatus).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(onlineStatus).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(pauseStatus).toBeNull();

    });

    it('should update its refresh state', function () {

        var refreshStatus = null;
        var refreshHandle = null;
        var handleRefresh = srvRunning.addListenerOnRefresh(function (handle, value) {
            refreshHandle = handle;
            refreshStatus = value;
        });
        var pauseStatus = null;
        var pauseHandle = null;
        var handlePause = srvRunning.addListenerOnPause(function (handle, value) {
            pauseHandle = handle;
            pauseStatus = value;
        });
        var onlineStatus = null;
        var onlineHandle = null;
        var handleOnline = srvRunning.addListenerOnOnline(function (handle, value) {
            onlineHandle = handle;
            onlineStatus = value;
        });

        srvRunning.setRefresh(true);
        expect(srvRunning.refresh).toEqual(true);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(true);
        expect(pauseStatus).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(onlineStatus).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(refreshHandle).toEqual(handleRefresh);
        expect(refreshStatus).toEqual(true);

        srvRunning.setRefresh(false);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(true);
        expect(pauseStatus).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(onlineStatus).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(refreshHandle).toEqual(handleRefresh);
        expect(refreshStatus).toEqual(false);

        srvRunning.cancelListener(handleRefresh);
        refreshStatus = null;
        refreshHandle = null;

        srvRunning.setRefresh(true);
        expect(srvRunning.refresh).toEqual(true);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(true);
        expect(pauseStatus).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(onlineStatus).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(refreshStatus).toBeNull();

        srvRunning.setRefresh(false);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(true);
        expect(pauseStatus).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(onlineStatus).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(refreshStatus).toBeNull();

    });

    it('should update its online state', function () {

        var refreshStatus = null;
        var refreshHandle = null;
        var handleRefresh = srvRunning.addListenerOnRefresh(function (handle, value) {
            refreshHandle = handle;
            refreshStatus = value;
        });
        var pauseStatus = null;
        var pauseHandle = null;
        var handlePause = srvRunning.addListenerOnPause(function (handle, value) {
            pauseHandle = handle;
            pauseStatus = value;
        });
        var onlineStatus = null;
        var onlineHandle = null;
        var handleOnline = srvRunning.addListenerOnOnline(function (handle, value) {
            onlineHandle = handle;
            onlineStatus = value;
        });

        srvRunning.setOnline(false);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(false);
        expect(pauseStatus).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(refreshStatus).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(onlineHandle).toEqual(handleOnline);
        expect(onlineStatus).toEqual(false);

        srvRunning.setOnline(true);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(true);
        expect(pauseStatus).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(refreshStatus).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(onlineHandle).toEqual(handleOnline);
        expect(onlineStatus).toEqual(true);

        srvRunning.cancelListener(handleOnline);
        onlineStatus = null;
        onlineHandle = null;

        srvRunning.setOnline(false);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(false);
        expect(pauseStatus).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(refreshStatus).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(onlineStatus).toBeNull();

        srvRunning.setOnline(true);
        expect(srvRunning.refresh).toEqual(false);
        expect(srvRunning.pause).toEqual(false);
        expect(srvRunning.online).toEqual(true);
        expect(pauseStatus).toBeNull();
        expect(pauseHandle).toBeNull();
        expect(refreshStatus).toBeNull();
        expect(refreshHandle).toBeNull();
        expect(onlineHandle).toBeNull();
        expect(onlineStatus).toBeNull();

    });

});
