angular.module('health-tracker', [])
    .directive('healthScoreboard', () => {
      return {
        template: `<div class="scoreboard-stuff">
                     <button ng-click="$ctrl.finishDay()"><img src="sun.svg" /></button>
                     <div class="days">
                        <span ng-repeat="day in $ctrl.days track by $index">Day {{$index}}: {{day}}</span>   
                     </div>
                   </div>
                   <ng-transclude></ng-transclude>`,
        transclude: true,
        controllerAs: '$ctrl',
        controller: class {
          constructor() {
            this.trackers = [];
            this.days = [];
          }

          register(tracker) {
            this.trackers.push(tracker);
          }

          finishDay() {
            const complete = this.trackers.every(tracker => tracker.current >= tracker.goal);
            this.days.push(complete ? String.fromCodePoint(0x1F308) : String.fromCodePoint(0x1F4A9));
            this.trackers.forEach(tracker => {
              tracker.current = 0;
            })
          }
        }

      }
    })

    .directive('tracker', () => {
      return {
        template: `<tracker-meter goal="$ctrl.goal" current="$ctrl.current"></tracker-meter>
                   <button ng-click="$ctrl.current = $ctrl.current + 1"><img ng-src="{{$ctrl.buttonImage}}" /></button>
                   <img ng-if="$ctrl.current >= $ctrl.goal" src="fireworks.gif" />`,
        bindToController: {
          buttonImage: '@',
          goal: '=',
        },
        scope: {},
        restrict: 'E',
        controller: class {
          constructor() {
            this.current = 0;
          }
        },
        controllerAs: '$ctrl',
        require: ['^^healthScoreboard', '^tracker'],
        link: (scope, element, attributes, controllers) => {
          const scoreboardController = controllers[0];
          const self = controllers[1];
          scoreboardController.register(self);
        }

      }
    })

    .directive('trackerMeter', () => {
      return {
        template: `<div class="meter">
  								   <span ng-repeat="item in $ctrl.total track by $index" 
  								   class="item" ng-class="{ 'item-complete': $ctrl.total[$index] }">&nbsp;</span>
								   </div>`,
        bindToController: {
          current: '=',
          goal: '=',
        },
        scope: {},
        restrict: 'E',
        controller: MeterController,
        controllerAs: '$ctrl'
      }
    });

class MeterController {
  constructor($scope) {
    $scope.$watch(() => this.current, () => {
      this.update.apply(this);
    });
  }

  $onInit() {
    this.total = new Array(this.goal);
    this.update();
  }

  update() {
    for (let i = 0; i < this.current && i < this.goal; i++) {
      this.total[i] = true;
    }
    for (let i = this.current; i < this.goal; i++) {
      this.total[i] = false;
    }
  }
}
MeterController.$inject = ['$scope'];