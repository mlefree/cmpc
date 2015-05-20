
/**
 * Drop objects controller
 *
 * @param $scope
 */
function ctrlMeetingObjLinkDrop($scope,  srvData, srvConfig) {
'use strict';

    $scope.dndActive = false;
    $scope.dropOver = false;
    $scope.dragObject = null;


    $scope.dndStart = function (event) {
        if (event.dataTransfer && event.dataTransfer.a4p_type && event.dataTransfer.a4p_type == 'Document') {
            a4p.safeApply($scope, function() {
                $scope.dndActive = true;
                $scope.dragObject = event.dataTransfer;
            });
        }
    };
    $scope.dndEnd = function (event) {
        if ($scope.dndActive) {
            a4p.safeApply($scope, function() {
                $scope.dndActive = false;
                $scope.dragObject = null;
            });
        }
    };
    $scope.dndCancel = function (event) {
        if ($scope.dndActive) {
            a4p.safeApply($scope, function() {
                $scope.dndActive = false;
                $scope.dragObject = null;
            });
        }
    };
    $scope.dropOverEnter = function (event) {
        if ($scope.dndActive && !$scope.dropOver) {
            a4p.safeApply($scope, function() {
                $scope.dropOver = true;
            });
        }
    };
    $scope.dropOverLeave = function (event) {
        if ($scope.dndActive && $scope.dropOver) {
            a4p.safeApply($scope, function() {
                $scope.dropOver = false;
            });
        }
    };
    $scope.dropEnd = function (event) {
        var obj= event.dataTransfer;
        if (!obj.a4p_type) return;
        if (obj.a4p_type != 'Document') return;

        var aPlan = $scope.selectedMeetingPlan;

        srvData.newAttachment('Plannee', obj, aPlan);
        //aPlan.title = srvConfig.getItemName(obj);

        //SEEMS Dirty BUT
        // it is needed to refresh correctly the update of the ng-include directive
        //
        a4p.safeApply($scope, function() {
        //     $scope.setMeetingObject(null);
        // });
        //
        // a4p.safeApply($scope, function() {
        //     //set view to plan
        //     $scope.setActionItem('plan');
        //     $scope.setMeetingObject(aPlan);
            $scope.updateMeetingObj();
        });
    };
}


ctrlMeetingObjLinkDrop.$inject = ['$scope', 'srvData', 'srvConfig'];
