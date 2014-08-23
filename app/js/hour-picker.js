angular.module('hourPicker', [])
  .directive('hourPicker', function() {
    return {
      restrict: 'E',
      link : function (scope) {
        scope.init = function () {
          scope.hour12 = scope.hour > 12 ? scope.hour % 12 : scope.hour;
          scope.meridian = scope.hour < 12 ? 'AM' : 'PM';
        };

        scope.setHour = function () {
          if (scope.hour12) {
            scope.hour = scope.meridian == 'AM' ? scope.hour12 : scope.hour12 + 12;
          }
        };
        
        scope.toggleMeridian = function () {
          scope.hour = scope.hour < 12 ? scope.hour + 12 : scope.hour - 12;
          scope.init();
        };

        scope.init();
      },
      scope: {
        hour: '='
      },
      templateUrl: 'hour-picker.html.partial'
    };
  });
