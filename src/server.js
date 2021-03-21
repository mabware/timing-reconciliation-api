const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const http = require('http');
const io = require('socket.io');

const swaggerDocument = require('./swagger.json');
const DriverState = require('./driverState');

const app = express();
const port = process.env.PORT || 5001;
const httpServer = http.createServer(app);
const ioSocket = io(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let drivers = [];

app.get('/currentState', (req, res) => {
  const currentState = {
    staged: drivers.filter((driver) => driver.is('staged')).map((driver) => driver.id),
    running: drivers.filter((driver) => driver.is('running')).map((driver) => driver.id),
    finished: drivers.filter((driver) => driver.is('finished')).map((driver) => driver.id),
  };
  res.json(currentState);
});

app.post('/stage', (req, res) => {
  drivers.push(new DriverState(req.body.id));
  ioSocket.emit('stateUpdate');
  res.sendStatus(204);
});

app.get('/stage', (req, res) => {
  res.json(drivers.filter((driver) => driver.is('staged')).map((driver) => driver.id));
});

app.post('/start', (req, res) => {
  drivers.find((driver) => driver.is('staged')).start(req.body.startTime);
  ioSocket.emit('stateUpdate');
  res.sendStatus(204);
});

app.get('/start', (req, res) => {
  res.json(drivers.filter((driver) => driver.is('running')).map((driver) => driver.id));
});

app.post('/finish', (req, res) => {
  drivers.find((driver) => driver.is('running')).finish(req.body.finishTime);
  ioSocket.emit('stateUpdate');
  res.sendStatus(204);
});

app.post('/cancelFinish', (req, res) => {
  console.log('here')
  let finishedTime;
  if(drivers.find((driver) => driver.id === req.body.id)) {
    drivers.filter((driver) => driver.is('finished')).reverse().some((driver) => {
      const lastfinshedTime = finishedTime;
      finishedTime = driver.finishTime;
      driver.cancelFinish();
      if (lastfinshedTime) {
        driver.finish(lastfinshedTime);
      }
      return driver.id === req.body.id;
    });
    ioSocket.emit('stateUpdate');
    res.sendStatus(204);
  }
  res.sendStatus(404);
});

app.get('/finish', (req, res) => {
  res.json(drivers.filter((driver) => driver.is('finished')).map((driver) => driver.id));
});

app.post('/confirm', (req, res) => {
  const index = drivers.findIndex((driver) => driver.id === req.body.id);
  const completedDriver = drivers.splice(index, 1);
  completedDriver[0].confirm(req.body.penalty || 0, req.body.wrongTest || false);
  ioSocket.emit('stateUpdate');
  res.json({
    totalTime:
      completedDriver[0].wrongTest
        ? null : (completedDriver[0].finishTime - completedDriver[0].startTime) / 1000,
    penalty: completedDriver[0].penalty,
  });
});

app.delete('/driver/:id', (req, res) => {
  const index = drivers.findIndex((driver) => driver.id === req.params.id);
  if (index !== -1) {
    drivers.splice(index, 1);
    ioSocket.emit('stateUpdate');
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});

app.get('/driver/:id', (req, res) => {
  const driver = drivers.find((driver) => driver.id === req.params.id);
  if (driver) {
    res.json({
      state: driver.state,
      time: driver.finishTime && driver.startTime ? (driver.finishTime - driver.startTime) / 1000 : null,
    });
  } else {
    res.sendStatus(404);
  }
});

app.post('/reset', (req, res) => {
  drivers = [];
  ioSocket.emit('stateUpdate');
  res.sendStatus(204);
});

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`server is listening on ${port}`);
});

module.exports = { app, drivers };
