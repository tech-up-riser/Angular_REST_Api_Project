'use strict';

/**
 * controller for Password Recover
 */
angular.module('grabApp')
    .controller('ResetPasswordCtrl', ['$scope', '$state', '$stateParams', '$http',
        function ($scope, $state, $stateParams, $http) {
            $scope.Data = {
                password: '',
                reset: $stateParams.reset
            };

            $scope.invalidAttributes = {};

            $scope.isSubmiting = false;
            $scope.submitResetPasswordForm = function ($event) {
                if ($scope.resetPasswordForm.$invalid) {
                    $event.preventDefault();
                    angular.forEach($scope.resetPasswordForm.$error.required, function (field) {
                        field.$setDirty();
                    });
                    return;
                }

                $scope.isSubmiting = true;
                return $http.post('/api/v1/user/recovery', $scope.Data)
                    .then(function () {
                        $scope.isSubmiting = false;
                        $state.go('login.signin');
                    })
                    .catch(function (response) {
                        $scope.errors = response.errors;
                    });
            };
        }]);
