'use strict';

/**
 * controller for Client Registration
 */
angular.module('grabApp')
    .controller('RegistrationCtrl', ['$scope', '$state', '$stateParams', '$auth', '$uibModal', '$document', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'Facebook', 'cfpLoadingBar', 'SweetAlert', '$translate',
        function ($scope, $state, $stateParams, $auth, $uibModal, $document, GoogleMapApi, uiGmapIsReady, Facebook, cfpLoadingBar, SweetAlert, $translate) {
            window.scope = $scope;
            var roleDefault = 'grabee';

            if(typeof getUrlParameter('hl') !== "undefined"){
                if(getUrlParameter('hl') == 'en'){
                    $scope.language.set('en');
                }

                if(getUrlParameter('hl') == 'fr'){
                    $scope.language.set('fr_CA');
                }
            }

            if(typeof getUrlParameter('role') !== "undefined"){
                roleDefault = getUrlParameter('role'); 
            }
            

            $scope.Client = {
                role: roleDefault,
                email: '',
                password: '',
                passwordConfirmation: '',
                fullName: '',
                address: '',
                zipcode: '',
                city: '',
                region: '',
                country: '',
                latitude: null,
                longitude: null,
                fbID: null,
                fbToken: null,
                agree: false
            };

            GoogleMapApi.then(function (maps) {
                maps.visualRefresh = true;
            });

            //Call when the map loaded
            uiGmapIsReady.promise()                     
            .then(function(instances) {
                console.log(instances,'uiGmapIsReady');
                $('.google-autocomplete-searchbox').keyup(function(){
                    if($(this).val() == ""){
                        _.assign($scope.Client, {
                            address: "",
                            zipcode: "",
                            city: "",
                            region: "",
                            country: ""
                        });
                    }
                })
                                 
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
                },
                searchBox: {
                    template: 'searchbox.tpl.html',
                    events: {
                        place_changed: function (autocomplete) {
                            var place = autocomplete.getPlace();
                            window.autocomplete = autocomplete;
                            window.place = place;
                            // If the place has a geometry location, then present it on a map.
                            if (place.geometry && place.geometry.location) {
                                var location = place.geometry.location;
                                var geolocation = {
                                    latitude: location.lat(),
                                    longitude: location.lng()
                                };

                                _.assign($scope.marker.coords, geolocation);
                                _.assign($scope.Client, geolocation);
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

                                _.assign($scope.Client, {
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

            function assignFacebookCredentials(response) {
                _.assign($scope.Client, {
                    fbID: response.authResponse.userID,
                    fbToken: response.authResponse.accessToken
                });
            }

            function getProfileInfo() {
                Facebook.getLoginStatus(function (response) {
                    if (response.status == 'connected') {
                        assignFacebookCredentials(response);
                        me();
                    } else {
                        login();
                    }
                });
            }

            function login() {
                Facebook.login(function (response) {
                    if (response.status == 'connected') {
                        assignFacebookCredentials(response);
                        me();
                    }
                });
            }

            function me() {
                Facebook.api('/me', {fields: 'name,email'}, function (response) {
                    if (!$scope.Client.email && response.email) {
                        _.assign($scope.Client, {email: response.email});
                    }
                    if (!$scope.Client.fullName && response.name) {
                        _.assign($scope.Client, {fullName: response.name});
                    }

                    $scope.facebookLoginRequest = false;
                    cfpLoadingBar.complete();

                    $document.scrollTopAnimated(0, 600).then(function () {
                        var message = $translate.instant('login_registration_link_with_facebook_alert');
                        var title = $translate.instant('login_registration_title_alert');
                        
                        console.log(message, title);
                        
                        SweetAlert.swal(message, title, "success");
                    });
                });
            }
            
            // Add function to get [language] and [role] when have any Redirect email to the registration page
            function getUrlParameter(param) {
                // var pageURL = decodeURIComponent(window.location.hash.substring(window.location.hash.lastIndexOf("?")+1)),
                var pageURL = window.location.hash.substring(window.location.hash.lastIndexOf("?")+1),
                    urlVariables = pageURL.split('&'),
                    parameterName,
                    i;

                for (i = 0; i < urlVariables.length; i++) {
                    parameterName = urlVariables[i].split('=');

                    if (parameterName[0] === param) {
                        return parameterName[1] === undefined ? true : parameterName[1];
                    }
                }  
            }

            $scope.IntentLogin = IntentLogin;
            function IntentLogin() {
                cfpLoadingBar.start();
                cfpLoadingBar.inc();
                $scope.facebookLoginRequest = true;
                getProfileInfo();
            }

            $scope.$watch(
                function () {
                    return Facebook.isReady();
                },
                function (newVal) {
                    if (newVal) {
                        $scope.facebookReady = true;
                    }

                    if ($stateParams.associateUserWithFacebook) {
                        getProfileInfo();
                    }
                }
            );

            $scope.invalidAttributes = {};

            $scope.submitRegistrationForm = function ($event) {
                if ($scope.registrationForm.$invalid || ($scope.Client.role == "grabee" && $scope.Client.city != "La Prairie")) {
                    $event.preventDefault();
                    angular.forEach($scope.registrationForm.$error.required, function (field) {
                        field.$setDirty();
                    });
                    //[#104] Scroll to first validate error
                    angular.element('input.ng-invalid').first().focus();
                    return;
                }

                if($scope.Client.address) {
                    //#116: I reset token before registration new user
                    $auth.invalidateTokens();

                    //reset invalidAttributes before registration new user
                    $scope.invalidAttributes = {};

                    $auth.submitRegistration($scope.Client)
                        .then(function () {
                            $state.go('login.introduction');
                        })
                        .catch(function (resp) {
                            $scope.invalidAttributes = resp.data.attributes;
                            //Scroll to email field
                            if($scope.invalidAttributes.email){
                                angular.element('input[name="email"]').focus();
                            }
                        });
                }
            };

            $scope.openTerms = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: './assets/views/partials/terms_grabbers_fr.html',
                    // controller: 'AddCardModalCtrl',
                    size: 'me'
                });
            }

            
                    $scope.openTermsGrabbersFr = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: './assets/views/partials/terms_grabbers_fr.html',
                    // controller: 'AddCardModalCtrl',
                    size: 'me'
                });
            }

                 $scope.openTermsGrabbeesEn = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: './assets/views/partials/terms_grabbers_fr.html',
                    // controller: 'AddCardModalCtrl',
                    size: 'me'
                });
            }
                 $scope.openTermsGrabbeesFr = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: './assets/views/partials/terms_users_fr.html',
                    // controller: 'AddCardModalCtrl',
                    size: 'me'
                });
            }
                 $scope.openTermsGrabbeesEn = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: './assets/views/partials/terms_users_fr.html',
                    // controller: 'AddCardModalCtrl',
                    size: 'me'
                });
            }

            /**
             * Indicate whether the geographical area the grabbee is living in is
             * currently supported or note.
             *
             * @param googleGeocodingJsonPayload: JSON payload returned by the Google
             *     Geocoding API.  For more information about the structure of this
             *     JSON payload, refer to the following documentation:
             *
             *          https://developers.google.com/maps/documentation/geocoding/intro#GeocodingResponses
             *
             * @return: ``true`` if the grabbee is located in a currently supported
             *      geographical area, ``false`` otherwise.
             */
            $scope._isGrabbeeAreaSupported = function (googleGeocodingJsonPayload) {
                var results = googleGeocodingJsonPayload["results"];
                if (typeof results === "undefined") {
                    console.log('[DEBUG] No result');
                    return false;
                }

                var resultLength = results.length;
                for (var i = 0; i < resultLength; i++) {
                    var result = results[i];

                    var addressComponents = result["address_components"];
                    if (typeof addressComponents === "undefined") {
                      console.log('[DEBUG] No address components');
                      return false;
                    }

                    // @patch: check whether the address of the grabee is in the suburb of
                    //     Montreal called "La Prairie", which zip code is ``JSR``.
                    for (var addressComponent of addressComponents) {
                      if (addressComponent["long_name"] == "J5R") {
                        return true;
                      }
                    }
                }

                return false;
            }
        }]);
