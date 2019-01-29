const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

const port = process.env.PORT || 3000;

const urlParser = (req, res, next) => {
    const parsedUrl = req.url.split('/');
    req.data = {
      method: parsedUrl[2] || null,
      id: parsedUrl[3] || null,
      property: parsedUrl[4] || null
    };
    next();
};

app.use(cookieParser(), urlParser, bodyParser.json());

app.get('/api/:method?/:id?/:propery?', function (req, res) {
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

app.post('/api/products', function (req, res) {
    console.log(req.body);
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
        console.log(content);
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
