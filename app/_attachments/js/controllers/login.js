/* global angular:true*/
"use strict";
angular.module("metadata.controllers")
.controller("login", ["$scope", "$rootScope", "$http", "$dialog",
    function($scope, $rootScope, $http, $dialog) {
        $scope.user = {
            name: "",
            password: ""
        };
        $scope.submit = function() {
            alert("1");
        };
        $scope.showError = false;
        $http({
            method: "GET",
            url: "/_session"
        }).
        success(function(data, status, headers, config) {
            if (data.userCtx && data.userCtx.name)
                $rootScope.userName = data.userCtx.name;
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        $scope.logout = function() {
            $http["delete"]("/_session").
            success(function(data, status, headers, config) {
                $rootScope.userName = null;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        };

        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,

            templateUrl: "partials/login.html",
            controller: "TestDialogController"
        };

        $rootScope.login = function() {
            var d = $dialog.dialog(opts);
            d.open();
        };
    }
]);