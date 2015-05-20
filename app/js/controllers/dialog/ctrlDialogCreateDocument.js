

function ctrlDialogCreateDocument($scope, srvLocale, $modalInstance) {
'use strict';

    // Variables
    $scope.srvLocale = null;

    // Functions

    $scope.constructor = function (srvLocale) {
        $scope.srvLocale = srvLocale;
    };

    $scope.close = function () {
        $modalInstance.dismiss();
    };

    $scope.closeAndTakePicture = function() {
        $modalInstance.close('Picture');
    };


    /**
     * Initialization
     */
    $scope.constructor(srvLocale);
}
