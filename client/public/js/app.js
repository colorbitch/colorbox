define(['angular-route', 'angular-animate', 'js/common'], function(){
    var app = angular.module('index', ['ngRoute', 'ngAnimate', 'common']);
    var config = {
        defaultRoutePath: '/',
        routes: {
            '/': {
                title: '桌面',
                templateUrl: 'index.html',
                controller: 'desktopCtrl',
                dependencies: ['js/index', 'js/dashboard-apps']
            },
            '/login': {
                title: '登录',
                templateUrl: 'login.html',
                controller: 'loginCtrl',
                dependencies: ['js/login']
            },
            '/register': {
                title: '注册',
                templateUrl: 'register.html',
                controller: 'registerCtrl',
                dependencies: ['js/login']
            },
            '/app-list': {
                title: '所有应用',
                templateUrl: 'app-all.html',
                controller: 'appListCtrl',
                dependencies: ['js/app-list', 'js/dashboard-apps']
            },
            '/snippets-square': {
                title: '代码广场',
                templateUrl: 'snippets-square.html',
                controller: 'snippetsSquareCtrl',
                dependencies: ['js/snippets-square', 'js/dashboard-snippets']
            },
            '/dashboard/:tab': {
                title: '我的仪表盘',
                templateUrl: 'dashboard.html',
                controller: 'dashboardCtrl',
                dependencies: ['js/dashboard', 'js/dashboard-apps', 'js/dashboard-snippets']
            },
            '/message-board': {
                title: '留言板',
                templateUrl: 'message.html',
                controller: 'messageCtrl',
                dependencies: ['js/message']
            },
            '/edit/app/:id': {
                title: '编辑应用',
                templateUrl: 'edit-app.html',
                controller: 'editAppCtrl',
                dependencies: ['js/edit-app', 'js/dashboard', 'directive/resize']
            },
            '/edit/snippet/:id': {
                title: '编辑代码片段',
                templateUrl: 'edit-snippet.html',
                controller: 'editSnippetCtrl',
                dependencies: ['js/edit-snippet', 'js/dashboard', 'directive/resize']
            }
        }
    };

    app.config(
    [
        '$routeProvider',
        '$locationProvider',
        '$controllerProvider',
        '$compileProvider',
        '$filterProvider',
        '$provide',

        function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide){
            app.controller = bind($controllerProvider, 'register', app);
            app.directive  = bind($compileProvider, 'directive', app);
            app.filter     = bind($filterProvider, 'register', app);
            app.factory    = bind($provide, 'factory', app);
            app.service    = bind($provide, 'service' ,app);

//             $locationProvider.html5Mode(true);

            if(config.routes !== undefined){
                angular.forEach(config.routes, function(route, path){
                    $routeProvider.when(path, {templateUrl:route.templateUrl, resolve:dependencyResolverFor(route.dependencies), controller: route.controller, title: route.title});
                });
            }

            if(config.defaultRoutePaths !== undefined){
                $routeProvider.otherwise({redirectTo:config.defaultRoutePaths});
            }

            function bind(context, name, r){
                return function(){
                    context[name].apply(context, arguments);
                    return r;
                }
            }

            function dependencyResolverFor(dependencies){
                var definition = {
                    resolver: ['$q','$rootScope', function($q, $rootScope){
                        var deferred = $q.defer();

                        require(dependencies, function(){
                            $rootScope.$apply(function(){
                                deferred.resolve();
                            });
                        });

                        return deferred.promise;
                    }]
                }

                return definition;
            }
        }
    ]);

    app.run(
    ['$rootScope', '$window',
        function($rootScope, $window){
            $rootScope.$on('$routeChangeStart', function(e, route){
                $rootScope.loadMessage = '载入页面...';
                $rootScope.loading = true;
                $rootScope.title = route.$$route.title;
                $window.document.title = 'colorBox-' + route.$$route.title;
            });
            $rootScope.$on('$routeChangeSuccess', function(){
                $rootScope.loading = false;
                $rootScope.loadMessage = '';
            });
            $rootScope.$on('$routeChangeError', function(){
                $rootScope.loadMessage = '加载失败, 请刷新页面';
                $rootScope.loading = false;
            });

            $rootScope.reload = location.reload;
            $rootScope.setLoad = function(o){
                angular.isDefined(o.loading) && ($rootScope.loading = o.loading);
                angular.isDefined($rootScope.loadMessage) && ($rootScope.loadMessage = o.loadMessage);
            };
            $rootScope.removeLoad = function(){
                $rootScope.loading = '';
                $rootScope.loadMessage = '';
            };
        }
    ]);

    return app;
});