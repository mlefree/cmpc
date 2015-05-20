

function ctrlEditDialogErrorReport($scope, srvLocale, $modalInstance) {
  'use strict';

  // Variables

  $scope.srvLocale = srvLocale;
  $scope.feedbackLastUpdate = 0; //used for scroll update
  $scope.feedback = {message:''};

  /**
  * Functions
  */

  $scope.submit = function () {
    $modalInstance.close({feedback:$scope.feedback});
  };

  $scope.close = function () {
    $modalInstance.dismiss(undefined);
  };
}
