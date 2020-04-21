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

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  username = req.body.username;
  const sql = 'SELECT * FROM users where username = "' + username + '";';
  db.all(sql, [], (err, userFromDB) => {
    if (userFromDB.length === 0) {
      res.redirect("/login");
      console.log("Wrong credentials!");
    } else if (userFromDB[0].password === req.body.password) {
      console.log("Credentials match, logging in!");
      loggedInUsr = username;
      res.redirect("/polaroids");
    } else {
      res.redirect("/login");
      console.log("Wrong credentials!");
    }
  });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  const comment = [req.body.username, req.body.password];
  db.run(sql, comment, (err) => {
    loggedInUsr = req.body.username;
    res.redirect("/polaroids");
  });
});

app.get("/logout", function (req, res) {
  loggedInUsr = "";
  res.redirect("/polaroids");
});

// COMMENTS
app.get("/polaroids/:name/comments/new", isLoggedIn, function (req, res) {
  name = req.params.name;
  res.render("comments/new");
});

app.post("/polaroids/:name/comments", isLoggedIn, function (req, res) {
  post_name = req.params.name;
  username = loggedInUsr;
  const sql = "INSERT INTO comment (text, author, post_name) VALUES (?, ?, ?)";
  const comment = [req.body.comment.text, loggedInUsr, post_name];
  db.run(sql, comment, (err) => {
    // if (err) ...
    res.redirect("/polaroids/" + encodeURIComponent(name.trim()));
  });
});

// POLAROIDS
app.get("/", function (req, res) {
  res.redirect("/polaroids");
});

app.get("/polaroids", function (req, res) {
  const sql = "SELECT * FROM posts;";
  db.all(sql, [], (err, polaroids) => {
    res.render("polaroids/index", {
      polaroids: polaroids,
      currentUser: loggedInUsr,
    });
  });
});

app.post("/polaroids", isLoggedIn, function (req, res) {
  var author = loggedInUsr;
  const sql =
    "INSERT INTO posts (name, image, desc, author) VALUES (?, ?, ?, ?)";
  const polaroid = [req.body.name, req.body.image, req.body.desc, author];
  db.run(sql, polaroid, (err) => {
    // if (err) ...
    res.redirect("/polaroids");
  });
});

app.get("/polaroids/new", isLoggedIn, function (req, res) {
  res.render("polaroids/new");
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
      });
    });
  });
});

// SEARCH
app.get("/search", function (req, res) {
  var term = req.query.term;
  const sql =
    'SELECT * FROM posts where name like "%' +
    term +
    '%" OR desc like "%' +
    term +
    '%" OR author like "%' +
    term +
    '%";';
  db.all(sql, [], (err, polaroids) => {
    res.render("polaroids/index", {
      polaroids: polaroids,
      currentUser: loggedInUsr,
    });
  });
});

// SERVER
app.listen(8080, "localhost", function () {
  console.log("Polaroid being served at localhost:8080");
});
