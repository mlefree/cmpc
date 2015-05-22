

/**
 * Drop objects controller
 *
 * @param $scope
 */
function ctrlMeetingRemoveDrop($scope, srvLocale, srvData, srvNav, srvLink, srvConfig) {
'use strict';


    $scope.dragIsActive = false;

    //$scope.dndActive = false;
    $scope.dropOver = false;
    $scope.dragObject = null;


    $scope.dndStart = function (event) {
        if (event.dataTransfer && event.dataTransfer.a4p_type &&
            (event.dataTransfer.a4p_type === 'Plan' || event.dataTransfer.a4p_type === 'Contact')) {
            a4p.safeApply($scope, function() {
                $scope.dragIsActive = true;
                $scope.dragObject = event.dataTransfer;
            });
        }
    };
    $scope.dndEnd = function (event) {
        if ($scope.dragIsActive) {
            a4p.safeApply($scope, function() {
                $scope.dragIsActive = false;
                $scope.dragObject = null;
            });
        }
    };
    $scope.dndCancel = function (event) {
        if ($scope.dragIsActive) {
            a4p.safeApply($scope, function() {
                $scope.dragIsActive = false;
                $scope.dragObject = null;
            });
        }
    };
    $scope.dropOverEnter = function (event) {
        if ($scope.dragIsActive && !$scope.dropOver) {
            a4p.safeApply($scope, function() {
                $scope.dropOver = true;
            });
        }
    };
    $scope.dropOverLeave = function (event) {
        if ($scope.dragIsActive && $scope.dropOver) {
            a4p.safeApply($scope, function() {
                $scope.dropOver = false;
            });
        }
    };

    $scope.dropEnd = function (event) {
      var obj = event.dataTransfer;
      var bok = a4p.isDefinedAndNotNull(obj);
      if (!bok) return;


      if (obj.a4p_type === 'Plan') {

        // remove the plan that is child of item
        if (!obj.parent_id) return;
        var pid = ''+obj.parent_id.dbid;
        var cid = ''+srvNav.item.id.dbid;
        if (pid != cid) return;

        // remove meeting object
        // TODO : Remove in sub Plans : replace $scope.plans by plan list of parent Plan
        $scope.removeMeetingElement($scope.meetingPlans, obj.pos);

        a4p.safeApply($scope, function() {
            //set view to plan
            $scope.setActionItem('plan');
            $scope.setMeetingObject(null);
        });
      }
      else if (obj.a4p_type === 'Contact') {
        // remove the attendee from meeting
        a4p.safeApply($scope, function() {
          $scope.removeMeetingAttendee(obj);
        });
      }
    };


}

angular.module('crtl.meetingRemoveDrop', []).controller('ctrlMeetingRemoveDrop', ctrlMeetingRemoveDrop);
//ctrlMeetingRemoveDrop.$inject = ['$scope', 'srvLocale', 'srvData', 'srvNav', 'srvLink', 'srvConfig'];
