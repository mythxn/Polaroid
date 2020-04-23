// IMPORT PACKAGES
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var sqlite3 = require("sqlite3").verbose();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

// CONNECT TO THE DB
let db = new sqlite3.Database("./polaroids.db", (err) => {
  if (err) {
    console.log("Error when creating the database", err);
  } else {
    console.log("Successful connection to the database 'polaroids.db'");
  }
});

// AUTHENTICATION
var loggedInUsr = "";

app.use(function (req, res, next) {
  res.locals.currentUser = loggedInUsr;
  next();
});

function isLoggedIn(req, res, next) {
  if (loggedInUsr !== "") {
    return next();
  } else {
    res.redirect("/login");
  }
}

app.post("/login", function (req, res) {
  username = req.body.username;
  const sql = 'SELECT * FROM users where username = "' + username + '";';
  db.all(sql, [], (err, userFromDB) => {
    if (userFromDB.length === 0) {
      res.json("Wrong credentials!");
    } else if (userFromDB[0].password === req.body.password) {
      res.json("Credentials match, logging in!");
      loggedInUsr = username;
    } else {
      res.json("Wrong credentials!");
    }
  });
});

app.post("/register", function (req, res) {
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  const comment = [req.body.username, req.body.password];
  db.run(sql, comment, (err) => {
    loggedInUsr = req.body.username;
    res.json("Logging you in!");
  });
});

app.post("/logout", function (req, res) {
  loggedInUsr = "";
  res.json("logged out");
});

// COMMENTS
app.post("/polaroids/:name/comments", isLoggedIn, function (req, res) {
  post_name = req.params.name;
  username = loggedInUsr;
  const sql = "INSERT INTO comment (text, author, post_name) VALUES (?, ?, ?)";
  const comment = [req.body.text, loggedInUsr, post_name];
  db.run(sql, comment, (err) => {
    // if (err) ...
    res.json(comment);
  });
});

// POLAROIDS
app.get("/", function (req, res) {
  // index route for testing purposes
  res.redirect("/polaroids");
});

app.get("/polaroids", function (req, res) {
  var sql = "";
  term = req.query.keyword;
  if (req.query.keyword || req.query.keyword === "") {
    sql =
      'SELECT * FROM posts where name like "%' +
      term +
      '%" OR desc like "%' +
      term +
      '%" OR author like "%' +
      term +
      '%";';
    db.all(sql, [], (err, polaroids) => {
      res.json(polaroids);
    });
  } else {
    sql = "SELECT * FROM posts;";
    db.all(sql, [], (err, polaroids) => {
      res.render("polaroids/index", {
        polaroids: polaroids,
        loggedIn: loggedInUsr,
        comment: "",
      });
    });
  }
});

app.post("/polaroids", isLoggedIn, function (req, res) {
  var author = loggedInUsr;
  const sql =
    "INSERT INTO posts (name, image, desc, author) VALUES (?, ?, ?, ?)";
  const polaroid = [req.body.name, req.body.image, req.body.desc, author];
  db.run(sql, polaroid, (err) => {
    // if (err) ...
    res.json(polaroid);
  });
});

app.get("/polaroids/:name", function (req, res) {
  name = req.params.name;
  const sql = 'SELECT * FROM posts where name = "' + name + '";';
  db.all(sql, [], (err, polaroids) => {
    const sql = 'SELECT * FROM comment where post_name = "' + name + '";';
    db.all(sql, [], (err, comment) => {
      res.render("polaroids/show", {
        polaroids: polaroids[0],
        comment: comment,
        user: polaroids[0].author,
        loggedIn: loggedInUsr,
      });
    });
  });
});

// SERVER
app.listen(8080, "localhost", function () {
  console.log("Polaroid being served at localhost:8080");
});
