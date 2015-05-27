

describe('SrvLoad', function () {
'use strict';

    var srvLoad;

    beforeEach(module('c4p.services'));

    beforeEach(function () {

        srvLoad = new SrvLoad();

    });

    it('should be correctly initialized', function () {

        expect(srvLoad.status).toEqual('');
        expect(srvLoad.error).toEqual('');
        expect(srvLoad.show).toEqual(true);

    });

    it('should update its status', function () {

        srvLoad.setStatus('new status');
        expect(srvLoad.status).toEqual('new status');
        expect(srvLoad.error).toEqual('');
        expect(srvLoad.show).toEqual(true);

    });

    it('should update its error', function () {

        srvLoad.setError('new error');
        expect(srvLoad.status).toEqual('');
        expect(srvLoad.error).toEqual('new error');
        expect(srvLoad.show).toEqual(true);

    });

    it('should update its show', function () {

        srvLoad.setLoaded();
        expect(srvLoad.status).toEqual('');
        expect(srvLoad.error).toEqual('');
        expect(srvLoad.show).toEqual(false);

    });

});
