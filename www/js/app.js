'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
angular.module('Defu', ['ionic', 'config', 'Defu.controllers'])
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('intro', {
            url: '/',
            templateUrl: 'templates/intro.html',
            controller: 'IntroCtrl'
        })
        .state('main', {
            url: '/main',
            templateUrl: 'templates/main.html',
            controller: 'MainCtrl'
        });

    $urlRouterProvider.otherwise('/');

})
    .directive('ukraine', ['$window', '$timeout',
    function ($window, $timeout) {
            return {
                restrict: 'AE',
                scope: {
                    data: '=',
                    label: '@',
                    onClick: '&'
                },
                link: function (scope, ele, attrs) {
                    scope.$root.score = 0;
                    scope.$root.ukraine = [];
                    var mapScale = 4;
                    var mapRatio = .65;
                    var width = parseInt(d3.select('ion-view').style('width'));
                    var height = width * mapRatio;
                    var ukraine = [];

                    var projection = d3.geo.albers()
                        .center([0, 48.5])
                        .rotate([-31.5, 0])
                        .parallels([45, 50])
                        .scale(width * mapScale)
                        .translate([width / 2, (height - 60) / 2]);

                    var color = d3.scale.threshold()
                        .domain([10, 20, 30, 50])
                        .range(['#F7CB6D', '#C4AA73', '#899BAD', '#739AC4', '#2E5C8A'])

                    var svg = d3.select('#map').append('svg')
                        .attr('width', width)
                        .attr('height', height);

                    var countriesPath;
                    var regionsPath;
                    var riversPath;
                    var lakesPath;

                    d3.json('ukraine.json', function (error, data) {
                        var countries = topojson.feature(data, data.objects.countries);

                        countriesPath = d3.geo.path()
                            .projection(projection);

                        svg.selectAll('.country')
                            .data(countries.features)
                            .enter().append('path')
                            .attr('class', 'country')
                            .attr('d', countriesPath)

                        var countryBoundaries = topojson.mesh(data, data.objects.countries,
                            function (a, b) {
                                return a !== b
                            });

                        svg.append('path')
                            .datum(countryBoundaries)
                            .attr('class', 'country-boundary')
                            .attr('d', countriesPath)

                        var regions = topojson.feature(data, data.objects['ukraine-regions']);

                        regionsPath = d3.geo.path()
                            .projection(projection);

                        var region_counter = 0;
                        svg.selectAll('.region')
                            .data(regions.features)
                            .enter().append('path')
                            .attr('class', 'region')
                            .attr('d', regionsPath)
                            .attr('id', function (d) {
                                region_counter++;
                                scope.$root.ukraine.push({
                                    "id": 'r' + region_counter,
                                    "name": d.properties.name,
                                    "invaderVisible": false,
                                    "captured": false
                                });

                                return 'r' + region_counter;
                            })
                            .style('fill', function (d) {
                                return color(d.properties.percent)
                            })


                        var rivers = topojson.feature(data, data.objects['rivers_lake_centerlines']);

                        riversPath = d3.geo.path()
                            .projection(projection);

                        svg.selectAll('.river')
                            .data(rivers.features)
                            .enter().append('path')
                            .attr('class', 'river')
                            .attr('d', riversPath)

                        var lakes = topojson.feature(data, data.objects.lakes);

                        lakesPath = d3.geo.path()
                            .projection(projection);

                        svg.selectAll('.lake')
                            .data(lakes.features)
                            .enter().append('path')
                            .attr('class', 'lake')
                            .attr('d', lakesPath)

                        var ukraineRegionBoundaries = topojson.mesh(data,
                            data.objects['ukraine-regions'], function (a, b) {
                                return a !== b
                            });

                        svg.append('path')
                            .datum(ukraineRegionBoundaries)
                            .attr('d', regionsPath)
                            .attr('class', 'region-boundary')

                        var ukraineBoundaries = topojson.mesh(data,
                            data.objects['ukraine-regions'], function (a, b) {
                                return a === b
                            });

                        svg.append('path')
                            .datum(ukraineBoundaries)
                            .attr('d', regionsPath)
                            .attr('class', 'ukraine-boundary')

                        d3.select(window).on('resize', resize);

                        // move invaders to place
                        $timeout(function () {
                            var invaderRect = document.getElementById('i_example').getBoundingClientRect();
                            var invaderRectWidth = invaderRect.width;
                            var invaderRectHeight = invaderRect.height;

                            for (var j = 1; j < 27; ++j) {
                                var top = document.getElementById('r' + j).getBoundingClientRect().top;
                                var left = document.getElementById('r' + j).getBoundingClientRect().left;
                                var width = document.getElementById('r' + j).getBoundingClientRect().width;
                                var height = document.getElementById('r' + j).getBoundingClientRect().height;
                                var invader = document.getElementById('i' + j);
                                invader.style.top = (top + height / 2 - invaderRectHeight / 2) + 'px';
                                invader.style.left = (left + width / 2 - invaderRectWidth / 2) + 'px';
                                var flag = document.getElementById('f' + j);
                                flag.style.top = (top + height / 2 - invaderRectHeight / 2) + 'px';
                                flag.style.left = (left + width / 2 - invaderRectWidth / 2) + 'px';
                            }
                        }, 600)
                    });

                    function resize() {
                        width = parseInt(d3.select('#map').style('width'));
                        height = width * mapRatio;

                        svg
                            .style('width', width + 'px')
                            .style('height', height + 'px');

                        svg.selectAll('.country,.country-boundary').attr('d', countriesPath);
                        svg.selectAll('.region,.region-boundary,.ukraine-boundary').attr('d', regionsPath);
                        svg.selectAll('.lake').attr('d', lakesPath);
                        svg.selectAll('.river').attr('d', riversPath);

                        projection
                            .scale(width * mapScale)
                            .translate([width / 2, (height - 70) / 2]);
                    }
                }
            }
                }])
    .directive('invader', ['$window', '$timeout', '$ionicGesture',
    function ($window, $timeout, $ionicGesture) {
            return {
                template: '<a data-instantActivate class="circle"><i class="icon ion-bug"></a>',
                restrict: 'AE',
                scope: {
                    data: '=',
                    label: '@'
                },
                link: function (scope, element, attr) {
                    scope.$watch(function () {
                        return element.hasClass('ng-hide')
                    }, function () {
                        if (!element.hasClass('ng-hide')) {
                            if (!element.hasClass('init')) {
                                scope.timer = $timeout(function () {
                                    scope.$root.ukraine[element.attr('id').split('i').pop()].invaderVisible = false;
                                    scope.$root.ukraine[element.attr('id').split('i').pop()].captured = true;
                                }, 2000);
                            } else element.removeClass('init');
                        }
                    });
                    $ionicGesture.on('tap', function () {
                        scope.$root.ukraine[element.attr('id').split('i').pop()].invaderVisible = false;
                        scope.$root.score = scope.$root.score + 10;
                        scope.$root.showInvader;
                        $timeout.cancel(scope.timer);
                    }, element);
                }
            }
}]);