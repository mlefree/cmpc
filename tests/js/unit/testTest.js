'use strict';

/* jasmine specs for basic tests */
describe('Basic test', function () {
    var a;
    var foo;

    beforeEach(function () {
        foo = 0;
        foo += 1;
    });

    afterEach(function () {
        foo = 0;
    });

    it('should get undefined from a variable', function () {
        expect(a).toBeUndefined();
        expect(a).toBeFalsy();

        expect(a).not.toBeTruthy();
    });

    it('should get null from a variable', function () {
        a = null;

        expect(a).toBeNull();
        expect(a).toBeFalsy();

        expect(a).not.toBeTruthy();
    });

    it('should get false from a variable', function () {
        a = false;

        expect(a).toEqual(false);
        expect(a).toBe(false);
        expect(a).toBeFalsy();

        expect(a).not.toBe(true);
        expect(a).not.toBeNull();
        expect(a).not.toBeTruthy();
    });

    it('should get true from a variable', function () {
        a = true;

        expect(a).toEqual(true);
        expect(a).toBe(true);
        expect(a).toBeTruthy();

        expect(a).not.toBe(false);
        expect(a).not.toBeNull();
        expect(a).not.toBeFalsy();
    });

    it('should find an item in array', function () {
        var a = ['foo', 'bar', 'baz'];

        expect(a).toContain('bar');
        expect(a).not.toContain('quux');
    });

    it('should compare reals', function () {
        var pi = 3.1415926, e = 2.78;

        expect(e).toBeLessThan(pi);
        expect(pi).toBeGreaterThan(e);
        expect(pi).toBeCloseTo(e, 0);

        expect(e).not.toBeGreaterThan(pi);
        expect(pi).not.toBeLessThan(e);
        //expect(pi).not.toBeCloseTo(e, 0.1);
    });

    it('should throw an exception', function () {
        var foo = function () {
            return 1 + 2;
        };
        var bar = function () {
            // Throw an exception because variable 'c' does not exist
            return c + 1;
        };

        expect(foo).not.toThrow();
        expect(bar).toThrow();
    });
    
    describe("nested inside a second describe", function () {
        var bar;

        beforeEach(function () {
            bar = 1;
        });

        it("can reference both scopes as needed ", function () {
            expect(foo).toEqual(bar);
        });
    });


    describe("nested inside asynchronous specs", function () {
        var value, flag;

        it("should support async execution of test preparation and expectations", function () {

            // Preparation
            runs(function () {
                flag = false;
                value = 0;

                setTimeout(function () {
                    flag = true;
                }, 500);
            });

            // Wait for a maximum of 750 ms
            waitsFor(function () {
                value++;
                return flag;
            }, "The Value should be incremented", 750);

            // Expectation
            runs(function () {
                expect(value).toBeGreaterThan(0);
            });
        });
    });

    describe('nested inside HTML tests', function () {

        beforeEach(function () {
            setFixtures("<div><span id='firstname'/><span id='surname'/></div>");
            var data = { "Person": { "Firstname": "fred", "Surname": "blogs" } };
            $('#firstname').text(data.Person.Firstname);
            $('#surname').text(data.Person.Surname);
        });

        it("should have html tags filled with data", function () {
            expect($('#firstname').text()).toEqual('fred');
            expect($('#surname').text()).toEqual('blogs');
        });
    });

    describe('string tests', function () {

        it("replace should change first occurences", function () {
            var from = "fr en euro";
            var to = from.replace(" ", "_");
            expect(to).toEqual('fr_en euro');
        });

        it("replace should change all occurences", function () {
            var from = "fr en euro";
            var to = from.replace(new RegExp(" ", "g"), "_");
            expect(to).toEqual('fr_en_euro');
        });

        it("replace should suppress ':0'", function () {
            var from = ":0";
            var to = from.replace(/^(.*):0$/, "$1");
            expect(to).toEqual('');
        });

        it("should find https_127.0.0.1_0:Persistent", function () {
            var to = '';
            var from = 'https_127.0.0.1_0:Persistent';
            var pattern = /^(https?)_([^_]+)_(\d+):Persistent$/;
            if (pattern.test(from)) {
                var httpHost = from;
                httpHost = httpHost.replace(pattern, "$1://$2:$3");
                httpHost = httpHost.replace(/^(.*):0$/, "$1");
                // Specific to Chrome where window.webkitResolveLocalFileSystemURI does not exist
                // get URL from URI by prefixing fullPath with urlPrefix
                to = 'filesystem:' + httpHost + '/persistent';
            }
            expect(to).toEqual('filesystem:https://127.0.0.1/persistent');
        });

        it("should find http_127.0.0.1_9876:Persistent", function () {
            var to = '';
            var from = 'http_127.0.0.1_9876:Persistent';
            var pattern = /^(https?)_([^_]+)_(\d+):Persistent$/;
            if (pattern.test(from)) {
                var httpHost = from;
                httpHost = httpHost.replace(pattern, "$1://$2:$3");
                httpHost = httpHost.replace(/^(.*):0$/, "$1");
                // Specific to Chrome where window.webkitResolveLocalFileSystemURI does not exist
                // get URL from URI by prefixing fullPath with urlPrefix
                to = 'filesystem:' + httpHost + '/persistent';
            }
            expect(to).toEqual('filesystem:http://127.0.0.1:9876/persistent');
        });


    });

    describe('DateTime validation', function () {

        it('should accept 00:00', function () {

            var patternTime = new RegExp('^([0-1][0-9]|2[0-3]):([0-5][0-9])$');
            var patternDate = new RegExp('^([0-9][0-9][0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$');

            expect(patternTime.test('00:00')).toBeTruthy();
            expect(patternTime.test('23:59')).toBeTruthy();
            expect(patternTime.test('24:00')).toBeFalsy();
            expect(patternTime.test('00:00:00')).toBeFalsy();

            expect(patternDate.test('2013-02-12')).toBeTruthy();
            expect(patternDate.test('9999-12-31')).toBeTruthy();
            expect(patternDate.test('9999-13-31')).toBeFalsy();
            expect(patternDate.test('9999-12-32')).toBeFalsy();
            expect(patternDate.test('9999-00-31')).toBeFalsy();
            expect(patternDate.test('9999-12-00')).toBeFalsy();

        });

    });

});

/*
(function () {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 250;


    var htmlReporter = new jasmine.HtmlReporter();
    jasmineEnv.addReporter(htmlReporter);


    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    var currentWindowOnload = window.onload;
    window.onload = function () {
        if (currentWindowOnload) {
            currentWindowOnload();
        }

        document.querySelector('.version').innerHTML = jasmineEnv.versionString();
        execJasmine();
    };
    function execJasmine() {
        jasmineEnv.execute();
    }
})();
*/
