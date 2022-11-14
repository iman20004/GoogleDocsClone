const express = require('express')
const cors = require('cors')
const routes = require("./routes/routes.js")
const doc_routes = require("./routes/doc_routes.js")
const media_routes = require("./routes/media_routes.js")
const user_routes = require("./routes/user_routes.js")
const path = require('path')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const sessions = require('express-session');
const db = require("./db_init");
const port = 80;

dotenv.config()
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(sessions({
    secret: ":r(4[CaQ3`N<#8EV~7<K75Rd/ZpfzBkv`m-x]+QnjQcXazr%w",
    saveUninitialized:true,
    cookie: { maxAge: 6.048e+8 },
    resave: false
}));


//app.use(cors({credentials: true, origin: 'http://rushhour.cse356.compas.cs.stonybrook.edu'}));
//app.use(cors({credentials: true, origin: 'http://194.113.73.211'}));


//app.use(express.static(path.join(__dirname, 'dist')))
app.use((req, res, next) => {
  res.setHeader('X-CSE356', '6307b8b558d8bb3ef7f6d8ff')
  next();
});
 
app.use('/', routes);
app.use('/', doc_routes);
app.use('/users', user_routes);
app.use('/media', media_routes);


app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res, next) => {
   res.sendFile(path.join(__dirname, "build", "index.html"));
});




db.on('error', console.error.bind(console, 'MongoDB connection error'));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})