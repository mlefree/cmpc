

/**
 * Drag objects controller
 *
 * @param $scope
 */
function ctrlMeetingElementDrag($scope, $modal, srvLocale, srvData, srvNav, srvLink, srvConfig) {
    'use strict';

    $scope.meetingElem = null;

    $scope.initMeetingElemDrag = function (meetingElem) {
        $scope.meetingElem = meetingElem;
    };


    $scope.meetingElementDragStart = function (event, element) {
        if ($scope.dragStart) $scope.dragStart(event, element); // event heritage parent

        event.dataTransfer = $scope.meetingElem;
    };

}

angular.module('crtl.meetingElementDrag', []).controller('ctrlMeetingElementDrag', ctrlMeetingElementDrag);
//ctrlMeetingElementDrag.$inject = ['$scope', '$modal', 'srvLocale', 'srvData', 'srvNav', 'srvLink', 'srvConfig'];
