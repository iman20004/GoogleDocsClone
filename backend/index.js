const express = require('express')
const cors = require("cors")
const Y = require('yjs')
const { LeveldbPersistence } = require('y-leveldb');

const port = 3001;
const persistence = new LeveldbPersistence('./storage-location')
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(function (req, res, next) {
  res.setHeader('X-CSE356', '6307b8b558d8bb3ef7f6d8ff')
  next();
});

app.get('/', (req, res) => {
  console.log('here?')
  res.send('Hello World!')
})

app.get("/api/connect/:id", async (req, res) => {
  console.log('in connect route')
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  };

  res.writeHead(200, headers);

  const savedDoc = await persistence.getYDoc(req.params.id);
  const docData = savedDoc.getText().toDelta();
  console.log(docData)

  res.write(`event: sync\ndata: ${JSON.stringify(docData)}\n\n`);
  savedDoc.on('update', (update) => {
    res.write(`event: update\ndata: ${update}\n\n`);
  })
})

app.post("/api/op/:id", async (req, res) => {
  const savedDoc = await persistence.getYDoc(req.params.id); 
  // console.log("Backend op route")
  // console.log(req.body);
  const ytext = savedDoc.getText();
  ytext.applyDelta(req.body)
  persistence.storeUpdate(req.params.id, Y.encodeStateAsUpdate(savedDoc));
  console.log("Backend op route")
  console.log(req.body)
  return res.status(200).send('Success I guess').end();
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})