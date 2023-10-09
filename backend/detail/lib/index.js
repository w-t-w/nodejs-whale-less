const RPC = require('./rpc');

const seq_length = 4,
    package_header_length = 8;

const rpc = (encodeSchema, decodeSchema) => {
    return new RPC({
        isReceiveComplete(buffer) {
            if (buffer.length <= package_header_length)
                return 0;
            const body_length = buffer.readInt32BE(seq_length);
            if (buffer.length >= body_length + package_header_length)
                return body_length + package_header_length;
            else
                return 0;
        },
        encode(data, seq) {
            const body = encodeSchema.encode(data);
            const body_length = body.length;
            const header = Buffer.alloc(package_header_length);
            header.writeInt32BE(seq);
            header.writeInt32BE(body_length, seq_length);
            return Buffer.concat([header, body]);
        },
        decode(buffer) {
            const seq = buffer.readInt32BE();
            const body = buffer.slice(package_header_length);
            const result = decodeSchema.decode(body);
            return {
                result,
                seq
            };
        }
    });
};

module.exports = {
    rpc
};