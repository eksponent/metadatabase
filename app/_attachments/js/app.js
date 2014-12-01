'use strict';


// Declare app level module which depends on filters, and services
angular.module('metadata', ['ui.event', 'metadata.controllers', 'metadata.directives','elasticjs.service','ui.bootstrap','$strap.directives','bootstrap']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/:instance/home', {templateUrl: 'partials/home.html', controller: 'home'});
    $routeProvider.when('/:instance/details/:frame/:id', {templateUrl: 'partials/new.html', controller: 'details'});
	$routeProvider.when('/:instance/new', {templateUrl: 'partials/new.html', controller: 'new'});
    $routeProvider.otherwise({redirectTo: '/metadata_data/home'});
  }]);

