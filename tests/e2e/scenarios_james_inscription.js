describe('James inscription', function() {

	it('launch application', function() {
        browser().navigateTo('../../www/');
		sleep(1);

	});

	it('create account', function() {
		element('a[ng-click="gotoRegister()"]').click();
		sleep(1);

		input('email').enter('testCreateAccount@apps4pro.com');
		sleep(1);

		element('button[ng-click="createAccount()"]').click();
		sleep(8);

		expect(element('label').text()).toBe('Account successfully created. Please check your email to obtain your login and password.');

		element('button[ng-click="gotoLogin()"]').click();
		sleep(1);


	});

	it('create account existed', function() {
		element('a[ng-click="gotoRegister()"]').click();
		sleep(1);

		input('email').enter('testCreateAccount@apps4pro.com');
		sleep(1);

		element('button[ng-click="createAccount()"]').click();
		sleep(5);

		expect(element('label').text()).toBe('Synchronization problem with database. W4p user already exists.');

		element('button[ng-click="gotoLogin()"]').click();
		sleep(1);


	});



	it('request password when account no exist', function() {

		element('a[ng-click="gotoSlide(pageGuider, slideGuiderRequestPassword)"]').click();
		sleep(1);

		input('email').enter('requestPassword@apps4pro.com');
		sleep(1);

		element('button[ng-click="requestPassword()"]').click();
		sleep(2);

		expect(element('label').text()).toBe('Synchronization problem with database.  User login doesn\'t exists.');

		element('button[ng-click="gotoLogin()"]').click();
		sleep(1);

	});



	it('request password when account exist', function() {

		element('a[ng-click="gotoSlide(pageGuider, slideGuiderRequestPassword)"]').click();
		sleep(1);

		input('email').enter('testCreateAccount@apps4pro.com');
		sleep(1);

		element('button[ng-click="requestPassword()"]').click();
		sleep(5);

		expect(element('label').text()).toBe('Please check email to confirmation');

		element('button[ng-click="gotoLogin()"]').click();
		sleep(1);

	});


});
