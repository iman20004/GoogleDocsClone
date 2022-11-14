const express = require('express')
const router = express.Router()
const path = require('path');
const auth = require('./auth.js');

router.get('/', (req, res) => {
    res.send('Hello world')
})

router.get('/library/crdt.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/', 'crdt.js'));
})


router.get('/home', (req, res) => {
  if(!req.session.name) return res.json({ error: true, message: 'Alex is asian'});
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

router.get('/edit/:id', (req, res) => {
  if(!req.session.name) return res.json({ error: true, message: 'Alex is asian'});
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

module.exports = router;