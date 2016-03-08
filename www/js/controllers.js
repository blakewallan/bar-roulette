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

.controller('NearMeCtrl', function($scope, $state, $cordovaGeolocation, $ionicLoading){
  var options = {timeout: 10000, enableHighAccuracy: true};

  $ionicLoading.show({
    template: 'Loading....'
  });

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    console.log(position);

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

      $ionicLoading.hide();
      var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';

      var marker = new google.maps.Marker({
        map: $scope.map,
        icon: image,
        draggable:true,
        animation: google.maps.Animation.DROP,
        position: latLng
      });

      var infoWindow = new google.maps.InfoWindow({
        content: "hi"
      });

      google.maps.event.addListener(marker, 'click', function (event) {
        console.log(event)
        infoWindow.open($scope.map, marker);
      });
    });

  }, function(error){
    console.log("Could not get location");
  });
});





