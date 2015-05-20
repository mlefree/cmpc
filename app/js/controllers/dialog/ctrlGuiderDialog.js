

function ctrlGuiderDialog($scope, $sce, srvLocale) {
    'use strict';
    //, srvLocale, screens, height, width, dialog) {

    /*
    $scope.slidesInterval = -1;
    $scope.slidesHeight = height - 30;
    $scope.slidesWidth = width - 40;
    $scope.slides = [];

    $scope.init = function (srvLocale,screens) {
        $scope.srvLocale = srvLocale;

        //TODO screen integration
        $scope.slides = [];

        //[{text:"tessst", img:"./img/guider/calendar_01.png"},
        //                 {text:"tess2<br> avec super testtt", img:"./img/guider/calendar_02.png"}];
        for(var i=0; i<screens.length; i++){
        	var carousel = {};
        	carousel = {img:screens[i].img, text: screens[i].text};
        	$scope.slides.push(carousel);
        }

    };



    $scope.close = function () {
        dialog.close(true);
    };

    $scope.init(srvLocale,screens);
    */


    $scope.guider_interval = -1;//5000;
    $scope.guider_slides = [
        {image:'img/guider/c4p-guider-01.jpg', text:srvLocale.translations.htmlTextGuiderSlide01},
        {image:'img/guider/c4p-guider-02.jpg', text:srvLocale.translations.htmlTextGuiderSlide02},
        {image:'img/guider/c4p-guider-03.jpg', text:srvLocale.translations.htmlTextGuiderSlide03},
        {image:'img/guider/c4p-guider-04.jpg', text:srvLocale.translations.htmlTextGuiderSlide04},
        {image:'', text:''}
    ];


    $scope.to_trusted = function(html_code) {
        return $sce.trustAsHtml(html_code);
    };


    $scope.getIdSlideActive = function() {
      // find which is active
      var slideId = 0;
      for (; slideId < $scope.guider_slides.length; slideId++) {
          if ($scope.guider_slides[slideId] && $scope.guider_slides[slideId].active) break;
      }

      return slideId;
    }

    $scope.next = function() {

      // find which is active
      var slideId = 0;
      var bFound = false;
      for (; slideId < $scope.guider_slides.length && !bFound; slideId++) {
          if ($scope.guider_slides[slideId] && $scope.guider_slides[slideId].active) {
            bFound = true;
            // Set the next
            var nextId = slideId + 1;
            $scope.guider_slides[slideId].active = false;
            if ($scope.guider_slides[nextId]) $scope.guider_slides[nextId].active = true;

          }
      }
    };

    $scope.previous = function() {

      // find which is active
      var slideId = 0;
      var bFound = false;
      for (; slideId < $scope.guider_slides.length && !bFound; slideId++) {
          if ($scope.guider_slides[slideId] && $scope.guider_slides[slideId].active) {
            bFound = true;
            // Set the previous
            var prevId = slideId - 1;
            $scope.guider_slides[slideId].active = false;
            if ($scope.guider_slides[prevId]) $scope.guider_slides[prevId].active = true;

          }
      }
    };

    $scope.first = function() {

      //reset slides
      var slideId = 0;
      var bFound = false;
      for (; slideId < $scope.guider_slides.length; slideId++) {
          $scope.guider_slides[slideId].active = false;
      }

      $scope.guider_slides[0].active = true;
    };
}


ctrlGuiderDialog.$inject = ['$scope','$sce', 'srvLocale'];
