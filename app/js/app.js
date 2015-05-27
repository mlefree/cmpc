
// Declare app level module which depends on filters, and services
var appModule = angular.module('c4p',
                                    [
                                        //'ngAnimate',
                                        'ngTouch',
                                        'ngSanitize',
                                        'ngResource',
                                        //,'textAngular'
                                        'angular-md5',
                                        'ui.bootstrap',
                                        'c4p.filters',
                                        'c4p.services',
                                        'c4p.directives',
                                        //'c4pTemplates',
                                        'c4p.controllers'
                                    ]);

appModule.value('version', '14S25'); //TODO cf BUILD_DATE

//var serviceModule = angular.module('c4p.services', []);

//a4p.InternalLog.log('$exceptionHandler', 'creation');
appModule.factory('$exceptionHandler', ['$log',
    function ($log) {
        'use strict';
        function formatError(arg) {
            if (arg instanceof Error) {
                if (arg.stack) {
                    arg = (arg.message && arg.stack.indexOf(arg.message) === -1) ? 'Error: ' + arg.message + '\n' + arg.stack : arg.stack;
                } else if (arg.sourceURL) {
                    arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
                }
            }
            return arg;
        }

        return function (exception, cause) {
            try {
                a4p.ErrorLog.log(formatError(exception), formatError(cause)+ ", " +
                    navigator.userAgent + ', ' + navigator.vendor + ', ' + navigator.platform);
                $log.error.apply($log, arguments);
            } catch (e) {
                // We do not want another exception
            }
        };
    }
]);


angular.module('srvA4p', [])

.factory('srvLocalStorage', function () {
    var LocalStorage = a4p.LocalStorageFactory(window.localStorage);
    return new LocalStorage();
})
.factory('srvFileStorage', function ($q, $rootScope) {
        return new a4p.FileStorage($q, $rootScope);
})
.factory('srvAnalytics', function (srvLocalStorage) {
        return new a4p.Analytics(srvLocalStorage,'UA-33541085-3');
});





//a4p.InternalLog.log('serviceModule.factory', 'all factories created');
