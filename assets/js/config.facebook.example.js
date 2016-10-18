'use strict';

angular.module('grabApp')
    .config(function (FacebookProvider) {
        FacebookProvider.init({
            appId: 'YOUR_APP_ID',
            xfbml: true,
            version: 'v2.6'
        });
    });
