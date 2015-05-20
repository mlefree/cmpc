

describe('SrvSynchro', function () {
'use strict';

    var srvSynchro, httpBackend, httpService, deferService, exceptionHandlerService, srvSecurity,
        srvRunning, srvLocalStorage, srvFileStorage, srvDataTransfer, srvFileTransfer;
    var ok = false;
    var data = null;
    var error = null;
    var done = false;
    var answers = [];

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
        exceptionHandlerService = $injector.get('$exceptionHandler');
        srvRunning = $injector.get('srvRunning');
        srvSecurity = $injector.get('srvSecurity');
        srvLocalStorage = $injector.get('srvLocalStorage');
        srvFileStorage = $injector.get('srvFileStorage');
        srvDataTransfer = $injector.get('srvDataTransfer');
        srvFileTransfer = $injector.get('srvFileTransfer');
        srvSynchro = new SrvSynchro(deferService, srvDataTransfer, srvFileTransfer,
            exceptionHandlerService, srvRunning, srvLocalStorage, srvSecurity);

        runs(function () {
            var fileStorageType = null;
            // Init srvFileStorage
            ok = false;
            done = false;
            error = null;
            srvFileStorage.init().then(function () {
                ok = true;
                done = true;
            }, function (message) {
                error = message;
                done = true;
            });
            if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        waitsFor(function () {
            return done;
        }, "srvFileStorage should be initialized", 10000);

        runs(function () {
            answers = [];
            srvSynchro.init();
            this.synchroListenerOnStart = srvSynchro.addListenerOnStart('channel', function (callbackId, requestId, requestCtx, requestNbTry) {
                answers.push({evt: 'onStart', callbackId: callbackId, requestId: requestId, requestCtx: requestCtx, requestNbTry: requestNbTry});
            });
            this.synchroListenerOnCancel = srvSynchro.addListenerOnCancel('channel', function (callbackId, requestId, requestCtx, requestNbTry) {
                answers.push({evt: 'onCancel', callbackId: callbackId, requestId: requestId, requestCtx: requestCtx, requestNbTry: requestNbTry});
            });
            this.synchroListenerOnError = srvSynchro.addListenerOnError('channel', function (callbackId, requestId, requestCtx, requestNbTry, message) {
                answers.push({evt: 'onError', callbackId: callbackId, requestId: requestId, requestCtx: requestCtx, requestNbTry: requestNbTry, message: message});
            });
            this.synchroListenerOnSuccess = srvSynchro.addListenerOnSuccess('channel', function (callbackId, requestId, requestCtx, requestNbTry, responseStatus, responseData, responseHeaders) {
                answers.push({evt: 'onSuccess', callbackId: callbackId, requestId: requestId, requestCtx: requestCtx, requestNbTry: requestNbTry, responseStatus: responseStatus, responseData: responseData, responseHeaders: responseHeaders});
            });

            // 16x16 pixels image created with gimp
            var jpegData = "\xff\xd8\xff\xe0\x00\x10\x4a\x46\x49\x46\x00\x01\x01\x01\x00\x48\x00\x48\x00\x00\xff\xfe\x00\x13\x43\x72\x65\x61\x74\x65\x64\x20\x77\x69\x74\x68\x20\x47\x49\x4d\x50\xff\xdb\x00\x43\x00\x10\x0b\x0c\x0e\x0c\x0a\x10\x0e\x0d\x0e\x12\x11\x10\x13\x18\x28\x1a\x18\x16\x16\x18\x31\x23\x25\x1d\x28\x3a\x33\x3d\x3c\x39\x33\x38\x37\x40\x48\x5c\x4e\x40\x44\x57\x45\x37\x38\x50\x6d\x51\x57\x5f\x62\x67\x68\x67\x3e\x4d\x71\x79\x70\x64\x78\x5c\x65\x67\x63\xff\xdb\x00\x43\x01\x11\x12\x12\x18\x15\x18\x2f\x1a\x1a\x2f\x63\x42\x38\x42\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\xff\xc2\x00\x11\x08\x00\x10\x00\x10\x03\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x16\x00\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x05\xff\xc4\x00\x14\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x10\x03\x10\x00\x00\x01\xd8\x00\xa7\xff\xc4\x00\x17\x10\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x21\x01\x41\xff\xda\x00\x08\x01\x01\x00\x01\x05\x02\x8e\x36\xbf\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x01\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x02\x01\x01\x3f\x01\x1f\xff\xc4\x00\x15\x10\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\x21\xff\xda\x00\x08\x01\x01\x00\x06\x3f\x02\xa3\xff\xc4\x00\x1b\x10\x00\x02\x02\x03\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x11\x00\x21\x31\x41\x51\x71\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x21\xb3\x24\xae\x1a\x6b\x6f\x73\x1a\x39\xe4\x31\xea\x7f\xff\xda\x00\x0c\x03\x01\x00\x02\x00\x03\x00\x00\x00\x10\x82\x4f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x10\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x02\x01\x01\x3f\x10\x1f\xff\xc4\x00\x19\x10\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x11\x00\x21\x31\x61\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x10\x0a\xc0\x10\x47\xee\x90\x1e\x49\xd7\x97\x71\xd5\x63\x65\x61\x60\x31\x39\x1d\xff\xd9";

            var byteArray = new Uint8Array(jpegData.length);
            for (var i = 0; i < jpegData.length; i++) {
                byteArray[i] = jpegData.charCodeAt(i) & 0xff;
            }

            ok = false;
            done = false;
            error = null;
            srvFileStorage.writeFile(
                new Blob([byteArray], {type: 'image/jpeg', endings: "transparent"}),
                'a4p/img/dummy_picture.jpg',
                function (fileEntry) {
                    ok = true;
                    done = true;
                }, function (message) {
                    error = message;
                    done = true;
                });
            if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        waitsFor(function () {
            return done;
        }, "a4p/img/dummy_picture.jpg should be written", 10000);

        runs(function () {
            expect(ok).toBe(true);
            expect(error).toBeNull();
        });

    }));

    afterEach(inject(function ($rootScope) {

        runs(function () {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
            done = false;
            srvFileStorage.deleteFullDir('a4p/img', function () {
                done = true;
            }, function (message) {
                console.log('Delete error ' + message);
            });
            if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        waitsFor(function () {
            return done;
        }, "There should be 1 deletions", 10000);

    }));

    it('should addGetRequest', inject(function ($rootScope) {

        var timeStart = null;

        runs(function () {
            answers = [];
            data = null;
            error = null;
            done = false;
            httpBackend.when('GET', new RegExp('c4p_downloadFile.php')).respond(200, 'fileData', {
                'Content-Type': 'image/jpeg'
            });
            // addFileRequest = function (channel, ctx, url, method, params, filePath, headers, options)
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
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
            var httpData = $.param(params);
            var options = {
                fileKey: 'file',
                fileName: 'dummy_picture.jpg'
            };
            var timeout = 5000;// 5 seconds
            httpBackend.expectGET(new RegExp('c4p_downloadFile.php'));
            var requestHandle = srvSynchro.addRequest('channel', 'ctx', 'my_server:1235//my/appli/c4p_downloadFile.php', 'GET', params, headers);
        });

        runs(function () {
            expect(answers.length).toBe(1);
            expect(answers[0].evt).toBe('onStart');
            expect(answers[0].callbackId).toBe(1);
            expect(answers[0].requestId).toBe(1);
            expect(answers[0].requestCtx).toBe('ctx');
            // Request should have been received by httpBackend => send response
            httpBackend.flush();
            expect(answers.length).toBe(2);
            expect(answers[1].evt).toBe('onSuccess');
            expect(answers[1].callbackId).toBe(4);
            expect(answers[1].requestId).toBe(1);
            expect(answers[1].requestCtx).toBe('ctx');
            expect(answers[1].responseStatus).toBe(200);
            expect(answers[1].responseData).toBe('fileData');
            expect(answers[1].responseHeaders('Content-Type')).toBe('image/jpeg');
        });

    }));

    it('should addPostRequest', inject(function ($rootScope) {

        var timeStart = null;

        runs(function () {
            answers = [];
            data = null;
            error = null;
            done = false;
            httpBackend.when('POST', new RegExp('c4p_uploadFile.php')).respond(200,
                a4p.Json.object2String({
                    responseOK: true,
                    log: 'UploadFile in CRM done.',
                    type: 'Document',
                    id: {dbid: 'A4P_DOC_001', sf_id: 'SF_DOC_001'}
                }), {
                    'Content-Type': 'application/json; charset=utf-8'
                });
            // addFileRequest = function (channel, ctx, url, method, params, filePath, headers, options)
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
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
            var options = {
                fileKey: 'file',
                fileName: 'dummy_picture.jpg'
            };
            var timeout = 5000;// 5 seconds
            httpBackend.expectPOST(new RegExp('c4p_uploadFile.php'));
            var requestHandle = srvSynchro.addRequest('channel', 'ctx', 'my_server:1235//my/appli/c4p_uploadFile.php', 'POST', params, headers);
            // Wait for file reading
            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution

            /*
             // send file
             var requestHandle = srvSynchro.addFileRequest('channel', 'ctx', 'my_server:1235//my/appli/c4p_uploadFile.php', 'POST', params, 'a4p/img/dummy_picture.jpg', headers, options);
             // recv file
             var requestHandle = srvSynchro.addFileRequest('channel', 'ctx', 'my_server:1235//my/appli/c4p_downloadFile.php?type=doc&dbid=1', 'GET', null, 'a4p/img/dummy_picture.jpg', null, null);
             */

            //timeStart = new Date().getTime();
        });

        // wait for 10s to let time for srvSynchro to send the request
        //waitsFor(function () {return ((new Date().getTime() - timeStart) > 10000);}, "wait for 10 s", 20000);

        runs(function () {
            expect(answers.length).toBe(1);
            expect(answers[0].evt).toBe('onStart');
            expect(answers[0].callbackId).toBe(1);
            expect(answers[0].requestId).toBe(1);
            expect(answers[0].requestCtx).toBe('ctx');
            // Request should have been received by httpBackend => send response
            httpBackend.flush();
            expect(answers.length).toBe(2);
            expect(answers[1].evt).toBe('onSuccess');
            expect(answers[1].callbackId).toBe(4);
            expect(answers[1].requestId).toBe(1);
            expect(answers[1].requestCtx).toBe('ctx');
            expect(answers[1].responseStatus).toBe(200);
            expect(answers[1].responseData.log).toBe('UploadFile in CRM done.');
            expect(answers[1].responseData.type).toBe('Document');
            expect(answers[1].responseData.id.dbid).toBe('A4P_DOC_001');
            expect(answers[1].responseData.id.sf_id).toBe('SF_DOC_001');
            expect(answers[1].responseHeaders('Content-Type')).toBe('application/json; charset=utf-8');

            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        //waitsFor(function () {return (answers.length > 0);}, "dummy_picture.jpg should be uploaded", 10000);

    }));

    it('should addPostRequest2', inject(function ($rootScope) {

        var timeStart = null;

        runs(function () {
            answers = [];
            data = null;
            error = null;
            done = false;
            httpBackend.when('POST', new RegExp('c4p_uploadFile.php')).respond(200,
                a4p.Json.object2String({
                    responseOK: true,
                    log: 'UploadFile in CRM done.',
                    type: 'Document',
                    id: {dbid: 'A4P_DOC_001', sf_id: 'SF_DOC_001'}
                }), {
                    'Content-Type': 'application/json; charset=utf-8'
                });
            // addFileRequest = function (channel, ctx, url, method, params, filePath, headers, options)
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
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
            var httpData = $.param(params);
            var options = {
                fileKey: 'file',
                fileName: 'dummy_picture.jpg'
            };
            var timeout = 5000;// 5 seconds
            httpBackend.expectPOST(new RegExp('c4p_uploadFile.php'));
            var requestHandle = srvSynchro.addRequest('channel', 'ctx', 'my_server:1235//my/appli/c4p_uploadFile.php', 'POST', params, headers);
        });

        runs(function () {
            expect(answers.length).toBe(1);
            expect(answers[0].evt).toBe('onStart');
            expect(answers[0].callbackId).toBe(1);
            expect(answers[0].requestId).toBe(1);
            expect(answers[0].requestCtx).toBe('ctx');
            // Request should have been received by httpBackend => send response
            httpBackend.flush();
            expect(answers.length).toBe(2);
            expect(answers[1].evt).toBe('onSuccess');
            expect(answers[1].callbackId).toBe(4);
            expect(answers[1].requestId).toBe(1);
            expect(answers[1].requestCtx).toBe('ctx');
            expect(answers[1].responseStatus).toBe(200);
            expect(answers[1].responseData.log).toBe('UploadFile in CRM done.');
            expect(answers[1].responseData.type).toBe('Document');
            expect(answers[1].responseData.id.dbid).toBe('A4P_DOC_001');
            expect(answers[1].responseData.id.sf_id).toBe('SF_DOC_001');
            expect(answers[1].responseHeaders('Content-Type')).toBe('application/json; charset=utf-8');
        });

    }));

    it('should addPostFileRequest', inject(function ($rootScope) {

        var timeStart = null;

        runs(function () {
            answers = [];
            data = null;
            error = null;
            done = false;
            httpBackend.when('POST', new RegExp('c4p_uploadFile.php')).respond(200,
                a4p.Json.object2String({
                    responseOK: true,
                    log: 'UploadFile in CRM done.',
                    type: 'Document',
                    id: {dbid: 'A4P_DOC_001', sf_id: 'SF_DOC_001'}
                }), {
                    'Content-Type': 'application/json; charset=utf-8'
                });
            // addFileRequest = function (channel, ctx, url, method, params, filePath, headers, options)
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
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
            var httpData = $.param(params);
            var options = {
                fileKey: 'file',
                fileName: 'dummy_picture.jpg'
            };
            var timeout = 5000;// 5 seconds
            httpBackend.expectPOST(new RegExp('c4p_uploadFile.php'));
            // send file
            var requestHandle = srvSynchro.addFileRequest('channel', 'ctx', 'my_server:1235//my/appli/c4p_uploadFile.php', 'POST', params, 'a4p/img/dummy_picture.jpg', headers, options);
            timeStart = new Date().getTime();
        });

        // wait for 10s to let time for srvSynchro to send the request
        waitsFor(function () {
            return ((new Date().getTime() - timeStart) > 10000);
        }, "wait for 10 s", 20000);

        runs(function () {
            expect(answers.length).toBe(1);
            expect(answers[0].evt).toBe('onStart');
            expect(answers[0].callbackId).toBe(1);
            expect(answers[0].requestId).toBe(1);
            expect(answers[0].requestCtx).toBe('ctx');
            // Request should have been received by httpBackend => send response
            httpBackend.flush();
            expect(answers.length).toBe(2);
            expect(answers[1].evt).toBe('onSuccess');
            expect(answers[1].callbackId).toBe(4);
            expect(answers[1].requestId).toBe(1);
            expect(answers[1].requestCtx).toBe('ctx');
            expect(answers[1].responseStatus).toBe(200);
            expect(answers[1].responseData.log).toBe('UploadFile in CRM done.');
            expect(answers[1].responseData.type).toBe('Document');
            expect(answers[1].responseData.id.dbid).toBe('A4P_DOC_001');
            expect(answers[1].responseData.id.sf_id).toBe('SF_DOC_001');
            expect(answers[1].responseHeaders('Content-Type')).toBe('application/json; charset=utf-8');

            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        //waitsFor(function () {return (answers.length > 0);}, "dummy_picture.jpg should be uploaded", 10000);

    }));

    it('should addGetFileRequest', inject(function ($rootScope) {

        var timeStart = null;

        runs(function () {
            answers = [];
            data = null;
            error = null;
            done = false;
            httpBackend.when('GET', new RegExp('c4p_downloadFile.php')).respond(200, 'fileData', {
                'Content-Type': 'image/jpeg'
            });
            // addFileRequest = function (channel, ctx, url, method, params, filePath, headers, options)
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
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
            var httpData = $.param(params);
            var options = {
                fileKey: 'file',
                fileName: 'dummy_picture.jpg'
            };
            var timeout = 5000;// 5 seconds
            httpBackend.expectGET(new RegExp('c4p_downloadFile.php'));
            // recv file
            var requestHandle = srvSynchro.addFileRequest('channel', 'ctx', 'my_server:1235//my/appli/c4p_downloadFile.php?type=doc&dbid=1', 'GET', null, 'a4p/img/dummy_picture.jpg', null, null);
        });

        // wait for 10s to let time for srvSynchro to send the request
        //waitsFor(function () {return ((new Date().getTime() - timeStart) > 10000);}, "wait for 10 s", 20000);

        runs(function () {
            expect(answers.length).toBe(1);
            expect(answers[0].evt).toBe('onStart');
            expect(answers[0].callbackId).toBe(1);
            expect(answers[0].requestId).toBe(1);
            expect(answers[0].requestCtx).toBe('ctx');
            // Request should have been received by httpBackend => send response
            httpBackend.flush();
            timeStart = new Date().getTime();
        });

        // wait for 10s to let time for srvSynchro to write the file
        waitsFor(function () {
            return ((new Date().getTime() - timeStart) > 10000);
        }, "wait for 10 s", 20000);

        runs(function () {
            expect(answers.length).toBe(2);
            expect(answers[1].evt).toBe('onSuccess');
            expect(answers[1].callbackId).toBe(4);
            expect(answers[1].requestId).toBe(1);
            expect(answers[1].requestCtx).toBe('ctx');
            // URL=filesystem:https://127.0.0.1(:[0-9]+)?/persistent/... with runner.html
            // URL=filesystem:http://localhost(:[0-9]+)?/persistent/... with JsTestDriver
            expect(answers[1].responseStatus).toMatch('/persistent/a4p/img/dummy_picture.jpg');// srvFileTransfer alsways gives local file URL
            expect(answers[1].responseData).toBe('');// srvFileTransfer alsways gives ''
            expect(answers[1].responseHeaders).toBe(undefined);// srvFileTransfer always gives no header function

            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        //waitsFor(function () {return (answers.length > 0);}, "dummy_picture.jpg should be uploaded", 10000);

    }));

});

describe('SrvSynchro2', function () {

    var srvSynchro, deferService, exceptionHandlerService, srvSecurity,
        srvRunning, srvLocalStorage, srvAnalytics, srvDataTransfer, srvFileTransfer;
    var answers = [];

    beforeEach(module('c4pServices'));

    beforeEach(function () {
        module(function ($provide) {
            var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
            srvLocalStorage = new LocalStorage();
            $provide.provider('srvLocalStorage', function () {
                this.$get = function () {
                    return srvLocalStorage;
                };
            });
            srvAnalytics = new MockAnalytics(srvLocalStorage);
            $provide.provider('srvAnalytics', function () {
                this.$get = function () {
                    return srvAnalytics;
                };
            });
        });
    });

    beforeEach(inject(function ($injector, $rootScope) {
        deferService = $injector.get('$q');
        exceptionHandlerService = $injector.get('$exceptionHandler');
        srvSecurity = new MockSecurity(); //$injector.get('srvSecurity');
        srvRunning = new SrvRunning(exceptionHandlerService); //$injector.get('srvRunning');
        srvDataTransfer = new MockDataTransfer(deferService, $rootScope); //$injector.get('srvDataTransfer');
        srvFileTransfer = new MockSrvFileTransfer(deferService, $rootScope); //$injector.get('srvFileTransfer');
        srvSynchro = new SrvSynchro(deferService, srvDataTransfer, srvFileTransfer,
            exceptionHandlerService, srvRunning, srvLocalStorage, srvSecurity);

        runs(function () {
            answers = [];
            srvSynchro.init();
            this.synchroListenerOnStart = srvSynchro.addListenerOnStart('channel', function (callbackId, requestId, requestCtx, requestNbTry) {
                answers.push({evt: 'onStart', callbackId: callbackId, requestId: requestId, requestCtx: requestCtx, requestNbTry: requestNbTry});
            });
            this.synchroListenerOnCancel = srvSynchro.addListenerOnCancel('channel', function (callbackId, requestId, requestCtx, requestNbTry) {
                answers.push({evt: 'onCancel', callbackId: callbackId, requestId: requestId, requestCtx: requestCtx, requestNbTry: requestNbTry});
            });
            this.synchroListenerOnError = srvSynchro.addListenerOnError('channel', function (callbackId, requestId, requestCtx, requestNbTry, message) {
                answers.push({evt: 'onError', callbackId: callbackId, requestId: requestId, requestCtx: requestCtx, requestNbTry: requestNbTry, message: message});
            });
            this.synchroListenerOnSuccess = srvSynchro.addListenerOnSuccess('channel', function (callbackId, requestId, requestCtx, requestNbTry, responseStatus, responseData, responseHeaders) {
                answers.push({evt: 'onSuccess', callbackId: callbackId, requestId: requestId, requestCtx: requestCtx, requestNbTry: requestNbTry, responseStatus: responseStatus, responseData: responseData, responseHeaders: responseHeaders});
            });
        });

    }));

    afterEach(function () {
        expect(srvDataTransfer.pendingSends.length).toBe(0);
        expect(srvDataTransfer.pendingRecvs.length).toBe(0);
        expect(srvFileTransfer.pendingSends.length).toBe(0);
        expect(srvFileTransfer.pendingRecvs.length).toBe(0);
    });

    it('should addGetRequest', inject(function ($rootScope) {

        runs(function () {
            answers = [];
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
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
            var requestHandle = srvSynchro.addRequest('channel', 'ctx',
                'my_server:1235//my/appli/c4p_downloadFile.php', 'GET', params, headers);
        });

        runs(function () {
            expect(answers.length).toBe(1);
            expect(answers[0].evt).toBe('onStart');
            expect(answers[0].callbackId).toBe(1);
            expect(answers[0].requestId).toBe(1);
            expect(answers[0].requestCtx).toBe('ctx');
            // SrvDataTransfer should have received a dataRequest
            expect(srvDataTransfer.pendingRecvs.length).toBe(1);
            expect(srvDataTransfer.pendingRecvs[0].url).toContain('my_server:1235//my/appli/c4p_downloadFile.php');
            // Send response
            srvDataTransfer.ackRecv(
                'fileData',
                200,
                {
                    'Content-Type': 'image/jpeg'
                }
            );
            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
            expect(answers.length).toBe(2);
            expect(answers[1].evt).toBe('onSuccess');
            expect(answers[1].callbackId).toBe(4);
            expect(answers[1].requestId).toBe(1);
            expect(answers[1].requestCtx).toBe('ctx');
            expect(answers[1].responseStatus).toBe(200);
            expect(answers[1].responseData).toBe('fileData');
            expect(answers[1].responseHeaders('Content-Type')).toBe('image/jpeg');
        });

    }));

    it('should addPostRequest', inject(function ($rootScope) {

        runs(function () {
            answers = [];
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
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
            var requestHandle = srvSynchro.addRequest('channel', 'ctx',
                'my_server:1235//my/appli/c4p_uploadFile.php', 'POST', params, headers);
        });

        runs(function () {
            expect(answers.length).toBe(1);
            expect(answers[0].evt).toBe('onStart');
            expect(answers[0].callbackId).toBe(1);
            expect(answers[0].requestId).toBe(1);
            expect(answers[0].requestCtx).toBe('ctx');
            // SrvDataTransfer should have received a dataRequest
            expect(srvDataTransfer.pendingSends.length).toBe(1);
            expect(srvDataTransfer.pendingSends[0].url).toBe('my_server:1235//my/appli/c4p_uploadFile.php');
            // Send response
            srvDataTransfer.ackSend({
                responseOK: true,
                log: 'UploadFile in CRM done.',
                type: 'Document',
                id: {
                    dbid: 'A4P_DOC_001',
                    sf_id: 'SF_DOC_001'
                }
            });
            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
            expect(answers.length).toBe(2);
            expect(answers[1].evt).toBe('onSuccess');
            expect(answers[1].callbackId).toBe(4);
            expect(answers[1].requestId).toBe(1);
            expect(answers[1].requestCtx).toBe('ctx');
            expect(answers[1].responseStatus).toBe(200);
            expect(answers[1].responseData.log).toBe('UploadFile in CRM done.');
            expect(answers[1].responseData.type).toBe('Document');
            expect(answers[1].responseData.id.dbid).toBe('A4P_DOC_001');
            expect(answers[1].responseData.id.sf_id).toBe('SF_DOC_001');
            expect(answers[1].responseHeaders('Content-Type')).toBe('application/json; charset=utf-8');
        });

    }));

    it('should addPostFileRequest', inject(function ($rootScope) {

        runs(function () {
            answers = [];
            var requestHandle = srvSynchro.addFileRequest('channel', 'ctx',
                'my_server:1235//my/appli/c4p_uploadFile.php', 'POST', {},
                'a4p/img/dummy_picture.jpg', {}, {});
        });

        runs(function () {
            expect(answers.length).toBe(1);
            expect(answers[0].evt).toBe('onStart');
            expect(answers[0].callbackId).toBe(1);
            expect(answers[0].requestId).toBe(1);
            expect(answers[0].requestCtx).toBe('ctx');
            // SrvFileTransfer should have received a fileRequest
            expect(srvFileTransfer.pendingSends.length).toBe(1);
            expect(srvFileTransfer.pendingSends[0].filePath).toBe('a4p/img/dummy_picture.jpg');
            // Send response
            srvFileTransfer.ackSend({
                responseOK: true,
                log: 'UploadFile in CRM done.',
                type: 'Document',
                id: {
                    dbid: 'A4P_DOC_001',
                    sf_id: 'SF_DOC_001'
                }
            });
            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
            expect(answers.length).toBe(2);
            expect(answers[1].evt).toBe('onSuccess');
            expect(answers[1].callbackId).toBe(4);
            expect(answers[1].requestId).toBe(1);
            expect(answers[1].requestCtx).toBe('ctx');
            expect(answers[1].responseStatus).toBe(200);
            expect(answers[1].responseData.log).toBe('UploadFile in CRM done.');
            expect(answers[1].responseData.type).toBe('Document');
            expect(answers[1].responseData.id.dbid).toBe('A4P_DOC_001');
            expect(answers[1].responseData.id.sf_id).toBe('SF_DOC_001');
            expect(answers[1].responseHeaders('Content-Type')).toBe('application/json; charset=utf-8');
        });

    }));

    it('should addGetFileRequest', inject(function ($rootScope) {

        var timeStart = null;

        runs(function () {
            answers = [];
            var requestHandle = srvSynchro.addFileRequest('channel', 'ctx',
                'my_server:1235//my/appli/c4p_downloadFile.php?type=doc&dbid=1', 'GET', null,
                'a4p/img/dummy_picture.jpg', null, null);
        });

        runs(function () {
            expect(answers.length).toBe(1);
            expect(answers[0].evt).toBe('onStart');
            expect(answers[0].callbackId).toBe(1);
            expect(answers[0].requestId).toBe(1);
            expect(answers[0].requestCtx).toBe('ctx');
            // SrvFileTransfer should have received a fileRequest
            expect(srvFileTransfer.pendingRecvs.length).toBe(1);
            expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('a4p/img/dummy_picture.jpg');
            // Send response
            srvFileTransfer.ackRecv('', 'filesystem:https://127.0.0.1/persistent/a4p/img/dummy_picture.jpg');
            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
            expect(answers.length).toBe(2);
            expect(answers[1].evt).toBe('onSuccess');
            expect(answers[1].callbackId).toBe(4);
            expect(answers[1].requestId).toBe(1);
            expect(answers[1].requestCtx).toBe('ctx');
            // URL=filesystem:https://127.0.0.1(:[0-9]+)?/persistent/... with runner.html
            // URL=filesystem:http://localhost(:[0-9]+)?/persistent/... with JsTestDriver
            expect(answers[1].responseStatus).toMatch('/persistent/a4p/img/dummy_picture.jpg');// srvFileTransfer alsways gives local file URL
            expect(answers[1].responseData).toBe('');// srvFileTransfer alsways gives ''
            expect(answers[1].responseHeaders).toBe(undefined);// srvFileTransfer always gives no header function
        });

    }));

});
