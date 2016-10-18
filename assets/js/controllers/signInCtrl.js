'use strict';

/**
 * controller for Client Sign In
 */
angular.module('grabApp')
    .controller('SignInCtrl', ['$scope', '$rootScope', '$state', '$http', '$auth', '$window', 'Facebook', 'cfpLoadingBar',
        function ($scope, $rootScope, $state, $http, $auth, $window, Facebook, cfpLoadingBar) {
            var urlLanguage = window.location.hash.split('=');

            if(window.location.hash.indexOf('hl') > -1 && urlLanguage.length > 1){
                var language = urlLanguage[urlLanguage.length - 1];
                
                if(language == 'fr'){
                    language = 'fr_CA';
                }

                $scope.language.set(language);
            }

            $scope.Client = {
                email: '',
                password: ''
            };

            $scope.keepMeSignedIn = true;

            $scope.errors = [];

            $scope.submitSignInForm = function ($event) {
                if ($scope.signInForm.$invalid) {
                    $event.preventDefault();
                    angular.forEach($scope.signInForm.$error.required, function (field) {
                        field.$setDirty();
                    });
                    return;
                }

                cfpLoadingBar.start();
                cfpLoadingBar.inc();

                $scope.signInRequest = true;
                $auth.submitLogin($scope.Client).then(function () {

                }).finally(function () {
                    cfpLoadingBar.complete();
                    $scope.signInRequest = false;
                }).catch(function (resp) {
                    $scope.errors = resp.errors;
                });
            };

            $scope.$watch('keepMeSignedIn', function (newVal) {
                    $window.localStorage.setItem('tokenStorage', (newVal ? 'localStorage' : 'sessionStorage'));
                }
            );

            function login() {
                Facebook.login(function (response) {
                    if (response.status == 'connected') {
                        loginWithFacebookCredentials(response);
                    }
                });
            }

            function loginWithFacebookCredentials(response) {
                return $http.post('/api/v1/user/fb-login', {
                    fbID: response.authResponse.userID,
                    fbToken: response.authResponse.accessToken
                }).success(function (data, status, headers) {
                    $scope.facebookLoginRequest = false;
                    cfpLoadingBar.complete();

                    var authHeaders = $auth.buildAuthHeaders({
                        token: headers()['access-token']
                    });
                    $auth.persistData('auth_headers', authHeaders);

                    var user = data.data;
                    $rootScope.$emit('auth:login-success', user);
                }).error(function () {
                    $state.go('login.registration', {associateUserWithFacebook: true});
                });
            }

            $scope.IntentLogin = function () {
                cfpLoadingBar.start();
                cfpLoadingBar.inc();
                $scope.facebookLoginRequest = true;

                Facebook.getLoginStatus(function (response) {
                    if (response.status == 'connected') {
                        loginWithFacebookCredentials(response);
                    } else {
                        login();
                    }
                });
            };

            $scope.$watch(
                function () {
                    return Facebook.isReady();
                },
                function (newVal) {
                    if (newVal) {
                        $scope.facebookReady = true;
                    }
                }
            );
        }]);
