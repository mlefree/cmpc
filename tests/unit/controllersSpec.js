'use strict';

/* jasmine specs for controllers go here */
/*
 describe('MyCtrl1', function(){
 var myCtrl1;

 beforeEach(function(){
 myCtrl1 = new MyCtrl1();
 });


 it('should ....', function() {
 //spec body
 });
 });


 describe('MyCtrl2', function(){
 var myCtrl2;


 beforeEach(function(){
 myCtrl2 = new MyCtrl2();
 });


 it('should ....', function() {
 //spec body
 });
 });
 */

describe('angular copy', function () {

    it('should do a deep copy and not only pointers copy', function () {

        var v1 = [];
        v1.push({a:'a1', b:'b1'});
        v1.push({a:'a2', b:'b2'});
        expect(v1.length).toBe(2);
        expect(v1[0].a).toBe('a1');
        expect(v1[0].b).toBe('b1');
        expect(v1[1].a).toBe('a2');
        expect(v1[1].b).toBe('b2');

        var v2 = angular.copy(v1);
        expect(v2.length).toBe(2);
        expect(v2[0].a).toBe('a1');
        expect(v2[0].b).toBe('b1');
        expect(v2[1].a).toBe('a2');
        expect(v2[1].b).toBe('b2');

        v2[0].a = 'c3';
        expect(v2.length).toBe(2);
        expect(v2[0].a).toBe('c3');
        expect(v2[0].b).toBe('b1');
        expect(v2[1].a).toBe('a2');
        expect(v2[1].b).toBe('b2');
        expect(v1.length).toBe(2);
        expect(v1[0].a).toBe('a1');
        expect(v1[0].b).toBe('b1');
        expect(v1[1].a).toBe('a2');
        expect(v1[1].b).toBe('b2');
    });

});

describe('$q', function () {

    it('should resolve promise before callback', inject(function ($q, $rootScope) {
        var result = null;
        var deferred = $q.defer();

        deferred.resolve();
        deferred.promise.then(function() {
            result = true;
        }, function() {
            result = false;
        });
        expect(result).toBeNull();
        if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        expect(result).toBe(true);
    }));

    it('should reject promise before callback', inject(function ($q, $rootScope) {
        var result = null;
        var deferred = $q.defer();

        deferred.reject();
        deferred.promise.then(function() {
            result = true;
        }, function() {
            result = false;
        });
        expect(result).toBeNull();
        if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        expect(result).toBe(false);
    }));

    it('should resolve promise after callback', inject(function ($q, $rootScope) {
        var result = null;
        var deferred = $q.defer();

        deferred.promise.then(function() {
            result = true;
        }, function() {
            result = false;
        });
        deferred.resolve();
        expect(result).toBeNull();
        if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        expect(result).toBe(true);
    }));

    it('should reject promise after callback', inject(function ($q, $rootScope) {
        var result = null;
        var deferred = $q.defer();

        deferred.promise.then(function() {
            result = true;
        }, function() {
            result = false;
        });
        deferred.reject();
        expect(result).toBeNull();
        if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        expect(result).toBe(false);
    }));

});

describe('ctrlNavigation', function () {

    //beforeEach(module('ui.bootstrap'));
    //beforeEach(module('c4p.services'));

    var navigationScope, meetingScope, actionScope;
    var httpBackend, srvSynchro, deferService, timeoutService, exceptionHandlerService,
        srvRunning, srvConfig, srvLog, srvSecurity, srvLocale,
        srvLocalStorage, srvAnalytics, srvDataTransfer, srvFileTransfer, srvFileStorage,
        srvGuider, srvData, srvFacet, srvNav, srvLink;

    var oldWindowDevice;
    var oldCamera;
    var oldNavigatorCamera;

    var ok = false;
    var data = null;
    var error = null;
    var done = false;
    var timeStart;

    beforeEach(function () {
        module('ui.bootstrap');
        module('c4p.services');
        module(function ($provide) {
            var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
            srvLocalStorage = new LocalStorage();
            $provide.value('version', "00S00");
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

    beforeEach(inject(function ($rootScope, $controller, $injector) {
        navigationScope = $rootScope.$new();
        httpBackend = $injector.get('$httpBackend');
        deferService = $injector.get('$q');
        timeoutService = $injector.get('$timeout');
        exceptionHandlerService = $injector.get('$exceptionHandler');
        srvFileStorage = $injector.get('srvFileStorage');
        srvRunning = new SrvRunning(exceptionHandlerService); //$injector.get('srvRunning');
        srvConfig = new MockConfig(srvAnalytics); //$injector.get('srvConfig');
        srvLog = new MockLog(); //$injector.get('srvLog');
        srvSecurity = new MockSecurity(); //$injector.get('srvSecurity');
        srvLocale = new MockLocale(); //$injector.get('srvLocale');
        srvDataTransfer = new MockDataTransfer(deferService, $rootScope); //$injector.get('srvDataTransfer');
        srvFileTransfer = new MockSrvFileTransfer(deferService, $rootScope); //$injector.get('srvFileTransfer');
        srvGuider = new SrvGuider(srvLocalStorage, srvLocale);
        srvSynchro = new SrvSynchro(deferService, srvDataTransfer, srvFileTransfer,
            exceptionHandlerService, srvRunning, srvLocalStorage, srvSecurity);
        srvData = new SrvData(exceptionHandlerService, deferService, srvLocalStorage, srvConfig, srvLog,
            srvLocale, srvSecurity, srvDataTransfer, srvRunning, srvSynchro, srvFileStorage, $rootScope);
        srvFacet = new SrvFacet(srvData, srvLocale, srvConfig);
        srvNav = new SrvNav(exceptionHandlerService, srvData, srvLocale, srvConfig);
        srvLink = new SrvLink(srvData, srvNav, srvLocale);

        srvConfig.setPossibleCrms(["c4p", "sf"]);
        srvConfig.setActiveCrms(["c4p", "sf"]);
        srvConfig.setConfig({
            "exposeBetaFunctionalities": false
        });

        runs(function () {

            // Modify globalspace variables

            oldWindowDevice = window.device;
            window.device = {name:'deviceName', cordova:'deviceCordova', platform:'devicePlatform', uuid:'deviceUuid', version:'deviceVersion'};

            oldCamera = Camera;
            Camera = {DestinationType:{FILE_URI:1}};

            oldNavigatorCamera = navigator.camera;
            var pictureId = 0;
            navigator.camera = {
                getPicture:function (successCallback, errorCallback, options) {
                    console.log('navigator.camera.getPicture mock');
                    pictureId++;
                    var filePath = 'a4p/c4p/doc/dummy_picture'+pictureId+'.jpg';
                    var contentType = 'image/jpeg';
                    // 16x16 pixels image created with gimp
                    var jpegData = "\xff\xd8\xff\xe0\x00\x10\x4a\x46\x49\x46\x00\x01\x01\x01\x00\x48\x00\x48\x00\x00\xff\xfe\x00\x13\x43\x72\x65\x61\x74\x65\x64\x20\x77\x69\x74\x68\x20\x47\x49\x4d\x50\xff\xdb\x00\x43\x00\x10\x0b\x0c\x0e\x0c\x0a\x10\x0e\x0d\x0e\x12\x11\x10\x13\x18\x28\x1a\x18\x16\x16\x18\x31\x23\x25\x1d\x28\x3a\x33\x3d\x3c\x39\x33\x38\x37\x40\x48\x5c\x4e\x40\x44\x57\x45\x37\x38\x50\x6d\x51\x57\x5f\x62\x67\x68\x67\x3e\x4d\x71\x79\x70\x64\x78\x5c\x65\x67\x63\xff\xdb\x00\x43\x01\x11\x12\x12\x18\x15\x18\x2f\x1a\x1a\x2f\x63\x42\x38\x42\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\xff\xc2\x00\x11\x08\x00\x10\x00\x10\x03\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x16\x00\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x05\xff\xc4\x00\x14\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x10\x03\x10\x00\x00\x01\xd8\x00\xa7\xff\xc4\x00\x17\x10\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x21\x01\x41\xff\xda\x00\x08\x01\x01\x00\x01\x05\x02\x8e\x36\xbf\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x01\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x02\x01\x01\x3f\x01\x1f\xff\xc4\x00\x15\x10\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\x21\xff\xda\x00\x08\x01\x01\x00\x06\x3f\x02\xa3\xff\xc4\x00\x1b\x10\x00\x02\x02\x03\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x11\x00\x21\x31\x41\x51\x71\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x21\xb3\x24\xae\x1a\x6b\x6f\x73\x1a\x39\xe4\x31\xea\x7f\xff\xda\x00\x0c\x03\x01\x00\x02\x00\x03\x00\x00\x00\x10\x82\x4f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x10\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x02\x01\x01\x3f\x10\x1f\xff\xc4\x00\x19\x10\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x11\x00\x21\x31\x61\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x10\x0a\xc0\x10\x47\xee\x90\x1e\x49\xd7\x97\x71\xd5\x63\x65\x61\x60\x31\x39\x1d\xff\xd9";
                    var byteArray = new Uint8Array(jpegData.length);
                    for (var i = 0; i < jpegData.length; i++) {
                        byteArray[i] = jpegData.charCodeAt(i) & 0xff;
                    }
                    var blob = new Blob([byteArray], {type:contentType, endings:"transparent"});
                    srvFileStorage.writeFile(blob, filePath, function(fileEntry) {
                        // URL=filesystem:https://127.0.0.1(:[0-9]+)?/persistent/a4p/c4p/doc/dummy_picture.jpg with runner.html
                        // URL=filesystem:http://localhost(:[0-9]+)?/persistent/a4p/c4p/doc/dummy_picture.jpg with JsTestDriver
                        console.log('navigator.camera.getPicture mock create successfully file ' + filePath + ' : URL=' + fileEntry.toURL());
                        successCallback(fileEntry.toURL());
                    }, function(message) {
                        console.log('navigator.camera.getPicture mock failed to create file ' + filePath + ' : ' + message);
                        errorCallback(message);
                    });
                }
            };

            spyOn(navigator.camera, 'getPicture').andCallThrough();

            // backend definition common for all tests
            var c4p_serverFillJson = {
                'error' : '',
                'responseOK' : true,
                'responseRight' : '22',//VALUE_RIGHT_FULL
                'urlBase' : 'https://127.0.0.1/c4p_server/www',
                'responseLog' : 'Data send.',
                'infoMessage' : '',
                'currencyIsoCode' : null,
                'currencySymbol' : "\xe2\x82\xac",
                'userLanguage' : 'en',
                'c4pToken': 'dummC4pToken'
            };
            var c4ph5FillJson = {
                'error' : '',
                'responseOK' : true,
                'responseRight' : '22',//VALUE_RIGHT_FULL
                'urlBase' : 'https://127.0.0.1/c4ph5/www',
                'responseLog' : 'Data send.',
                'infoMessage' : '',
                'currencyIsoCode' : null,
                'currencySymbol' : "\xe2\x82\xac",
                'userLanguage' : 'en',
                'c4pToken' : 'dummC4pToken'
            };
            var c4p_serverFullMapJson = {
                'error' : '',
                'responseOK' : true,
                'responseLog' : 'Data send.',
                'map' : angular.copy(c4p.Demo),
                'responseRedirect' : '',
                'infoMessage' : '',
                'currencyIsoCode' : null,
                'currencySymbol' : "\xe2\x82\xac",
                'userLanguage' : 'en',
                'nextLastUpdate': Math.round((new Date()).getTime() / 1000),
                'userId': {'sf_id':'005i0000000I8c5AAC', 'c4p_id':'demo@apps4pro.com'},
                'c4pToken': 'dummC4pToken'
            };
            var c4ph5FullMapJson = {
                'error' : '',
                'responseOK' : true,
                'responseLog' : 'Data send.',
                'map' : angular.copy(c4p.Demo),
                'responseRedirect' : '',
                'infoMessage' : '',
                'currencyIsoCode' : null,
                'currencySymbol' : "\xe2\x82\xac",
                'userLanguage' : 'en',
                'nextLastUpdate' : Math.round((new Date()).getTime() / 1000),
                'userId' : {'sf_id':'005i0000000I8c5AAC', 'c4p_id':'demo@apps4pro.com'},
                'c4pToken' : 'dummC4pToken'
            };
            httpBackend.when('GET', 'views/dialog/guiderCarousel.html').respond('<div class="modal-body"></div>', {
                'A-Token':'xxx',
                'Content-type':'text/html'
            });

            /*
            httpBackend.when('POST', 'https://127.0.0.1/c4p_server/www/c4p_fill.php').respond(c4p_serverFillJson, {
                'A-Token':'xxx'
            });
            httpBackend.when('POST', 'https://127.0.0.1/c4ph5/www/c4p_fill.php').respond(c4ph5FillJson, {
                'A-Token':'xxx'
            });
            httpBackend.when('POST', 'https://127.0.0.1/c4p_server/www/c4p_fullMap.php').respond(c4p_serverFullMapJson, {
                'A-Token':'xxx'
            });
            httpBackend.when('POST', 'https://127.0.0.1/c4ph5/www/c4p_fullMap.php').respond(c4ph5FullMapJson, {
                'A-Token':'xxx'
            });
            */

            // Force a reset of dbid generation
            a4p.uid = ['0', '0', '0'];

            var controller = $controller(ctrlNavigation, {
                $scope:navigationScope,
                srvFileStorage:srvFileStorage,
                srvConfig:srvConfig,
                srvLog:srvLog,
                srvLocale:srvLocale,
                srvData:srvData,
                srvRunning:srvRunning,
                srvSecurity:srvSecurity,
                srvSynchro:srvSynchro,
                srvLink:srvLink,
                srvNav:srvNav,
                srvGuider:srvGuider,
                srvFacet:srvFacet
            });

            expect(controller).not.toBeNull();
            expect(navigationScope.page).toEqual('');

            // Initialize navigationController (as ng-controller="ctrlNavigation" ng-init="initctrlNavigation()")
            ok = false;
            done = false;
            error = null;
            navigationScope.initctrlNavigation().then(function() {
                ok = true;
                done = true;
            }, function(errorMsg) {
                error = errorMsg;
                done = true;
            });
            if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        });

        waitsFor(function () {return done;}, "ctrlNavigation should have been initialized", 10000);

        runs(function () {
            expect(ok).toBe(true);
            expect(error).toBeNull();

            expect(navigationScope.page).toEqual('guider');
            expect(navigationScope.slide).toEqual('register');
            expect(navigationScope.version).toBe('00S00');
            expect(navigationScope.srvLocale.lang.code).toBe('en');
            expect(navigationScope.contactQuery.length).toBe(0);
            expect(navigationScope.accountQuery.length).toBe(0);
            expect(navigationScope.eventQuery.length).toBe(0);
            expect(navigationScope.opportunityQuery.length).toBe(0);
            expect(navigationScope.documentQuery.length).toBe(0);

            // navigationController should be initialized (via cordovaReady)
            expect(srvSynchro.initDone).toBe(true);
            expect(srvGuider.initDone).toBe(true);
            expect(srvData.initDone).toBe(true);
            expect(navigationScope.initializationFinished).toBe(true);
            // navigationController should have started srvData

            srvConfig.setPossibleCrms(["c4p", "sf"]);
            srvConfig.setActiveCrms(["c4p", "sf"]);

            expect(srvData.isDemo).toBe(false);
            expect(srvData.userId.sf_id).toBe('005i0000000I8c5AAC');
            var i, type;
            for (i = 0; i < c4p.Model.allTypes.length; i++) {
                type = c4p.Model.allTypes[i];
                expect(srvData.currentItems[type].length).toBe(0);
                expect(srvData.originalItems[type].length).toBe(0);
            }
            expect(srvData.nbObjects).toBe(0);
            expect(srvData.objectsToSave.length).toBe(0);
            expect(srvData.objectsToDownload.length).toBe(0);
        });

    }));

    afterEach(function () {
        //httpBackend.flush();// TODO : remove this flush(). We wrote it because an unexpected request is outstanding.

        timeoutService.verifyNoPendingTasks();
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
        expect(srvDataTransfer.pendingSends.length).toBe(0);
        expect(srvDataTransfer.pendingRecvs.length).toBe(0);
        expect(srvFileTransfer.pendingSends.length).toBe(0);
        expect(srvFileTransfer.pendingRecvs.length).toBe(0);
    });

    describe('in demo mode', function () {

        beforeEach(inject(function ($controller) {

            var refreshed = false;
            var refreshDiag = null;

            runs(function () {

                navigationScope.srvSecurity.setA4pLogin('demo@apps4pro.com');// User enter his email

                navigationScope.setDemo(true).then(function () {
                    refreshed = true;
                }, function (errorMsg) {
                    refreshed = true;
                    refreshDiag = errorMsg;
                });
                if (!navigationScope.$$phase) navigationScope.$apply();// propagate promise resolution

                // Should get 'data/data.json'
                expect(srvDataTransfer.pendingRecvs.length).toBe(1);
                expect(srvDataTransfer.pendingRecvs[0].url).toMatch('data/data.json');
                srvDataTransfer.ackRecv(angular.copy(c4p.Demo));
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                // Should get 'views/dialog/guiderCarousel.html'
                //httpBackend.expectGET('views/dialog/guiderCarousel.html');
                //httpBackend.flush();
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();

                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                navigationScope.setItemAndGoDetail(navigationScope.srvData.currentItems.Event[0]);
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                // when stopSpinner() and gotoSlide() are fired by $timeout service.
                timeoutService.flush(); // yes for now
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                timeoutService.verifyNoPendingTasks();
                expect(refreshDiag).toBeNull();
                expect(navigationScope.srvData.userId.sf_id).toEqual('005i0000000I8c5AAC');

                // The first DEMO Event should be selected : sf_id == 00Ui00000013wRCEAY
                expect(navigationScope.srvNav.current.id).toEqual(navigationScope.srvData.currentItems.Event[0].id.dbid);

                expect(navigationScope.srvSynchro.pendingRequests.length).toEqual(0);
                expect(navigationScope.filteredContacts.length).toEqual(0);
                expect(navigationScope.filteredAccounts.length).toEqual(0);
                expect(navigationScope.filteredEvents.length).toEqual(0);
                expect(navigationScope.filteredOpportunities.length).toEqual(0);
                expect(navigationScope.filteredDocuments.length).toEqual(0);
                expect(navigationScope.contactQuery.length).toBe(0);
                expect(navigationScope.accountQuery.length).toBe(0);
                expect(navigationScope.eventQuery.length).toBe(0);
                expect(navigationScope.opportunityQuery.length).toBe(0);
                expect(navigationScope.documentQuery.length).toBe(0);

                expect(navigationScope.srvConfig.c4pUrlBase).toBe('http://127.0.0.1/c4p_server/www');
                expect(navigationScope.srvConfig.c4pUrlData).toBe('http://127.0.0.1/c4p_server/www/c4p_fill.php');
                expect(navigationScope.srvConfig.c4pUrlUpload).toBe('http://127.0.0.1/c4p_server/www/c4p_upload.php');
                expect(navigationScope.srvConfig.c4pUrlUploadFile).toBe('http://127.0.0.1/c4p_server/www/c4p_uploadFile.php');

                // Select the first DEMO Event : sf_id == 00Ui00000013wRCEAY
                navigationScope.setItemAndGoMeeting(navigationScope.srvData.currentItems.Event[0]);
                meetingScope = navigationScope.$new();

                var controller = $controller(ctrlMeeting, {
                    $scope:meetingScope,
                    srvConfig:srvConfig,
                    srvLocale:srvLocale,
                    srvData:srvData,
                    srvNav:srvNav
                });

                actionScope = meetingScope.$new();
                controller = $controller(ctrlAction, {
                    $scope:actionScope,
                    srvConfig:srvConfig,
                    srvLocale:srvLocale,
                    srvData:srvData,
                    srvLink:srvLink,
                    srvNav:srvNav,
                    srvFacet:srvFacet
                });

                actionScope.watchSrvNav();

                expect(meetingScope.slide).toBe('meeting');
                expect(meetingScope.page).toBe('meeting');

                expect(meetingScope.srvNav.current).not.toBeNull();
                expect(meetingScope.srvNav.current.type).toBe('Event');

                expect(srvData.currentItems.Contact.length).toBe(38);
                expect(srvData.currentItems.Account.length).toBe(16);
                expect(srvData.currentItems.Event.length).toBe(21);
                expect(srvData.currentItems.Document.length).toBe(11);
                expect(srvData.currentItems.Opportunity.length).toBe(31);
                expect(srvData.currentItems.Facet.length).toBe(1);

                // Full network pending status
                expect(srvDataTransfer.pendingSends.length).toBe(0);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(0);

            });

        }));

        afterEach(function () {

            // Restore globalspace variables

            window.device = oldWindowDevice;
            Camera = oldCamera;
            navigator.camera = oldNavigatorCamera;

        });

        describe('takePicture', function () {

            var error = null;
            var end = false;

            beforeEach(inject(function ($controller) {

                runs(function () {
                    // remove all files

                    runs(function () {
                        end = false;
                        error = null;
                        // Files created in a4pSpec.js tests
                        srvFileStorage.deleteFullDir('/dir1', function () {
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                    });

                    // latch function polls until it returns true or 10s timeout expires
                    waitsFor(function () {
                            return end;
                        },
                        "/dir1 should be deleted",
                        10000);

                    runs(function () {
                        if (error) {
                            expect(error).toBe('File not found');
                        }
                    });

                    runs(function () {
                        end = false;
                        error = null;
                        // Pictures taken in ctrlNavigation or MeetingCtrl during controllerSpec.js tests
                        srvFileStorage.deleteFullDir('/a4p/c4p/doc', function () {
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                    });

                    // latch function polls until it returns true or 10s timeout expires
                    waitsFor(function () {
                            return end;
                        },
                        "/a4p/c4p/doc should be deleted",
                        10000);

                    runs(function () {
                        if (error) {
                            expect(error).toBe('File not found');
                        }
                    });

                });

            }));

            it('should take a picture', function () {

                var dirEntries = null;
                var fileEntries = null;

                runs(function () {
                    //srvRunning.setOnline(false);
                    expect(srvConfig.getActiveCrms().length).toBe(2);
                    expect(srvConfig.getActiveCrms()[0]).toBe('c4p');
                    expect(srvConfig.getActiveCrms()[1]).toBe('sf');
                    // Mocked navigator.camera is called => 'a4p/c4p/doc/dummy_picture.jpg'
                    actionScope.createNewPicture(navigationScope.srvData.currentItems.Event[0]);
                    timeStart = new Date().getTime();
                });

                // wait for 10s to let time for srvFileStorage to write the file
                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    if (!actionScope.$$phase) actionScope.$apply();// propagate promise resolution
                    timeStart = new Date().getTime();
                });

                // wait for 10s to let time for srvFileStorage to write the file
                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    if (!actionScope.$$phase) actionScope.$apply();// propagate promise resolution

                    expect(navigationScope.srvData.currentItems.Document.length).toBe(12);
                	var picture = navigationScope.srvData.currentItems.Document[navigationScope.srvData.currentItems.Document.length-1];

                    expect(picture).not.toBeNull();
                    expect(picture.filePath).toMatch('a4p/c4p/doc/Response_to_CFT_presentation_[0-9]+.jpg');
                    // URL=filesystem:https://127.0.0.1(:[0-9]+)?/persistent/... with runner.html
                    // URL=filesystem:http://localhost(:[0-9]+)?/persistent/... with JsTestDriver
                    expect(picture.url).toMatch('/persistent/a4p/c4p/doc/Response_to_CFT_presentation_[0-9]+.jpg');
                    expect(picture.path).toBe('a4p/c4p/doc');

                    error = null;
                    end = false;
                    srvFileStorage.getFile('a4p/c4p/doc/' + picture.name,
                    function (fileEntry) {
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {return end;}, "Picture file should be found", 1000);

                runs(function () {
                    expect(error).toBeNull();

                    // Trace content of directory a4p/c4p/doc, just for info
                    dirEntries = null;
                    fileEntries = null;
                    end = false;
                    error = null;
                    srvFileStorage.readDirectory(
                        'a4p/c4p/doc',
                        function (dirs, files) {
                            dirEntries = dirs;
                            fileEntries = files;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {return end;}, "a4p/c4p/doc directory should be read", 1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(dirEntries).not.toBeNull();
                    expect(fileEntries).not.toBeNull();
                    expect(dirEntries.length).toBe(0);
                    expect(fileEntries.length).toBeGreaterThan(0);
                    console.log('' + fileEntries.length + ' files found in /a4p/c4p/doc :');
                    for (var i = 0; i < fileEntries.length; i++) {
                        console.log(fileEntries[i]);
                    }
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(navigationScope.srvData.currentItems.Document.length).not.toBe(0);
                	var picture = navigationScope.srvData.currentItems.Document[navigationScope.srvData.currentItems.Document.length-1];
                	expect(picture.name).toMatch(/Response_to_CFT_presentation_[0-9]+.jpg/);
                	expect(picture.id.sf_id).toBe('demoSF' + picture.id.dbid);
                });

            });

        });

        describe('sendEmail', function () {

            it('should send an email', function () {

                runs(function () {
                    //srvRunning.setOnline(false);
                    expect(srvConfig.getActiveCrms().length).toBe(2);
                    expect(srvConfig.getActiveCrms()[0]).toBe('c4p');
                    expect(srvConfig.getActiveCrms()[1]).toBe('sf');
                    //send email without doc => use $http
                    var testEmail = {
                			'emailType': 'normal',
                            'subject': 'test send email subject',
                            'body': 'test send email body',
                            'contacts': [{dbid : meetingScope.srvData.currentItems.Contact[4].id.dbid}, {dbid : meetingScope.srvData.currentItems.Contact[5].id.dbid}],
                            'documents':[],
                            'emailsInput':[]
                        };
                    actionScope.addEmailToParent(null, false, testEmail, meetingScope.srvData.currentItems.Event[0]);
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                	//in demo mode, just create a document (email_xx-xx-xx.pdf)
                	var email = navigationScope.srvData.currentItems.Document[navigationScope.srvData.currentItems.Document.length-1];
                	expect(email.name).toMatch(/email_Response_to_CFT_presentation_[0-9]*-[0-9]*-[0-9]*.pdf/);
                	expect(email.id.sf_id).toBe('demoSF' + email.id.dbid);
                });
            });

        });

        describe('writeNote', function () {

            it('should write a note', function () {

                runs(function () {
                    //srvRunning.setOnline(false);
                    expect(srvConfig.getActiveCrms().length).toBe(2);
                    expect(srvConfig.getActiveCrms()[0]).toBe('c4p');
                    expect(srvConfig.getActiveCrms()[1]).toBe('sf');
                    var testReport = {
                        'a4p_type':'Report',
                        	'contact_ids' : [{dbid : meetingScope.srvData.currentItems.Contact[4].id.dbid}],
                            'document_ids' : [],
                            'ratings' : [{name:'Feeling',value:'5',id:'0'}],
                            'title': 'report title',
                            'description': 'report desc',
                            'message' : 'report message'
                        };
                    actionScope.addNewReport(testReport);
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    var report = navigationScope.srvData.currentItems.Report[navigationScope.srvData.currentItems.Report.length - 1];
                    expect(report.title).toBe('report title');
                    expect(report.description).toBe('report desc');
                    expect(report.message).toBe('report message');
                });

            });

        });


    });

    describe('in real mode', function () {

        beforeEach(inject(function ($controller) {

            var refreshed = false;
            var refreshDiag = null;

            runs(function () {

                navigationScope.srvSecurity.setA4pLogin('demo@apps4pro.com');// User enter his email
                navigationScope.srvSecurity.setA4pPassword('demo');// User enter his password

                navigationScope.setDemo(false).then(function () {
                    refreshed = true;
                }, function (errorMsg) {
                    refreshed = true;
                    refreshDiag = errorMsg;
                });
                if (!navigationScope.$$phase) navigationScope.$apply();// propagate promise resolution

                // Should login
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlData);
                expect(srvDataTransfer.pendingSends[0].params.login).toBe('demo@apps4pro.com');
                expect(srvDataTransfer.pendingSends[0].params.password).toBe('demo');
                expect(srvDataTransfer.pendingSends[0].params.rememberPassword).toBe(true);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.fifo).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.company_name).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.phone).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.feedback).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.star).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.name).toBe('deviceName');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.cordova).toBe('deviceCordova');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.platform).toBe('devicePlatform');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.version).toBe('deviceVersion');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.appVersion).toBe('00S00');
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).toBeUndefined();
                srvDataTransfer.ackSend({
                    'error' : '',
                    'responseOK' : true,
                    'responseRight' : '11',
                    'urlBase' : srvConfig.c4pUrlBase,// Must be the same or srvData will force a reconnect on this new URL
                    'responseLog' : '',
                    'responseRedirect' : '',
                    'infoMessage' : '', //'TEST TODO <a href="http://www.apps4pro.com">site web</a> <br> avec super saut<br> <strong>Download</strong><br>'
                    'currencyIsoCode' : null,
                    'currencySymbol' : "\xe2\x82\xac",
                    'userLanguage' : 'fr',
                    'metaData' : {
                        'licence':'free',
                        "possibleCrms": ["c4p", "sf"],
                        'config':{
                            "exposeBetaFunctionalities": false
                        }
                    },
                    'c4pToken' : 'c4pToken'
                });
                expect(srvConfig.c4pUrlBase).toBe(srvConfig.c4pUrlBase);

                // Should download the fullmap
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlFullMap);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms.length).toBe(2);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[0]).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[1]).toBe('sf');
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                // Send response
                srvDataTransfer.ackSend({
                    'responseOK' : true,
                    'success' : true,
                    'log' : 'SfFullMap done.',
                    'currencyIsoCode' : null,
                    'currencySymbol' : "\xe2\x82\xac",
                    'userLanguage' : 'fr',
                    'nextLastUpdate' : null,
                    'userId' : {'sf_id' : '005i0000000I8c5AAC'},
                    'metaData' : {
                        'licence':'free',
                        "possibleCrms": ["c4p", "sf"],
                        'config':{
                            "exposeBetaFunctionalities": false
                        }
                    },
                    'map' : angular.copy(c4p.Demo),
                    'recent' : {},
                    'layout' : {},
                    'model' : {}
                });
                expect(srvData.currentItems.Contact.length).toBe(38);
                expect(srvData.currentItems.Account.length).toBe(16);
                expect(srvData.currentItems.Event.length).toBe(21);
                expect(srvData.currentItems.Document.length).toBe(11);
                expect(srvData.currentItems.Opportunity.length).toBe(31);
                expect(srvData.currentItems.Facet.length).toBe(1);

                // Full network pending status
                expect(srvDataTransfer.pendingSends.length).toBe(0);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);

                // We need to download 10 documents to empty pending requests

                // 00Pi0000000KnMpEAK : demo_pict1.jpg
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-02Z.jpg');
                srvFileTransfer.ackRecv("File test data 1");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // 00Pi0000000KnMzEAK : demo_sec_cv.pdf
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-030.pdf');
                srvFileTransfer.ackRecv("File test data 2");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // 00Pi0000000KnMuEAK : demo_contract_1.doc
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-031.doc');
                srvFileTransfer.ackRecv("File test data 3");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_001 : demo_ceo_welcome.mp4
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-032.mp4');
                srvFileTransfer.ackRecv("File test data 4");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_002 : demo_business_effort.xls
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-033.xls');
                srvFileTransfer.ackRecv("File test data 5");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_003 : demo_cv1.pdf
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-034.pdf');
                srvFileTransfer.ackRecv("File test data 6");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_004 : demo_doc_cv1.doc
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-035.doc');
                srvFileTransfer.ackRecv("File test data 7");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_005 : demo_hr_app.ppt
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-036.ppt');
                srvFileTransfer.ackRecv("File test data 8");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_006 : demo_p_why_apps4pro.ppt
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-037.ppt');
                srvFileTransfer.ackRecv("File test data 9");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_007 : demo_tab1.xls
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-038.xls');
                srvFileTransfer.ackRecv("File test data 10");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_008 : demo_test_img.jpg
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-039.jpg');
                srvFileTransfer.ackRecv("File test data 11");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // Full network pending status
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                // 'favorites' Facet automatic creation
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                expect(srvDataTransfer.pendingSends[0].params.type).toBe('Facet');
                expect(srvDataTransfer.pendingSends[0].params.id).toBe('Facet-03J');
                expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                expect(srvDataTransfer.pendingSends[0].params.fields.a4p_type).toBe('Facet');
                expect(srvDataTransfer.pendingSends[0].params.fields.name).toBe('Favorites');
                expect(srvDataTransfer.pendingSends[0].params.askedCrms.length).toBe(2);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[0]).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[1]).toBe('sf');
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                srvDataTransfer.ackSend();
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                expect(srvData.savingObject.action).toBeUndefined();
                expect(srvData.savingObject.dbid).toBeUndefined();

                // Full network pending status
                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(0);
                expect(srvDataTransfer.pendingSends.length).toBe(0);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);

                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                // Should get 'views/dialog/guiderCarousel.html'
                //httpBackend.expectGET('views/dialog/guiderCarousel.html');
                //httpBackend.flush();
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();

                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                navigationScope.setItemAndGoDetail(navigationScope.srvData.currentItems.Event[0]);
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                // when stopSpinner() and gotoSlide() are fired by $timeout service.
                timeoutService.flush(); // yes for now
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                timeoutService.verifyNoPendingTasks();
                expect(refreshDiag).toBeNull();
                expect(navigationScope.srvData.userId.sf_id).toEqual('005i0000000I8c5AAC');

                // The first DEMO Event should be selected : sf_id == 00Ui00000013wRCEAY
                expect(navigationScope.srvNav.current.id).toEqual(navigationScope.srvData.currentItems.Event[0].id.dbid);

                navigationScope.setItemAndGoDetail(navigationScope.srvData.currentItems.Event[0]);
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                // when stopSpinner() and gotoSlide() are fired by $timeout service.
                timeoutService.flush(); // yes for now
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                timeoutService.verifyNoPendingTasks();

                expect(navigationScope.srvSynchro.pendingRequests.length).toEqual(0);
                expect(navigationScope.filteredContacts.length).toEqual(0);
                expect(navigationScope.filteredAccounts.length).toEqual(0);
                expect(navigationScope.filteredEvents.length).toEqual(0);
                expect(navigationScope.filteredOpportunities.length).toEqual(0);
                expect(navigationScope.filteredDocuments.length).toEqual(0);
                expect(navigationScope.contactQuery.length).toBe(0);
                expect(navigationScope.accountQuery.length).toBe(0);
                expect(navigationScope.eventQuery.length).toBe(0);
                expect(navigationScope.opportunityQuery.length).toBe(0);
                expect(navigationScope.documentQuery.length).toBe(0);

                expect(navigationScope.srvConfig.c4pUrlBase).toBe('http://127.0.0.1/c4p_server/www');
                expect(navigationScope.srvConfig.c4pUrlData).toBe('http://127.0.0.1/c4p_server/www/c4p_fill.php');
                expect(navigationScope.srvConfig.c4pUrlUpload).toBe('http://127.0.0.1/c4p_server/www/c4p_upload.php');
                expect(navigationScope.srvConfig.c4pUrlUploadFile).toBe('http://127.0.0.1/c4p_server/www/c4p_uploadFile.php');

                // Select the first DEMO Event : sf_id == 00Ui00000013wRCEAY => create a Plan and Note in the empty Meeting
                navigationScope.setItemAndGoMeeting(navigationScope.srvData.currentItems.Event[0]);
                meetingScope = navigationScope.$new();

                var controller = $controller(ctrlMeeting, {
                    $scope:meetingScope,
                    srvConfig:srvConfig,
                    srvLocale:srvLocale,
                    srvData:srvData,
                    srvNav:srvNav
                });

                actionScope = meetingScope.$new();
                controller = $controller(ctrlAction, {
                    $scope:actionScope,
                    srvConfig:srvConfig,
                    srvLocale:srvLocale,
                    srvData:srvData,
                    srvLink:srvLink,
                    srvNav:srvNav,
                    srvFacet:srvFacet
                });

                actionScope.watchSrvNav();

                expect(meetingScope.slide).toBe('meeting');
                expect(meetingScope.page).toBe('meeting');

                expect(meetingScope.srvNav.current).not.toBeNull();
                expect(meetingScope.srvNav.current.type).toBe('Event');

                expect(srvData.currentItems.Contact.length).toBe(38);
                expect(srvData.currentItems.Account.length).toBe(16);
                expect(srvData.currentItems.Event.length).toBe(21);
                expect(srvData.currentItems.Document.length).toBe(11);
                expect(srvData.currentItems.Opportunity.length).toBe(31);
                expect(srvData.currentItems.Facet.length).toBe(1);

                // Full network pending status
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                // default Note automatic creation in empty Meeting
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                expect(srvDataTransfer.pendingSends[0].params.type).toBe('Note');
                expect(srvDataTransfer.pendingSends[0].params.id).toBe('Note-03K');
                expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(2);
                expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                expect(srvDataTransfer.pendingSends[0].params.created[1].crm).toBe('sf');
                expect(srvDataTransfer.pendingSends[0].params.created[1].id).toBeUndefined();
                expect(srvDataTransfer.pendingSends[0].params.fields.a4p_type).toBe('Note');
                expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe(srvLocale.translations.htmlFormTitle);
                expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe(srvLocale.translations.htmlFormDescription);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms.length).toBe(2);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[0]).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[1]).toBe('sf');
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                srvDataTransfer.ackSend();
                timeStart = new Date().getTime();
            });

            waitsFor(function () {
                return ((new Date().getTime() - timeStart) > 1000);
            }, "wait for 1 s", 2000);

            runs(function () {

                expect(srvData.savingObject.action).toBeUndefined();
                expect(srvData.savingObject.dbid).toBeUndefined();

                // Full network pending status
                expect(srvDataTransfer.pendingSends.length).toBe(0);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(0);

            });

        }));

        afterEach(function () {

            // Restore globalspace variables

            window.device = oldWindowDevice;
            Camera = oldCamera;
            navigator.camera = oldNavigatorCamera;

        });

        describe('takePicture', function () {

            var error = null;
            var end = false;

            beforeEach(inject(function ($controller) {

                runs(function () {
                    // remove all files

                    runs(function () {
                        end = false;
                        error = null;
                        // Files created in a4pSpec.js tests
                        srvFileStorage.deleteFullDir('/dir1', function () {
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                    });

                    // latch function polls until it returns true or 10s timeout expires
                    waitsFor(function () {
                            return end;
                        },
                        "/dir1 should be deleted",
                        10000);

                    runs(function () {
                        if (error) {
                            expect(error).toBe('File not found');
                        }
                    });

                    runs(function () {
                        end = false;
                        error = null;
                        // Pictures taken in ctrlNavigation or MeetingCtrl during controllerSpec.js tests
                        srvFileStorage.deleteFullDir('/a4p/c4p/doc', function () {
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                    });

                    // latch function polls until it returns true or 10s timeout expires
                    waitsFor(function () {
                            return end;
                        },
                        "/a4p/c4p/doc should be deleted",
                        10000);

                    runs(function () {
                        if (error) {
                            expect(error).toBe('File not found');
                        }
                    });

                });

            }));

            it('should take a picture', function () {

                var dirEntries = null;
                var fileEntries = null;

                runs(function () {
                    srvRunning.setOnline(false);
                    expect(srvConfig.getActiveCrms().length).toBe(2);
                    expect(srvConfig.getActiveCrms()[0]).toBe('c4p');
                    expect(srvConfig.getActiveCrms()[1]).toBe('sf');
                    // Mocked navigator.camera is called => 'a4p/c4p/doc/dummy_picture.jpg'
                    actionScope.createNewPicture(actionScope.srvData.currentItems.Event[0]);
                    timeStart = new Date().getTime();
                });

                // wait for 10s to let time for srvFileStorage to write the file
                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    if (!actionScope.$$phase) actionScope.$apply();// propagate promise resolution
                    timeStart = new Date().getTime();
                });

                // wait for 10s to let time for srvFileStorage to write the file
                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    if (!actionScope.$$phase) actionScope.$apply();// propagate promise resolution

                    expect(actionScope.srvData.currentItems.Document.length).toBe(12);
                	var picture = actionScope.srvData.currentItems.Document[actionScope.srvData.currentItems.Document.length-1];

                    expect(picture).not.toBeNull();
                    expect(picture.filePath).toMatch('a4p/c4p/doc/Response_to_CFT_presentation_[0-9]+.jpg');
                    // URL=filesystem:https://127.0.0.1(:[0-9]+)?/persistent/... with runner.html
                    // URL=filesystem:http://localhost(:[0-9]+)?/persistent/... with JsTestDriver
                    expect(picture.url).toMatch('/persistent/a4p/c4p/doc/Response_to_CFT_presentation_[0-9]+.jpg');
                    expect(picture.path).toBe('a4p/c4p/doc');

                    error = null;
                    end = false;
                    srvFileStorage.getFile('a4p/c4p/doc/' + picture.name,
                    function (fileEntry) {
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {return end;}, "Picture file should be found", 1000);

                runs(function () {
                    expect(error).toBeNull();

                    // Trace content of directory a4p/c4p/doc, just for info
                    dirEntries = null;
                    fileEntries = null;
                    end = false;
                    error = null;
                    srvFileStorage.readDirectory(
                        'a4p/c4p/doc',
                        function (dirs, files) {
                            dirEntries = dirs;
                            fileEntries = files;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {return end;}, "a4p/c4p/doc directory should be read", 1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(dirEntries).not.toBeNull();
                    expect(fileEntries).not.toBeNull();
                    expect(dirEntries.length).toBe(0);
                    expect(fileEntries.length).toBeGreaterThan(0);
                    console.log('' + fileEntries.length + ' files found in /a4p/c4p/doc :');
                    for (var i = 0; i < fileEntries.length; i++) {
                        console.log(fileEntries[i]);
                    }
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    var picture = navigationScope.srvData.currentItems.Document[navigationScope.srvData.currentItems.Document.length-1];
                    expect(meetingScope.srvSynchro.pendingRequests.length).toBe(1);
                    expect(meetingScope.srvSynchro.pendingRequests[0].url).toBe('http://127.0.0.1/c4p_server/www/c4p_uploadFile.php');
                    // params created upon sending each HTTP request
                    //expect(meetingScope.srvSynchro.pendingRequests[0].params.time).toMatch(new RegExp('\\d+'));
                    //expect(meetingScope.srvSynchro.pendingRequests[0].params.cache).toBe(false);
                    expect(meetingScope.srvSynchro.pendingRequests[0].params.uploadFileInCrm).toEqual(true);
                    expect(meetingScope.srvSynchro.pendingRequests[0].params.shareFileInCrm).toEqual(false);
                    expect(meetingScope.srvSynchro.pendingRequests[0].params.type).toEqual('Document');
                    expect(meetingScope.srvSynchro.pendingRequests[0].params.fileName).toEqual(picture.name);
                    expect(meetingScope.srvSynchro.pendingRequests[0].params.object_id.dbid).toEqual(navigationScope.srvData.currentItems.Event[0].id.dbid);

                    srvRunning.setOnline(true);

                    expect(srvFileTransfer.pendingSends.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlUploadFile);//Response_to_CFT_presentation
                    expect(srvFileTransfer.pendingSends[0].filePath).toMatch('a4p/c4p/doc/Response_to_CFT_presentation_[0-9]+.jpg');
                    expect(srvFileTransfer.pendingSends[0].params.idx).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.nb).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvFileTransfer.pendingSends[0].params.id).toBe('Document-03N');
                    expect(srvFileTransfer.pendingSends[0].params.uploadFileInCrm).toBe(true);
                    expect(srvFileTransfer.pendingSends[0].params.shareFileInCrm).toBe(false);
                    expect(srvFileTransfer.pendingSends[0].params.fileName).toMatch('Response_to_CFT_presentation_[0-9]+.jpg');
                    expect(srvFileTransfer.pendingSends[0].params.fileUid).toBe('Document-03N');
                    expect(srvFileTransfer.pendingSends[0].params.object_id.dbid).toBe('Event-01J');
                    expect(srvFileTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    expect(srvFileTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.created[0].crm).toBe('sf');
                    expect(srvFileTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvFileTransfer.pendingSends[0].options.fileKey).toBe('file');
                    expect(srvFileTransfer.pendingSends[0].options.fileName).toMatch('Response_to_CFT_presentation_[0-9]+.jpg');
                    expect(srvFileTransfer.pendingSends[0].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.created[i].id
                    srvFileTransfer.ackSend();

                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(meetingScope.srvSynchro.pendingRequests.length).toBe(0);

                    // Quit Meeting view to trigger Plan and Plannee saving
                    meetingScope.quitMeetingView();

                    timeStart = new Date().getTime();
                });

                waitsFor(function () {
                    return ((new Date().getTime() - timeStart) > 1000);
                }, "wait for 1 s", 2000);

                runs(function () {
                    // when stopSpinner() and gotoSlide() are fired by $timeout service (by quitMeetingView).
                    timeoutService.flush(); // yes for now
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {
                    return ((new Date().getTime() - timeStart) > 1000);
                }, "wait for 1 s", 2000);

                runs(function () {
                    timeoutService.verifyNoPendingTasks();

                    // Full network pending status
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    // Plan and Plannee saving
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Plan');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Plan-03L');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.a4p_type).toBe('Plan');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe(srvLocale.translations.htmlFormTitle);
                    expect(srvDataTransfer.pendingSends[0].params.askedCrms.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.askedCrms[0]).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.askedCrms[1]).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {
                    return ((new Date().getTime() - timeStart) > 1000);
                }, "wait for 1 s", 2000);

                runs(function () {

                    // Full network pending status
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    // Plan and Plannee saving
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Plannee');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Plannee-03M');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.a4p_type).toBe('Plannee');
                    expect(srvDataTransfer.pendingSends[0].params.askedCrms.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.askedCrms[0]).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.askedCrms[1]).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {
                    return ((new Date().getTime() - timeStart) > 1000);
                }, "wait for 1 s", 2000);

                runs(function () {

                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();

                    // Full network pending status
                    expect(srvDataTransfer.pendingSends.length).toBe(0);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);
                });
            });

        });

        describe('sendEmail', function () {

            it('should send an email', function () {

                runs(function () {
                    srvRunning.setOnline(false);
                    expect(srvConfig.getActiveCrms().length).toBe(2);
                    expect(srvConfig.getActiveCrms()[0]).toBe('c4p');
                    expect(srvConfig.getActiveCrms()[1]).toBe('sf');
                    //send email without doc => use $http
                    var testEmail = {
                			'emailType': 'normal',
                            'subject': 'test send email subject',
                            'body': 'test send email body',
                            'contacts': [{dbid : meetingScope.srvData.currentItems.Contact[4].id.dbid}, {dbid : meetingScope.srvData.currentItems.Contact[5].id.dbid}],
                            'documents':[],
                            'emailsInput':[]
                        };
                    meetingScope.addEmailToParent(null, false, testEmail, meetingScope.srvData.currentItems.Event[0]);
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                	//without demo mode , verify data of request
                    expect(meetingScope.srvSynchro.pendingRequests.length).toBe(1);
                    expect(meetingScope.srvSynchro.pendingRequests[0].url).toBe('http://127.0.0.1/c4p_server/www/c4p_sendEmail.php');
                    var params = meetingScope.srvSynchro.pendingRequests[0].params;
                    //mail_object=test+send+email+subject&mail_body=test+send+email+body&c4pToken=1369753190%7C9b2621356c9242585fd19d9596b40c3b%7C&object_id%5Bsf_id%5D=00Ui00000013wRCEAY&object_id%5Bdbid%5D=Event-14G&emails%5B%5D=jrogers%40burlington.com&emails%5B%5D=pat%40pyramid.net"
                    expect(params.mail_object).toBe('test send email subject');
                    expect(params.mail_body).toBe('test send email body');
                    expect(params.c4pToken).toMatch(/[0-9]*|[a-z0-9]*|/);
                    expect(params.object_id.sf_id).toBe(meetingScope.srvData.currentItems.Event[0].id.sf_id);
                    expect(params.object_id.dbid).toMatch(/Event-[0-9A-Z]*/);
                    expect(params.emails.length).toBe(2);
                    expect(params.emails[0]).toBe('sjackson@orpkick.com');
                    expect(params.emails[1]).toBe('pdemaud@rpdrive.com');

                    srvRunning.setOnline(true);

                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSendEmail);
                    expect(srvDataTransfer.pendingSends[0].params.mail_object).toBe('test send email subject');
                    expect(srvDataTransfer.pendingSends[0].params.mail_body).toBe('test send email body');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).toMatch(/[0-9]*|[a-z0-9]*|/);
                    expect(srvDataTransfer.pendingSends[0].params.object_id.sf_id).toBe(meetingScope.srvData.currentItems.Event[0].id.sf_id);
                    expect(srvDataTransfer.pendingSends[0].params.object_id.dbid).toMatch(/Event-[0-9A-Z]*/);
                    expect(srvDataTransfer.pendingSends[0].params.emails.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.emails[0]).toBe('sjackson@orpkick.com');
                    expect(srvDataTransfer.pendingSends[0].params.emails[1]).toBe('pdemaud@rpdrive.com');
                    // Send response : id = 'sf_ID_'+send.params.object_id.dbid
                    srvDataTransfer.ackSend();

                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {

                    //request download email document
                    srvRunning.setOnline(false);

                    expect(meetingScope.srvSynchro.pendingRequests.length).toBe(1);
                    expect(meetingScope.srvSynchro.pendingRequests[0].filePath).toMatch('a4p/c4p/doc/Document-[0-9A-Z]*.pdf');
                    expect(meetingScope.srvSynchro.pendingRequests[0].ctx.title).toMatch('Download Document ');
                    var url = meetingScope.srvSynchro.pendingRequests[0].url.split('&');
                    expect(url[0]).toBe('http://127.0.0.1/c4p_server/www/c4p_download.php?type=Document');
                    expect(url[1]).toMatch(/dbid=Document-[0-9A-Z]*/);
                    expect(url[2]).toBe('sf_id=sf_ID_Event-01J');
                    expect(url[3]).toMatch('mimetype=application%2Fpdf');

                    expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                    expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                    expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('a4p/c4p/doc/Document-03N.pdf');

                    srvRunning.setOnline(true);
                    srvFileTransfer.ackRecv("File test email 1");

                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(meetingScope.srvSynchro.pendingRequests.length).toBe(0);

                    // TODO :  why are there 2 downloads of the same file ?

                    expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                    expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                    expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('a4p/c4p/doc/Document-03N.pdf');
                    srvFileTransfer.ackRecv("File test email 1");

                    timeStart = new Date().getTime();
                });

                waitsFor(function () {
                    return ((new Date().getTime() - timeStart) > 1000);
                }, "wait for 1 s", 2000);

                runs(function () {
                    expect(meetingScope.srvSynchro.pendingRequests.length).toBe(0);

                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);
                });
            });

        });

        describe('writeNote', function () {

            it('should write a note', function () {

                var today = null;
                var fullToday = null;

                runs(function () {
                    srvRunning.setOnline(false);
                    expect(srvConfig.getActiveCrms().length).toBe(2);
                    expect(srvConfig.getActiveCrms()[0]).toBe('c4p');
                    expect(srvConfig.getActiveCrms()[1]).toBe('sf');
                    var testReport = {
                        'a4p_type':'Report',
                        	'contact_ids' : [{dbid : meetingScope.srvData.currentItems.Contact[4].id.dbid}],
                            'document_ids' : [],
                            'ratings' : [{name:'Feeling',value:'5',id:'0'}],
                            'title': 'report title',
                            'description': 'report desc',
                            'message' : 'report message'
                        };
                    meetingScope.addNewReport(testReport);

                    // Original dates for the FIRST event are date_start:"2013-03-28 15:02:00", date_end:"2013-03-28 16:02:00"
                    // They must be updated to the current time (cf : adjustDate() in data service)
                    var today_app4pro = a4pDateParse('2013-04-25 00:00:00');
                    var now = new Date();
                    var timestampDif = now.getTime() - today_app4pro.getTime() - (((now.getHours()*60 + now.getMinutes())*60)+now.getSeconds())*1000 ;
                    var date = a4pDateParse("2013-03-28 15:02:00");
                    var timestamp = date.getTime() + timestampDif;
                    var newDate = new Date(timestamp);
                    today = a4pPadNumber(newDate.getFullYear(), 4) + '-'
                        + a4pPadNumber(newDate.getMonth() + 1, 2) + '-'
                        + a4pPadNumber(newDate.getDate(), 2) + ' '
                        + a4pPadNumber(newDate.getHours(), 2) + ':'
                        + a4pPadNumber(newDate.getMinutes(), 2) + ':'
                        + a4pPadNumber(newDate.getSeconds(), 2);
                    fullToday = srvLocale.formatDate(newDate, 'fullDate');

                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(meetingScope.srvSynchro.pendingRequests.length).toBe(1);
                    expect(meetingScope.srvSynchro.pendingRequests[0].url).toBe('http://127.0.0.1/c4p_server/www/c4p_create.php');
                    var params = meetingScope.srvSynchro.pendingRequests[0].params;
                    expect(params.type).toBe('Report');
                    expect(params.c4pToken).toMatch(/[0-9]*|[a-z0-9]*|/);
                    expect(params.fields.id.dbid).not.toBeUndefined();
                    expect(params.fields.id.sf_id).toBeUndefined();
                    expect(params.fields.id.c4p_id).toBeUndefined();
                    expect(params.fields.parent_id.sf_id).toBe(meetingScope.srvData.currentItems.Event[0].id.sf_id);
                    expect(params.fields.parent_id.dbid).toMatch(/Event-[0-9A-Z]*/);
                    expect(params.fields.title).toBe('report title');
                    expect(params.fields.description).toBe('report desc');
                    expect(params.fields.message).toBe('report message');
                    expect(params.fields.ratings.length).toBe(1);
                    expect(params.fields.ratings[0].name).toBe('Feeling');
                    expect(params.fields.ratings[0].value).toBe('5');
                    expect(params.contacts.length).toBe(1);
                    expect(params.contacts[0].salutation).toBe('Ms.');
                    expect(params.contacts[0].first_name).toBe('Sarah');
                    expect(params.contacts[0].last_name).toBe('Jackson');
                    expect(params.contacts[0].department).toBe('');
                    expect(params.contacts[0].phone_work).toBe('');
                    expect(params.contacts[0].phone_house).toBe('');
                    expect(params.contacts[0].phone_mobile).toBe('');
                    expect(params.contacts[0].email).toBe('sjackson@orpkick.com');
                    expect(params.accounts.length).toBe(1);
                    expect(params.accounts[0].company_name).toBe('Orpkick');
                    expect(params.documents.length).toBe(0);

                    srvRunning.setOnline(true);

                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('report title');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Report-03N');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.created[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.created[1].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('report desc');
                    expect(srvDataTransfer.pendingSends[0].params.fields.message).toBe('report message');
                    expect(srvDataTransfer.pendingSends[0].params.fields.ratings.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.fields.ratings[0].name).toBe('Feeling');
                    expect(srvDataTransfer.pendingSends[0].params.fields.ratings[0].value).toBe('5');
                    expect(srvDataTransfer.pendingSends[0].params.contacts.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.contacts[0].last_name).toBe('Jackson');
                    expect(srvDataTransfer.pendingSends[0].params.accounts.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.accounts[0].company_name).toBe('Orpkick');
                    expect(srvDataTransfer.pendingSends[0].params.documents.length).toBe(0);
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();

                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
    	            expect(meetingScope.srvSynchro.pendingRequests.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(0);
    	        });
            });

        });

    });

});
