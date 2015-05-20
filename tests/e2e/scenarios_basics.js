'use strict';

describe('Basic', function () {

    describe('ngRepeat', function () {

        it('should load a page', function () {
            browser().navigateTo('../../tests/sandbox/e2eTest.html');
            sleep(10);
            expect(element('#title').val()).toBe('List of contacts');
            expect(element('#selIndex').val()).toBe('0');
            expect(element('#selValue').text()).toBe('Value_0');
            expect(element('#contact_4').val()).toBe('Value_4');
            expect(element('#title_4').val()).toBe('List of contacts');
            expect(element('li[ng-repeat="contact in contacts"]').count()).toBe(10);
        });

        it('should change a contact value', function () {
            using('li[ng-repeat="contact in contacts"]:eq(4)').input('contact.value').enter('New value for 4');
            expect(element('#contact_4').val()).toBe('New value for 4');
            expect(element('#selIndex').val()).toBe('0');
            expect(element('#selValue').text()).toBe('Value_0');
            input('sel').enter(4);
            expect(element('#selIndex').val()).toBe('4');
            expect(element('#selValue').text()).toBe('New value for 4');
        });

        it('should change the parent title', function () {
            using('#head').input('title').enter('New title');
            expect(element('#title').val()).toBe('New title');
            expect(element('#title_4').val()).toBe('New title');
        });

        it('should change the child title', function () {
            using('li[ng-repeat="contact in contacts"]:eq(4)').input('title').enter('New title for 4');
            expect(element('#title').val()).toBe('New title');
            expect(element('#title_4').val()).toBe('New title for 4');
        });

    });

    describe('noSpaceAndLowerCaseCtrl', function () {

        it('should trim spaces', function () {
            browser().navigateTo('../../tests/sandbox/e2eTest.html');

            expect(element('#space1').val()).toBe('');

            using('#ctrlSpace1').input('name').enter('');
            expect(element('#space1').val()).toBe('');

            using('#ctrlSpace1').input('name').enter('  ');
            expect(element('#space1').val()).toBe('');

            using('#ctrlSpace1').input('name').enter(' a ');
            expect(element('#space1').val()).toBe('a');

            using('#ctrlSpace1').input('name').enter('A');
            expect(element('#space1').val()).toBe('a');

            using('#ctrlSpace1').input('name').enter(' aAa ');
            expect(element('#space1').val()).toBe('aaa');
        });

    });

});
