'use strict';

/**
 * controller for Grabee Settings Profile
 */
angular.module('grabApp').controller('SettingsProfileCtrl', ['$scope', '$state', '$auth', '$http', 'Upload', '$timeout', 'uiGmapGoogleMapApi', 'cfpLoadingBar',
    function ($scope, $state, $auth, $http, Upload, $timeout, GoogleMapApi, cfpLoadingBar) {
        $scope.scope = $scope;
        window.scope = $scope;

        $scope.Client = {
            fullName: '',
            address: '',
            zipcode: '',
            city: '',
            region: '',
            country: '',
            phone: '',
            latitude: null,
            longitude: null,
            thumbnail: ''
        };

        var addressComponentTypes = {
            street_number: 'short_name',
            route: 'long_name',
            locality: 'long_name',
            administrative_area_level_1: 'short_name',
            country: 'long_name',
            postal_code: 'short_name'
        };

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
            },
            searchBox: {
                template: 'searchbox.tpl.html',
                events: {
                    place_changed: function (autocomplete) {
                        var place = autocomplete.getPlace();

                        // If the place has a geometry location, then present it on a map.
                        if (place.geometry && place.geometry.location) {
                            var location = place.geometry.location;
                            var geolocation = {
                                latitude: location.lat(),
                                longitude: location.lng()
                            };

                            _.assign($scope.Client, geolocation);
                            _.assign($scope.marker.coords, geolocation);
                            $scope.map.control.refresh(geolocation);
                        }

                        // Get each component of the address from the place details
                        // and fill the corresponding field on the form.
                        if (place.address_components) {
                            var addressComponentValues = {};

                            for (var i = 0; i < place.address_components.length; i++) {
                                //in case have the both "postal_code_prefix" & "postal_code"
                                var addressType = (place.address_components[i].types[1] == 'postal_code') ? place.address_components[i].types[1] : place.address_components[i].types[0];
                                if (addressComponentTypes[addressType]) {
                                    var val = place.address_components[i][addressComponentTypes[addressType]];
                                    addressComponentValues[addressType] = val;
                                }
                            }

                            if(addressComponentValues.postal_code.indexOf("J5R") > -1 || $scope.user.user.role == 'grabber'){
                                _.assign($scope.Client, {
                                    address: [addressComponentValues.street_number, addressComponentValues.route].join(' '),
                                    zipcode: addressComponentValues.postal_code,
                                    city: addressComponentValues.locality,
                                    region: addressComponentValues.administrative_area_level_1,
                                    country: addressComponentValues.country
                                });
                            }else{
                                _.assign($scope.Client, {
                                    address: "",
                                    zipcode: "",
                                    city: "",
                                    region: "",
                                    country: ""
                                });
                            }

                            console.log($scope.user.user.role, $scope.Client);
                        }
                    }
                },
                options: {
                    autocomplete: true,
                    types: ['address'],
                    componentRestrictions: {country: ['ca']}
                }
            }
        });
        $http.get('/api/v1/user/profile').then(function (response) {
            _.assign($scope.Client, response.data.data.user.client);

            if (!_.isNaN(+$scope.Client.latitude) && !_.isNaN(+$scope.Client.longitude)) {
                _.assign($scope.map.center, {
                    latitude: +$scope.Client.latitude,
                    longitude: +$scope.Client.longitude
                });

                _.assign($scope.marker.coords, {
                    latitude: +$scope.Client.latitude,
                    longitude: +$scope.Client.longitude
                });
            }
        });

        $scope.imageFile = null;
        $scope.grabeeProfileSubmitting = false;
        $scope.submitGrabeeProfileForm = function ($event) {
            $scope.grabeeProfileSubmitting = true;
            if ($scope.grabeeProfileForm.$invalid) {
                $event.preventDefault();
                angular.forEach($scope.grabeeProfileForm.$error.required, function (field) {
                    field.$setDirty();
                });
                $scope.grabeeProfileSubmitting = false;
                return;
            }

            cfpLoadingBar.start();
            cfpLoadingBar.inc();

            var data = $scope.imageFile ? _.assign($scope.Client, {thumbnail: $scope.imageFile}) : _.omit($scope.Client, ['thumbnail']);

            Upload.upload({
                url: '/api/v1/user/update',
                headers: $auth.retrieveData('auth_headers'),
                data: data
            }).then(function (response) {
                $timeout(function () {
                    $scope.grabeeProfileSubmitting = false;
                });
                // Update profile image
                $scope.user.user.client.thumbnail = response.data.data.user.thumbnail;
            }, function (response) {
                if (response.status > 0) {
                    $scope.imageUploadError = response.status + ': ' + response.data;
                }
            }, function (evt) {
                if ($scope.imageFile) {
                    $scope.imageFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                }
            }).finally(function () {
                cfpLoadingBar.complete();
            });
        };

        $scope.ExistingClientAddresses = [];
        $scope.ExistingClientAddressesMapConfs = [];
        getExistingClientAddresses();
        function getExistingClientAddresses() {
            $http.get('/api/v1/addresses/view').then(function (response) {
                $scope.ExistingClientAddresses = response.data.data.address;
                _($scope.ExistingClientAddresses).forEach(function (clientAddress, key) {
                    $scope.ExistingClientAddressesMapConfs[key] = {
                        map: {
                            center: {
                                latitude: clientAddress.latitude,
                                longitude: clientAddress.longitude
                            },
                            zoom: 17,
                            control: {},
                            options: {
                                draggable: false,
                                scrollwheel: false
                            }
                        },
                        marker: {
                            id: key,
                            coords: {
                                latitude: clientAddress.latitude,
                                longitude: clientAddress.longitude
                            }
                        },
                        searchBox: {
                            template: 'searchbox.tpl.html',
                            events: {
                                place_changed: function (autocomplete) {
                                    var place = autocomplete.getPlace();

                                    // If the place has a geometry location, then present it on a map.
                                    if (place.geometry && place.geometry.location) {
                                        var location = place.geometry.location;
                                        var geolocation = {
                                            latitude: location.lat(),
                                            longitude: location.lng()
                                        };

                                        _.assign(clientAddress, geolocation);
                                        _.assign($scope.ExistingClientAddressesMapConfs[key].marker.coords, geolocation);
                                        $scope.ExistingClientAddressesMapConfs[key].map.control.refresh(geolocation);
                                    }

                                    // Get each component of the address from the place details
                                    // and fill the corresponding field on the form.
                                    if (place.address_components) {
                                        var addressComponentValues = {};

                                        for (var i = 0; i < place.address_components.length; i++) {
                                            //in case have the both "postal_code_prefix" & "postal_code"
                                            window.addressType = (place.address_components[i].types[1]) ? place.address_components[i].types[1] : place.address_components[i].types[0];
                                            console.log(addressType);
                                            
                                            if (addressComponentTypes[addressType]) {
                                                var val = place.address_components[i][addressComponentTypes[addressType]];
                                                addressComponentValues[addressType] = val;
                                            }
                                        }

                                        _.assign(clientAddress, {
                                            address: [addressComponentValues.street_number, addressComponentValues.route].join(' '),
                                            zipcode: addressComponentValues.postal_code,
                                            city: addressComponentValues.locality,
                                            region: addressComponentValues.administrative_area_level_1,
                                            country: addressComponentValues.country
                                        });
                                    }
                                }
                            },
                            options: {
                                autocomplete: true,
                                types: ['address'],
                                componentRestrictions: {country: ['ca']}
                            }
                        }
                    };
                });
            });
        }

        $scope.updateGrabeeAdditionalAddress = function ($index, $event) {
            cfpLoadingBar.start();
            cfpLoadingBar.inc();

            $scope['updateClientAddressesSubmitting_' + $index] = true;
            var form = $scope.grabeeUpdateAdditionalAddressForm['addressForm_' + $index];

            if (form.$invalid) {
                $event.preventDefault();
                $event.stopPropagation();
                angular.forEach(form.$error.required, function (field) {
                    field.$setDirty();
                });
                $scope['updateClientAddressesSubmitting_' + $index] = false;
                return;
            }

            $http.post('/api/v1/addresses/update', $scope.ExistingClientAddresses[$index]).finally(function () {
                $scope['updateClientAddressesSubmitting_' + $index] = false;
                cfpLoadingBar.complete();
            });
        };

        var newClientAddressTemplate = {
            name: '',
            address: '',
            zipcode: '',
            city: '',
            region: '',
            country: '',
            latitude: null,
            longitude: null,
            phone: ''
        };

        $scope.NewClientAddresses = [];
        $scope.NewClientAddressesMapConfs = [];
        $scope.addAdditionalAddress = function () {
            var NewClientAddress = angular.copy(newClientAddressTemplate);
            $scope.NewClientAddresses.push(NewClientAddress);

            var index = _.indexOf($scope.NewClientAddresses, NewClientAddress);
            $scope.NewClientAddressesMapConfs[index] = {
                map: {
                    center: {
                        latitude: 45.248289,
                        longitude: -76.0804408
                    },
                    zoom: 8,
                    control: {},
                    options: {
                        draggable: false,
                        scrollwheel: false
                    }
                },
                marker: {
                    id: $scope.ExistingClientAddressesMapConfs.length + index,
                    coords: {
                        latitude: null,
                        longitude: null
                    }
                },
                searchBox: {
                    template: 'searchbox.tpl.html',
                    events: {
                        place_changed: function (autocomplete) {
                            var place = autocomplete.getPlace();

                            // If the place has a geometry location, then present it on a map.
                            if (place.geometry && place.geometry.location) {
                                var location = place.geometry.location;
                                var geolocation = {
                                    latitude: location.lat(),
                                    longitude: location.lng()
                                };

                                _.assign(NewClientAddress, geolocation);
                                _.assign($scope.NewClientAddressesMapConfs[index].marker.coords, geolocation);
                                _.assign($scope.NewClientAddressesMapConfs[index].map, {zoom: 17});
                                $scope.NewClientAddressesMapConfs[index].map.control.refresh(geolocation);
                            }

                            // Get each component of the address from the place details
                            // and fill the corresponding field on the form.
                            if (place.address_components) {
                                var addressComponentValues = {};

                                for (var i = 0; i < place.address_components.length; i++) {
                                    //in case have the both "postal_code_prefix" & "postal_code"
                                    addressType = (place.address_components[i].types[1]) ? place.address_components[i].types[1] : place.address_components[i].types[0];
                                    if (addressComponentTypes[addressType]) {
                                        var val = place.address_components[i][addressComponentTypes[addressType]];
                                        addressComponentValues[addressType] = val;
                                    }
                                }

                                _.assign(NewClientAddress, {
                                    address: [addressComponentValues.street_number, addressComponentValues.route].join(' '),
                                    zipcode: addressComponentValues.postal_code,
                                    city: addressComponentValues.locality,
                                    region: addressComponentValues.administrative_area_level_1,
                                    country: addressComponentValues.country
                                });
                            }
                        }
                    },
                    options: {
                        autocomplete: true,
                        types: ['address'],
                        componentRestrictions: {country: ['ca']}
                    }
                }
            };
        };

        $scope.addGrabeeAdditionalAddress = function ($index, $event) {
            $scope['newClientAddressesSubmitting_' + $index] = true;
            var form = $scope.grabeeAddAdditionalAddressForm['addressForm_' + $index];

            if (form.$invalid) {
                $event.preventDefault();
                $event.stopPropagation();
                angular.forEach(form.$error.required, function (field) {
                    field.$setDirty();
                });
                $scope['newClientAddressesSubmitting_' + $index] = false;
                return;
            }

            $http.post('/api/v1/addresses/create', $scope.NewClientAddresses[$index]).then(function () {
                $scope.NewClientAddresses.splice($index, 1);

                getExistingClientAddresses();
                delete $scope['newClientAddressesSubmitting_' + $index]
            });
        };
    }]);
