angular.module('barRoulette', ['ionic', 'barRoulette.controllers', 'barRoulette.services', 'firebase', 'ngCordova'])

.run(function($ionicPlatform) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})


.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'AuthCtrl'
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'AuthCtrl'
  })

  .state('checkAuth', {
    url: '/checkAuth',
    controller: 'CheckAuthCtrl'
  })

  .state('app.nearMe', {
    url: '/nearMe',
    views: {
      'menuContent': {
        templateUrl: 'templates/nearMe.html',
        controller: 'NearMeCtrl'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })

    .state('app.gettingThere', {
      url: '/gettingThere',
      views: {
        'menuContent': {
          templateUrl: 'templates/gettingThere.html',
          controller: 'GettingThereCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/checkAuth');
});







