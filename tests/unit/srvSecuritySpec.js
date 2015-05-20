

describe('SrvSecurity', function () {
'use strict';

    var srvSecurity, srvLocalStorage;

    beforeEach(module('c4pServices'));

    beforeEach(inject(function ($injector) {

        var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
        srvLocalStorage = new LocalStorage();
        srvLocalStorage.set('AuthSecured', true);
        srvLocalStorage.set('AuthExpected', 'secret');
        srvSecurity = new SrvSecurity(srvLocalStorage);

    }));

    it('should be correctly initialized', function () {

        expect(srvSecurity.secured).toEqual(false);
        expect(srvSecurity.expected).toEqual('');
        expect(srvSecurity.initDone).toEqual(false);
        expect(srvSecurity.isSecured()).toEqual(false);
        expect(srvSecurity.isVerified()).toEqual(false);

        srvSecurity.init();
        expect(srvSecurity.secured).toEqual(true);
        expect(srvSecurity.expected).toEqual('secret');
        expect(srvSecurity.initDone).toEqual(true);
        expect(srvSecurity.isSecured()).toEqual(true);
        expect(srvSecurity.isVerified()).toEqual(true);

    });

    it('should not be required', function () {

        srvSecurity.init();

        srvSecurity.setSecured(false);
        expect(srvSecurity.secured).toEqual(false);
        var saved = srvLocalStorage.get('AuthSecured', false);
        expect(saved).toEqual(false);

        expect(srvSecurity.isSecured()).toEqual(false);
        expect(srvSecurity.isVerified()).toEqual(true);

    });

    it('should register and verify', function () {

        srvSecurity.init();

        srvSecurity.register('secret2');
        expect(srvSecurity.expected).toEqual('secret2');
        var saved = srvLocalStorage.get('AuthExpected', '');
        expect(saved).toEqual('secret2');
        expect(srvSecurity.isSecured()).toEqual(true);
        expect(srvSecurity.isVerified()).toEqual(true);

        var ok = srvSecurity.verify('secret2');
        expect(ok).toEqual(true);

        ok = srvSecurity.verify('secret');
        expect(ok).toEqual(false);

        srvSecurity.register('');
        expect(srvSecurity.expected).toEqual('');
        saved = srvLocalStorage.get('AuthExpected', '');
        expect(saved).toEqual('');
        expect(srvSecurity.isSecured()).toEqual(true);
        expect(srvSecurity.isVerified()).toEqual(false);

    });

});
