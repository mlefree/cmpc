

describe('SrvLog', function () {
'use strict';
    var srvLog, srvConfig, srvLocalStorage, srvAnalytics;

    beforeEach(module('c4p.services'));

    beforeEach(function () {

        var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
        srvLocalStorage = new LocalStorage();
        srvAnalytics = new MockAnalytics(srvLocalStorage);
        srvConfig = new MockConfig(srvAnalytics);
        srvLog = new SrvLog(srvLocalStorage);

    });

    it('should be correctly initialized', function () {

        expect(srvLog.getUserLog().length).toEqual(0);
        expect(srvLog.message).toEqual('');
        expect(srvLog.read).toEqual(true);
        expect(srvLog.initDone).toEqual(false);

        srvLog.init();
        expect(srvLog.getUserLog().length).toEqual(0);
        expect(srvLog.message).toEqual('');
        expect(srvLog.read).toEqual(true);
        expect(srvLog.initDone).toEqual(true);

    });

    it('should add an info message', function () {

        srvLog.init();

        srvLog.logInfo(true, 'mainMessage1', 'detailsMessage1');
        expect(srvLog.getUserLog().length).toEqual(1);
        expect(srvLog.getUserLog()[0].msg).toEqual('information:mainMessage1');
        expect(srvLog.getUserLog()[0].details).toBe('');

    });

    it('should add a success message', function () {

        srvLog.init();

        srvConfig.env = 'LS';
        srvLog.logSuccess(true, 'mainMessage2', 'detailsMessage2');
        expect(srvLog.getUserLog().length).toEqual(1);
        expect(srvLog.getUserLog()[0].msg).toEqual('success:mainMessage2');
        expect(srvLog.getUserLog()[0].details).toBe('');

    });

    it('should add a permanent message', function () {

        srvLog.init();

        srvLog.userLogPersistentMessage('mainMessage3');
        expect(srvLog.message).toEqual('mainMessage3');
        expect(srvLog.read).toEqual(false);
        expect(srvLog.getUserLog().length).toEqual(1);
        expect(srvLog.getUserLog()[0].msg).toEqual('alert:mainMessage3');
        expect(srvLog.getUserLog()[0].details).toBe('');

        srvLog.setInfoRead();
        expect(srvLog.read).toEqual(true);

    });

    it('should add or remove userLog', function () {

        srvLog.init();

        srvLog.logInfo(true, 'mainMessage1', 'detailsMessage1');
        expect(srvLog.getUserLog().length).toEqual(1);
        expect(srvLog.getUserLog()[0].msg).toEqual('information:mainMessage1');
        expect(srvLog.getUserLog()[0].details).toBe('');

        srvConfig.env = 'LS';

        srvLog.logSuccess(true, 'mainMessage2', 'detailsMessage2');
        expect(srvLog.getUserLog().length).toEqual(2);
        expect(srvLog.getUserLog()[1].msg).toEqual('success:mainMessage2');
        expect(srvLog.getUserLog()[1].details).toBe('');

        srvLog.userLogPersistentMessage('mainMessage3');
        expect(srvLog.message).toEqual('mainMessage3');
        expect(srvLog.read).toEqual(false);
        expect(srvLog.getUserLog().length).toEqual(3);
        expect(srvLog.getUserLog()[2].msg).toEqual('alert:mainMessage3');
        expect(srvLog.getUserLog()[2].details).toBe('');

        srvLog.setInfoRead();
        expect(srvLog.read).toEqual(true);

    });

});
