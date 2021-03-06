// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const cookieSession = require('cookie-session');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");
const loginRoutes = require("./routes/login");
const registerRoutes = require("./routes/register");
const logoutRoutes = require("./routes/logout");
const orderRoutes = require("./routes/order");
const twilioRoutes = require("./routes/twilioRoute");
const statusRoutes = require("./routes/status");


// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above
// Login page
app.use("/login", loginRoutes(db));
app.use("/register", registerRoutes(db));
app.use("/logout", logoutRoutes());
app.use("/order", orderRoutes(db));
app.use("/sms", twilioRoutes(db));
app.use("/status", statusRoutes(''));

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  if (req.session.user_id) {
    db.query('SELECT * FROM users WHERE id = $1', [req.session.user_id])
    .then((result) => {
      const templateVars = {user: result.rows[0]};
      res.render("index", templateVars);
    })
    .catch(err => console.log(err.message));
  } else {
    res.render("index", {user: null});
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
