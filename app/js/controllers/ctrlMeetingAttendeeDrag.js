

/**
 * Drag objects controller
 *
 * @param $scope
 */
function ctrlMeetingAttendeeDrag($scope, $modal, srvLocale, srvData, srvNav, srvLink, srvConfig) {
    'use strict';

    $scope.meetingElem = null;

    $scope.initMeetingAttendeeDrag = function (meetingElem) {
        $scope.meetingElem = meetingElem;
    };

    $scope.meetingAttendeeDragStart = function (event, element) {
        if ($scope.dragStart) $scope.dragStart(event, element); // event heritage parent

        event.dataTransfer = $scope.meetingElem;
    };



}
ctrlMeetingAttendeeDrag.$inject = ['$scope', '$modal', 'srvLocale', 'srvData', 'srvNav', 'srvLink', 'srvConfig'];
