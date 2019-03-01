import {LOGIN_JSON_SCHEMA, PRODUCT_JSON_SCHEMA} from './schemas/schemas'
import * as Config from './config/app.config.json';
const mongoose = require('mongoose');

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const AJV = require('ajv');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const ajv = AJV({allErrors: true, removeAdditional: 'all'});
const app = express();

const port = process.env.PORT || 3000;

// use these users to get auth token with local strategy
const USERS = [
    {LOGIN: 'deimos', PASSWORD: 'qwerty', _id: 0},
    {LOGIN: 'user', PASSWORD: '123', _id: 1},
];

// Database connect
const conStr = CONFIG.connections.mongoose;

mongoose.connect(conStr);

// DB connection methods
const fetchUsers = (id) => {

};

const fetchProducts = (id) => {

};

const writeProduct = (body, id) => {

};

// Error description constructor

const errorResponse = (schemaErrors) => {
    const errors = schemaErrors.map((error) => {
        return {path: error.dataPath, message: error.message};
    });
    return {status: 'failed', errors: errors};
};

// Middlewares

const validateSchema = (schemaName) => {
  return (req, res, next) => {
      const isValid = ajv.validate(schemaName, req.body);
      if (!isValid) {
          res.status(400).json(errorResponse(ajv.errors));
      } else {
          next();
      }
  }
};

const urlParser = (req, res, next) => {
    const parsedUrl = req.url.split('/');
    req.data = {
      method: parsedUrl[2] || null,
      id: parsedUrl[3] || null,
      property: parsedUrl[4] || null
    };
    next();
};

const passwordChecker = (req, res, next) => {
    const userIndex = USERS.findIndex(user => {
        return user.LOGIN === req.body.login;
    });
    const user = USERS[userIndex];
    if (user === undefined || user.PASSWORD !== req.body.password) {
        res.status(400).json({status: 'failed', errors: 'Bad username/password combination'});
        res.send();
    } else {
        req.user = user;
        next();
    }
};

const tokenChecker = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (token) {
      jwt.verify(token, 'secret', (err, decoded) => {
         if (err) {
             res.status(400).json({status: 'failed', errors: 'Failed to authenticate token'});
         } else {
             next();
         }
      });
  } else {
      res.status(400).json({status: 'failed', errors: 'No token provided'});
      res.send();
  }
};

app.use(urlParser, bodyParser.json(), passport.initialize());

passport.use(new GoogleStrategy({
    clientID: Config.auth.google.clientID,
    clientSecret: Config.auth.google.clientSecret,
    callbackURL: '/auth/google/callback'
    },
    function (accessToken, refreshToken, profile, callback) {
        return callback(null, profile, accessToken);
    })
);

passport.use(new LocalStrategy(
    {usernameField: 'login'},
    function(username, password, done) {
        console.log('Local Strategy', username, password);
        const userIndex = USERS.findIndex(user => {
            return user.LOGIN === username;
        });
        const user = USERS[userIndex];
        if (user === undefined || user.PASSWORD !== password) {
            done({status: 'failed', errors: 'Bad username/password combination'});
        } else {
            done(null, user);
        }
    }
));

// Routes

// Auth routes

app.post('/auth', validateSchema(LOGIN_JSON_SCHEMA), passwordChecker, (req, res) => {
    let token = jwt.sign({userId: req.user._id}, 'secret', {expiresIn: 600});
    res.send(token);
});

app.post('/login', validateSchema(LOGIN_JSON_SCHEMA), passport.authenticate('local', {session: false}), (req, res) => {
    let token = jwt.sign({userId: req.user._id}, 'secret', {expiresIn: 600});
    res.send(token);
});

app.get('/auth/google', passport.authenticate('google', {scope: ['profile']}));

app.get('/auth/google/callback',
    passport.authenticate('google', {session: false}),
    (req, res) => {
        console.log('google token:', req.authInfo);
        console.log('user info:', req.user);
        let token = jwt.sign({userId: req.user._id}, 'secret', {expiresIn: 600});
        res.send(token);
        // res.setHeader('x-access-token', token);
        // res.redirect('/api/products');
    });

// Protected routes

app.get('/api/:method?/:id?', tokenChecker, (req, res) => {
    const method = req.data.method;
    const id = req.data.id;
    let data = new Promise((resolve) => {
        resolve(null);
    });
    switch(method) {
        case 'products':
            data = fetchProducts(id);
            break;
        case 'users':
            data = fetchUsers(id);
            break;
        default:
            break;
    }
    res.setHeader('Content-Type', 'application/json');
    data.then(result => {
        res.send({content: result});
    }, err => {
        res.send({error: err});
    });
});

app.post('/api/products/:id?', tokenChecker, validateSchema(PRODUCT_JSON_SCHEMA), (req, res) => {
    const id = req.data.id;
    res.setHeader('Content-Type', 'application/json');
    writeProduct(req.body, id).then(result => {
        console.log(result);
        res.send({content: id ? result[1] : result});
    }, err => {
        res.send({error: err});
    });
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
