var app = angular.module('grabApp', ['grab']);

// translate config
angular.module('grabApp')
    .config(['$translateProvider', function ($translateProvider) {
        // prefix and suffix information  is required to specify a pattern
        // You can simply use the static-files loader with this pattern:
        $translateProvider.useStaticFilesLoader({
            prefix: 'assets/i18n/',
            suffix: '.json'
        });

        // Since you've now registered more then one translation table, angular-translate has to know which one to use.
        // This is where preferredLanguage(langKey) comes in.
        $translateProvider.preferredLanguage('fr_CA');

        // Store the language in the local storage
        $translateProvider.useLocalStorage();

        // Enable sanitize
        $translateProvider.useSanitizeValueStrategy('escaped');
    }]);

// Angular-Loading-Bar configuration
angular.module('grabApp')
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeBar = true;
        cfpLoadingBarProvider.includeSpinner = true;
    }]);

// angular-ladda configuration
angular.module('grabApp')
    .config(['laddaProvider', function (laddaProvider) {
        laddaProvider.setOption({
            style: 'expand-right',
            spinnerSize: 20,
            spinnerColor: '#ffffff'
        });
    }]);

// angular-bootstrap-calendar configuration
angular.module('grabApp')
    .config(['calendarConfig', function (calendarConfig) {
        calendarConfig.dateFormatter = 'moment';

        calendarConfig.allDateFormats.moment.date.hour = 'HH:mm';

        calendarConfig.allDateFormats.moment.title.day = 'ddd D MMM';

        calendarConfig.i18nStrings.weekNumber = 'Week {week}';
    }]);

angular.module('grabApp')
    .run(['$rootScope', '$state', '$stateParams', 'HumanizeTime',
        function ($rootScope, $state, $stateParams, HumanizeTime) {
            // Attach Fastclick for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers
            //FastClick.attach(document.body);

            // Set some reference to access them from any scope
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            // GLOBAL APP SCOPE
            // set below basic information
            $rootScope.app = {
                name: 'GRAB', // name of your project
                author: 'Alex Dankoff', // author's name or company name
                description: 'Angular Bootstrap GRAB', // brief description
                version: '1.0', // current version
                year: ((new Date()).getFullYear()), // automatic current year (for copyright information)
                isMobile: (function () {// true if the browser is a mobile device
                    var check = false;
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        check = true;
                    }
                    return check;
                })(),
                layout: {
                    isNavbarFixed: true, //true if you want to initialize the template with fixed header
                    isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
                    isSidebarClosed: false, // true if you want to initialize the template with closed sidebar
                    isFooterFixed: true, // true if you want to initialize the template with fixed footer
                    logo: 'assets/images/logo.png' // relative path of the project logo
                }
            };

            $rootScope.lodash = _;
            $rootScope.moment = moment;
            $rootScope.HumanizeTime = HumanizeTime;
        }]);

