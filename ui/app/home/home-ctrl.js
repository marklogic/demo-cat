(function () {
  'use strict';
  angular.module('demoCat.home', []);
  angular.module('demoCat.home')
    .factory('HomeModel', [function() {
      return {
        user: null,
        vanguard: null,
        donttouch: null,
        spotlight: null
      };
    }])
    .controller('HomeCtrl', ['HomeModel', '$scope', '$modal', '$sce', 'user', 'MLRest', 'demoService', function (model, $scope, $modal, $sce, user, mlRest, demoService) {
      model.user = user;
      angular.extend($scope,{
        model: model,
        editVanguard: editVanguard,
        editDontTouch: editDontTouch,
        editSpotlight: editSpotlight
      });

      var vanguardBaseline = {
          'news':[],
          'services':[]
        };
      mlRest.getDocument('/vanguard.json', { format: 'json' }).then(function(response) {
        model.vanguard = angular.extend(vanguardBaseline,response.data.vanguard);
      }, function() {
        model.vanguard = vanguardBaseline;
      });
      if (!model.donttouch) {
        mlRest.getDocument('/dont-touch.json', { format: 'json' }).then(function(response) {
          var donttouch = response.data['dont-touch'];
          angular.forEach(donttouch, function(event, index) {
            event.start = new Date(event.start);
          });
          model.donttouch = donttouch;
        });
      }
      if (!model.spotlight) {
        mlRest.getDocument('/spotlight.json', { format: 'json' }).then(function(response) {
          model.spotlight = response.data.spotlight;
        });
      }

      function addVanguardNewsLink() {
        model.vanguard.news.push({});
      }

      function removeVanguardNewsLink(index) {
        model.vanguard.news.splice(index, 1);
      }

      function addVanguardServicesLink() {
        model.vanguard.services.push({});
      }

      function removeVanguardServicesLink(index) {
        model.vanguard.services.splice(index, 1);
      }

      function addDontTouchLink() {
        model.donttouch.push({});
      }

      function removeDontTouchLink(index) {
        model.donttouch.splice(index, 1);
      }

      function addSpotlightLink() {
        model.spotlight.push({});
      }

      function removeSpotlightLink(index) {
        model.spotlight.splice(index, 1);
      }

      function editVanguard() {
        showModal('/views/modals/edit-vanguard.html', 'Edit Vanguard', {
          vanguard: model.vanguard,
          addVanguardNewsLink: addVanguardNewsLink,
          removeVanguardNewsLink: removeVanguardNewsLink,
          addVanguardServicesLink: addVanguardServicesLink,
          removeVanguardServicesLink: removeVanguardServicesLink
        }).then(function(){
          mlRest.updateDocument(
            { vanguard: model.vanguard },
            { uri: '/vanguard.json', format: 'json' });
        });
      }

      function editDontTouch() {
        showModal('/views/modals/edit-dont-touch.html', 'Edit Don\'t Touch', {
          donttouch: model.donttouch,
          demos: demoService.suggest(''),
          addDontTouchLink: addDontTouchLink,
          removeDontTouchLink: removeDontTouchLink
        });
      }

      function editSpotlight() {
        showModal('/views/modals/edit-spotlight.html', 'Edit Spotlight', {
          spotlight: model.spotlight,
          demos: demoService.suggest(''),
          addSpotlightLink: addSpotlightLink,
          removeSpotlightLink: removeSpotlightLink
        });
      }

      function showModal(template, title, model, validate) {
        return $modal.open({
          templateUrl: template+'',
          controller: function ($scope, $modalInstance, title, model, validate, user) {
            $scope.title = title;
            $scope.model = model;
            $scope.user = user;
            $scope.alerts = [];
            $scope.ok = function () {
              if (validate) {
                $scope.alerts = validate($scope.model);
              }
              if ($scope.alerts.length === 0) {
                $modalInstance.close($scope.model);
              }
            };
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.encodeURIComponent = encodeURIComponent;
            $scope.trustUrl = $sce.trustAsResourceUrl;
          },
          size: 'lg',
          resolve: {
            title: function () {
              return title;
            },
            model: function () {
              return model;
            },
            validate: function () {
              return validate;
            },
            user: function () {
              return user;
            }
          }
        }).result;
      }
    }]);
}());
