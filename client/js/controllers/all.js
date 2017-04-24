angular
  .module('controllersModule', ['lbServices'])
  .controller('Login', ['$scope', 'Writer', 'LoopBackAuth', '$state', function($scope, Writer, LoopBackAuth, $state){
    $scope.login = (e) => {
      e.preventDefault();
      $scope.error = {};
      Writer
        .login($scope.credentials)
        .$promise
        .then((auth) => {
          console.log('auth', auth);
          LoopBackAuth.accessTokenId = auth.id;
          LoopBackAuth.currentUserId = auth.writerId;
          LoopBackAuth.save();
          $state.go('app.home');
        })
        .catch((e) => {
          console.error(e);
          $scope.error = e;
        });
    };
  }])
  .controller('Dashboard', ['$scope', '$state', 'Journal', function($scope, $state, Journal) {
    $scope.addJournal = () => {
      Journal
        .create($scope.newJournal)
        .$promise
        .then((journal) => {
          $scope.newJournal = '';
          getJournals();
        });
    };

    $scope.removeJournal = (item) => {
      Journal
        .deleteById(item)
        .$promise
        .then(() => {
          getJournals();
        });
    };
  }])
  .controller('NewJournal', ['$scope', '$state', 'Notification', 'Journal', function($scope, $state, Notification, Journal) {
    $scope.onCreate = true;
    let initForm = () => {
      $scope.form = {};
      $scope.form.isPrivate = false;
      $scope.form.sharedToPublic = true;
      $('#journalBody').html('');
    };

    initForm();

    let addJournal = (form) => {
      Journal
        .create(form)
        .$promise
        .then((journal) => {
          Notification.success(`"${journal.title}" was added`);
          initForm();
          setTimeout(()=> $state.go('app.home'), 1500);
        })
        .catch((e) => {
          Notification.error('Semething went wrong!');
        });
    };

    $scope.setSharedToPublic = () => {
      if ($scope.form.sharedToPublic) $scope.form.isPrivate = false;
    };

    $scope.setPrivate = () => {
      if ($scope.form.isPrivate) $scope.form.sharedToPublic = false;
    };

    $scope.create = () => {
      let journal = $scope.form;
      let body = $('#journalBody').val();
      if (body) {
        journal.body = body;
      }
      addJournal(journal);
    };
  }])
  .controller('EditJournal', ['$scope', '$state', 'Notification', 'Journal', '$sce', function($scope, $state, Notification, Journal, $sce) {
    $scope.onUpdate = true;
    if ($state.current.name.indexOf('edit') > -1) {
      $scope.id = $state.params.id;
    }

    Journal
      .findById({id: $scope.id})
      .$promise
      .then((details) => {
        console.log(details);
        $scope.form = details;
        $('#journalBody').val(details.body);
      });

    $scope.update = () => {
      let id = $scope.form.id;
      let body = {
        body: $('#journalBody').val(),
        isPrivate: $scope.form.isPrivate,
        sharedToPublic: $scope.form.sharedToPublic,
        title: $scope.form.title,
        writerId: $scope.form.writerId
      };
      Journal
        .upsertWithWhere({"where": {"id": id}}, body)
        .$promise
        .then((res) => {
          Notification.success(`${body.title} was updated!`);
          setTimeout(()=> $state.go('app.home'), 1500);
        });
      Writer
    };
  }])
  .controller('ViewJournal', ['$scope', '$state', 'Journal', '$sce', 'PreviousState', function($scope, $state, Journal, $sce, PreviousState){
    console.log(PreviousState);
    if ($state.current.name.indexOf('preview') > -1) {
      $scope.id = $state.params.id;
    }
    Journal
      .findById({id: $scope.id})
      .$promise
      .then((details) => {
        $scope.info = details;
        $scope.info.body = $sce.trustAsHtml($scope.info.body);
      });

    $scope.previousState = (e) => {
      e.preventDefault();
      $state.go(PreviousState.Name);
    };
  }]);