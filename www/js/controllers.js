angular.module('barRoulette.controllers', [])

.controller('AppCtrl', function($scope, $ionicPopup, $state, $ionicHistory) {
  var fb = new Firebase('bar-roulette.firebaseIO.com');

  $scope.logout = function(){

    $ionicHistory.clearHistory();

    var confirmPopup = $ionicPopup.confirm({
      title: 'Log Out?',
      template: 'Are you sure you want to log out?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        fb.unauth();
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache().then(function(){
          $state.go('login');
        });
      }
      else {
        console.log('You are not sure');
      }
    });
  }

})

.controller('CheckAuthCtrl', function($scope, $state, $ionicLoading, $timeout, $ionicHistory){
  var fb = new Firebase('bar-roulette.firebaseIO.com');
  var isLoggedIn = fb.getAuth();

  $ionicHistory.nextViewOptions({
    disableBack: true
  });

  $ionicLoading.show({
    templateUrl: 'templates/loading.html'
  });
  $timeout(function(){
    $ionicLoading.hide();
    if(isLoggedIn){
      $state.go('app.nearMe', {}, {location: "replace", reload: true})
    }
    else{
      $state.go('login');
    }
  }, 3000)
})


.controller('AuthCtrl', function($scope, $ionicPopup, $state, $firebaseAuth) {

  fb = new Firebase('bar-roulette.firebaseIO.com');

  $scope.login = function(email, password) {
    var fbAuth = $firebaseAuth(fb);

    fbAuth.$authWithPassword({
      email : email,
      password: password
    }).then(function(authData){
      console.log(authData);
      $state.go('app.nearMe');
    }).catch(function(error){
      $ionicPopup.alert({
        title: 'Login Failed!',
        template: error
      })
    })
  };

  $scope.register = function(email, password, password2){
    var fbAuth = $firebaseAuth(fb);

    if(password !== password2){
      $ionicPopup.alert({
        title: 'Registration Failed',
        template: 'Passwords do not match'
      })
    }
    else {
      fbAuth.$createUser({
        email: email,
        password: password
      }).then(function(){
        return fbAuth.$authWithPassword({
          email: email,
          password: password
        });
      }).then(function(authData){
        $state.go('app.browse');
      }).catch(function(error){
        $ionicPopup.alert({
          title: 'Error',
          template: error
        })
      })
    }
  };
})

.controller('NearMeCtrl', function($scope, $state, $cordovaGeolocation, $ionicLoading, $http, Bar, UserCoords){
  var options = {timeout: 10000, enableHighAccuracy: true};

  $ionicLoading.show({
    template: 'Loading....'
  });

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var distanceOption = 3200;

    $scope.updateDistance = function(distanceSelect) {
      $scope.miles = distanceSelect;
      $scope.distanceOption = Math.floor(parseInt(distanceSelect) * 1609.34);
    };

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var mapOptions = {
      center: latLng,
      zoom: 15,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var locationMarker = new google.maps.Marker({
      map: $scope.map,
      draggable: false,
      animation: google.maps.Animation.DROP,
      position: latLng,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6
      }
    });

    google.maps.event.addListener($scope.map, 'center_changed', function() {
      var center = $scope.map.getCenter();

      var barLat = center.lat();
      var barLng = center.lng();
      var userLat = position.coords.latitude;
      var userLng = position.coords.longitude;

      $scope.findBar = function(){
        Bar.setBar(barLat, barLng, distanceOption, function(){
          UserCoords.setCoords({lat: userLat, lng: userLng});
          $state.go('app.gettingThere.info');
        });
      }
    });

    $ionicLoading.hide();

  }, function(error){
    console.log("Could not get location");
  });
})

.controller('GettingThereCtrl', function($scope, $state, $ionicLoading, $http, Bar){

  $scope.barInfo = Bar.getBar();

})

.controller('UberCtrl', function($scope, $state, $ionicLoading, $http, Bar, UserCoords, Uber){

  $ionicLoading.show({
    template: 'Loading....'
  });

  var barInfo = Bar.getBar();
  var userCoords = UserCoords.getCoords();
  var userLat = userCoords.lat;
  var userLng = userCoords.lng;
  var barLat = barInfo.barLat;
  var barLng = barInfo.barLng;
  var uberId = 'rBA_azhU7byTRXyl_Xt9hoK1z9aTfydC';

  Uber.getUberData(userLat, userLng, barLat, barLng, function(data){
    $ionicLoading.hide();

    $scope.uberXPrice = data.price.prices[0].estimate;
    $scope.uberSUVPrice = data.price.prices[5].estimate;
    $scope.uberXTime = Math.floor(parseInt(data.time.times[0].estimate) * 0.0166667);
    $scope.uberSUVTime = Math.floor(parseInt(data.time.times[4].estimate) * 0.0166667);
  });

  $scope.openUber = function(){
    var noAppUrl = 'https://m.uber.com/sign-up?action=setPickup&pickup_latitude='+ userLat +'&pickup_longitude='+ userLng +'&dropoff_latitude='+ barLat +'&dropoff_longitude='+ barLng +'&dropoff_nickname=The Secret Bar&client_id=' + uberId;
    var appUrl = 'uber://?client_id='+ uberId +'&action=setPickup&pickup[latitude]='+ userLat +'&pickup[longitude]='+ userLng +'&dropoff[latitude]='+ barLat +'&dropoff[longitude]='+ barLng +'&dropoff[nickname]=The Secret Bar';

    setTimeout(function () {
      window.open(noAppUrl, '_system')
    }, 500);
    window.open(appUrl, '_system')
  };
})

.controller('WalkCtrl', function($scope, $state, $ionicLoading, $http, Bar){
  $scope.barInfo = Bar.getBar();
})

.controller('DriveCtrl', function($scope, $state, $ionicLoading, $http, Bar, UserCoords){


})






