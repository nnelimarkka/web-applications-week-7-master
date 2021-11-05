var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '[insert site name here]' });
});

router.get("/register", (req,res) => {
  res.render('register');
});

router.get('/register.html', (req, res, next) => {
  res.render('register');
});

router.get("/login", (req,res) => {
  res.render('login');
});

router.get('/login.html', (req, res, next) => {
  res.render('login');
});

module.exports = router;
