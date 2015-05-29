

/**
 * Dialog to select objects from srvData of same type among all objects or among a union of many suggested lists
 *
 * @param $scope
 * @param {Object} srvLocale Locale service
 * @param {Object} dialog Dialog service (from ui-bootstrap)
 * @param {Object} srvData Data service
 * @param {Object} srvConfig Config service
 * @param {string} objectType Type of objects to select/add
 * @param {Function|null} initFilter Initial filter function on objects.
 *        By default all objects from srvData.currentItems[type] are taken in list.
 *        This function take the object in argument and returns true to keep object in list or false to reject it.
 * @param {Function|null} initSelector Initial selecter function on objects.
 *        By default all objects are deselected.
 *        This function take the object in argument and returns true to select it or false to deselect it.
 * @param {boolean} multiple Can we select many objects or only one ?
 * @param {Array} suggestedMenus Array of objects to suggest (each menu has following attributes : icon, name, filterFct)
 *        The function filterFct in each suggestedMenu take object in argument and returns true to suggest it.
 * @param {Function|null} createFct Function to call if user wants to create a new object of this type. This function must return a promise which gives the new object in resolve arguments.
 * @param objectFilter : ex:email for contact
 */
function ctrlSelectObjectsDialog($scope, $q, $modalInstance, srvLocale, srvData, srvConfig, type, initFilter, initSelector, multiple, suggestedMenus, createFct, objectFilter) {
    'use strict';

    // Initialisation

    $scope.srvLocale = srvLocale;// Pointer on srvLocale
    $scope.objectType = type;// Type of objects to select/add
    $scope.objectTypeColor = c4p.Model.getTypeColor($scope.objectType);
    $scope.multipleSelection = multiple;// Multiple selection activated
    $scope.createButton = (createFct && ($scope.objectType != 'Document'));
    //$scope.showFilter = '';// String pattern to filter objects to show
    //$scope.forceSearch = true; // Launch search only after user action
    //$scope.suggestedOptions = []; // Suggested lists

    //icon:suggestedMenus[m].icon  become badge classes
    // var badgeClasses = ['badge-success','badge-warning','badge-important','badge-info','badge-inverse'];
    // for (var m = 0; m < suggestedMenus.length; m++) {
    //     var ibadge = m % 5;
    //     $scope.suggestedOptions.push({icon:badgeClasses[ibadge], name:suggestedMenus[m].name, selected: false});
    // }
    //by default : all
    //var suggestedAll = {icon:'', name:'all', selected: true};
    //$scope.suggestedOptions.push(suggestedAll);

    //$scope.selectedIndex = {};
    //$scope.lastSelectedDbid = undefined;// To accelerate unselection if not multiple selection
    // $scope.elements = [];
    // for (var i = 0; i < srvData.currentItems[objectType].length; i++) {
    //     var object = srvData.currentItems[objectType][i];
    //     if (initFilter && !initFilter(object)) continue;
    //     var selection = {selected:(initSelector && initSelector(object))};
    //     for (var s = 0; s < suggestedMenus.length; s++) {
    //         selection[suggestedMenus[s].name] = suggestedMenus[s].filterFct(object);
    //     }
    //     $scope.selectedIndex[object.id.dbid] = selection;
    //     $scope.elements.push({
    //         selected: selection.selected,// needed for listFilter
    //         object: object,
    //         id: object.id.dbid,
    //         showName: srvConfig.getItemName(object)
    //     });
    // }

    $scope.searchObjects = srvData.currentItems[$scope.objectType];
    $scope.searchQuery = '';
    $scope.searchFilter = {};//objectFilter ? {objectFilter: $scope.searchQuery} : $scope.searchQuery;
    $scope.objectFilterField = objectFilter;


    // Functions

    $scope.changeSearchFilter = function(val) {
        $scope.searchFilter = {};
        $scope.searchQuery = val;

        if ($scope.objectFilterField)
          $scope.searchFilter[$scope.objectFilterField] = $scope.searchQuery;
        else
          $scope.searchFilter = {};
    };

    // Init
    $scope.changeSearchFilter('');

    $scope.getObjectTypeColor = function() {
        return c4p.Model.getTypeColor($scope.objectType);
    };

    // deprecated ?
    $scope.validateDialog = function () {
        var result = [];
        for (var i = 0; i < $scope.elements.length; i++) {
            var item = $scope.elements[i];
            if (item.selected) {
                result.push(item.object);
                if (!multiple) break;
            }
        }
        $modalInstance.close(result);
    };

    // deprecated ?
    $scope.createObject = function (uidChoosen) {
        var deferred = $q.defer();

        a4p.safeApply($scope, function() {
            createFct(uidChoosen).then(function(newObject) {
                a4p.safeApply($scope, function() {

                    var bok = false;
                    // complete object creation and insert it into data service
                    if (a4p.isDefined(newObject)) {
                        bok = srvData.addAndSaveObject(newObject);
                    }

                    // //new object is selected (to appear even after filtering suggestions)
                    // if (!multiple && a4p.isDefined($scope.lastSelectedDbid)) {
                    //     $scope.toggleItem($scope.lastSelectedDbid);// we must call updateElements()
                    // }
                    // var selection = {selected:true};
                    // for (var s = 0; s < suggestedMenus.length; s++) {
                    //     selection[suggestedMenus[s].name] = suggestedMenus[s].filterFct(newObject);
                    // }
                    // $scope.selectedIndex[newObject.id.dbid] = selection;
                    // $scope.elements.push({
                    //     selected: true,// needed for listFilter
                    //     object: newObject,
                    //     id: newObject.id.dbid,
                    //     showName: srvConfig.getItemName(newObject),
                    //     scrollTo: true //ScrollTo this element
                    // });
                    // $scope.lastSelectedDbid = newObject.id.dbid;

                    deferred.resolve(bok);
                });
            }, function() {
                // no treatment if object creation cancelled
                deferred.resolve(false);
            });
        });

        return deferred.promise;
    };

    // deprecated ?
    $scope.toggleSuggestion = function (index) {
        if (index < 0) return;
        if (index >= $scope.suggestedOptions.length) return;
        $scope.suggestedOptions[index].selected = !$scope.suggestedOptions[index].selected;
        $scope.updateElements();
    };

    // deprecated ?
    $scope.toggleItem = function (dbid) {

        //alert('toggleItem '+dbid);

        if (a4p.isUndefined($scope.selectedIndex[dbid])) return;
        if ($scope.selectedIndex[dbid].selected) {
            $scope.selectedIndex[dbid].selected = false;
            $scope.lastSelectedDbid = undefined;
        } else {
            if (!multiple && a4p.isDefined($scope.lastSelectedDbid)) {
                $scope.selectedIndex[$scope.lastSelectedDbid].selected = false;
            }
            $scope.selectedIndex[dbid].selected = true;
            $scope.lastSelectedDbid = dbid;
        }

        $scope.updateElements();
    };

    // deprecated ?
    $scope.updateElements = function () {
        var noSuggestion = true;
        for (var j = 0; j < suggestedMenus.length; j++) {
            if ($scope.suggestedOptions[j].selected) {
                noSuggestion = false;
                break;
            }
        }
        $scope.elements = [];
        for (var i = 0; i < srvData.currentItems[$scope.objectType].length; i++) {
            var object = srvData.currentItems[$scope.objectType][i];
            if (initFilter && !initFilter(object)) continue;
            // We select ALL items if NO suggestion exists or NO suggestion is selected
            var addObject = (noSuggestion || $scope.selectedIndex[object.id.dbid].selected);
            if (!addObject) {
                for (var s = 0; s < suggestedMenus.length; s++) {
                    if ($scope.suggestedOptions[s].selected && $scope.selectedIndex[object.id.dbid][suggestedMenus[s].name]) {
                        addObject = true;
                        break;
                    }
                }
            }
            if (addObject) {
                $scope.elements.push({
                    selected: $scope.selectedIndex[object.id.dbid].selected,// needed for listFilter
                    object: object,
                    id: object.id.dbid,
                    showName: srvConfig.getItemName(object)
                });
            }
        }
    };


    $scope.close = function () {
        $modalInstance.dismiss();
    };

    $scope.closeWithObject = function (objectChoosen) {
        var result = [];
        result.push(objectChoosen);
        $modalInstance.close(result);
    };

    $scope.closeWithUID = function (uidChoosen) {
        $scope.createObject(uidChoosen).then(function(objectCreated) {
          if (objectCreated) $scope.closeWithObject(objectCreated);
        });
    };
}

angular.module('crtl.modal.selectObjects', []).controller('ctrlSelectObjectsDialog', ctrlSelectObjectsDialog);
