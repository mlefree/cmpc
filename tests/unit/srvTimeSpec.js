
describe('SrvTime', function () {
'use strict';

    var timeoutService, exceptionHandlerService, srvTime;

    beforeEach(module('c4pServices'));

    beforeEach(inject(function ($injector) {
        exceptionHandlerService = $injector.get('$exceptionHandler');
        srvTime = new SrvTime(exceptionHandlerService);
    }));

    // Usage of $timeout breaks e2e tests for the moment : https://github.com/angular/angular.js/issues/2402
    // So unit tests are changed also since usage of setTimeout() is not blocked by Angular during unit tests.

    xit('should update time value upon $timeout.flush', inject(function ($timeout) {

        var timeStart = null, lastNows = [], now;

        runs(function () {
            now = new Date();
            expect(srvTime.year).toBe(now.getFullYear());
            expect(srvTime.month).toBe(now.getMonth() + 1);
            expect(srvTime.day).toBe(now.getDate());
            expect(srvTime.hour).toBe(now.getHours());
            expect(srvTime.minute).toBe(now.getMinutes());
            expect(srvTime.second).toBe(now.getSeconds());
            srvTime.addListenerOnSecond(function(handle, now) {
                lastNows.push(now);
            });
            timeStart = new Date().getTime();
        });

        // wait for 10s
        waitsFor(function () {return ((new Date().getTime() - timeStart) > 10000);}, "wait for 10 s", 20000);

        runs(function () {
            // No change while $timeout is not flushed
            expect(srvTime.year).toBe(now.getFullYear());
            expect(srvTime.month).toBe(now.getMonth() + 1);
            expect(srvTime.day).toBe(now.getDate());
            expect(srvTime.hour).toBe(now.getHours());
            expect(srvTime.minute).toBe(now.getMinutes());
            expect(srvTime.second).toBe(now.getSeconds());
            expect(lastNows.length).toBe(0);

            $timeout.flush();

            now = new Date();
            expect(srvTime.year).toBe(now.getFullYear());
            expect(srvTime.month).toBe(now.getMonth() + 1);
            expect(srvTime.day).toBe(now.getDate());
            expect(srvTime.hour).toBe(now.getHours());
            expect(srvTime.minute).toBe(now.getMinutes());
            expect(srvTime.second).toBe(now.getSeconds());

            // Listener should be called only once, even if there is a leap of 10 seconds

            expect(lastNows.length).toBe(1);
            expect(lastNows[0].getSeconds()).toBe(now.getSeconds());
            expect(lastNows[0].getMinutes()).toBe(now.getMinutes());
        });

    }));

    it('should always update time value via setTimeout()', function () {

        var lastNows = [];

        runs(function () {
            var now = new Date();
            expect(srvTime.year).toBe(now.getFullYear());
            expect(srvTime.month).toBe(now.getMonth() + 1);
            expect(srvTime.day).toBe(now.getDate());
            expect(srvTime.hour).toBe(now.getHours());
            expect(srvTime.minute).toBe(now.getMinutes());
            expect(srvTime.second).toBe(now.getSeconds());
            srvTime.addListenerOnSecond(function(handle, now) {
                lastNows.push(now);
            });
        });

        // wait for 10s by aligning us on Seconds ticks of srvTime
        waitsFor(function () {return (lastNows.length >= 10);}, "wait for 10 s", 20000);

        runs(function () {
            // By aligning us on Seconds ticks of srvTime we must have the same time object for some milliseconds to validate all our tests
            var newNow = new Date();
            // Listener should be called 10 times (or 11 times if precision of 1 second)
            expect(lastNows.length).toBeGreaterThan(9);
            expect(lastNows.length).toBeLessThan(12);
            var srvDate = new Date(srvTime.year, srvTime.month-1, srvTime.day, srvTime.hour, srvTime.minute, srvTime.second, 0);
            expect(Math.abs(srvDate.getTime() - newNow.getTime())).toBeLessThan(2000);// precision of 1 second
            expect(Math.abs(lastNows[9].getTime() - newNow.getTime())).toBeLessThan(2000);// precision of 1 second
        });

    });

});
