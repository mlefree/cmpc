

function ctrlLinkActions($scope, $timeout, srvData, srvNav, srvLink, srvConfig, srvLog) {
'use strict';

    $scope.dndActive = false;// During Drag And Drop : show drop zone
    $scope.fromLink = '';
    $scope.fromItem = null;

    $scope.dropOver = false;

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

    $scope.dndStart = function (event) {
        $scope.dndActive = false;
        $scope.fromLink = '';
        $scope.fromItem = null;
        if (srvData.isObjectOwnedByUser(srvNav.item)) {
            if (event.dataTransfer) {
                if (event.dataTransfer.id.dbid == srvNav.item.id.dbid) return;// NO linkin on oneself
                a4p.safeApply($scope, function() {
                    if (a4p.isDefined(c4p.Model.linkActionMap[event.dataTransfer.a4p_type]) &&
                        a4p.isDefined(c4p.Model.linkActionMap[event.dataTransfer.a4p_type][srvNav.item.a4p_type])) {
                        var list = c4p.Model.linkActionMap[event.dataTransfer.a4p_type][srvNav.item.a4p_type];
                        for (var i= 0, nb = list.length; i < nb; i++) {
                            var fromLink = list[i];
                            var trashAction = srvLink.hasNamedLinkTo(event.dataTransfer.a4p_type, fromLink, event.dataTransfer, srvNav.item);
                            if (!trashAction) {
                                // We keep ONLY the first link not yet established
                                $scope.dndActive = true;
                                $scope.fromLink = fromLink;
                                $scope.fromItem = event.dataTransfer;
                                srvNav.holdStartItem($scope.fromItem);
                                break;
                            }
                        }
                    }
                });
            }
        }
    };

    $scope.dndEnd = function (event) {
        // Occurs AFTER dropEnd
        if ($scope.dndActive) {
            // NOT executed if DROP event has been handled
            $scope.onCancel();
        }
    };

    $scope.dndCancel = function (event) {
        // Occurs AFTER dropCancel
        if ($scope.dndActive) {
            // NOT executed if DROP event has been handled
            $scope.onCancel();
        }
    };

    $scope.dropStart = function (event) {
    };

    $scope.dropEnd = function (event) {

        var fromName = $scope.getItemNameById($scope.fromItem.id.dbid);
        var toName = $scope.getItemNameById(srvNav.item.id.dbid);
        var linkName = $scope.fromLink;
        var linkDoneMsg, linkNotyMsg;

        if ($scope.dndActive) {

            $scope.dndActive = false;
            linkDoneMsg = "Link done beetween "+fromName+" and "+toName+" as "+linkName;
            linkNotyMsg = 'Link created';
            srvLog.logSuccess(true,linkDoneMsg,linkNotyMsg);
            //a4p.safeApply($scope, function() {
                $timeout(function() { //TODO optimize for perf & fluid

                    //$scope.detailLoadingSpinner = true;
                    srvLink.linkObjectsToItem($scope.fromItem.a4p_type, $scope.fromLink, [$scope.fromItem], srvNav.item);
                    //not working : $scope.$broadcast('changeDetailLinkedObjects',srvNav.item);
                    srvNav.dropToChangeItemLinks();
                },200);
            //});
        }
        else {
            linkDoneMsg = "Link impossible or already done beetween "+fromName+" and "+toName+" as "+linkName;
            linkNotyMsg = 'Link canceled';
            srvLog.logWarning(true,linkDoneMsg,linkNotyMsg);
        }
    };

    $scope.dropCancel = function (event) {
        if ($scope.dndActive) {
            $scope.onCancel();
        }
    };

    $scope.onCancel = function () {
        a4p.safeApply($scope, function() {
            $scope.dndActive = false;
            $scope.fromLink = '';
            $scope.fromItem = null;
            srvNav.holdStopItem();
        });
    };
}
ctrlLinkActions.$inject = ['$scope', '$timeout', 'srvData', 'srvNav', 'srvLink', 'srvConfig', 'srvLog'];
