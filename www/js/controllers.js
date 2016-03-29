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
  }, 3500)
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
        $state.go('app.nearMe');
      }).catch(function(error){
        $ionicPopup.alert({
          title: 'Error',
          template: error
        })
      })
    }
  };
})

.controller('NearMeCtrl', function($scope, $state, $cordovaGeolocation, $ionicPopup, $ionicLoading, $http, Bar, UserCoords){
  var options = {timeout: 10000, enableHighAccuracy: true};

  $ionicLoading.show({
    template: '<ion-spinner class="spinner-assertive"></ion-spinner>'
  });

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var distanceOption = 3200;

    $scope.updateDistance = function(distanceSelect){
      distanceOption = Math.floor(parseInt(distanceSelect) * 1609.34);
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

    var center = $scope.map.getCenter();
    var barLat = center.lat();
    var barLng = center.lng();
    var userLat = position.coords.latitude;
    var userLng = position.coords.longitude;

    google.maps.event.addListener($scope.map, 'center_changed', function() {
      var center = $scope.map.getCenter();
      barLat = center.lat();
      barLng = center.lng();
    });

    $scope.findBar = function(){
      Bar.setBar(barLat, barLng, distanceOption, function(){
        UserCoords.setCoords({lat: userLat, lng: userLng});
        $state.go('app.gettingThere.info');
      });
    };

    $ionicLoading.hide();

  }, function(error){
    $ionicLoading.hide();

    var confirmPopup = $ionicPopup.confirm({
        title: 'Sorry! ' + error,
        template: 'Click Okay to reload, or cancel to return home'
      });
      confirmPopup.then(function(res) {
        if(res) {
          $state.go('app.nearMe', {}, {reload: true});
        }
        else {
          //TODO: need to make a user home page and route there
          $state.go('app.browse', {}, {reload: true});
        }
      });
  });
})

.controller('GettingThereCtrl', function($scope, $state, $ionicLoading, $http, Bar){

  $scope.newBar = function(){
    $state.go('app.nearMe', {}, {reload: true});
  };

  var barInfo = Bar.getBar();
  $scope.barInfo = barInfo;
  if(Object.keys(barInfo).length > 1){
    if(barInfo.theBar.price_level){
      $scope.barPrice = barInfo.theBar.price_level;
    }
    if(barInfo.theBar.rating){
      $scope.barRating = barInfo.theBar.rating;
    }
    else{
      $scope.barRating = 'Not available';
      $scope.barPrice = 'Not available'
    }
  }
  else{
    $scope.barPrice = 'Not available';
    $scope.barRating = 'Not available';
  }
})

.controller('UberCtrl', function($scope, $state, $ionicPopup, $ionicLoading, $http, Bar, UserCoords, Uber){

  $ionicLoading.show({
    template: '<ion-spinner class="spinner-assertive"></ion-spinner>'
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

    if(data !== 'error') {
      $scope.uberXPrice = data.price.prices[0].estimate;
      $scope.uberSUVPrice = data.price.prices[5].estimate;
      $scope.uberXTime = Math.floor(parseInt(data.time.times[0].estimate) * 0.0166667);
      $scope.uberSUVTime = Math.floor(parseInt(data.time.times[4].estimate) * 0.0166667);
    }
    else {
      $ionicPopup.alert({
        title: 'Sorry! Something Went Wrong',
        template: 'Try a different transportation method'
      });
      $state.go('app.gettingThere.info', {}, {reload: true});
    }
  });

  $scope.openUber = function(){
    var noAppUrl = 'https://m.uber.com/sign-up?action=setPickup&pickup_latitude='+ userLat +'&pickup_longitude='+ userLng +'&dropoff_latitude='+ barLat +'&dropoff_longitude='+ barLng +'&dropoff_nickname=The Secret Bar&client_id=' + uberId;
    var appUrl = 'uber://?client_id='+ uberId +'&action=setPickup&pickup[latitude]='+ userLat +'&pickup[longitude]='+ userLng +'&dropoff[latitude]='+ barLat +'&dropoff[longitude]='+ barLng +'&dropoff[nickname]=The Secret Bar';

    setTimeout(function () {
      window.open(noAppUrl, '_system')
    }, 100);
    window.open(appUrl, '_system');

    $state.go('onTheWay', {}, {reload: true});

  };
})

.controller('WalkCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $http, Bar, Walk, UserCoords){

  $ionicLoading.show({
    template: '<ion-spinner class="spinner-assertive"></ion-spinner>'
  });

  var barInfo = Bar.getBar();
  var userCoords = UserCoords.getCoords();
  var userLat = userCoords.lat;
  var userLng = userCoords.lng;
  var barLat = barInfo.barLat;
  var barLng = barInfo.barLng;

  $scope.barInfo = Bar.getBar();
  Walk.getWalkData(userLat, userLng, barLat, barLng, function(data){

    $ionicLoading.hide();

    if(data.status !== 'NOT_FOUND') {
      $scope.distance = data.routes[0].legs[0].distance.text;
      $scope.duration = data.routes[0].legs[0].duration.text;
    }
    else {
      $ionicPopup.alert({
        title: 'Sorry! Something Went Wrong',
        template: 'Try a different transportation method'
      });
      $state.go('app.gettingThere.info', {}, {reload: true});
    }
    $scope.openGMaps = function(){
      var appUrl = 'comgooglemaps://?saddr='+ userLat + ',' + userLng +'&daddr='+ barLat + ',' + barLng +'&directionsmode=walking';
      var noAppUrl = 'https://maps.google.com://?saddr='+ userLat + ',' + userLng +'&daddr='+ barLat + ',' + barLng +'&directionsmode=walking';

      setTimeout(function () {
        window.open(noAppUrl, '_system')
      }, 100);
      window.open(appUrl, '_system')
    };
  })
})

.controller('DriveCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $http, Bar, UserCoords, Drive){
  $ionicLoading.show({
    template: '<ion-spinner class="spinner-assertive"></ion-spinner>'
  });

  var barInfo = Bar.getBar();
  var userCoords = UserCoords.getCoords();
  var userLat = userCoords.lat;
  var userLng = userCoords.lng;
  var barLat = barInfo.barLat;
  var barLng = barInfo.barLng;

  $scope.barInfo = Bar.getBar();
  Drive.getDriveData(userLat, userLng, barLat, barLng, function(data){

    $ionicLoading.hide();

    if(data.status !== 'NOT_FOUND') {
      $scope.distance = data.routes[0].legs[0].distance.text;
      $scope.duration = data.routes[0].legs[0].duration.text;
    }
    else {
      $ionicPopup.alert({
        title: 'Sorry! Something Went Wrong',
        template: 'Try a different transportation method'
      });
      $state.go('app.gettingThere.info', {}, {reload: true});
    }
    $scope.openGMaps = function(){
      var appUrl = 'comgooglemaps://?saddr='+ userLat + ',' + userLng +'&daddr='+ barLat + ',' + barLng +'&directionsmode=driving';
      var noAppUrl = 'https://maps.google.com://?saddr='+ userLat + ',' + userLng +'&daddr='+ barLat + ',' + barLng +'&directionsmode=driving';

      setTimeout(function () {
        window.open(noAppUrl, '_system')
      }, 100);
      window.open(appUrl, '_system')
    };

  })
})






