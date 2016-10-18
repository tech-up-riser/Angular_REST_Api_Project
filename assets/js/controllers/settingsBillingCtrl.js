'use strict';

/**
 * controller for View Grabber bids
 */
angular.module('grabApp').controller('SettingsBillingCtrl', ['$scope', '$state', '$http',
    function ($scope, $state, $http) {
        $scope.Bids = [];
        $scope.Pages = 0;
        $scope.itemsPerPage = 5;

        $scope.Filter = {
            status: 'delivered',
            page: 1,
            full: 1
        };

        if ($scope.user.user.role == 'grabee') {
            _.assign($scope.Filter, {grabeeID: $scope.user.user.ID});
        }

        if ($scope.user.user.role == 'grabber') {
            _.assign($scope.Filter, {userID: $scope.user.user.ID});
        }

        $scope.$watch('Filter', function (newValue, oldValue) {
            if (!newValue || _.isEqual(newValue, oldValue)) {
                return;
            }

            getBids();
        }, true);

        getBids();
        function getBids() {
            return $http.get('/api/v1/bids', {params: $scope.Filter}).then(function (response) {
                $scope.Bids = response.data.data.bid;
                $scope.Pages = response.data.data.pages;
            });
        }
    }]);
