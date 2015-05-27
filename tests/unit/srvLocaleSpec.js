

describe('SrvLocale', function () {
'use strict';

    var srvLocale, httpBackend, httpService, srvLoad, srvLocalStorage;

    beforeEach(module('c4p.services'));

    beforeEach(inject(function ($injector) {
        var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
        httpBackend = $injector.get('$httpBackend');
        httpService = $injector.get('$http');
        srvLoad = new SrvLoad();//$injector.get('srvLoad');
        srvLocalStorage = new LocalStorage();//$injector.get('srvLocalStorage');
        srvLocalStorage.set('Translations', {
            "htmlTitleConfigYourAccount":"Votre compte",
            "htmlTitleConfigSystemStatus":"Etat systeme",
            "htmlTextInitializingLocale":"Initializing Locale ...",
            "htmlMsgLoadLocaleReady":"Locale {0} ready.",
            "htmlMsgLoadLocalePb":"Initializing Locale failed : use previous values."
        });
        srvLocalStorage.set('Locale', {code:'fr', title:"Francais"});
        srvLocalStorage.set('NumberPattern', {
            decimalSeparator:',',
            groupSeparator:' ',
            decimalPattern:{
                minInt:1,
                minFrac:0,
                maxFrac:3,
                posPre:'',
                posSuf:'',
                negPre:'-',
                negSuf:'',
                gSize:3,
                lgSize:3
            },
            currencyPattern:{
                minInt:1,
                minFrac:2,
                maxFrac:2,
                posPre:'',
                posSuf:' \u00A4',
                negPre:'(',
                negSuf:' \u00A4)',
                gSize:3,
                lgSize:3
            }
        });
        srvLocale = new SrvLocale(httpService, srvLoad, srvLocalStorage);
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should be correctly initialized', function () {

        // clear() use "en" and c4p.Locale.en structure
        expect(srvLocale.translations).not.toBeNull();
        expect(srvLocale.translations.htmlTitleConfigYourAccount).toEqual('Your account');
        expect(srvLocale.translations.htmlTitleConfigSystemStatus).toEqual('System status');
        expect(srvLocale.currency).toEqual("\xe2\x82\xac");
        expect(srvLocale.language).toEqual('en');
        expect(srvLocale.langs.length).toBeGreaterThan(1);
        expect(srvLocale.lang).toEqual(srvLocale.langs[0]);
        expect(srvLocale.lang1).toEqual('en');
        expect(srvLocale.lang2).toEqual('en');
        expect(srvLocale.lang3).toEqual('en');
        expect(srvLocale.numberPatterns.length).toBeGreaterThan(1);
        expect(srvLocale.numberPattern).toEqual(srvLocale.numberPatterns[0]);
        expect(srvLocale.initDone).toEqual(false);

        srvLocale.init();
        expect(srvLocale.translations.htmlTitleConfigYourAccount).toEqual('Votre compte');
        expect(srvLocale.translations.htmlTitleConfigSystemStatus).toEqual('Etat systeme');
        expect(srvLocale.currency).toEqual("\xe2\x82\xac");
        expect(srvLocale.language).toEqual('en');
        expect(srvLocale.langs.length).toBeGreaterThan(1);
        expect(srvLocale.lang).toEqual({code:'fr', title:"Francais"});
        expect(srvLocale.lang1).toEqual('fr');
        expect(srvLocale.lang2).toEqual('fr');
        expect(srvLocale.lang3).toEqual('fr');
        expect(srvLocale.numberPatterns.length).toBeGreaterThan(1);
        expect(srvLocale.numberPattern).toEqual(srvLocale.numberPatterns[1]);// fr pattern
        expect(srvLocale.initDone).toEqual(true);

    });

    it('should load locale file', function () {

        var done = false;

        srvLocale.init();

        httpBackend.when('GET', 'models/local_fr.json').respond(200, {
            "htmlTitleConfigYourAccount":"Votre compte2",
            "htmlTitleConfigSystemStatus":"Etat systeme2"
        }, {});
        httpBackend.expectGET('models/local_fr.json');
        srvLocale.startLoading(function() {
            done = true;
        });
        httpBackend.flush();
        expect(done).toEqual(true);
        expect(srvLocale.translations.htmlTitleConfigYourAccount).toEqual('Votre compte2');
        expect(srvLocale.translations.htmlTitleConfigSystemStatus).toEqual('Etat systeme2');

        expect(srvLocale.formatNumber(1000)).toEqual('1 000');
        expect(srvLocale.formatCurrency(1000)).toEqual('1 000,00 ' + a4p.Utf8.decode("\xe2\x82\xac"));

        var refDate = a4pDateParse("2013-07-01 07:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 7:34 AM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('7:34 AM');
        refDate = a4pDateParse("2013-07-01 17:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 5:34 PM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('5:34 PM');
        refDate = "2013-07-01 07:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 7:34 AM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('7:34 AM');
        refDate = "2013-07-01 17:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 5:34 PM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('5:34 PM');

    });

    it('should fail loading locale file', function () {

        var done = false;

        srvLocale.init();

        httpBackend.when('GET', 'models/local_fr.json').respond(404, '', {});
        httpBackend.expectGET('models/local_fr.json');
        srvLocale.startLoading(function() {
            done = true;
        });
        httpBackend.flush();
        expect(done).toEqual(true);
        expect(srvLocale.translations.htmlTitleConfigYourAccount).toEqual('Votre compte');
        expect(srvLocale.translations.htmlTitleConfigSystemStatus).toEqual('Etat systeme');

        expect(srvLocale.formatNumber(1000)).toEqual('1 000');
        expect(srvLocale.formatCurrency(1000)).toEqual('1 000,00 ' + a4p.Utf8.decode("\xe2\x82\xac"));

        var refDate = a4pDateParse("2013-07-01 07:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 7:34 AM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('7:34 AM');
        refDate = a4pDateParse("2013-07-01 17:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 5:34 PM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('5:34 PM');
        refDate = "2013-07-01T07:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 7:34 AM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('7:34 AM');
        refDate = "2013-07-01T17:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 5:34 PM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('5:34 PM');

    });

    it('should load locale fr_FR file', function () {

        srvLocale.init();

        httpBackend.when('GET', 'models/local_fr_fr.json').respond(200, {
            "htmlTitleConfigYourAccount":"Votre compte3",
            "htmlTitleConfigSystemStatus":"Etat systeme3"
        }, {});
        httpBackend.expectGET('models/local_fr_fr.json');
        srvLocale.setLang({code:'fr_FR', title:"French"});
        httpBackend.flush();
        expect(srvLocale.lang1).toEqual('fr');
        expect(srvLocale.lang2).toEqual('fr_fr');
        expect(srvLocale.lang3).toEqual('fr_fr');
        expect(srvLocale.translations.htmlTitleConfigYourAccount).toEqual('Votre compte3');
        expect(srvLocale.translations.htmlTitleConfigSystemStatus).toEqual('Etat systeme3');
        expect(srvLocale.numberPattern).toEqual(srvLocale.numberPatterns[1]);// fr pattern

        expect(srvLocale.formatNumber(1000)).toEqual('1 000');
        expect(srvLocale.formatCurrency(1000)).toEqual('1 000,00 ' + a4p.Utf8.decode("\xe2\x82\xac"));

        var refDate = a4pDateParse("2013-07-01 07:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('1 Jul 2013 07:34:56');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('1/7/13 07:34');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Lundi, 1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('1 Jul 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('1/7/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('07:34:56');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('07:34');
        refDate = a4pDateParse("2013-07-01 17:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('1 Jul 2013 17:34:56');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('1/7/13 17:34');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Lundi, 1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('1 Jul 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('1/7/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('17:34:56');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('17:34');
        refDate = "2013-07-01 07:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('1 Jul 2013 07:34:56');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('1/7/13 07:34');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Lundi, 1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('1 Jul 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('1/7/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('07:34:56');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('07:34');
        refDate = "2013-07-01 17:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('1 Jul 2013 17:34:56');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('1/7/13 17:34');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Lundi, 1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('1 Jul 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('1/7/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('17:34:56');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('17:34');

    });

    it('should load locale fr_FR_EURO file', function () {

        srvLocale.init();

        httpBackend.when('GET', 'models/local_fr_fr_euro.json').respond(200, {
            "htmlTitleConfigYourAccount":"Votre compte4",
            "htmlTitleConfigSystemStatus":"Etat systeme4"
        }, {});
        httpBackend.expectGET('models/local_fr_fr_euro.json');
        srvLocale.setLang({code:'fr_FR_EURO', title:"French"});
        httpBackend.flush();
        srvLocale.setCurrency("\xe2\x82\xac");
        expect(srvLocale.lang1).toEqual('fr');
        expect(srvLocale.lang2).toEqual('fr_fr');
        expect(srvLocale.lang3).toEqual('fr_fr_euro');
        expect(srvLocale.translations.htmlTitleConfigYourAccount).toEqual('Votre compte4');
        expect(srvLocale.translations.htmlTitleConfigSystemStatus).toEqual('Etat systeme4');
        expect(srvLocale.numberPattern).toEqual(srvLocale.numberPatterns[1]);// fr pattern

        expect(srvLocale.formatNumber(1000)).toEqual('1 000');
        expect(srvLocale.formatCurrency(1000)).toEqual('1 000,00 ' + a4p.Utf8.decode("\xe2\x82\xac"));

        var refDate = a4pDateParse("2013-07-01 07:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('1 Jul 2013 07:34:56');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('1/7/13 07:34');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Lundi, 1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('1 Jul 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('1/7/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('07:34:56');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('07:34');
        refDate = a4pDateParse("2013-07-01 17:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('1 Jul 2013 17:34:56');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('1/7/13 17:34');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Lundi, 1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('1 Jul 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('1/7/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('17:34:56');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('17:34');
        refDate = "2013-07-01 07:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('1 Jul 2013 07:34:56');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('1/7/13 07:34');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Lundi, 1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('1 Jul 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('1/7/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('07:34:56');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('07:34');
        refDate = "2013-07-01 17:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('1 Jul 2013 17:34:56');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('1/7/13 17:34');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Lundi, 1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('1 Juillet 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('1 Jul 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('1/7/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('17:34:56');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('17:34');

    });

    it('should load locale en_US_USD file', function () {

        srvLocale.init();

        httpBackend.when('GET', 'models/local_en_us_usd.json').respond(200, {
            "htmlTitleConfigYourAccount":"Votre compte5",
            "htmlTitleConfigSystemStatus":"Etat systeme5"
        }, {});
        httpBackend.expectGET('models/local_en_us_usd.json');
        srvLocale.setLang({code:'en_US_USD', title:"English"});
        httpBackend.flush();
        srvLocale.setCurrency("\x24");
        expect(srvLocale.lang1).toEqual('en');
        expect(srvLocale.lang2).toEqual('en_us');
        expect(srvLocale.lang3).toEqual('en_us_usd');
        expect(srvLocale.translations.htmlTitleConfigYourAccount).toEqual('Votre compte5');
        expect(srvLocale.translations.htmlTitleConfigSystemStatus).toEqual('Etat systeme5');
        expect(srvLocale.numberPattern).toEqual(srvLocale.numberPatterns[0]);// en pattern

        expect(srvLocale.formatNumber(1000)).toEqual('1,000');
        expect(srvLocale.formatCurrency(1000)).toEqual(a4p.Utf8.decode("\x24") + '1,000.00');

        var refDate = a4pDateParse("2013-07-01 07:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 7:34 AM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('7:34 AM');
        refDate = a4pDateParse("2013-07-01 17:34:56");
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 5:34 PM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('5:34 PM');
        refDate = "2013-07-01 07:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 7:34 AM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('7:34:56 AM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('7:34 AM');
        refDate = "2013-07-01 17:34:56";
        expect(srvLocale.formatDate(refDate, 'medium')).toEqual('Jul 1, 2013 5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'short')).toEqual('7/1/13 5:34 PM');
        expect(srvLocale.formatDate(refDate, 'fullDate')).toEqual('Monday, July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'longDate')).toEqual('July 1, 2013');
        expect(srvLocale.formatDate(refDate, 'mediumDate')).toEqual('Jul 1, 2013');
        expect(srvLocale.formatDate(refDate, 'shortDate')).toEqual('7/1/13');
        expect(srvLocale.formatDate(refDate, 'mediumTime')).toEqual('5:34:56 PM');
        expect(srvLocale.formatDate(refDate, 'shortTime')).toEqual('5:34 PM');

    });

});
