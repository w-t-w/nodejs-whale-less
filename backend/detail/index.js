const path = require('path');
const fs = require('fs');
const protobuf = require('protocol-buffers');

const {rpc} = require('./lib');
const detail = require('./data');

const PORT = 7777;

const PROTO_DIR = path.resolve(process.cwd(), './backend/detail/proto/detail.proto');

const {DetailRequest, DetailResponse} = protobuf(fs.readFileSync(PROTO_DIR, 'utf-8'));

const tcp_server = rpc(DetailResponse, DetailRequest);

const server = tcp_server.createServer((request, response) => {
    const {body: {column_id}} = request;

    console.log(`column_id: ${column_id}`);

    //...

    response.end({
        detail: detail[0]
    });
});

server.listen(PORT, () => {
    console.log(`The detail server is running at http://localhost:${PORT}!`);
});