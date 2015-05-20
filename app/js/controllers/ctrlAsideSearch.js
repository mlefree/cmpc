

/**
 * Aside objects controller
 *
 * @param $scope
 */
function ctrlAsideSearch($scope, $timeout, srvFacet, srvLocale, srvData, srvNav, version) {
    'use strict';

    $scope.asideSearchSpinner = true;
    $scope.asideActiveSearch = false;

    $scope.afterAsideSpinnerShow = function() {
        a4p.InternalLog.log('ctrlAsideSearch','afterAsideSpinnerShow');
        $timeout(function() {
                $scope.computeList();
        },200);
    };

    $scope.afterAsideSpinnerHide = function() {
        a4p.InternalLog.log('ctrlAsideSearch','afterAsideSpinnerHide');
    };

    $scope.computeList = function() {

        a4p.InternalLog.log('ctrlAsideSearch','computeList : '+$scope.asideCategoryName);

        if ($scope.asideCategoryName && $scope.asideCategoryName != 'Favorite') {
            //Favorite do have already compute their facets (ie tabFavorites() )
            srvFacet.clear();
            srvFacet.addFacet('objects', srvLocale.translations.htmlTitleType[$scope.asideCategoryName], $scope.asideCategoryName);
        }
        else if ($scope.asideCategoryName && $scope.asideCategoryName == 'Favorite')  {
            srvFacet.clear();
            $scope.tabFavorites();
        }

        // Filter done
        $scope.asideSearchSpinner = false;
    };



    $scope.toggleSearch = function () {
        $scope.asideActiveSearch = !$scope.asideActiveSearch;
    };

    $scope.tabClear = function () {
        var firstFacet = srvFacet.getFirstFacet();
        if ((!firstFacet) && (firstFacet.key != 'top20') && (firstFacet.key != 'mine') && (firstFacet.key != 'favorites')) {
            // Keep First Facet if not Top20/Mine/Favorites
            while (srvFacet.filterFacets.length > 1) {
                srvFacet.removeLastFacet();
            }
        } else {
            srvFacet.clear();
        }
        $scope.removeGlobalSearch();
        //$scope.asideActiveSearch = false;
    };
    $scope.tabTop = function () {
        if (!srvFacet.isFacetActivable('top20')) {
            var firstFacet = srvFacet.getFirstFacet();
            if ((!firstFacet) && (firstFacet.key != 'top20') && (firstFacet.key != 'mine') && (firstFacet.key != 'favorites')) {
                // Keep First Facet if not Top20/Mine/Favorites
                while (srvFacet.filterFacets.length > 1) {
                    srvFacet.removeLastFacet();
                }
            } else {
                srvFacet.clear();
            }
            srvFacet.addFacet('top20');
        } else {
            srvFacet.addFacet('top20');
            srvFacet.setFacet('');
        }
        //$scope.asideActiveSearch = false;
    };
    $scope.tabMine = function () {
        if (!srvFacet.isFacetActivable('mine')) {
            var firstFacet = srvFacet.getFirstFacet();
            if ((!firstFacet) && (firstFacet.key != 'top20') && (firstFacet.key != 'mine') && (firstFacet.key != 'favorites')) {
                // Keep First Facet if not Top20/Mine/Favorites
                while (srvFacet.filterFacets.length > 1) {
                    srvFacet.removeLastFacet();
                }
            } else {
                srvFacet.clear();
            }
            srvFacet.addFacet('mine');
        } else {
            srvFacet.addFacet('mine');
            srvFacet.setFacet('');
        }
      //  $scope.asideActiveSearch = false;
    };


    $scope.addClear = function () {
        var name = srvFacet.getFirstFacetValue();
        srvFacet.clear();
        srvFacet.addFacet('objects', srvLocale.translations.htmlTitleType[name], name);
    };
    $scope.addTop = function () {
        srvFacet.addFacet('top20');
        srvFacet.setFacet('');
    };
    $scope.addMine = function () {
        srvFacet.addFacet('mine');
        srvFacet.setFacet('');
    };
    $scope.addFavorites = function () {
        srvFacet.addFacet('favorites');
        srvFacet.setFacet('');
    };


    $scope.tabFavorites = function () {
        if (!srvFacet.isFacetActivable('favorites')) {
            var firstFacet = srvFacet.getFirstFacet();
            if ((!firstFacet) && (firstFacet.key != 'top20') && (firstFacet.key != 'mine') && (firstFacet.key != 'favorites')) {
                // Keep First Facet if not Top20/Mine/Favorites
                while (srvFacet.filterFacets.length > 1) {
                    srvFacet.removeLastFacet();
                }
            } else {
                srvFacet.clear();
            }
            srvFacet.addFacet('favorites');
        } else {
            srvFacet.addFacet('favorites');
            srvFacet.setFacet('');
        }
        //$scope.asideActiveSearch = false;
    };

    /**
     * Events broadcasted
     */
    $scope.$on('changeAsideSearchResult', function (event, categoryName) {
        a4p.InternalLog.log('ctrlAsideSearch','changeAsideSearchResult : '+categoryName);
        $scope.asideCategoryName = categoryName;
        $scope.asideSearchSpinner = true; // set Spinner
    });

    //
    //function init() {
    //    srvFacet.clear();
    //}
    //init();

}
ctrlAsideSearch.$inject = ['$scope', '$timeout', 'srvFacet', 'srvLocale', 'srvData', 'srvNav', 'version'];
