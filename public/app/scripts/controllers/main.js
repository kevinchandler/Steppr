'use strict';

var app = angular.module('stepprUiApp');
    app.controller('MainCtrl', function() {

    })
    app.controller('RegisterCtrl', function ($scope) {
      // post to db
      $scope.register = function() {
          console.log( $scope.email, $scope.username, $scope.zipcode);
      }
    });
