'use strict';

/**
 * controller for Grabber Settings Alerts
 */
angular.module('grabApp').controller('SettingsAlertsCtrl', ['$scope', '$state', '$http', '$q', 'cfpLoadingBar',
    function ($scope, $state, $http, $q, cfpLoadingBar) {
        $scope.Alerts = {
            messages: {
                smsAlert: 0,
                emailAlert: 0,
                nativeAlert: 0
            },
            booking: {
                smsAlert: 0,
                emailAlert: 0,
                nativeAlert: 0
            },
            calendar: {
                smsAlert: 0,
                emailAlert: 0,
                nativeAlert: 0
            }
        };

        getAlerts();
        function getAlerts() {
            return $http.get('/api/v1/alerts/view').then(function (response) {
                var alerts = response.data.data;

                _(alerts).forEach(function (alert) {
                    _.assign($scope.Alerts[alert.type], _.pick(alert, ['smsAlert', 'emailAlert', 'nativeAlert']))
                });
            });
        }

        $scope.isSubmitting = false;
        $scope.submitAlertsForm = function () {
            cfpLoadingBar.start();
            cfpLoadingBar.inc();
            
            $scope.isSubmitting = true;

            var alertsPromises = [];
            _($scope.Alerts).forOwn(function (value, key) {
                alertsPromises.push($http.post('/api/v1/alerts/permissions', _.assign({type: key}, value)));
            });

            $q.all(alertsPromises).finally(function () {
                cfpLoadingBar.complete();
                $scope.isSubmitting = false;
            });
        };
    }]);
