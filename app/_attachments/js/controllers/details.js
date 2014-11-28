angular.module('metadata.controllers')
.controller('details', ['$scope', '$routeParams', '$http', '$location', '$rootScope', '$dialog', '$templateCache',
        function($scope, $routeParams, $http, $location, $rootScope, $dialog, $templateCache) {
            $rootScope.showSchemas = false;
            $scope.showMissing = false;
            $rootScope.isDisabled = true;
            $rootScope.frame = $routeParams.frame;
            $rootScope.instance = $routeParams.instance;
            var instance = '/' + $routeParams.instance + '/';
            $http({
                method: 'GET',
                url: instance + $routeParams.id
            }).
            success(function(data, status, headers, config) {
                $http({
                    method: 'GET',
                    url: instance + data.schema,
                    doc: data
                }).
                success(function(data, status, headers, config) {
                    var doc = config.doc;
                    $scope.order = [];
                    angular.forEach(data.properties, function(value, key) {
                        $scope.order.push(key);

                        if (typeof doc.properties[key] === "undefined") {
                            if (value.type === "checkbox") {
                                if (value.options) {
                                    doc.properties[key] = {};
                                } else
                                    doc.properties[key] = false;
                            } else if (value.type !== "ruler") {
                                doc.properties[key] = "";
                            }
                        }
                        if (value.type === 'datetime' && doc.properties[key] !== '') {
                            doc.properties[key] = Date.fromString(doc.properties[key]);
                        } else if (value.type === 'radio' && typeof doc.properties[key] !== 'string') {
                            doc.properties[key] = doc.properties[key].toString();
                        }
                    });
                    $scope.result = data;
                    $scope.doc = doc;
                }).
                error(function(data, status, headers, config) {
                    $scope.showMissing = true;
                });
            }).
            error(function(data, status, headers, config) {
                $scope.showMissing = true;
            });
            $scope.gem = function() {
                $scope.spinner = "icon-spinner icon-spin icon-large";
                var doc = $scope.doc;
                angular.forEach(doc.properties, function(value, key) {

                    if (doc.properties[key] === "") {
                        delete doc.properties[key];
                    }
                });
                $http.put(instance + '_design/app/_update/data/' + $scope.doc._id, doc).
                success(function(data, status) {
                    $templateCache.put('queryTerm', '');
                    $templateCache.put('showAll', false);
                    $location.path(instance + 'home');
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                    $scope.showError = true;
                    $scope.spinner = "icon-save icon-large";
                });
            };
            $rootScope.slet = function() {
                var title = 'Slet';
                var msg = 'Vil du slette dokumentet?';
                var btns = [{
                    result: 'cancel',
                    label: 'Annuller'
                }, {
                    result: 'ok',
                    label: 'OK',
                    cssClass: 'btn-primary'
                }];

                $dialog.messageBox(title, msg, btns)
                    .open()
                    .then(function(result) {
                        if (result === 'ok') {
                            $http({
                                method: "DELETE",
                                url: instance + $scope.doc._id + '?rev=' + $scope.doc._rev
                            }).
                            success(function(data, status) {
                                $templateCache.put('queryTerm', '');
                                $templateCache.put('showAll', false);
                                $location.path(instance + 'home');
                            }).
                            error(function(data, status) {
                                $scope.data = data || "Request failed";
                                $scope.status = status;
                                $scope.showError = true;
                            });
                        }
                    });


            };
            $scope.ret = function() {
                $http({
                    method: 'GET',
                    url: '/_session'
                }).
                success(function(data, status, headers, config) {
                    if (data.userCtx && data.userCtx.name) {
                        $rootScope.userName = data.userCtx.name;
                        $rootScope.isDisabled = false;
                    } else {
                        $rootScope.userName = null;
                        $rootScope.login();
                    }
                }).
                error(function(data, status, headers, config) {

                });
            };
            $scope.spinner = "icon-save icon-large";
            $scope.optionsDefined = function(settings) {
                if (settings.options)
                    return true
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
                console.log();
            };
        }
    ]);