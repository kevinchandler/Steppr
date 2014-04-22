'use strict';

var app = angular.module('stepprUiApp');

  // landing page
  app.controller('LandingCtrl', function($scope, $http) {

    var  now = moment()
    ,   today = now.format("YYYY-MM-DD");
    $scope.today = today;

    // if user on desktop, show #desktopText rather than loginButton
    if(typeof window.orientation === 'undefined'){
      $('#loginButton').hide();
      $('#desktopText').show();
     }

    // returns totalStepsToday, totalSteps, usersToday
    $http({
      url: '/api/v0/stats',
      method: 'POST',
      data : {
        date : today
      }
    })
    .then(function(response) {
      $scope.stats = response.data;
      $http({
        url : '/api/v0/activity',
        method : 'POST',
        data : {
          date : today
        }
      })
      .then(function(userActivityToday) {
        $scope.userActivityToday = userActivityToday.data;  
      })
    })
  })

  app.controller('DashboardCtrl', function ($scope, $route, $http, $location) {
    var  now = moment()
    ,   today = now.format("YYYY-MM-DD");

      // get user from db
      $http({
          url: '/api/v0/users/me',
          method: 'GET',
      })
      .then(function(user) {
        $scope.user = user.data;

        if ( $scope.user.username.length < 1 ) {
          $location.path('/register');
        }

        // then update the user
        $http({
          url: '/api/v0/users/me/update',
          method: 'GET',
        })
        .then(function(response) {
          // $scope.user = user.data;
        })
      })
  })

  app.controller('UserCtrl', function ($scope, $http, $route, $location) {
    var username = $route.current.params.username;
      $http({
          url: '/api/v0/users/'+username,
          method: 'GET',
      })
      .then(function(response) {
        if (response.data === 'null') {
          return $location.path('#/');
        }
        $scope.user = response.data;
        $scope.userStepsToday = response.data.stepsToday;
        $scope.userStepsTotal = response.data.stepsTotal;
        $scope.userGroups = response.data.groups;
        $scope.userBadges = response.data.badges
      })
  })

  app.controller('ChallengeCtrl', function($scope, $http) {
    var  now = moment()
    ,    today = now.format("YYYY-MM-DD");

    $scope.challengeUser = function(challengee) {
      // get the challenger from the session on the server
      if ( !challengee ) {
        console.log('No challengee');
        return new Error;
      }
      $http({
        url : '/api/v0/challenge',
        method : 'POST',
        data : {
          date : today,
          challengee : challengee
        }
      })
      .then(function(response) {
        console.log(response);
      })
    }
  })

  app.controller('RegisterCtrl', function($scope, $http, $location) {
    $scope.register = function() {
      var username = $scope.username
      // ,   email = $scope.email
      ,   state = $scope.state;
      if ( !username || !state ) {
        return $scope.message = "Please ensure all fields are correctly filled out"
      }
      $http({
        url: '/api/v0/users/register',
        method: 'POST',
        data: {
          username : username,
          // email : email,
          state : state
        }
      })
      .then(function(response) {
        window.location = '/#/users/'+$scope.username;
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
      console.log(response.data);
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
        console.log(response.data);
        $scope.numOfMembers = response.data.members.length;
        if ($scope.numOfMembers === 1) {
          $scope.message = "Member";
        }
        else {
          $scope.message = "Members";
        }
      })

    $scope.joinGroup = function() {
      $http({
        url: '/api/v0/groups/join/'+groupName,
        method: 'POST',
      })
      .then(function(response) {
        window.location.reload();
      })
    }

    $scope.leaveGroup = function() {
      $http({
        url: '/api/v0/groups/leave/'+groupName,
        method: 'POST',
      })
      .then(function(response) {
        window.location.reload();
      })
    }
  })

  app.controller('CreateGroupCtrl', function($scope, $http, $location) {
    var  now = moment()
    ,   today = now.format("YYYY-MM-DD");
    $scope.createGroup = function() {
      var groupName = $scope.groupName;
      console.log(groupName);
      $http({
        url: '/api/v0/groups/create/'+groupName,
        method: 'POST',
        data : {
          date : today
        }
      })
      .then(function(response) {
        console.log(response);
        return $location.path('#/groups/'+groupName);
      })
    }
  })
