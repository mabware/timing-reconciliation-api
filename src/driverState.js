var StateMachine = require('javascript-state-machine');

var driverState = StateMachine.factory({
  init: 'staged',
  transitions: [
    { name: 'start', from: 'staged', to: 'running' },
    { name: 'finish', from: 'running', to: 'finished' },
    { name: 'confirm', from: 'finished', to: 'confirmed' },
  ],
  data: function(id) {
    return {
      id,
      startTime: 0,
      finishTime: 0,
      wrongTest: false,
      penalty: 0,
    }
  },
  methods: {
    onStart: function(lifecycle, startTime) {
      this.startTime = startTime;
    },
    onFinish: function(lifecycle, finishTime) {
      this.finishTime = finishTime;
    },
    onConfirm: function(lifecycle, penalty, wrongTest) {
      this.penalty = penalty;
      this.wrongTest = wrongTest;
      console.log(this.describe())
    },
    describe: function() {
      return `driver: ${this.id}, totalTime: ${(this.finishTime - this.startTime)/1000}, penalty: ${this.penalty}`;
    }
}
});

module.exports = driverState;