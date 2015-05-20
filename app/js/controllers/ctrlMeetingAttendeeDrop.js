

/**
 * Drop objects controller
 *
 * @param $scope
 */
function ctrlMeetingAttendeeDrop($scope) {
'use strict';


    $scope.dropOver = false;
    $scope.dropIsEnable = false;


    $scope.dndStart = function (event, element) {
        if (event.dataTransfer && event.dataTransfer.a4p_type && event.dataTransfer.a4p_type == 'Attendee') {
            a4p.safeApply($scope, function() {
                $scope.dropIsEnable = true;
            });
        }
    };
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
        //$scope.moveMeetingElement($scope.meetingPlans, $scope.dragMeetingElementIdx, index);
        a4p.safeApply($scope, function() {
            //$scope.dragIsActive = false;
            $scope.dropIsEnable = true;
        });
    };
}
ctrlMeetingAttendeeDrop.$inject = ['$scope'];
