

// ctrlDetailLinkedObjects
// Manage the item links
function ctrlDetailLinkedObjects($scope, $timeout, srvFacet, srvLocale, srvData, srvNav, version) {
'use strict';


    //
    //  Spinner
    //
    $scope.detailLinkedObjectsLoadingSpinner = true;
    $scope.afterDetailLinkedObjectsSpinnerShow = function() {
        $timeout(function() {
                $scope.computeDetailLinkedObjects();
        },800); // depend on animation
    };
    $scope.afterDetailLinkedObjectsSpinnerHide = function() {
        //console.log('Fully hidden');
    };
    $scope.computeDetailLinkedObjects = function() {

        a4p.InternalLog.log('ctrlDetailLinkedObjects','computeDetailLinkedObjects ');
        srvNav.updateLinks();

        a4p.safeApply($scope,function(){
            // remove spinner
            $scope.detailLinkedObjectsLoadingSpinner = false;
            //$scope.$broadcast('itemDetailLoaded', $scope.itemDetailDBId);
        });
    };


    //
    // Events catch
    //
    $scope.$on('setItemDetail', function (event, item) {
        a4p.InternalLog.log('ctrlDetailLinkedObjects - Broadcast setItemDetail',''+item.id.dbid);
            $scope.detailLinkedObjectsLoadingSpinner = true; // set Spinner
    });

    $scope.navListener = srvNav.addListenerOnUpdate(function (callbackId, action, page, slide, id) {
      if (action == 'dropToChangeItemLinks') {
          if (srvNav.item) {
              a4p.safeApply($scope, function() {
                  $scope.detailLinkedObjectsLoadingSpinner = true; // set Spinner
              });
          }
      }
    });

}

angular.module('crtl.detailLinkedObjects', []).controller('ctrlDetailLinkedObjects', ctrlDetailLinkedObjects);
//ctrlDetailLinkedObjects.$inject = ['$scope', '$timeout', 'srvFacet', 'srvLocale', 'srvData', 'srvNav', 'version'];
