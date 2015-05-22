'use strict';

describe('Demo Visitor', function () {

    describe('Verify Guider', function () {

    	// Tests must start with home page loading
		it('should be on home/logon page with english locale', function () {
			// Init browser to root url of application
		    browser().navigateTo('../../www/index.html');
		    
		    // wait 1s for dom loading
		    sleep(2);
		    
		    // Check user located on home page
		    expect(element("#a4pWaiter").text()).toMatch('...');
		   

		    // Check user located on home page
		    expect(element(c4p.E2e.home.pageTitle).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlGuiderPageTitle']) + '\\s*$');
		    
		    // Check user located on home page
		    expect(element(c4p.E2e.home.pageTitle).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlGuiderPageTitle']) + '\\s*$');

		    sleep(2);
		    //Go to login page
		    element(c4p.E2e.home.linkLogin).click();
		    		    
		    // Check locale is english by default
		    expect(element(c4p.E2e.home.linkPasswordForgotten).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlButtonPasswordForgotten']) + '\\s*$');
		    expect(element(c4p.E2e.home.labelRememberPassword).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlGuiderFormStaySignedIn']) + '\\s*$');
		    expect(element(c4p.E2e.home.linkRegister).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlButtonRegister']) + '\\s*$');
		});

        it('should toggle locale to french', function () {
        	// Click on select element
            element(c4p.E2e.common.langViewMenu).click();
            
            // Click on french option
            element(c4p.E2e.common.langViewMenuActionFrench).click();
            
		    // Check elements correctly translated
		    expect(element(c4p.E2e.home.linkPasswordForgotten).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.fr['htmlButtonPasswordForgotten']) + '\\s*$');
		    expect(element(c4p.E2e.home.labelRememberPassword).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.fr['htmlGuiderFormStaySignedIn']) + '\\s*$');
		    expect(element(c4p.E2e.home.linkRegister).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.fr['htmlButtonRegister']) + '\\s*$');
        });

		it('should toggle locale to english (prevent error in scenario replay)', function () {
			// Click on select element
		    element(c4p.E2e.common.langViewMenu).click();
		    
		    // Click on french option
		    element(c4p.E2e.common.langViewMenuActionEnglish).click();
		    		    
		    // Check locale is english by default
		    expect(element(c4p.E2e.home.linkPasswordForgotten).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlButtonPasswordForgotten']) + '\\s*$');
		    expect(element(c4p.E2e.home.labelRememberPassword).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlGuiderFormStaySignedIn']) + '\\s*$');
		    expect(element(c4p.E2e.home.linkRegister).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlButtonRegister']) + '\\s*$');
		});

    });

    describe('Verify demo mode', function () {

        describe('View Event', function () {

            it('should be on calendar page in day mode (click on demo mode) with left menu displayed', function () {
                // Trick : click 5 times on hidden footer to launch demo mode !
                element(c4p.E2e.home.footer).click();
                element(c4p.E2e.home.footer).click();
                element(c4p.E2e.home.footer).click();
                element(c4p.E2e.home.footer).click();
                element(c4p.E2e.home.footer).click();
    		    
				// Check user located on calendar page
				expect(element(c4p.E2e.calendar.pageTitle).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlTitleCalendar']) + '\\s*$');

				// Check calendar view initialized in day view => day view action is in display none after menu expand, 
				//whereas other items have no style defined
				element(c4p.E2e.common.a4pPageMenu).click();
				expect(element(c4p.E2e.common.a4pPageMenuDayViewButton).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlActionName'].dayView) + '\\s*$');
				expect(element(c4p.E2e.common.a4pPageMenuDayViewButton).attr('style')).toBe('display: none;');
				expect(element(c4p.E2e.common.a4pPageMenuListViewButton).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlActionName'].listView) + '\\s*$');
				expect(element(c4p.E2e.common.a4pPageMenuListViewButton).attr('style')).toBe(undefined);
				expect(element(c4p.E2e.common.a4pPageMenuMonthViewButton).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlActionName'].monthView) + '\\s*$');
				expect(element(c4p.E2e.common.a4pPageMenuMonthViewButton).attr('style')).toBe(undefined);

				// Check left menu is displayed and complete
				expect(element(c4p.E2e.common.leftMenuActionCalendar).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlTitleCalendar']) + '\\s*$');
				expect(element(c4p.E2e.common.leftMenuActionTasks).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlSlideName'].tasks) + '\\s*$');
				expect(element(c4p.E2e.common.leftMenuActionLeads).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlSlideName'].leads) + '\\s*$');
				expect(element(c4p.E2e.common.leftMenuActionContacts).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlSlideName'].contacts) + '\\s*$');
				expect(element(c4p.E2e.common.leftMenuActionAccounts).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlSlideName'].accounts) + '\\s*$');
				expect(element(c4p.E2e.common.leftMenuActionOpportunities).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlSlideName'].opportunities) + '\\s*$');
				expect(element(c4p.E2e.common.leftMenuActionFavorites).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlFavorites']) + '\\s*$');
				expect(element(c4p.E2e.common.leftMenuActionDocuments).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlSlideName'].documents) + '\\s*$');
				expect(element(c4p.E2e.common.leftMenuActionNotes).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlSlideName'].notes) + '\\s*$');
				expect(element(c4p.E2e.common.leftMenuActionReports).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlSlideName'].reports) + '\\s*$');
			});
            // Disabled for debugging speed
//            it('should have Synchronization notification for 5 seconds', function () {
//                // Check notification last 5 seconds
//                checkNotification(c4p.Locale.en['htmlMsgSynchronizationOK'], 6);
//            });

            // Check one meeting id generated by default as hard coded title "presentation"
            it('should have one meeting displayed in day view for today', function () {
            	// Count number of events in page
                expect(element(c4p.E2e.calendar.pageDayEventList).count()).toBe(1);
                
                // Check event title is "presentation"
				expect(element(c4p.E2e.calendar.pageDayFirstEventTitle).text()).toMatch('^\\s*presentation\\s*$');
                
                // Edit event button must not appear
    		    expect(element(c4p.E2e.event.editButton).count()).toBe(0);
            });

            // Click on meeting and access meeting details
            it('should display event', function () {
                // Click on meeting => performed with overwritten api sensedown() followed by senseup()
                element(c4p.E2e.calendar.pageDayEventAction).sensedown();
                element(c4p.E2e.calendar.pageDayEventAction).senseup();

    		    // Wait 1s for dom loading
    		    sleep(1);
    		    
                // Check page title is Event
            	expect(element(c4p.E2e.event.pageTitle).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlTypeName'].Event) + '\\s*$');
            });

        });

        describe('Edit Event', function () {
            // Get event data and check it is well displayed in edit mode
            it('should display event in edit mode with event data', function () {
            	var now = new Date();
            	var event = [];
            	event.title = element(c4p.E2e.event.labelTitle).text();
            	event.date = element(c4p.E2e.event.labelDate).text();
            	
            	var month = now.getMonth() + 1;
            	if(month > 12) month = 1;

            	var dateToStringSlash = month + '/' + now.getDate() + '/' + ('' + now.getFullYear()).substring(2,4) + ' 4:00 PM';
            	
            	//Date format is normalized inside c4p as 'YYYY-MM-dd HH:mm:ss'
            	var dateToStringNormalized = ('' + now.getFullYear()) + '-' + a4pPadNumber(month, 2) + '-' + a4pPadNumber(now.getDate(), 2);
            	
            	// Check displayed event data in view mode
            	expect(event.title).toMatch('^\\s*' + escapeRegExp('presentation') + '\\s*$');
            	expect(event.date).toMatch('^\\s*' + escapeRegExp(dateToStringSlash) + '\\s*$');
            	            	
                // Click on edit mode
            	element(c4p.E2e.common.a4pPageMenuDropDown).click();
            	element(c4p.E2e.common.a4pPageMenuEditButtonForEvent).click();
            	
    		    // Check data is still there
            	expect(element(c4p.E2e.event.labelTitleEdit).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlFormName']) + '\\s*$');
            	expect(element(c4p.E2e.event.fieldTitleEdit).val()).toMatch('^\\s*' + escapeRegExp('presentation') + '\\s*$');
            	
            	expect(element(c4p.E2e.event.labelDateEdit).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlFormDateStart']) + '\\s*$');
            	expect(element(c4p.E2e.event.fieldDateEdit).val()).toMatch('^\\s*' + dateToStringNormalized + '\\s*$');
            	expect(element(c4p.E2e.event.fieldTimeEdit).val()).toMatch('^\\s*16:00\\s*$');
            });

            // Edit event data and check data well saved
            it('should save event modifications', function () {    		    
    		    expect(element(c4p.E2e.event.eventEditList + ':eq(0)').count()).toBe(1);
    		    
                // Modify event title and location
    		    expect(using(c4p.E2e.event.eventEditList + ':eq(0)').input("object[field.key]").val()).toBe('presentation');
                using(c4p.E2e.event.eventEditList + ':eq(0)').input("object[field.key]").enter('TestEditEvent');// name
                using(c4p.E2e.event.eventEditList + ':eq(1)').input("object[field.key]").enter('Room 1');// location

                // Validate modifications
                element(c4p.E2e.event.buttonSaveEvent).click();

    		    // Wait 1s for dom loading
    		    sleep(1);

            	// Check displayed event data in view mode
            	expect(element(c4p.E2e.event.labelTitle).text()).toMatch('^\\s*' + escapeRegExp('TestEditEvent') + '\\s*$'); // Event title
            	expect(element(c4p.E2e.event.labelLocation).text()).toMatch('^\\s*' + escapeRegExp('Room 1') + '\\s*$'); // Event location
            });

            // Attahc attendees
            it('should add 2 attendees to event', function () {		
				// Click on drop down arrow to display available actions for event
            	element(c4p.E2e.common.a4pPageMenuDropDown).click();
            	element(c4p.E2e.common.a4pPageMenuAttendeeButton).click();
				            	
            	// Select 1st and 3rd contacts
            	element(c4p.E2e.modal.elem + ':eq(0)').click();
            	element(c4p.E2e.modal.elem + ':eq(2)').click();
            	
            	// Click validate button to add contacts to event
            	element(c4p.E2e.modal.buttonValidate).click();

            	// Check contact button in right menu counts 2 added attendees (1 by default)
            	expect(element(c4p.E2e.common.rightMenuActionList + ':eq(0) ' + c4p.E2e.common.rightMenuLinksNumber).text()).toBe('3');

//                // Click on left menu contact button
//            	element(c4p.E2e.common.leftMenuActionContacts).click();
//            	
//				//Drag'n'drop tests => to debug //TODO
//				element(c4p.E2e.contact.contactList + ':eq(0)').sensedown(0, 0, 0);
//				sleep(1);
//				element(c4p.E2e.contact.contactList + ':eq(0)').sensemove(0, element(c4p.E2e.contact.contactList).width() + 500, 0);
//				element(c4p.E2e.contact.contactList + ':eq(0)').senseup(0, 0, 0);
//				sleep(1);
//				
//				pause();
            });

            // Attach documents
            it('should attach 3 documents to event', function () {
				// Click on drop down arrow to display available actions for event
            	element(c4p.E2e.common.a4pPageMenuDropDown).click();
            	element(c4p.E2e.common.a4pPageMenuDocumentButton).click();
				            	
            	// Select 1st, 3rd and 5th documents
            	element(c4p.E2e.modal.elem + ':eq(0)').click();
            	element(c4p.E2e.modal.elem + ':eq(2)').click();
            	element(c4p.E2e.modal.elem + ':eq(4)').click();
            	
            	// Click validate button to add contacts to event
            	element(c4p.E2e.modal.buttonValidate).click();
            	            	
            	// Check document button in right menu counts 3 added documents
            	expect(element(c4p.E2e.common.rightMenuActionList + ':eq(1) ' + c4p.E2e.common.rightMenuLinksNumber).text()).toBe('3');
            });

            // Attach an email
            it('should attach an email to event', function () {				
				// Click on drop down arrow to display available actions for event
            	element(c4p.E2e.common.a4pPageMenuDropDown).click();
            	element(c4p.E2e.common.a4pPageMenuEmailButton).click();
				            	
            	// Prompt email address
                using(c4p.E2e.modal.email.container).input(c4p.E2e.modal.email.inputSubject).enter('Email test');// Subject
                using(c4p.E2e.modal.email.container).input(c4p.E2e.modal.email.inputContent).enter('Content test');// Content
                
                // Since contacts are automatically added when field loses focus (which cannot be reproduced in e2e tests),
                // contacts are added from list choice
                //using(c4p.E2e.modal.email.container).input(c4p.E2e.modal.email.inputEmail).enter('test@apps4pro.com;');// Contact
                element(c4p.E2e.modal.email.buttonAddContact).click();
            	element(c4p.E2e.modal.elem + ':eq(0)').click();            	
            	element(c4p.E2e.modal.buttonValidate).click(); // Click validate button to add contacts to mail
            	
            	// Send and attach email
            	element(c4p.E2e.modal.email.buttonSend).click();
            	            	
            	// Check document button in right menu counts 4 added documents (3 previous + 1 email)
            	expect(element(c4p.E2e.common.rightMenuActionList + ':eq(1) ' + c4p.E2e.common.rightMenuLinksNumber).text()).toBe('4');
            });

            // Go back to calendar view, check modified event is displayed
            it('should go to calendar page and display current modified event', function () {
            	// Click on left menu calendar action button
            	element(c4p.E2e.common.leftMenuActionCalendar).click();
            	
            	// Check event is displayed on page with modified title
				expect(element(c4p.E2e.calendar.pageDayFirstEventTitle).text()).toMatch('^\\s*TestEditEvent\\s*$');
            });
        });
        
        describe('Add contact', function () {

            it('should display contact view', function () {
                // Click on left menu contact button
            	element(c4p.E2e.common.leftMenuActionContacts).click();
            	
            	// Check contact modal id displayed
            	expect(element(c4p.E2e.contact.pageTitle).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlTitleType'].Contact) + '\\s*$');
            	
            	// Check nb of contact is 38
            	expect(element(c4p.E2e.contact.contactsCount).text()).toMatch('^\\s*38\\s*$'); // Title indicates the count
            	expect(element(c4p.E2e.contact.contactList).count()).toBe(38); // Perform real count
            });
            
            it('should add a contact', function () {	
            	// Click on "plus" icon to add a contact
            	element(c4p.E2e.contact.buttonAddContact).click();
            	
            	// Prompt first and last name then submit form
            	using(c4p.E2e.contactManagement.inputFirstName).input('object[field.key]').enter('Papa');
            	using(c4p.E2e.contactManagement.inputLastName).input('object[field.key]').enter('Dopoulos');
            	using(c4p.E2e.contactManagement.inputEmail).input('object[field.key]').enter('papa.dopoulos@apps4pro.com');
            	
            	// Submit form
            	element(c4p.E2e.contactManagement.buttonSaveContact).click();
            });
            
            it('should display added contact details', function () {
            	// Check contact title is previously added contact
            	expect(element(c4p.E2e.contactDetails.labelTitle).text()).toMatch('^\\s*Mr. Papa Dopoulos\\s*$');
            	
            	// Check prompted email
            	expect(element(c4p.E2e.contactDetails.labelEmail).text()).toMatch('^\\s*' + escapeRegExp('papa.dopoulos@apps4pro.com') + '\\s*$');
            });
        });
        
        describe('Search & view contact', function () {
            
            it('should find added contact by keyword', function () {
            	// First go back to calendar view
            	element(c4p.E2e.common.leftMenuActionCalendar).click();
            	
                // Click on left menu contact button
            	element(c4p.E2e.common.leftMenuActionContacts).click();
            	
                // Click on search input
            	element(c4p.E2e.contact.searchArea).click();
            	
            	// Prompt text 'dopou'
            	using(c4p.E2e.contact.inputSearch).input('inputs.itemSearchQuery').enter('dopoul');
            	
            	// Check nb of contact is 1
            	expect(element(c4p.E2e.contact.contactsCount).text()).toMatch('^\\s*1\\s*$'); // Title indicates the count
            	expect(element(c4p.E2e.contact.contactList).count()).toBe(1); // Perform real count    
            	
            	// Click on contact
            	element(c4p.E2e.contact.contactList).sensedown();
            	element(c4p.E2e.contact.contactList).senseup();
            	
            	sleep(1);
            	
            	// Check contact title is previously added contact
            	expect(element(c4p.E2e.contactDetails.labelTitle).text()).toMatch('^\\s*Mr. Papa Dopoulos\\s*$');
            	
            	// Check prompted email
            	expect(element(c4p.E2e.contactDetails.labelEmail).text()).toMatch('^\\s*' + escapeRegExp('papa.dopoulos@apps4pro.com') + '\\s*$');
            });

        });
        
        describe('Edit contact', function () {
        	
            it('should display contact in edit mode', function () {	
	            // Click on edit mode
	        	element(c4p.E2e.common.a4pPageMenuDropDown).click();
	        	element(c4p.E2e.common.a4pPageMenuEditButtonForContact).click();
            	
	        	sleep(1);
	        	
            	// Edit civility then submit form
            	using(c4p.E2e.contactManagement.inputCivility).select('object[field.key]').option('Mrs.');
            	
            	// Submit form
            	element(c4p.E2e.contactManagement.buttonSaveContact).click();
            });
            
            it('should display edited contact details', function () {
            	// Check contact title is previously added contact
            	expect(element(c4p.E2e.contactDetails.labelTitle).text()).toMatch('^\\s*Mrs. Papa Dopoulos\\s*$');
            	
            	// Check prompted email
            	expect(element(c4p.E2e.contactDetails.labelEmail).text()).toMatch('^\\s*' + escapeRegExp('papa.dopoulos@apps4pro.com') + '\\s*$');
            });

//            it('should be finished', function () {				
//            	pause();
//            });
        });
        
    });
            
            
            
            
            
            

//        describe('Event', function () {
//
//            describe('Viewing event', function () {
//
//                it('should select the first event and show Event page', function () {
//                    // action
//                    element(c4p.E2e.calendarPageDayEventList + ':eq(0) ' + c4p.E2e.inCalendarPageDayEventButton).click();
//                    // checks
//                    expect(element(c4p.E2e.detailPageItemName).text()).toMatch(new RegExp(c4p.E2e.firstEventNameRegExp));
//                    expect(element(c4p.E2e.detailPageItemLocation).text()).toMatch(/\s*/);
//                    expect(element(c4p.E2e.np1PageItemList).count()).not().toBe('0');
//                });
//
//                it('should have Event guider', function () {
//                    // checks
//                    checkGuider(new RegExp('^\\s*Adding attendees, documents\\.\\.\\.I start my show\\.\\s*'));
//                });
//
//                it('should quit Event guider', function () {
//                    // action
//                    element(c4p.E2e.linkGuiderClose).click();
//                    // checks
//                    checkNoGuider();
//                });
//
//            });
//
//            describe('Editing event', function () {
//
//                it('should toggle Event to edit mode', function () {
//                    // action
//                    element(c4p.E2e.linkEditItem).click();
//                    // checks
//                    checkNbModal(1);
//                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldTitle).text()).toBe('Name');
//                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldInput).val()).toBe(c4p.E2e.firstEventName);
//                    expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldTitle).text()).toBe('Location');
//                    expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldInput).val()).toBe('');
//                    // Beware, date value is in format (YYYY-MM-DD) different from the one shown in browser IHM (DD/MM/YYYY)
//                    expect(element(c4p.E2e.modalFieldList + ':eq(2)' + c4p.E2e.inModalFieldTitle).text()).toBe('From');
//                    expect(element(c4p.E2e.modalFieldList + ':eq(2)' + c4p.E2e.inModalDateInput).val()).toBe(a4pPadNumber(c4p.E2e.firstEventDate.getFullYear(), 4) + '-' + a4pPadNumber(c4p.E2e.firstEventDate.getMonth() + 1, 2) + '-' + a4pPadNumber(c4p.E2e.firstEventDate.getDate(), 2));
//                    expect(element(c4p.E2e.modalFieldList + ':eq(2)' + c4p.E2e.inModalTimeInput).val()).toBe(a4pPadNumber(c4p.E2e.firstEventDate.getHours(), 2) + ':00');
//                    expect(element(c4p.E2e.modalFieldList + ':eq(3)' + c4p.E2e.inModalFieldTitle).text()).toBe('to');
//                    expect(element(c4p.E2e.modalFieldList + ':eq(3)' + c4p.E2e.inModalDateInput).val()).toBe(a4pPadNumber(c4p.E2e.firstEventDate.getFullYear(), 4) + '-' + a4pPadNumber(c4p.E2e.firstEventDate.getMonth() + 1, 2) + '-' + a4pPadNumber(c4p.E2e.firstEventDate.getDate(), 2));
//                    expect(element(c4p.E2e.modalFieldList + ':eq(3)' + c4p.E2e.inModalTimeInput).val()).toBe(a4pPadNumber(c4p.E2e.firstEventDate.getHours() + 1, 2) + ':00');
//                });
//
//                it('should edit Event', function () {
//                    // action
//                    using(c4p.E2e.modalFieldList + ':eq(0)').input("object[field.key]").enter("TestEditEvent");// name
//                    using(c4p.E2e.modalFieldList + ':eq(1)').input("object[field.key]").enter("Test");// location
//                    // checks
//                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldInput).val()).toBe('TestEditEvent');// name
//                    expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldInput).val()).toBe('Test');// location
//                });
//
//                it('should save Event and return to Event page', function () {
//                    // action
//                	element(c4p.E2e.linkModalSubmit).click();
//                    // checks
//                    checkNbModal(0);
//                    expect(element(c4p.E2e.detailPageItemName).text()).toBe('TestEditEvent');
//
//                });
//
//            });
//
//            describe('Creating event', function () {
//
//                it('should open the dialog', function () {
//                    // action
//                    element(c4p.E2e.linkAddItem).click();
//                    // checks
//                    checkNbModal(1);
//                });
//
//                it('should edit the new Event', function () {
//                    // action
//                    using(c4p.E2e.modalFieldList + ':eq(0)').input("object[field.key]").enter("TestAddEvent");// name
//                    using(c4p.E2e.modalFieldList + ':eq(1)').input("object[field.key]").enter("Loc");// location
//                    // checks
//                    expect(element(c4p.E2e.modalFieldList + ':eq(0)' + c4p.E2e.inModalFieldInput).val()).toBe('TestAddEvent');// name
//                    expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldInput).val()).toBe('Loc');// location
//
//                });
//
//                it('should close the dialog and go to its Meeting page', function () {
//                    // action
//                	element(c4p.E2e.linkModalSubmit).click();
//                    // checks
//                    expect(element('div[ng-include="\'views/meeting/index.html\'"]').count()).toBe(1);
//                    expect(element('.c4p-n-title').text()).toMatch('TestAddEvent');
//                });
//
//                it('should have Meeting guider', function () {
//                    // checks
//                	checkGuider(new RegExp('^\\s*Show documents\\.Take notes, pictures\\.\\.\\.Share with my customers\\.\\s*'));
//                });
//
//                it('should quit Meeting guider', function () {
//                    // action
//                    element(c4p.E2e.linkGuiderClose).click();
//                    // checks
//                    checkNoGuider();
//                });
//
//            });
//
//            describe('Modifying event', function () {
//
//                describe('Editing fields', function () {
//
//                    it('should edit description field', function () {
//                        // action
//
//                    	//set edit mode
//                    	element(c4p.E2e.linkDetailSetModeEdit).click();
//
//                        input('srvNav.item.description').enter('Test description');
//                        // checks
//                    });
//
//                });
//
//                describe('Adding attendees', function () {
//
//                    it('should open the dialog', function () {
//                        // action
//                        element('a[ng-click="addContactsToNewEvent()"]').click();
//                        // checks
//                        checkNbModal(1);
//                    });
//
//                    it('should select the first 3 Contacts', function () {
//                        // action
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(0)').sensedown();
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(0)').senseup();
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(1)').sensedown();
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(1)').senseup();
//                        element(c4p.E2e.linkModalToggleItem + ':eq(2)').sensedown();
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(2)').senseup();
//                    });
//
//                    it('should close the dialog and update Event', function () {
//                        // action
//
//                    	element(c4p.E2e.linkModalValidate).click();
//                    	// checks
//                        checkNbModal(0);
//
//                    	expect(element(c4p.E2e.meetingPageAttendeeAttendee + ':eq(0) span').text()).toMatch(new RegExp('^\\s*Mr\\.\\s+Krouvmedjian\\s*$'));
//                        expect(element(c4p.E2e.meetingPageAttendeeAttendee + ':eq(1) span').text()).toMatch(new RegExp('^\\s*Mr\\.\\s+Decadiz\\s*$'));
//                        expect(element(c4p.E2e.meetingPageAttendeeAttendee + ':eq(2) span').text()).toMatch(new RegExp('^\\s*Ms\\.\\s+Vandersplaat\\s*$'));
//                    });
//
//                });
//
//                describe('Adding documents', function () {
//
//                    it('should open the dialog', function () {
//                        // action
//                    	element('.c4p-accordion-heading a.c4p-accordion-toggle').click();
//                        element('a[ng-click="closeAccordionGroup(); addDocumentsToNewEvent()"]').click();
//                        // checks
//                        checkNbModal(1);
//                    });
//
//                    it('should select the first 3 documents', function () {
//                        // action
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(0)').sensedown();
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(0)').senseup();
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(1)').sensedown();
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(1)').senseup();
//                        element(c4p.E2e.linkModalToggleItem + ':eq(2)').sensedown();
//                    	element(c4p.E2e.linkModalToggleItem + ':eq(2)').senseup();
//                    });
//
//                    it('should close the dialog and update Event', function () {
//                        // action
//                        element(c4p.E2e.linkModalValidate).click();
//                        // checks
//                        checkNbModal(0);
//                        expect(element(c4p.E2e.meetingPageAccountedDocument + ':eq(0) h4').text()).toMatch(new RegExp('^\\s*copy_demo_pict1\\.jpg\\s*$'));
//                        expect(element(c4p.E2e.meetingPageAccountedDocument + ':eq(1) h4').text()).toMatch(new RegExp('^\\s*copy_demo_sec_cv\\.pdf\\s*$'));
//                        expect(element(c4p.E2e.meetingPageAccountedDocument + ':eq(2) h4').text()).toMatch(new RegExp('^\\s*copy_demo_contract_1\\.doc\\s*$'));
//                    });
//
//                });
//
//                describe('Creating email', function () {
//
//                    describe('Opening dialog', function () {
//
//                        it('should open the dialog', function () {
//                            // action
//                            element('.c4p-accordion-heading a.c4p-accordion-toggle').click();
//                            element('a[ng-click="closeAccordionGroup(); createNewEmail()"]').click();
//                            // checks
//                            checkNbModal(1);
//                            expect(element('input[ng-model="email.subject"]').val()).toMatch(new RegExp('^Email about TestAddEvent on \\s*'));
//                        });
//
//                    });
//
//                    describe('Adding contacts', function () {
//
//                        it('should open the dialog', function () {
//                            // action
//                            element(c4p.E2e.linkModalAddContacts).click();
//                            // checks
//                            checkNbModal(2);
//                        });
//
//                        it('should select the first 3 Contacts', function () {
//                            // action
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(0)').sensedown();
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(0)').senseup();
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(1)').sensedown();
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(1)').senseup();
//                            element(c4p.E2e.linkModalToggleItem + ':eq(2)').sensedown();
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(2)').senseup();
//                        });
//
//                        it('should close the dialog and update Email', function () {
//                            // action
//                            element(c4p.E2e.linkModalValidate).click();
//                            // checks
//                            checkNbModal(1);
//                            expect(element(c4p.E2e.liModalContact + ':eq(0) ' + c4p.E2e.cardContact).text()).toMatch(new RegExp('^\\s*Mr\\. Ad�le Krouvmedjian\\s*$'));
//                            expect(element(c4p.E2e.liModalContact + ':eq(1) ' + c4p.E2e.cardContact).text()).toMatch(new RegExp('^\\s*Mr\\. Abel Decadiz\\s*$'));
//                            expect(element(c4p.E2e.liModalContact + ':eq(2) ' + c4p.E2e.cardContact).text()).toMatch(new RegExp('^\\s*Ms\\. Agn�s Vandersplaat\\s*$'));
//                        });
//
//                    });
//
//                    describe('Adding attachments', function () {
//
//                        it('should open the dialog', function () {
//                            // action
//                            element(c4p.E2e.linkModalAddAttachments).click();
//                            // checks
//                            checkNbModal(2);
//                        });
//
//                        it('should select the first 3 documents', function () {
//                            // action
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(0)').sensedown();
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(0)').senseup();
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(1)').sensedown();
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(1)').senseup();
//                            element(c4p.E2e.linkModalToggleItem + ':eq(2)').sensedown();
//                        	element(c4p.E2e.linkModalToggleItem + ':eq(2)').senseup();
//                        });
//
//                        it('should close the dialog and update Email', function () {
//                            // action
//                            element(c4p.E2e.linkModalValidate).click();
//                            // checks
//                            checkNbModal(1);
//                            expect(element(c4p.E2e.liModalDocument + ':eq(0) ' + c4p.E2e.cardDocument).text()).toMatch(new RegExp('^\\s*copy_demo_pict1\\.jpg\\s*$'));
//                            expect(element(c4p.E2e.liModalDocument + ':eq(1) ' + c4p.E2e.cardDocument).text()).toMatch(new RegExp('^\\s*copy_demo_sec_cv\\.pdf\\s*$'));
//                            expect(element(c4p.E2e.liModalDocument + ':eq(2) ' + c4p.E2e.cardDocument).text()).toMatch(new RegExp('^\\s*copy_demo_contract_1\\.doc\\s*$'));
//                        });
//
//                    });
//
//                    describe('Editing fields', function () {
//
//                        it('should edit body field', function () {
//                            // action
//                            input("email.body").enter("Test Mail");
//                            // checks
//                            expect(element('textarea[ng-model="email.body"]').val()).toMatch(new RegExp('^\\s*Test Mail\\s*$'));
//                        });
//
//                    });
//
//                    describe('Closing dialog', function () {
//
//                        it('should close the dialog and update Event', function () {
//                            // action
//                            element('button[ng-click="createEmail()"]').click();
//                            // checks
//                            checkNbModal(0);
//                            expect(element(c4p.E2e.meetingPageAccountedDocument + ':eq(3) h4').text()).toMatch(new RegExp('^\\s*email_TestAddEvent_.*\\.pdf\\s*$'));
//                        });
//
//                    });
//
//                });
//
//            });
//
//            describe('Viewing email', function () {
//
//                it('should open the dialog', function () {
//                    // action
//                    element(c4p.E2e.meetingPageAccountedDocument + ':eq(3) a[ng-click="viewDocument(document)"]').click();
//                    // checks
//                    checkNbModal(1);
//                    expect(element('div[class="col-xs-11 well"]:eq(1) p').text()).toMatch(new RegExp('^\\s*Test Mail\\s*$'));
//                });
//
//                it('should close the dialog and return to Event', function () {
//                    // action
//                    element('a[ng-click="close()"]').click();
//                    // checks
//                    checkNbModal(0);
//                });
//
//            });
//
//            describe('Creating and sharing report', function () {
//
//                describe('Opening dialog', function () {
//
//                    it('should open the dialog', function () {
//                        // action
//                        element('.c4p-accordion-heading a.c4p-accordion-toggle').click();
//                        element('a[ng-click="closeAccordionGroup(); createNewNote(\'report\')"]').click();
//                        // checks
//                        checkNbModal(1);
//                        expect(element('div[ng-switch-when="report"] h2').text()).toMatch(new RegExp('^\\s*Report of \\s*'));
//                    });
//
//                });
//
//                describe('Adding ratings', function () {
//
//                    it('should open the dialog', function () {
//                        // action
//                        element(c4p.E2e.linkReportAddRating).click();
//                        // checks
//                        checkNbModal(2);
//                    });
//
//                    it('should select 2 ratings', function () {
//                        // action
//
//                    	element(c4p.E2e.linkRatingFeeling).sensedown();
//                    	element(c4p.E2e.linkRatingFeeling).senseup();
//                    	element(c4p.E2e.linkRatingQuality).sensedown();
//                    	element(c4p.E2e.linkRatingQuality).senseup();
//                    });
//
//                    it('should close the dialog and update Email', function () {
//                        // action
//
//                        element(c4p.E2e.linkRatingSubmit).click();
//                        // checks
//                        checkNbModal(1);
//                        expect(element(c4p.E2e.reportDialogRating).count()).toBe(2);
//                        expect(element(c4p.E2e.reportDialogRating + ':eq(0) ' + c4p.E2e.cardRating + ' > div > div > span:eq(0)').text()).toMatch(new RegExp('^\\s*Feeling\\s*$'));
//                        expect(element(c4p.E2e.reportDialogRating + ':eq(1) ' + c4p.E2e.cardRating + ' > div > div > span:eq(0)').text()).toMatch(new RegExp('^\\s*Quality\\s*$'));
//                        // TODO : click on stars to set rating (pb: usage of addListener instead of ng-click)
//                    });
//
//                });
//
//                describe('Sharing and closing dialog', function () {
//
//                    it('should close the dialog and open the sharing dialog', function () {
//                        // action
//                        element(c4p.E2e.linkReportSubmitAndShare).click();
//                        // checks
//                        checkNbModal(1);
//                        expect(element('.modal:last .modal-body div h2').text()).toMatch(new RegExp('^\\s*Share by email\\s*$'));
//                    });
//
//                    it('should edit subject field', function () {
//                        // action
//                        input("email.subject").enter("Report sharing");
//                        // checks
//                        expect(element('input[ng-model="email.subject"]').val()).toMatch(new RegExp('^\\s*Report sharing\\s*$'));
//                    });
//
//                    it('should close the dialog and update Event', function () {
//                        // action
//                        element(c4p.E2e.linkModalCreateEmail).click();
//                        // checks
//                        checkNbModal(0);
//                        expect(element(c4p.E2e.meetingPageAccountedDocument).count()).toBe(5);
//                        expect(element(c4p.E2e.meetingPageAccountedReport).count()).toBe(1);
//
//                        expect(element(c4p.E2e.meetingPageAccountedDocument + ':eq(3) h4').text()).toMatch(new RegExp('^\\s*email_TestAddEvent_.*\\.pdf\\s*$'));
//                        expect(element(c4p.E2e.meetingPageAccountedReport + ':eq(0) h4').text()).toMatch(new RegExp('^\\s*Report of TestAddEvent\\s*$'));
//
//
//                    });
//
//                });
//
//            });
//
//            describe('Viewing Meeting page', function () {
//
//                it('should go to Meeting gallery view', function () {
//                    // action
//                    element('a[ng-click="setMeetingView(\'meetingCarouselView\')"]').click();
//                    // checks
//                    expect(element('.carousel-inner').count()).toBe(1);
//                });
//
//                it('should go to Meeting split view', function () {
//                    // action
//                    element('a[ng-click="setMeetingView(\'meetingSplitView\')"]').click();
//                    // checks
//                    expect(element('a[ng-click="setMeetingView(\'meetingCarouselView\')"]').count()).toBe(1);
//                });
//
//            });
//
//            describe('Viewing Event page', function () {
//
//                it('should go back to Event page', function () {
//                    // action
//                    element('a[ng-click="quitMeetingView()"]').click();
//                    // checks
//                    checkNbModal(0);
//                    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Event\\s*$'));
//                    expect(element('h1 span span').text()).toMatch(new RegExp('^\\s*TestAddEvent\\s*$'));
//                    expect(element(c4p.E2e.detailPageItemName).text()).toMatch(new RegExp('^\\s*TestAddEvent\\s*$'));
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(0) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Document');
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(0) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*copy_demo_pict1\\.jpg\\s*$'));
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Document');
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(1) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*copy_demo_sec_cv\\.pdf\\s*$'));
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(2) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Document');
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(2) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*copy_demo_contract_1\\.doc\\s*$'));
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(3) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Document');
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(3) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*email_TestAddEvent_' + (c4p.E2e.now.getMonth() + 1) + '-' + c4p.E2e.now.getDate() + '-' + (c4p.E2e.now.getFullYear() % 100) + '.pdf\\s*$'));
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(4) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Document');
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(4) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*email_TestAddEvent_' + (c4p.E2e.now.getMonth() + 1) + '-' + c4p.E2e.now.getDate() + '-' + (c4p.E2e.now.getFullYear() % 100) + '.pdf\\s*$'));
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(5) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Attendee');
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(5) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*Mr\\.\\s*Ad�le\\s*Krouvmedjian\\s*'));
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(6) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Attendee');
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(6) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*Mr\\.\\s*Abel\\s*Decadiz\\s*'));
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(7) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Attendee');
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(7) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*Ms\\.\\s*Agn�s\\s*Vandersplaat\\s*'));
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(8) ' + c4p.E2e.inNp1PageItemBodyTitle).text()).toBe('Report');
//                    expect(element(c4p.E2e.np1PageItemList + ':eq(8) ' + c4p.E2e.inNp1PageItemBodyDetailCardText).text()).toMatch(new RegExp('^\\s*Report of TestAddEvent\\s*$'));
//                    expect(element(c4p.E2e.detailPageItemDescription).text()).toBe('Test description');
//                });
//
//                it('should go again to Meeting page', function () {
//                    // action
//                    element('a[ng-click="gotoMeeting()"]').click();
//                    // checks
//                    expect(element('a[ng-click="setModeEdit(true)"]').attr('style')).not().toBe("display: none;");
//                });
//
//                it('should return again to Event page', function () {
//                    // action
//                    element('a[ng-click="quitMeetingView()"]').click();
//                    // checks
//                    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Event\\s*$'));
//                    expect(element('h1 span span').text()).toMatch(new RegExp('^\\s*TestAddEvent\\s*$'));
//                });
//
//            });
//
//            describe('Viewing event in Calendar page', function () {
//
//                it('should go to calendar view, set day view and check edited events', function () {
//                    // action
//                    element('a[ng-click="setItemAndGoCalendar()"]').click();
//
//                    // Dropdown Calendar View & Action
//                    element(c4p.E2e.calendarViewMenu).click();
//                    element(c4p.E2e.calendarViewMenuActionDay).click();
//                    // checks
//                    checkCalendarTimePageInEnglish();
//
//                    //TODO : ne fonctionne pas entre 23h00 et 24h00, car TestAddEvent passe au lendemain
//                    if (c4p.E2e.now.getHours() < 23) {
//                        expect(element(c4p.E2e.calendarPageDayEventList).count()).toBe(2);
//
//                        if (c4p.E2e.now.getHours() < 15) {
//	                        expect(element(c4p.E2e.calendarPageDayEventList + ':eq(0) ' + c4p.E2e.inCalendarPageDayEventButton).text()).toMatch(new RegExp('^\\s*TestAddEvent\\s+'));
//	                        expect(element(c4p.E2e.calendarPageDayEventList + ':eq(1) ' + c4p.E2e.inCalendarPageDayEventButton).text()).toMatch(new RegExp('^\\s*TestEditEvent\\s+'));
//                        }
//                        else {
//                        	expect(element(c4p.E2e.calendarPageDayEventList + ':eq(0) ' + c4p.E2e.inCalendarPageDayEventButton).text()).toMatch(new RegExp('^\\s*TestEditEvent\\s+'));
//                        	expect(element(c4p.E2e.calendarPageDayEventList + ':eq(1) ' + c4p.E2e.inCalendarPageDayEventButton).text()).toMatch(new RegExp('^\\s*TestAddEvent\\s+'));
//                        }
//                    } else {
//                        expect(element(c4p.E2e.calendarPageDayEventList).count()).toBe(1);
//                        expect(element(c4p.E2e.calendarPageDayEventList + ':eq(0) ' + c4p.E2e.inCalendarPageDayEventButton).text()).toMatch(new RegExp('^\\s*TestAddEvent\\s+'));
//                    }
//
//                });
//
//            });
//
//        });
//
//        describe('Contact', function () {
//
//            describe('Searching contact', function () {
//
//                it('should search by name', function () {
//                    // action
//                    element(c4p.E2e.linkAsidePage).click();
//                    sleep(1);
//                    input("inputs.itemSearchQuery").enter("B\u00e9renice");
//                    // checks
//                    expect(element(c4p.E2e.asidePageItemList).count()).toBe(1);
//                    // WITH beta
//                    //expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton).count()).toBe(1);
//                    //expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*B\u00e9renice Blanchet\\s*$'));
//                    // WITHOUT beta
//                    expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton + ' span span').count()).toBe(1);
//                    expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*Ms\\. B\u00e9renice Blanchet\\s*$'));
//                });
//
//            });
//
//            describe('Viewing contact', function () {
//
//                it('should select the first contact found and show Contact page', function () {
//                    // action
//                    element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton).click();
//                    // checks
//                    expect(element('h1').text()).toMatch(new RegExp('^\\s*Ms\\.\\s+B\u00e9renice\\s+Blanchet\\s*$'));
//                    expect(element('span[ng-model="companyName"]').text()).toBe('Acmebiz International Inc.');
//                    expect(element('span[ng-model="srvNav.item.phone_work"]').text()).toBe('');
//                    expect(element('span[ng-model="srvNav.item.email"]').text()).toBe('bblanchet@acmebiz.com');
//                    expect(element('span[ng-model="srvNav.item.primary_address_street"]').text()).toBe('The Landmark @ One Market');
//                    expect(element('span[ng-model="srvNav.item.primary_address_city"]').text()).toBe('San Francisco');
//                    expect(element('span[ng-model="srvNav.item.primary_address_zipcode"]').text()).toBe('94087');
//                    expect(element('span[ng-model="srvNav.item.primary_address_state"]').text()).toBe('CA');
//                    expect(element('span[ng-model="srvNav.item.primary_address_country"]').text()).toBe('US');
//                    expect(element('div[class="col-xs-12 well well-small c4p-well-c ng-scope"]').attr('style')).not().toBe('display: none;');
//                });
//
//            });
//
//            describe('Editing contact', function () {
//
//                it('should toggle Contact to edit mode', function () {
//                    // action
//                    element(c4p.E2e.linkEditItem).click();
//                    // checks
//                    checkNbModal(1);
//                    expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldTitle).text()).toBe('First name');
//                    expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldInput).val()).toBe('B\u00e9renice');
//                });
//
//                it('should edit Contact', function () {
//                    // action
//                    using(c4p.E2e.modalFieldList + ':eq(1)').input("object[field.key]").enter("B\u00e9reniceO");
//                    // checks
//                    expect(element(c4p.E2e.modalFieldList + ':eq(1)' + c4p.E2e.inModalFieldInput).val()).toBe('B\u00e9reniceO');
//                });
//
//                it('should save Contact and return to Contact page', function () {
//                    // action
//                    element(c4p.E2e.linkModalSubmit).click();
//                    // checks
//                    checkNbModal(0);
//                    expect(element('h1 span[ng-model="srvNav.item.first_name"] span').text()).toBe('B\u00e9reniceO');
//                });
//
//            });
//
//            describe('Searching another contact', function () {
//
//                it('should search by name', function () {
//                    // action
//                    element(c4p.E2e.linkAsidePage).click();
//                    sleep(1);
//                    input("inputs.itemSearchQuery").enter("Anna");
//                    // checks
//                    expect(element(c4p.E2e.asidePageItemList).count()).toBe(1);
//                    // WITH beta
//                    //expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton).text()).toMatch(new RegExp('^\\s*Anna Johnson\\s*$'));
//                    // WITHOUT beta
//                    expect(element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton + ' span span').text()).toMatch(new RegExp('^\\s*Ms. Anna Johnson\\s*$'));
//                });
//
//            });
//
//            describe('Viewing contact', function () {
//
//                it('should select the first contact found and show Contact page', function () {
//                    // action
//                    element(c4p.E2e.asidePageItemList + ':eq(0)' + c4p.E2e.inAsidePageItemButton).click();
//                    // checks
//                    expect(element('h1').text()).toMatch(new RegExp('^\\s*Ms\\.\\s+Anna\\s+Johnson\\s*$'));
//                });
//
//                it('should select the first n+1 Event and go to Meeting page', function () {
//                    // action
//                    element(c4p.E2e.np1PageItemList + ':eq(1) '+ c4p.E2e.inNp1PageItemBodyDetailCardButton).click();
//                	element('a[ng-click="gotoMeeting()"]').click();
//                    // checks
//                    expect(element('a[ng-click="setModeEdit(true)"]').attr('style')).not().toBe("display: none;");
//                });
//
//                it('should quit Meeting page and go to Event page', function () {
//                    // action
//                	element('a[ng-click="quitMeetingView()"]').click();
//                    // checks
//                    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Event\\s*$'));
//                    expect(element('h1 span span').text()).toMatch(new RegExp('^\\s*proposition\\s*$'));
//                });
//
//            });
//
//            describe('Using history', function () {
//
//                it('should have non empty history', function () {
//                    // checks
//
//                    expect(element('div[class="col-xs-1 c4p-navbar-back"]').attr('style')).not().toBe('display: none;');
//                });
//
//                it('should go back in history and view Anna Johnson', function () {
//                    // action
//                    element('a[ng-click="gotoBack()"]').click();
//                    // checks
//                    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Contact\\s*$'));
//                    expect(element('h1').text()).toMatch(new RegExp('^\\s*Ms\\.\\s+Anna\\s+Johnson\\s*$'));
//                    expect(element('div[class="col-xs-1 c4p-navbar-back"]').attr('style')).not().toBe('display: none;');
//                });
//
//                it('should go back in history and view BereniceO Blanchet', function () {
//                    // action
//                    element('a[ng-click="gotoBack()"]').click();
//                    // checks
//                    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Contact\\s*$'));
//                    expect(element('h1').text()).toMatch(new RegExp('^\\s*Ms\\.\\s+B\u00e9reniceO\\s+Blanchet\\s*$'));
//                    expect(element('div[class="col-xs-1 c4p-navbar-back"]').attr('style')).not().toBe('display: none;');
//                });
//
//                it('should go back in history and view TestAddEvent', function () {
//                    // action
//                    element('a[ng-click="gotoBack()"]').click();
//                    // checks
//                    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Event\\s*$'));
//                    expect(element('h1').text()).toMatch(new RegExp('^\\s*TestAddEvent\\s*$'));
//                    expect(element('div[class="col-xs-1 c4p-navbar-back"]').attr('style')).not().toBe('display: none;');
//                });
//
//                it('should go back in history and view TestEditEvent', function () {
//                    // action
//                    element('a[ng-click="gotoBack()"]').click();
//                    // checks
//                    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Event\\s*$'));
//                    expect(element('h1').text()).toMatch(new RegExp('^\\s*TestEditEvent\\s*$'));
//                    expect(element('div[class="col-xs-1 c4p-navbar-back"]').attr('style')).not().toBe('display: none;');
//                });
//
//                it('should finish in Calendar page and hide Back button', function () {
//                    // action
//                    element('a[ng-click="gotoBack()"]').click();
//                    // checks
//                    checkCalendarMonthPageInEnglish();
//                    expect(element('div[class="col-xs-1 c4p-navbar-back hidden-xs hidden-sm"]').attr('style')).toBe('display: none;');
//                });
//
//            });
//
//        });
//
//    });


});
