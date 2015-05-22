

/**
 * Drop objects controller
 *
 * @param $scope
 */
function ctrlMeetingElementDrop($scope) {
'use strict';


    $scope.dropOver = false;
    $scope.dropIsEnable = false;


    $scope.dndStart = function (event, element) {
        if (event.dataTransfer) {
            a4p.safeApply($scope, function() {
                $scope.dropIsEnable = true;
            });
        }
    };
/*    $scope.dndEnd = function (event, element) {
        if ($scope.dndActive) {
            a4p.safeApply($scope, function() {
                $scope.dndActive = false;
                $scope.dragObject = null;
            });
        }
    };
    $scope.dndCancel = function (event, element) {
        if ($scope.dndActive) {
            a4p.safeApply($scope, function() {
                $scope.dndActive = false;
                $scope.dragObject = null;
            });
        }
    };*/
    $scope.dropOverEnter = function (event, element) {
        if ($scope.dragIsActive && !$scope.dropOver) {
            a4p.safeApply($scope, function() {
                $scope.dropOver = true;
            });
        }
    };
    $scope.dropOverLeave = function (event, element) {
        if ($scope.dragIsActive && $scope.dropOver) {
            a4p.safeApply($scope, function() {
                $scope.dropOver = false;
            });
        }
    };
    $scope.dropEnd = function (event, element, index) {
        // TODO : Drag and Drop over sub Plans : replace $scope.plans by plan list of parent Plan
        $scope.moveMeetingElement($scope.meetingPlans, $scope.dragMeetingElementIdx, index);
        a4p.safeApply($scope, function() {
            $scope.dropIsEnable = false;
        });
    };
}

angular.module('crtl.meetingElementDrop', []).controller('ctrlMeetingElementDrop', ctrlMeetingElementDrop);
//ctrlMeetingElementDrop.$inject = ['$scope'];
