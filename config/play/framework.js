const path = require('path');
const fs = require('fs');

const PROTO_DIR = path.resolve(process.cwd(), './backend/detail/proto/detail.proto');
const PROTO_FILE = fs.readFileSync(PROTO_DIR, 'utf-8');

const framework_config = {
    detail: {
        protocol: 'rpc',
        ip: '127.0.0.1',
        port: 7777,
        readProtoFile: PROTO_FILE,
        requestSchema: 'DetailRequest',
        responseSchema: 'DetailResponse',
        before(data) {
            return data;
        },
        then(data) {
            return data.detail;
        },
        catch(err) {
        }
    },
    article: {
        protocol: 'http',
        url: '127.0.0.1:4000',
        then: (data) => {
            return JSON.parse(data).data.list;
        }
    }
};

module.exports = framework_config;