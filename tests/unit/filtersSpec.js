
/* jasmine specs for filters go here */

describe('filter', function () {
'use strict';

    var httpBackend, srvLocale;

    beforeEach(function () {
        module('ui.bootstrap');
        module('c4pServices');
        module('c4p.filters');
        module(function ($provide) {
            var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
            var srvLocalStorage = new LocalStorage();
            $provide.value('version', "TEST_VER");
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

    beforeEach(inject(function ($rootScope, $controller, $injector) {
        httpBackend = $injector.get('$httpBackend');
        httpBackend.when('GET', 'models/c4p_conf.json').respond({
            "buildDate" : "130911",
            "urlBase" : "https://127.0.0.1/c4ph5/www",
            "trustAllHosts" : false,
            "possibleCrms" : ["c4p", "sf"],
            "activeCrms" : ["c4p", "sf"],
            "config" : {
                "exposeBetaFunctionalities" : false
            }
        });
        httpBackend.when('GET', 'models/local_en.json').respond(c4p.Locale.en);
        httpBackend.when('GET', 'models/local_fr.json').respond(c4p.Locale.fr);
        httpBackend = $injector.get('$httpBackend');
        srvLocale = $injector.get('srvLocale');
        srvLocale.resetLocale();// english by default
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('interpolate', function () {

        it('should replace VERSION', inject(function (interpolateFilter) {
            expect(interpolateFilter('before %VERSION% after')).toEqual('before TEST_VER after');
        }));

        it('should not replace DUMMY', inject(function (interpolateFilter) {
            expect(interpolateFilter('before %VERSIONS% after')).toEqual('before %VERSIONS% after');
        }));

    });

    describe('c4pCurrency', function () {

        it('should format a null english Euro amount', inject(function (c4pCurrencyFilter) {
            expect(c4pCurrencyFilter(0)).toEqual(a4p.Utf8.decode('\xe2\x82\xac')+'0.00');
        }));

        it('should format a non null english Euro amount', inject(function (c4pCurrencyFilter) {
            expect(c4pCurrencyFilter(1000)).toEqual(a4p.Utf8.decode('\xe2\x82\xac')+'1,000.00');
        }));

        it('should format a non null english Dollar amount', inject(function (c4pCurrencyFilter) {
            expect(c4pCurrencyFilter(1000, '\x24')).toEqual('$1,000.00');
        }));

        it('should format a null french Euro amount', inject(function (c4pCurrencyFilter) {
            httpBackend.expectGET('models/local_fr.json');
            srvLocale.setLanguage('fr');
            httpBackend.flush();
            expect(c4pCurrencyFilter(0)).toEqual('0,00 '+a4p.Utf8.decode('\xe2\x82\xac'));
        }));

        it('should format a non null french Euro amount', inject(function (c4pCurrencyFilter) {
            httpBackend.expectGET('models/local_fr.json');
            srvLocale.setLanguage('fr');
            httpBackend.flush();
            expect(c4pCurrencyFilter(1000)).toEqual('1 000,00 '+a4p.Utf8.decode('\xe2\x82\xac'));
        }));

        it('should format a non null french Dollar amount', inject(function (c4pCurrencyFilter) {
            httpBackend.expectGET('models/local_fr.json');
            srvLocale.setLanguage('fr');
            httpBackend.flush();
            expect(c4pCurrencyFilter(1000, '\x24')).toEqual('1 000,00 $');
        }));

    });

    describe('c4pNumber', function () {

        it('should format a non null english number', inject(function (c4pNumberFilter) {
            expect(c4pNumberFilter(1000, 0)).toEqual('1,000');
        }));

        it('should format a non null english number', inject(function (c4pNumberFilter) {
            expect(c4pNumberFilter(1000, 4)).toEqual('1,000.0000');
        }));

    });
});
