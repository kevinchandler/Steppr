'use strict';

var app = angular.module('stepprUiApp');

    app.controller('MainCtrl', function() {

    })

    app.controller('HomeCtrl', function ($scope, $http) {
        $http({
            url: 'http://step.ngrok.com/home',
            method: "GET",}
        })
        .then(function(response) {
        },
        function(response) { // optional
            $scope.package = response
        })
    })
    app.controller('RegisterCtrl', function ($scope) {
      // post to db
      $scope.register = function() {
          console.log( $scope.email, $scope.username, $scope.zipcode);
      }
    });
