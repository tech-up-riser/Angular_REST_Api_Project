'use strict';

/**
 * controller for View Grabee Grabs List
 */
angular.module('grabApp').controller('GrabeeGrabsCtrl', ['$scope', '$state', '$http',
    function ($scope, $state, $http) {
        $scope.Grabs = [];
        $scope.Pages = 0;
        $scope.itemsPerPage = 5;

        $scope.Filter = {
            type: null,
            status: null,
            page: 1,
            own: 1,
            full: 1
        };

        $scope.$watch('Filter', function (newValue, oldValue) {
            if (_.isEqual(newValue, oldValue)) {
                return;
            } else if ((newValue.type !== oldValue.type) || (newValue.status !== oldValue.status)) {
                $scope.Filter.page = 1;
            }
            getGrabsList();
        }, true);

        $scope.grabHasCompletedBid = function (Grub) {
            if (Grub.bids.length == 0) {
                return false;
            }
            var comletedBid = _.find(Grub.bids, {status: 'completed'});
            return !!comletedBid;
        };

        getGrabsList();
        function getGrabsList() {
            return $http.get('/api/v1/grabs', {params: $scope.Filter}).then(function (response) {
                $scope.Grabs = response.data.data.grab;
                $scope.Pages = response.data.data.pages;
            })
        }

        $scope.cancelGrub = function (Grub) {
            Grub.status = 'cancelled';
            var cancelledGrub = {"ID":Grub.ID,"userID":Grub.userID,"status":"cancelled"};
            $http.post('/api/v1/grabs/update', cancelledGrub);
        };
    }]);
