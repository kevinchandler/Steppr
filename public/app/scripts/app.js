'use strict';

angular.module('stepprUiApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'angularMoment',
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/landing.html',
        controller: 'LandingCtrl'
      })
      .when('/home', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl'
      })


      .when('/users', {
        templateUrl: 'views/users.html',
        controller: 'UsersCtrl'
      })
      .when('/users/:username', {
        templateUrl: 'views/user.html',
        controller: 'UserCtrl'
      })


      .when('/groups', {
        templateUrl: 'views/groups.html',
        controller: 'GroupsCtrl'
      })
      .when('/groups/create', {
        templateUrl: 'views/creategroup.html',
        controller: 'CreateGroupCtrl'
      })
      .when('/groups/:group', {
        templateUrl: 'views/group.html',
        controller: 'GroupCtrl'
      })



      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
