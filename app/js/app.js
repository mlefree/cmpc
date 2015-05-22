
// Declare app level module which depends on filters, and services
var appModule = angular.module('c4p',
                                    [
                                        //'ngAnimate',
                                        'ngTouch',
                                        'ngSanitize',
                                        //,'textAngular'
                                        'ui.bootstrap',
                                        'c4p.filters',
                                        'c4pServices',
                                        'c4p.directives',
                                        //'c4pTemplates',
                                        "c4p.controllers"
                                    ]);

appModule.value('version', '14S25'); //TODO cf BUILD_DATE


var serviceModule = angular.module('c4pServices', ['ngResource']);

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

// This wrapper will queue up PhoneGap API calls if called before deviceready  and call them after deviceready fires.
// After deviceready has been called, the API calls will occur normally.
//a4p.InternalLog.log('cordovaReady', 'creation');
console.log('cordovaReady' + ' creation');
serviceModule.factory('cordovaReady', ['$window', '$rootScope',
    function ($window, $rootScope) {
        return function (userCallback) {
            'use strict';
            var queue = [];
            // Initially queue up userCallbacks
            var impl = function () {
                // queue a function with following arguments a4pDumpData(arguments, 2)
                queue.push(Array.prototype.slice.call(arguments));
            };
            var readyCallback = function () {
                //a4p.InternalLog.log('cordovaReady', 'Cordova is ready');
                queue.forEach(function (args) {
                    // call queued function with following arguments a4pDumpData(args, 2)
                    userCallback.apply(this, args);
                });
                // next userCallbacks will be called directly for now
                impl = userCallback;
            };
            if ($window.navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad|android|blackberry|webos|symbian|ios|bada|tizen|windows phone)/) !== null) {
                //a4p.InternalLog.log('cordovaReady', 'Cordova : cordovaReady() will be called upon deviceready event');
                // if cordova : immediatly called if event 'deviceready' is already fired
                // FIXME : $window.addEventListener('deviceready', ...) does not work in Android
                $window.document.addEventListener('deviceready', function () {
                    //MLE because you could invoke app with string in an app. cf handleOpenURL & invokeString
                    a4p.safeApply($rootScope, function () {
                        //if ('invokeString' in window) {
                            //alert('invokeString '+window.invokeString);
                            //a4p.InternalLog.log('onDeviceReady: ' + window.invokeString);
                            //console.log('onDeviceReady: ' + window.invokeString);
                        //} else {
                            //a4p.InternalLog.log('onDeviceReady: no invokeString');
                            //console.log('onDeviceReady: no invokeString');
                        //}
                        readyCallback();
                    });
                }, false);
            } else if ($window.navigator.userAgent.toLowerCase().match(/(firefox|msie|opera|chrome|safari|windows nt 6.2)/) !== null) {
                // windows nt 6.2 => windows 8
                //a4p.InternalLog.log('cordovaReady', 'No Cordova : cordovaReady() is called immediately');
                console.log('cordovaReady'+' No Cordova : cordovaReady() is called immediately');
                readyCallback();
            } else {
                //a4p.InternalLog.log('cordovaReady', 'Cordova or not : cordovaReady() is called in 10 seconds');
                console.log('cordovaReady'+' Cordova or not : cordovaReady() is called in 10 seconds');
                setTimeout(function () {
                    a4p.safeApply($rootScope, function () {
                        readyCallback();
                    });
                }, 10000);
            }
            return function () {
                return impl.apply(this, arguments);
            };
        };
    }
]);

// Will be unique per AngularJs injector

var srvOpenUrlSingleton = null;

//MLE because you could invoke app with string in an app. cf handleOpenURL & invokeString
function handleOpenURL(url) {
    //a4p.InternalLog.log('handleOpenURL', url);
    //alert('handleOpenURL '+url);
    //window.alert('handleOpenURL '+url);
    window.setTimeout(function () {
        if (srvOpenUrlSingleton) {
            srvOpenUrlSingleton.openUrl(url);
        } else {
            var msg = 'Application not yet started to import the file ' + url;
            alert(msg);
            //window.alert(msg);
        }
    }, 1000);
}

serviceModule.factory('srvOpenUrl', ['$exceptionHandler',
    function ($exceptionHandler) {
        srvOpenUrlSingleton = new SrvOpenUrl($exceptionHandler);
        return srvOpenUrlSingleton;
    }
]);

serviceModule.factory('srvTime', ['$exceptionHandler',
    function ($exceptionHandler) {
        return new SrvTime($exceptionHandler);
    }
]);

serviceModule.factory('srvModel', function () {
    return new SrvModel();
});


serviceModule.factory('srvLoad', function () {
    return new SrvLoad();
});

//a4p.InternalLog.log('srvRunning', 'creation');
serviceModule.factory('srvRunning', ['$window', '$rootScope', '$exceptionHandler', 'cordovaReady',
    function ($window, $rootScope, $exceptionHandler, cordovaReady) {
        'use strict';
        var runningSingleton = new SrvRunning($exceptionHandler);

        if (a4p.isDefined($window.navigator) && a4p.isDefined($window.navigator.onLine)) {
            runningSingleton.setOnline($window.navigator.onLine);
        }

        // Add these listeners ONLY when cordova is ready
        cordovaReady(function () {
            //a4p.InternalLog.log('srvRunning', 'add listeners on pause, resume, online, offline, resign, active and backbutton');
            // DO NOT USE $window.addEventListener("pause", ..., true)
            $window.document.addEventListener("pause", function () {
                // console.log() is not executed in IOS until the application resume
                // see: http://stackoverflow.com/questions/8223020/pause-event-is-not-working-properly-in-phonegap-iphone
                // do not exit here because this event also appears when we take a picture
                console.log('srvRunning onPause');
                a4p.safeApply($rootScope, function () {
                    runningSingleton.setPause(true);
                });
            }, false);

            // DO NOT USE $window.addEventListener("resume", ..., true)
            $window.document.addEventListener("resume", function () {
                console.log('srvRunning onResume');
                a4p.safeApply($rootScope, function () {
                    runningSingleton.setPause(false);
                });
            }, false);

            $window.document.addEventListener("online", function () {
                a4p.safeApply($rootScope, function () {
                    //a4p.InternalLog.log('srvRunning', "Application is online");
                    runningSingleton.setOnline(true);
                });
            }, false);

            $window.document.addEventListener("offline", function () {
                a4p.safeApply($rootScope, function () {
                    //a4p.InternalLog.log('srvRunning', "Application is offline");
                    runningSingleton.setOnline(false);
                });
            }, false);

            $window.document.addEventListener("resign", function () {
                // Lock on IOS
                //a4p.InternalLog.log('srvRunning', "IOS lock");
            }, false);

            $window.document.addEventListener("active", function () {
                // Unlock on IOS
                //a4p.InternalLog.log('srvRunning', "IOS unlock");
            }, false);

            $window.document.addEventListener("backbutton", function () {
                // Exit application upon BACK button
                //alert('srvRunning'+"Back button will exit the application");

                $window.navigator.notification.confirm(
                    "Do you want to exit ?",
                    function checkButtonSelection(button) {
                        if((button == "1") || (button == 1)) {
                            $window.navigator.app.exitApp();//$window.history.back();
                        }
                    },
                    'EXIT :',
                    'OK,Cancel');
            }, false);

            // Receive SEND actions
            if (window.plugins && window.plugins.webintent) {
              // window.plugins.webintent.getExtra("android.intent.extra.TEXT",
              //     function(url) {
              //         console.log("window.plugins.webintent.getExtra text "+url);
              //         handleOpenURL(url);
              //     }, function() {
              //         console.log('App is launched text...');
              //     }
              // );
              // window.plugins.webintent.getExtra("android.intent.extra.STREAM",
              //   function(url) {
              //       console.log("window.plugins.webintent.getExtra stream "+url);
              //       handleOpenURL(url);
              //   }, function() {
              //       console.log("App is launched stream...");
              //   });

              window.plugins.webintent.getUri(
                  function(url) {
                      console.log("window.plugins.webintent.getUri "+url);
                      if (url && url !== "") handleOpenURL(url);
                  }
              );

              window.plugins.webintent.onNewIntent(function(url) {
                console.log("window.plugins.webintent.onNewIntent "+url);
                if (url && url !== "") handleOpenURL(url);
              });
            }

        })();

        return runningSingleton;
    }
]);

serviceModule.factory('srvLocalStorage', function () {
    var LocalStorage = a4p.LocalStorageFactory(window.localStorage);
    return new LocalStorage();
});

serviceModule.factory('srvFileStorage', ['$q', '$rootScope',
    function ($q, $rootScope) {
        return new a4p.FileStorage($q, $rootScope);
    }
]);
serviceModule.factory('srvAnalytics', ['srvLocalStorage',
    function (srvLocalStorage) {
        return new a4p.Analytics(srvLocalStorage,'UA-33541085-3');
    }
]);

serviceModule.factory('srvLog', ['srvLocalStorage',
    function (srvLocalStorage) {
        return new SrvLog(srvLocalStorage);
    }
]);

serviceModule.factory('srvSecurity', ['srvLocalStorage',
    function (srvLocalStorage) {
        return new SrvSecurity(srvLocalStorage);
    }
]);

serviceModule.factory('srvDataTransfer', ['$q', '$http', '$rootScope',
    function ($q, $http, $rootScope) {
        return new SrvDataTransfer($q, $http, $rootScope);
    }
]);

serviceModule.factory('srvDataStore', ['$q', 'srvLocalStorage', 'srvFileStorage', '$rootScope',
    function ($q, srvLocalStorage, srvFileStorage, $rootScope) {
        return new SrvDataStore($q, srvLocalStorage, srvFileStorage , $rootScope);
    }
]);

serviceModule.factory('srvFileTransfer', ['$q', '$http', 'srvFileStorage', '$rootScope',
    function ($q, $http, srvFileStorage, $rootScope) {
        return new SrvFileTransfer($q, $http, srvFileStorage, $rootScope);
    }
]);

serviceModule.factory('srvConfig', ['srvDataTransfer', 'srvLoad', 'srvLocalStorage', 'srvAnalytics',
    function (srvDataTransfer, srvLoad, srvLocalStorage, srvAnalytics) {
        return new SrvConfig(srvDataTransfer, srvLoad, srvLocalStorage, srvAnalytics);
    }
]);

serviceModule.factory('srvLocale', ['$http', 'srvLoad', 'srvLocalStorage',
    function ($http, srvLoad, srvLocalStorage) {
        return new SrvLocale($http, srvLoad, srvLocalStorage);
    }
]);

serviceModule.factory('srvQueue', ['$q', '$exceptionHandler', 'srvDataStore', 'srvSecurity',
    function ($q, $exceptionHandler, srvDataStore, srvSecurity) {
        return new SrvQueue($q, $exceptionHandler, srvDataStore, srvSecurity);
    }
]);

serviceModule.factory('srvSynchro', ['$q', 'srvDataTransfer', 'srvFileTransfer', '$exceptionHandler', 'srvRunning', 'srvLocalStorage', 'srvSecurity',
    function ($q, srvDataTransfer, srvFileTransfer, $exceptionHandler, srvRunning, srvLocalStorage, srvSecurity) {
        return new SrvSynchro($q, srvDataTransfer, srvFileTransfer, $exceptionHandler, srvRunning, srvLocalStorage, srvSecurity);
    }
]);

serviceModule.factory('srvSynchroStatus', ['$q',
    function ($q) {
        return new SrvSynchroStatus($q);
    }
]);

serviceModule.factory('srvData', ['$exceptionHandler', '$q', 'srvLocalStorage', 'srvConfig', 'srvLog', 'srvLocale', 'srvSecurity', 'srvDataTransfer', 'srvDataStore','srvRunning', 'srvSynchro', 'srvSynchroStatus', 'srvQueue', 'srvFileStorage', '$rootScope',
    function ($exceptionHandler, $q, srvLocalStorage, srvConfig, srvLog, srvLocale, srvSecurity, srvDataTransfer, srvDataStore, srvRunning, srvSynchro, srvSynchroStatus, srvQueue, srvFileStorage, $rootScope) {
        return new SrvData($exceptionHandler, $q, srvLocalStorage, srvConfig, srvLog, srvLocale, srvSecurity, srvDataTransfer, srvDataStore, srvRunning, srvSynchro, srvSynchroStatus, srvQueue, srvFileStorage, $rootScope);
    }
]);

serviceModule.factory('srvFacet', ['srvData', 'srvLocale', 'srvConfig',
    function (srvData, srvLocale, srvConfig) {
        var srvFacet = new SrvFacet(srvData, srvLocale, srvConfig);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.objects);
        //srvFacet.addPossibleOrganizerFacet(c4p.Organizer.recents);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.top20);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.mine);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.favorites);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.biblio);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.month);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.week);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.fileDir);
        return srvFacet;
    }
]);

serviceModule.factory('srvNav', ['$exceptionHandler', 'srvData', 'srvLocale', 'srvConfig',
    function ($exceptionHandler, srvData, srvLocale, srvConfig) {
        return new SrvNav($exceptionHandler, srvData, srvLocale, srvConfig);
    }
]);

serviceModule.factory('srvLink', ['srvData', 'srvNav', 'srvLocale',
    function (srvData, srvNav, srvLocale) {
        return new SrvLink(srvData, srvNav, srvLocale);
    }
]);

serviceModule.factory('srvGuider', ['srvLocalStorage', 'srvLocale',
    function (srvLocalStorage, srvLocale) {
        return new SrvGuider(srvLocalStorage, srvLocale);
    }
]);

//a4p.InternalLog.log('serviceModule.factory', 'all factories created');
