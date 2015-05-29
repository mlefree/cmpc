// Karma configuration
// Generated on Mon Oct 14 2013 14:40:19 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['ng-scenario'],


    // list of files / patterns to load in the browser
    files: [
        'e2e/e2e_helpers.js'
        ,'../app/data/c4p_locale.js'
        //,'e2e/scenarios_inscription_e2e.js'
        ,'e2e/scenarios_demo_visitor_e2e.js'
    ],


    // list of files to exclude
    exclude: [

    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'html', 'junit'],


    // web server port
    port: 9876,

    //proxies : {
    //    '/': 'http://localhost:8000/'
    //  },
    proxies : {
          '/www': 'http://127.0.0.1:8000/www'
            ,'/tests': 'http://127.0.0.1:8000/tests'
          },
    proxyValidateSSL : true,

    plugins : [
        'karma-junit-reporter',
        'karma-html-reporter',
        'karma-chrome-launcher',
        'karma-phantomjs-launcher',
        'karma-jasmine',
        'karma-ng-scenario'
    ],

    junitReporter : {
        outputFile: '../build/tests/test-e2e-result.xml',
        suite: 'c4p e2e'
    },
    // the default configuration
    htmlReporter: {
        outputDir: 'build/karma_html'
    },

    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    //browsers: ['Chrome'],
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
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
