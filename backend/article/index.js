const http = require('http');

const article = require('./data');

const PORT = 4000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {'content-type': 'application/json'});
    res.end(JSON.stringify(article));
});

server.listen(PORT, () => {
    console.log(`The article server is running at http://localhost:${PORT}!`);
});