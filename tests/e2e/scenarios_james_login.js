'use strict';



describe('James Login', function() {
	var today,year ,month,day,hours;

	describe('log in', function() {
		it('launch application', function() {
	        browser().navigateTo('../../www/');
			sleep(1);

		});

		it('log in', function() {
			input("email").enter("mat@apps4pro.com");
			input("password").enter("i2oWD9");
			sleep(1);
			element('button[ng-click="c4pConnection()"]').click();
			sleep(30);

		});

	});

	describe('Event', function() {
		beforeEach(function(){
			today = new Date();
			year = today.getFullYear();
			month = today.getMonth() + 1;
			day = today.getDate();
			hours = today.getHours() + 1;

		});

		it('Check one meeting in day view', function() {
			expect(element('div[ng-repeat="item in selectedDay.events"]').count()).not().toBe(0);
			sleep(1);

		});

		it('Go to event list ', function() {
			element('footer[ng-include="\'views/navigation/footer.html\'"] .container ul:eq(2) li:eq(2) a').click();
			sleep(1);
		});

		it('Check events size > 0', function() {
			expect(element('li[ng-repeat="item in group.events"]').count()).not().toBe(0);
			sleep(1);
		});

		it('click first event go to event page', function() {
			element('ul[ng-repeat="group in (eventGroupsByDay | c4pFilterEventDateMoreThan:now)"]:eq(0) li[ng-repeat="item in group.events"]:eq(0) a').click();
			sleep(1);
		});

		it('check data of event', function() {
			//TODO modify data

			expect(element('span[ng-model="srvNav.item.name"]:eq(0)').text()).toBe('Pr\u00E9sentation');
			expect(element('span[ng-model="srvNav.item.location"]:eq(0)').text()).toBe('Tours');
			expect(element('div[ng-include="\'views/navigation/view_n_event.html\'"] div[class="col-xs-12 well well-small c4p-well-a ng-scope"] span[class="ng-binding"]:eq(0)').text()).toMatch(/4\/28\/13(\t|\r|\n|\s)*2:00 PM/);
			expect(element('div[ng-include="\'views/navigation/view_n_event.html\'"] div[class="col-xs-12 well well-small c4p-well-a ng-scope"] span[class="ng-binding"]:eq(1)').text()).toMatch(/4\/28\/13(\t|\r|\n|\s)*3:00 PM/);

			sleep(1);
		});

		it('Go to add event, fill data and submit', function() {
			element('a[ng-click="addItemDialog()"]').click();
			sleep(1);

			input("eventItem.name").enter("TestAddEvent");
			input("eventItem.location").enter("Test");
			sleep(1);

			element('button[ng-click="submit()"]').click();
			sleep(1);
		});


		it('Add attendees and check addition', function() {
			element('button[ng-click="addContactsToNewEvent()"]').click();

			element('.modal li:eq(0) a').click();
			sleep(1);

			//element('.modal li:eq(1) a').click();
			//sleep(1);

			//element('.modal li:eq(2) a').click();
			//sleep(1);

			element('button[ng-click="addContacts()"]').click();
			sleep(1);

			expect(element('li[ng-repeat="attendee in srvNav.attendees"]:eq(0) span').text()).toMatch('Chatter Expert');
			sleep(1);

			//expect(element('li[ng-repeat="attendee in srvNav.attendees"]:eq(1) span').text()).toMatch('lee_1');
			//sleep(1);

			//expect(element('li[ng-repeat="attendee in srvNav.attendees"]:eq(2) span').text()).toMatch('Ms. Gonzalez');
			//sleep(1);
		});



		it('Add docs and check addition', function() {
			element('a[ng-click="addDocumentsToNewEvent()"]').click();

			element('.modal li:eq(0) a').click();
			sleep(1);

			//element('.modal li:eq(1) a').click();
			//sleep(1);

			//element('.modal li:eq(2) a').click();
			//sleep(1);

			element('button[ng-click="addAttachments()"]').click();
			sleep(1);

			expect(element('li[ng-repeat="document in srvNav.childDocuments"]:eq(0) span').text()).toBe('demo_hr_app.ppt');
			sleep(1);

			//expect(element('li[ng-repeat="document in srvNav.childDocuments"]:eq(1) span').text()).toBe('demo_cv1.pdf');
			//sleep(1);

			//expect(element('li[ng-repeat="document in srvNav.childDocuments"]:eq(2) span').text()).toBe('demo_contract_1.doc');
			//sleep(1);

		});

		it('Creation Mail', function() {
			element('btn[ng-click="writeEmail()"]').click();
			sleep(1);

			element('i[ng-click="openDialogContacts()"]').click();
			sleep(1);

			element('li[ng-repeat="contactItem in (elements = contactsShow | listFilter:contactQuery:false)"]:eq(0) a').click();
			sleep(1);

			element('button[ng-click="addContacts()"]').click();
			sleep(1);

			input('email.body').enter('test email');
			sleep(1);

			element('button[ng-click="sentEmail()"]').click();
			sleep(1);

		});

		it('Go to Mode gallery', function() {
			element('a[ng-click="setMeetingView(\'meetingCarouselView\')"]').click();
			sleep(1);

			//TODO test
		});

		it('Go to Mode split view', function() {
			element('a[ng-click="setMeetingView(\'meetingCarouselView\')"]').click();
			sleep(1);

			//TODO test
		});

		it('Return event page and check pop up', function() {
			element('a[ng-click="quitMeetingView()"]').click();
			sleep(1);

			expect(element('h3').text()).toBe('You changed your meeting, do you want to save it ?');


			element('button[ng-click="close()"]').click();
			sleep(1);

		});

		it('Check that data of this event is not modified', function() {

			expect(element('ul[class="nav nav-stacked"] li').count()).toBe(0);

			sleep(1);

		});


		it('Go to meeting page', function() {
			element('i[ng-click="gotoMeeting()"]').click();
			sleep(1);

			element('a[ng-click="setModeEdit(true)"]').click();
			sleep(1);

		});

		it('Add attendees and check addition', function() {
			element('button[ng-click="addContactsToNewEvent()"]').click();

			element('.modal li:eq(0) a').click();
			sleep(1);

			//element('.modal li:eq(1) a').click();
			//sleep(1);

			//element('.modal li:eq(2) a').click();
			//sleep(1);

			element('button[ng-click="addContacts()"]').click();
			sleep(1);

			expect(element('li[ng-repeat="attendee in srvNav.attendees"]:eq(0) span').text()).toMatch('Chatter Expert');
			sleep(1);

			//expect(element('li[ng-repeat="attendee in srvNav.attendees"]:eq(1) span').text()).toMatch('lee_1');
			//sleep(1);

			//expect(element('li[ng-repeat="attendee in srvNav.attendees"]:eq(2) span').text()).toMatch('Ms. Gonzalez');
			//sleep(1);
		});



		it('Add docs and check addition', function() {
			element('a[ng-click="addDocumentsToNewEvent()"]').click();

			element('.modal li:eq(0) a').click();
			sleep(1);

			//element('.modal li:eq(1) a').click();
			//sleep(1);

			//element('.modal li:eq(2) a').click();
			//sleep(1);

			element('button[ng-click="addAttachments()"]').click();
			sleep(1);

			expect(element('li[ng-repeat="document in srvNav.childDocuments"]:eq(0) span').text()).toBe('demo_hr_app.ppt');
			sleep(1);

			//expect(element('li[ng-repeat="document in srvNav.childDocuments"]:eq(1) span').text()).toBe('demo_cv1.pdf');
			//sleep(1);

			//expect(element('li[ng-repeat="document in srvNav.childDocuments"]:eq(2) span').text()).toBe('demo_contract_1.doc');
			//sleep(1);

		});

		it('Return event page and check pop up', function() {
			element('a[ng-click="quitMeetingView()"]').click();
			sleep(1);

			expect(element('h3').text()).toBe('You changed your meeting, do you want to save it ?');


			element('button[ng-click="submit()"]').click();
			sleep(1);

		});

		it('Check that data of this event is not modified', function() {

			expect(element('ul[class="nav nav-stacked"] li').count()).toBe(2);

			sleep(1);

		});

		it('Go to edit mode and check data of event', function() {
			element('a[ng-click="editItemDialog()"]').click();
			sleep(1);

			expect(element('.modal input:eq(0)').val()).toBe('TestAddEvent');
			expect(element('.modal input:eq(1)').val()).toBe('Test');
			//expect(element('.modal input:eq(2)').val()).toBe('2013-04-28');
			//expect(element('.modal input:eq(3)').val()).toBe('14:00');
			//expect(element('.modal input:eq(4)').val()).toBe('2013-04-28');
			//expect(element('.modal input:eq(5)').val()).toBe('15:00');
			sleep(1);
		});

		it('Edit event and submit', function() {

			using('.modal fieldset[ng-repeat="group in objectGroups"]:eq(0) span[ng-repeat="field in group.groupFields"]:eq(0)').input("object[field.key]").enter("TestAddEvent1");
			sleep(1);

			element('button[ng-click="submit()"]').click();
			sleep(1);

		});

		it('Check modification', function() {
			var startHours = hours;
			var endHours = hours + 1;

			expect(element('h1 span span').text()).toBe('TestAddEvent1');
			expect(element('span[ng-model="srvNav.item.location"] span').text()).toBe('Test');

			expect(element('div[class="col-xs-12 well well-small c4p-well-a ng-scope"] div span:eq(1)').text()).toMatch(day+'/'+month+'/'+'13');
			expect(element('div[class="col-xs-12 well well-small c4p-well-a ng-scope"] div span:eq(1)').text()).toMatch(startHours + ':00');
			expect(element('div[class="col-xs-12 well well-small c4p-well-a ng-scope"] div span:eq(3)').text()).toMatch(day+'/'+month+'/'+'13');
			expect(element('div[class="col-xs-12 well well-small c4p-well-a ng-scope"] div span:eq(3)').text()).toMatch(endHours + ':00');

			sleep(1);

		});

		it('Go to meeting page', function() {
			element('i[ng-click="gotoMeeting()"]').click();
			sleep(1);

			element('a[ng-click="setModeEdit(true)"]').click();
			sleep(1);
		});

		it('Remove attendees and check cancellation', function() {

			element('button[ng-click="srvData.removeAndSaveObject(attendee)"]:eq(0)').click();
			sleep(1);

			//TODO check cancellation
			//expect(element('li[ng-repeat="attendee in srvNav.attendees"]:eq(0) span').text()).toMatch('Chatter Expert');
			//sleep(1);

			//expect(element('li[ng-repeat="attendee in srvNav.attendees"]:eq(1) span').text()).toMatch('lee_1');
			//sleep(1);

			//expect(element('li[ng-repeat="attendee in srvNav.attendees"]:eq(2) span').text()).toMatch('Ms. Gonzalez');
			//sleep(1);
		});



		it('Remove docs and check cancellation', function() {

			element('button[ng-click="srvData.removeAndSaveObject(document)"]:eq(0)').click();
			sleep(1);

			//TODO check cancellation
			//expect(element('li[ng-repeat="document in srvNav.childDocuments"]:eq(0) span').text()).toBe('demo_hr_app.ppt');
			//sleep(1);

			//expect(element('li[ng-repeat="document in srvNav.childDocuments"]:eq(1) span').text()).toBe('demo_cv1.pdf');
			//sleep(1);

			//expect(element('li[ng-repeat="document in srvNav.childDocuments"]:eq(2) span').text()).toBe('demo_contract_1.doc');
			//sleep(1);

		});

		it('Go to event after save edition', function() {
			element('a[ng-click="quitMeetingView()"]').click();
			sleep(1);

			expect(element('h3').text()).toBe('You changed your meeting, do you want to save it ?');


			element('button[ng-click="submit()"]').click();
			sleep(1);

		});

		it('Check edition', function() {

			expect(element('ul[class="nav nav-stacked"] li').count()).toBe(0);

			sleep(1);

		});

		it('Go to calendar view', function() {
			element('i[ng-click="setItemAndGoCalendar()"]').click();
			sleep(1);
		});

		it('Remove the event', function() {
			element('div[ng-click="removeEvent(item)"]').click();
			sleep(1);

		});

		it('Synchronise', function() {
			element('a[ng-click="setNavAside(true)"]').click();
			sleep(1);

			element('a[ng-click="refreshClient();setNavAside(false);"]').click();
			sleep(10);

		});

		it('Check the cancellation of event', function() {
			expect(element('li[ng-repeat="item in group.events"]').count()).not().toBe(1);
			sleep(1);
		});

	});

	describe('Contact', function() {

		it('Search Contact by name', function() {

			element('a[ng-click="setNavAside(true)"]').click();
			sleep(1);

			input("inputs.itemSearchQuery").enter("Abel");
			expect(element('li[ng-repeat="item in (filteredItems = (srvData.currentItems[type] | orderBy:filterCriteria[type]:filterAsc[type] | filter:inputs.itemSearchQuery | filter:inputs.itemSearchCategory))"]').count()).toBe(1);
			expect(element('li[ng-repeat="item in (filteredItems = (srvData.currentItems[type] | orderBy:filterCriteria[type]:filterAsc[type] | filter:inputs.itemSearchQuery | filter:inputs.itemSearchCategory))"] a').text()).toBe('Abel Decadiz');
		});

		it('Go to contact, check data', function() {

			element('li[ng-repeat="item in (filteredItems = (srvData.currentItems[type] | orderBy:filterCriteria[type]:filterAsc[type] | filter:inputs.itemSearchQuery | filter:inputs.itemSearchCategory))"] a').click();
			expect(element('h1').text()).toMatch(/Mr.(\t|\r|\n|\s)*Abel(\t|\r|\n|\s)*Decadiz/);
			expect(element('span[ng-model="srvNav.item.title"]').text()).toBe('SVP, Administration and Finance');
			expect(element('span[ng-model="srvNav.item.phone_work"]').text()).toBe('(312) 596-1000');
			expect(element('span[ng-model="srvNav.item.email"]').text()).toBe('decadiz_abel@bizfirmcorp.com');

		});

		it('Go to Edit mode and check data', function() {
			element('a[ng-click="editItemDialog()"]').click();
			sleep(1);

			//TODO check contact

		});


		it('Edit the contact and submit', function() {
			//TODO edit contact

			element('button[ng-click="submit()"]').click();
			sleep(1);

		});

		it('Check modification', function() {
			//TODO check contact

		});

		it('Reset contact', function() {
			//TODO reset contact

		});

		it('Check contact no change', function() {
			//TODO check contact no change

		});

	});

	describe('Account', function() {

		it('Search Account by name', function() {

			element('a[ng-click="setNavAside(true)"]').click();
			sleep(1);
			//TODO select account
			//input("inputs.itemSearchQuery").enter("Abel");
			expect(element('li[ng-repeat="item in (filteredItems = (srvData.currentItems[type] | orderBy:filterCriteria[type]:filterAsc[type] | filter:inputs.itemSearchQuery | filter:inputs.itemSearchCategory))"]').count()).toBe(1);
			//expect(element('li[ng-repeat="item in (filteredItems = (srvData.currentItems[type] | orderBy:filterCriteria[type]:filterAsc[type] | filter:inputs.itemSearchQuery | filter:inputs.itemSearchCategory))"] a').text()).toBe('Abel Decadiz');
		});

		it('Go to account, check data', function() {

			element('li[ng-repeat="item in (filteredItems = (srvData.currentItems[type] | orderBy:filterCriteria[type]:filterAsc[type] | filter:inputs.itemSearchQuery | filter:inputs.itemSearchCategory))"] a').click();
			//expect(element('h1').text()).toMatch(/Mr.(\t|\r|\n|\s)*Abel(\t|\r|\n|\s)*Decadiz/);
			//expect(element('span[ng-model="srvNav.item.title"]').text()).toBe('SVP, Administration and Finance');
			//expect(element('span[ng-model="srvNav.item.phone_work"]').text()).toBe('(312) 596-1000');
			//expect(element('span[ng-model="srvNav.item.email"]').text()).toBe('decadiz_abel@bizfirmcorp.com');

		});

		it('Go to Edit mode and check data', function() {
			element('a[ng-click="editItemDialog()"]').click();
			sleep(1);

			//TODO check account

		});


		it('Edit the account and submit', function() {
			//TODO edit account

			element('button[ng-click="submit()"]').click();
			sleep(1);

		});

		it('Check modification', function() {
			//TODO check account

		});

		it('Reset account', function() {
			//TODO reset account

		});

		it('Check account no change', function() {
			//TODO check account no change

		});

	});



});
