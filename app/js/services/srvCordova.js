'use strict';

angular.module('srvCordova', [])

.factory('srvCordova', function ($document, $q) {
  return new SrvCordova($document, $q);
});


var SrvCordova = (function() {




  function Service($document, $q) {


          var d = $q.defer(),
              resolved = false;

          var self = this;
          this.ready = d.promise;

          document.addEventListener('deviceready', function() {
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
