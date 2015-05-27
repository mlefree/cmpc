'use strict';


angular.module('srvRunning', [])

.factory('srvRunning', function ($window, $rootScope, $exceptionHandler, cordovaReady) {

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
});



var SrvRunning = (function() {
    function Service(exceptionHandlerService) {
        this.exceptionHandler = exceptionHandlerService;

        this.refresh = false;
        this.pause = false;
        this.online = true;

        this.callbacksRefresh = [];
        this.callbacksPause = [];
        this.callbacksOnline = [];
        this.callbackHandle = 0;
    }
    Service.prototype.setRefresh = function (yes) {
        this.refresh = yes;
        triggerRefresh(this, yes);
    };
    Service.prototype.setPause = function (yes) {
        this.pause = yes;
        triggerPause(this, yes);
    };
    Service.prototype.setOnline = function (yes) {
        this.online = yes;
        triggerOnline(this, yes);
    };
    Service.prototype.addListenerOnRefresh = function (fct) {
        this.callbackHandle++;
        this.callbacksRefresh.push({id:this.callbackHandle, callback:fct});
        return this.callbackHandle;
    };
    Service.prototype.addListenerOnPause = function (fct) {
        this.callbackHandle++;
        this.callbacksPause.push({id:this.callbackHandle, callback:fct});
        return this.callbackHandle;
    };
    Service.prototype.addListenerOnOnline = function (fct) {
        this.callbackHandle++;
        this.callbacksOnline.push({id:this.callbackHandle, callback:fct});
        return this.callbackHandle;
    };
    Service.prototype.cancelListener = function (callbackHandle) {
        if (removeIdFromList(this.callbacksRefresh, callbackHandle) === false) {
            if (removeIdFromList(this.callbacksPause, callbackHandle) === false) {
                return (removeIdFromList(this.callbacksOnline, callbackHandle) !== false);
            }
        }
        return true;
    };
    function triggerRefresh(self, yes) {
        var callbacks = self.callbacksRefresh.slice(0);// Copy to be independant of updates
        for (var idx = 0, max = callbacks.length; idx < max; idx++) {
            try {
                callbacks[idx].callback(callbacks[idx].id, yes);
            } catch (e) {
                self.exceptionHandler(e, "srvRunning.callbacksRefresh#" + idx);
            }
        }
    }
    function triggerPause(self, yes) {
        var callbacks = self.callbacksPause.slice(0);// Copy to be independant of updates
        for (var idx = 0, max = callbacks.length; idx < max; idx++) {
            try {
                callbacks[idx].callback(callbacks[idx].id, yes);
            } catch (e) {
                self.exceptionHandler(e, "srvRunning.callbacksPause#" + idx);
            }
        }
    }
    function triggerOnline(self, yes) {
        var callbacks = self.callbacksOnline.slice(0);// Copy to be independant of updates
        for (var idx = 0, max = callbacks.length; idx < max; idx++) {
            try {
                callbacks[idx].callback(callbacks[idx].id, yes);
            } catch (e) {
                self.exceptionHandler(e, "srvRunning.callbacksOnline#" + idx);
            }
        }
    }
    return Service;
})();
