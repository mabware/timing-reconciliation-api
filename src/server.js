const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const swaggerDocument = require('./swagger.json')
const driverState = require('./driverState');

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let drivers = [];

app.get('/currentState', (req, res) => {
  const currentState = {
    staged: [drivers.filter(driver => driver.is('staged')).map(driver => driver.id)],
    running: [drivers.filter(driver => driver.is('running')).map(driver => driver.id)],
    finished: [drivers.filter(driver => driver.is('stagfinisheded')).map(driver => driver.id)],
  }
  res.json(currentState);
});

app.post('/stage', (req, res) => {
  drivers.push(new driverState(req.body.id));
  console.log(drivers);
  res.sendStatus(204);
});

app.post('/start', (req, res) => {
  drivers.find(driver => driver.is('staged')).start(req.body.startTime);
  res.sendStatus(204);
});

app.post('/finish', (req, res) => {
  drivers.find(driver => driver.is('running')).finish(req.body.finishTime);
  res.sendStatus(204);
});

app.post('/confirm', (req, res) => {
  const index = drivers.findIndex(driver => driver.id === req.body.id)
  const completedDriver = drivers.splice(index, 1);
  completedDriver[0].confirm(req.body.penalty || 0, req.body.wrongTest || false);
  res.json({
    totalTime: completedDriver[0].wrongTest ? null : (completedDriver[0].finishTime - completedDriver[0].startTime)/1000,
    penalty: completedDriver[0].penalty
  });
});

app.post('/reset', (req, res) => {
  drivers = []
  res.sendStatus(204)
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`server is listening on ${port}`);
});

module.exports = { app, drivers };