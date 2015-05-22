
function ctrlEditFocus($scope, $window) {
    'use strict';

    // CONSTANTS DECLARATION

    // prevent iOS keyboard focus/blur on input with ng-focus / ng-blur
    $scope.isEditFocused = false; // an input of from has focus
    $scope.initCtrlEditFocusDone = false;


    // METHODS

    $scope.setEditFocusState = function(state) {
        if ($scope.isEditFocused == state) return;

        $scope.isEditFocused = (state === true);

        // prevent ios bug (keyboard) fixed pb
        // cf. http://stackoverflow.com/questions/7970389/ios-5-fixed-positioning-and-virtual-keyboard
        //if (!$scope.isEditFocused) {

            //if ($window && $window.scrollX) $window.scrollX = 0;
            //else $(window).scrollTop(0);
            //console.log('scrollTop');
        //}
    };

    var keyboardUp = function(event){
        console.log('iOS keyboard keyboardUp');
        //if (event) event.stopPropagation();

        // if (Keyboard && Keyboard.disableScrollingInShrinkView) {
        //   console.log('iOS keyboard disableScrollingInShrinkView');
        //   Keyboard.disableScrollingInShrinkView(true);
        // }
        // if (Keyboard &&Keyboard.shrinkView) {
        //   console.log('iOS keyboard shrinkView');
        //   Keyboard.shrinkView(true);
        // }
        //if (Keyboard && Keyboard.disableScroll) {
        //  console.log('iOS keyboard disableScroll');
        //  Keyboard.disableScroll(true);
        //}
        a4p.safeApply($scope, function() {
                //$scope.isEditFocused = true;
                $scope.setEditFocusState(true);
        });
        //alert('keyboardUp');
    };
    var keyboardDown = function(event){
        console.log('iOS keyboard keyboardDown');
        //if (event) event.stopPropagation();
        a4p.safeApply($scope, function() {
                //$scope.isEditFocused = false;
                $scope.setEditFocusState(false);
        });
        //$scope.responsiveRefreshViewport();
                //launch ERROR
                //document.getElementById("viewportFAKE").setAttribute("content","...");
        if ($window && $window.scrollX) $window.scrollX = 0;
        else $(window).scrollTop(0);
    };

    $scope.$on('$destroy', function (event) {

      var el = window;
      if(el && el.removeEventListener) {
          console.log('ctrlEditFocus destroy');
          //el.removeEventListener('native.keyboardshow', keyboardUp, false);
          //el.removeEventListener('native.keyboardhide', keyboardDown, false);
          el.removeEventListener('native.showkeyboard', keyboardUp, false);
          el.removeEventListener('native.hidekeyboard', keyboardDown, false);

      }
    });

    //-----------------------------------
    // Initialization
    //-----------------------------------
    $scope.initEditFocus = function() {

        if ($scope.initCtrlEditFocusDone === true) return;

        //var el = document.body;//getElementById(id);
        var el = window;

        var Keyboard = null;
        if (typeof cordova != 'undefined' && cordova && cordova.plugins && cordova.plugins.Keyboard) Keyboard = cordova.plugins.Keyboard;

        if(el && el.addEventListener && Keyboard) {
            console.log('iOS Keyboard here');
            // keyboardWillShow / keyboardWillHide / keyboardDidShow / keyboardDidHide
            //el.addEventListener('keyboardWillShow', keyboardUp, false);
            //el.addEventListener('keyboardDidHide', keyboardDown, false);
            el.addEventListener('native.showkeyboard', keyboardUp, false);
            el.addEventListener('native.hidekeyboard', keyboardDown, false);

            if (Keyboard && Keyboard.disableScrollingInShrinkView) {
              console.log('iOS keyboard disableScrollingInShrinkView');
              Keyboard.disableScrollingInShrinkView(true);
            }
            if (Keyboard && Keyboard.shrinkView) {
              console.log('iOS keyboard shrinkView');
              Keyboard.shrinkView(false);
            }
            if (Keyboard && Keyboard.disableScroll) {
              console.log('iOS keyboard disableScroll');
              Keyboard.disableScroll(true);
            }
            //Keyboard.onshowing = keyboardUp;
            //Keyboard.onhiding = keyboardDown;
            //$("a").on({ 'touchstart' : function(){
                            //if (cordova.plugins.Keyboard.close) cordova.plugins.Keyboard.close(); console.log("jquery close");
            //              }
            //            });

        }

        //$scope.$on('$destroy', function iVeBeenDismissed() {
          // say goodbye to your controller here
          // release resources, cancel request...
        //});

        $scope.initCtrlEditFocusDone = true;
    };

    $scope.focusPreventKeyboardOnClick = function(){
      if (typeof cordova != 'undefined' && cordova && cordova.plugins && cordova.plugins.Keyboard && cordova.plugins.Keyboard.close) {
        console.log('iOS keyboard focusPreventKeyboardOnClick');
        //cordova.plugins.Keyboard.close();

        //document.getElementById("viewportFAKE").setAttribute("content","...");
      }
    };

    $scope.initEditFocus();
}

angular.module('crtl.editFocus', []).controller('ctrlEditFocus', ctrlEditFocus);
//ctrlEditFocus.$inject = ['$scope', '$window'];
