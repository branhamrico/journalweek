let journal = angular.module('journalApp', ['ui.router', 'controllersModule', 'directivesModule', 'otherServices']);

journal.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) => {
  $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: '../src/login.html',
        controller: 'Login'
      })
      .state('app', {
        url: '/app',
        templateUrl: '../src/dashboard.html'
      })
      .state('app.home', {
        url: '/home',
        templateUrl: '../src/welcome/index.html',
        controller: 'Dashboard'
      })
      .state('app.public-notes', {
        url: '/public',
        templateUrl: '../src/public/index.html'
      })
      .state('app.private-notes', {
        url: '/private',
        templateUrl: '../src/private/index.html'
      })
      .state('app.settings', {
        url: '/settings',
        template: '<h3>Settings</h3>'
      })
      .state('app.notifications', {
        url: '/notifications',
        template: '<h3>Notifications</h3>'
      })
      .state('app.new', {
        url: '/new',
        templateUrl: '../src/new/index.html',
        controller: 'NewJournal'
      })
      .state('app.edit', {
        url: '/edit/:id',
        templateUrl: '../src/new/index.html',
        controller: 'EditJournal'
      })
      .state('app.preview', {
        url: '/view/:id',
        templateUrl: '../src/preview/index.html',
        resolve: {
            PreviousState: [
                "$state",
                function ($state) {
                    var currentStateData = {
                        Name: $state.current.name,
                        Params: $state.params,
                        URL: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }
            ]
        },
        controller: 'ViewJournal'
      })
      .state('logout', {
        url: '/logout',
        controller: function($state, User){
          if (localStorage.getItem('$LoopBack$accessTokenId')) {
            User.logout().$promise.then((res) => {
              console.log(res);
              $state.go('login');
            });
          }
        }
      });

      $urlRouterProvider.otherwise('login');
      $locationProvider.hashPrefix('');
}])
.run(($rootScope, LoopBackAuth, $state) => {
  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    //console.log(toState, fromState);
    if ( !LoopBackAuth.accessTokenId && (toState.name.indexOf('app') > -1 || toState.name === 'logout') ) {
      //console.log('Preventing Access to Dashboard');
      event.preventDefault();
    }
    if ( toState.name === 'login' && LoopBackAuth.accessTokenId ) {
      //console.log('User logged in');
      event.preventDefault();
      $state.go('app.home');
    }
    
  });
  $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    $('li.active').removeClass('active');
    let journals = $('.journals');
    if (journals.length) {
      setTimeout(() => {
        let j = $(journals).masonry({
          itemSelector: '.journal'
        });
      }, 1000);
    }

    let nav = $(`li#${toState.name.split('.')[1]}`);
    if (!nav.hasClass('active')) {
      nav.addClass('active');
    }
  });
});