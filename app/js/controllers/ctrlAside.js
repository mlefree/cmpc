

/**
 * Aside pane controller
 *
 * @param $scope
 * @param srvFacet
 * @param srvLocale
 * @param srvData
 * @param srvAnalytics
 * @param srvNav
 * @param version
 */
function ctrlAside($scope,$location,$anchorScroll, $timeout, $q, srvFacet, srvLocale, srvData, srvAnalytics, srvNav, version) {
  'use strict';
  // ----------------------------------------------------
  // Constants
  // ----------------------------------------------------

    $scope.srvFacet = srvFacet;
    $scope.srvLocale = srvLocale;
    $scope.srvNav = srvNav;

    $scope.asideRootMenuUp = true; // ((asideInputs.itemSearchQuery.length == 0) && (srvFacet.filterFacets.length == 0));


    //$scope.asideSearchScroller = null;
    $scope.asideCategoryName = null;

    // Filter
    $scope.asideInputs = {
        itemSearchQuery : ''
    };

    // ----------------------------------------------------
    // Methods
    // ----------------------------------------------------


    $scope.selectItem = function (item, closeAside) {
        //a4p.safeApply(function(){
            a4p.InternalLog.log('ctrlAside','selectItem');
            $scope.asideScrollToItem(item);
            $scope.setItemAndGoDetail(item,closeAside);

            //if ($scope.updateScroller) $scope.updateScroller();
        //});

    };

    $scope.selectItemAndCloseAside = function (item) {
        $scope.setItemAndGoDetail(item,true);
        //$scope.setNavAside(false);
    };

    $scope.removeGlobalSearch = function () {
        $scope.asideInputs.itemSearchQuery = '';
        srvFacet.setFilterQuery($scope.asideInputs.itemSearchQuery);
    };

    $scope.objectCreatable = function(type){
        if(type == 'Note') {
            return a4p.isDefinedAndNotNull(srvData.userObject);
        }
        else if(type == 'Report') {
            return a4p.isDefinedAndNotNull(srvData.userObject);
        }
        else if(type == 'Document') {
            return a4p.isDefinedAndNotNull(srvData.userObject);
        }
        else {
            return (c4p.Model.a4p_types[type] && c4p.Model.a4p_types[type].isAutonomousType);
        }
    };

    $scope.addItemDialog = function(type){
        var parentObject = null;
        //a4p.safeApply($scope, function() {
            if(type == 'Document') {
                // $scope.takePicture(srvData.userObject).then(function (document) {
                //     $scope.selectItemAndCloseAside(document);
                // }, function (diag) {
                // });
                $scope.openDialog(
                    {
                        backdrop: false,
                        windowClass: 'modal c4p-modal-small',
                        controller: 'ctrlDialogCreateDocument',
                        templateUrl: 'views/dialog/dialogCreateDocument.html',
                        resolve: {
                              srvLocale: function () {return srvLocale;}
                        }
                    },function (type) {
                      if (type == 'Picture') {
                        $scope.takePicture(srvData.userObject).then(function (document) {
                              $scope.selectItemAndCloseAside(document);
                            }, function (diag) {});
                      }
                    });
            }
            else if (type == 'Note') {
                $scope.takeNote(srvData.userObject).then(function (document) {
                    $scope.selectItemAndCloseAside(document);
                }, function (diag) {
                });
            }
            else if (type == 'Report') {
                $scope.takeReport(srvData.userObject).then(function (document) {
                    $scope.selectItemAndCloseAside(document);
                }, function (diag) {
                });
            }
            else {
                // Default object attrs
                var itemToCreate = srvData.createObject(type, {});
                $scope.editObjectDialog(itemToCreate,
                    function (result) {
                        if (a4p.isDefined(result)) {
                            //a4p.safeApply($scope, function() {

                                srvData.addObject(result);
                                if(type == 'Note') {
                                    parentObject = srvData.userObject;
                                    srvData.linkToItem(type, 'parent', [result], parentObject);
                                }
                                else if(type == 'Report') {
                                    parentObject = srvData.userObject;
                                    srvData.linkToItem(type, 'parent', [result], parentObject);
                                }
                                srvData.addObjectToSave(result);

                                // Broadcast changing scroller
                                $scope.$broadcast('changeAsideSearchResult', $scope.asideCategoryName);

                                //GA: user really interact with aside, he adds one object
                                srvAnalytics.add('Once', 'Aside - add ' + result.a4p_type);

                                //MLE $scope.selectItemAndCloseAside(result);
                                //$scope.selectItem(result); // scroll to focus
                                $scope.asideScrollToItem(result);
                                //if ($scope.updateScroller) $scope.updateScroller();
                            //});
                        }
                    }
                );
            }
        //});
    };

    // ----------------------------------------------------
    // Related panel
    // ----------------------------------------------------

    // ----------------------------------------------------
    // Aside Scrolling
    // ----------------------------------------------------


    // Used in view_np1_links_item.html
    $scope.bShowAsideGroupSuggestion = true;
    $scope.showAsideGroupSuggestion = function(b){

        $scope.bShowAsideGroupSuggestion = (b === true);
    };
    $scope.showAsideGroup = function (group, value) {
        group.show = value;
        $scope.relatedScrollToGroup(group);
    };

    $scope.isDocumentGroup = function(groupType) {
        return groupType == 'Document';
    };

    $scope.showGallery = function() {
        $scope.openDialog(
            {
                backdrop: false,
                windowClass: 'modal c4p-modal-full c4p-modal-image',
                controller: 'ctrlShowImage',
                templateUrl: 'views/dialog/dialogShowImage.html',
                resolve: {
                    imageData: function () {
                        return srvNav.imageRelatedList;
                    }
                }
            },
            function () {

            });
    };

    $scope.asideScrollToItem = function (item) {
        var sid= 'aside_'+item.id.dbid;
        a4p.InternalLog.log('ctrlAside','asideScrollToItem to '+sid);
         $timeout(function() {
            $location.hash(sid);
            $anchorScroll();
            $location.hash();
        }, 1000);
    };

    $scope.relatedScrollToGroup = function (group) {

        var sid= 'related_'+group.name;
        a4p.InternalLog.log('ctrlAside','relatedScrollToGroup to '+sid);
         $timeout(function() {
            $location.hash(sid);
            $anchorScroll();
            $location.hash();
        }, 1000);
    };

    // ----------------------------------------------------
    // item for root menu
    // ----------------------------------------------------

    $scope.activeItem='';
    $scope.setAsideSearchMenu= function (name) {

        a4p.InternalLog.log('setAsideSearchMenu '+name);
        var deferred = $q.defer();
        var promise = deferred.promise;

        if (!name) {
          deferred.reject({error:'No Aside name'});
          return promise;
        }

        a4p.safeApply($scope,function(){

            //$scope.asideInputs = {
            //    itemSearchQuery : ''
            //};
            $scope.removeGlobalSearch();
            $scope.asideRootMenuUp = false;

            // Broadcast changing slide
            $scope.asideCategoryName = name;

            //srvFacet.clear();
            //srvFacet.addFacet('objects', srvLocale.translations.htmlTitleType[name], name);
            $scope.activeItem = $scope.slideNavigationType[name];
            //$scope.stopSpinner();

            $scope.$broadcast('changeAsideSearchResult', name);

            deferred.resolve();
        });

        $scope.setNavAside(true);

        return promise;
    };

    $scope.setAsideCalendar = function () {
        $scope.asideRootMenuUp = true;
        $scope.gotoSlideWithSearchReset($scope.pageNavigation, $scope.slideNavigationCalendar);
        $scope.activeItem = $scope.slideNavigationCalendar;
        //$scope.stopSpinner();
    };

    $scope.setAsideFavoriteSearchMenu = function () {

        a4p.InternalLog.log('setAsideFavoriteSearchMenu');
        $scope.setAsideSearchMenu('Favorite');
    };

    $scope.setAsideRootMenu = function () {
        $scope.asideRootMenuUp = true;
        $scope.setNavAside(true);
        srvFacet.clear();
    };



}


angular.module('crtl.aside', []).controller('ctrlAside', ctrlAside);
//ctrlAside.$inject = ['$scope', '$location','$anchorScroll', '$timeout', '$q', 'srvFacet', 'srvLocale', 'srvData', 'srvAnalytics', 'srvNav', 'version'];
