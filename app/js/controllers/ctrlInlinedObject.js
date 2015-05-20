

function ctrlInlinedObject($scope, srvData, srvConfig, srvLocale) {
    'use strict';
    // TODO : listen to srvData to update fields if item updated

    $scope.init = function (item) {
        if (!item) return;

        $scope.inlinedItem = item;
        $scope.inlinedItemIcon = $scope.getObjectIcon(item);
        $scope.inlinedItemColor = $scope.getObjectColor(item);
        $scope.inlinedItemName = $scope.getObjectName(item);
        $scope.inlinedItemSecondName = '';

        // if ($scope.inlinedItem.a4p_type && $scope.inlinedItem.a4p_type == 'Contact') {
        //     // Company name
        //     var bCorp = false;
        //     if ($scope.inlinedItem.account_id) {
        //         var account = srvData.getObject($scope.inlinedItem.account_id.dbid);
        //         if (account) {
        //             $scope.inlinedItemSecondName = account.company_name;
        //             bCorp = true;
        //         }
        //     }

        //     if (!bCorp) $scope.inlinedItemSecondName = srvLocale.translations.htmlTextContactWithoutCompany;

        // } else
        if ($scope.inlinedItem.a4p_type && ($scope.inlinedItem.a4p_type == 'Event')) {
            if ($scope.inlinedItem.name) {
                $scope.inlinedItemName = $scope.inlinedItem.name;
            }
            if ($scope.inlinedItem.date_start) {
                $scope.inlinedItemSecondName = srvLocale.formatDate($scope.inlinedItem.date_start, 'c4pShortDateTime');
            }
        }
        else if ($scope.inlinedItem.a4p_type &&
                ($scope.inlinedItem.a4p_type == 'Note' || $scope.inlinedItem.a4p_type == 'Document')) {

            if ($scope.inlinedItem.created_date) {
                $scope.inlinedItemSecondName = srvLocale.formatDate($scope.inlinedItem.created_date, 'c4pShortDateTime');
            }
        }



        //how many relation links
        //var linked = $scope.srvData.getLinkedObjects(item);
        //$scope.itemRelationCount = (linked && typeof linked != 'undefined') ? linked.length : 0;
    };


    $scope.getObjectIcon = function (object){
        return c4p.Model.getItemIcon(object);
    };
    $scope.getObjectColor = function (object){
        return c4p.Model.getItemColor(object);
    };
    $scope.getObjectName = function (object){
        return srvConfig.getItemName(object);
    };

}
ctrlInlinedObject.$inject = ['$scope', 'srvData', 'srvConfig', 'srvLocale'];
