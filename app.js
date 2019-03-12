import {CITY_JSON_SCHEMA, PRODUCT_JSON_SCHEMA} from './schemas/schemas'
import * as Config from './config/app.config.json';
import {productSchema} from './schemas/product-mongoose-schema';
import {citySchema} from './schemas/city-mongoose-schema';
const mongoose = require('mongoose');

const express = require('express');
const bodyParser = require('body-parser');
const AJV = require('ajv');
const cors = require('cors');

const ajv = AJV({allErrors: true, removeAdditional: 'all'});
const app = express();

const port = process.env.PORT || 3000;

// Database connect
const conStr = Config.connections.mongoose;

mongoose.connect(conStr);

// Defy models
const City = mongoose.model('City', citySchema);
const Product = mongoose.model('Product', productSchema);

// DB connection methods
const fetchCities = (id) => {
    return id ? City.findById(id) : City.find();
};

const fetchProducts = (id) => {
    return id ? Product.findById(id) : Product.find();
};

const writeProduct = (body, id) => {
    return id ?
        Product.findOneAndUpdate({_id: id}, addTimeStamp(body), {new: true}) :
        Product.create(addTimeStamp(body));
};

const writeCity = (body, id) => {
    return id ?
        City.findOneAndUpdate({_id: id}, addTimeStamp(body), {new: true}) :
        City.create(addTimeStamp(body));
};

const deleteCity = (id) => {
    return City.deleteOne({_id: id});
};

const deleteProduct = (id) => {
    return Product.deleteOne({_id: id});
};

// Error description constructor

const errorResponse = (schemaErrors) => {
    const errors = schemaErrors.map((error) => {
        return {path: error.dataPath, message: error.message};
    });
    return {status: 'failed', errors: errors};
};

// Middlewares

const addTimeStamp = (body) => {
    return Object.assign({}, body, {lastModifiedDate: new Date()});
};

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

app.use(cors(), urlParser, bodyParser.json());

// Routes

app.get('/api/:method?/:id?', (req, res) => {
    const method = req.data.method;
    const id = req.data.id;
    let data = new Promise((resolve) => {
        resolve(null);
    });
    switch(method) {
        case 'cities':
            data = fetchCities(id);
            break;
        case 'products':
            data = fetchProducts(id);
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

app.delete('/api/:method/:id', (req, res) => {
    const method = req.data.method;
    const id = req.data.id;
    let data = new Promise((resolve) => {
        resolve(null);
    });
    switch(method) {
        case 'cities':
            data = deleteCity(id);
            break;
        case 'products':
            data = deleteProduct(id);
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

app.post('/api/cities/:id?', validateSchema(CITY_JSON_SCHEMA), (req, res) => {
    const id = req.data.id;
    res.setHeader('Content-Type', 'application/json');
    writeCity(req.body, id).then(result => {
        res.send({content: result});
    }, err => {
        res.send({error: err});
    });
});

app.post('/api/products/:id?', validateSchema(PRODUCT_JSON_SCHEMA), (req, res) => {
    const id = req.data.id;
    res.setHeader('Content-Type', 'application/json');
    writeProduct(req.body, id).then(result => {
        res.send({content: result});
    }, err => {
        res.send({error: err});
    });
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
