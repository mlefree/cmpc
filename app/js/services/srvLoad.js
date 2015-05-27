'use strict';

angular.module('srvLoad', [])

.factory('srvLoad',  function () {
  return new SrvLoad();
});

var SrvLoad = (function() {
    function Service() {
        this.status = '';
        this.error = '';
        this.show = true;
    }
    Service.prototype.setStatus = function (status) {
        this.status = status;
    };
    Service.prototype.setError = function (error) {
        this.error = error;
    };
    Service.prototype.setLoaded = function () {
        this.show = false;
    };
    return Service;
})();
