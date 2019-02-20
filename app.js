import {LOGIN_JSON_SCHEMA} from './schemas/schemas'
import * as Config from './config/config.json';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const AJV = require('ajv');
const OAuth2Strategy = require('passport-google-oauth20').Strategy;

const ajv = AJV({allErrors: true, removeAdditional: 'all'});
const app = express();

const port = process.env.PORT || 3000;

const USERS = [
    {LOGIN: 'deimos', PASSWORD: 'qwerty', _id: 0},
    {LOGIN: 'user1', PASSWORD: '123', _id: 1},
];

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

const GoogleStrategy = new OAuth2Strategy({
    clientID: Config.auth.google.clientID,
    clientSecret: Config.auth.google.clientSecret,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, cb) => {
    console.log(cb);
    return cb(accessToken);
});


app.use(urlParser, bodyParser.json(), passport.initialize());
passport.use('google', GoogleStrategy);

// Routes

// Auth routes

app.post('/auth', validateSchema(LOGIN_JSON_SCHEMA), passwordChecker, (req, res) => {
    let token = jwt.sign({userId: req.user._id}, 'secret', {expiresIn: 60});
    res.send(token);
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile']
}));

app.get('/auth/google/callback',
    passport.authenticate('google'),
    function(req, res) {
        console.log('do something', req, res);
    });

// Protected routes

app.get('/api/:method?/:id?/:property?', tokenChecker, function (req, res) {
    const method = req.data.method;
    const id = req.data.id;
    const property = req.data.property;
    const db = fs.readFileSync('data/db.json');
    let result = JSON.parse(db.toString())[method];
    if (id) {
        result = result.filter(el => el.id.toString() === id);
        if (property && result.length) {
            result = result[0][property];
        }
    }
    res.setHeader('Content-Type', 'application/json');
    res.send({content: result});
});

app.post('/api/products', tokenChecker, function (req, res) {
    if (req.body.name) {
        const db = fs.readFileSync('data/db.json');
        let content = JSON.parse(db.toString());
        const id = content.products.length;
        const newEntry = {
            id: id,
            name: req.body.name,
            reviews: req.body.reviews || []
        };
        content.products.push(newEntry);
        fs.writeFileSync('data/db.json', JSON.stringify(content));
        res.setHeader('Content-Type', 'application/json');
        res.send({content: newEntry});
    } else {
        res.send('error');
    }
});

app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`);
});
