
// Declare app level module which depends on filters, and services
angular.module('c4p.config', [])

.constant('appName', 'Cleanator MayBib')
.constant('appVersion', '15.05.12')
.constant('WS_URL_LOCAL',   'http://localhost:9000')
.constant('WS_URL_ONLINE',  'https://burning-inferno-1562.firebaseio.com')

//this.db.sync('https://apps4pro.iriscouch.com/cltor',{ //todo
//https://apps4pro.iriscouch.com/_utils/database.html?cltor

// Google Analytics UDID ie srvAnalytics
.constant('GA_ID', 'UA-33541085-XXXXX')

.config(function($routeProvider, $logProvider, $locationProvider, $httpProvider) {
  'use strict';
  //$routeProvider.otherwise({redirectTo: '/user'});

  //$logProvider.debugEnabled(true);
  //$httpProvider.responseInterceptors.push('httpInterceptor');

  //$routeProvider
  //    .when('/', { templateUrl: 'views/dashboard.html', controller: 'dashboard' })
  //    .when('/login', { templateUrl: 'views/auth.html', controller: 'auth' });
  //    .otherwise({ redirectTo: '/' });
  //$routeProvider
  //.otherwise({ redirectTo: '/' });

  //$locationProvider.html5Mode(true);
  //$locationProvider.html5Mode({
  //  enabled: true,
  //  requireBase: false
  //});
})

.run(function($route, gettextCatalog){
    gettextCatalog.currentLanguage = 'en';
    gettextCatalog.debug = true;

    //ie https://github.com/angular/angular.js/issues/1213
    $route.reload();
});

  // double check that the app has been configured before running it and blowing up space and time
  // .run(['WS_URL', '$timeout', '$document', function(WS_URL, $timeout, $document) {
  //   if( WS_URL.match('//INSTANCE.firebaseio.com') ) {
  //     angular.element($document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
  //     $timeout(function() {
  //       angular.element($document.body).removeClass('hide');
  //     }, 250);
  //   }
  // }])



  //
  // .config(function($translateProvider) {
  //
  //   //$translateProvider.useLocalStorage();
  //   //$translateProvider.useStaticFilesLoader({
  //   //  prefix: '/languages/',
  //   //  suffix: '.json'
  //   //});
  //
  //    $translateProvider.translations('en', {
  //     HEADLINE: 'Hello there, This is my awesome app!',
  //     INTRO_TEXT: 'And it has i18n support!',
  //     BUTTON_TEXT_EN: 'english',
  //     BUTTON_TEXT_DE: 'german'
  //   })
  //   .translations('de', {
  //     HEADLINE: 'Hey, das ist meine großartige App!',
  //     INTRO_TEXT: 'Und sie untersützt mehrere Sprachen!',
  //     BUTTON_TEXT_EN: 'englisch',
  //     BUTTON_TEXT_DE: 'deutsch'
  //   });
  //   $translateProvider.preferredLanguage('en');
  // })


  /** samples


  // decorator on $log service
  .config(['$provide', function ($provide) {
      $provide.decorator('$log', ['$delegate', function ($delegate) {
          // Keep track of the original debug method, we'll need it later.
          var origDebug = $delegate.debug;

          //Intercept the call to $log.debug() so we can add on
          //our enhancement. We're going to add on a date and
          //time stamp to the message that will be logged.
          $delegate.debug = function () {
              var args = [].slice.call(arguments);
              args[0] = [new Date().toString(), ': ', args[0]].join('');

              // Send on our enhanced message to the original debug method.
              origDebug.apply(null, args)
          };

          return $delegate;
      }]);
  }])


  */
