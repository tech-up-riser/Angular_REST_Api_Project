'use strict';
/**
 * format input phone numder (XXX) XXX-XXXX
 */
angular.module('grabApp').directive('phoneFormatter', [function () {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                var transformedInput = inputValue.trim().replace(/[^0-9]/gi, '');
                modelCtrl.$setViewValue(transformedInput);
                modelCtrl.$render();
                return transformedInput;         
            });
            modelCtrl.$render = function() {
                var prefix, number, suffix, result;
                prefix = modelCtrl.$viewValue.slice(0, 3);
                number = modelCtrl.$viewValue.slice(3, 6);
                suffix = modelCtrl.$viewValue.slice(6, 10);
                if (!number) {
                    result = modelCtrl.$viewValue;
                } else {
                    result = '(' + prefix + ') ' + number;
                }
                if (suffix) {
                    result = '(' + prefix + ') ' + number + '-' + suffix;
                }
                element.val(result);
            }
        }
    };
}]);