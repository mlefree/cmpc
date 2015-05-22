'use strict';

describe('Demo actif', function () {

    describe('Starting application', function () {

        it('should start application in english (browser cache is no more empty)', function () {
            //browser().navigateTo('../../www');
        	browser().navigateTo('/www/index.html');
        	sleep(1);
            checkFirstPageInEnglish();
        });
/*
        it('should start features tour in english', function () {
            element(c4p.E2e.buttonStartFeatureTour).click();
            checkFirstFeatureInEnglish();
        });


        it('should toggle in french', function () {
            // Choose french language
        	// Dropdown Lang & Choose french language
            element(c4p.E2e.langViewMenu).click();
            element(c4p.E2e.langViewMenuActionFrancais).click();
            checkFirstFeatureInFrench();
        });

        it('should return to connection page', function () {
            element(c4p.E2e.footerLoginLink).click();
            checkFirstPageInFrench();
        });

        it('should toggle in english', function () {
        	// Dropdown Lang & Choose english language
            element(c4p.E2e.langViewMenu).click();
            element(c4p.E2e.langViewMenuActionEnglish).click();
            checkFirstPageInEnglish();
        });

    });

    describe('Starting demo mode', function () {

        describe('Calendar', function () {

            it('should start demo mode in Calendar view in Month mode', function () {
                // action
                element(c4p.E2e.linkDemoMode).click();
                // checks
                checkCalendarMonthPageInEnglish();
            });

            it('should have Synchronization notification for 5 seconds', function () {
                // checks
                checkNotification('Synchronization OK.', 6);
            });

            it('should toggle Calendar view in List mode', function () {
                // Dropdown Calendar View & Action
                element(c4p.E2e.calendarViewMenu).click();
                element(c4p.E2e.calendarViewMenuActionList).click();
                // checks
                checkCalendarListPageInEnglish();
            });

            it('should toggle Calendar view in Day mode and show all today meetings', function () {
                // Dropdown Calendar View & Action
                element(c4p.E2e.calendarViewMenu).click();
                element(c4p.E2e.calendarViewMenuActionDay).click();
                // checks
                checkCalendarTimePageInEnglish();

                expect(element(c4p.E2e.calendarPageDayEventList).count()).toBe(1);

            });

        });

        describe('Event', function () {

            describe('Selecting event', function () {

                it('should select the first event and show Event page', function () {
                    // action
                    element(c4p.E2e.calendarPageDayEventList + ':eq(0) ' + c4p.E2e.inCalendarPageDayEventButton).click();
                    // checks
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(0);
                    expect(element('.c4p-accordion-group div[class="c4p-accordion-item collapse"]:eq(0)').attr('style')).toBe('height: 0px;');
                });

            });

            describe('Adding an Opportunity', function () {

                it('should open the dialog', function () {
                    // action

                    element(c4p.E2e.np1PageMenuHeaderToggleButton).click();

                    element(c4p.E2e.np1PageMenuBodyActionList + ':eq(2)' + c4p.E2e.inNp1PageMenuBodyActionButton).click();

                    // checks
                    checkNbModal(1);
                });

                it('should select the first Opportunity', function () {
                    // action
                    element(c4p.E2e.linkModalToggleItem + ':eq(0)').sensedown();
                    element(c4p.E2e.linkModalToggleItem + ':eq(0)').senseup();
                });

                it('should close the dialog and update Event', function () {
                    // action
                    element(c4p.E2e.linkModalValidate).click();
                    // checks
                    checkNbModal(0);
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(1);
                    expect(element(c4p.E2e.np1PageItemList + ':eq(0) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Opportunity');
                    expect(element(c4p.E2e.np1PageItemList + ':eq(0) ' + c4p.E2e.inNp1PageItemBodyDetailCard).text()).toMatch(new RegExp('^\\s*Best Western Products Manufacture\\s*'));
                });

            });

            describe('Adding an Account', function () {

                it('should open the dialog', function () {
                    // action
                    element(c4p.E2e.np1PageMenuHeaderToggleButton).click();
                    element(c4p.E2e.np1PageMenuBodyActionList + ':eq(3)' + c4p.E2e.inNp1PageMenuBodyActionButton).click();
                    // checks
                    checkNbModal(1);
                });

                it('should select the first Account', function () {
                    // action
                    element(c4p.E2e.linkModalToggleItem + ':eq(0)').sensedown();
                    element(c4p.E2e.linkModalToggleItem + ':eq(0)').senseup();
                });

                it('should close the dialog and update Event', function () {
                    // action
                    element(c4p.E2e.linkModalValidate).click();
                    // checks
                    checkNbModal(0);
                    // Previous Opportunity disappears from N+1 list because it is is replaced by this Account in what_id attribute of the event
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(1);
                    expect(element(c4p.E2e.np1PageItemList + ':eq(0) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Account');
                    expect(element(c4p.E2e.np1PageItemList + ':eq(0) ' + c4p.E2e.inNp1PageItemBodyDetailCard).text()).toMatch(new RegExp('^\\s*Acmebiz International Inc\\.\\s*'));
                });

            });

            describe('Adding a Contact', function () {

                it('should open the dialog', function () {
                    // action
                    element(c4p.E2e.np1PageMenuHeaderToggleButton).click();
                    element(c4p.E2e.np1PageMenuBodyActionList + ':eq(0)' + c4p.E2e.inNp1PageMenuBodyActionButton).click();
                    // checks
                    checkNbModal(1);
                });

                it('should select the first Contact', function () {
                    // action
                    element(c4p.E2e.linkModalToggleItem + ':eq(0)').sensedown();
                    element(c4p.E2e.linkModalToggleItem + ':eq(0)').senseup();
                });

                it('should close the dialog and update Event', function () {
                    // action
                    element(c4p.E2e.linkModalValidate).click();
                    // checks
                    checkNbModal(0);
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(2);
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Attendee');
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyDetailCard).text()).toMatch(new RegExp('^\\s*Mr\\.\\s+Abel\\s+Decadiz\\s*'));
                });

            });

            describe('Adding a new Contact', function () {

                describe('Opening dialog', function () {

                    it('should open the dialog', function () {
                        // action

                        element(c4p.E2e.np1PageMenuHeaderToggleButton).click();
                        element(c4p.E2e.np1PageMenuBodyActionList + ':eq(0)' + c4p.E2e.inNp1PageMenuBodyActionButton).click();
                        // checks
                        checkNbModal(1);
                    });

                });

                describe('Creating a new contact', function () {

                    it('should open the dialog', function () {
                        // action

                        element(c4p.E2e.linkModalCreate).click();// Create a new Contact before adding it as attendee
                        // checks

                        checkNbModal(2);
                    });

                    it('should edit the new Contact', function () {
                        // action
                        using(c4p.E2e.modalFieldList + ':eq(1)').input("object[field.key]").enter("Aaaa");
                        using(c4p.E2e.modalFieldList + ':eq(2)').input("object[field.key]").enter("Aaaa");
                    });

                    it('should close the dialog and update Contact list', function () {
                        // action
                        element(c4p.E2e.linkModalSubmit).click();
                        // checks
                        checkNbModal(1);
                        // TODO : new Contact must exists in list and be selected
                    });

                });

                describe('Closing dialog', function () {

                    it('should close the dialog and update Event', function () {
                        // action
                        element(c4p.E2e.linkModalValidate).click();
                        // checks
                        checkNbModal(0);
                        expect(element(c4p.E2e.np1PageItemList).count()).toBe(3);
                        expect(element(c4p.E2e.np1PageItemList + ':eq(2) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Attendee');
                        expect(element(c4p.E2e.np1PageItemList + ':eq(2) ' + c4p.E2e.inNp1PageItemBodyDetailCard).text()).toMatch(new RegExp('^\\s*Aaaa\\s+Aaaa\\s*'));
                    });

                });

            });

        });

        describe('Contact', function () {

            describe('Selecting contact', function () {

                it('should select the second N+1 object and show Contact page', function () {
                    // action
                    element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyDetailCard).click();
                    // checks
                    expect(element('#a4pPage div[ng-include="\'views/navigation/cards/1_contact.html\'"] h1').text()).toMatch(new RegExp('^\\s*Mr\\.\\s+Abel\\s+Decadiz\\s*$'));
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(2);
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Event');
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyDetailCard).text()).toMatch(new RegExp('^\\s*presentation\\s*'));
                });

            });

            describe('Adding a Manager', function () {

                it('should open the dialog', function () {
                    // action
                    element(c4p.E2e.np1PageMenuHeaderToggleButton).click();
                    element(c4p.E2e.np1PageMenuBodyActionList + ':eq(1)' + c4p.E2e.inNp1PageMenuBodyActionButton).click();
                    // checks
                    checkNbModal(1);
                });

                it('should select the second Contact', function () {
                    // action
                    // Select the second Contact card : Mr. Ad�le Krouvmedjian (it must not be Abel Decadiz, which must be excluded from the list)
                	element(c4p.E2e.linkModalToggleItem + ':eq(1)').sensedown();
                	element(c4p.E2e.linkModalToggleItem + ':eq(1)').senseup();
                });

                it('should close the dialog and update Contact', function () {
                    // action
                    element(c4p.E2e.linkModalValidate).click();
                    // checks
                    checkNbModal(0);
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(3);
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Manager');
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyDetailCard).text()).toMatch(new RegExp('^\\s*Mr\\.\\s+Ad\u00e8le\\s+Krouvmedjian\\s*'));
                });

            });

            //TODO add doc to this contact and sharbychatter
            describe('TODO - add doc to Abel and sharebychatter', function () {


                it('should open the dialog', function () {
                    // action
                    element(c4p.E2e.np1PageMenuHeaderToggleButton).click();
                    element(c4p.E2e.np1PageMenuBodyActionList + ':eq(4)' + c4p.E2e.inNp1PageMenuBodyActionButton).click();
                    // checks
                    checkNbModal(1);
                });

                it('should select the second Document', function () {
                    // action
                	checkNbModal(1);
                    // Select the second Doc card
                    element(c4p.E2e.linkModalToggleItem + ':eq(1)').sensedown();
                	element(c4p.E2e.linkModalToggleItem + ':eq(1)').senseup();
                });

                it('should close the dialog and update Contact', function () {
                    // action
                	checkNbModal(1);
                    element(c4p.E2e.linkModalValidate).click();
                    // checks
                    checkNbModal(0);
                	expect(element(c4p.E2e.np1PageItemList).count()).toBe(4);
                    expect(element(c4p.E2e.np1PageItemList + ':eq(2) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Document');
                });

                it('should share By Chatter doc', function () {
                    // action
                	expect(element(c4p.E2e.np1PageItemList + ':eq(2) ' + c4p.E2e.inNp1PageItemBodyDetailCard).text()).toMatch(new RegExp('^\\s*copy_demo_pict1.jpg\\s*$'));
                    element(c4p.E2e.np1PageItemList + ':eq(2) ' + c4p.E2e.inNp1PageItemBodyDetailCard).click();
                    // checks
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(1);
                    expect(element('#a4pPage div[ng-include="\'views/navigation/cards/1_document.html\'"] h1').text()).toMatch(new RegExp('^\\s*copy_demo_pict1.jpg\\s*$'));

                    // Click on ShareByDocument
                    element('a[ng-click="shareDocumentByChatter(srvNav.item)"]').click();
                    // checks
                    checkNbModal(1);
                    expect(element('.modal-body div[ng-include="\'views/navigation/cards/draggable_inlined_item.html\'"] span').text()).toMatch(new RegExp('^\\s*copy_demo_pict1.jpg\\s*$'));

                    // and Post it
                    element('button[ng-click="createFeed()"]').click();

                });

                it('should go back to contact', function () {
                    // action
                	expect(element('#a4pPage div[ng-include="\'views/navigation/cards/1_document.html\'"] h1').text()).toMatch(new RegExp('^\\s*copy_demo_pict1.jpg\\s*$'));
                    element(c4p.E2e.np1PageItemList + ':eq(0) ' + c4p.E2e.inNp1PageItemBodyDetailCard).click();

                    // checks
                    expect(element('#a4pPage div[ng-include="\'views/navigation/cards/1_contact.html\'"] h1').text()).toMatch(new RegExp('^\\s*Mr\\.\\s+Abel\\s+Decadiz\\s*$'));

                });


            });

            describe('Selecting manager for Abel', function () {

                it('should select the manager and show Contact page', function () {
                    // action
                    element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyDetailCard).click();
                    // checks
                    expect(element('#a4pPage div[ng-include="\'views/navigation/cards/1_contact.html\'"] h1').text()).toMatch(new RegExp('^\\s*Mr\\.\\s+Ad\u00e8le\\s+Krouvmedjian\\s*$'));
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(2);
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Team');
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyDetailCard).text()).toMatch(new RegExp('^\\s*Mr\\.\\s+Abel\\s+Decadiz\\s*'));
                });

            });

            describe('Removing a Team', function () {

                it('should have N+1 menu closed', function () {
                    // checks
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) div[class="c4p-accordion-item collapse"]').attr('style')).toBe('height: 0px;');
                });

                it('should remove relation', function () {
                    // action
                    element(c4p.E2e.np1PageItemList + ':eq(1) a[class="c4p-accordion-toggle ng-binding"]').click();
                    sleep(1);
                    // checks
                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) div[class="c4p-accordion-item collapse"]').attr('style')).toBe('height: auto;');
                });

                it('should open a remove confirm dialog', function () {
                    // action
                    element(c4p.E2e.np1PageItemList + ':eq(1) button').click();
                    // checks
                    checkNbModal(1);
                });

                it('should confirm the removing and update Contact', function () {
                    // action
                    element(c4p.E2e.buttonSubmit).click();
                    // checks
                    checkNbModal(0);
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(1);
                });

            });

        });

        //TODO create an opportunity
        describe('Opportunity', function () {

            describe('Listing opportunities', function () {

                it('should go to Aside page', function () {
                    // action
                    element(c4p.E2e.linkAsidePage).click();
                    sleep(1);
                    // checks
                    expect(element(c4p.E2e.asidePageCalendarLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageContactLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageAccountLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageOpportunityLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageConfigLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageSynchronizeLink).count()).toBe(1);
                });

                it('should list Opportunities', function () {
                    // action
                    element(c4p.E2e.asidePageOpportunityLink).click();
                    // checks
                    expect(element(c4p.E2e.asidePageItemList).count()).toBe(31);
                    // WITH beta
                    //expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*Best\\s+Western\\s+Products\\s+Manufacture\\s*$'));
                    //expect(element(c4p.E2e.asidePageItemList + ':eq(30)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*University\\s+of\\s+AZ\\s+SLA\\s*$'));
                    // WITHOUT beta
                    expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*Best\\s+Western\\s+Products\\s+Manufacture\\s*$'));
                    expect(element(c4p.E2e.asidePageItemList + ':eq(30)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*University\\s+of\\s+AZ\\s+SLA\\s*$'));
                });


                it('should go back to Aside page', function () {
                    // action
                    element(c4p.E2e.asidePageSearchBackLink).click();
                    // checks
                    expect(element(c4p.E2e.asidePageCalendarLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageContactLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageAccountLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageOpportunityLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageConfigLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageSynchronizeLink).count()).toBe(1);
                });

            });

            describe('Editing opportunity', function () {

                it('should list Opportunities', function () {
                    // action
                    element(c4p.E2e.asidePageOpportunityLink).click();
                    // checks
                    expect(element(c4p.E2e.asidePageItemList).count()).toBe(31);
                    // WITH beta
                    //expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*Best\\s+Western\\s+Products\\s+Manufacture\\s*$'));
                    //expect(element(c4p.E2e.asidePageItemList + ':eq(30)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*University\\s+of\\s+AZ\\s+SLA\\s*$'));
                    // WITHOUT beta
                    expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*Best\\s+Western\\s+Products\\s+Manufacture\\s*$'));
                    expect(element(c4p.E2e.asidePageItemList + ':eq(30)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*University\\s+of\\s+AZ\\s+SLA\\s*$'));
                });

                it('should select heigthteenth Opportunity and go to Opportunity page', function () {
                    // action
                    element(c4p.E2e.asidePageItemList + ':eq(17)' + c4p.E2e.inAsidePageItemButton).click();
                    // checks
                    expect(element(c4p.E2e.detailPageItemName).text()).toBe('Rephraser');
                    expect(element('#a4pPage div[ng-include="\'views/navigation/cards/1_opportunity.html\'"] h1').text()).toMatch(new RegExp('^\\s*Rephraser\\s*$'));
                    expect(element(c4p.E2e.detailPageItemAmount).text()).toBe('�15,000.00');
                    expect(element(c4p.E2e.detailPageItemDescription).text()).toBe('');
                    expect(element(c4p.E2e.np1PageItemList).count()).toBe(1);
                    expect(element(c4p.E2e.np1PageItemList + ':eq(0) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Account');
                    expect(element(c4p.E2e.np1PageItemList + ':eq(0) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*High\\s+Business\\s+Firm\\s*'));
                });

                it('should toggle Opportunity to edit mode', function () {
                    // action
                    element(c4p.E2e.linkEditItem).click();
                    // checks
                    checkNbModal(1);
                    expect(element(c4p.E2e.modalFieldList).count()).toBe(1);
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldTitle).text()).toBe('Name');
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldInput).val()).toBe('Rephraser');
                });

                it('should change edition group', function () {
                    // action
                    element(c4p.E2e.selectorGroupModal).click();
                    // checks
                    expect(element(c4p.E2e.modalDropdownGroupList).count()).toBe(3);
                    expect(element(c4p.E2e.modalDropdownGroupList + ':eq(0)' + c4p.E2e.inModalDropdownGroupButton).text()).toBe('Title');
                    expect(element(c4p.E2e.modalDropdownGroupList + ':eq(1)' + c4p.E2e.inModalDropdownGroupButton).text()).toBe('Description');
                    expect(element(c4p.E2e.modalDropdownGroupList + ':eq(2)' + c4p.E2e.inModalDropdownGroupButton).text()).toBe('Professional');
                });

                it('should go to Description edition group', function () {
                    // action
                    element(c4p.E2e.modalDropdownGroupList + ':eq(1)' + c4p.E2e.inModalDropdownGroupButton).click();
                    // checks
                    expect(element(c4p.E2e.modalFieldList).count()).toBe(1);
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldTitle).text()).toBe('description');
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldTextarea).val()).toBe('');
                });

                it('should change Description field', function () {
                    // action
                    using(c4p.E2e.modalFieldList + ':eq(0)').input("object[field.key]").enter("Test description");
                    // checks
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldTextarea).val()).toBe('Test description');
                });

                it('should change edition group', function () {
                    // action
                    element(c4p.E2e.selectorGroupModal).click();
                    // checks
                    expect(element(c4p.E2e.modalDropdownGroupList).count()).toBe(3);
                    expect(element(c4p.E2e.modalDropdownGroupList + ':eq(0)' + c4p.E2e.inModalDropdownGroupButton).text()).toBe('Title');
                    expect(element(c4p.E2e.modalDropdownGroupList + ':eq(1)' + c4p.E2e.inModalDropdownGroupButton).text()).toBe('Description');
                    expect(element(c4p.E2e.modalDropdownGroupList + ':eq(2)' + c4p.E2e.inModalDropdownGroupButton).text()).toBe('Professional');
                });

                it('should go to Professional edition group', function () {
                    // action
                    element(c4p.E2e.modalDropdownGroupList + ':eq(2)' + c4p.E2e.inModalDropdownGroupButton).click();
                    // checks
                    expect(element(c4p.E2e.modalFieldList).count()).toBe(6);
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldTitle).text()).toBe('Date closed');
                    expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldTitle).text()).toBe('Stage');
                    expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldInput).val()).toBe('Qualification');
                    expect(element(c4p.E2e.modalFieldList + ':eq(2)' + c4p.E2e.inModalFieldTitle).text()).toBe('Amount');
                    expect(element(c4p.E2e.modalFieldList + ':eq(2)' + c4p.E2e.inModalFieldInput).val()).toBe('15000');
                    expect(element(c4p.E2e.modalFieldList + ':eq(3)' + c4p.E2e.inModalFieldTitle).text()).toBe('Next step');
                    expect(element(c4p.E2e.modalFieldList + ':eq(3)' + c4p.E2e.inModalFieldInput).val()).toBe('');
                    expect(element(c4p.E2e.modalFieldList + ':eq(4)' + c4p.E2e.inModalFieldTitle).text()).toBe('Probability');
                    expect(element(c4p.E2e.modalFieldList + ':eq(4)' + c4p.E2e.inModalFieldInput).val()).toBe('10');
                    expect(element(c4p.E2e.modalFieldList + ':eq(5)' + c4p.E2e.inModalFieldTitle).text()).toBe('Type');
                    expect(element(c4p.E2e.modalFieldList + ':eq(5)' + c4p.E2e.inModalFieldInput).val()).toBe('New Customer');
                });

                it('should change Amount field', function () {
                    // action
                    using(c4p.E2e.modalFieldList + ':eq(2)').input("object[field.key]").enter(16000);
                    // checks
                    expect(element(c4p.E2e.modalFieldList + ':eq(2)' + c4p.E2e.inModalFieldInput).val()).toBe('16000');
                });

                it('should change edition group', function () {
                    // action
                    element(c4p.E2e.selectorGroupModal).click();
                    // checks
                    expect(element(c4p.E2e.modalDropdownGroupList).count()).toBe(3);
                    expect(element(c4p.E2e.modalDropdownGroupList + ':eq(0)' + c4p.E2e.inModalDropdownGroupButton).text()).toBe('Title');
                    expect(element(c4p.E2e.modalDropdownGroupList + ':eq(1)' + c4p.E2e.inModalDropdownGroupButton).text()).toBe('Description');
                    expect(element(c4p.E2e.modalDropdownGroupList + ':eq(2)' + c4p.E2e.inModalDropdownGroupButton).text()).toBe('Professional');
                });

                it('should return to Description edition group', function () {
                    // action
                    element(c4p.E2e.modalDropdownGroupList + ':eq(1)' + c4p.E2e.inModalDropdownGroupButton).click();
                    // checks
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldTitle).text()).toBe('description');
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldTextarea).val()).toBe('Test description');
                });


                it('should save Opportunity and return to Opportunity page', function () {
                    // action
                    element(c4p.E2e.linkModalSubmit).click();
                    // checks
                    checkNbModal(0);
                    expect(element(c4p.E2e.detailPageItemName).text()).toBe('Rephraser');
                    expect(element(c4p.E2e.detailPageItemAmount).text()).toBe('�16,000.00');
                    expect(element(c4p.E2e.detailPageItemDescription).text()).toBe('Test description');
                });
            });

            describe('Creating opportunity', function () {

                it('should go to Aside page', function () {
                    // action
                    element(c4p.E2e.linkAsidePage).click();
                    sleep(1);
                    // checks
                    expect(element(c4p.E2e.asidePageCalendarLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageContactLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageAccountLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageOpportunityLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageConfigLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageSynchronizeLink).count()).toBe(1);
                });

                it('should list Opportunities', function () {
                    // action
                    element(c4p.E2e.asidePageOpportunityLink).click();
                    // checks
                    expect(element(c4p.E2e.asidePageItemList).count()).toBe(31);
                    // WITH beta
                    //expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*Best\\s+Western\\s+Products\\s+Manufacture\\s*$'));
                    //expect(element(c4p.E2e.asidePageItemList + ':eq(30)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*University\\s+of\\s+AZ\\s+SLA\\s*$'));
                    // WITHOUT beta
                    expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*Best\\s+Western\\s+Products\\s+Manufacture\\s*$'));
                    expect(element(c4p.E2e.asidePageItemList + ':eq(30)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*University\\s+of\\s+AZ\\s+SLA\\s*$'));
                });

                it('should create a new Opportunity', function () {
                    // action
                    element(c4p.E2e.asidePageGroupList + ':eq(0)' + c4p.E2e.inAsidePageGroupAddButton).click();
                    // checks
                    checkNbModal(1);
                    expect(element(c4p.E2e.modalFieldList).count()).toBe(1);
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldTitle).text()).toBe('Name');
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldInput).val()).toBe('');
                });

                it('should edit Name field', function () {
                    // action
                    using(c4p.E2e.modalFieldList + ':eq(0)').input("object[field.key]").enter("New Opportunity");
                    // checks
                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldInput).val()).toBe('New Opportunity');
                });

                it('should save Opportunity and go to to Opportunity page', function () {
                    // action
                    element(c4p.E2e.linkModalSubmit).click();
                    // checks
                    checkNbModal(0);
                    expect(element(c4p.E2e.detailPageItemName).text()).toBe('New Opportunity');
                    expect(element(c4p.E2e.detailPageItemAmount).text()).toBe('�0.00');
                    expect(element(c4p.E2e.detailPageItemProbability).text()).toBe('100%');
                    expect(element(c4p.E2e.detailPageItemStage).text()).toBe('Prospecting');
                    expect(element(c4p.E2e.detailPageItemDescription).text()).toBe('');
                });

                it('should return to Opportunities list', function () {
                    // action
                    element(c4p.E2e.linkAsidePage).click();
                    sleep(1);
                    // checks
                    expect(element(c4p.E2e.asidePageItemList).count()).toBe(32);
                    // WITH beta
                    //expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*Best\\s+Western\\s+Products\\s+Manufacture\\s*$'));
                    //expect(element(c4p.E2e.asidePageItemList + ':eq(16)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*New\\s+Opportunity\\s*$'));
                    //expect(element(c4p.E2e.asidePageItemList + ':eq(31)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*University\\s+of\\s+AZ\\s+SLA\\s*$'));
                    // WITHOUT beta
                    expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*Best\\s+Western\\s+Products\\s+Manufacture\\s*$'));
                    expect(element(c4p.E2e.asidePageItemList + ':eq(16)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*New\\s+Opportunity\\s*$'));
                    expect(element(c4p.E2e.asidePageItemList + ':eq(31)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*University\\s+of\\s+AZ\\s+SLA\\s*$'));
                });


                it('should go back to Aside page', function () {
                    // action
                    element(c4p.E2e.asidePageSearchBackLink).click();
                    // checks
                    expect(element(c4p.E2e.asidePageCalendarLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageContactLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageAccountLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageOpportunityLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageConfigLink).count()).toBe(1);
                    expect(element(c4p.E2e.asidePageSynchronizeLink).count()).toBe(1);
                });

            });

        });

        describe('Create Event', function () {

            it('should create Event with interactive date', function () {

                // action
            	element(c4p.E2e.linkAsidePage).click();
                sleep(1);
                element(c4p.E2e.asidePageCalendarLink).click();



                // Check calendar
            	// Dropdown Calendar View & Action
                element(c4p.E2e.calendarViewMenu).click();
                element(c4p.E2e.calendarViewMenuActionList).click();
                // checks
                checkCalendarListPageInEnglish();


                // action
                element(c4p.E2e.linkAddItem).click();
                // checks
                checkNbModal(1);


                // action
                using(c4p.E2e.modalFieldList + ':eq(0)').input("object[field.key]").enter("TestAddEvent");// name
                using(c4p.E2e.modalFieldList + ':eq(1)').input("object[field.key]").enter("Loc");// location
                // checks
                expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldInput).val()).toBe('TestAddEvent');// name
                expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldInput).val()).toBe('Loc');// location



                //TODO : check interactive date & time
                using(c4p.E2e.modalFieldList + ':eq(2)').input("ng-model[stringDate]").enter("10/10/2013");// begin - date
                using(c4p.E2e.modalFieldList + ':eq(2)').input("ng-model[stringTime]").enter("12:00");// begin - time

                // checks
                expect(element(c4p.E2e.modalFieldList + ':eq(2)' + input("ng-model[stringDate]")).val()).toBe("10/10/2013");
                expect(element(c4p.E2e.modalFieldList + ':eq(2)' + input("ng-model[stringTime]")).val()).toBe("12:00");

                expect(element(c4p.E2e.modalFieldList + ':eq(3)' + input("ng-model[stringDate]")).val()).toBe("10/10/2013");
                expect(element(c4p.E2e.modalFieldList + ':eq(3)' + input("ng-model[stringTime]")).val()).toBe("13:00");


                // Add 1 day & 2 hours
                using(c4p.E2e.modalFieldList + ':eq(2)').input("ng-model[stringDate]").enter("11/10/2013");// begin - date
                using(c4p.E2e.modalFieldList + ':eq(2)').input("ng-model[stringTime]").enter("14:00");// begin - time

                // checks
                expect(element(c4p.E2e.modalFieldList + ':eq(2)' + input("ng-model[stringDate]")).val()).toBe("11/10/2013");
                expect(element(c4p.E2e.modalFieldList + ':eq(2)' + input("ng-model[stringTime]")).val()).toBe("14:00");

                expect(element(c4p.E2e.modalFieldList + ':eq(3)' + input("ng-model[stringDate]")).val()).toBe("11/10/2013");
                expect(element(c4p.E2e.modalFieldList + ':eq(3)' + input("ng-model[stringTime]")).val()).toBe("15:00");


                // Submit & check exist
                element(c4p.E2e.linkModalSubmit).click();
                // checks
                expect(element('div[ng-include="\'views/meeting/index.html\'"]').count()).toBe(1);
                expect(element('.c4p-n-title').text()).toMatch('TestAddEvent');


            });

    	});

        describe('Configuration', function () {

            it('should go to Configuration page', function () {
                // action
                element(c4p.E2e.asidePageConfigLink).click();
                // checks
                expect(element('#a4pPage .navbar h2[style!="display: none;"]').text()).toMatch(new RegExp('^\\s*Configuration\\s+of\\s+Demo\\s*$'));
                expect(element(c4p.E2e.linkRegister).count()).toBe(1);
                expect(element(c4p.E2e.buttonLogin).count()).toBe(1);
            });

            it('should go to Register page', function () {
                // action
                element(c4p.E2e.linkRegister).click();
                // checks
                expect(element('#a4pPage span').text()).toMatch(new RegExp('^\\s*Enter your email to create an account for CRM Meeting Pad and the Apps4Pro web site'));
            });

        });
*/
    });

});
