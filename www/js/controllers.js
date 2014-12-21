'use strict';
angular.module('Defu.controllers', [])

.controller('IntroCtrl', function ($scope, $state, $ionicSlideBoxDelegate) {

    // Called to navigate to the main app
    $scope.startApp = function () {
        $state.go('main');
    };
    $scope.next = function () {
        $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function () {
        $ionicSlideBoxDelegate.previous();
    };
    // Called each time the slide changes
    $scope.slideChanged = function (index) {
        $scope.slideIndex = index;
    };
})

.controller('MainCtrl', function ($scope, $state, $interval, $ionicModal) {
    $scope.regionsRemainsToGameOver = 4;
    $scope.showInvaderInterval = 1000;
    $scope.showDefenderInterval = 3000;
    $scope.showInvader = $interval(function () {
        var ind = $scope.findFreeRegion();
        $scope.ukraine[ind].invaderVisible = true;
    }, $scope.showInvaderInterval);
    $scope.showDefender = $interval(function () {
        var ind = $scope.findFreeRegion();
        $scope.ukraine[ind].defenderVisible = true;
    }, $scope.showDefenderInterval);
    $scope.gameOver = function () {
        $scope.openModal();
        if (angular.isDefined($scope.showInvader)) {
            $interval.cancel($scope.showInvader);
            $scope.showInvader = undefined;
            $interval.cancel($scope.showDefender);
            $scope.showDefender = undefined;
        }
    };
    $scope.findFreeRegion = function () {
        var free_regions = [];
        angular.forEach($scope.ukraine, function (value, key) {
            if (value.invaderVisible === false && value.captured === false && value.defenderVisible == false) {
                free_regions.push(key);
            }
        });
        if (free_regions.length < $scope.regionsRemainsToGameOver) {
            $scope.gameOver();
        } else {
            var random = new Random();
            var ind = random.integer(0, free_regions.length - 1);
            if ($scope.ukraine[free_regions[ind]].invaderVisible === false)
                return free_regions[ind];
        }
    };
    $scope.startApp = function () {
        $state.go('main');
        $scope.closeModal();
    };
    $scope.toIntro = function () {
        $state.go('intro');
    }
    /////game over modal part
    $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function () {
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});