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
        ,'e2e/scenarios_inscription_e2e.js'
    ],


    // list of files to exclude
    exclude: [

    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'html', 'junit'],


    // web server port
    //port: 443,

    //proxies : {
    //    '/': 'http://localhost:8000/'
    //  },
    proxies : {
        //'/www': 'http://127.0.0.1:8000/c4p_html_ang/www/'
        //'/static':'https://www.google.fr'
        //'/static':'https://apps4pro.net/c2'
        //'/static-app':'https://127.0.0.1/c4p_html_ang/www'// /partials/guider/register.html'
        '/static-app':'http://192.168.127.127/c/www'
        //,'/tests': 'http://127.0.0.1:8000/tests/'
        //,'/web-logout':'https://apps4pro.biz/w2/wp-login.php?action=logout'
        //,'/static-web-logout':'https://127.0.0.1/a4pweb_com/www/wp-login.php?action=logout'
        //,'/static-web-users':'https://apps4pro.biz/w2/wp-admin/network/users.php'
        ,'/static-web-logout':'http://192.168.127.127/w/www/wp-login.php?action=logout'
        ,'/static-web-users':'http://192.168.127.127/w/www/wp-admin/network/users.php'
          },
    proxyValidateSSL : false,

    plugins : [
        'karma-junit-reporter',
        'karma-html-reporter',
        'karma-chrome-launcher',
        'karma-phantomjs-launcher',
        'karma-jasmine',
        'karma-ng-scenario'
    ],

    junitReporter : {
        outputFile: '../build/tests/test-e2e-check-result.xml',
        suite: 'c4p e2e check'
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
