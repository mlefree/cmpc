

/**
 * Right Toolbar objects controller
 *
 * @param $scope
 */
function ctrlRightToolbar($scope, $timeout, srvFacet, srvLocale, srvData, srvNav, version) {
'use strict';

    //
    //  Spinner
    //
    $scope.detailRightLoadingSpinner = true;
    $scope.afterRightLoadingSpinnerShow = function() {
      $timeout(function() {
          $scope.detailRightLoadingSpinner = false; // set Spinner
      }, 1500);
    };

    $scope.afterRightLoadingSpinnerHide = function() {
      //
    };


    //
    // Events catch
    //
    $scope.$on('setItemDetail', function (event, item) {
        a4p.InternalLog.log('ctrlRightToolbar - Broadcast setItemDetail',''+item.id.dbid);
            $scope.detailRightLoadingSpinner = true; // set Spinner
    });


    $scope.navListener = srvNav.addListenerOnUpdate(function (callbackId, action, page, slide, id) {
      if (action == 'dropToChangeItemLinks') {
          if (srvNav.item) {
              a4p.safeApply($scope, function() {
                  $scope.detailRightLoadingSpinner = true; // set Spinner
              });
          }
      }
    });




}
ctrlRightToolbar.$inject = ['$scope', '$timeout', 'srvFacet', 'srvLocale', 'srvData', 'srvNav', 'version'];
