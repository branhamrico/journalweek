angular
  .module('directivesModule', [])
  .directive('journalGrid', ['$state', 'Notification', 'Journal', '$sce', '$compile', function($state, Notification, Journal, $sce, $compile) {
    return {
      restrict: 'E',
      scope: {
        visibility: '@',
        onFinished: '&',
        onFailed: '&'
      },
      templateUrl: '../../src/grid/journals.html',
      link: (scope, element, attrs) => {
        scope.journals = [];
        scope.deleteQueue = [];

        let getJournals = () => {
          let filter = { filter: { where: {} } };
          if (scope.visibility == 'public') {
            filter.filter.where.sharedToPublic = true;
          }
          if (scope.visibility == 'private') {
            filter.filter.where.isPrivate = true;
          }

          Journal
            .find(filter)
            .$promise
            .then((results) => {
              let j = [];
              results.forEach(function(journal) {
                journal.body = $sce.trustAsHtml(journal.body);
                j.push(journal);
              });
              scope.journals = j;
            });
        };

        let remove = (j) => {
          Journal
            .deleteById({id: j.id})
            .$promise
            .then((result)=>{
              scope.deleteQueue = scope.deleteQueue.filter((e, i, arr) => {
                return e !== j.id;
              });
              scope.journals = scope.journals.filter((e, i, arr) => {
                return e.id !== j.id;
              });
              Notification.success(`"${j.title}" was Deleted`);
            })
            .catch((e)=>{
              console.error(e);
              Notification.error('Something went wrong in Deletion!');
            });
        };

        scope.openPreview = (j) => {
          $state.go('app.preview', {id: j.id});
        };

        scope.undoDelete = () => {
          scope.deleteQueue.pop();
        };

        scope.delete = (index, j) => {
          if (scope.deleteQueue.indexOf(j.id) === -1) {
            scope.deleteQueue.push(j.id);
          }
          // Give change the user to Undo things
          setTimeout(()=>{
            if (scope.deleteQueue.indexOf(j.id) > -1) {
              remove(j);
            }
          }, 4000);
        };

        scope.isDeletedQueue = (j) => {
          if (!j) return;
          return scope.deleteQueue.indexOf(j.id) > -1;
        };

        getJournals();
      }
    };
  }])
  .directive('gradientBackground', function(Journal, $timeout, $sce) {
    return {
      restrict: 'A',
      link: (scope, element, attrs) => {
        $(element).addClass('gradient-wallpaper');
        var colors = new Array(
                      [62,35,255],
                      [60,255,60],
                      [255,35,98],
                      [45,175,230],
                      [255,0,255],
                      [255,128,0]);

        var step = 0;
        var colorIndices = [0,1,2,3];

        //transition speed
        var gradientSpeed = 0.002;

        let randomRange = (minimum, maximum) => {
          return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        }

        let updateGradient = (e) => {
          if ( $===undefined ) return;
          
          var c0_0 = colors[colorIndices[0]];
          var c0_1 = colors[colorIndices[1]];
          var c1_0 = colors[colorIndices[2]];
          var c1_1 = colors[colorIndices[3]];
        
          var istep = 1 - step;
          var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
          var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
          var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
          var color1 = "rgb("+r1+","+g1+","+b1+")";
        
          var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
          var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
          var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
          var color2 = "rgb("+r2+","+g2+","+b2+")";
        
          $(e).css({
            background: "-webkit-gradient(linear, left top, right top, from("+color1+"), to("+color2+"))"}).css({
            background: "-moz-linear-gradient(left, "+color1+" 0%, "+color2+" 100%)"
          });
          
          
          step += gradientSpeed;
          if ( step >= 1 ){
              step %= 1;
              colorIndices[0] = colorIndices[1];
              colorIndices[2] = colorIndices[3];
        
            //pick two new target color indices
            //do not pick the same as the current one
            colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
            colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
          }
        }

        if (scope.$last) {
          $('.gradient-wallpaper').each((i, v)=>{
            let rand = Math.random();
            step = Math.floor(rand * (100 - 1 + 1)) + 1;
            updateGradient(v);
          });
        }
      }
    };
  });