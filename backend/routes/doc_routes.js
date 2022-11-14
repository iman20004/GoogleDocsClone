const express = require('express')
const router = express.Router()
const auth = require('./auth.js');
const Docs = require('../models/doc_model');
//const Users = require('../models/user_model');
const Y = require('yjs')

//const { LeveldbPersistence } = require('y-leveldb');

//const persistence = new LeveldbPersistence('./storage-location')
let clients = {};
let clientIds = {};
let savedDocs = {};
let recentDocs = [];


router.get("/api/connect/:id", async (req, res) => {
  console.log('In connect route')
  if (!req.session.name) return res.json({ error: true, message: 'Alex is asian' });

  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);
  //console.log(req.params);
  //console.log("\n\n\n\n");

  console.log(req.params.id);
  const doc = await Docs.findById(req.params.id);
  //console.log(doc.update);
  var update = Uint8Array.from(doc.update);

  //const savedDoc = await persistence.getYDoc(req.params.id);
  const savedDoc = new Y.Doc();
  if (doc.update.length) {
    Y.applyUpdate(savedDoc, update);
  }

  const newClient = {
    id: savedDoc.clientID,
    name: req.session.name,
    presence: null,
    res
  };
  clientIds[req.session.name] = savedDoc.clientID; 

  if (clients[req.params.id] === undefined) {
    clients[req.params.id] = [newClient];
    savedDocs[req.params.id] = savedDoc;

    savedDoc.on('update', (update) => {
      const docClients = clients[req.params.id];
      let array = Array.from(update);
      docClients.forEach(client => {
        console.log(client.id);
        //if(client.id !== savedDoc.clientID){
          client.res.write(`event: update\ndata: ${JSON.stringify(array)}\n\n`);
        //}
      });
    });

  } else {
    update = Y.encodeStateAsUpdate(savedDocs[req.params.id]);
    clients[req.params.id].push(newClient);
  }

  //const docData = Y.encodeStateAsUpdate(savedDoc);
  //const user = await Users.findOne({ email: req.cookies.email });
  const docData = { id: doc._id, name: doc.name };
  recentDocs = recentDocs.filter((docStuff => (docStuff.id !== docData.id && docStuff.name !== docData.name)));
  recentDocs = [docData, ...recentDocs];
  console.log(recentDocs);

  //var newarr = user.docs;
  //await user.save();
  //res.cookie("session_id", savedDoc.clientID, { maxAge: 6.048e+8 });

  //console.log(update);
  let array = Array.from(update);
  //console.log(JSON.stringify(update));
  res.write(`event: sync\ndata: ${JSON.stringify(array)}\n\n`);
  //console.log(`id: ${req.params.id}, clients: ${clients[req.params.id]}`)
  clients[req.params.id].forEach((client) => {
    if (client.presence) {
      console.log(client.name);
      res.write(`event: presence\ndata: ${JSON.stringify(client.presence)}\n\n`);
    }
  });

  res.on('close', async () => {
    res.end();
    clientIds[req.session.name] = undefined; 
    if (clients[req.params.id]) {
      clients[req.params.id] = clients[req.params.id].filter(client => client.id !== savedDoc.clientID);
      if (!clients[req.params.id].length) {
        //clients[req.params.id] = undefined; 
        //save to database
        doc.update = Array.from(Y.encodeStateAsUpdate(savedDocs[req.params.id]));
        doc.save();

        //savedDocs[req.params.id] = undefined; 
      } else {
        console.log(`${savedDoc.clientID} Connection closed`);
        clients[req.params.id].forEach((client) => {
          console.log(`Alerting: ${client.name}`)
          let cursor_data = {
            session_id: savedDoc.clientID, name: req.session.name,
            cursor: {}
          };
          client.res.write(`event: presence\ndata: ${JSON.stringify(cursor_data)}\n\n`);
        });
      }
    }
  });

  console.log(`${savedDoc.clientID} Connected`);
});



router.post("/api/op/:id", async (req, res) => {
  if (!req.session.name) return res.json({ error: true, message: 'Alex is asian' });
  // Get array & convert to uint8array
  let arr = req.body.load;
  let uint8array = Uint8Array.from(arr);
  console.log("inside api op / id");
  //console.log(req);
  //console.info(savedDocs);
  // Apply changes (in form of uint8array) to saved backend doc 
  // console.log(savedDocs[req.params.id])
  Y.applyUpdate(savedDocs[req.params.id], uint8array);
  // console.log(req.session.name); 
  // console.log(savedDocs[req.params.id].getText().toString());
  // console.log(savedDocs[req.params.id].getText().toDelta()); 
  // persistence.storeUpdate(req.params.id, uint8array);

  // Send updates to all client (except maybe the one that sent it????)
  // const docClients = clients[req.params.id];
  // let array = Array.from(uint8array);
  // docClients.forEach(client => {
  //   client.res.write(`event: update\ndata: ${JSON.stringify(array)}\n\n`)
  // });

  return res.status(200).send('Success').end();
});

router.post("/api/presence/:id", async (req, res) => {
  if (!req.session.name) return res.json({ error: true, message: 'Alex is asian' });
  //console.log("INSIDE PRESENCE")
  //console.log(req.params.id);
  const { index, length } = req.body;

  let docClients = clients[req.params.id];
  // console.log(docClients);
  // let found = null;
  // docClients.forEach((client) => {
  //   // console.log(client);
  //   // console.log(client.name);
  //   if(client.name === req.cookies.name){
  //     found = client
  //   }
  // });
  //let found = Object.fromEntries(Object.entries(docClients).filter(([k,v]) => v.name === req.cookies.name))
  //console.log(req.cookies.name);
  //console.log(found);
  let cursor_data = {
    session_id: clientIds[req.session.name], name: req.session.name,
    cursor: { index: index, length: length }
  };

  docClients.forEach((client) => {
    if (client.name === req.session.name) client.presence = cursor_data;
    client.res.write(`event: presence\ndata: ${JSON.stringify(cursor_data)}\n\n`);
  });
  return res.status(200).send('Success').end();
});

//################################################## COLLECTION ROUTES ###########################################

router.post('/collection/create', async (req, res) => {
  console.log("In the collection create route");
  if (!req.session.name) return res.json({ error: true, message: 'Alex is asian' });

  const { name } = req.body;
  if (name.length === 0)
    return res.json({ error: true, message: 'Alex is asian' });


  const update = Array.from(Uint8Array.from([0, 0]));
  const newDoc = new Docs({ name, update });
  console.log("inside create");

  // const user = await Users.findOne({email: req.cookies.email});
  // user.docs = [{id: newDoc._id, name: newDoc.name}, ...user.docs];
  // await user.save(); 

  const docData = { id: newDoc._id, name: newDoc.name };
  recentDocs = [docData, ...recentDocs];

  await newDoc.save().then(() => {
    res.json({ id: newDoc._id });
  });
})



router.post('/collection/delete', async (req, res) => {
  if (!req.session.name) return res.json({ error: true, message: 'Alex is asian' });
  const { id } = req.body;

  Docs.findByIdAndDelete(id, [], (err, doc) => {
    if (err || !doc) {
      return console.error(err);
    }
    recentDocs = recentDocs.filter((docStuff => (docStuff.id !== doc._id && docStuff.name !== doc.name)));
    //console.log(doc.name);
    if (savedDocs[doc._id]) { //if doc is being written to, close all connections

      clients[doc._id].forEach(client => client.res.end());
      clients[doc._id] = undefined;
      savedDocs[doc._id] = undefined;
    }
    return res.json()
  });
})



router.get('/collection/list', async (req, res) => {
  if (!req.session.name) return res.json({ error: true, message: 'Alex is asian' });
  console.log('COOKIES INSIDE COLLECTION LIST')
  //console.log(req.cookies)
  console.log("This is recent docs")
  console.log(recentDocs);
  return res.json(recentDocs.slice(0, 10));
});

module.exports = router;