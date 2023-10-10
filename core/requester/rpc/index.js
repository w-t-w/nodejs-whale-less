const EasySock = require('easy_sock');
const protobuf = require('protocol-buffers');

let socket = null;

const seq_length = 4,
    package_header_length = 8;

const rpc_config = {
    compile(config) {
        const {ip, port, timeout, readProtoFile, requestSchema, responseSchema} = config;

        const schema = protobuf(readProtoFile);
        const encodeSchema = schema[requestSchema];
        const decodeSchema = schema[responseSchema];

        socket = new EasySock({
            ip,
            port,
            timeout,
            keepAlive: true
        });

        socket.isReceiveComplete = buffer => {
            if (buffer.length <= package_header_length)
                return 0;

            const body_length = buffer.readInt32BE(seq_length);

            if (buffer.length >= package_header_length + body_length)
                return package_header_length + body_length;
            else
                return 0;
        };

        socket.encode = (data, seq) => {
            const body = encodeSchema.encode(data);
            const body_length = body.length;
            const header = Buffer.alloc(package_header_length);
            header.writeInt32BE(seq);
            header.writeInt32BE(body_length, seq_length);
            return Buffer.concat([header, body]);
        };

        socket.decode = buffer => {
            const seq = buffer.readInt32BE();
            const body = buffer.slice(package_header_length);
            const result = decodeSchema.decode(body);
            return {
                seq,
                result
            };
        };
    },
    request(data) {
        return new Promise((resolve, reject) => {
            socket.write(data, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
};

module.exports = rpc_config;