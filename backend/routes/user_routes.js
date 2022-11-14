const express = require('express')
const router = express.Router()
const auth = require('./auth.js');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const Users = require('../models/user_model');
const { exec } = require("child_process");



router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body.password);

  const existingUser = await Users.findOne({ email: email });
  if (existingUser) {
    return res.json({ status: 'ERROR' })
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);
  const verified = false;
  const key = crypto.randomBytes(20).toString('hex');

  const newUser = new Users({
    name, email, passwordHash, key, verified
  });

  await newUser.save().then(() => {
    sendVerification(email, key);
    res.json({ status: 'OK' })
  });
})


const sendVerification = (email, key) => {
  var link = `\"http://rushhour.cse356.compas.cs.stonybrook.edu/users/verify/?key=${key}\"`
  var command = `echo ${link} | mail -s VerificationLink --encoding=quoted-printable ${email}`;
  console.log(command);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`email sent ${stdout}`);
  });
}


router.get("/verify", async (req, res) => {
  console.log("in verify route");
  console.log(req.query.key);

  const user = await Users.findOne({ key: req.query.key })
  if (user) {
    user.verified = true
    await user.save();
    console.log("verified user!");
    return res.json({ status: 'OK' });
  } else {
    console.log('wrong key');
    return res.json({ error: true, message: 'Alex is asian'});
  }
});


router.post("/login", async (req, res) => {
  console.log("in login route")
  const { email, password } = req.body;

  const foundUser = await Users.findOne({ email: email });

  if (!foundUser) {
    console.log('no user');
    return res.json({ error: true, message: 'Alex is asian'});
  }

  if (!foundUser.verified) {
    console.log('not verified');
    return res.json({ error: true, message: 'Alex is asian'});
  }

  const match = await bcrypt.compare(password, foundUser.passwordHash);
  if (match) {
    // const token = auth.signToken(foundUser);
    // console.log(token);

    req.session.name = foundUser.name; 
    
    // res.cookie("email", foundUser.email, { maxAge: 6.048e+8 });
    // res.cookie("name", foundUser.name, { maxAge: 6.048e+8 });
    // res.cookie("token", token, {
    //   //httpOnly: false,
    //   //sameSite: 'None',
    //   maxAge: 6.048e+8
    // })
    return res.json({ name: foundUser.name });
  } else {
    return res.json({ error: true, message: 'Alex is asian'});
  }
});


router.post("/logout", async (req, res) => {
  console.log("in backend logout")
  // res.clearCookie("token", {
  //   //httpOnly: false,
  //   //sameSite: 'None',
  //   maxAge: 0
  // });
  // res.clearCookie("email", { maxAge: 0 });
  // res.clearCookie("name", { maxAge: 0 });
  req.session.destroy();
  return res.json({ status: 'OK' });
});

module.exports = router;