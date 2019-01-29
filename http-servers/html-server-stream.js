const fs = require('fs');
const http = require('http');

const message = 'Hello, cruel world!';
const readFile = fs.createReadStream('http-servers/index.html');
const Transform = require('stream').Transform;

const interpolateHTML = new Transform({
    transform: (chunk, encoding, done) => {
        const result = chunk.toString().replace('{message}', message);
        done(null, result)
    }
});

http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    readFile.pipe(interpolateHTML).pipe(res);
}).listen(3000);