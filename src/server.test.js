const request = require('supertest');
const { app } = require('./server.js');

const driver = (id) => (
  {
    id: id,
    startTime: 0,
    finishTime: 0,
    wrongTest: false,
    penalty: 0,
  }
);

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

beforeEach(async () => {
  await request(app).post('/reset');
})

test('starts with no drivers staged', async () => {
  const res = await request(app).get('/currentState');
  expect(res.status).toBe(200)
  expect(res.body).toEqual({finished: [], running: [], staged: []})
})

test('moves driver through states', async () => {
  const res = await request(app).post('/stage').send({id: 123});
  expect(res.status).toBe(204);  
  let getRes = await request(app).get('/currentState');
  expect(getRes.body).toEqual({finished: [], running: [], staged: [123]});
  const resStart = await request(app).post('/start').send({startTime: 100000});
  expect(resStart.status).toBe(204);  
  getRes = await request(app).get('/currentState');
  expect(getRes.body).toEqual({finished: [], running: [123], staged: []});
  const resfinsh = await request(app).post('/finish').send({finishTime: 200000});
  expect(resfinsh.status).toBe(204);  
  getRes = await request(app).get('/currentState');
  expect(getRes.body).toEqual({finished: [123], running: [], staged: []});
})