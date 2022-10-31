const express = require('express')
const path = require('path');
const cors = require("cors")
const Y = require('yjs')
const { LeveldbPersistence } = require('y-leveldb');

const port = 80;
const persistence = new LeveldbPersistence('./storage-location')
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static(path.join(__dirname, 'dist')));

app.use(function (req, res, next) {
  res.setHeader('X-CSE356', '6307b8b558d8bb3ef7f6d8ff')
  next();
});

app.get('/', (req, res) => {
  console.log('here?')
  res.send('Hello World!')
})

app.get('/library/crdt.js', (req, res) => {
  //console.log("in library route")
  res.setHeader('X-CSE356', '6307b8b558d8bb3ef7f6d8ff')
  res.sendFile(path.join(__dirname, 'dist/', 'crdt.js'));
})

app.get('/index.html', (req, res) => {
  console.log("in other route")
  res.sendFile(path.join(__dirname, 'dist/', 'index.html'));
})

let clients = {}
let savedDoc = new Y.Doc()

app.get("/api/connect/:id", async (req, res) => {
  console.log('In connect route')
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  };

  res.writeHead(200, headers);
  console.log(req.params.id);
  savedDoc = await persistence.getYDoc(req.params.id);
  
  const newClient = {
    id: savedDoc.clientID,
    res
  };
  if(clients[req.params.id] === undefined){
    clients[req.params.id] = [newClient];
  } else {
    clients[req.params.id].push(newClient);
  }

  const docData = Y.encodeStateAsUpdate(savedDoc);
  //console.log(docData);
  
  let array = Array.from(docData)
  res.write(`event: sync\ndata: ${JSON.stringify(array)}\n\n`);

  savedDoc.on('update', (update) => {
    //console.log("DETECTED UPDATE")
    const docClients = clients[req.params.id];
    let array = Array.from(update);
    docClients.forEach(client => {
      client.res.write(`event: update\ndata: ${JSON.stringify(array)}\n\n`)
    }); 
  }); 
  

  
  req.on('close', () => {
     //console.log(`${savedDoc.clientID} Connection closed`);
     clients[req.params.id] = clients[req.params.id].filter(client => client.id !== savedDoc.clientID);
  });
})



app.post("/api/op/:id", async (req, res) => {
  //console.log('In op route')
  //console.log(req.params.id)
  //console.log(req.body.load);
  // Get array & conver to uint8array
  // let arr = req.body.update; 
  // let uint8array = Uint8Array.from(arr);
  // let id = req.body.id;
  let arr = req.body.load; //<--
  let uint8array = Uint8Array.from(arr);
  //let uint8array = new TextEncoder().encode(str);
  //const savedDoc = await persistence.getYDoc(req.params.id);
  
  // Apply changes (in form of uint8array) to saved backend doc
  persistence.storeUpdate(req.params.id, uint8array);
  //const savedDoc = await persistence.getYDoc(req.params.id);
  //let newuint8array = Y.encodeStateAsUpdate(savedDoc);
  Y.applyUpdate(savedDoc, uint8array);
  // Send updates to all client (except maybe the one that sent it????)
  const docClients = clients[req.params.id];
  let array = Array.from(uint8array);
  docClients.forEach(client => {

    //console.log(array)
    client.res.write(`event: update\ndata: ${JSON.stringify(array)}\n\n`)
  });
  
  return res.status(200).send('Success').end();
})


app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})