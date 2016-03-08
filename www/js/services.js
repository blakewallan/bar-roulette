angular.module('barRoulette.services', [])

  .factory('Coords', function(){
    var coords = {};

    function setCoords(data){
      coords = data;
    }

    function getCoords(){
      return coords
    }
    return {setCoords: setCoords, getCoords: getCoords}
  })

  .factory('Bar', function($http){
    function setBar(lat, lng, callback){

    }
    return {setBar: setBar}
  })


  .factory('Data', function($http){

    function thing(lat, lng, callback){
      var mapsKey = 'AIzaSyD5A9_4eATEtC3a0L6QLIwU97SKp2T9jV8';
      var uberKey = 'rrbj2kEDJN7cbRojTjG7rjzyeXmio_u1V_on544L';

      $http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+ lat +','+ lng +'&radius=5000&types=bar&opennow&key='+ mapsKey)
        .success(function(data){
          var rand = Math.floor((Math.random() * data.results.length));
          var theBar = data.results[rand];
          var barLat = theBar.geometry.location.lat;
          var barLng = theBar.geometry.location.lng;
          $http.get('https://api.uber.com/v1/estimates/price?start_latitude='+ lat +'&start_longitude='+ lng +'&end_latitude='+ barLat +'&end_longitude='+ barLng +'&server_token=' + uberKey)
            .success(function(data){
              var uberData = data.prices[0];
              $http.get('https://maps.googleapis.com/maps/api/directions/json?origin='+ lat + ','+ lng +'&destination='+ barLat +','+ barLng +'&mode=walking&key='+ mapsKey)
                .success(function(data){
                  console.log(data)
                  callback({theBar: theBar, uberData: uberData})
                })
                .error(function(error){
                  console.log(error);
                })
            })
            .error(function(error){
              console.log(error);
            })

        })
        .error(function(error){
          console.log('Error: ' + error)
        })
    }

    return {setCoords: setCoords, getCoords: getCoords, thing: thing}


  })
