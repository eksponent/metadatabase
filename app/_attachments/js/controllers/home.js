angular.module('metadata.controllers')
.controller('home', ['$scope', '$rootScope', '$routeParams', '$templateCache', 'ejsResource',
    function($scope, $rootScope, $routeParams, $templateCache, ejsResource) {
        $scope.status = "icon-search";
        $rootScope.frame = true;
        $rootScope.isDisabled = true;
        $rootScope.instance = $routeParams.instance;
        var ejs = ejsResource("http://" + window.location.hostname + ":9200");

        var QueryObj = ejs.QueryStringQuery(); //.defaultField('properties.titel');

        var activeFilters = {};

        var client = ejs.Request()
            .indices($routeParams.instance)
            .types('data');
        /*
				.facet(
					ejs.TermsFacet('tags')
					.field('properties.Ansvarlig_afdeling')
					.size(10));*/

        $scope.isActive = function(field, term) {
            return activeFilters.hasOwnProperty(field + term);
        };

        var applyFilters = function(query) {

            var filter = null;
            var filters = Object.keys(activeFilters).map(function(k) {
                return activeFilters[k];
            });

            if (filters.length > 1) {
                filter = ejs.AndFilter(filters);
            } else if (filters.length === 1) {
                filter = filters[0];
            }

            return filter ? ejs.FilteredQuery(query, filter) : query;
        };
        $scope.search = function() {
            var query = $scope.queryTerm || '';
            if (query.length > 1) {
                $scope.status = "icon-spinner icon-spin";
                query += '*';
                $scope.results = client
                    .query(applyFilters(QueryObj.query(query)))
                    .fields(["properties.titel", "properties.beskrivelse"])
                    .size(1000000)
                    .doSearch(function() {
                        $scope.status = "icon-search";
                    });
                //$templateCache.put('results', $scope.results);
                $templateCache.put('queryTerm', $scope.queryTerm);
                $templateCache.put('showAll', false);
            } else {
                $scope.results = [];
            }
        };

        $scope.filter = function(field, term) {
            if ($scope.isActive(field, term)) {
                delete activeFilters[field + term];
            } else {
                activeFilters[field + term] = ejs.TermFilter(field, term);
            }
            var query = $scope.queryTerm || '';
            if (query.length > 1) {
                $scope.search();
            } else {
                $scope.visAlle();
            }

        };
        $scope.visAlle = function() {
            var query = '*';
            $scope.status = "icon-spinner icon-spin";
            $scope.results = client
                .query(applyFilters(QueryObj.query(query)))
                .fields(["properties.titel", "properties.beskrivelse"])
                .sort("untouched")
                .size(1000000)
                .doSearch(function() {
                    $scope.status = "icon-search";
                });
            $scope.queryTerm = "";
            //$templateCache.put('results', $scope.results);
            $templateCache.put('queryTerm', $scope.queryTerm);
            $templateCache.put('showAll', true);
        };
        if (typeof $templateCache.get('showAll') !== 'undefined') {
            var showAll = $templateCache.get('showAll');
            if (showAll) {
                $scope.visAlle();
            } else if (typeof $templateCache.get('queryTerm') !== 'undefined') {
                //$scope.results = $templateCache.get('results');
                $scope.queryTerm = $templateCache.get('queryTerm');
                if ($scope.queryTerm != "") {
                    $scope.search();
                }
            }
        }

    }
]);