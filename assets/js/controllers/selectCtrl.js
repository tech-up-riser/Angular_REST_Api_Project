'use strict';
/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs a AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform a OR.
 */
angular.module('grabApp')
    .filter('propsFilter', function () {
        return function (items, props) {
            var out = [];

            if (angular.isArray(items)) {
                items.forEach(function (item) {
                    var itemMatches = false;

                    var keys = Object.keys(props);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    });

angular.module('grabApp')
    .controller('SelectCtrl', ["$scope", "$http", "$timeout", function ($scope, $http, $timeout) {
        $scope.disabled = undefined;
        $scope.searchEnabled = undefined;

        $scope.enable = function () {
            $scope.disabled = false;
        };

        $scope.disable = function () {
            $scope.disabled = true;
        };

        $scope.enableSearch = function () {
            $scope.searchEnabled = true;
        }

        $scope.disableSearch = function () {
            $scope.searchEnabled = false;
        }

        $scope.clear = function () {
            $scope.person.selected = undefined;
            $scope.address.selected = undefined;
            $scope.country.selected = undefined;
        };

        $scope.someGroupFn = function (item) {

            if (item.name[0] >= 'A' && item.name[0] <= 'M')
                return 'From A - M';

            if (item.name[0] >= 'N' && item.name[0] <= 'Z')
                return 'From N - Z';

        };

        $scope.personAsync = {selected: "wladimir@email.com"};
        $scope.peopleAsync = [];

        $timeout(function () {
            $scope.peopleAsync = [
                {name: 'Adam', email: 'adam@email.com', age: 12, country: 'United States'},
                {name: 'Amalie', email: 'amalie@email.com', age: 12, country: 'Argentina'},
                {name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina'},
                {name: 'Adrian', email: 'adrian@email.com', age: 21, country: 'Ecuador'},
                {name: 'Wladimir', email: 'wladimir@email.com', age: 30, country: 'Ecuador'},
                {name: 'Samantha', email: 'samantha@email.com', age: 30, country: 'United States'},
                {name: 'Nicole', email: 'nicole@email.com', age: 43, country: 'Colombia'},
                {name: 'Natasha', email: 'natasha@email.com', age: 54, country: 'Ecuador'},
                {name: 'Michael', email: 'michael@email.com', age: 15, country: 'Colombia'},
                {name: 'Nicolás', email: 'nicole@email.com', age: 43, country: 'Colombia'}
            ];
        }, 3000);

        $scope.counter = 0;
        $scope.someFunction = function (item, model) {
            $scope.counter++;
            $scope.eventResult = {item: item, model: model};
        };

        $scope.removed = function (item, model) {
            $scope.lastRemoved = {
                item: item,
                model: model
            };
        };

        $scope.tagTransform = function (newTag) {
            var item = {
                name: newTag,
                email: newTag + '@email.com',
                age: 'unknown',
                country: 'unknown'
            };

            return item;
        };

        $scope.person = {};
        $scope.people = [
            {
                name: 'ÉQUIPEMENTS ÉLECTRONIQUES',
                email: 'Télé ancienne, radio ou autre',
                age: 12,
                country: 'United States'
            },
            {name: 'INFORMATIQUE', email: 'vieux ordinateurs', age: 12, country: 'Argentina'},
            {name: 'MOBILIER', email: 'Sofa,Table etc', age: 21, country: 'Argentina'},
            {name: 'MATÉRIAUX DE CONSTRUCTION', email: 'bois, métal, brique', age: 21, country: 'Ecuador'},
            {name: 'ÉQUIPEMENT DE SPORT', email: 'Vélos exerciseurs, tapis roulant', age: 30, country: 'Ecuador'},
            {name: 'ÉQUIPEMENT MÉDICAL', email: 'lits médicals, Bonbonne oxygène', age: 30, country: 'United States'},
            {name: 'MATÉRIEL LOURD', email: 'Vieille chaudière, brique etc', age: 43, country: 'Colombia'},
            {name: 'DÉCHETS DANGEREUX', email: 'peinture, baterie,scellant', age: 54, country: 'Ecuador'},
            {name: 'VÉHICULES & PIÈCES', email: 'auto pour scrap, piece d\'auto', age: 15, country: 'Colombia'},
            {name: 'ÉLECTROMÉNAGERS', email: 'laveuse, sécheuse', age: 15, country: 'Colombia'},
            {
                name: 'PIÈCES INDUSTRIELLES',
                email: 'vieux gaufrier, autres pièces importantes',
                age: 43,
                country: 'Colombia'
            }
        ];

        $scope.category = {};
        $scope.categories = [
            {
                name: 'ÉQUIPEMENTS ÉLECTRONIQUES',
                sub: [{
                    name: 'Télé'
                }, {
                    name: 'Radio'
                }, {
                    name: 'Instrument'
                }, {
                    name: 'Pièces et accessoires'
                }, {
                    name: 'Autres'
                }]
            },
            {
                name: 'ORDINATEURS',
                sub: [{
                    name: 'Périphériques'
                }, {
                    name: 'Pièces diverses'
                }, {
                    name: 'Écrans'
                }, {
                    name: 'Autres'
                }]
            },
            {
                name: 'MOBILIER',
                sub: [{
                    name: 'Sofa, divan'
                }, {
                    name: 'lit'
                }, {
                    name: 'commode'
                }, {
                    name: 'bureau'
                }, {
                    name: 'Ensemble de salle a manger'
                }, {
                    name: 'table'
                }, {
                    name: 'mobilier de jardin'
                }, {
                    name: 'électroménagers'
                }]
            },
            {
                name: 'MATÉRIAUX de CONSTRUCTION',
                sub: [{
                    name: 'Bois'
                }, {
                    name: 'Brique'
                }, {
                    name: 'Béton'
                }, {
                    name: 'Matériaux sèches'
                }, {
                    name: 'Fer'
                }, {
                    name: 'métal'
                }, {
                    name: 'Tuiles'
                }, {
                    name: 'Céramiques'
                }, {
                    name: 'plastiques'
                }, {
                    name: 'Composites'
                }, {
                    name: 'Autre'
                }]
            },
            {
                name: 'ÉQUIPEMENT de SPORTS',
                sub: [{
                    name: 'Exerciseur'
                }, {
                    name: 'Matériel sportif'
                }, {
                    name: 'tapis roulant'
                }, {
                    name: 'Autre'
                }]
            },
            {
                name: 'ÉQUIPEMENT MÉDICAL',
                sub: [{
                    name: "Bonbonne d'oxygène"
                }, {
                    name: 'Lit médical'
                }, {
                    name: 'Matériel et outils'
                }, {
                    name: 'Machinerie complexe'
                }, {
                    name: 'Autre'
                }]
            },
            {
                name: 'MATÉRIEL LOURD',
                sub: [{
                    name: 'Equipement lourd'
                }, {
                    name: 'Chaudière'
                }, {
                    name: 'Réservoir huile'
                }, {
                    name: 'Pièces'
                }, {
                    name: 'Brique'
                }, {
                    name: 'Autre'
                }]
            },
            {
                name: 'DÉCHETS DANGEREUX',
                sub: [{
                    name: 'Peinture'
                }, {
                    name: 'Scellant'
                }, {
                    name: 'Batterie'
                }, {
                    name: 'Autre'
                }]
            },
            {
                name: 'VÉHICULES &N PIÈCES',
                sub: [{
                    name: 'Auto complète'
                }, {
                    name: 'Pièces précises'
                }, {
                    name: 'Autre'
                }]
            },
            ,
            {
                name: 'ÉLECTROMÉNAGERS',
                sub: [{
                    name: 'Laveuse'
                }, {
                    name: 'Sécheuse'
                }, {
                    name: 'Frigidaire'
                }, {
                    name: 'lave-vaisselle'
                }, {
                    name: 'Cellier'
                }, {
                    name: 'Autre'
                }]
            },
            {
                name: 'PIÈCES INDUSTRIELLES',
                sub: [{
                    name: 'Machinerie'
                }, {
                    name: 'véhicules légers'
                }, {
                    name: 'moteur'
                }, {
                    name: 'Autre'
                }]
            }
        ];

        $scope.bucketsizes = [
            {name: 'Small', email: '10 feet X 12 feet | 1200$', age: 12, country: 'United States'},
            {name: 'Large', email: '10 feet X 14 feet | 1400$', age: 12, country: 'United States'},
            {name: 'Extra Large', email: '12 feet X 16 feet | 1600$', age: 12, country: 'United States'},
            {name: 'Extra Extra Large', email: '14 feet X 16 feet | 2000$', age: 12, country: 'United States'}
        ];

        $scope.grabtypes = ['Grab', 'Container', 'Pickup'];
        $scope.grabtypesSelected = ['Grab', 'Container', 'Pickup'];
        $scope.categories2 = ['ÉQUIPEMENTS ÉLECTRONIQUES', 'ORDINATEURS', 'MOBILIER', 'MATÉRIAUX de CONSTRUCTION', 'ÉQUIPEMENT de SPORTS', 'ÉQUIPEMENT MÉDICAL', 'MATÉRIEL LOURD', 'DÉCHETS DANGEREUX', 'VÉHICULES &N PIÈCES', 'ÉLECTROMÉNAGERS', 'PIÈCES INDUSTRIELLES'];
        $scope.subcategories2 = ['Equipement lourd', 'Chaudière', 'Réservoir huile', 'Pièces', 'Brique', 'Autre'];
        $scope.categoriesSelected = ['ÉQUIPEMENTS ÉLECTRONIQUES', 'MOBILIER', 'MATÉRIEL LOURD'];
        $scope.subcategoriesSelected = ['Chaudière', 'Réservoir huile'];
        $scope.serviceareas = ['Westmount', 'Ville-Marie', 'Notre Dame De Grace', 'Mount Royal', 'Outremont'];
        $scope.serviceareasSelected = ['Notre Dame de Grace', 'Westmount'];
        ;

        $scope.multipleDemo = {};
        $scope.multipleDemo.colors = ['ORDINATEURS', 'MOBILIER'];
        $scope.multipleDemo.colors2 = ['Blue', 'Red'];
        $scope.multipleDemo.selectedPeople = [$scope.people[5], $scope.people[4]];
        $scope.multipleDemo.selectedPeople2 = $scope.multipleDemo.selectedPeople;
        $scope.multipleDemo.selectedPeopleWithGroupBy = [$scope.people[8], $scope.people[6]];
        $scope.multipleDemo.selectedPeopleSimple = ['samantha@email.com', 'wladimir@email.com'];


        $scope.address = {};
        $scope.refreshAddresses = function (address) {
            var params = {address: address, sensor: false};
            return $http.get(
                'http://maps.googleapis.com/maps/api/geocode/json',
                {params: params}
            ).then(function (response) {
                $scope.addresses = response.data.results;
            });
        };

        $scope.country = {};
        $scope.countries = [ // Taken from https://gist.github.com/unceus/6501985
            {name: 'Afghanistan', code: 'AF'},
            {name: 'Åland Islands', code: 'AX'},
            {name: 'Albania', code: 'AL'},
            {name: 'Algeria', code: 'DZ'},
            {name: 'American Samoa', code: 'AS'},
            {name: 'Andorra', code: 'AD'},
            {name: 'Angola', code: 'AO'},
            {name: 'Anguilla', code: 'AI'},
            {name: 'Antarctica', code: 'AQ'},
            {name: 'Antigua and Barbuda', code: 'AG'},
            {name: 'Argentina', code: 'AR'},
            {name: 'Armenia', code: 'AM'},
            {name: 'Aruba', code: 'AW'},
            {name: 'Australia', code: 'AU'},
            {name: 'Austria', code: 'AT'},
            {name: 'Azerbaijan', code: 'AZ'},
            {name: 'Bahamas', code: 'BS'},
            {name: 'Bahrain', code: 'BH'},
            {name: 'Bangladesh', code: 'BD'},
            {name: 'Barbados', code: 'BB'},
            {name: 'Belarus', code: 'BY'},
            {name: 'Belgium', code: 'BE'},
            {name: 'Belize', code: 'BZ'},
            {name: 'Benin', code: 'BJ'},
            {name: 'Bermuda', code: 'BM'},
            {name: 'Bhutan', code: 'BT'},
            {name: 'Bolivia', code: 'BO'},
            {name: 'Bosnia and Herzegovina', code: 'BA'},
            {name: 'Botswana', code: 'BW'},
            {name: 'Bouvet Island', code: 'BV'},
            {name: 'Brazil', code: 'BR'},
            {name: 'British Indian Ocean Territory', code: 'IO'},
            {name: 'Brunei Darussalam', code: 'BN'},
            {name: 'Bulgaria', code: 'BG'},
            {name: 'Burkina Faso', code: 'BF'},
            {name: 'Burundi', code: 'BI'},
            {name: 'Cambodia', code: 'KH'},
            {name: 'Cameroon', code: 'CM'},
            {name: 'Canada', code: 'CA'},
            {name: 'Cape Verde', code: 'CV'},
            {name: 'Cayman Islands', code: 'KY'},
            {name: 'Central African Republic', code: 'CF'},
            {name: 'Chad', code: 'TD'},
            {name: 'Chile', code: 'CL'},
            {name: 'China', code: 'CN'},
            {name: 'Christmas Island', code: 'CX'},
            {name: 'Cocos (Keeling) Islands', code: 'CC'},
            {name: 'Colombia', code: 'CO'},
            {name: 'Comoros', code: 'KM'},
            {name: 'Congo', code: 'CG'},
            {name: 'Congo, The Democratic Republic of the', code: 'CD'},
            {name: 'Cook Islands', code: 'CK'},
            {name: 'Costa Rica', code: 'CR'},
            {name: 'Cote D\'Ivoire', code: 'CI'},
            {name: 'Croatia', code: 'HR'},
            {name: 'Cuba', code: 'CU'},
            {name: 'Cyprus', code: 'CY'},
            {name: 'Czech Republic', code: 'CZ'},
            {name: 'Denmark', code: 'DK'},
            {name: 'Djibouti', code: 'DJ'},
            {name: 'Dominica', code: 'DM'},
            {name: 'Dominican Republic', code: 'DO'},
            {name: 'Ecuador', code: 'EC'},
            {name: 'Egypt', code: 'EG'},
            {name: 'El Salvador', code: 'SV'},
            {name: 'Equatorial Guinea', code: 'GQ'},
            {name: 'Eritrea', code: 'ER'},
            {name: 'Estonia', code: 'EE'},
            {name: 'Ethiopia', code: 'ET'},
            {name: 'Falkland Islands (Malvinas)', code: 'FK'},
            {name: 'Faroe Islands', code: 'FO'},
            {name: 'Fiji', code: 'FJ'},
            {name: 'Finland', code: 'FI'},
            {name: 'France', code: 'FR'},
            {name: 'French Guiana', code: 'GF'},
            {name: 'French Polynesia', code: 'PF'},
            {name: 'French Southern Territories', code: 'TF'},
            {name: 'Gabon', code: 'GA'},
            {name: 'Gambia', code: 'GM'},
            {name: 'Georgia', code: 'GE'},
            {name: 'Germany', code: 'DE'},
            {name: 'Ghana', code: 'GH'},
            {name: 'Gibraltar', code: 'GI'},
            {name: 'Greece', code: 'GR'},
            {name: 'Greenland', code: 'GL'},
            {name: 'Grenada', code: 'GD'},
            {name: 'Guadeloupe', code: 'GP'},
            {name: 'Guam', code: 'GU'},
            {name: 'Guatemala', code: 'GT'},
            {name: 'Guernsey', code: 'GG'},
            {name: 'Guinea', code: 'GN'},
            {name: 'Guinea-Bissau', code: 'GW'},
            {name: 'Guyana', code: 'GY'},
            {name: 'Haiti', code: 'HT'},
            {name: 'Heard Island and Mcdonald Islands', code: 'HM'},
            {name: 'Holy See (Vatican City State)', code: 'VA'},
            {name: 'Honduras', code: 'HN'},
            {name: 'Hong Kong', code: 'HK'},
            {name: 'Hungary', code: 'HU'},
            {name: 'Iceland', code: 'IS'},
            {name: 'India', code: 'IN'},
            {name: 'Indonesia', code: 'ID'},
            {name: 'Iran, Islamic Republic Of', code: 'IR'},
            {name: 'Iraq', code: 'IQ'},
            {name: 'Ireland', code: 'IE'},
            {name: 'Isle of Man', code: 'IM'},
            {name: 'Israel', code: 'IL'},
            {name: 'Italy', code: 'IT'},
            {name: 'Jamaica', code: 'JM'},
            {name: 'Japan', code: 'JP'},
            {name: 'Jersey', code: 'JE'},
            {name: 'Jordan', code: 'JO'},
            {name: 'Kazakhstan', code: 'KZ'},
            {name: 'Kenya', code: 'KE'},
            {name: 'Kiribati', code: 'KI'},
            {name: 'Korea, Democratic People\'s Republic of', code: 'KP'},
            {name: 'Korea, Republic of', code: 'KR'},
            {name: 'Kuwait', code: 'KW'},
            {name: 'Kyrgyzstan', code: 'KG'},
            {name: 'Lao People\'s Democratic Republic', code: 'LA'},
            {name: 'Latvia', code: 'LV'},
            {name: 'Lebanon', code: 'LB'},
            {name: 'Lesotho', code: 'LS'},
            {name: 'Liberia', code: 'LR'},
            {name: 'Libyan Arab Jamahiriya', code: 'LY'},
            {name: 'Liechtenstein', code: 'LI'},
            {name: 'Lithuania', code: 'LT'},
            {name: 'Luxembourg', code: 'LU'},
            {name: 'Macao', code: 'MO'},
            {name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK'},
            {name: 'Madagascar', code: 'MG'},
            {name: 'Malawi', code: 'MW'},
            {name: 'Malaysia', code: 'MY'},
            {name: 'Maldives', code: 'MV'},
            {name: 'Mali', code: 'ML'},
            {name: 'Malta', code: 'MT'},
            {name: 'Marshall Islands', code: 'MH'},
            {name: 'Martinique', code: 'MQ'},
            {name: 'Mauritania', code: 'MR'},
            {name: 'Mauritius', code: 'MU'},
            {name: 'Mayotte', code: 'YT'},
            {name: 'Mexico', code: 'MX'},
            {name: 'Micronesia, Federated States of', code: 'FM'},
            {name: 'Moldova, Republic of', code: 'MD'},
            {name: 'Monaco', code: 'MC'},
            {name: 'Mongolia', code: 'MN'},
            {name: 'Montserrat', code: 'MS'},
            {name: 'Morocco', code: 'MA'},
            {name: 'Mozambique', code: 'MZ'},
            {name: 'Myanmar', code: 'MM'},
            {name: 'Namibia', code: 'NA'},
            {name: 'Nauru', code: 'NR'},
            {name: 'Nepal', code: 'NP'},
            {name: 'Netherlands', code: 'NL'},
            {name: 'Netherlands Antilles', code: 'AN'},
            {name: 'New Caledonia', code: 'NC'},
            {name: 'New Zealand', code: 'NZ'},
            {name: 'Nicaragua', code: 'NI'},
            {name: 'Niger', code: 'NE'},
            {name: 'Nigeria', code: 'NG'},
            {name: 'Niue', code: 'NU'},
            {name: 'Norfolk Island', code: 'NF'},
            {name: 'Northern Mariana Islands', code: 'MP'},
            {name: 'Norway', code: 'NO'},
            {name: 'Oman', code: 'OM'},
            {name: 'Pakistan', code: 'PK'},
            {name: 'Palau', code: 'PW'},
            {name: 'Palestinian Territory, Occupied', code: 'PS'},
            {name: 'Panama', code: 'PA'},
            {name: 'Papua New Guinea', code: 'PG'},
            {name: 'Paraguay', code: 'PY'},
            {name: 'Peru', code: 'PE'},
            {name: 'Philippines', code: 'PH'},
            {name: 'Pitcairn', code: 'PN'},
            {name: 'Poland', code: 'PL'},
            {name: 'Portugal', code: 'PT'},
            {name: 'Puerto Rico', code: 'PR'},
            {name: 'Qatar', code: 'QA'},
            {name: 'Reunion', code: 'RE'},
            {name: 'Romania', code: 'RO'},
            {name: 'Russian Federation', code: 'RU'},
            {name: 'Rwanda', code: 'RW'},
            {name: 'Saint Helena', code: 'SH'},
            {name: 'Saint Kitts and Nevis', code: 'KN'},
            {name: 'Saint Lucia', code: 'LC'},
            {name: 'Saint Pierre and Miquelon', code: 'PM'},
            {name: 'Saint Vincent and the Grenadines', code: 'VC'},
            {name: 'Samoa', code: 'WS'},
            {name: 'San Marino', code: 'SM'},
            {name: 'Sao Tome and Principe', code: 'ST'},
            {name: 'Saudi Arabia', code: 'SA'},
            {name: 'Senegal', code: 'SN'},
            {name: 'Serbia and Montenegro', code: 'CS'},
            {name: 'Seychelles', code: 'SC'},
            {name: 'Sierra Leone', code: 'SL'},
            {name: 'Singapore', code: 'SG'},
            {name: 'Slovakia', code: 'SK'},
            {name: 'Slovenia', code: 'SI'},
            {name: 'Solomon Islands', code: 'SB'},
            {name: 'Somalia', code: 'SO'},
            {name: 'South Africa', code: 'ZA'},
            {name: 'South Georgia and the South Sandwich Islands', code: 'GS'},
            {name: 'Spain', code: 'ES'},
            {name: 'Sri Lanka', code: 'LK'},
            {name: 'Sudan', code: 'SD'},
            {name: 'Suriname', code: 'SR'},
            {name: 'Svalbard and Jan Mayen', code: 'SJ'},
            {name: 'Swaziland', code: 'SZ'},
            {name: 'Sweden', code: 'SE'},
            {name: 'Switzerland', code: 'CH'},
            {name: 'Syrian Arab Republic', code: 'SY'},
            {name: 'Taiwan, Province of China', code: 'TW'},
            {name: 'Tajikistan', code: 'TJ'},
            {name: 'Tanzania, United Republic of', code: 'TZ'},
            {name: 'Thailand', code: 'TH'},
            {name: 'Timor-Leste', code: 'TL'},
            {name: 'Togo', code: 'TG'},
            {name: 'Tokelau', code: 'TK'},
            {name: 'Tonga', code: 'TO'},
            {name: 'Trinidad and Tobago', code: 'TT'},
            {name: 'Tunisia', code: 'TN'},
            {name: 'Turkey', code: 'TR'},
            {name: 'Turkmenistan', code: 'TM'},
            {name: 'Turks and Caicos Islands', code: 'TC'},
            {name: 'Tuvalu', code: 'TV'},
            {name: 'Uganda', code: 'UG'},
            {name: 'Ukraine', code: 'UA'},
            {name: 'United Arab Emirates', code: 'AE'},
            {name: 'United Kingdom', code: 'GB'},
            {name: 'United States', code: 'US'},
            {name: 'United States Minor Outlying Islands', code: 'UM'},
            {name: 'Uruguay', code: 'UY'},
            {name: 'Uzbekistan', code: 'UZ'},
            {name: 'Vanuatu', code: 'VU'},
            {name: 'Venezuela', code: 'VE'},
            {name: 'Vietnam', code: 'VN'},
            {name: 'Virgin Islands, British', code: 'VG'},
            {name: 'Virgin Islands, U.S.', code: 'VI'},
            {name: 'Wallis and Futuna', code: 'WF'},
            {name: 'Western Sahara', code: 'EH'},
            {name: 'Yemen', code: 'YE'},
            {name: 'Zambia', code: 'ZM'},
            {name: 'Zimbabwe', code: 'ZW'}
        ];
    }]);