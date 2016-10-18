'use strict';

/**
 * controller for View Create Grab
 */
angular.module('grabApp').controller('ViewGrabCtrl', ['$scope', '$state', '$stateParams', '$http', 'GrabData', 'uiGmapGoogleMapApi', '$translate',
    function ($scope, $state, $stateParams, $http, GrabData, GoogleMapApi, $translate) {
        $scope.$emit('GrabSetStep', 2);
        
        $scope.tabs = [{active: true}, {active: false}];

        $scope.GrabData = GrabData;
        $scope.Grab = {};

        $scope.Page = 1;
        $scope.Pages = 0;
        $scope.itemsPerPage = 5;
        $scope.Bids = [];

        _.assign($scope, {
            map: {
                center: {
                    latitude: 45.518845,   //Montreal, QC
                    longitude: -73.637748
                },
                zoom: 8,
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

        GoogleMapApi.then(function (maps) {
            maps.visualRefresh = true;
        });

        $scope.$watch('Page', function () {
            getBids();
        }, true);

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

        getGrab();
        function getGrab() {
            $http.get('/api/v1/grabs/view', {params: {ID: $stateParams.grabId, full: 1}}).then(function (response) {
                var Grab = response.data.data.grab;

                switch (Grab.status) {
                    case 'draft':
                        switch (Grab.type) {
                            case 'grab':
                                $state.go('app.grab.update_grab', {grabId: Grab.ID});
                                break;
                            case 'container':
                                $state.go('app.grab.update_container', {grabId: Grab.ID});
                                break;
                            case 'pickup':
                                $state.go('app.grab.update_pickup', {grabId: Grab.ID});
                                break;
                        }
                        break;
                    case 'published':
                        break;
                    case 'scheduled':
                        $state.go('app.grab.scheduled', {grabId: Grab.ID});
                        break;
                    case 'complete':
                        $state.go('app.grab.completed', {grabId: Grab.ID});
                        break;
                }

                _.assign($scope.Grab, Grab, {
                    type: _.find(GrabData.grab.types, function (t) {
                        return t.value == Grab.type;
                    }),
                    category: _.find(GrabData.categories, function (c) {
                        return c.value == Grab.category;
                    }),
                    elevator: !!(+Grab.elevator)
                });

                if (!$scope.Grab.address) {
                    _.assign($scope.Grab, {
                        address: _.pick($scope.user.user.client, ['address', 'region', 'city', 'country', 'zipcode', 'latitude', 'longitude'])
                    });
                }

                setGrabMap({
                    latitude: $scope.Grab.address.latitude,
                    longitude: $scope.Grab.address.longitude
                });
            });
        }

        function getBids() {
            return $http.get('/api/v1/bids', {
                params: {
                    grabID: $stateParams.grabId,
                    page: $scope.Page,
                    full: 1
                }
            }).then(function (response) {
                $scope.Bids = response.data.data.bid;
                $scope.Pages = response.data.data.pages;
            });
        }

        //We need to take the payment information from the user.
        $scope.PaymentInfo = {};
        getPaymentInfo();
        function getPaymentInfo() {
            return $http.get('/api/v1/user/payment-info').then(function (response) {
                $scope.PaymentInfo = response.data.data.payment[0];
            });
        }

        //The grabbee accept the bid
        $scope.acceptBid = function (Bid) {
            //Asking the grabbee if he accepts the bid fees
            var buttonsOpts = {}
            buttonsOpts[$translate.instant("grab_published_acceptPayment_Yes")] = function() {
            $(this).dialog("close");

            //We process the payments and accept the bid
            Bid.status = 'accepted';
            $scope.Grab.status = 'scheduled';
            return $http.put('/api/v1/bids', Bid).then(function () {
                return $http.post('/api/v1/grabs/update', _.pick($scope.Grab, ['ID', 'status']));
                }).then(function () {

                    //Taking the money for the bid to the grabbee
                    $http.post('/api/v1/paymentmethods', {bidID: Bid.ID, payID: $scope.PaymentInfo.ID}).then(function (response) {
                        $scope.PaymentMethod = response.data.data.paymentmethod;

                        //Calculating the fees since it's not saved in the database
                        var bid = parseFloat(+Bid.amount / (1 + 0.09975 + 0.05 + 0.03)).toFixed(2);
                        var fees = +parseFloat((bid * 0.03)).toFixed(2);
                        fees = +fees + +parseFloat((fees * 0.05) + (fees * 0.09975)).toFixed(2);

                        //Get the payment method from the grabber
                        return $http.get('/api/v1/user/payment-info', {params: {UserID: Bid.userID}}).then(function (response) {
                            $scope.GrabberPaymentInfo = response.data.data.payment[0];

                            //Charging the fees to the grabber
                            $http.post('/api/v1/paymentmethods', {amount: fees, payID: $scope.GrabberPaymentInfo.ID}).then(function (response) {
                                //Move the the schedule page
                                $state.go('app.grab.scheduled', {grabId: $scope.Grab.ID});
                            });
                        });
                    });
                });
            }
            buttonsOpts[$translate.instant("grab_published_acceptPayment_No")] = function() {
                $(this).dialog("close");
            }

            $("#dialog-confirm" ).dialog({
                resizable: false,
                height: "auto",
                width: "auto",
                modal: true,
                closeOnEscape: false,
                buttons: buttonsOpts
            });

        };

        //The user decline the bid
        $scope.declineBid = function (Bid) {
            Bid.status = 'declined';
            return $http.put('/api/v1/bids', _.pick(Bid, ['ID', 'status'])).then(function () {
                $state.go('app.grabee.grabs');
            });
        };
    }]);