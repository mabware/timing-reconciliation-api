const StateMachine = require('javascript-state-machine');

const DriverState = StateMachine.factory({
  init: 'staged',
  transitions: [
    { name: 'start', from: 'staged', to: 'running' },
    { name: 'finish', from: 'running', to: 'finished' },
    { name: 'confirm', from: 'finished', to: 'confirmed' },
    { name: 'cancelFinish', from: 'finished', to: 'running' },
  ],
  data(id) {
    return {
      id,
      startTime: 0,
      finishTime: 0,
      wrongTest: false,
      penalty: 0,
    };
  },
  methods: {
    onStart(lifecycle, startTime) {
      this.startTime = startTime;
    },
    onFinish(lifecycle, finishTime) {
      this.finishTime = finishTime;
    },
    onCancelFinish() {
      this.finishTime = 0;
    },
    onConfirm(lifecycle, penalty, wrongTest) {
      this.penalty = penalty;
      this.wrongTest = wrongTest;
    },
    describe() {
      return `driver: ${this.id}, totalTime: ${(this.finishTime - this.startTime) / 1000}, penalty: ${this.penalty}`;
    },
  },
});

module.exports = DriverState;
