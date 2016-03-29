angular.module('barRoulette.services', [])

  .factory('UserCoords', function(){
    var userCoords = {}

    function setCoords(coords){
      userCoords = coords
    }

    function getCoords(){
      return userCoords
    }

    return {setCoords: setCoords, getCoords: getCoords}

  })

  .factory('Bar', function($http, $state, $ionicPopup){
    var theBar = {};

    function setBar(lat, lng, distanceOption, callback){
      var mapsKey = 'AIzaSyD5A9_4eATEtC3a0L6QLIwU97SKp2T9jV8';

      $http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+ lat +','+ lng +'&radius='+ distanceOption +'&types=bar&opennow&hasNextPage=true&nextPage()&key='+ mapsKey)
        .success(function(data){
          console.log(data)
          if (data.status === 'OK') {
            var rand = Math.floor((Math.random() * data.results.length));
            theBar = data.results[rand];
            console.log(theBar);
            var barLat = theBar.geometry.location.lat;
            var barLng = theBar.geometry.location.lng;
            callback(theBar = {theBar: theBar, barLat: barLat, barLng: barLng});
          }
          else {
            $ionicPopup.alert({
              title: 'No Open Bars Found',
              template: 'Try expanding your search location'
            });
            $state.go('app.nearMe', {}, {reload: true});
          }
        })
        .error(function(error){
          $ionicPopup.alert({
            title: 'Sorry! Something Went Wrong',
            template: 'Try expanding your search location or search by neighborhood'
          });
          $state.go('app.nearMe', {}, {reload: true});
        })
    }

    function getBar(){
      return theBar
    }

    return {setBar: setBar, getBar: getBar}
  })


  .factory('Uber', function($http){

    function getUberData(lat, lng, barLat, barLng, callback){
      var uberKey = 'rrbj2kEDJN7cbRojTjG7rjzyeXmio_u1V_on544L';

      $http.get('https://api.uber.com/v1/estimates/price?start_latitude='+ lat +'&start_longitude='+ lng +'&end_latitude='+ barLat +'&end_longitude='+ barLng +'&server_token=' + uberKey)

        .success(function(data){
          //callback(data)
          var price = data;
          $http.get('https://api.uber.com/v1/estimates/time?start_latitude='+ lat +'&start_longitude='+ lng +'&end_latitude='+ barLat +'&end_longitude='+ barLng +'&server_token=' + uberKey)

            .success(function(data){
              callback({time: data, price: price})
            })
            .error(function(error){
              callback('error');
            })
        })
        .error(function(error){
          callback('error');
        })
    }

    return { getUberData: getUberData}

  })

  .factory('Walk', function($http){

    function getWalkData(lat, lng, barLat, barLng, callback){
      var mapsKey = 'AIzaSyD5A9_4eATEtC3a0L6QLIwU97SKp2T9jV8';

      $http.get('https://maps.googleapis.com/maps/api/directions/json?origin='+ lat + ','+ lng +'&destination='+ barLat +','+ barLng +'&mode=walking&key='+ mapsKey)
        .success(function(data){
          callback(data)
        })
        .error(function(error){
          console.log(error);
        })
    }
    return {getWalkData: getWalkData}

  })

  .factory('Drive', function($http){

    function getDriveData(lat, lng, barLat, barLng, callback){
      var mapsKey = 'AIzaSyD5A9_4eATEtC3a0L6QLIwU97SKp2T9jV8';

      $http.get('https://maps.googleapis.com/maps/api/directions/json?origin='+ lat + ','+ lng +'&destination='+ barLat +','+ barLng +'&mode=driving&key='+ mapsKey)
        .success(function(data){
          callback(data)
        })
        .error(function(error){
          console.log(error);
        })
    }
    return {getDriveData: getDriveData}

  })

  .factory('Track', function($http){

  })



