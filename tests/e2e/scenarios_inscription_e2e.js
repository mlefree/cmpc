'use strict';

describe('User Subscription', function () {

    var speed = 10;

    describe('Subscribe', function () {

    	// Tests must start with home page loading
		it('should be on home/logon page with english locale', function () {
			// Init browser to root url of application
		    //browser().navigateTo('../../www/');
			browser().navigateTo(c4pHtmlUrlBase);
            //browser().navigateTo("https://127.0.0.1/c/www"); //'https://127.0.0.1/c4p_html_ang/www/');
            //browser().navigateTo("http://www.google.fr");
            //browser().navigateTo("/static-app"); 
            //browser().navigateTo("http://192.168.127.127/c/www");

		    // wait 1s for dom loading
		    sleep(1*speed); 
            //pause();
            //expect(browser().window().href()).toBe("http://localhost:8080/home/myApp/");
            //expect(element('a._Yh').text()).toMatch('^\\s*Publici*');

		    // Check user located on home page
		    expect(element(c4p.E2e.home.pageTitle).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlGuiderPageTitle']) + '\\s*$');

		    // Check locale is english by default
		    expect(element(c4p.E2e.home.registerButton).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlButtonRegister']) + '\\s*$');
		    expect(element(c4p.E2e.home.linkLogin).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlTextAlreadyRegistered']) + '\\s*$');

		    // Prompt some email address
            var user_email =  'test-user-to-del-'+a4pGetDateString()+'@apps4pro.com';
		    using('form').input("configLogin.email").enter(user_email);

		    // Go to login page
		    element(c4p.E2e.home.registerButton).click();

		    // Check information message is ok
		    expect(element(c4p.E2e.home.informationMessage).text()).toMatch('^\\s*' + escapeRegExp(c4p.Locale.en['htmlFormGuiderTextSuccessCreateAccount']) + '\\s*$');
		});

        it('should delete subcribed user', function () {

            browser().navigateTo(w4pUrlBase + '/wp-login.php?action=logout');
            //browser().navigateTo('/static-web-logout');
            sleep(2*speed); // Useless to wait for longer, navigateTo() already waits for load.
            element('body a').click();

        	// Go to user administration page
        	browser().navigateTo(w4pUrlBase + '/wp-admin/network/users.php');
            //browser().navigateTo('/static-web-users');
        	sleep(1*speed); // Useless to wait for longer, navigateTo() already waits for load.
            
            var user_email =  'test-user-to-del-'+a4pGetDateString()+'@apps4pro.com';

        	// Prompt user credentials for logging
        	element('form#loginform', 'prompt credentials').query(function(form, done) {
        		var forms = form;

        		console.log('form nb: ' + forms.length);
        		for(var i=0;i<forms.length;i++) {
        			console.log(forms[i]);
        		}

        		forms[0][0].value = 'admin';
        		forms[0][1].value = 'a4p56mdp';
        		forms[0].submit();

        		done();
        	});

        	sleep(6*speed); // Need so long for dev-server slow speed CPU

        	// Search for created account by user email
        	element('input#all-user-search-input', 'find user').query(function(input, done) {
        		var myinputs = input;
        		myinputs[0].value = user_email;
        		done();
        	});

        	element('input#search-submit').click();

        	sleep(3*speed);


        	// Delete user
        	element('span.delete a').click();

        	sleep(1*speed);

        	element('input#submit').click();

            sleep(6*speed); // Need so long for dev-server slow speed CPU

            // Search for created account by user email
            element('input#all-user-search-input', 'find user').query(function (input, done) {
                var myinputs = input;
                myinputs[0].value = user_email;
                done();
            });

            element('input#search-submit').click();

            sleep(6*speed); // Need so long for dev-server slow speed CPU

            expect(element('span.delete a').count()).toBe(0);

            element('ul#wp-admin-bar-user-actions > li#wp-admin-bar-logout > a').click();

            sleep(6*speed); // Need so long for dev-server slow speed CPU

            expect(element('form#loginform input#user_login').count()).toBe(1);

        });
    });
});
