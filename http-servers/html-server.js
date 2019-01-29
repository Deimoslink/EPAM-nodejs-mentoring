const fs = require('fs');
const http = require('http');

const message = 'Hello, cruel world!';
let HTML = fs.readFileSync('index.html').toString();

const interpolateHTML = (html, message) => {
    return html.replace('{message}', message);
};

http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(interpolateHTML(HTML, message));
}).listen(3000);