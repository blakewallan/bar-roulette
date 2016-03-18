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


.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.tabs.position('bottom');

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

    .state('app.gettingThere', {
      url: '/gettingThere',
      abstract: true,
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/gettingThere.html',
          controller: 'GettingThereCtrl'
        }
      }
    })

    .state('app.gettingThere.info', {
      url: '/info',
      views: {
        'info': {
          templateUrl: 'templates/GettingThere/info.html',
          controller: 'GettingThereCtrl'
        }
      }
    })

    .state('app.gettingThere.uber', {
      url: '/uber',
      views: {
        'uber': {
          templateUrl: 'templates/GettingThere/uber.html',
          controller: 'UberCtrl'
        }
      }
    })

    .state('app.gettingThere.walk', {
      url: '/walk',
      views: {
        'walk': {
          templateUrl: 'templates/GettingThere/walk.html',
          controller: 'WalkCtrl'
        }
      }
    })

    .state('app.gettingThere.drive', {
      url: '/drive',
      views: {
        'drive': {
          templateUrl: 'templates/GettingThere/drive.html',
          controller: 'DriveCtrl'
        }
      }
    })

    .state('app.neighborhood', {
      url: '/neighborhood',
      views: {
        'menuContent': {
          templateUrl: 'templates/neighborhood.html'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/checkAuth');
});







