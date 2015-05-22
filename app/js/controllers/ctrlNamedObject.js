'use strict';

function ctrlNamedObject($scope, srvConfig) {

    $scope.init = function (item) {
        $scope.item = item;
        $scope.itemIcon = c4p.Model.getItemIcon(item);
        $scope.itemName = srvConfig.getItemName(item);
   	};

}


angular.module('crtl.namedObject', []).controller('ctrlNamedObject', ctrlNamedObject);
//ctrlNamedObject.$inject = ['$scope', 'srvConfig'];
