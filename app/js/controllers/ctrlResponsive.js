

//controller of Responsive


function ctrlResponsive($scope, $window, $timeout, srvConfig) {
'use strict';

    // Default size values. They are recalculated during resize

    $scope.respBaseMagnetWidth = 100;   // to check if used
    $scope.respBaseToolbarWidth = 40*2; // left and right menu bars // 40*2  cf 2.9
    $scope.respBasePageWidth  = 240;  // screen width
    $scope.respBasePageHeight = 240;  // screen height


    $scope.respIsComputing = true;
    $scope.respIsReady = false;


    $scope.respMagnetWidth = $scope.respBaseMagnetWidth;
    $scope.respToolbarWidth = $scope.respBaseToolbarWidth;
    $scope.respOnePageFormat = false;
    $scope.respPageHeight = $scope.respBasePageHeight;
    $scope.respPageWidth = $scope.respBasePageWidth;

    $scope.respCentralContainerWidth =  $scope.respPageWidth - (2*$scope.respToolbarWidth);

    $scope.respAsideWidth = Math.round($scope.respCentralContainerWidth * 0.4);// 40% viewscreen
    $scope.respMainWidth = $scope.respCentralContainerWidth - $scope.respAsideWidth;// 60% viewscreen
    $scope.respRelatedWidth = $scope.respAsideWidth;
    $scope.respDetailWidth = $scope.respCentralContainerWidth - $scope.respAsideWidth; //TODO

    $scope.respPanel1X = -$scope.respAsideWidth;
    $scope.respPanel2X = $scope.respPanel1X - $scope.respDetailWidth;

    // Old values to compare
    $scope.respOld_ResizePortrait = 0;
    $scope.respOld_ResizeHeight = 0;
    $scope.respOld_ResizeWidth = 0;

    //---------------------------
    // Computing

    $scope.responsiveHasChanged = function() {
      var bChange = false;


      if (  $scope.respOld_ResizePortrait != a4p.Resize.resizePortrait ||
            $scope.respOld_ResizeHeight != a4p.Resize.resizeHeight ||
            $scope.respOld_ResizeWidth != a4p.Resize.resizeWidth) {

            //memorize
            $scope.respOld_ResizePortrait = a4p.Resize.resizePortrait;
            $scope.respOld_ResizeHeight = a4p.Resize.resizeHeight;
            $scope.respOld_ResizeWidth = a4p.Resize.resizeWidth;

            if ($scope.respOld_ResizeHeight === 0 || $scope.respOld_ResizeWidth === 0) {
              a4p.InternalLog.log('ctrlResponsive','PB on init, set with dom values');
              $scope.respOld_ResizeWidth = document.body.offsetWidth;
              $scope.respOld_ResizeHeight = document.body.offsetHeight;
              $scope.respOld_ResizePortrait = false;
              if($scope.respOld_ResizeWidth < 500 )  $scope.respOld_ResizePortrait = true;
            }
            bChange = true;
      }

      return bChange;
    };

    $scope.responsiveRefreshViewport = function() {
        var viewportValue = "user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height="+Math.round($scope.responsivePageHeight());
        var elVp = document.getElementById("viewport");
        //var viewportValue = "width=480; height=480; initial-scale=0.5";
        if (elVp) elVp.setAttribute("content",viewportValue);
        console.log("responsiveRefreshViewport done "+elVp);
    };

    $scope.responsiveBeforeWindowSizeChanged = function() {
        $scope.responsiveWindowSizeChanged();
    };

    $scope.responsiveWindowSizeChanged = function() {

        if (!$scope.responsiveHasChanged()) return;

        $scope.respIsComputing = true;
        $scope.respIsReady = false;
        console.log('responsiveWindowSizeChanged');
        $scope.responsiveRefreshViewport();

        try {

          var fontSizePx = $window.getComputedStyle(document.body,null).getPropertyValue("font-size");
          fontSizePx = fontSizePx.substr(0, fontSizePx.length-2);

          var fontSizePxHtml = $window.getComputedStyle(document.documentElement,null).getPropertyValue("font-size");
          fontSizePxHtml = fontSizePxHtml.substr(0, fontSizePxHtml.length-2);

          //if (srvConfig.getSizeCss() === '') {
              //srvConfig.setSizeCss(fontSizePxHtml+'px');
              srvConfig.setSizeCss('75%');
          //}

          $scope.respToolbarWidth = Math.ceil(2.9*fontSizePx);//2.9 cf 40*2

          $scope.respOnePageFormat = $scope.respOld_ResizePortrait;
          $scope.respPageHeight = $scope.respOld_ResizeHeight;
          $scope.respPageWidth = $scope.respOld_ResizeWidth;


          if ($scope.respOnePageFormat) {
              //all the same size
              $scope.respMainWidth = $scope.respPageWidth - $scope.respToolbarWidth;
              $scope.respCentralContainerWidth = $scope.respMainWidth;
              $scope.respAsideWidth = $scope.respMainWidth;
              $scope.respRelatedWidth = $scope.respMainWidth;
              $scope.respDetailWidth = $scope.respMainWidth;

              $scope.respMagnetWidth = Math.floor($scope.respCentralContainerWidth/2);

              //if (!$scope.responsiveHas3Pages()) {
                  // 2 pages
                  //$scope.detailWidth = $scope.pageWidth;
                  //$scope.relatedWidth = 0;
              //    $scope.respMainWidth = 0;
              //}
          } else {
              $scope.respCentralContainerWidth = $scope.respPageWidth - 2*$scope.respToolbarWidth;
              // Page1 : asideWidth + mainWidth, Page2 : mainWidth + asideWidth
              $scope.respAsideWidth = Math.round($scope.respCentralContainerWidth * 0.4);// 40% viewscreen
              $scope.respMainWidth = $scope.respCentralContainerWidth - $scope.respAsideWidth;// 60% viewscreen
              // Page1 : asideWidth + detailWidth + toolbarWidth, Page2 : detailWidth + relatedWidth
              $scope.respRelatedWidth = $scope.respAsideWidth;
              $scope.respDetailWidth = $scope.respCentralContainerWidth - $scope.respRelatedWidth;

              //magnet stuff
              $scope.respMagnetWidth = Math.floor($scope.respAsideWidth/2);
          }
          $scope.respPanel1X = -$scope.respAsideWidth;
          $scope.respPanel2X = $scope.respPanel1X - $scope.respDetailWidth;

          //adddlert("Welcome guest!");
        }
        catch(err)
        {
          var txt="There was an error on this page.\n\n";
          txt+="Error description: " + err.message + "\n\n";
          txt+="Click OK to continue.\n\n";
          a4p.ErrorLog.log('ctrlResponsive', 'responsiveWindowSizeChanged error :'+txt);
        }

        $scope.respIsComputing = false;
        console.log('responsiveWindowSizeChanged - end');
        $timeout(function() {
          console.log('responsiveWindowSizeChanged - timeout');
          //a4p.safeApply($scope,function(){
            //console.log('responsiveWindowSizeChanged - apply');
            $scope.respIsReady = true;
            $scope.$broadcast('responsiveWindowSizeChanged');
          //});
        },300);
    };

    //---------------------------
    // Accessors

    $scope.responsiveIsOnePageFormat = function() {return $scope.respOnePageFormat;};
    //$scope.responsiveSumOrMax = function(value1, value2) {return ($scope.responsiveIsOnePageFormat() ? (value1 + value2) : Math.max(value1, value2));};
    //$scope.responsiveMax = function(value1, value2) {return Math.max(value1, value2);};
    $scope.responsiveToolbarWidth = function() { return $scope.respToolbarWidth;};
    $scope.responsiveAsideWidth = function() { return $scope.respAsideWidth;};
    $scope.responsiveMainWidth = function() { return $scope.respMainWidth;};
    $scope.responsiveRelatedWidth = function() { return $scope.respRelatedWidth;};
    $scope.responsiveDetailWidth = function() { return $scope.respDetailWidth;};
    $scope.responsiveCentralContainerWidth = function() { return $scope.respCentralContainerWidth;};


    $scope.responsivePanel1X = function() { return $scope.respPanel1X;};
    $scope.responsivePanel2X = function() { return $scope.respPanel2X;};
    $scope.responsiveMagnetWidth = function() { return $scope.respMagnetWidth;};

    $scope.responsivePageHeight = function() { return $scope.respPageHeight;};
    $scope.responsivePageWidth = function() { return $scope.respPageWidth;};


    //---------------------------
    // Init

    $scope.responsiveWindowSizeChanged();

}


ctrlResponsive.$inject = ['$scope', '$window','$timeout','srvConfig'];
