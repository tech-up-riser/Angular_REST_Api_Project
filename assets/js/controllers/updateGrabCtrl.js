'use strict';

/**
 * controller for Client Update Grab
 */
angular.module('grabApp').controller('UpdateGrabCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$q', '$auth', 'uiGmapGoogleMapApi', 'GrabData', 'HumanizeTime', 'Upload', '$timeout', '$translate',
    function ($rootScope, $scope, $state, $stateParams, $http, $q, $auth, GoogleMapApi, GrabData, HumanizeTime, Upload, $timeout, $translate) {
        $scope.$emit('GrabSetStep', 1);

        $scope.currentLang = ($translate.proposedLanguage() || $translate.use()).toLowerCase();
        $scope.langMapping = {
            'fr_ca': 'label_fr',
            'en': 'label_en'
        };

        $rootScope.$on('$translateChangeStart', function (event, data) {
            $scope.currentLang = data.language.toLowerCase();
        });

        $scope.GrabData = GrabData;
        $scope.AddressSameAsProfile = true;
        $scope.imageFile = null;

        $scope.Grab = {
            type: '',
            grabtype: '',
            category: '',
            subCategory: '',
            title: '',
            description: '',
            size: '',
            weight: '',
            condition: '',
            addressID: '',
            placement: '',
            container: 0,
            container_placement: '',
            floor: '',
            elevator: 0,
            bins: '',
            status: ''
        };

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


        $scope.GrabCategoriesAll = [];
        $scope.GrabCategories = [];
        $scope.GrabSubCategories = [];

        $http.get('/api/v1/user/profile').then(function (response) {
            _.assign($scope.Client, response.data.data.user.client);
            /*if (!_.isNaN(+$scope.Client.latitude) && !_.isNaN(+$scope.Client.longitude)) {
             _.assign($scope.map.center, {
             latitude: $scope.Client.latitude,
             longitude: $scope.Client.longitude
             });

             _.assign($scope.marker.coords, {
             latitude: $scope.Client.latitude,
             longitude: $scope.Client.longitude
             });
             }*/
        });

        function getGrabCategories() {
            return $http.get('/api/v1/grab-category').then(function (response) {
                $scope.GrabCategoriesAll = _.map(response.data.data.grabCategory, function (grabCategory) {
                    grabCategory.value = grabCategory.name;
                    return grabCategory;
                });
            });
        }
        $scope.UserAddresses = [];
        function getUserAddresses() {
            return $http.get('/api/v1/addresses/view').then(function (response) {
                $scope.UserAddresses = response.data.data.address;
            });
        }

        function getGrab() {
            return $http.get('/api/v1/grabs/view', {
                params: {
                    ID: $stateParams.grabId,
                    full: 1
                }
            }).then(function (response) {
                var Grab = response.data.data.grab;

                switch (Grab.status) {
                    case 'draft':
                        break;
                    case 'published':
                        $state.go('app.grab.published', {grabId: Grab.ID});
                        break;
                    case 'scheduled':
                        $state.go('app.grab.scheduled', {grabId: Grab.ID});
                        break;
                    case 'complete':
                        $state.go('app.grab.completed', {grabId: Grab.ID});
                        break;
                }

                var grabData = {};

                $scope.GrabCategories = _.filter($scope.GrabCategoriesAll, function (grabCategory) {
                    return grabCategory.sub_category == 0;
                });

                _.assign(grabData, {
                    category: _.find($scope.GrabCategories, function (c) {
                        return c.value == Grab.category;
                    })
                });

                if (grabData.category && grabData.category.ID) {
                    $scope.GrabSubCategories = _.filter($scope.GrabCategoriesAll, function (grabCategory) {
                        return grabCategory.parentID == grabData.category.ID;
                    });
                }

                _.assign(grabData, {
                    subCategory: _.find($scope.GrabSubCategories, function (sc) {
                        return sc.value == Grab.subCategory;
                    })
                });

                _.assign(grabData, {
                    floor: _.find(GrabData.floors, function (f) {
                        return f.value == Grab.floor;
                    })
                });

                if(Grab.type == "container") {
                    _.assign(grabData, {
                        size: _.find(GrabData.sizes, function (s) {
                            return s.value == Grab.size;
                        })
                    });
                }else if(Grab.type == "grab"){
                    _.assign(grabData, {size: Grab.size});
                }

                _.assign($scope.Grab, Grab, grabData);
                if ($scope.Grab.address) {
                    $scope.Grab.addressID = _.find($scope.UserAddresses, function (a) {
                        return a.ID == $scope.Grab.address.ID;
                    });
                //    $scope.AddressSameAsProfile = false;
                }
                if ($scope.Grab.media) {
                    _.assign($scope.GrabMedia, $scope.Grab.media);
                }
                if ($scope.Grab.schedules.length) {
                    $scope.GrabSchedules = $scope.Grab.schedules;
                    $scope.rightAway = false;
                }

                $scope.$watch('Grab.category', function (newValue, oldValue) {
                    if (_.isObject(newValue) && _.isObject(oldValue) && _.isEqual(newValue, oldValue)) {
                        return;
                    }

                    if (newValue) {
                        $scope.Grab.subCategory = '';

                        $scope.GrabSubCategories = _.filter($scope.GrabCategoriesAll, function (grabCategory) {
                            return grabCategory.parentID == newValue.ID;
                        });
                    }
                });

            });
        }

        getGrabCategories().then(function () {
            getUserAddresses().then(function () {
                getGrab();
            });
        });

        $scope.newUserAddressSubmitting = false;
        $scope.submitNewUserAddressForm = function ($event) {
            $scope.newUserAddressSubmitting = true;
            if ($scope.updateGrabForm.newUserAddressForm.$invalid) {
                $event.preventDefault();
                angular.forEach($scope.updateGrabForm.newUserAddressForm.$error.required, function (field) {
                    field.$setDirty();
                });
                $scope.newUserAddressSubmitting = false;
                return;
            }

            $http.post('/api/v1/addresses/create', $scope.NewUserAddress).then(function (response) {
                var UserAddress = response.data.data.address;
                $scope.UserAddresses.push(UserAddress);
                $scope.Grab.addressID = UserAddress;
                setDefaultNewAddress();
                $scope.updateGrabForm.newUserAddressForm.$setPristine();
                $scope.newUserAddressSubmitting = false;
                $scope.updateGrab();
            });
        };

        function setDefaultNewAddress() {
            $scope.NewUserAddress = {
                name: '',
                address: '',
                zipcode: '',
                city: '',
                region: '',
                country: '',
                latitude: null,
                longitude: null
            };
            _.assign($scope, {
                map: {
                    center: {
                        latitude: 45.248289, //Ottawa, ON, Canada
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

                                _.assign($scope.marker.coords, geolocation);
                                _.assign($scope.NewUserAddress, geolocation);

                                // $scope.map.control.getGMap().setZoom(17);
                                _.assign($scope.map, {zoom: 17});
                                $scope.map.control.refresh(geolocation);
                            }

                            // Get each component of the address from the place details
                            // and fill the corresponding field on the form.
                            if (place.address_components) {
                                for (var i = 0; i < place.address_components.length; i++) {
                                    var addressType = place.address_components[i].types[0];
                                    if (addressComponentTypes[addressType]) {
                                        var val = place.address_components[i][addressComponentTypes[addressType]];
                                        addressComponentValues[addressType] = val;
                                    }
                                }

                                _.assign($scope.NewUserAddress, {
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
            });
        }

        $scope.$watch('AddressSameAsProfile', function (newValue, oldValue) {
            if (_.isUndefined(oldValue)) return;
            if (!newValue) {
                setDefaultNewAddress();
            } else {
                $scope.Grab.addressID = '';
            }
        });

        var addressComponentValues = {};

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

        function getRightAwaySchedule() {
            var now = moment();
            return [{date: now.toDate(), time: HumanizeTime(now)}];
        }

        $scope.GrabSchedulesToDelete = [];
        $scope.$watch('rightAway', function (newValue, oldValue) {
            if (_.isUndefined(oldValue)) return;
            if (newValue) {
                $scope.GrabSchedulesToDelete = _.filter($scope.GrabSchedules, function (grabSchedule) {
                    return grabSchedule.ID;
                });
            }
            $scope.GrabSchedules = newValue ? getRightAwaySchedule() : [];
        });
        var grabScheduleTemplate = {date: moment().toDate(), time: 'morning'};
        $scope.NewGrabSchedule = angular.copy(grabScheduleTemplate);

        $scope.addGrabSchedule = function () {
            var schedule = _.find($scope.GrabSchedules, function (s) {
                if ((moment($scope.NewGrabSchedule.date).format('YYYY-MM-DD') == moment(s.date).format('YYYY-MM-DD')) && $scope.NewGrabSchedule.time == s.time) {
                    return s;
                }
            });

            if (schedule) {
                return;
            }

            $scope.GrabSchedules.push($scope.NewGrabSchedule);
            $scope.NewGrabSchedule = angular.copy(grabScheduleTemplate);
        };

        $scope.deleteGrabSchedule = function (GrabSchedule) {
            _.remove($scope.GrabSchedules, function (el) {
                return el === GrabSchedule;
            });
            if (GrabSchedule.ID) {
                $scope.GrabSchedulesToDelete.push(GrabSchedule);
            }
        };

        $scope.setGrabtype = function (grabtype) {
            $scope.Grab.grabtype = grabtype;
        };

        $scope.GrabMedia = {image: null};
        $scope.uploadImageFile = function (file, grabID) {
            file.upload = Upload.upload({
                url: $scope.GrabMedia.ID ? '/api/v1/media/update' : '/api/v1/media/create',
                headers: $auth.retrieveData('auth_headers'),
                data: {grabID: grabID, image: file}
            });

            return file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.imageUploadError = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        };

        $scope.publishGrub = function () {
            $scope.Grab.status = 'published';
        };
        $scope.updateGrab = function () {

            if ($scope.Grab.category) {
                _.assign($scope.Grab, {category: $scope.Grab.category.value});
            }
            if ($scope.Grab.subCategory) {
                _.assign($scope.Grab, {subCategory: $scope.Grab.subCategory.value});
            }
            if ($scope.Grab.floor) {
                _.assign($scope.Grab, {floor: $scope.Grab.floor.value});
            }
            if ($scope.Grab.addressID) {
                _.assign($scope.Grab, {addressID: $scope.Grab.addressID.ID});
            }
            if (_.isObject($scope.Grab.size)) {
                _.assign($scope.Grab, {
                    size: $scope.Grab.size.value
                });
            }

            return $http.post('/api/v1/grabs/update', _.omit($scope.Grab, ['address', 'media', 'schedules', 'user', 'bids'])).then(function (response) {
                var grab = response.data.data.grab;
                var grabSchedulesPromises;
                var newSchedules = _.filter($scope.GrabSchedules, function (grabSchedule) {
                    return !grabSchedule.ID;
                });
                if ($scope.GrabSchedulesToDelete.length) {
                    grabSchedulesPromises = _.map($scope.GrabSchedulesToDelete, function (grabSchedule) {
                        return $http.post('/api/v1/schedules/delete', {ID: grabSchedule.ID});
                    });
                }
                if (newSchedules.length) {
                    grabSchedulesPromises = _.map(newSchedules, function (grabSchedule) {
                        return $http.post('/api/v1/schedules/create', _.assign(grabSchedule, {
                            type: 'grab',
                            parentID: grab.ID,
                            date: moment(grabSchedule.date).format('YYYY-MM-DD')
                        }));
                    });
                }
                grabSchedulesPromises = grabSchedulesPromises || [$q.resolve()];
                var uploadImageFilePromise = $scope.imageFile ? $scope.uploadImageFile($scope.imageFile, grab.ID) : $q.resolve();
                grabSchedulesPromises.push(uploadImageFilePromise);
                return $q.all(grabSchedulesPromises).then(function () {
                    $state.go('app.grab.published', {grabId: grab.ID});
                })
            });
        };

        $scope.cancelUpdateGrab = function () {
            $state.go('app.grabee.dashboard');
        }
        $scope.grabSubmitting = false;
        var submitData = {};
        $scope.submitUpdateGrabForm = function ($event) {
            $scope.grabSubmitting = true;

            if ($scope.updateGrabForm.$invalid) {
                $event.preventDefault();
                angular.forEach($scope.updateGrabForm.$error.required, function (field) {
                    field.$setDirty();
                });
                $scope.grabSubmitting = false;
                return;
            }

            if($scope.AddressSameAsProfile)
                $scope.updateGrab();

            if(!$scope.AddressSameAsProfile  && $scope.NewUserAddress.address)
                $scope.submitNewUserAddressForm();

            $scope.grabSubmitting = false;
        };

        $scope.saveUpdateGrab = function () {
            if($scope.AddressSameAsProfile)
                $scope.updateGrab();

            if(!$scope.AddressSameAsProfile  && $scope.NewUserAddress.address)
                $scope.submitNewUserAddressForm();
        };
}]);
