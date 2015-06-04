'use strict';

angular.module('srvModel', [])

.factory('srvModel',  function () {
  return new SrvModel();
});

var SrvModel = (function () {


    function Service() {
        this.model = c4p.Model;

        Service.prototype.getObjectTypeColor = function (objectType) {
            return this.model.a4p_types[objectType].colorType;
        }
    }


    return Service;
})();
