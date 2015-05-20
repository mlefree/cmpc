// Karma configuration
// Generated on Mon Oct 14 2013 14:40:19 GMT+0200 (CEST)

module.exports = function(config) {
	config.set({

		// base path, that will be used to resolve files and exclude
		basePath : '../',

		// frameworks to use
		frameworks : [ 'jasmine' ],

		// list of files / patterns to load in the browser
		files : [
			'../libs/js/angular/angular.min.js',
        	'../libs/js/angular/ui-bootstrap-tpls.min.js',
			'../libs/js/jquery/jquery-2.0.3.min.js',
			'../libs/js/md5.js',
			'js/lib/angular/angular-mocks.js',
			'js/lib/jasmine-jquery/jasmine-jquery.js',
			'../build/js/l4p.min.js',
			'js/unit/*.js',
			'js/unit/a4p/*.js',
			'js/unit/c4p/*.js'
		],
		//    

		// list of files to exclude
		/*exclude : [ 
		            '../libs/js/angular/angular-loader.js',
					'../libs/js/angular/*.min.js',
					'../libs/js/angular/angular-scenario.js' 
					],
*/
		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage' ,
		// 'dots', 'html', 'junit'
		// reporters: ['html','junit'],

		// web server port
		port : 9875,

		plugins : [ 
		            'karma-junit-reporter', 
		            'karma-html-reporter',
					'karma-chrome-launcher', 
					'karma-phantomjs-launcher',
					// 'karma-firefox-launcher',
					// 'karma-script-launcher',
					'karma-jasmine', 
					'karma-ng-scenario' 
					],

		junitReporter : {
			outputFile : '../build/tests/test-result.xml',
			suite : 'unit'
		},
		
		// the default configuration
		htmlReporter : {
			outputDir : 'build/karma_html',
			templatePath : __dirname + '/jasmine_template.html'
		},

		reporters : [ 'progress', 'html', 'junit' ],

		// enable / disable colors in the output (reporters and logs)
		colors : true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR ||
		// config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel : config.LOG_DEBUG,

		// enable / disable watching file and executing tests whenever any file
		// changes
		autoWatch : true,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		//browsers : [ 'PhantomJS'],
		//browsers : [ 'PhantomJS_cust','Chrome_without_security'],
		browsers : [ 'Chrome_without_security'],

 		// you can define custom flags
    	customLaunchers: {
      			PhantomJS_cust: {
					base: 'PhantomJS',
					flags: ['--web-security=false',
							'--local-to-remote-url-access=true',
							'--ignore-ssl-errors=true',
							'--disk-cache=true',
							'--local-storage-quota=10000000'
					        ]
				},
				Chrome_without_security: {
			    	base: 'Chrome',
					flags: ['--disable-web-security',
      						'--unlimited-storage',
							'--allow-file-access',
      						'--allow-file-access-from-files',
      						'--disable-popup-blocking'
      				]
				}
			},

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout : 60000,

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun : false
	});
};
