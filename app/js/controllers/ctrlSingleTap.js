

function ctrlSingleTap($scope) {
'use strict';

    $scope.singleTapFocusId = '';

    $scope.firstSingleTap = function (focusObject, fnDoubleTap, forceDoubleTap) {

        if (!focusObject) {
          $scope.singleTapFocusId = '';
          return;
        }

        if (forceDoubleTap || $scope.singleTapFocusId == focusObject.id.dbid){
          // Double tap
          if (fnDoubleTap) fnDoubleTap(focusObject, forceDoubleTap);
          $scope.singleTapFocusId = '';
          return;
        }

        //a4p.safeApply(function() {
        $scope.singleTapFocusId = focusObject.id.dbid;
        //});

        //return true;// Not yet focused, do NOT yet next action
    };

}


angular.module('crtl.singleTap', []).controller('ctrlSingleTap', ctrlSingleTap);
//ctrlSingleTap.$inject = ['$scope'];
