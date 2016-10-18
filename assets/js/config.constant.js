'use strict';

/**
 * Config constant
 */
angular.module('grabApp')
    .constant('APP_MEDIAQUERY', {
        'desktopXL': 1200,
        'desktop': 992,
        'tablet': 768,
        'mobile': 480
    });

angular.module('grabApp')
    .constant('JS_REQUIRES', {
        //*** Scripts
        scripts: {
            //*** Javascript Plugins
            'modernizr': ['bower_components/components-modernizr/modernizr.js'],
            'spin': 'bower_components/spin.js/spin.js',

            //*** jQuery Plugins
            'perfect-scrollbar-plugin': ['bower_components/perfect-scrollbar/js/min/perfect-scrollbar.jquery.min.js', 'bower_components/perfect-scrollbar/css/perfect-scrollbar.min.css'],
            'chartjs': 'bower_components/chartjs/Chart.min.js',
            'jquery-sparkline': 'bower_components/jquery.sparkline.build/dist/jquery.sparkline.min.js',
            'ckeditor-plugin': 'bower_components/ckeditor/ckeditor.js',
            'jquery-nestable-plugin': ['bower_components/jquery-nestable/jquery.nestable.js'],
            'touchspin-plugin': ['bower_components/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js', 'bower_components/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],

            //*** Controllers
            'registrationCtrl': 'assets/js/controllers/registrationCtrl.js',
            'signInCtrl': 'assets/js/controllers/signInCtrl.js',
            'forgotPasswordCtrl': 'assets/js/controllers/forgotPasswordCtrl.js',
            'resetPasswordCtrl': 'assets/js/controllers/resetPasswordCtrl.js',
            'grabAbstractCtrl': 'assets/js/controllers/grabAbstractCtrl.js',
            'createGrabCtrl': 'assets/js/controllers/createGrabCtrl.js',
            'updateGrabCtrl': 'assets/js/controllers/updateGrabCtrl.js',
            'viewGrabCtrl': 'assets/js/controllers/viewGrabCtrl.js',
            'grabeeGrabsCtrl': 'assets/js/controllers/grabeeGrabsCtrl.js',
            'grabberDashboardCtrl': 'assets/js/controllers/grabberDashboardCtrl.js',
            'grabberGrabsCtrl': 'assets/js/controllers/grabberGrabsCtrl.js',
            'grabBidCtrl': 'assets/js/controllers/grabBidCtrl.js',
            'grabberBidsCtrl': 'assets/js/controllers/grabberBidsCtrl.js',
            'grabScheduledCtrl': 'assets/js/controllers/grabScheduledCtrl.js',
            'grabCompletedCtrl': 'assets/js/controllers/grabCompletedCtrl.js',
            'grabDeliveredCtrl': 'assets/js/controllers/grabDeliveredCtrl.js',
            'settingsProfileCtrl': 'assets/js/controllers/settingsProfileCtrl.js',
            'settingsAlertsCtrl': 'assets/js/controllers/settingsAlertsCtrl.js',
            'settingsBillingCtrl': 'assets/js/controllers/settingsBillingCtrl.js',
            'grabeeSettingsPaymentsCtrl': 'assets/js/controllers/grabeeSettingsPaymentsCtrl.js',
            'grabberSettingsProfileCtrl': 'assets/js/controllers/grabberSettingsProfileCtrl.js',
            'grabeeGrabberProfileCtrl': 'assets/js/controllers/grabeeGrabberProfileCtrl.js',
            'calendarCtrl': 'assets/js/controllers/calendarCtrl.js',

            //*** Services
            'grabData': 'assets/js/services/grab.data.service.js',
            'grabI18nCalendarService': 'assets/js/services/grab.i18n.calendar.service.js',

            //*** Filters
            'htmlToPlaintext': 'assets/js/filters/htmlToPlaintext.js'
        },
        //*** angularJS Modules
        modules: [{
            name: 'toaster',
            files: ['bower_components/AngularJS-Toaster/toaster.js', 'bower_components/AngularJS-Toaster/toaster.css']
        }, {
            name: 'angularBootstrapNavTree',
            files: ['bower_components/angular-bootstrap-nav-tree/dist/abn_tree_directive.js', 'bower_components/angular-bootstrap-nav-tree/dist/abn_tree.css']
        }, {
            name: 'ngTable',
            files: ['bower_components/ng-table/dist/ng-table.min.js', 'bower_components/ng-table/dist/ng-table.min.css']
        }, {
            name: 'ui.mask',
            files: ['bower_components/angular-ui-utils/mask.min.js']
        }, {
            name: 'ngImgCrop',
            files: ['bower_components/ngImgCrop/compile/minified/ng-img-crop.js', 'bower_components/ngImgCrop/compile/minified/ng-img-crop.css']
        }, {
            name: 'angularFileUpload',
            files: ['bower_components/angular-file-upload/angular-file-upload.min.js']
        }, {
            name: 'ngAside',
            files: ['bower_components/angular-aside/dist/js/angular-aside.min.js', 'bower_components/angular-aside/dist/css/angular-aside.min.css']
        }, {
            name: 'truncate',
            files: ['bower_components/angular-truncate/src/truncate.js']
        }, {
            name: 'monospaced.elastic',
            files: ['bower_components/angular-elastic/elastic.js']
        }, {
            name: 'tc.chartjs',
            files: ['bower_components/tc-angular-chartjs/dist/tc-angular-chartjs.min.js']
        }, {
            name: 'uiSwitch',
            files: ['bower_components/angular-ui-switch/angular-ui-switch.min.js', 'bower_components/angular-ui-switch/angular-ui-switch.min.css']
        }, {
            name: 'ckeditor',
            files: ['bower_components/angular-ckeditor/angular-ckeditor.min.js']
        }, {
            name: 'ng-nestable',
            files: ['bower_components/ng-nestable/src/angular-nestable.js']
        }, {
            name: 'vAccordion',
            files: ['bower_components/v-accordion/dist/v-accordion.min.js', 'bower_components/v-accordion/dist/v-accordion.min.css']
        }, {
            name: 'xeditable',
            files: ['bower_components/angular-xeditable/dist/js/xeditable.min.js', 'bower_components/angular-xeditable/dist/css/xeditable.css', 'assets/js/config/config-xeditable.js']
        }, {
            name: 'checklist-model',
            files: ['bower_components/checklist-model/checklist-model.js']
        }, {
            name: 'angular-notification-icons',
            files: ['bower_components/angular-notification-icons/dist/angular-notification-icons.min.js', 'bower_components/angular-notification-icons/dist/angular-notification-icons.min.css']
        }]
    });
