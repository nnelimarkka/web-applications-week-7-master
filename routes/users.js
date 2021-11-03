

var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const {body, validationResult } = require("express-validator");
const User = require("../models/User");
const Todo = require("../models/Todo");
const jwt = require("jsonwebtoken");
const validateToken = require("../auth/validateToken.js")
const passport = require("passport");
let jwtStrategy = require("passport-jwt").Strategy,
extractJwt = require('passport-jwt').ExtractJwt;
const { parse } = require('dotenv');
const { application } = require('express');

let opts = {}
opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

passport.use(new jwtStrategy(opts, (jwt_payload, done) => {
  User.findOne({email: jwt_payload.email}, function(err, user) {
      if (err) {
          return done(err, false);
      }
      if (user) {
          return done(null, user);
      } else {
          return done(null, false);
      }
  });
}));

router.use(passport.initialize());


/* GET users listing. */
router.get('/list', validateToken, (req, res, next) => {
  User.find({}, (err, users) =>{
    if(err) return next(err);
    res.render("users", {users});
  });
});

router.post("/todos", passport.authenticate('jwt', {session: false}), (req, res) => {
  Todo.findOne({ user: req.user.id }, (err, todo) => {
    if (err)
      throw err;
    if (!todo) {
      Todo.create(
        {
          user: req.user.id,
          items: req.body.items
        },
        (err, ok) => {
          if(err) throw err;
          return res.send("ok");
        });
    } else {
      Todo.updateOne(
        {user: req.user.id},
        {$push: {items: {$each: req.body.items}}},
        (err, ok) => {
          if (err) throw err;
          return res.send("ok");
        });
        
      }
  });
});

router.post("/todos/todo", passport.authenticate('jwt', {session: false}), (req, res) => {
  Todo.findOne({user: req.user.id}, (err, todo) => {
    if (err) throw err;
    if (!todo) return res.status(404).json({message: "no todo"});
    return res.send(todo);
  });
});

router.get("/private", passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({email: req.user.email});
});

router.get('/login', (req, res, next) => {
  res.render('login');
});

router.post('/user/login', 
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({min: 8}),
  (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err)
        throw err;
      if (!user) {
        return res.status(403).json({ message: "Login faile :(" });
      } else {
        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
          if (err)
            throw err;
          if (isMatch) {
            const jwtPayload = {
              id: user._id,
              email: user.email
            };
            jwt.sign(
              jwtPayload,
              process.env.SECRET,
              {
                expiresIn: 120
              },
              (err, token) => {
                res.json({ success: true, token });
              }
            );
          }
        });
      }

    });

  });



router.get('/register', (req, res, next) => {
  res.render('register');
});

router.get("/user/users/:email", (req, res) => {
  User.findOne({email: req.params.email}, (err, user) => {
    if(err) throw err;
    if(!user) return res.status(404).json({user: "Not found"});
    if(user) return res.send(user);
  })
});

router.post('/user/register', 
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({min: 8}), //.isStrongPassword toimii myös
  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty() || !(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*[~`!@#\$%\^&\*\(\)\-_\+=\{\}\[\]\|\\;:"<>,\.\/\?]/.test(req.body.password))) {
      if (errors.isEmpty()) {
        let errorMessage = {"msg": "password didn't meet requirements."};
        return res.status(400).json(errorMessage);
      }
      return res.status(400).json({errors: errors.array()});
    }
    User.findOne({email: req.body.email}, (err, user) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(user){
        return res.status(403).json({email: "Email already in use."});
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) throw err;
            User.create(
              {
                email: req.body.email,
                password: hash
              },
              (err, ok) => {
                if(err) throw err;
                return res.send("ok");
              }
            );
          });
        });
      }
    });
});



module.exports = router;
