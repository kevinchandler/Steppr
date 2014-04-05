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
      $scope.message = 'Steppr, the social pedometer';
    })
    //
    app.controller('DashboardCtrl', function ($scope, $http) {
        $http({
            url: '/api/v0/user',
            method: "GET",}
        })
        .then(function(response) {
        },
        function(response) { // optional
            $scope.user = response.data;
        })
    })

    //
    // app.controller('RegisterCtrl', function ($scope) {
    //   // post to db
    //   $scope.register = function() {
    //       console.log( $scope.email, $scope.username, $scope.zipcode);
    //   }
    // });
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
    })
