

describe('SrvDataTransfer', function () {
'use strict';

    var srvDataTransfer, httpBackend, httpService, deferService, scopeService;
    var ok = false;
    var data = null;
    var error = null;
    var done = false;

    beforeEach(module('c4pServices'));

    beforeEach(function () {
        module(function ($provide) {
            var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
            var srvLocalStorage = new LocalStorage();
            $provide.provider('srvLocalStorage', function () {
                this.$get = function () {
                    return srvLocalStorage;
                };
            });
            var srvAnalytics = new MockAnalytics(srvLocalStorage);
            $provide.provider('srvAnalytics', function () {
                this.$get = function () {
                    return srvAnalytics;
                };
            });
        });
    });

    beforeEach(inject(function ($injector, $rootScope) {
        httpBackend = $injector.get('$httpBackend');
        httpService = $injector.get('$http');
        deferService = $injector.get('$q');
        scopeService = $injector.get('$rootScope');
        srvDataTransfer = new SrvDataTransfer(deferService, httpService, scopeService);
    }));

    afterEach(inject(function ($rootScope) {

        runs(function () {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

    }));

    it('should read config file', function () {

        data = null;
        error = null;
        done = false;

        httpBackend.when('GET', 'models/c4p_conf.json').respond(200, {
            "buildDate" : "130911",
            "urlBase" : "https://127.0.0.1/c4ph5/www",
            "trustAllHosts" : false,
            "possibleCrms" : ["c4p", "sf"],
            "activeCrms" : ["c4p", "sf"],
            "config" : {
                "exposeBetaFunctionalities" : false
            }
        }, {});
        httpBackend.expectGET('models/c4p_conf.json');
        srvDataTransfer.recvData('models/c4p_conf.json', 5000)
            .then(function (dataRep) {
                done = true;
                data = dataRep;
            }, function (errorMsg) {
                // {data:msg, status:'error'}
                done = true;
                error = errorMsg;
            });// => init()
        httpBackend.flush();
        expect(done).toEqual(true);
        expect(error).toBeNull();
        expect(data.status).toEqual(200);
        expect(data.data.urlBase).toEqual('https://127.0.0.1/c4ph5/www');
        expect(data.data.trustAllHosts).toEqual(false);

    });

    it('should fail a read config file', function () {

        data = null;
        error = null;
        done = false;

        httpBackend.when('GET', 'models/c4p_conf.json').respond(404, 'Error : c4p_conf.json unknown', {});
        httpBackend.expectGET('models/c4p_conf.json');
        srvDataTransfer.recvData('models/c4p_conf.json', 5000)
            .then(function (dataRep) {
                done = true;
                data = dataRep;
            }, function (errorMsg) {
                // {data:msg, status:'error'}
                done = true;
                error = errorMsg;
            });// => init()
        httpBackend.flush();
        expect(done).toEqual(true);
        expect(data).toBeNull();
        expect(error.status).toEqual('error');
        expect(error.data).toEqual('Data download failure : response=Error : c4p_conf.json unknown\n (status=404)');

    });

    it('should sendData', inject(function ($rootScope) {

        runs(function () {
            data = null;
            error = null;
            done = false;
            httpBackend.when('POST', new RegExp('c4p_uploadFile.php')).respond(200,
                a4p.Json.object2String({
                    responseOK: true,
                    log : 'UploadFile in CRM done.',
                    type : 'Document',
                    id : {dbid:'A4P_DOC_001', sf_id:'SF_DOC_001'}
                }), {});
            var headers = {
                'Content-Type' : 'application/x-www-form-urlencoded'
            };
            var params = {
                'id': {dbid: 'A4P_DOC_001'},
                'type': 'Document',
                'uploadFileInCrm': true,
                'shareFileInCrm': false,
                'fileName': 'dummy_picture.jpg',
                'fileUid': 'UID001',
                'object_id': {dbid: 'A4P_EVENT_001'},// Must be an Event id
                'c4pToken': 'dummyToken'
            };
            var timeout = 5000;// 5 seconds
            httpBackend.expectPOST(new RegExp('c4p_uploadFile.php'));
            srvDataTransfer.sendData('my_server:1235//my/appli/c4p_uploadFile.php', params, headers, timeout)
                .then(function (dataRep) {
                    // {data:..., status:..., headers:...}
                    done = true;
                    data = dataRep;
                }, function (errorMsg) {
                    // {data:msg, status:'error'}
                    done = true;
                    error = errorMsg;
                });// => init()
            // Request should have been received by httpBackend => send response
            httpBackend.flush();
            if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        waitsFor(function () {return done;}, "dummy_picture.jpg should be uploaded", 10000);

        runs(function () {
            expect(error).toBeNull();
            expect(data).not.toBeNull();
            expect(data.data).not.toBeNull();
            expect(data.status).toBe(200);
            expect(data.data.id.dbid).toBe('A4P_DOC_001');
            expect(data.data.id.sf_id).toBe('SF_DOC_001');
            expect(data.data.type).toBe('Document');
            expect(data.data.log).toBe('UploadFile in CRM done.');
        });

        // TODO : tester encodage URI de $.param(params)

    }));

    it('should recvData', inject(function ($rootScope) {

        runs(function () {
            data = null;
            error = null;
            done = false;
            httpBackend.when('GET', new RegExp('c4p_downloadFile.php')).respond(200, 'fileData', {});
            var timeout = 5000;// 5 seconds
            httpBackend.expectGET(new RegExp('c4p_downloadFile.php'));
            srvDataTransfer.recvData('my_server:1235//my/appli/c4p_downloadFile.php', timeout)
                .then(function (dataRep) {
                    done = true;
                    data = dataRep;
                }, function (errorMsg) {
                    // {data:msg, status:'error'}
                    done = true;
                    error = errorMsg;
                });// => init()
            // Request should have been received by httpBackend => send response
            httpBackend.flush();
            if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        waitsFor(function () {return done;}, "dummy_picture2.jpg should be downloaded", 10000);

        runs(function () {
            expect(error).toBeNull();
            expect(data).not.toBeNull();
            expect(data.data).not.toBeNull();
            expect(data.status).toBe(200);
            expect(data.data).toBe('fileData');
        });

        // TODO : tester avec un Content-Type

    }));

});
