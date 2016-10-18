'use strict';

/**
 * controller for Grabee Settings Payments
 */
angular.module('grabApp').controller('GrabeeSettingsPaymentsCtrl', ['$scope', '$http', '$uibModal', 'GrabI18nCalendarService',
    function ($scope, $http, $uibModal, GrabI18nCalendarService) {
        $scope.Payments = [];

        $scope.getPayments = function () {
            $http.get('/api/v1/user/payment-info').then(function (response) {
                $scope.Payments = response.data.data.payment;
            });
        };
        $scope.getPayments();

        $scope.openAddCardModal = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: './assets/views/partials/add-card-modal.html',
                controller: 'AddCardModalCtrl',
                size: 'lg',
                resolve : {
                    locales: GrabI18nCalendarService.locales
                }
            });

            modalInstance.result.then(function (payment) {
                $scope.Payments.push(payment);
            });
        };

        //Removing the credit card from the grabbee profile
        $scope.deletePayment = function (Payment) {
            $http.delete('/api/v1/user/payment-info', { data: { ID: Payment.ID } }).then(function () {
                _.remove($scope.Payments, { ID: Payment.ID });
            });
        }
    }
]);

angular.module('grabApp').controller('AddCardModalCtrl', ['$scope', '$uibModalInstance', '$http', '$locale', 'locales',
    function ($scope, $uibModalInstance, $http, $locale, locales) {


        $scope.Card = {
            number: '',
            cvv: '',
            expirationDate: ''
        };

        $scope.expirationDateOptions = {
            minMode: 'month'
        };

        $scope.openDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.expirationDateOpened = !$scope.expirationDateOpened;
        };

        $scope.errors = [];
        $scope.addCard = function ($event) {
            if ($scope.addCardForm.$invalid) {
                $event.preventDefault();
                angular.forEach($scope.addCardForm.$error.required, function (field) {
                    field.$setDirty();
                });
                return;
            }

            $http.post('/api/v1/user/payment-info', _.assign($scope.Card, {
                expirationDate: moment($scope.Card.expirationDate).format('MM/YY')
            })).then(function (response) {
                $uibModalInstance.close(response.data.data.payment);
            }).catch(function (response) {
                $scope.errors = [response.data.message];
            });
        };

        $scope.addBillingInfo = function ($event) {
            /*if ($scope.addCardForm.$invalid) {
                $event.preventDefault();
                angular.forEach($scope.addCardForm.$error.required, function (field) {
                    field.$setDirty();
                });
                return;
            }

            $http.post('/api/v1/user/payment-info', _.assign($scope.Card, {
                expirationDate: moment($scope.Card.expirationDate).format('MM/YY')
            })).then(function (response) {
                $uibModalInstance.close(response.data.data.payment);
            }).catch(function (response) {
                $scope.errors = [response.data.message];
            });*/
        };
        
        console.log($scope);
        console.log($uibModalInstance,'Test');
        
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
