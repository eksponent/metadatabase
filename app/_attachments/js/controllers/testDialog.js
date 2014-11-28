 angular.module('metadata.controllers')
     .controller('TestDialogController', ['$scope', '$rootScope', '$http', 'dialog',
         function($scope, $rootScope, $http, dialog) {
             $scope.close = function() {
                 dialog.close();
             };
             $scope.submit = function() {
                 $http.post('/_session', $scope.user).
                 success(function(data, status, headers, config) {
                     dialog.close();
                     $scope.showError = false;
                     $rootScope.userName = $scope.user.name;
                     $rootScope.isDisabled = false;
                 }).
                 error(function(data, status, headers, config) {
                     $scope.data = data;
                     $scope.status = status;
                     $scope.showError = true;
                     // called asynchronously if an error occurs
                     // or server returns response with an error status.
                 });
             };
         }
     ]);