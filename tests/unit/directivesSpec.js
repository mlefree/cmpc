

/* jasmine specs for directives go here */

/*
 * ## Angular's jQuery lite provides the following methods:
 *
 * - [addClass()](http://api.jquery.com/addClass/)
 * - [after()](http://api.jquery.com/after/)
 * - [append()](http://api.jquery.com/append/)
 * - [attr()](http://api.jquery.com/attr/)
 * - [bind()](http://api.jquery.com/bind/)
 * - [children()](http://api.jquery.com/children/)
 * - [clone()](http://api.jquery.com/clone/)
 * - [contents()](http://api.jquery.com/contents/)
 * - [css()](http://api.jquery.com/css/)
 * - [data()](http://api.jquery.com/data/)
 * - [eq()](http://api.jquery.com/eq/)
 * - [find()](http://api.jquery.com/find/) - Limited to lookups by tag name.
 * - [hasClass()](http://api.jquery.com/hasClass/)
 * - [html()](http://api.jquery.com/html/)
 * - [next()](http://api.jquery.com/next/)
 * - [parent()](http://api.jquery.com/parent/)
 * - [prepend()](http://api.jquery.com/prepend/)
 * - [prop()](http://api.jquery.com/prop/)
 * - [ready()](http://api.jquery.com/ready/)
 * - [remove()](http://api.jquery.com/remove/)
 * - [removeAttr()](http://api.jquery.com/removeAttr/)
 * - [removeClass()](http://api.jquery.com/removeClass/)
 * - [removeData()](http://api.jquery.com/removeData/)
 * - [replaceWith()](http://api.jquery.com/replaceWith/)
 * - [text()](http://api.jquery.com/text/)
 * - [toggleClass()](http://api.jquery.com/toggleClass/)
 * - [unbind()](http://api.jquery.com/unbind/)
 * - [val()](http://api.jquery.com/val/)
 * - [wrap()](http://api.jquery.com/wrap/)
 *
 * ## In addition to the above, Angular provides an additional method to both jQuery and jQuery lite:
 *
 * - `controller(name)` - retrieves the controller of the current element or its parent. By default
 *   retrieves controller associated with the `ngController` directive. If `name` is provided as
 *   camelCase directive name, then the controller for this directive will be retrieved (e.g.
 *   `'ngModel'`).
 * - `injector()` - retrieves the injector of the current element or its parent.
 * - `scope()` - retrieves the {@link api/ng.$rootScope.Scope scope} of the current
 *   element or its parent.
 * - `inheritedData()` - same as `data()`, but walks up the DOM until a value is found or the top
 *   parent element is reached.
 */

describe('directives', function () {
  'use strict';
    var httpBackend, srvLocale;

    beforeEach(function () {
        module('ui.bootstrap');
        module('c4pServices');
        module('c4p.directives');
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
            "possibleCrms" : ["c4p", "sf",],
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

    describe('appVersion', function () {

        it('should print current version', function () {

            inject(function ($compile, $rootScope) {
                var element = $compile('<span app-version></span>')($rootScope);
                expect(element.text()).toEqual('TEST_VER');
            });

        });

    });

    describe('c4pPluralize', function () {

        describe('as attribute', function () {

            it('should print plural', function () {

                inject(function ($compile, $rootScope) {
                    var scope = $rootScope.$new();
                    var element = $compile('<span c4p-pluralize count="nb" when="pluralFormat"/>')(scope);
                    scope.pluralFormat = {
                        "0":"Document shared : none",
                        "one":"1 Document to share :",
                        "other":"{} Documents to share :"
                    };

                    scope.nb = 0;
                    scope.$digest();
                    expect(element.text()).toEqual('Document shared : none');

                    scope.nb = 1;
                    scope.$digest();
                    expect(element.text()).toEqual('1 Document to share :');

                    scope.nb = 2;
                    scope.$digest();
                    expect(element.text()).toEqual('2 Documents to share :');
                });

            });

        });

        describe('as element', function () {

            it('should print plural', function () {

                inject(function ($compile, $rootScope) {
                    var scope = $rootScope.$new();
                    var element = $compile('<c4p-pluralize count="nb" when="pluralFormat"/>')(scope);
                    scope.pluralFormat = {
                        "0":"Document shared : none",
                        "one":"1 Document to share :",
                        "other":"{} Documents to share :"
                    };

                    scope.nb = 0;
                    scope.$digest();
                    expect(element.text()).toEqual('Document shared : none');

                    scope.nb = 1;
                    scope.$digest();
                    expect(element.text()).toEqual('1 Document to share :');

                    scope.nb = 2;
                    scope.$digest();
                    expect(element.text()).toEqual('2 Documents to share :');
                });

            });

        });

    });

    describe('c4pShow', function () {

        describe('as attribute', function () {

            it('should print on conditional expr', function () {

                inject(function ($compile, $rootScope) {
                    var scope = $rootScope.$new();
                    var element = $compile('<span><span c4p-show="flag">TEST</span></span>')(scope);
                    scope.flag = false;
                    scope.$digest();
                    expect(element.text()).toEqual('');

                    scope.flag = true;
                    scope.$digest();
                    expect(element.text()).toEqual('TEST');
                });

            });

        });

        describe('as attribute with "on" parameter', function () {

            it('should print on conditional expr', function () {

                inject(function ($compile, $rootScope) {
                    var scope = $rootScope.$new();
                    var element = $compile('<span><span c4p-show on="flag">TEST</span></span>')(scope);
                    scope.flag = false;
                    scope.$digest();
                    expect(element.text()).toEqual('');

                    scope.flag = true;
                    scope.$digest();
                    expect(element.text()).toEqual('TEST');
                });

            });

        });

        describe('as element with "on" parameter', function () {

            it('should print on conditional expr', function () {

                inject(function ($compile, $rootScope) {
                    var scope = $rootScope.$new();
                    var element = $compile('<span><c4p-show on="flag">TEST</c4p-show></span>')(scope);
                    scope.flag = false;
                    scope.$digest();
                    expect(element.text()).toEqual('');

                    scope.flag = true;
                    scope.$digest();
                    expect(element.text()).toEqual('TEST');
                });

            });

        });

    });

    describe('c4pHide', function () {

        describe('as attribute', function () {

            it('should print on conditional expr', function () {

                inject(function ($compile, $rootScope) {
                    var scope = $rootScope.$new();
                    var element = $compile('<span><span c4p-hide="flag">TEST</span></span>')(scope);
                    scope.flag = true;
                    scope.$digest();
                    expect(element.text()).toEqual('');

                    scope.flag = false;
                    scope.$digest();
                    expect(element.text()).toEqual('TEST');
                });

            });

        });

        describe('as attribute with "on" parameter', function () {

            it('should print on conditional expr', function () {

                inject(function ($compile, $rootScope) {
                    var scope = $rootScope.$new();
                    var element = $compile('<span><span c4p-hide on="flag">TEST</span></span>')(scope);
                    scope.flag = true;
                    scope.$digest();
                    expect(element.text()).toEqual('');

                    scope.flag = false;
                    scope.$digest();
                    expect(element.text()).toEqual('TEST');
                });

            });

        });

        describe('as element with "on" parameter', function () {

            it('should print on conditional expr', function () {

                inject(function ($compile, $rootScope) {
                    var scope = $rootScope.$new();
                    var element = $compile('<span><c4p-hide on="flag">TEST</c4p-hide></span>')(scope);
                    scope.flag = true;
                    scope.$digest();
                    expect(element.text()).toEqual('');

                    scope.flag = false;
                    scope.$digest();
                    expect(element.text()).toEqual('TEST');
                });

            });

        });

    });

    // See tests/sandbox/e2eTestRunner.html
    //describe('noSpaceAndLowerCase', function () {});
    /* DOES NOT WORK
    describe('noSpaceAndLowerCase', function () {

        it('should trim and lower case', function () {

            inject(function ($compile, $rootScope) {
                var scope = $rootScope.$new();
                var element = $compile('<input id="space1" ng-model="name" ng-trim="false" no-space-and-lower-case />')(scope);
                scope.name = '';

                // 'change' for text, textarea, hidden, password, select-one, select-multiple
                // 'click' for button, submit, reset, image, checkbox, radio, ...
                scope.name = '';
                //element.val('');
                //element.change();
                //element.trigger('change');
                scope.$digest();
                expect(element.val()).toEqual('');

                scope.name = '  ';
                //element.val('  ');
                //element.change();
                //element.trigger('change');
                scope.$digest();
                expect(element.val()).toEqual('');

                scope.name = ' a ';
                //element.val(' a ');
                //element.change();
                //element.trigger('change');
                scope.$digest();
                expect(element.val()).toEqual('a');

                scope.name = 'A';
                //element.val('A');
                //element.change();
                //element.trigger('change');
                scope.$digest();
                expect(element.val()).toEqual('a');

                scope.name = ' aAa ';
                //element.val(' aAa ');
                //element.change();
                //element.trigger('change');
                scope.$digest();
                expect(element.val()).toEqual('aaa');
            });

        });

    });
    */

    describe('ngRepeat', function () {

        it('should iterate over an array of objects', function () {

            inject(function ($compile, $rootScope) {

                var scope = $rootScope.$new();

                var element = $compile(
                    '<ul>' +
                        '<li ng-repeat="item in items">{{item.name}};</li>' +
                        '</ul>')(scope);

                Array.prototype.extraProperty = "should be ignored";
                scope.items = [
                    {name:'misko'},
                    {name:'shyam'}
                ];
                scope.$digest();
                expect(element.find('li').length).toEqual(2);
                expect(element.text()).toEqual('misko;shyam;');
                delete Array.prototype.extraProperty;

                scope.items.push({name:'adam'});
                scope.$digest();
                expect(element.find('li').length).toEqual(3);
                expect(element.text()).toEqual('misko;shyam;adam;');

                scope.items.pop();
                scope.items.shift();
                scope.$digest();
                expect(element.find('li').length).toEqual(1);
                expect(element.text()).toEqual('shyam;');

            });

        });

        it('should iterate over on object/map', function () {

            inject(function ($compile, $rootScope) {

                var scope = $rootScope.$new();

                var element = $compile(
                    '<ul>' +
                        '<li ng-repeat="(key, value) in items">{{key}}:{{value}}|</li>' +
                        '</ul>')(scope);
                scope.items = {misko:'swe', shyam:'set'};
                scope.$digest();
                expect(element.text()).toEqual('misko:swe|shyam:set|');

            });

        });

    });

    /*
     * Test d'une directive de test 'zippy'
     */
    describe('zippy', function () {

        it('should bind and open / close', function () {

            inject(function ($compile, $rootScope) {

                var scope = $rootScope.$new();
                scope.title = 'Lorem Ipsum';
                scope.text = 'Neque porro quisquam est qui dolorem ipsum quia dolor...';
                var element = $compile(
                    '<div>' +
                        'Title: ' + '<input ng-model="title" />' +
                        '<br/>' +
                        'Text: ' + '<textarea ng-model="text" />' +
                        '<div class="zippy" zippy-title="Details: {{title}}...">{{text}}</div>' +
                    '</div>')(scope);
                scope.page = '';
                scope.$digest();

                expect(element).not.toBeNull();
                expect(element.text()).toEqual('Title: Text: Details: Lorem Ipsum...Neque porro quisquam est qui dolorem ipsum quia dolor...');
                expect(element.find('input').val()).toEqual('Lorem Ipsum');
                expect(element.find('textarea').val()).toEqual('Neque porro quisquam est qui dolorem ipsum quia dolor...');
                expect(element.find('div.title').text()).toEqual('Details: Lorem Ipsum...');
                expect(element.find('div.body').text()).toEqual('Neque porro quisquam est qui dolorem ipsum quia dolor...');

                expect(element.find('div.zippy').hasClass('closed')).toEqual(true);
                expect(element.find('div.zippy').hasClass('opened')).toEqual(false);

                // 'change' for text, textarea, hidden, password, select-one, select-multiple
                // 'click' for button, submit, reset, image, checkbox, radio, ...
                element.find('.title').click();//trigger('click');
                expect(element.find('div.zippy').hasClass('closed')).toEqual(false);
                expect(element.find('div.zippy').hasClass('opened')).toEqual(true);

                scope.title = 'TITLE';
                scope.$digest();
                expect(element.find('input').val()).toEqual('TITLE');
                expect(element.find('div.title').text()).toEqual('Details: TITLE...');
            });

        });

    });

    describe('c4p-input', function () {

        it('should show a non empty text field', function () {

            inject(function ($compile, $rootScope) {

                var scope = $rootScope.$new();
                scope.translations = {htmlFormSalutation:'Title .....'};
                scope.contact = {salutation:'Mr'};
                var element = $compile(
                    '<c4p-input title-var="translations.htmlFormSalutation" ng-model="contact.salutation" icon="credit-card"></c4p-input>')(scope);
                scope.page = '';
                scope.$digest();

                var labelElt = element.find('label');
                var iconElt = labelElt.children(0);
                var inputElt = element.find('input');

                expect(element).not.toBeNull();
                expect(element.text()).toEqual('Title .....');
                expect(iconElt.hasClass('glyphicon')).toEqual(true);
                expect(iconElt.hasClass('glyphicon-credit-card')).toEqual(true);
                expect(labelElt.text()).toEqual("Title .....");
                expect(inputElt.attr('ng-model')).toEqual('contact.salutation');
                expect(inputElt.val()).toEqual("Mr");

                // Change translation field

                scope.translations.htmlFormSalutation = 'Titre .....';
                scope.$digest();
                expect(element.text()).toEqual('Titre .....');
                expect(labelElt.text()).toEqual("Titre .....");

                // Change object field

                scope.contact.salutation = '';
                scope.$digest();
                expect(element.text()).toEqual('Titre .....');
                expect(inputElt.val()).toEqual("");

            });

        });

    });

    describe('c4p-inputcard', function () {

        it('should show correctly a currency', function () {

            inject(function ($compile, $rootScope, $httpBackend, srvLocale) {

                var scope = $rootScope.$new();
                scope.translations = {htmlFormAmount:'Amount .....'};
                scope.account = {amount:'10000'};
                var element = $compile(
                    '<c4p-inputcard type="currency" title-var="translations.htmlFormAmount" ng-model="account.amount"></c4p-inputcard>')(scope);
                scope.page = '';
                scope.$digest();

                var spanElt = element.find('span');
                var now;

                expect(element).not.toBeNull();
                expect(element.text()).toEqual('\u20ac10,000.00');
                expect(spanElt.text()).toEqual("\u20ac10,000.00");

                // Change translation field

                scope.translations.htmlFormAmount = 'Montant .....';
                scope.$digest();
                expect(element.text()).toEqual('\u20ac10,000.00');

                // Change object field

                scope.account.amount = '';
                scope.$digest();
                expect(element.text()).toEqual('\u20ac0.00');
                expect(spanElt.text()).toEqual("\u20ac0.00");

                // Change locale (format change)

                $httpBackend.expectGET('models/local_fr.json');
                srvLocale.setLanguage('fr');
                $httpBackend.flush();

                scope.$digest();
                expect(element.text()).toEqual('0,00 \u20ac');
                expect(spanElt.text()).toEqual("0,00 \u20ac");

                scope.account.amount = '10000';
                scope.$digest();
                expect(element.text()).toEqual('10 000,00 \u20ac');
                expect(spanElt.text()).toEqual("10 000,00 \u20ac");

            });

        });

    });

    describe('c4p-inputlimited', function () {

        it('should show correctly a currency', function () {

            inject(function ($compile, $rootScope, $httpBackend, srvLocale) {

                var scope = $rootScope.$new();
                scope.translations = {htmlFormAmount:'Amount .....'};
                scope.account = {amount:'10000'};
                var element = $compile(
                    '<c4p-inputlimited type="currency" title-var="translations.htmlFormAmount" ng-model="account.amount"></c4p-inputlimited>')(scope);
                scope.page = '';
                scope.$digest();

                var labelElt = element.find('span.control-label');
                var spanElt = element.find('span.nocontrol');
                var now;

                expect(element).not.toBeNull();
                expect(element.text()).toEqual('Amount .....\u20ac10,000.00');
                expect(labelElt.text()).toEqual("Amount .....");
                expect(spanElt.text()).toEqual("\u20ac10,000.00");

                // Change translation field

                scope.translations.htmlFormAmount = 'Montant .....';
                scope.$digest();
                expect(element.text()).toEqual('Montant .....\u20ac10,000.00');
                expect(labelElt.text()).toEqual("Montant .....");

                // Change object field

                scope.account.amount = '';
                scope.$digest();
                expect(element.text()).toEqual('Montant .....\u20ac0.00');
                expect(spanElt.text()).toEqual("\u20ac0.00");

                // Change locale (format change)

                $httpBackend.expectGET('models/local_fr.json');
                srvLocale.setLanguage('fr');
                $httpBackend.flush();

                scope.$digest();
                expect(element.text()).toEqual('Montant .....0,00 \u20ac');
                expect(spanElt.text()).toEqual("0,00 \u20ac");

                scope.account.amount = '10000';
                scope.$digest();
                expect(element.text()).toEqual('Montant .....10 000,00 \u20ac');
                expect(spanElt.text()).toEqual("10 000,00 \u20ac");

            });

        });

    });

});
