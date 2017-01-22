class MeterController {
  $onInit() {
    this.total = new Array(this.goal);
    this.update();
  }

  $onChanges() {
    if (this.total) {
      this.update.apply(this);
    }
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

angular.module('health-tracker', [])
    .component('healthScoreboard',  {
        template: `<div class="scoreboard-stuff">
                     <button ng-click="$ctrl.finishDay()"><img src="sun.svg" /></button>
                     <div class="days">
                        <span ng-repeat="day in $ctrl.days track by $index">Day {{$index}}: {{day}}</span>   
                     </div>
                   </div>
                   <ng-transclude></ng-transclude>`,
        transclude: true,
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
    })

    .component('tracker', {
        template: `<tracker-meter goal="$ctrl.goal" current="$ctrl.current"></tracker-meter>
                   <button ng-click="$ctrl.current = $ctrl.current + 1"><img ng-src="{{$ctrl.buttonImage}}" /></button>
                   <img ng-if="$ctrl.current >= $ctrl.goal" src="fireworks.gif" />`,
        bindings: {
          name: '@',
          buttonImage: '@',
          goal: '<',
        },
        controller: class {
          constructor() {
            this.current = 0;
          }

          $onInit() {
            this.scoreboard.register(this);
            console.log('onInit');
          }

          $postLink() {
            console.log('postlink');
          }
        },
        require: {
          scoreboard: '^^healthScoreboard',
        },
    })

    .component('trackerMeter',{
        template: `<div class="meter">
  								   <span ng-repeat="item in $ctrl.total track by $index" 
  								   class="item" ng-class="{ 'item-complete': $ctrl.total[$index] }">&nbsp;</span>
								   </div>`,
        bindings: {
          current: '<',
          goal: '<',
        },
        controller: MeterController,
    });

