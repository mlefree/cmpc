

describe('SrvConfig', function () {
    'use strict';

    var srvConfig, srvDataTransfer, deferService, srvLoad, srvLocalStorage, srvAnalytics;

    beforeEach(function () {
        module('c4pServices');
        module(function ($provide) {
            var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
            srvLocalStorage = new LocalStorage();
            srvLocalStorage.set('UrlBase', 'http://host:4587');
            srvLocalStorage.set('TrustAllHosts', true);
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


    beforeEach(inject(function ($injector, $rootScope) {

        deferService = $injector.get('$q');
        srvLoad = new SrvLoad();
        srvDataTransfer = new MockDataTransfer(deferService, $rootScope); //$injector.get('srvDataTransfer');

    }));

    afterEach(function () {
        expect(srvDataTransfer.pendingSends.length).toBe(0);
        expect(srvDataTransfer.pendingRecvs.length).toBe(0);
    });

    describe('not initialized', function () {

        beforeEach(function () {

            srvConfig = new SrvConfig(srvDataTransfer, srvLoad, srvLocalStorage, srvAnalytics);

        });

        it('should be correctly initialized', function () {

            expect(srvConfig.c4pUrlBase).toEqual('');
            expect(srvConfig.c4pUrlData).toEqual('/c4p_fill.php');
            expect(srvConfig.c4pUrlUpload).toEqual('/c4p_upload.php');
            expect(srvConfig.trustAllHosts).toEqual(false);
            expect(srvConfig.env).toEqual('P');
            expect(srvConfig.initDone).toEqual(false);

            srvConfig.init();
            expect(srvConfig.initDone).toEqual(true);
            expect(srvConfig.c4pUrlBase).toEqual('http://host:4587');
            expect(srvConfig.c4pUrlData).toEqual('http://host:4587/c4p_fill.php');
            expect(srvConfig.c4pUrlUpload).toEqual('http://host:4587/c4p_upload.php');
            expect(srvConfig.trustAllHosts).toEqual(true);

        });

        it('should load config file', inject(function ($rootScope) {

            var done = false;

            srvConfig.init();
            srvConfig.startLoading(function() {
                done = true;
            });
            // SrvDataTransfer should have received a dataRequest
            expect(srvDataTransfer.pendingRecvs.length).toBe(1);
            expect(srvDataTransfer.pendingRecvs[0].url).toBe('models/c4p_conf.json');
            // Send response
            srvDataTransfer.ackRecv(
                {
                    "urlBase": "https://127.0.0.1/c4ph5/www",
                    "trustAllHosts": false
                },
                200,
                {}
            );
            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
            expect(done).toEqual(true);
            expect(srvConfig.c4pUrlBase).toEqual('https://127.0.0.1/c4ph5/www');
            expect(srvConfig.c4pUrlData).toEqual('https://127.0.0.1/c4ph5/www/c4p_fill.php');
            expect(srvConfig.c4pUrlUpload).toEqual('https://127.0.0.1/c4ph5/www/c4p_upload.php');
            expect(srvConfig.trustAllHosts).toEqual(false);
            var saved = srvLocalStorage.get('UrlBase', '');
            expect(saved).toEqual('https://127.0.0.1/c4ph5/www');
            saved = srvLocalStorage.get('TrustAllHosts', true);
            expect(saved).toEqual(false);

        }));

        it('should fail loading config file', inject(function ($rootScope) {

            var done = false;

            srvConfig.init();
            srvConfig.startLoading(function() {
                done = true;
            });
            // SrvDataTransfer should have received a dataRequest
            expect(srvDataTransfer.pendingRecvs.length).toBe(1);
            expect(srvDataTransfer.pendingRecvs[0].url).toBe('models/c4p_conf.json');
            // Send response
            srvDataTransfer.errRecv('Error : c4p_conf.json unknown', 404, function () {
                return undefined;
            });
            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
            expect(srvLoad.status).toEqual('Initializing Configuration failed : use default values.');
            expect(srvLoad.error).toEqual('Data download failure : response=Error : c4p_conf.json unknown (status=404)');
            expect(done).toEqual(true);
            expect(srvConfig.c4pUrlBase).toEqual('http://host:4587');
            expect(srvConfig.c4pUrlData).toEqual('http://host:4587/c4p_fill.php');
            expect(srvConfig.c4pUrlUpload).toEqual('http://host:4587/c4p_upload.php');
            expect(srvConfig.trustAllHosts).toEqual(true);
            var saved = srvLocalStorage.get('UrlBase', '');
            expect(saved).toEqual('http://host:4587');
            saved = srvLocalStorage.get('TrustAllHosts', false);
            expect(saved).toEqual(true);

        }));

    });

    describe('initialized', function () {

        beforeEach(inject(function ($injector, $rootScope) {

            var done = false;
            srvLocalStorage.set('NameComposition', {'Lead':1});
            srvConfig = new SrvConfig(srvDataTransfer, srvLoad, srvLocalStorage, srvAnalytics);

            srvConfig.init();
            srvConfig.startLoading(function() {
                done = true;
            });
            // SrvDataTransfer should have received a dataRequest
            expect(srvDataTransfer.pendingRecvs.length).toBe(1);
            expect(srvDataTransfer.pendingRecvs[0].url).toBe('models/c4p_conf.json');
            // Send response
            srvDataTransfer.ackRecv(
                {
                    "urlBase": "https://127.0.0.1/c4ph5/www",
                    "trustAllHosts": false
                },
                200,
                {}
            );
            //if (!$rootScope.$$phase) $rootScope.$apply();// Propagate promise resolution
            expect(done).toEqual(true);
            expect(srvConfig.c4pUrlBase).toEqual('https://127.0.0.1/c4ph5/www');
            expect(srvConfig.c4pUrlData).toEqual('https://127.0.0.1/c4ph5/www/c4p_fill.php');
            expect(srvConfig.c4pUrlUpload).toEqual('https://127.0.0.1/c4ph5/www/c4p_upload.php');
            expect(srvConfig.trustAllHosts).toEqual(false);
            var saved = srvLocalStorage.get('UrlBase', '');
            expect(saved).toEqual('https://127.0.0.1/c4ph5/www');
            saved = srvLocalStorage.get('TrustAllHosts', true);
            expect(saved).toEqual(false);
        }));

        it('getNameComposition', function () {
            expect(srvLocalStorage.get('NameComposition', {})['Lead']).toEqual(1);
            expect(srvConfig.getNameComposition('')).toBe(0);
            expect(srvConfig.getNameComposition('toto')).toBe(0);
            expect(srvConfig.getNameComposition()).toBe(0);
            expect(srvConfig.getNameComposition(null)).toBe(0);
            expect(srvConfig.getNameComposition(undefined)).toBe(0);
            expect(srvConfig.getNameComposition('Contact')).toBe(0);
            expect(srvLocalStorage.get('NameComposition', {})['Contact']).toBeUndefined();
            srvConfig.setNameComposition('Contact', 1);
            expect(srvLocalStorage.get('NameComposition', {})['Contact']).toEqual(1);
            expect(srvConfig.getNameComposition('Contact')).toBe(1);
        });



        it('setNameComposition', function () {
            srvConfig.setNameComposition('', 0);
            expect(srvLocalStorage.get('NameComposition', {})['']).toEqual(0);
            expect(srvConfig.getNameComposition('')).toBe(0);
            srvConfig.setNameComposition('toto', 0);
            expect(srvLocalStorage.get('NameComposition', {})['toto']).toEqual(0);
            expect(srvConfig.getNameComposition('toto')).toBe(0);
            expect(srvLocalStorage.get('NameComposition', {})['Lead']).toEqual(1);
            expect(srvConfig.getNameComposition('Lead')).toBe(1);
            srvConfig.setNameComposition('Lead', 2);
            expect(srvLocalStorage.get('NameComposition', {})['Lead']).toEqual(2);
            expect(srvConfig.getNameComposition('Lead')).toBe(2);
            srvConfig.setNameComposition(null, 2);
            expect(srvLocalStorage.get('NameComposition', {})[null]).toEqual(2);
            expect(srvConfig.getNameComposition(null)).toBe(2);
            srvConfig.setNameComposition(undefined, 2);
            expect(srvLocalStorage.get('NameComposition', {})[undefined]).toEqual(2);
            expect(srvConfig.getNameComposition(undefined)).toBe(2);
        });

        it('getItemName', function () {
            var item = {
               a4p_type:'Contact',
                salutation:'Mr',
                first_name:'John',
                last_name:'Doe'
            };
            srvConfig.setNameComposition('Contact', 0);
            expect(srvConfig.getItemName(item)).toEqual('Doe John');
            srvConfig.setNameComposition('Contact', 1);
            expect(srvConfig.getItemName(item)).toEqual('John Doe');
            srvConfig.setNameComposition('Contact', 2);
            expect(srvConfig.getItemName(item)).toEqual('Mr John Doe');
            srvConfig.setNameComposition('Contact', 3);
            expect(srvConfig.getItemName(item)).toEqual('Mr Doe John');
            srvConfig.setNameComposition('Contact', 4);
            expect(srvConfig.getItemName(item)).toEqual('');

            var company = {
                a4p_type:'Account',
                company_name:'apps4pro'
            };
            srvConfig.setNameComposition('Account', 0);
            expect(srvConfig.getItemName(company)).toEqual('apps4pro');
            srvConfig.setNameComposition('Account', 1);
            expect(srvConfig.getItemName(company)).toEqual('');

            expect(srvConfig.getItemName(null)).toEqual('');
            expect(srvConfig.getItemName(undefined)).toEqual('');
            expect(srvConfig.getItemName('')).toEqual('');
            expect(srvConfig.getItemName('toto')).toEqual('');
            expect(srvConfig.getItemName(1)).toEqual('');
        });

    });

});
