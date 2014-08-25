frequencyMap.controller("MapController", [ '$scope', '$http', '$location', 'leafletData', 'leafletBoundsHelpers', function($scope, $http, $location, leafletData, leafletBoundsHelpers) {

  var directionColors = {
    "Northbound" : "#ffcc04",
    "Southbound" : "#04102a",
    "Eastbound" : "#7d0000",
    "Westbound" : "#042a10"
  };

  function ratioFromInterval (interval) {
    interval = Math.min(interval, 20);
    // reverse it, because we really care about frequency, the
    // complement of interval length
    return 1 - (interval / 20);
  };

  $http({
    method: "GET",
    url: "/frequency-server/routes"
  }).success(function (response) {
    $scope.routes = response;
  });
  
  angular.extend($scope, {
    
    currentRoute: null,
    earliestHour: new Date(0,0,0,7),
    latestHour: new Date(0,0,0,19),
    allDaysOfWeek: [{ id: 0, label: "S" },
                    { id: 1, label: "M" },
                    { id: 2, label: "T" },
                    { id: 3, label: "W" },
                    { id: 4, label: "T" },
                    { id: 5, label: "F" },
                    { id: 6, label: "S" }],
    daysOfWeek: [1,2,3,4,5],
    filterByAvgInterval: true,
    minAvgInterval: 1,
    maxAvgInterval: 12,

    defaults: {
      zoomControlPosition: 'topright'
    },
    
    center: {
      // Chicago, State and Lake
      lat: 41.885967,
      lng: -87.627925,
      zoom: 13
    },

    legend: {
      position: 'bottomright',
      colors: _.values(directionColors),
      labels: _.keys(directionColors)
    },

    tiles: {
      url: 'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png',
      options: {
        attribution: 'Map tiles by <a href= "http://stamen.com">Stamen Design</a>, <a href= "http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20
      }
    },
    
    routeIDAsInt: function (route) {
      return parseInt (route.id);
    },
    
    refresh: function () {
      $scope.geojson = [];
      $http({
        method: "GET",
        url: "/frequency-server/average-intervals",
        params: {
          "earliest-hour": $scope.earliestHour.getHours(),
          "latest-hour": $scope.latestHour.getHours(),
          "route": $scope.currentRoute,
          "dow": $scope.daysOfWeek,
          "maximum-average-interval": $scope.filterByAvgInterval && $scope.maxAvgInterval ? $scope.maxAvgInterval : undefined,
          "minimum-average-interval": $scope.filterByAvgInterval && $scope.minAvgInterval ? $scope.minAvgInterval : undefined
        }
      }).success(function (response) {
        console.log (response.length);
        $scope.geojson = {
          data: response,
          pointToLayer: function(feature, latlng){
            var m = L.circleMarker(latlng, {
              radius: ratioFromInterval(feature.properties.interval) * 12,
              fillColor: directionColors[feature.properties.direction],
              color: '#000',
              weight: 0.5,
              opacity: 1,
              fillOpacity: 0.75
            });
            m.bindPopup(feature.properties.route + ', ' +
                        feature.properties.stop + ' (' +
                        feature.properties.direction + ')' + '<br>' +
                        '<em>Mean Time Between Buses:</em> ' + Math.round(feature.properties.interval * 10) / 10 + ' minutes <br>');
            return m;
          }
        };
      })
      ;
    }
  });

  leafletData.getMap().then(function (map) {
    new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.Google(),
      position: 'topleft',
      zoomLevel: 16,
      showMarker: false
    }).addTo(map);
  });
  
  $scope.$on("centerUrlHash", function(event, centerHash) {
    $location.search({ c: centerHash });
  });
  
//  $scope.refresh();
}]);
