'use strict';

/* Controllers */

angular.module('metadata.controllers', []).
controller('home', ['$scope', '$rootScope', '$routeParams','$templateCache', 'ejsResource', function ($scope, $rootScope, $routeParams, $templateCache, ejsResource) {
			$scope.status = "icon-search";
			$rootScope.frame = true;
			$rootScope.isDisabled = true;
			$rootScope.instance = $routeParams.instance;
			var ejs = ejsResource("http://" + window.location.hostname + ":9200");

			var QueryObj = ejs.QueryStringQuery(); //.defaultField('properties.titel');

			var activeFilters = {};

			var client = ejs.Request()
				.indices($routeParams.instance)
				.types('data');/*
				.facet(
					ejs.TermsFacet('tags')
					.field('properties.Ansvarlig_afdeling')
					.size(10));*/

			$scope.isActive = function (field, term) {
				return activeFilters.hasOwnProperty(field + term);
			};

			var applyFilters = function (query) {

				var filter = null;
				var filters = Object.keys(activeFilters).map(function (k) {
						return activeFilters[k];
					});

				if (filters.length > 1) {
					filter = ejs.AndFilter(filters);
				} else if (filters.length === 1) {
					filter = filters[0];
				}

				return filter ? ejs.FilteredQuery(query, filter) : query;
			};
			$scope.search = function () {
				var query = $scope.queryTerm || '';
				if(query.length>1){
					$scope.status = "icon-spinner icon-spin";	
					query += '*';
					$scope.results = client
					.query(applyFilters(QueryObj.query(query)))
					.fields(["properties.titel","properties.beskrivelse"])
					.size(1000000)
					.doSearch(function(){
						$scope.status = "icon-search";			
					});
					//$templateCache.put('results', $scope.results);
					$templateCache.put('queryTerm', $scope.queryTerm);
					$templateCache.put('showAll', false);
				} else {
					$scope.results = [];
				}
			};

			$scope.filter = function (field, term) {
				if ($scope.isActive(field, term)) {
					delete activeFilters[field + term];
				} else {
					activeFilters[field + term] = ejs.TermFilter(field, term);
				}
				var query = $scope.queryTerm || '';
				if(query.length>1){
					$scope.search();
				} else {
					$scope.visAlle();
				}
				
			};
			$scope.visAlle = function () {
				var query = '*';
				$scope.status = "icon-spinner icon-spin";	
				$scope.results = client
					.query(applyFilters(QueryObj.query(query)))
					.fields(["properties.titel","properties.beskrivelse"])
					.sort("untouched")
					.size(1000000)
					.doSearch(function(){
						$scope.status = "icon-search";			
					});
				$scope.queryTerm="";
				//$templateCache.put('results', $scope.results);
				$templateCache.put('queryTerm', $scope.queryTerm);
				$templateCache.put('showAll', true);
			};
			if (typeof $templateCache.get('showAll') !== 'undefined') {
				var showAll = $templateCache.get('showAll');
				if(showAll){
					$scope.visAlle();
				} else if (typeof $templateCache.get('queryTerm') !== 'undefined') {
					//$scope.results = $templateCache.get('results');
					$scope.queryTerm = $templateCache.get('queryTerm');
					if($scope.queryTerm != ""){
						$scope.search();
					}
				}
			}
			
		}
	])
.controller('details', ['$scope', '$routeParams', '$http', '$location','$rootScope','$dialog', '$templateCache', function ($scope, $routeParams, $http, $location, $rootScope,$dialog,$templateCache) {
			$rootScope.showSchemas = false;
			$scope.showMissing = false;
			$rootScope.isDisabled = true;
			$rootScope.frame = $routeParams.frame;
			$rootScope.instance = $routeParams.instance;
			var instance = '/'+$routeParams.instance+'/';
			$http({
				method : 'GET',
				url : instance + $routeParams.id
			}).
			success(function (data, status, headers, config) {
				$http({
					method : 'GET',
					url : instance + data.schema,
					doc : data
				}).
				success(function (data, status, headers, config) {
					var doc = config.doc;
					$scope.order = [];
					angular.forEach(data.properties, function (value, key) {
						$scope.order.push(key);
						
						if (typeof doc.properties[key] === "undefined") {
							if (value.type === "checkbox") {
								if (value.options) {
									doc.properties[key] = {};
								} else
									doc.properties[key] = false;
							} else if(value.type!=="ruler"){
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
				error(function (data, status, headers, config) {
					$scope.showMissing = true;
				});
			}).
			error(function (data, status, headers, config) {
				$scope.showMissing = true;
			});
			$scope.gem = function () {
				$scope.spinner = "icon-spinner icon-spin icon-large";
				var doc = $scope.doc;
				angular.forEach(doc.properties, function (value, key) {
					
					if (doc.properties[key] === "") {
						delete doc.properties[key];
					}
				});
				$http.put(instance+'_design/app/_update/data/' + $scope.doc._id, doc).
				success(function (data, status) {
					$templateCache.put('queryTerm', '');
					$templateCache.put('showAll', false);
					$location.path(instance+'home');
				}).
				error(function (data, status) {
					$scope.data = data || "Request failed";
					$scope.status = status;
					$scope.showError = true;
					$scope.spinner = "icon-save icon-large";
				});
			};
			$rootScope.slet = function () {
				var title = 'Slet';
				    var msg = 'Vil du slette dokumentet?';
				    var btns = [{result:'cancel', label: 'Annuller'}, {result:'ok', label: 'OK', cssClass: 'btn-primary'}];

				    $dialog.messageBox(title, msg, btns)
				      .open()
				      .then(function(result){
						if(result==='ok'){
							$http({
								method : "DELETE",
								url : instance + $scope.doc._id + '?rev=' + $scope.doc._rev
							}).
							success(function (data, status) {
								$templateCache.put('queryTerm', '');
								$templateCache.put('showAll', false);
								$location.path(instance+'home');
							}).
							error(function (data, status) {
								$scope.data = data || "Request failed";
								$scope.status = status;
								$scope.showError = true;
							});
						}
				    });
				  
				
			};
			$scope.ret = function(){
				$http({
					method : 'GET',
					url : '/_session'
				}).
				success(function (data, status, headers, config) {
					if(data.userCtx && data.userCtx.name){
						$rootScope.userName = data.userCtx.name;
						$rootScope.isDisabled = false;
					}
					else{
						$rootScope.userName=null;
						$rootScope.login();
					}
				}).
				error(function (data, status, headers, config) {
					
				});
			};
			$scope.spinner = "icon-save icon-large";
			$scope.optionsDefined = function (settings) {
				if (settings.options)
					return true
					return false;
			};
			$scope.required = function (form) {
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
			$scope.dateRequired = function (form) {
				console.log();
			};
		}
	])
.controller('TestDialogController', ['$scope','$rootScope', '$http','dialog', function ($scope,$rootScope,$http, dialog) {
	  $scope.close = function(){
	    dialog.close();
	  };
	$scope.submit = function () {
		$http.post('/_session', $scope.user).
		success(function (data, status, headers, config) {
			dialog.close();
			$scope.showError=false;
			$rootScope.userName = $scope.user.name;
			$rootScope.isDisabled=false;
		}).
		error(function (data, status, headers, config) {
			$scope.data = data;
			$scope.status = status;
			$scope.showError=true;
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	};
	}])
	
.controller('login', ['$scope','$rootScope', '$http','$dialog', function ($scope, $rootScope,$http,$dialog) {
	$scope.user = {name:'',password:''};
	$scope.submit = function () {
		alert("1");
	};
			$scope.showError=false;
			$http({
				method : 'GET',
				url : '/_session'
			}).
			success(function (data, status, headers, config) {
				if(data.userCtx && data.userCtx.name)
				$rootScope.userName = data.userCtx.name;
			}).
			error(function (data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
			
			$scope.logout = function () {
				$http["delete"]('/_session').
				success(function (data, status, headers, config) {
					$rootScope.userName = null
				}).
				error(function (data, status, headers, config) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
				});
			};
			
			var opts = {
			    backdrop: true,
			    keyboard: true,
			    backdropClick: true,
				
			    templateUrl:  'partials/login.html',
			    controller: 'TestDialogController'
			  };

			  $rootScope.login = function(){
			    var d = $dialog.dialog(opts);
			    d.open();/*.then(function(result){
			      if(result)
			      {
			        alert('dialog closed with result: ' + result);
			      }
			    });*/
			  };
			  
		}
	])
.controller('new', ['$scope', '$routeParams', '$rootScope','$http', '$location','$templateCache', function ($scope, $routeParams, $rootScope, $http, $location,$templateCache) {
			$rootScope.frame=true;
			$rootScope.showSchemas = true;
			$scope.showMissing = false;
			$rootScope.isDisabled = false;
			$rootScope.instance = $routeParams.instance;
			var instance = '/'+$routeParams.instance+'/';
			$http({
				method : 'GET',
				url : instance+'_design/app/_view/schema'
			}).
			success(function (data, status, headers, config) {
				$scope.results = data.rows; // this callback will be called asynchronously
				if (data.rows.length > 0)
					$scope.schema = data.rows[0];
				$scope.change();
				// when the response is available
			}).
			error(function (data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
			$scope.change = function () {
				$http({
					method : 'GET',
					url : instance + $scope.schema.id
				}).
				success(function (data, status, headers, config) {
					$scope.result = data;
					$scope.order =[];
					
					var doc = {
						properties : {},
						schema : data._id
					};
					angular.forEach(data.properties, function (value, key) {
						$scope.order.push(key);
						switch (value.type) {
						case "checkbox":
							if (value.options) {
								doc.properties[key] = {};
								angular.forEach(value.options, function (value2, key2) {
									doc.properties[key][value2.label] = value2["default"];
								});
							} else
								doc.properties[key] = false;
							break;
						case "ruler":
							break;
						default:
							if (value["default"])
								doc.properties[key] = value["default"];
							else
								doc.properties[key] = "";
							break;
						}
					}, doc);
					$scope.doc = doc;
				}).
				error(function (data, status, headers, config) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
				});
			};
			$scope.gem = function () {
				$scope.spinner = "icon-spinner icon-spin icon-large";
				var doc = $scope.doc;
				angular.forEach(doc.properties, function (value, key) {
					
					if (doc.properties[key] === "") {
						delete doc.properties[key];
					}
				});
				$http.post(instance+'_design/app/_update/data', doc).
				success(function (data, status) {
					$templateCache.put('queryTerm', '');
					$templateCache.put('showAll', false);
					$location.path(instance+'home');
				}).
				error(function (data, status) {
					$scope.data = data || "Request failed";
					$scope.status = status;
					$scope.showError = true;
					$scope.spinner = "icon-save icon-large";
				});
			};
			$scope.spinner = "icon-save icon-large";
			$scope.optionsDefined = function (settings) {
				if (settings.options)
					return true
					return false;
			};
			$scope.required = function (form) {
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
			$scope.dateRequired = function (form) {
				console.log();
			};
		}
	]);
