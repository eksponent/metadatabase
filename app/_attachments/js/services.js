'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('metadata.services', [])
    .factory('couchdb', ['$http',
        function($http) {
            return {
                session: function() {
                    return $http({
                        method: 'GET',
                        url: '/_session'
                    }).then(function(result) {
                        return result;
                    }, function(error) {
                        return error;
                    });
                }
            };
        }
    ]);