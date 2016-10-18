'use strict';

/**
 * controller for Grabee Scheduled Grab
 */
angular.module('grabApp').controller('GrabScheduledCtrl', ['$scope', '$state', '$stateParams', '$http','uiGmapGoogleMapApi',
    function ($scope, $state, $stateParams, $http, GoogleMapApi) {
        $scope.$emit('GrabSetStep', 3);

        $scope.Bid = {};
        $scope.Shedule = {};
        $scope.Messages = [];
        $scope.Message = {
            grabID: +$stateParams.grabId,
            message: '',
            recipientID: null
        };
        $scope.upPrice = false;
        $scope.finalAmount = null;

        GoogleMapApi.then(function (maps) {
            maps.visualRefresh = true;
        });

        _.assign($scope, {
            map: {
                center: {
                    latitude: null,
                    longitude: null
                },
                zoom: 17,
                control: {},
                options: {
                    draggable: false,
                    scrollwheel: false
                }
            },
            marker: {
                id: 0,
                coords: {
                    latitude: null,
                    longitude: null
                }
            }
        });

        function setGrabMap(geolocation) {
            _.assign($scope, {
                map: {
                    center: geolocation,
                    zoom: 17,
                    control: {},
                    options: {
                        draggable: false,
                        scrollwheel: false
                    }
                },
                marker: {
                    id: 0,
                    coords: geolocation
                }
            });
        }

        getBid();
        function getBid() {
            return $http.get('/api/v1/bids', {
                params: {
                    grabID: $stateParams.grabId,
                    status: 'accepted',
                    full: 1
                }
            }).then(function (response) {
                $scope.Bid = response.data.data.bid[0];
                
                if (!$scope.Bid) {
                    switch ($scope.user.user.role) {
                        case 'grabee':
                            $state.go('app.grabee.dashboard');
                            break;
                        case 'grabber':
                            $state.go('app.grabber.dashboard');
                            break;
                    }
                    return;
                }

                switch ($scope.Bid.grab.status) {
                    case 'published':
                        switch ($scope.user.user.role) {
                            case 'grabee':
                                $state.go('app.grab.published', {grabId: $scope.Bid.grab.ID});
                                break;
                            case 'grabber':
                                $state.go('app.grab.bid', {grabId: $scope.Bid.grab.ID});
                                break;
                        }
                        break;
                    case 'scheduled':
                        break;
                    case 'complete':
                        $state.go('app.grab.completed', {grabId: $scope.Bid.grab.ID});
                        break;
                }

                $scope.Shedule = $scope.Bid.schedules[0];

                _.assign($scope.Message, {
                    recipientID: $scope.Bid.user.ID
                });

                if (!$scope.Bid.grab.address) {
                    _.assign($scope.Bid.grab, {
                        address: _.pick($scope.user.user.client, ['address', 'region', 'city', 'country', 'zipcode', 'latitude', 'longitude'])
                    });
                }

                setGrabMap({
                    latitude: $scope.Bid.grab.address.latitude,
                    longitude: $scope.Bid.grab.address.longitude
                });
            });
        }

        getMessages();
        function getMessages() {
            return $http.get('/api/v1/message', {
                params: {
                    grabID: $stateParams.grabId
                }
            }).then(function (response) {
                $scope.Messages = response.data.data;
            });
        }

        $scope.messageSubmitting = false;
        $scope.submitMessagesForm = function ($event) {
            $scope.messageSubmitting = true;
            if ($scope.messagesForm.$invalid) {
                $event.preventDefault();
                angular.forEach($scope.messagesForm.$error.required, function (field) {
                    field.$setDirty();
                });
                $scope.messageSubmitting = false;
                return;
            }

            return $http.post('/api/v1/message', $scope.Message).then(function () {
                $scope.Message.message = '';
                $scope.messageSubmitting = false;
                $scope.messagesForm.$setPristine();
                getMessages();
            });
        };

        $scope.$watch('upPrice', function (newValue, oldValue) {
            if (_.isUndefined(oldValue)) return;
            if (newValue) {
                $scope.finalAmount = null;
            }
        });

        $scope.updateBidSubmitting = false;
        $scope.submitUpdateBidForm = function ($event) {
            $scope.updateBidSubmitting = true;
            if ($scope.upPrice && $scope.updateBidForm.$invalid) {
                $event.preventDefault();
                angular.forEach($scope.updateBidForm.$error.required, function (field) {
                    field.$setDirty();
                });
                $scope.updateBidSubmitting = false;
                return;
            }

            var params = {
                ID: $scope.Bid.ID,
                status: 'completed'
            };

            if ($scope.finalAmount) {
                params.finalAmount = $scope.finalAmount;
            }else {
                params.finalAmount = $scope.Bid.amount;
            }

            return $http.put('/api/v1/bids', params).then(function (response) {
               $state.go('app.grabber.bids'); 
            });
         };
     }]);