

function ctrlEditDialogFeedback($scope, srvLocale, title, message, onlyFeedback, emailRequired, $modalInstance) {
    'use strict';

    // Variables

    $scope.srvLocale = srvLocale;
    $scope.onlyFeedback = (onlyFeedback === true);
    $scope.feedback = {message:message, emailRequired:emailRequired, email:'', phone:'', title: title ||srvLocale.translations.htmlTitleFeedback};
    //$scope.questionActive = false;

    // Functions

    $scope.submit = function () {

      if ($scope.feedback.emailRequired && !$scope.feedback.email) return;
        $modalInstance.close({feedback:$scope.feedback});
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.closeFeedback = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.initializationDone = false;
    $scope.init = function() {
        if ($scope.initializationDone) return;


        $scope.initializationDone = true;
    };

    $scope.toggleQuestion = function() {
      $scope.onlyFeedback = !$scope.onlyFeedback;
    };

    $scope.IsQuestionActive = function() {
      return ($scope.onlyFeedback === true);
    };


    // Init
    $scope.init();
}
