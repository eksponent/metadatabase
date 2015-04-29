"use strict";
/* global console:true*/
/* global angular:true*/
/* Controllers */

angular.module("metadata.controllers")
    .controller("new", ["$scope", "$routeParams", "$rootScope", "$http", "$location", "$templateCache",
        function($scope, $routeParams, $rootScope, $http, $location, $templateCache) {
            $rootScope.frame = true;
            $rootScope.showSchemas = true;
            $scope.showMissing = false;
            $rootScope.isDisabled = false;
            $rootScope.instance = $routeParams.instance;
            var instance = "/" + $routeParams.instance + "/";
            $scope.schema = {id: "848dc353c63f0054ce285e5e0b0537da", key: "Metadata-opslag", value: null};
            $scope.change = function() {
                $http({
                    method: "GET",
                    url: instance + $scope.schema.id
                }).
                success(function(data, status, headers, config) {
                    $scope.result = data;
                    $scope.order = [];

                    var doc = {
                        properties: {},
                        schema: data._id
                    };
                    angular.forEach(data.properties, function(value, key) {
                        $scope.order.push(key);
                        switch (value.type) {
                            case "checkbox":
                                if (value.options) {
                                    doc.properties[key] = {};
                                    angular.forEach(value.options, function(value2, key2) {
                                        doc.properties[key][value2.label] = value2["default"];
                                    });
                                } else
                                    doc.properties[key] = false;
                                break;
                            case "ruler":
                                break;
                            default:
                                doc.properties[key] = '';
                                break;
                        }
                    }, doc);
                    $scope.doc = doc;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
            };
            // Call in order to initialize view.
            $scope.change();

            $scope.gem = function() {
                $scope.spinner = "icon-spinner icon-spin icon-large";
                var doc = $scope.doc;
                angular.forEach(doc.properties, function(value, key) {

                    if (doc.properties[key] === "") {
                        delete doc.properties[key];
                    }
                });
                $http.post(instance + "_design/app/_update/data", doc).
                success(function(data, status) {
                    $templateCache.put("queryTerm", "");
                    $templateCache.put("showAll", false);
                    $location.path(instance + "home");
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                    $scope.showError = true;
                    $scope.spinner = "icon-save icon-large";
                });
            };
            $scope.spinner = "icon-save icon-large";
            $scope.optionsDefined = function(settings) {
                if (settings.options)
                    return true;
                return false;
            };
            $scope.required = function(form) {
                if (form) {
                    if (typeof form.$error.required === "object") {
                        for (var i = 0; i < form.$error.required.length; i++) {
                            return form.$error.required[i].$error.required;
                        }
                    }
                } else {
                    if ($scope.my_form && typeof $scope.my_form.$error.required === "object") {
                        for (var i = 0; i < $scope.my_form.$error.required.length; i++) {
                            if (typeof $scope.my_form.$error.required[i].$error.required === "object")
                                return true;
                        }
                    }
                }
                return false;
            };
            $scope.dateRequired = function(form) {
                console.log("Date required triggered in form " + form);
            };
        }
    ]);
