'use strict';

angular.module('srvCordova', [])

.factory('srvCordova', function ($document, $q) {
  return new SrvCordova($document, $q);
})

// This wrapper will queue up PhoneGap API calls if called before deviceready  and call them after deviceready fires.
// After deviceready has been called, the API calls will occur normally.
//a4p.InternalLog.log('cordovaReady', 'creation');
.factory('cordovaReady', function ($window, $rootScope) {
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
});





var SrvCordova = (function() {

  function Service($document, $q) {


          var d = $q.defer(),
              resolved = false;

          var self = this;
          this.ready = d.promise;

          //TODO ?
          /*document.addEventListener('deviceready', function() {
            resolved = true;
            d.resolve(window.cordova);
          });

          // Check to make sure we didn't miss the
          // event (just in case)
          setTimeout(function() {
            if (!resolved) {
              if (window.cordova) d.resolve(window.cordova);
            }
          }, 3000);
          */
  }

  Service.prototype.getUDID = function () {
    var UDID = 'UID-TEST';
    //if (window.cordova && window.device) UDID = window.device.uuid;
    if (window.device) UDID = window.device.uuid;

    return UDID;
  };

  Service.prototype.initAlreadyDone = function () {
    return true;
  };


  return Service;
})();





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
