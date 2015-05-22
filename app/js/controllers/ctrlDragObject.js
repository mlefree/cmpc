

/**
 * Drag objects controller
 *
 * @param $scope
 */
function ctrlDragObject($scope, $modal, $timeout, srvLocale, srvData, srvNav, srvLink, srvConfig) {
'use strict';

    //$scope.srvNav = srvNav;

    $scope.dragProxy = null;
    $scope.dragElementX = 70;//32;
    $scope.dragElementY = 60;//32;
    $scope.dragProxyOver = false;

    $scope.dragIsActive = false;

    $scope.dragCloseAsidePage = false;
    //$scope.companyName = '';

    $scope.dragItem = {};
    $scope.dragItemIcon = '';
    $scope.dragItemName = '';


    $scope.init = function (item, dragCloseAsidePage) {

        $scope.dragItem = item;
        $scope.dragItemIcon = c4p.Model.getItemIcon(item);
        $scope.dragItemName = srvConfig.getItemName(item);

        $scope.dragCloseAsidePage = dragCloseAsidePage || false;

        // Company name
        //$scope.companyName = '';
        // if ($scope.dragItem && $scope.dragItem.account_id) {
        //     var account = srvData.getObject($scope.dragItem.account_id.dbid);
        //     if (account) {
        //         $scope.companyName = account.company_name;
        //     }
        // }
    };


    function _setCursorToMove(scope, event, element) {


        scope.dragProxy = document.createElement('div');
        if ($scope.dragProxyOver) {
            scope.dragProxy.setAttribute('class', 'popover top in c4p-popover-drop');
        } else {
            scope.dragProxy.setAttribute('class', 'popover top in c4p-popover-drag');
        }

        scope.dragProxy.setAttribute('style', 'display: block; top:' +
                (event.clientY - $scope.dragElementY) + 'px; left:' +
                (event.clientX - $scope.dragElementX) + 'px; ');


        var popArrow = document.createElement('div');
        popArrow.setAttribute('class','arrow');
        var popContent = document.createElement('div');
        popContent.setAttribute('class','popover-content');

        if (!element || typeof element == 'undefined' || !element[0].children[0]) {

            //var popArrow = document.createElement('div').setAttribute('class','arrow');
            // <h3 class="popover-title" style="display: none;"></h3>
            //var popContent = document.createElement('div').setAttribute('class','popover-content');
            //scope.dragProxy.innerHTML = "<div class='arrow'></div>";
            //scope.dragProxy.innerHTML += "<h3 class='popover-title'>"+ $scope.dragItemName +"</h3>";
            popContent.innerHTML += "<div class='popover-content'>";
            popContent.innerHTML += "<c4p-thumb width='30' height='30' ";
            popContent.innerHTML += "  text='"+$scope.dragItemName+"' indic=2 ";
            popContent.innerHTML += "    icon='glyphicon-"+$scope.dragItemIcon+" color='red' ";
            popContent.innerHTML += "    url='"+$scope.dragItem.thumb_url+"'> ";
            popContent.innerHTML += "</c4p-thumb>";
            popContent.innerHTML += "</div>";

        }
        else {
            var el = element[0].children[0].cloneNode(true);

            //copy canvas
            var canvasOld = element[0].getElementsByTagName('canvas')[0];
            if (canvasOld) {
                var newCanvas = el.getElementsByTagName('canvas')[0];
                var context = newCanvas.getContext('2d');
                context.drawImage(canvasOld, 0, 0);
            }

            popContent.appendChild(el);
        }

        scope.dragProxy.appendChild(popArrow);
        scope.dragProxy.appendChild(popContent);

        document.getElementsByTagName('body')[0].appendChild(scope.dragProxy);

        /*
        <button popover-placement="top" popover="On the Top!" class="btn btn-default">Top</button>


        <div class="popover top in" style="display: block; top: 180; left: 278px;">
            <div class="arrow"></div>
            <h3 class="popover-title" style="display: none;"></h3>
            <div class="popover-content">Vivamus sagittis lacus vel augue laoreet rutrum faucibus.</div>
        </div> */
	}

	function moveCursor(scope, event) {

        scope.dragIsActive = true;
        scope.dragProxy.setAttribute('style', 'display: block; top:' +
                (event.clientY - $scope.dragElementY) + 'px; left:' +
                (event.clientX - $scope.dragElementX) + 'px; ');
	}

  function cancelMoveCursor(scope) {
        if (scope.dragProxy && scope.dragProxy.parentNode) scope.dragProxy.parentNode.removeChild(scope.dragProxy);
        scope.dragProxy = null;
        scope.dragIsActive = false;
  }

    $scope.holdStart = function (event,element) {
        //console.log('holdStart');
        if (!$scope.dragProxy) {
            //a4p.safeApply($scope, function() {
                srvNav.holdStartItem($scope.dragItem);
            //});
                // Render a fluid dragStart
                _setCursorToMove($scope, event, element);
        }
    };

    $scope.holdStop = function () {
        //console.log('holdStop');
        //a4p.safeApply($scope, function() {
            srvNav.holdStopItem();
        //});

        if ($scope.dragProxy) {
            // Render a fluid dragStart
            //$timeout(function() {
            setTimeout(function() {
                if (!$scope.dragIsActive) {
                    //a4p.safeApply($scope, function() {
                        cancelMoveCursor($scope);
                    //});
                }
            }, 1000);
        }
  };

  $scope.dragOverEnter = function (event) {
      $scope.dragProxyOver = true;
  };
  $scope.dragOverLeave = function (event) {
      $scope.dragProxyOver = false;
  };
  $scope.dragStart = function (event,element) {
        //console.log('dragStart');
      //$scope.dragElementX = event.elementX;
      //$scope.dragElementY = event.elementY;
        // IMPORTANT : USER MUST SET event.dataTransfer UPON sense-dragstart EVENT
        if ($scope.dragItem) event.dataTransfer = $scope.dragItem;
        //a4p.safeApply($scope, function() {
            if (!$scope.dragProxy) _setCursorToMove($scope, event, element);
        //});
  };
  $scope.dragMove = function (event) {
      if ($scope.dragProxy) {
        if (!$scope.dragIsActive) {a4p.safeApply($scope, function() {$scope.dragIsActive = true;});}

        moveCursor($scope, event);
      }
  };

  $scope.dragEnd = function (event) {
        if ($scope.dragProxy) {
            //a4p.safeApply($scope, function() {
                cancelMoveCursor($scope);
            //});
        }
        a4p.safeApply($scope, function() {
          $scope.dragIsActive = false;
        });
  };

	$scope.dragCancel = function (event) {
        if ($scope.dragProxy) {
            //a4p.safeApply($scope, function() {
                cancelMoveCursor($scope);
            //});
        }
        a4p.safeApply($scope, function() {
          $scope.dragIsActive = false;
        });
	};
}

angular.module('crtl.dragObject', []).controller('ctrlDragObject', ctrlDragObject);
//ctrlDragObject.$inject = ['$scope', '$modal', '$timeout', 'srvLocale', 'srvData', 'srvNav', 'srvLink', 'srvConfig'];
