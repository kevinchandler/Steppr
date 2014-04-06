'use strict';

var app = angular.module('stepprUiApp');
    // landing page
    app.controller('LandingCtrl', function($scope, $http) {
      // returns totalStepsToday, totalSteps, usersToday
      $http({
        url: '/api/v0/stats',
        method: 'GET'
      })
      .then(function(response) {
        $scope.stats = response.data;
      })
    })

    app.controller('DashboardCtrl', function ($scope, $route, $http) {
      var username = 'Kevin';
        $http({
            url: '/api/v0/users/'+username,
            method: "GET",
        })
        .then(function(response) {
          $scope.user = response.data;
        })
    })

    app.controller('UserCtrl', function ($scope, $http, $route, $location) {
      var username = $route.current.params.username;
        $http({
            url: '/api/v0/users/'+username,
            method: "GET",
        })
        .then(function(response) {
          if (response.data === 'null') {
            return $location.path('#/');
          }
          $scope.user = response.data;
        })
    })

    app.controller('RegisterCtrl', function($scope, $http, $location) {
      $scope.register = function() {
        var username = $scope.username;
        $http({
          url: '/api/v0/users/register',
          method: 'POST',
          data: {
            username : username
          }
        })
        .then(function(response) {
          return $location.path('#/home');
        })
      }
    })

    // view of all groups
    app.controller('GroupsCtrl', function($scope, $http) {
      // returns totalStepsToday, totalSteps, usersToday
      $http({
        url: '/api/v0/groups',
        method: 'GET'
      })
      .then(function(response) {
        $scope.groups = response.data;
      })
    })

    // view of a single group
    app.controller('GroupCtrl', function($scope, $http, $route) {
      var groupName = $route.current.params.group;
        // returns totalStepsToday, totalSteps, usersToday
        $http({
          url: '/api/v0/groups/'+groupName,
          method: 'GET'
        })
        .then(function(response) {
          $scope.group = response.data;
        })


      $scope.joinGroup = function() {
        $http({
          url: '/api/v0/groups/join/'+groupName,
          method: 'POST',
        })
        .then(function(response) {
          console.log(response);
        })
      }

    })
